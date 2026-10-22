import type { DiagramSnapshot } from '@arch-arena/shared';
import { createStore, del, entries, get, set, type UseStore } from 'idb-keyval';

/**
 * Drafts are always written to IndexedDB first, so work survives reloads, crashes and
 * offline periods. `dirty` marks changes that have not reached the server yet.
 * Drafts are namespaced by owner (user id or "guest") so accounts on a shared device stay separate.
 */
export interface LocalDraft {
  owner: string;
  questionId: string;
  diagram: DiagramSnapshot;
  hash: string;
  /** Server revision this copy is based on (0 = never synced). */
  baseRevision: number;
  dirty: boolean;
  updatedAt: string;
}

export const GUEST = 'guest';

let store: UseStore | null = null;
const memory = new Map<string, unknown>();
let useMemory = typeof indexedDB === 'undefined';

function getStore(): UseStore {
  store ??= createStore('archarena', 'drafts');
  return store;
}

async function safe<T>(op: () => Promise<T>, fallback: () => T): Promise<T> {
  if (useMemory) return fallback();
  try {
    return await op();
  } catch (err) {
    console.warn('[drafts] IndexedDB unavailable, keeping drafts in memory only', err);
    useMemory = true;
    return fallback();
  }
}

export const draftKey = (owner: string, questionId: string) => `${owner}:${questionId}`;

export function getLocalDraft(owner: string, questionId: string): Promise<LocalDraft | undefined> {
  const key = draftKey(owner, questionId);
  return safe(
    () => get<LocalDraft>(key, getStore()),
    () => memory.get(key) as LocalDraft | undefined,
  );
}

export function putLocalDraft(draft: LocalDraft): Promise<void> {
  const key = draftKey(draft.owner, draft.questionId);
  return safe(
    () => set(key, draft, getStore()),
    () => {
      memory.set(key, draft);
    },
  );
}

export function deleteLocalDraft(owner: string, questionId: string): Promise<void> {
  const key = draftKey(owner, questionId);
  return safe(
    () => del(key, getStore()),
    () => {
      memory.delete(key);
    },
  );
}

export async function listLocalDrafts(owner?: string): Promise<LocalDraft[]> {
  const all = await safe(
    async () => (await entries<string, LocalDraft>(getStore())).map(([, v]) => v),
    () => [...memory.values()] as LocalDraft[],
  );
  return all.filter((d) => d && typeof d === 'object' && 'questionId' in d && (!owner || d.owner === owner));
}

/** Keeps a copy of a version the user chose not to keep during conflict resolution. */
export function backupDraft(draft: LocalDraft): Promise<void> {
  const key = `backup:${draft.owner}:${draft.questionId}:${Date.now()}`;
  return safe(
    () => set(key, { ...draft, backup: true }, getStore()),
    () => {
      memory.set(key, draft);
    },
  );
}

/** Removes all drafts for an owner (used on sign-out to keep private work private on shared devices). */
export async function clearOwner(owner: string): Promise<void> {
  const drafts = await listLocalDrafts(owner);
  await Promise.all(drafts.map((d) => deleteLocalDraft(owner, d.questionId)));
}

/** Moves guest drafts into a signed-in user's namespace so they sync to the account. */
export async function adoptGuestDrafts(userId: string): Promise<number> {
  const guest = await listLocalDrafts(GUEST);
  let moved = 0;
  for (const d of guest) {
    const existing = await getLocalDraft(userId, d.questionId);
    if (!existing) {
      await putLocalDraft({ ...d, owner: userId, dirty: true, baseRevision: 0 });
      moved++;
    }
    await deleteLocalDraft(GUEST, d.questionId);
  }
  return moved;
}
