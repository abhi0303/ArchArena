import {
  SCORE_CATEGORIES,
  levelFromXp,
  type DashboardDTO,
  type DiagramSnapshot,
  type Difficulty,
  type EvaluationReport,
} from '@arch-arena/shared';
import type { Db } from '../db';
import { toAttemptSummary, toEarnedAchievement } from './mappers';
import type { QuestionStore } from './questionStore';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

export async function buildDashboard(db: Db, store: QuestionStore, userId: string): Promise<DashboardDTO> {
  const [user, questions, progress, attemptsCount, recent, drafts, achievements, latestEvaluations] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
    store.list(),
    db.userQuestionProgress.findMany({ where: { userId } }),
    db.designAttempt.count({ where: { userId } }),
    db.designAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        questionId: true,
        diagramHash: true,
        createdAt: true,
        evaluation: { select: { score: true, stars: true, rating: true } },
        submission: { select: { id: true } },
      },
    }),
    db.designDraft.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 6 }),
    db.userAchievement.findMany({ where: { userId }, orderBy: { awardedAt: 'desc' } }),
    db.evaluationResult.findMany({
      where: { attempt: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: { report: true, attempt: { select: { questionId: true } } },
    }),
  ]);

  const qById = new Map(questions.map((q) => [q.id, q]));
  const progressById = new Map(progress.map((p) => [p.questionId, p]));
  const completed = progress.filter((p) => p.status === 'completed');

  const byDifficulty = Object.fromEntries(
    DIFFICULTY_ORDER.map((d) => {
      const total = questions.filter((q) => q.difficulty === d).length;
      const done = completed.filter((p) => qById.get(p.questionId)?.difficulty === d);
      return [d, { completed: done.length, total, stars: done.reduce((s, p) => s + p.bestStars, 0) }];
    }),
  ) as DashboardDTO['byDifficulty'];

  const scored = completed.filter((p) => p.bestScore !== null);
  const averageRating = scored.length
    ? Math.round((scored.reduce((s, p) => s + (p.bestScore ?? 0), 0) / scored.length / 20) * 10) / 10
    : null;

  // Weak topics: average category score over the latest evaluation of each question.
  const seenQuestions = new Set<string>();
  const sums = new Map<string, { total: number; n: number }>();
  for (const ev of latestEvaluations) {
    if (seenQuestions.has(ev.attempt.questionId)) continue;
    seenQuestions.add(ev.attempt.questionId);
    const report = ev.report as unknown as EvaluationReport;
    for (const c of report.categories ?? []) {
      if (!c.assessed) continue;
      const cur = sums.get(c.key) ?? { total: 0, n: 0 };
      cur.total += c.score;
      cur.n += 1;
      sums.set(c.key, cur);
    }
  }
  const weakTopics = SCORE_CATEGORIES.map((c) => {
    const s = sums.get(c.key);
    return s ? { key: c.key, label: c.label, averageScore: Math.round(s.total / s.n), samples: s.n } : null;
  })
    .filter((t): t is NonNullable<typeof t> => !!t && t.averageScore < 75)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);

  // Continue: most recent draft for a challenge that is not completed yet.
  const draftToContinue = drafts.find((d) => progressById.get(d.questionId)?.status !== 'completed');
  const continueQ = draftToContinue ? qById.get(draftToContinue.questionId) : undefined;

  // Recommendation: first unfinished challenge in the current difficulty tier.
  let recommended: DashboardDTO['recommended'] = null;
  for (const d of DIFFICULTY_ORDER) {
    const tier = questions.filter((q) => q.difficulty === d);
    const doneInTier = tier.filter((q) => progressById.get(q.id)?.status === 'completed').length;
    const next = tier.find((q) => progressById.get(q.id)?.status !== 'completed' && q.id !== continueQ?.id) ?? tier.find((q) => progressById.get(q.id)?.status !== 'completed');
    if (!next) continue;
    const tierLabel = d[0]!.toUpperCase() + d.slice(1);
    const moveOn = d !== 'hard' && tier.length > 0 && doneInTier / tier.length >= 0.6;
    if (moveOn) {
      const nextTier = DIFFICULTY_ORDER[DIFFICULTY_ORDER.indexOf(d) + 1]!;
      const candidate = questions.find((q) => q.difficulty === nextTier && progressById.get(q.id)?.status !== 'completed');
      if (candidate) {
        recommended = {
          questionId: candidate.id,
          slug: candidate.slug,
          title: candidate.title,
          difficulty: candidate.difficulty,
          reason: `You have completed most ${tierLabel} challenges — time to step up.`,
        };
        break;
      }
    }
    recommended = {
      questionId: next.id,
      slug: next.slug,
      title: next.title,
      difficulty: next.difficulty,
      reason: doneInTier === 0 && d === 'easy' ? 'A great first challenge to learn the playground.' : `Next ${tierLabel} challenge on your path.`,
    };
    break;
  }

  return {
    totals: {
      completed: completed.length,
      totalQuestions: questions.length,
      stars: completed.reduce((s, p) => s + p.bestStars, 0),
      maxStars: questions.length * 5,
      xp: user.xp,
      averageRating,
      attempts: attemptsCount,
    },
    level: levelFromXp(user.xp),
    byDifficulty,
    recentAttempts: recent
      .map((a) => {
        const q = qById.get(a.questionId);
        return q ? { ...toAttemptSummary(a), title: q.title, slug: q.slug, difficulty: q.difficulty } : null;
      })
      .filter((a): a is NonNullable<typeof a> => !!a),
    drafts: drafts
      .map((d) => {
        const q = qById.get(d.questionId);
        if (!q) return null;
        const diagram = d.diagram as unknown as DiagramSnapshot;
        return {
          questionId: d.questionId,
          revision: d.revision,
          updatedAt: d.updatedAt.toISOString(),
          components: diagram.nodes?.filter((n) => n.kind === 'component').length ?? 0,
          title: q.title,
          slug: q.slug,
          difficulty: q.difficulty,
        };
      })
      .filter((d): d is NonNullable<typeof d> => !!d),
    recommended,
    continueWith: continueQ ? { questionId: continueQ.id, slug: continueQ.slug, title: continueQ.title } : null,
    weakTopics,
    achievements: achievements.map(toEarnedAchievement).filter((a): a is NonNullable<typeof a> => !!a),
  };
}
