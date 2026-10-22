import { hashDiagram, saveDraftSchema, type DiagramSnapshot, type DraftSummaryDTO } from '@arch-arena/shared';
import { Router } from 'express';
import { currentUser, requireUser } from '../auth/sessions';
import type { Db } from '../db';
import { conflict, notFound, parseBody, param } from '../http/errors';
import { writeLimiter } from '../http/security';
import { toDraftDTO } from '../services/mappers';
import type { QuestionStore } from '../services/questionStore';

export function draftsRouter(db: Db, store: QuestionStore): Router {
  const router = Router();
  router.use(requireUser);
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    next();
  });

  router.get('/', async (req, res) => {
    const user = currentUser(req);
    const drafts = await db.designDraft.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } });
    const list: DraftSummaryDTO[] = drafts.map((d) => ({
      questionId: d.questionId,
      revision: d.revision,
      updatedAt: d.updatedAt.toISOString(),
      components: ((d.diagram as unknown as DiagramSnapshot).nodes ?? []).filter((n) => n.kind === 'component').length,
    }));
    res.json({ drafts: list });
  });

  router.get('/:questionId', async (req, res) => {
    const user = currentUser(req);
    const draft = await db.designDraft.findUnique({ where: { userId_questionId: { userId: user.id, questionId: param(req, 'questionId') } } });
    // “No draft yet” is a normal state, not an error, so it is not reported as a 404.
    res.json({ draft: draft ? toDraftDTO(draft) : null });
  });

  /**
   * Saves a draft with optimistic concurrency. The client sends the revision its copy was
   * based on; if the server copy moved on (another device/tab), the save is rejected with
   * 409 and the server copy so the client can let the user choose. Nothing is silently lost.
   */
  router.put('/:questionId', writeLimiter, async (req, res) => {
    const user = currentUser(req);
    const questionId = param(req, 'questionId');
    if (!(await store.summaryById(questionId))) throw notFound('Challenge not found.');
    const input = parseBody(saveDraftSchema, req);
    const diagram = input.diagram as DiagramSnapshot;
    const diagramHash = hashDiagram(diagram);
    const clientUpdatedAt = input.clientUpdatedAt ? new Date(input.clientUpdatedAt) : null;
    const key = { userId_questionId: { userId: user.id, questionId } };
    const existing = await db.designDraft.findUnique({ where: key });

    if (!existing) {
      const created = await db.designDraft.create({
        data: { userId: user.id, questionId, diagram: diagram as object, diagramHash, revision: 1, clientUpdatedAt },
      });
      await db.userQuestionProgress.upsert({
        where: key,
        create: { userId: user.id, questionId, status: 'in_progress' },
        update: { lastActivityAt: new Date() },
      });
      res.status(201).json({ draft: toDraftDTO(created) });
      return;
    }

    if (!input.force && existing.revision !== input.baseRevision) {
      if (existing.diagramHash === diagramHash) {
        // Same content: nothing to reconcile.
        res.json({ draft: toDraftDTO(existing) });
        return;
      }
      throw conflict('DRAFT_CONFLICT', 'This draft was changed on another device or tab.', { draft: toDraftDTO(existing) });
    }

    // Compare-and-swap on the revision so two concurrent saves cannot both win.
    const updated = await db.designDraft.updateMany({
      where: { id: existing.id, revision: existing.revision },
      data: { diagram: diagram as object, diagramHash, revision: existing.revision + 1, clientUpdatedAt },
    });
    if (updated.count === 0) {
      const latest = await db.designDraft.findUnique({ where: key });
      throw conflict('DRAFT_CONFLICT', 'This draft was changed on another device or tab.', { draft: latest ? toDraftDTO(latest) : null });
    }
    await db.userQuestionProgress.update({ where: key, data: { lastActivityAt: new Date() } }).catch(() => undefined);
    const fresh = await db.designDraft.findUniqueOrThrow({ where: key });
    res.json({ draft: toDraftDTO(fresh) });
  });

  router.delete('/:questionId', writeLimiter, async (req, res) => {
    const user = currentUser(req);
    await db.designDraft.deleteMany({ where: { userId: user.id, questionId: param(req, 'questionId') } });
    res.status(204).end();
  });

  return router;
}
