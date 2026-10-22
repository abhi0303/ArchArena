/**
 * Browser-only implementation of the HLD Arena API, used by the static (GitHub Pages) build.
 *
 * It answers the same paths with the same response shapes as apps/server, using the shared
 * question bank, evaluation engine and reward rules. Data is stored in IndexedDB on this device.
 * Every request runs under one lock, so concurrent calls (and other tabs, where the Web Locks
 * API is available) cannot interleave writes.
 */
import {
  ACHIEVEMENTS,
  GAMIFICATION,
  SCORE_CATEGORIES,
  challengeXpValue,
  computeSubmissionRewards,
  createAttemptSchema,
  evaluateDesign,
  finalSubmitSchema,
  getAchievement,
  hashDiagram,
  hintUsageSchema,
  levelFromXp,
  newlyEarnedAchievements,
  ratingForScore,
  saveDraftSchema,
  updatePreferencesSchema,
  type AttemptDTO,
  type AttemptSummaryDTO,
  type DashboardDTO,
  type DiagramSnapshot,
  type Difficulty,
  type DraftDTO,
  type DraftSummaryDTO,
  type EarnedAchievementDTO,
  type EvaluationInput,
  type EvaluationReport,
  type ExplanationLanguage,
  type ProgressDTO,
  type ProgressStatus,
  type QuestionDetailDTO,
  type QuestionSummaryDTO,
  type ReferenceDTO,
  type RewardLine,
  type SubmissionResultDTO,
  type UserDTO,
} from '@arch-arena/shared';
import { QUESTIONS, referenceToDiagram, toEvaluationInput, type QuestionDefinition } from '@arch-arena/shared/questions';
import { createStore, del, get, getMany, set } from 'idb-keyval';
import type { ZodType } from 'zod';
import { ApiError } from '../api';

// ── Stored shapes ───────────────────────────────────────────────────────────
interface LocalUser {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: ExplanationLanguage;
  xp: number;
  createdAt: string;
}

interface LocalProgress {
  questionId: string;
  status: ProgressStatus;
  bestScore: number | null;
  bestStars: number;
  bestAttemptScore: number | null;
  bestSubmissionId: string | null;
  attemptsCount: number;
  hintLevels: number[];
  hintFreeBonusAwarded: boolean;
  xpValueAwarded: number;
  referenceRevealedAt: string | null;
  firstCompletedAt: string | null;
  lastActivityAt: string;
}

interface AttemptMeta {
  id: string;
  questionId: string;
  diagramHash: string;
  createdAt: string;
  score: number;
  stars: number;
  rating: number;
  rubricVersion: number;
  submissionId: string | null;
}

interface AttemptPayload {
  diagram: DiagramSnapshot;
  report: EvaluationReport;
}

interface LocalSubmission {
  id: string;
  attemptId: string;
  questionId: string;
  idempotencyKey: string;
  score: number;
  stars: number;
  completed: boolean;
  xpAwarded: number;
  rewards: RewardLine[];
  rubricVersion: number;
  createdAt: string;
}

interface DraftMeta {
  revision: number;
  diagramHash: string;
  updatedAt: string;
  components: number;
}

interface LocalDraft extends DraftMeta {
  questionId: string;
  diagram: DiagramSnapshot;
}

interface State {
  version: 1;
  user: LocalUser;
  progress: Record<string, LocalProgress>;
  drafts: Record<string, DraftMeta>;
  attempts: AttemptMeta[];
  submissions: LocalSubmission[];
  achievements: { key: string; awardedAt: string; submissionId: string }[];
  /** Every XP grant, keyed for de-duplication (mirrors the server’s unique dedupe keys). */
  xpLedger: { dedupeKey: string; amount: number; submissionId: string }[];
}

const RUBRIC_VERSION = 1;
const store = createStore('archarena-local', 'kv');
const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const clone = <T>(v: T): T => (typeof structuredClone === 'function' ? structuredClone(v) : (JSON.parse(JSON.stringify(v)) as T));

// ── Errors (same codes as the server) ─────────────────────────────────────
const fail = (status: number, code: string, message: string, details?: unknown): never => {
  throw new ApiError(status, code, message, details);
};
const notFound = (message = 'Not found.') => fail(404, 'NOT_FOUND', message);

function parse<T extends ZodType>(schema: T, body: unknown): ReturnType<T['parse']> {
  const result = schema.safeParse(body);
  if (!result.success) {
    fail(
      400,
      'BAD_REQUEST',
      'Some fields are invalid.',
      result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }
  return result.data as ReturnType<T['parse']>;
}

// ── Questions (built once from the bundled bank) ──────────────────────────
interface Entry {
  def: QuestionDefinition;
  summary: QuestionSummaryDTO;
  detail: QuestionDetailDTO;
  evaluation: EvaluationInput;
}

let entries: Entry[] | null = null;
function questions(): Entry[] {
  entries ??= QUESTIONS.filter((q) => q.status === 'published').map((q, index) => {
    const summary: QuestionSummaryDTO = {
      id: q.id,
      slug: q.slug,
      title: q.title,
      difficulty: q.difficulty,
      category: q.category,
      estimatedMinutes: q.estimatedMinutes,
      tags: q.tags,
      concepts: q.concepts,
      sortOrder: index,
    };
    const detail: QuestionDetailDTO = {
      ...summary,
      statement: q.statement,
      functional: q.functional,
      nonFunctional: q.nonFunctional,
      constraints: q.constraints,
      clarifications: q.clarifications,
      scale: q.scale,
      suggestedCategories: q.suggestedCategories,
      starter: q.starter,
      hints: q.hints,
      rubric: q.rubric,
      rubricVersion: RUBRIC_VERSION,
      sources: q.sources,
      interviewClaim: 'commonly-discussed',
    };
    return { def: q, summary, detail, evaluation: toEvaluationInput(q, RUBRIC_VERSION) };
  });
  return entries;
}
const byKey = (key: string) => questions().find((e) => e.summary.id === key || e.summary.slug === key);
const countsByDifficulty = () => {
  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  for (const e of questions()) counts[e.summary.difficulty]++;
  return counts;
};

// ── Storage ───────────────────────────────────────────────────────────────
function freshState(): State {
  return {
    version: 1,
    user: { id: 'local-user', email: 'you@this-device', displayName: 'You', preferredLanguage: 'en', xp: 0, createdAt: now() },
    progress: {},
    drafts: {},
    attempts: [],
    submissions: [],
    achievements: [],
    xpLedger: [],
  };
}

let chain: Promise<unknown> = Promise.resolve();
/** Runs `fn` exclusively: in this tab via a promise chain, across tabs via the Web Locks API. */
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  const run = (): Promise<T> => (locks ? (locks.request('archarena-local', fn) as Promise<T>) : fn());
  const next = chain.then(run, run);
  chain = next.catch(() => undefined);
  return next as Promise<T>;
}

async function load(): Promise<State> {
  return (await get<State>('state', store)) ?? freshState();
}
const save = (state: State) => set('state', state, store);

// ── Mappers (same output as the server’s) ─────────────────────────────────
const toUserDTO = (u: LocalUser): UserDTO => ({ ...u, level: levelFromXp(u.xp) });

const toProgressDTO = (p: LocalProgress): ProgressDTO => ({
  questionId: p.questionId,
  status: p.status,
  bestScore: p.bestScore ?? p.bestAttemptScore,
  bestStars: p.bestStars,
  attemptsCount: p.attemptsCount,
  hintsUsed: p.hintLevels.length,
  referenceRevealed: !!p.referenceRevealedAt,
  lastActivityAt: p.lastActivityAt,
  completedAt: p.firstCompletedAt,
});

const toAttemptSummary = (a: AttemptMeta): AttemptSummaryDTO => ({
  id: a.id,
  questionId: a.questionId,
  score: a.score,
  stars: a.stars,
  rating: a.rating,
  diagramHash: a.diagramHash,
  createdAt: a.createdAt,
  isFinal: !!a.submissionId,
});

const toEarned = (a: { key: string; awardedAt: string }): EarnedAchievementDTO | null => {
  const def = getAchievement(a.key);
  return def ? { ...def, awardedAt: a.awardedAt } : null;
};

function progressFor(state: State, questionId: string, initial: Partial<LocalProgress> = {}): LocalProgress {
  state.progress[questionId] ??= {
    questionId,
    status: 'not_started',
    bestScore: null,
    bestStars: 0,
    bestAttemptScore: null,
    bestSubmissionId: null,
    attemptsCount: 0,
    hintLevels: [],
    hintFreeBonusAwarded: false,
    xpValueAwarded: 0,
    referenceRevealedAt: null,
    firstCompletedAt: null,
    lastActivityAt: now(),
    ...initial,
  };
  return state.progress[questionId]!;
}

const draftKey = (questionId: string) => `draft:${questionId}`;
const attemptKey = (id: string) => `attempt:${id}`;

async function loadDraft(state: State, questionId: string): Promise<DraftDTO | null> {
  if (!state.drafts[questionId]) return null;
  const d = await get<LocalDraft>(draftKey(questionId), store);
  return d ? { questionId, diagram: d.diagram, revision: d.revision, diagramHash: d.diagramHash, updatedAt: d.updatedAt } : null;
}

async function attemptDTO(state: State, id: string): Promise<AttemptDTO> {
  const meta = state.attempts.find((a) => a.id === id);
  const payload = meta ? await get<AttemptPayload>(attemptKey(id), store) : undefined;
  if (!meta || !payload) return notFound('Attempt not found.');
  const previous = [...state.attempts].filter((a) => a.questionId === meta.questionId && a.createdAt < meta.createdAt).pop();
  const prevPayload = previous ? await get<AttemptPayload>(attemptKey(previous.id), store) : undefined;
  return {
    ...toAttemptSummary(meta),
    diagram: payload.diagram,
    report: payload.report,
    rubricVersion: meta.rubricVersion,
    previous: previous ? { ...toAttemptSummary(previous), categories: (prevPayload?.report.categories ?? []).map((c) => ({ key: c.key, score: c.score })) } : null,
  };
}

async function submissionResult(state: State, s: LocalSubmission, replayed: boolean): Promise<SubmissionResultDTO> {
  const payload = await get<AttemptPayload>(attemptKey(s.attemptId), store);
  if (!payload) return notFound('Submission not found.');
  const progress = state.progress[s.questionId];
  const previous = state.submissions.filter((x) => x.questionId === s.questionId && x.createdAt < s.createdAt).sort((a, b) => b.score - a.score)[0];
  return {
    submissionId: s.id,
    attemptId: s.attemptId,
    questionId: s.questionId,
    score: s.score,
    stars: s.stars,
    rating: ratingForScore(s.score),
    completed: s.completed,
    xpAwarded: s.xpAwarded,
    rewards: s.rewards,
    achievements: state.achievements
      .filter((a) => a.submissionId === s.id)
      .map(toEarned)
      .filter((a): a is EarnedAchievementDTO => !!a),
    bestScore: progress?.bestScore ?? s.score,
    bestStars: progress?.bestStars ?? s.stars,
    previousBestScore: previous?.score ?? null,
    user: { xp: state.user.xp, level: levelFromXp(state.user.xp) },
    report: payload.report,
    createdAt: s.createdAt,
    replayed,
  };
}

// ── Final submission (port of apps/server/src/services/submissions.ts) ─────
async function finalize(state: State, attemptId: string, idempotencyKey: string): Promise<{ result: SubmissionResultDTO; created: boolean }> {
  const prior = state.submissions.find((s) => s.idempotencyKey === idempotencyKey || s.attemptId === attemptId);
  if (prior) return { result: await submissionResult(state, prior, true), created: false };

  const meta = state.attempts.find((a) => a.id === attemptId);
  if (!meta) return notFound('Attempt not found.');
  const entry = byKey(meta.questionId);
  if (!entry) return notFound('Question not found.');
  const payload = await get<AttemptPayload>(attemptKey(attemptId), store);
  if (!payload) return notFound('Attempt not found.');

  const progress = progressFor(state, meta.questionId, { status: 'evaluated' });
  const { score, stars } = meta;
  const completed = score >= GAMIFICATION.completionMinScore;
  const lines = computeSubmissionRewards({
    difficulty: entry.summary.difficulty,
    score,
    previouslyAwardedValue: progress.xpValueAwarded,
    previouslyCompleted: progress.status === 'completed',
    hintFreeBonusAwarded: progress.hintFreeBonusAwarded,
    hintsUsed: progress.hintLevels.length,
  });

  const submission: LocalSubmission = {
    id: uuid(),
    attemptId,
    questionId: meta.questionId,
    idempotencyKey,
    score,
    stars,
    completed,
    xpAwarded: 0,
    rewards: [],
    rubricVersion: meta.rubricVersion,
    createdAt: now(),
  };
  const grant = (dedupeKey: string, amount: number) => {
    if (state.xpLedger.some((l) => l.dedupeKey === dedupeKey)) return false;
    state.xpLedger.push({ dedupeKey, amount, submissionId: submission.id });
    submission.xpAwarded += amount;
    return true;
  };
  for (const line of lines) {
    const key =
      line.reason === 'first_completion_bonus'
        ? `first-completion:${meta.questionId}`
        : line.reason === 'hint_free_bonus'
          ? `hint-free:${meta.questionId}`
          : `${line.reason}:${submission.id}`;
    if (grant(key, line.amount)) submission.rewards.push(line);
  }

  const previousBest = progress.bestScore;
  const improved = previousBest === null || score > previousBest;
  const ts = now();
  progress.status = completed || progress.status === 'completed' ? 'completed' : 'evaluated';
  progress.bestScore = improved ? score : previousBest;
  progress.bestStars = Math.max(progress.bestStars, stars);
  progress.bestSubmissionId = improved ? submission.id : progress.bestSubmissionId;
  if (completed) progress.xpValueAwarded = Math.max(progress.xpValueAwarded, challengeXpValue(entry.summary.difficulty, score));
  progress.hintFreeBonusAwarded = progress.hintFreeBonusAwarded || submission.rewards.some((r) => r.reason === 'hint_free_bonus');
  progress.firstCompletedAt = progress.firstCompletedAt ?? (completed ? ts : null);
  progress.lastActivityAt = ts;

  const completedByDifficulty: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  for (const p of Object.values(state.progress)) {
    if (p.status !== 'completed') continue;
    const d = byKey(p.questionId)?.summary.difficulty;
    if (d) completedByDifficulty[d]++;
  }
  const earned = newlyEarnedAchievements(
    {
      completedByDifficulty,
      totalByDifficulty: countsByDifficulty(),
      submission: {
        difficulty: entry.summary.difficulty,
        score,
        stars,
        connectionsScore: payload.report.categories.find((c) => c.key === 'connections')?.score ?? 0,
        previousBestScore: previousBest,
        completed,
      },
    },
    new Set(state.achievements.map((a) => a.key)),
  );
  for (const a of earned) {
    state.achievements.push({ key: a.key, awardedAt: ts, submissionId: submission.id });
    grant(`achievement:${a.key}`, a.xp);
  }

  state.user.xp += submission.xpAwarded;
  meta.submissionId = submission.id;
  state.submissions.push(submission);
  return { result: await submissionResult(state, submission, false), created: true };
}

// ── Dashboard (port of apps/server/src/services/dashboard.ts) ─────────────
async function dashboard(state: State): Promise<DashboardDTO> {
  const qs = questions().map((e) => e.summary);
  const qById = new Map(qs.map((q) => [q.id, q]));
  const progress = Object.values(state.progress);
  const completed = progress.filter((p) => p.status === 'completed');
  const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

  const byDifficulty = Object.fromEntries(
    DIFFICULTY_ORDER.map((d) => {
      const done = completed.filter((p) => qById.get(p.questionId)?.difficulty === d);
      return [d, { completed: done.length, total: qs.filter((q) => q.difficulty === d).length, stars: done.reduce((s, p) => s + p.bestStars, 0) }];
    }),
  ) as DashboardDTO['byDifficulty'];

  const scored = completed.filter((p) => p.bestScore !== null);
  const averageRating = scored.length ? Math.round((scored.reduce((s, p) => s + (p.bestScore ?? 0), 0) / scored.length / 20) * 10) / 10 : null;

  const newest = [...state.attempts].reverse();
  const latestPerQuestion: AttemptMeta[] = [];
  for (const a of newest.slice(0, 40)) if (!latestPerQuestion.some((x) => x.questionId === a.questionId)) latestPerQuestion.push(a);
  const payloads = await getMany<AttemptPayload | undefined>(latestPerQuestion.map((a) => attemptKey(a.id)), store);
  const sums = new Map<string, { total: number; n: number }>();
  for (const p of payloads) {
    for (const c of p?.report.categories ?? []) {
      if (!c.assessed) continue;
      const cur = sums.get(c.key) ?? { total: 0, n: 0 };
      cur.total += c.score;
      cur.n += 1;
      sums.set(c.key, cur);
    }
  }
  const weakTopics = SCORE_CATEGORIES.map((c) => {
    const s = sums.get(c.key);
    return s ? { key: c.key, label: c.label, averageScore: Math.round(s.total / s.n), samples: s.n } : null;
  })
    .filter((t): t is NonNullable<typeof t> => !!t && t.averageScore < 75)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);

  const drafts = Object.entries(state.drafts)
    .map(([questionId, d]) => ({ questionId, ...d }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);
  const draftToContinue = drafts.find((d) => state.progress[d.questionId]?.status !== 'completed');
  const continueQ = draftToContinue ? qById.get(draftToContinue.questionId) : undefined;

  let recommended: DashboardDTO['recommended'] = null;
  for (const d of DIFFICULTY_ORDER) {
    const tier = qs.filter((q) => q.difficulty === d);
    const isDone = (id: string) => state.progress[id]?.status === 'completed';
    const doneInTier = tier.filter((q) => isDone(q.id)).length;
    const next = tier.find((q) => !isDone(q.id) && q.id !== continueQ?.id) ?? tier.find((q) => !isDone(q.id));
    if (!next) continue;
    const tierLabel = d[0]!.toUpperCase() + d.slice(1);
    if (d !== 'hard' && tier.length > 0 && doneInTier / tier.length >= 0.6) {
      const nextTier = DIFFICULTY_ORDER[DIFFICULTY_ORDER.indexOf(d) + 1]!;
      const candidate = qs.find((q) => q.difficulty === nextTier && !isDone(q.id));
      if (candidate) {
        recommended = { questionId: candidate.id, slug: candidate.slug, title: candidate.title, difficulty: candidate.difficulty, reason: `You have completed most ${tierLabel} challenges — time to step up.` };
        break;
      }
    }
    recommended = {
      questionId: next.id,
      slug: next.slug,
      title: next.title,
      difficulty: next.difficulty,
      reason: doneInTier === 0 && d === 'easy' ? 'A great first challenge to learn the playground.' : `Next ${tierLabel} challenge on your path.`,
    };
    break;
  }

  return {
    totals: {
      completed: completed.length,
      totalQuestions: qs.length,
      stars: completed.reduce((s, p) => s + p.bestStars, 0),
      maxStars: qs.length * 5,
      xp: state.user.xp,
      averageRating,
      attempts: state.attempts.length,
    },
    level: levelFromXp(state.user.xp),
    byDifficulty,
    recentAttempts: newest
      .slice(0, 8)
      .map((a) => {
        const q = qById.get(a.questionId);
        return q ? { ...toAttemptSummary(a), title: q.title, slug: q.slug, difficulty: q.difficulty } : null;
      })
      .filter((a): a is NonNullable<typeof a> => !!a),
    drafts: drafts
      .map((d) => {
        const q = qById.get(d.questionId);
        return q ? { questionId: d.questionId, revision: d.revision, updatedAt: d.updatedAt, components: d.components, title: q.title, slug: q.slug, difficulty: q.difficulty } : null;
      })
      .filter((d): d is NonNullable<typeof d> => !!d),
    recommended,
    continueWith: continueQ ? { questionId: continueQ.id, slug: continueQ.slug, title: continueQ.title } : null,
    weakTopics,
    achievements: [...state.achievements]
      .sort((a, b) => b.awardedAt.localeCompare(a.awardedAt))
      .map(toEarned)
      .filter((a): a is EarnedAchievementDTO => !!a),
  };
}

// ── Router ────────────────────────────────────────────────────────────────
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function route(method: Method, path: string, body: unknown): Promise<unknown> {
  const url = new URL(path, 'http://local');
  const seg = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const state = await load();
  let dirty = false;
  const respond = async <T>(value: T, changed = false): Promise<T> => {
    if (changed || dirty) await save(state);
    return value;
  };

  // Auth: one local profile, always signed in.
  if (seg[0] === 'auth') {
    if (seg[1] === 'config') return { googleClientId: null };
    if (seg[1] === 'logout') return undefined;
    return respond({ user: toUserDTO(state.user) }, !(await get('state', store)));
  }

  if (seg[0] === 'me') {
    if (method === 'PATCH' && seg[1] === 'preferences') {
      const input = parse(updatePreferencesSchema, body);
      if (input.preferredLanguage) state.user.preferredLanguage = input.preferredLanguage;
      if (input.displayName) state.user.displayName = input.displayName;
      return respond({ user: toUserDTO(state.user) }, true);
    }
    if (seg[1] === 'progress') return { progress: Object.values(state.progress).map(toProgressDTO) };
    if (seg[1] === 'dashboard') return dashboard(state);
    if (seg[1] === 'achievements') return { all: ACHIEVEMENTS, earned: state.achievements.map(toEarned).filter((a) => !!a) };
  }

  if (seg[0] === 'questions') {
    if (seg.length === 1) return { questions: questions().map((e) => e.summary) };
    const entry = byKey(seg[1]!) ?? notFound('Challenge not found.');
    if (seg.length === 2) return { question: entry.detail };
    if (seg[2] === 'reference') {
      if (!state.attempts.some((a) => a.questionId === entry.summary.id)) fail(403, 'FORBIDDEN', 'Evaluate at least one attempt to unlock the reference architecture.');
      progressFor(state, entry.summary.id, { status: 'evaluated' }).referenceRevealedAt = now();
      const ref: ReferenceDTO = { questionId: entry.summary.id, reference: entry.def.reference, diagram: referenceToDiagram(entry.def.reference) };
      return respond(ref, true);
    }
    if (seg[2] === 'hints' && method === 'POST') {
      const { level } = parse(hintUsageSchema, body);
      const p = progressFor(state, entry.summary.id);
      if (!p.hintLevels.includes(level)) p.hintLevels.push(level);
      p.lastActivityAt = now();
      return respond({ hintsUsed: p.hintLevels.length }, true);
    }
  }

  if (seg[0] === 'drafts') {
    if (seg.length === 1) {
      const drafts: DraftSummaryDTO[] = Object.entries(state.drafts)
        .map(([questionId, d]) => ({ questionId, revision: d.revision, updatedAt: d.updatedAt, components: d.components }))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return { drafts };
    }
    const questionId = seg[1]!;
    if (method === 'GET') return { draft: await loadDraft(state, questionId) };
    if (method === 'DELETE') {
      delete state.drafts[questionId];
      await del(draftKey(questionId), store);
      return respond(undefined, true);
    }
    if (method === 'PUT') {
      if (!byKey(questionId)) notFound('Challenge not found.');
      const input = parse(saveDraftSchema, body);
      const diagram = input.diagram as DiagramSnapshot;
      const diagramHash = hashDiagram(diagram);
      const components = diagram.nodes.filter((n) => n.kind === 'component').length;
      const existing = await loadDraft(state, questionId);
      const write = async (revision: number) => {
        const meta: DraftMeta = { revision, diagramHash, updatedAt: now(), components };
        state.drafts[questionId] = meta;
        await set(draftKey(questionId), { questionId, diagram, ...meta } satisfies LocalDraft, store);
        return { questionId, diagram, revision, diagramHash, updatedAt: meta.updatedAt } satisfies DraftDTO;
      };
      if (!existing) {
        const draft = await write(1);
        const p = progressFor(state, questionId, { status: 'in_progress' });
        p.lastActivityAt = now();
        return respond({ draft }, true);
      }
      if (!input.force && existing.revision !== input.baseRevision) {
        if (existing.diagramHash === diagramHash) return { draft: existing };
        fail(409, 'DRAFT_CONFLICT', 'This draft was changed on another device or tab.', { draft: existing });
      }
      const draft = await write(existing.revision + 1);
      if (state.progress[questionId]) state.progress[questionId]!.lastActivityAt = now();
      return respond({ draft }, true);
    }
  }

  if (seg[0] === 'attempts') {
    if (method === 'POST') {
      const input = parse(createAttemptSchema, body);
      const entry = byKey(input.questionId) ?? notFound('Challenge not found.');
      const diagram = input.diagram as DiagramSnapshot;
      const report = evaluateDesign(diagram, entry.evaluation);
      const meta: AttemptMeta = {
        id: uuid(),
        questionId: entry.summary.id,
        diagramHash: hashDiagram(diagram),
        createdAt: now(),
        score: report.score,
        stars: report.stars,
        rating: report.rating,
        rubricVersion: RUBRIC_VERSION,
        submissionId: null,
      };
      await set(attemptKey(meta.id), { diagram, report } satisfies AttemptPayload, store);
      state.attempts.push(meta);
      const p = progressFor(state, meta.questionId, { status: 'evaluated' });
      if (p.status !== 'completed') p.status = 'evaluated';
      p.attemptsCount += 1;
      p.bestAttemptScore = Math.max(p.bestAttemptScore ?? 0, report.score);
      p.lastActivityAt = now();
      dirty = true;
      return respond({ attempt: await attemptDTO(state, meta.id) });
    }
    if (seg.length === 1) {
      const questionId = url.searchParams.get('questionId');
      const list = [...state.attempts]
        .reverse()
        .filter((a) => !questionId || a.questionId === questionId)
        .slice(0, 50)
        .map(toAttemptSummary);
      return { attempts: list };
    }
    return { attempt: await attemptDTO(state, seg[1]!) };
  }

  if (seg[0] === 'submissions') {
    if (method === 'POST') {
      const { attemptId, idempotencyKey } = parse(finalSubmitSchema, body);
      const { result, created } = await finalize(state, attemptId, idempotencyKey);
      return respond({ submission: result }, created);
    }
    const s = state.submissions.find((x) => x.id === seg[1]) ?? notFound('Submission not found.');
    return { submission: await submissionResult(state, s, false) };
  }

  return notFound('This API route does not exist.');
}

/** Entry point used by `api()` in static mode. Responses are copies, like data from the network. */
export async function localApi<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const value = await exclusive(() => route(method, path, body === undefined ? undefined : clone(body)));
  return (value === undefined ? undefined : clone(value)) as T;
}

/** Erases all locally stored progress (Settings → “Erase all progress”). */
export async function resetLocalData(): Promise<void> {
  await exclusive(async () => {
    const { clear } = await import('idb-keyval');
    await clear(store);
  });
}
