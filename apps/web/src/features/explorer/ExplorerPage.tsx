import { QUESTION_CATEGORIES, type Difficulty, type ProgressDTO, type ProgressStatus, type QuestionSummaryDTO } from '@arch-arena/shared';
import { Clock, Play, RotateCcw, Search, SearchX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { DifficultyBadge, StatusBadge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, Segmented, Skeleton } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Stars } from '@/components/ui/Stars';
import { listLocalDrafts, GUEST } from '@/lib/drafts/localDrafts';
import { useMe, useProgress, useQuestions } from '@/lib/queries';

const PAGE_SIZE = 24;
const DIFF_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

type SortKey = 'recommended' | 'difficulty' | 'title' | 'time';
type StatusFilter = 'all' | ProgressStatus;

function ChallengeCard({ q, progress }: { q: QuestionSummaryDTO; progress?: ProgressDTO }) {
  const status = progress?.status ?? 'not_started';
  const started = status !== 'not_started';
  return (
    <li className="card flex flex-col p-4 transition-shadow hover:shadow-md" data-testid="challenge-card">
      <div className="mb-2 flex items-start justify-between gap-2">
        <DifficultyBadge difficulty={q.difficulty} />
        <StatusBadge status={status} />
      </div>
      <h3 className="font-semibold leading-snug">
        <Link to={`/challenges/${q.slug}`} className="hover:underline">
          {q.title}
        </Link>
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{q.category}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden /> ~{q.estimatedMinutes} min
        </span>
        <span>Best: {progress?.bestScore ?? '—'}</span>
        <Stars count={progress?.bestStars ?? 0} />
      </div>
      <div className="mt-4 flex items-center gap-2 pt-1">
        <ButtonLink to={`/challenges/${q.slug}`} size="sm" variant={started ? 'outline' : 'primary'} icon={<Play className="h-3.5 w-3.5" />} className="flex-1">
          {started ? 'Continue' : 'Start'}
        </ButtonLink>
      </div>
    </li>
  );
}

export default function ExplorerPage() {
  const { data: questions, isLoading } = useQuestions();
  const { data: user } = useMe();
  const { data: progress } = useProgress(!!user);
  const [params, setParams] = useSearchParams();
  const [guestDrafts, setGuestDrafts] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const q = params.get('q') ?? '';
  const difficulty = (params.get('difficulty') ?? 'all') as 'all' | Difficulty;
  const category = params.get('category') ?? 'all';
  const status = (params.get('status') ?? 'all') as StatusFilter;
  const sort = (params.get('sort') ?? 'recommended') as SortKey;

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'sort' && value === 'recommended')) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
    setPage(1);
  };

  useEffect(() => {
    if (user) return;
    void listLocalDrafts(GUEST).then((d) => setGuestDrafts(new Set(d.map((x) => x.questionId))));
  }, [user]);

  const progressById = useMemo(() => {
    const map = new Map<string, ProgressDTO>((progress ?? []).map((p) => [p.questionId, p]));
    if (!user) {
      for (const id of guestDrafts) {
        map.set(id, { questionId: id, status: 'in_progress', bestScore: null, bestStars: 0, attemptsCount: 0, hintsUsed: 0, referenceRevealed: false, lastActivityAt: null, completedAt: null });
      }
    }
    return map;
  }, [progress, user, guestDrafts]);

  const filtered = useMemo(() => {
    if (!questions) return [];
    const term = q.trim().toLowerCase();
    const list = questions.filter((x) => {
      if (term && !`${x.title} ${x.tags.join(' ')} ${x.concepts.join(' ')}`.toLowerCase().includes(term)) return false;
      if (difficulty !== 'all' && x.difficulty !== difficulty) return false;
      if (category !== 'all' && x.category !== category) return false;
      if (status !== 'all' && (progressById.get(x.id)?.status ?? 'not_started') !== status) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === 'difficulty') sorted.sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty] || a.sortOrder - b.sortOrder);
    else if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'time') sorted.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes || a.sortOrder - b.sortOrder);
    else sorted.sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted;
  }, [questions, q, difficulty, category, status, sort, progressById]);

  const counts = useMemo(() => {
    const c = { easy: 0, medium: 0, hard: 0 };
    for (const x of questions ?? []) c[x.difficulty]++;
    return c;
  }, [questions]);
  const completed = (progress ?? []).filter((p) => p.status === 'completed').length;
  const total = questions?.length ?? 0;
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const usedCategories = QUESTION_CATEGORIES.filter((c) => questions?.some((x) => x.category === c));
  const filtersActive = q || difficulty !== 'all' || category !== 'all' || status !== 'all';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Challenges</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {total} system design challenges · {counts.easy} Easy · {counts.medium} Medium · {counts.hard} Hard
          </p>
        </div>
        {user && total > 0 && (
          <div className="w-full max-w-xs">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Your progress</span>
              <span>
                {completed}/{total} completed
              </span>
            </div>
            <ProgressBar value={completed} max={total} label="Challenges completed" tone="emerald" />
          </div>
        )}
      </header>

      <div className="card mb-6 flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="relative block min-w-0 flex-1 lg:min-w-64">
          <span className="label">Search</span>
          <Search className="pointer-events-none absolute bottom-2.5 left-2.5 h-4 w-4 text-slate-400" aria-hidden />
          <input className="input pl-8" placeholder="Search by title or topic…" value={q} onChange={(e) => update('q', e.target.value)} />
        </label>
        <div>
          <span className="label">Difficulty</span>
          <Segmented
            label="Difficulty"
            value={difficulty}
            onChange={(v) => update('difficulty', v)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
        </div>
        <label className="block">
          <span className="label">Category</span>
          <select className="input lg:w-48" value={category} onChange={(e) => update('category', e.target.value)}>
            <option value="all">All categories</option>
            {usedCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select className="input lg:w-40" value={status} onChange={(e) => update('status', e.target.value)}>
            <option value="all">Any status</option>
            <option value="not_started">Not started</option>
            <option value="in_progress">Draft</option>
            <option value="evaluated">Evaluated</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label className="block">
          <span className="label">Sort by</span>
          <select className="input lg:w-44" value={sort} onChange={(e) => update('sort', e.target.value)}>
            <option value="recommended">Recommended order</option>
            <option value="difficulty">Difficulty</option>
            <option value="title">Title (A–Z)</option>
            <option value="time">Completion time</option>
          </select>
        </label>
        {filtersActive && (
          <Button variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Reset
          </Button>
        )}
      </div>

      {isLoading ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-44 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<SearchX className="h-8 w-8" />} title="No challenges match your filters" description="Try a different search term or reset the filters." />
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-500" aria-live="polite">
            Showing {visible.length} of {filtered.length} challenge{filtered.length === 1 ? '' : 's'}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((x) => (
              <ChallengeCard key={x.id} q={x} progress={progressById.get(x.id)} />
            ))}
          </ul>
          {visible.length < filtered.length && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Show more challenges
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
