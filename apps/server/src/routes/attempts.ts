import {
  GAMIFICATION,
  createAttemptSchema,
  evaluateDesign,
  hashDiagram,
  type AttemptDTO,
  type DiagramSnapshot,
  type EvaluationReport,
} from '@arch-arena/shared';
import { Router } from 'express';
import { currentUser, requireUser } from '../auth/sessions';
import type { Db } from '../db';
import { notFound, parseBody, tooManyRequests, param } from '../http/errors';
import { evaluationLimiter } from '../http/security';
import { toAttemptSummary } from '../services/mappers';
import type { QuestionStore } from '../services/questionStore';

const attemptInclude = {
  evaluation: true,
  submission: { select: { id: true } },
} as const;

export function attemptsRouter(db: Db, store: QuestionStore): Router {
  const router = Router();
  router.use(requireUser);
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    next();
  });

  async function buildAttemptDTO(userId: string, attemptId: string): Promise<AttemptDTO> {
    const attempt = await db.designAttempt.findFirst({ where: { id: attemptId, userId }, include: attemptInclude });
    if (!attempt || !attempt.evaluation) throw notFound('Attempt not found.');
    const previous = await db.designAttempt.findFirst({
      where: { userId, questionId: attempt.questionId, createdAt: { lt: attempt.createdAt } },
      orderBy: { createdAt: 'desc' },
      include: attemptInclude,
    });
    const prevReport = previous?.evaluation?.report as unknown as EvaluationReport | undefined;
    return {
      ...toAttemptSummary(attempt),
      diagram: attempt.diagram as unknown as DiagramSnapshot,
      report: attempt.evaluation.report as unknown as EvaluationReport,
      rubricVersion: attempt.rubricVersion,
      previous: previous
        ? {
            ...toAttemptSummary(previous),
            categories: (prevReport?.categories ?? []).map((c) => ({ key: c.key, score: c.score })),
          }
        : null,
    };
  }

  /** Server-side, authoritative evaluation. Stores the attempt and the full report. */
  router.post('/', evaluationLimiter, async (req, res) => {
    const user = currentUser(req);
    const input = parseBody(createAttemptSchema, req);
    const evaluation = await store.evaluationInput(input.questionId);
    if (!evaluation) throw notFound('Challenge not found.');

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await db.designAttempt.count({ where: { userId: user.id, questionId: input.questionId, createdAt: { gte: since } } });
    if (recent >= GAMIFICATION.dailyEvaluationLimit) {
      throw tooManyRequests(`You have reached today's limit of ${GAMIFICATION.dailyEvaluationLimit} evaluations for this challenge. Keep improving your draft and try again tomorrow.`);
    }

    const diagram = input.diagram as DiagramSnapshot;
    const report = evaluateDesign(diagram, evaluation);
    const key = { userId_questionId: { userId: user.id, questionId: input.questionId } };

    const attempt = await db.$transaction(async (tx) => {
      const created = await tx.designAttempt.create({
        data: {
          userId: user.id,
          questionId: input.questionId,
          diagram: diagram as object,
          diagramHash: hashDiagram(diagram),
          rubricVersion: evaluation.rubricVersion,
          evaluation: {
            create: {
              score: report.score,
              rating: report.rating,
              stars: report.stars,
              rubricVersion: report.rubricVersion,
              engineVersion: report.engineVersion,
              report: report as object,
            },
          },
        },
      });
      const progress = await tx.userQuestionProgress.findUnique({ where: key });
      await tx.userQuestionProgress.upsert({
        where: key,
        create: { userId: user.id, questionId: input.questionId, status: 'evaluated', attemptsCount: 1, bestAttemptScore: report.score },
        update: {
          status: progress?.status === 'completed' ? 'completed' : 'evaluated',
          attemptsCount: { increment: 1 },
          bestAttemptScore: Math.max(progress?.bestAttemptScore ?? 0, report.score),
          lastActivityAt: new Date(),
        },
      });
      return created;
    });

    res.status(201).json({ attempt: await buildAttemptDTO(user.id, attempt.id) });
  });

  router.get('/', async (req, res) => {
    const user = currentUser(req);
    const questionId = typeof req.query.questionId === 'string' ? req.query.questionId : undefined;
    const attempts = await db.designAttempt.findMany({
      where: { userId: user.id, ...(questionId ? { questionId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        questionId: true,
        diagramHash: true,
        createdAt: true,
        evaluation: { select: { score: true, stars: true, rating: true } },
        submission: { select: { id: true } },
      },
    });
    res.json({ attempts: attempts.map(toAttemptSummary) });
  });

  router.get('/:id', async (req, res) => {
    const user = currentUser(req);
    if (!/^[0-9a-f-]{36}$/i.test(param(req, 'id'))) throw notFound('Attempt not found.');
    res.json({ attempt: await buildAttemptDTO(user.id, param(req, 'id')) });
  });

  return router;
}
