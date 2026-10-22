import { finalSubmitSchema } from '@arch-arena/shared';
import { Router } from 'express';
import { currentUser, requireUser } from '../auth/sessions';
import type { Db } from '../db';
import { notFound, parseBody, param } from '../http/errors';
import { evaluationLimiter } from '../http/security';
import type { QuestionStore } from '../services/questionStore';
import { finalizeSubmission, getSubmissionResult } from '../services/submissions';

export function submissionsRouter(db: Db, store: QuestionStore): Router {
  const router = Router();
  router.use(requireUser);
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    next();
  });

  router.post('/', evaluationLimiter, async (req, res) => {
    const user = currentUser(req);
    const { attemptId, idempotencyKey } = parseBody(finalSubmitSchema, req);
    const result = await finalizeSubmission(db, store, user.id, attemptId, idempotencyKey);
    res.status(result.replayed ? 200 : 201).json({ submission: result });
  });

  router.get('/:id', async (req, res) => {
    const user = currentUser(req);
    if (!/^[0-9a-f-]{36}$/i.test(param(req, 'id'))) throw notFound('Submission not found.');
    res.json({ submission: await getSubmissionResult(db, param(req, 'id'), user.id) });
  });

  return router;
}
