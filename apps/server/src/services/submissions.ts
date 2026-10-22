import {
  GAMIFICATION,
  challengeXpValue,
  computeSubmissionRewards,
  getAchievement,
  levelFromXp,
  newlyEarnedAchievements,
  ratingForScore,
  type EarnedAchievementDTO,
  type EvaluationReport,
  type RewardLine,
  type SubmissionResultDTO,
} from '@arch-arena/shared';
import { Prisma, type XpReason } from '@prisma/client';
import type { Db } from '../db';
import { conflict, notFound } from '../http/errors';
import type { QuestionStore } from './questionStore';

const REASON_LABELS: Record<XpReason, string> = {
  challenge_completion: 'Challenge completed',
  score_improvement: 'Improved your best solution',
  first_completion_bonus: 'First-time completion',
  hint_free_bonus: 'Solved without hints',
  achievement: 'Achievement unlocked',
};

/** Builds the response for an already-processed submission (idempotent replay). */
async function loadSubmissionResult(db: Db, submissionId: string, userId: string, replayed: boolean): Promise<SubmissionResultDTO> {
  const s = await db.designSubmission.findFirst({
    where: { id: submissionId, userId },
    include: { attempt: { include: { evaluation: true } } },
  });
  if (!s || !s.attempt.evaluation) throw notFound('Submission not found.');
  const [txs, achievements, progress, user, previous] = await Promise.all([
    db.userXpTransaction.findMany({ where: { userId, submissionId: s.id }, orderBy: { createdAt: 'asc' } }),
    db.userAchievement.findMany({ where: { userId, submissionId: s.id } }),
    db.userQuestionProgress.findUnique({ where: { userId_questionId: { userId, questionId: s.questionId } } }),
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
    db.designSubmission.findFirst({
      where: { userId, questionId: s.questionId, createdAt: { lt: s.createdAt } },
      orderBy: { score: 'desc' },
      select: { score: true },
    }),
  ]);
  const rewards: RewardLine[] = txs
    .filter((t) => t.reason !== 'achievement')
    .map((t) => ({ reason: t.reason as RewardLine['reason'], amount: t.amount, label: REASON_LABELS[t.reason] }));
  const earned: EarnedAchievementDTO[] = achievements
    .map((a) => {
      const def = getAchievement(a.achievementKey);
      return def ? { ...def, awardedAt: a.awardedAt.toISOString() } : null;
    })
    .filter((a): a is EarnedAchievementDTO => !!a);
  return {
    submissionId: s.id,
    attemptId: s.attemptId,
    questionId: s.questionId,
    score: s.score,
    stars: s.stars,
    rating: ratingForScore(s.score),
    completed: s.completed,
    xpAwarded: s.xpAwarded,
    rewards,
    achievements: earned,
    bestScore: progress?.bestScore ?? s.score,
    bestStars: progress?.bestStars ?? s.stars,
    previousBestScore: previous?.score ?? null,
    user: { xp: user.xp, level: levelFromXp(user.xp) },
    report: s.attempt.evaluation.report as unknown as EvaluationReport,
    createdAt: s.createdAt.toISOString(),
    replayed,
  };
}

export async function getSubmissionResult(db: Db, submissionId: string, userId: string): Promise<SubmissionResultDTO> {
  return loadSubmissionResult(db, submissionId, userId, false);
}

/**
 * Marks an evaluated attempt as the user's final submission and grants rewards.
 *
 * Safety properties:
 *  - All work happens in one transaction that first locks the user row, so concurrent
 *    submissions for the same user are processed one at a time.
 *  - One submission per attempt (unique attempt_id) and per idempotency key.
 *  - Every XP grant carries a unique dedupe key; achievements are unique per user.
 *  - Scores, stars and XP are computed here from the stored server-side evaluation —
 *    nothing reward-related is accepted from the client.
 */
export async function finalizeSubmission(
  db: Db,
  store: QuestionStore,
  userId: string,
  attemptId: string,
  idempotencyKey: string,
): Promise<SubmissionResultDTO> {
  const prior = await db.designSubmission.findFirst({
    where: { userId, OR: [{ idempotencyKey }, { attemptId }] },
    select: { id: true },
  });
  if (prior) return loadSubmissionResult(db, prior.id, userId, true);

  const attempt = await db.designAttempt.findFirst({ where: { id: attemptId, userId }, include: { evaluation: true } });
  if (!attempt) throw notFound('Attempt not found.');
  if (!attempt.evaluation) throw conflict('NOT_EVALUATED', 'This attempt has not been evaluated yet.');
  const question = await store.summaryById(attempt.questionId);
  if (!question) throw notFound('Question not found.');
  const totals = await store.countsByDifficulty();
  const evaluation = attempt.evaluation;
  const report = evaluation.report as unknown as EvaluationReport;

  let outcome: { id: string; replayed: boolean };
  try {
    outcome = await db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`;

        const again = await tx.designSubmission.findFirst({
          where: { userId, OR: [{ idempotencyKey }, { attemptId }] },
          select: { id: true },
        });
        if (again) return { id: again.id, replayed: true };

        const progress = await tx.userQuestionProgress.upsert({
          where: { userId_questionId: { userId, questionId: attempt.questionId } },
          create: { userId, questionId: attempt.questionId, status: 'evaluated' },
          update: {},
        });

        const score = evaluation.score;
        const stars = evaluation.stars;
        const completed = score >= GAMIFICATION.completionMinScore;
        const rewards = computeSubmissionRewards({
          difficulty: question.difficulty,
          score,
          previouslyAwardedValue: progress.xpValueAwarded,
          previouslyCompleted: progress.status === 'completed',
          hintFreeBonusAwarded: progress.hintFreeBonusAwarded,
          hintsUsed: progress.hintsUsed,
        });

        const submission = await tx.designSubmission.create({
          data: {
            userId,
            questionId: attempt.questionId,
            attemptId,
            idempotencyKey,
            score,
            stars,
            completed,
            xpAwarded: 0,
            rubricVersion: evaluation.rubricVersion,
          },
        });

        const dedupeFor = (reason: RewardLine['reason']) =>
          reason === 'first_completion_bonus'
            ? `first-completion:${userId}:${attempt.questionId}`
            : reason === 'hint_free_bonus'
              ? `hint-free:${userId}:${attempt.questionId}`
              : `${reason}:${submission.id}`;

        let total = 0;
        for (const line of rewards) {
          await tx.userXpTransaction.create({
            data: {
              userId,
              amount: line.amount,
              reason: line.reason,
              questionId: attempt.questionId,
              submissionId: submission.id,
              dedupeKey: dedupeFor(line.reason),
            },
          });
          total += line.amount;
        }

        const previousBest = progress.bestScore;
        const improved = previousBest === null || score > previousBest;
        const now = new Date();
        await tx.userQuestionProgress.update({
          where: { userId_questionId: { userId, questionId: attempt.questionId } },
          data: {
            status: completed || progress.status === 'completed' ? 'completed' : 'evaluated',
            bestScore: improved ? score : previousBest,
            bestStars: Math.max(progress.bestStars, stars),
            bestSubmissionId: improved ? submission.id : progress.bestSubmissionId,
            xpValueAwarded: completed
              ? Math.max(progress.xpValueAwarded, challengeXpValue(question.difficulty, score))
              : progress.xpValueAwarded,
            hintFreeBonusAwarded: progress.hintFreeBonusAwarded || rewards.some((r) => r.reason === 'hint_free_bonus'),
            firstCompletedAt: progress.firstCompletedAt ?? (completed ? now : null),
            lastActivityAt: now,
          },
        });

        // Achievements are evaluated against the stored state after this submission.
        const completedRows = await tx.userQuestionProgress.findMany({
          where: { userId, status: 'completed' },
          select: { question: { select: { difficulty: true } } },
        });
        const completedByDifficulty = { easy: 0, medium: 0, hard: 0 };
        for (const row of completedRows) completedByDifficulty[row.question.difficulty]++;
        const already = new Set((await tx.userAchievement.findMany({ where: { userId }, select: { achievementKey: true } })).map((a) => a.achievementKey));
        const earned = newlyEarnedAchievements(
          {
            completedByDifficulty,
            totalByDifficulty: totals,
            submission: {
              difficulty: question.difficulty,
              score,
              stars,
              connectionsScore: report.categories.find((c) => c.key === 'connections')?.score ?? 0,
              previousBestScore: previousBest,
              completed,
            },
          },
          already,
        );
        for (const a of earned) {
          await tx.userAchievement.create({ data: { userId, achievementKey: a.key, submissionId: submission.id } });
          await tx.userXpTransaction.create({
            data: {
              userId,
              amount: a.xp,
              reason: 'achievement',
              achievementKey: a.key,
              submissionId: submission.id,
              dedupeKey: `achievement:${userId}:${a.key}`,
            },
          });
          total += a.xp;
        }

        await tx.designSubmission.update({ where: { id: submission.id }, data: { xpAwarded: total } });
        const user = await tx.user.update({ where: { id: userId }, data: { xp: { increment: total } }, select: { xp: true } });
        await tx.user.update({ where: { id: userId }, data: { level: levelFromXp(user.xp).level } });
        return { id: submission.id, replayed: false };
      },
      { timeout: 20_000 },
    );
  } catch (err) {
    // A concurrent identical request won the race: return its result instead of failing.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const winner = await db.designSubmission.findFirst({ where: { userId, OR: [{ idempotencyKey }, { attemptId }] }, select: { id: true } });
      if (winner) return loadSubmissionResult(db, winner.id, userId, true);
    }
    throw err;
  }

  return loadSubmissionResult(db, outcome.id, userId, outcome.replayed);
}
