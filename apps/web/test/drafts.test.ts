import { hashDiagram, type DiagramSnapshot, type DraftDTO } from '@arch-arena/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GUEST, adoptGuestDrafts, clearOwner, getLocalDraft, listLocalDrafts, putLocalDraft, type LocalDraft } from '@/lib/drafts/localDrafts';
import { pushDraft, syncPendingDrafts } from '@/lib/drafts/sync';

const diagram = (n: number): DiagramSnapshot => ({
  version: 1,
  nodes: Array.from({ length: n }, (_, i) => ({ id: `n${i}`, kind: 'component' as const, componentType: 'app-server', label: `S${i}`, position: { x: i * 10, y: 0 }, props: {} })),
  edges: [],
});

const local = (owner: string, questionId: string, d: DiagramSnapshot, extra: Partial<LocalDraft> = {}): LocalDraft => ({
  owner,
  questionId,
  diagram: d,
  hash: hashDiagram(d),
  baseRevision: 0,
  dirty: true,
  updatedAt: new Date().toISOString(),
  ...extra,
});

function mockFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const fn = vi.fn((url: string, init: RequestInit) => Promise.resolve(handler(url, init)));
  vi.stubGlobal('fetch', fn);
  return fn;
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(async () => {
  vi.unstubAllGlobals();
  for (const d of await listLocalDrafts()) await clearOwner(d.owner);
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

describe('offline draft storage', () => {
  it('persists drafts in IndexedDB and recovers them', async () => {
    await putLocalDraft(local('u1', 'q1', diagram(3)));
    const recovered = await getLocalDraft('u1', 'q1');
    expect(recovered?.diagram.nodes).toHaveLength(3);
    expect(recovered?.dirty).toBe(true);
  });

  it('keeps drafts of different owners separate', async () => {
    await putLocalDraft(local('u1', 'q1', diagram(1)));
    await putLocalDraft(local('u2', 'q1', diagram(2)));
    expect((await getLocalDraft('u1', 'q1'))?.diagram.nodes).toHaveLength(1);
    expect((await getLocalDraft('u2', 'q1'))?.diagram.nodes).toHaveLength(2);
  });

  it('moves guest drafts into an account on sign-in without overwriting existing ones', async () => {
    await putLocalDraft(local(GUEST, 'q1', diagram(2), { dirty: false }));
    await putLocalDraft(local(GUEST, 'q2', diagram(4)));
    await putLocalDraft(local('u1', 'q2', diagram(1)));
    const moved = await adoptGuestDrafts('u1');
    expect(moved).toBe(1);
    const adopted = await getLocalDraft('u1', 'q1');
    expect(adopted?.dirty).toBe(true);
    expect(adopted?.baseRevision).toBe(0);
    expect((await getLocalDraft('u1', 'q2'))?.diagram.nodes).toHaveLength(1);
    expect(await listLocalDrafts(GUEST)).toHaveLength(0);
  });
});

describe('draft synchronisation', () => {
  it('reports offline without calling the server', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const fetch = mockFetch(() => json(200, {}));
    const r = await pushDraft(local('u1', 'q1', diagram(1)));
    expect(r.status).toBe('offline');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('marks a draft clean after a successful push and records the server revision', async () => {
    const d = local('u1', 'q1', diagram(2));
    await putLocalDraft(d);
    mockFetch((_url, init) => {
      const body = JSON.parse(String(init.body)) as { baseRevision: number };
      expect(body.baseRevision).toBe(0);
      return json(200, { draft: { questionId: 'q1', diagram: d.diagram, revision: 1, diagramHash: d.hash, updatedAt: new Date().toISOString() } satisfies DraftDTO });
    });
    const r = await pushDraft(d);
    expect(r.status).toBe('saved');
    const after = await getLocalDraft('u1', 'q1');
    expect(after?.dirty).toBe(false);
    expect(after?.baseRevision).toBe(1);
  });

  it('keeps the draft dirty if it changed while the push was in flight', async () => {
    const d = local('u1', 'q1', diagram(2));
    await putLocalDraft(d);
    mockFetch(async () => {
      await putLocalDraft(local('u1', 'q1', diagram(5)));
      return json(200, { draft: { questionId: 'q1', diagram: d.diagram, revision: 3, diagramHash: d.hash, updatedAt: new Date().toISOString() } });
    });
    await pushDraft(d);
    const after = await getLocalDraft('u1', 'q1');
    expect(after?.dirty).toBe(true);
    expect(after?.baseRevision).toBe(3);
    expect(after?.diagram.nodes).toHaveLength(5);
  });

  it('surfaces conflicts instead of overwriting the server copy', async () => {
    const server: DraftDTO = { questionId: 'q1', diagram: diagram(7), revision: 4, diagramHash: 'x', updatedAt: new Date().toISOString() };
    mockFetch(() => json(409, { error: { code: 'DRAFT_CONFLICT', message: 'changed', details: { draft: server } } }));
    const r = await pushDraft(local('u1', 'q1', diagram(1), { baseRevision: 2 }));
    expect(r.status).toBe('conflict');
    expect(r.status === 'conflict' && r.server?.revision).toBe(4);
  });

  it('pushes every pending draft when the connection returns', async () => {
    await putLocalDraft(local('u1', 'q1', diagram(1)));
    await putLocalDraft(local('u1', 'q2', diagram(2)));
    await putLocalDraft(local('u1', 'q3', diagram(3), { dirty: false }));
    let revision = 0;
    const fetch = mockFetch((url, init) => {
      const body = JSON.parse(String(init.body)) as { diagram: DiagramSnapshot };
      return json(200, { draft: { questionId: url.split('/').pop(), diagram: body.diagram, revision: ++revision, diagramHash: hashDiagram(body.diagram), updatedAt: new Date().toISOString() } });
    });
    const r = await syncPendingDrafts('u1');
    expect(r.synced).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect((await listLocalDrafts('u1')).every((d) => !d.dirty)).toBe(true);
  });
});
