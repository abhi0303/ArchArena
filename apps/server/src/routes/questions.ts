import { hintUsageSchema, type DiagramSnapshot, type ReferenceArchitecture, type ReferenceDTO } from '@arch-arena/shared';
import { Router } from 'express';
import { currentUser, requireUser } from '../auth/sessions';
import type { Db } from '../db';
import { forbidden, notFound, parseBody, param } from '../http/errors';
import { writeLimiter } from '../http/security';
import type { QuestionStore } from '../services/questionStore';

const PUBLIC_CACHE = 'public, max-age=60, stale-while-revalidate=600';

export function questionsRouter(db: Db, store: QuestionStore): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.set('Cache-Control', PUBLIC_CACHE);
    res.json({ questions: await store.list() });
  });

  router.get('/:key', async (req, res) => {
    const detail = await store.detailBySlugOrId(param(req, 'key'));
    if (!detail) throw notFound('Challenge not found.');
    res.set('Cache-Control', PUBLIC_CACHE);
    res.json({ question: detail });
  });

  /** The reference architecture is only revealed after the user has evaluated at least one attempt. */
  router.get('/:key/reference', requireUser, async (req, res) => {
    const user = currentUser(req);
    const detail = await store.detailBySlugOrId(param(req, 'key'));
    if (!detail) throw notFound('Challenge not found.');
    const attempted = await db.designAttempt.count({ where: { userId: user.id, questionId: detail.id } });
    if (!attempted) throw forbidden('Evaluate at least one attempt to unlock the reference architecture.');
    const ref = await db.questionReferenceArchitecture.findUnique({ where: { questionId: detail.id } });
    if (!ref) throw notFound('No reference architecture is available for this challenge.');
    await db.userQuestionProgress.upsert({
      where: { userId_questionId: { userId: user.id, questionId: detail.id } },
      create: { userId: user.id, questionId: detail.id, status: 'evaluated', referenceRevealedAt: new Date() },
      update: { referenceRevealedAt: new Date() },
    });
    const body: ReferenceDTO = {
      questionId: detail.id,
      reference: ref.reference as unknown as ReferenceArchitecture,
      diagram: ref.diagram as unknown as DiagramSnapshot,
    };
    res.set('Cache-Control', 'private, no-store');
    res.json(body);
  });

  /** Records hint usage (analytics + optional hint-free bonus). Anonymous users are accepted but not recorded. */
  router.post('/:key/hints', writeLimiter, async (req, res) => {
    const { level } = parseBody(hintUsageSchema, req);
    const detail = await store.detailBySlugOrId(param(req, 'key'));
    if (!detail) throw notFound('Challenge not found.');
    if (!req.user) {
      res.status(204).end();
      return;
    }
    const userId = req.user.id;
    await db.hintUsage.upsert({
      where: { userId_questionId_level: { userId, questionId: detail.id, level } },
      create: { userId, questionId: detail.id, level },
      update: {},
    });
    const used = await db.hintUsage.count({ where: { userId, questionId: detail.id } });
    await db.userQuestionProgress.upsert({
      where: { userId_questionId: { userId, questionId: detail.id } },
      create: { userId, questionId: detail.id, hintsUsed: used },
      update: { hintsUsed: used, lastActivityAt: new Date() },
    });
    res.json({ hintsUsed: used });
  });

  return router;
}
