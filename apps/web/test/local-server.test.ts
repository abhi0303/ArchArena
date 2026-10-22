import { referenceToDiagram, starterToDiagram, getQuestionById } from '@arch-arena/shared/questions';
import type { AttemptDTO, DashboardDTO, DraftDTO, QuestionSummaryDTO, SubmissionResultDTO, UserDTO } from '@arch-arena/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api';
import { localApi, resetLocalData } from '@/lib/local/server';

const Q = 'e01';
const good = () => referenceToDiagram(getQuestionById(Q)!.reference);
const weak = () => starterToDiagram(getQuestionById(Q)!.starter);

async function rejects(p: Promise<unknown>): Promise<ApiError> {
  try {
    await p;
  } catch (e) {
    if (e instanceof ApiError) return e;
    throw e;
  }
  throw new Error('expected the call to fail');
}

const evaluate = (diagram = good(), questionId = Q) =>
  localApi<{ attempt: AttemptDTO }>('POST', '/attempts', { questionId, diagram }).then((r) => r.attempt);
const submit = (attemptId: string, idempotencyKey = crypto.randomUUID()) =>
  localApi<{ submission: SubmissionResultDTO }>('POST', '/submissions', { attemptId, idempotencyKey }).then((r) => r.submission);
const me = () => localApi<{ user: UserDTO }>('GET', '/auth/me').then((r) => r.user);

beforeEach(async () => {
  await resetLocalData();
});

describe('static mode: local API', () => {
  it('has a signed-in local profile and the full question bank', async () => {
    const user = await me();
    expect(user.displayName).toBe('You');
    expect(user.xp).toBe(0);
    const { questions } = await localApi<{ questions: QuestionSummaryDTO[] }>('GET', '/questions');
    expect(questions).toHaveLength(100);
    const bySlug = await localApi<{ question: { id: string } }>('GET', '/questions/url-shortener-basic');
    expect(bySlug.question.id).toBe(Q);
    expect((await rejects(localApi('GET', '/questions/nope'))).status).toBe(404);
  });

  it('saves drafts with the same conflict rules as the server', async () => {
    expect((await localApi<{ draft: DraftDTO | null }>('GET', `/drafts/${Q}`)).draft).toBeNull();
    const a = await localApi<{ draft: DraftDTO }>('PUT', `/drafts/${Q}`, { diagram: weak(), baseRevision: 0 });
    expect(a.draft.revision).toBe(1);
    const b = await localApi<{ draft: DraftDTO }>('PUT', `/drafts/${Q}`, { diagram: good(), baseRevision: 1 });
    expect(b.draft.revision).toBe(2);
    const conflict = await rejects(localApi('PUT', `/drafts/${Q}`, { diagram: weak(), baseRevision: 1 }));
    expect(conflict.status).toBe(409);
    expect(conflict.code).toBe('DRAFT_CONFLICT');
    const forced = await localApi<{ draft: DraftDTO }>('PUT', `/drafts/${Q}`, { diagram: weak(), baseRevision: 1, force: true });
    expect(forced.draft.revision).toBe(3);
    const list = await localApi<{ drafts: { questionId: string }[] }>('GET', '/drafts');
    expect(list.drafts.map((d) => d.questionId)).toEqual([Q]);
  });

  it('evaluates with the shared engine and unlocks the reference only after an attempt', async () => {
    expect((await rejects(localApi('GET', `/questions/${Q}/reference`))).status).toBe(403);
    const first = await evaluate(weak());
    const second = await evaluate(good());
    expect(first.score).toBeLessThan(30);
    expect(second.score).toBeGreaterThanOrEqual(90);
    expect(second.previous?.score).toBe(first.score);
    const ref = await localApi<{ diagram: { nodes: unknown[] } }>('GET', `/questions/${Q}/reference`);
    expect(ref.diagram.nodes.length).toBeGreaterThan(2);
    const again = await localApi<{ attempt: AttemptDTO }>('GET', `/attempts/${second.id}`);
    expect(again.attempt.report.score).toBe(second.score);
  });

  it('awards XP once per attempt and key, and never for resubmitting the same quality', async () => {
    const attempt = await evaluate();
    const key = crypto.randomUUID();
    const first = await submit(attempt.id, key);
    expect(first.completed).toBe(true);
    expect(first.xpAwarded).toBeGreaterThan(0);
    expect(first.rewards.map((r) => r.reason)).toEqual(expect.arrayContaining(['challenge_completion', 'first_completion_bonus', 'hint_free_bonus']));
    expect((await me()).xp).toBe(first.xpAwarded);

    const replay = await submit(attempt.id, key);
    expect(replay.replayed).toBe(true);
    expect(replay.submissionId).toBe(first.submissionId);
    const otherKey = await submit(attempt.id);
    expect(otherKey.submissionId).toBe(first.submissionId);

    const again = await submit((await evaluate()).id);
    expect(again.xpAwarded).toBe(0);
    expect((await me()).xp).toBe(first.xpAwarded);
  });

  it('handles parallel duplicate submissions without double rewards', async () => {
    const attempt = await evaluate();
    const results = await Promise.all(Array.from({ length: 5 }, () => submit(attempt.id)));
    expect(new Set(results.map((r) => r.submissionId)).size).toBe(1);
    expect(results.filter((r) => !r.replayed)).toHaveLength(1);
    expect((await me()).xp).toBe(results.find((r) => !r.replayed)!.xpAwarded);
  });

  it('does not complete below the threshold and withholds the hint-free bonus after hints', async () => {
    const low = await submit((await evaluate(weak())).id);
    expect(low.completed).toBe(false);
    expect(low.xpAwarded).toBe(0);

    await localApi('POST', `/questions/${Q}/hints`, { level: 1 });
    const done = await submit((await evaluate()).id);
    expect(done.rewards.map((r) => r.reason)).not.toContain('hint_free_bonus');
  });

  it('builds the dashboard from local data', async () => {
    await submit((await evaluate()).id);
    const dash = await localApi<DashboardDTO>('GET', '/me/dashboard');
    expect(dash.totals.completed).toBe(1);
    expect(dash.totals.xp).toBe((await me()).xp);
    expect(dash.recentAttempts).toHaveLength(1);
    expect(dash.achievements.length).toBeGreaterThan(0);
    const progress = await localApi<{ progress: { questionId: string; status: string }[] }>('GET', '/me/progress');
    expect(progress.progress.find((p) => p.questionId === Q)?.status).toBe('completed');
  });

  it('rejects invalid input like the server and keeps preferences', async () => {
    const bad = await rejects(localApi('POST', '/attempts', { questionId: Q, diagram: { version: 1, nodes: 'x' } }));
    expect(bad.status).toBe(400);
    const { user } = await localApi<{ user: UserDTO }>('PATCH', '/me/preferences', { preferredLanguage: 'hinglish', displayName: 'Asha' });
    expect(user.displayName).toBe('Asha');
    expect((await me()).preferredLanguage).toBe('hinglish');
  });
});
