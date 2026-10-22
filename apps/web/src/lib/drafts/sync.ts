import type { DraftDTO } from '@arch-arena/shared';
import { ApiError, NetworkError, api } from '../api';
import { getLocalDraft, listLocalDrafts, putLocalDraft, type LocalDraft } from './localDrafts';

export type PushResult =
  | { status: 'saved'; draft: DraftDTO }
  | { status: 'conflict'; server: DraftDTO | null }
  | { status: 'offline' }
  | { status: 'error'; message: string };

/**
 * Pushes a local draft to the server using optimistic concurrency.
 * On success the local copy is marked clean only if it was not edited while the request was in flight.
 */
export async function pushDraft(draft: LocalDraft, options: { force?: boolean } = {}): Promise<PushResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { status: 'offline' };
  try {
    const { draft: server } = await api<{ draft: DraftDTO }>(`/drafts/${encodeURIComponent(draft.questionId)}`, {
      method: 'PUT',
      body: { diagram: draft.diagram, baseRevision: draft.baseRevision, force: options.force || undefined, clientUpdatedAt: draft.updatedAt },
    });
    const latest = await getLocalDraft(draft.owner, draft.questionId);
    if (latest) {
      const unchanged = latest.hash === draft.hash;
      await putLocalDraft({ ...latest, baseRevision: server.revision, dirty: unchanged ? false : latest.dirty });
    }
    return { status: 'saved', draft: server };
  } catch (err) {
    if (err instanceof NetworkError) return { status: 'offline' };
    if (err instanceof ApiError && err.code === 'DRAFT_CONFLICT') {
      const server = (err.details as { draft?: DraftDTO | null } | undefined)?.draft ?? null;
      return { status: 'conflict', server };
    }
    return { status: 'error', message: err instanceof Error ? err.message : 'Save failed' };
  }
}

/**
 * Pushes every pending draft for a user (on app start and when the connection returns).
 * Conflicts are left dirty and resolved interactively when the user opens that challenge.
 */
export async function syncPendingDrafts(owner: string, skipQuestionId?: string): Promise<{ synced: number; conflicts: number; failed: number }> {
  const pending = (await listLocalDrafts(owner)).filter((d) => d.dirty && d.questionId !== skipQuestionId);
  let synced = 0;
  let conflicts = 0;
  let failed = 0;
  for (const d of pending) {
    const r = await pushDraft(d);
    if (r.status === 'saved') synced++;
    else if (r.status === 'conflict') conflicts++;
    else if (r.status === 'offline') break;
    else failed++;
  }
  return { synced, conflicts, failed };
}

export async function countPendingDrafts(owner: string): Promise<number> {
  return (await listLocalDrafts(owner)).filter((d) => d.dirty).length;
}
