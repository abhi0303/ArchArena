import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { app, currentXp, db, evaluate, newUser, referenceDiagram, starterDiagram } from './helpers';

afterAll(async () => {
  await db.$disconnect();
});

const Q = 'e01';

describe('question bank API', () => {
  it('lists all 100 published questions with the required distribution', async () => {
    const res = await request(app).get('/api/questions');
    expect(res.status).toBe(200);
    const list = res.body.questions as { difficulty: string }[];
    expect(list).toHaveLength(100);
    const count = (d: string) => list.filter((q) => q.difficulty === d).length;
    expect([count('easy'), count('medium'), count('hard')]).toEqual([15, 35, 50]);
  });

  it('serves question details without the reference architecture', async () => {
    const res = await request(app).get(`/api/questions/${Q}`);
    expect(res.status).toBe(200);
    expect(res.body.question.id).toBe(Q);
    expect(res.body.question.hints).toHaveLength(4);
    expect(res.body.question).not.toHaveProperty('reference');
    const bySlug = await request(app).get(`/api/questions/${res.body.question.slug}`);
    expect(bySlug.body.question.id).toBe(Q);
  });

  it('keeps the reference locked until the user has evaluated an attempt', async () => {
    const user = await newUser();
    const anon = await request(app).get(`/api/questions/${Q}/reference`);
    expect(anon.status).toBe(401);
    const locked = await user.agent.get(`/api/questions/${Q}/reference`);
    expect(locked.status).toBe(403);
    await evaluate(user, Q, starterDiagram(Q));
    const open = await user.agent.get(`/api/questions/${Q}/reference`);
    expect(open.status).toBe(200);
    expect(open.body.reference.nodes.length).toBeGreaterThan(2);
  });
});

describe('server-side evaluation', () => {
  it('scores a strong design highly and a starter design low', async () => {
    const user = await newUser();
    const good = await evaluate(user, Q, referenceDiagram(Q));
    const weak = await evaluate(user, Q, starterDiagram(Q));
    expect(good.score).toBeGreaterThanOrEqual(90);
    expect(good.stars).toBe(5);
    expect(weak.score).toBeLessThan(30);
  });

  it('ignores any score sent by the client', async () => {
    const user = await newUser();
    const res = await user.agent.post('/api/attempts').send({ questionId: Q, diagram: starterDiagram(Q), score: 100, stars: 5 });
    expect(res.status).toBe(201);
    expect(res.body.attempt.score).toBeLessThan(30);
  });

  it('rejects malformed diagrams', async () => {
    const user = await newUser();
    const res = await user.agent.post('/api/attempts').send({ questionId: Q, diagram: { version: 1, nodes: 'nope' } });
    expect(res.status).toBe(400);
  });

  it('includes the previous attempt for comparison', async () => {
    const user = await newUser();
    await evaluate(user, Q, starterDiagram(Q));
    const second = await user.agent.post('/api/attempts').send({ questionId: Q, diagram: referenceDiagram(Q) });
    expect(second.body.attempt.previous.score).toBeLessThan(second.body.attempt.score);
  });
});

describe('authorization between users', () => {
  it('never exposes or accepts another user’s attempts, submissions or drafts', async () => {
    const alice = await newUser('Alice');
    const bob = await newUser('Bob');
    const attempt = await evaluate(alice, Q, referenceDiagram(Q));
    await alice.agent.put(`/api/drafts/${Q}`).send({ diagram: referenceDiagram(Q), baseRevision: 0 });
    const submission = await alice.agent.post('/api/submissions').send({ attemptId: attempt.id, idempotencyKey: randomUUID() });
    expect(submission.status).toBe(201);

    expect((await bob.agent.get(`/api/attempts/${attempt.id}`)).status).toBe(404);
    expect((await bob.agent.get(`/api/submissions/${submission.body.submission.submissionId}`)).status).toBe(404);
    const bobDraft = await bob.agent.get(`/api/drafts/${Q}`);
    expect(bobDraft.status).toBe(200);
    expect(bobDraft.body.draft).toBeNull();
    const steal = await bob.agent.post('/api/submissions').send({ attemptId: attempt.id, idempotencyKey: randomUUID() });
    expect(steal.status).toBe(404);
    expect(await currentXp(bob)).toBe(0);

    const list = await bob.agent.get('/api/attempts');
    expect(list.body.attempts).toHaveLength(0);
  });
});

describe('drafts with optimistic concurrency', () => {
  it('creates, updates, detects conflicts and resolves them explicitly', async () => {
    const user = await newUser();
    const first = await user.agent.put(`/api/drafts/${Q}`).send({ diagram: starterDiagram(Q), baseRevision: 0 });
    expect(first.status).toBe(201);
    expect(first.body.draft.revision).toBe(1);

    const second = await user.agent.put(`/api/drafts/${Q}`).send({ diagram: referenceDiagram(Q), baseRevision: 1 });
    expect(second.status).toBe(200);
    expect(second.body.draft.revision).toBe(2);

    // Another tab still based on revision 1 tries to save different content.
    const stale = await user.agent.put(`/api/drafts/${Q}`).send({ diagram: starterDiagram(Q), baseRevision: 1 });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('DRAFT_CONFLICT');
    expect(stale.body.error.details.draft.revision).toBe(2);

    // Same content as the server copy: nothing to reconcile.
    const same = await user.agent.put(`/api/drafts/${Q}`).send({ diagram: referenceDiagram(Q), baseRevision: 1 });
    expect(same.status).toBe(200);
    expect(same.body.draft.revision).toBe(2);

    // The user chose to keep the local copy.
    const forced = await user.agent.put(`/api/drafts/${Q}`).send({ diagram: starterDiagram(Q), baseRevision: 1, force: true });
    expect(forced.status).toBe(200);
    expect(forced.body.draft.revision).toBe(3);

    const loaded = await user.agent.get(`/api/drafts/${Q}`);
    expect(loaded.body.draft.revision).toBe(3);
  });

  it('rejects drafts for unknown questions', async () => {
    const user = await newUser();
    const res = await user.agent.put('/api/drafts/zz99').send({ diagram: starterDiagram(Q), baseRevision: 0 });
    expect(res.status).toBe(404);
  });
});

describe('final submission and rewards', () => {
  it('awards XP once per idempotency key and per attempt', async () => {
    const user = await newUser();
    const attempt = await evaluate(user, Q, referenceDiagram(Q));
    const key = randomUUID();

    const first = await user.agent.post('/api/submissions').send({ attemptId: attempt.id, idempotencyKey: key });
    expect(first.status).toBe(201);
    const result = first.body.submission;
    expect(result.completed).toBe(true);
    expect(result.stars).toBe(5);
    expect(result.xpAwarded).toBeGreaterThan(0);
    expect(result.rewards.map((r: { reason: string }) => r.reason)).toEqual(
      expect.arrayContaining(['challenge_completion', 'first_completion_bonus', 'hint_free_bonus']),
    );
    const xpAfterFirst = await currentXp(user);
    expect(xpAfterFirst).toBe(result.xpAwarded);

    const replay = await user.agent.post('/api/submissions').send({ attemptId: attempt.id, idempotencyKey: key });
    expect(replay.status).toBe(200);
    expect(replay.body.submission.replayed).toBe(true);
    expect(replay.body.submission.submissionId).toBe(result.submissionId);

    const otherKey = await user.agent.post('/api/submissions').send({ attemptId: attempt.id, idempotencyKey: randomUUID() });
    expect(otherKey.body.submission.submissionId).toBe(result.submissionId);
    expect(await currentXp(user)).toBe(xpAfterFirst);
  });

  it('handles concurrent duplicate submissions without double rewards', async () => {
    const user = await newUser();
    const attempt = await evaluate(user, Q, referenceDiagram(Q));
    const results = await Promise.all(
      Array.from({ length: 5 }, () => user.agent.post('/api/submissions').send({ attemptId: attempt.id, idempotencyKey: randomUUID() })),
    );
    expect(results.every((r) => r.status === 200 || r.status === 201)).toBe(true);
    const ids = new Set(results.map((r) => r.body.submission.submissionId));
    expect(ids.size).toBe(1);
    expect(results.filter((r) => r.body.submission.replayed === false)).toHaveLength(1);
    const xp = await currentXp(user);
    const txs = await db.userXpTransaction.aggregate({ where: { userId: user.id }, _sum: { amount: true } });
    expect(xp).toBe(txs._sum.amount);
  });

  it('does not reward resubmitting the same quality (no XP farming)', async () => {
    const user = await newUser();
    const a1 = await evaluate(user, Q, referenceDiagram(Q));
    await user.agent.post('/api/submissions').send({ attemptId: a1.id, idempotencyKey: randomUUID() });
    const xp = await currentXp(user);

    const a2 = await evaluate(user, Q, referenceDiagram(Q));
    const again = await user.agent.post('/api/submissions').send({ attemptId: a2.id, idempotencyKey: randomUUID() });
    expect(again.status).toBe(201);
    expect(again.body.submission.xpAwarded).toBe(0);
    expect(await currentXp(user)).toBe(xp);
  });

  it('does not complete a challenge below the completion threshold', async () => {
    const user = await newUser();
    const weak = await evaluate(user, Q, starterDiagram(Q));
    const res = await user.agent.post('/api/submissions').send({ attemptId: weak.id, idempotencyKey: randomUUID() });
    expect(res.status).toBe(201);
    expect(res.body.submission.completed).toBe(false);
    expect(res.body.submission.xpAwarded).toBe(0);
    const progress = await user.agent.get('/api/me/progress');
    expect(progress.body.progress.find((p: { questionId: string }) => p.questionId === Q).status).not.toBe('completed');
  });

  it('withholds the hint-free bonus after hints were revealed', async () => {
    const user = await newUser();
    const hint = await user.agent.post(`/api/questions/${Q}/hints`).send({ level: 1 });
    expect(hint.body.hintsUsed).toBe(1);
    const attempt = await evaluate(user, Q, referenceDiagram(Q));
    const res = await user.agent.post('/api/submissions').send({ attemptId: attempt.id, idempotencyKey: randomUUID() });
    const reasons = res.body.submission.rewards.map((r: { reason: string }) => r.reason);
    expect(reasons).not.toContain('hint_free_bonus');
    expect(reasons).toContain('first_completion_bonus');
  });

  it('reflects real progress on the dashboard', async () => {
    const user = await newUser();
    const empty = await user.agent.get('/api/me/dashboard');
    expect(empty.status).toBe(200);
    expect(empty.body.totals.completed).toBe(0);

    const attempt = await evaluate(user, Q, referenceDiagram(Q));
    await user.agent.post('/api/submissions').send({ attemptId: attempt.id, idempotencyKey: randomUUID() });
    const dash = await user.agent.get('/api/me/dashboard');
    expect(dash.body.totals.completed).toBe(1);
    expect(dash.body.totals.xp).toBe(await currentXp(user));
    expect(dash.body.recentAttempts).toHaveLength(1);
  });
});
