import { hashDiagram, starterToDiagram, type DiagramSnapshot, type DraftDTO, type QuestionDetailDTO, type UserDTO } from '@arch-arena/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, isApiError, isNetworkError } from '@/lib/api';
import { GUEST, backupDraft, getLocalDraft, putLocalDraft, type LocalDraft } from '@/lib/drafts/localDrafts';
import { pushDraft } from '@/lib/drafts/sync';
import { useEditor } from './store';

export type SaveStatus = 'loading' | 'saved' | 'pending' | 'saving' | 'local' | 'offline' | 'error' | 'conflict';

export interface DraftConflict {
  server: DraftDTO;
  local: LocalDraft;
}

const DEBOUNCE_MS = 900;

/**
 * Local-first persistence for the open challenge:
 *  1. every change is written to IndexedDB (debounced, never on each pointer move);
 *  2. signed-in users' drafts are then pushed to the server with optimistic concurrency;
 *  3. offline changes stay pending and are pushed when the connection returns;
 *  4. conflicting edits from another device are surfaced to the user — never silently dropped.
 */
export function useDraftPersistence(question: QuestionDetailDTO | undefined, user: UserDTO | null | undefined, userLoading: boolean) {
  const [status, setStatus] = useState<SaveStatus>('loading');
  const [conflict, setConflict] = useState<DraftConflict | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const owner = user?.id ?? GUEST;
  const questionId = question?.id;
  const lastSerialized = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const conflictRef = useRef<DraftConflict | null>(null);
  conflictRef.current = conflict;

  const doSave = useCallback(
    async (forcePush: boolean) => {
      if (!questionId) return;
      const snapshot = useEditor.getState().snapshot();
      const serialized = JSON.stringify(snapshot);
      const existing = await getLocalDraft(owner, questionId);
      if (!forcePush && serialized === lastSerialized.current && !existing?.dirty) {
        setStatus(user ? 'saved' : 'local');
        return;
      }
      lastSerialized.current = serialized;
      const draft: LocalDraft = {
        owner,
        questionId,
        diagram: snapshot,
        hash: hashDiagram(snapshot),
        baseRevision: existing?.baseRevision ?? 0,
        dirty: true,
        updatedAt: new Date().toISOString(),
      };
      await putLocalDraft(draft);
      if (!user) {
        setStatus('local');
        setLastSavedAt(draft.updatedAt);
        return;
      }
      if (conflictRef.current) {
        setStatus('conflict');
        return;
      }
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }
      setStatus('saving');
      const r = await pushDraft(draft);
      if (r.status === 'saved') {
        setStatus('saved');
        setLastSavedAt(r.draft.updatedAt);
      } else if (r.status === 'conflict' && r.server) {
        setConflict({ server: r.server, local: draft });
        setStatus('conflict');
      } else if (r.status === 'offline') {
        setStatus('offline');
      } else {
        setStatus('error');
      }
    },
    [owner, questionId, user],
  );

  const save = useCallback(
    (forcePush = false) => {
      chain.current = chain.current.then(() => doSave(forcePush)).catch((err) => {
        console.error('[autosave]', err);
        setStatus('error');
      });
      return chain.current;
    },
    [doSave],
  );

  /** Saves immediately (used before evaluation, final submission and when leaving). */
  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    return save();
  }, [save]);

  // Initial load: decide between local, server and starter content.
  useEffect(() => {
    if (!question || userLoading) return;
    let cancelled = false;
    setLoaded(false);
    setStatus('loading');
    setConflict(null);
    (async () => {
      const local = await getLocalDraft(owner, question.id);
      let server: DraftDTO | null = null;
      if (user && navigator.onLine) {
        try {
          server = (await api<{ draft: DraftDTO | null }>(`/drafts/${encodeURIComponent(question.id)}`)).draft;
        } catch (err) {
          if (!isApiError(err, 'NOT_FOUND') && !isNetworkError(err)) console.warn('[drafts] could not load server draft', err);
        }
      }
      if (cancelled) return;

      let diagram: DiagramSnapshot;
      let baseRevision = 0;
      let dirty = false;
      let pendingConflict: DraftConflict | null = null;
      if (local?.dirty) {
        diagram = local.diagram;
        if (!server) {
          baseRevision = local.baseRevision;
          dirty = true;
        } else if (server.diagramHash === local.hash) {
          baseRevision = server.revision;
          dirty = false;
        } else if (server.revision === local.baseRevision) {
          baseRevision = server.revision;
          dirty = true;
        } else {
          baseRevision = local.baseRevision;
          dirty = true;
          pendingConflict = { server, local };
        }
      } else if (server) {
        diagram = server.diagram;
        baseRevision = server.revision;
      } else if (local) {
        diagram = local.diagram;
        baseRevision = local.baseRevision;
      } else {
        diagram = starterToDiagram(question.starter);
      }

      const snapshotForCompare = JSON.stringify(diagram);
      await putLocalDraft({
        owner,
        questionId: question.id,
        diagram,
        hash: hashDiagram(diagram),
        baseRevision,
        dirty,
        updatedAt: local?.updatedAt ?? new Date().toISOString(),
      });
      if (cancelled) return;
      useEditor.getState().load(diagram);
      // The editor normalises the snapshot; compare against what it now holds.
      lastSerialized.current = JSON.stringify(useEditor.getState().snapshot()) || snapshotForCompare;
      setLoaded(true);
      if (pendingConflict) {
        setConflict(pendingConflict);
        setStatus('conflict');
      } else if (dirty && user) {
        void save(true);
      } else {
        setStatus(user ? 'saved' : 'local');
        if (server) setLastSavedAt(server.updatedAt);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, owner, userLoading]);

  // Debounced autosave on every semantic change (drag end, edits, connections…).
  useEffect(() => {
    if (!loaded) return;
    const unsub = useEditor.subscribe((s, prev) => {
      if (s.version === prev.version) return;
      setStatus((st) => (st === 'conflict' ? st : 'pending'));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        void save();
      }, DEBOUNCE_MS);
    });
    return () => {
      unsub();
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
        void save();
      }
    };
  }, [loaded, save]);

  // Push pending changes when the connection returns; save when the tab is hidden.
  useEffect(() => {
    if (!loaded) return;
    const onOnline = () => void save(true);
    const onHide = () => {
      if (document.visibilityState === 'hidden') void flush();
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
    };
  }, [loaded, save, flush]);

  const resolveConflict = useCallback(
    async (choice: 'mine' | 'theirs') => {
      if (!conflict || !questionId) return;
      if (choice === 'mine') {
        await backupDraft({ ...conflict.local, diagram: conflict.server.diagram, hash: conflict.server.diagramHash });
        setConflict(null);
        conflictRef.current = null;
        const snapshot = useEditor.getState().snapshot();
        const draft: LocalDraft = {
          owner,
          questionId,
          diagram: snapshot,
          hash: hashDiagram(snapshot),
          baseRevision: conflict.server.revision,
          dirty: true,
          updatedAt: new Date().toISOString(),
        };
        await putLocalDraft(draft);
        setStatus('saving');
        const r = await pushDraft(draft, { force: true });
        setStatus(r.status === 'saved' ? 'saved' : r.status === 'offline' ? 'offline' : 'error');
      } else {
        await backupDraft(conflict.local);
        setConflict(null);
        conflictRef.current = null;
        useEditor.getState().load(conflict.server.diagram);
        lastSerialized.current = JSON.stringify(useEditor.getState().snapshot());
        await putLocalDraft({
          owner,
          questionId,
          diagram: conflict.server.diagram,
          hash: conflict.server.diagramHash,
          baseRevision: conflict.server.revision,
          dirty: false,
          updatedAt: conflict.server.updatedAt,
        });
        setStatus('saved');
      }
    },
    [conflict, owner, questionId],
  );

  return { status, loaded, conflict, lastSavedAt, flush, save, resolveConflict };
}
