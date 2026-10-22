import { ACHIEVEMENTS, updatePreferencesSchema } from '@arch-arena/shared';
import { Router } from 'express';
import { currentUser, requireUser } from '../auth/sessions';
import type { Db } from '../db';
import { parseBody } from '../http/errors';
import { writeLimiter } from '../http/security';
import { buildDashboard } from '../services/dashboard';
import { toEarnedAchievement, toProgressDTO, toUserDTO } from '../services/mappers';
import type { QuestionStore } from '../services/questionStore';

export function meRouter(db: Db, store: QuestionStore): Router {
  const router = Router();
  router.use(requireUser);

  router.patch('/preferences', writeLimiter, async (req, res) => {
    const user = currentUser(req);
    const input = parseBody(updatePreferencesSchema, req);
    const updated = await db.user.update({
      where: { id: user.id },
      data: { preferredLanguage: input.preferredLanguage, displayName: input.displayName },
      select: { id: true, email: true, displayName: true, preferredLanguage: true, xp: true, level: true, createdAt: true },
    });
    res.json({ user: toUserDTO(updated) });
  });

  router.get('/progress', async (req, res) => {
    const user = currentUser(req);
    const rows = await db.userQuestionProgress.findMany({ where: { userId: user.id } });
    res.set('Cache-Control', 'private, no-store');
    res.json({ progress: rows.map(toProgressDTO) });
  });

  router.get('/dashboard', async (req, res) => {
    const user = currentUser(req);
    res.set('Cache-Control', 'private, no-store');
    res.json(await buildDashboard(db, store, user.id));
  });

  router.get('/achievements', async (req, res) => {
    const user = currentUser(req);
    const rows = await db.userAchievement.findMany({ where: { userId: user.id } });
    res.set('Cache-Control', 'private, no-store');
    res.json({
      all: ACHIEVEMENTS,
      earned: rows.map(toEarnedAchievement).filter((a) => !!a),
    });
  });

  return router;
}
