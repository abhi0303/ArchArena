import { getComponent, type DiagramSnapshot } from '@arch-arena/shared';
import { ArrowLeft, Lock, Scale, Shuffle, Spline } from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { DynamicIcon } from '@/components/icons';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, Segmented, Skeleton } from '@/components/ui/misc';
import { PageSpinner } from '@/components/ui/Spinner';
import { errorMessage, isApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useAttempt, useAttempts, useMe, useQuestion, useReference } from '@/lib/queries';

const DiagramViewer = lazy(() => import('@/components/DiagramViewer'));

type View = 'side' | 'reference' | 'mine';

export default function ReferencePage() {
  const { slug } = useParams();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: question } = useQuestion(slug);
  const ref = useReference(slug, !!user);
  const { data: attempts } = useAttempts(question?.id, !!user);
  const latest = attempts?.[0];
  const { data: attempt } = useAttempt(latest?.id);
  const [view, setView] = useState<View>('side');
  const [selected, setSelected] = useState<string | null>(null);

  const typeById = useMemo(() => new Map(ref.data?.reference.nodes.map((n) => [n.id, n]) ?? []), [ref.data]);

  if (userLoading || ref.isLoading) return <PageSpinner />;
  if (!user || ref.error || !ref.data) {
    const locked = isApiError(ref.error, 'FORBIDDEN') || !user;
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={<Lock className="h-8 w-8" />}
          title={locked ? 'Reference locked' : 'Reference unavailable'}
          description={locked ? 'Evaluate at least one attempt for this challenge to unlock its reference architecture.' : errorMessage(ref.error)}
          action={<ButtonLink to={`/challenges/${slug}/play`}>Open playground</ButtonLink>}
        />
      </div>
    );
  }

  const { reference, diagram } = ref.data;
  const critical = reference.edges.filter((e) => e.why);
  const label = (id: string) => {
    const n = typeById.get(id);
    return n?.label ?? getComponent(n?.type ?? '')?.label ?? id;
  };
  const refViewer = (
    <Suspense fallback={<Skeleton className="h-[420px] w-full" />}>
      <DiagramViewer diagram={diagram} label="Reference architecture" className="h-[420px] w-full" onNodeClick={setSelected} selectedId={selected} />
    </Suspense>
  );
  const mineViewer = attempt ? (
    <Suspense fallback={<Skeleton className="h-[420px] w-full" />}>
      <DiagramViewer diagram={attempt.diagram as DiagramSnapshot} label="Your latest evaluated design" className="h-[420px] w-full" />
    </Suspense>
  ) : (
    <div className="flex h-[420px] items-center justify-center text-sm text-slate-500">Loading your design…</div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/challenges" className="hover:underline">
          Challenges
        </Link>{' '}
        /{' '}
        <Link to={`/challenges/${slug}`} className="hover:underline">
          {question?.title}
        </Link>{' '}
        / Reference
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reference architecture</h1>
          <p className="text-sm text-slate-500">One strong solution — not the only valid one. Click a component to read why it is there.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Comparison view"
            value={view}
            onChange={setView}
            options={[
              { value: 'side', label: 'Side by side' },
              { value: 'reference', label: 'Reference' },
              { value: 'mine', label: 'Your design' },
            ]}
          />
          <ButtonLink to={`/challenges/${slug}/play`} variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to my design
          </ButtonLink>
        </div>
      </div>

      <div className={cn('grid gap-4', view === 'side' && 'lg:grid-cols-2')}>
        {view !== 'mine' && (
          <section className="card overflow-hidden">
            <h2 className="border-b border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-800">Reference</h2>
            {refViewer}
          </section>
        )}
        {view !== 'reference' && (
          <section className="card overflow-hidden">
            <h2 className="border-b border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-800">
              Your latest evaluated design {latest && <span className="font-normal text-slate-500">· score {latest.score}</span>}
            </h2>
            {mineViewer}
          </section>
        )}
      </div>

      <section className="card p-5">
        <h2 className="mb-2 text-sm font-semibold">Why this design meets the requirements</h2>
        <p className="text-sm text-slate-700 dark:text-slate-300">{reference.summary}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="components-title">
          <h2 id="components-title" className="mb-3 text-sm font-semibold">
            Components
          </h2>
          <ul className="space-y-2">
            {reference.nodes.map((n) => {
              const def = getComponent(n.type);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(n.id)}
                    className={cn('flex w-full gap-3 rounded-lg p-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800', selected === n.id && 'bg-indigo-50 dark:bg-indigo-950/60')}
                  >
                    <DynamicIcon name={def?.icon ?? 'Box'} className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                    <span>
                      <span className="font-medium">{n.label ?? def?.label}</span>
                      <span className="ml-1 text-xs text-slate-400">{def?.label}</span>
                      <span className="block text-slate-600 dark:text-slate-300">{n.why}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Spline className="h-4 w-4 text-indigo-500" aria-hidden /> Critical connections
            </h2>
            <ul className="space-y-3 text-sm">
              {critical.map((e) => (
                <li key={`${e.from}-${e.to}`}>
                  <p className="font-medium">
                    {label(e.from)} → {label(e.to)}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">{e.why}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Scale className="h-4 w-4 text-amber-500" aria-hidden /> Trade-offs
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {reference.tradeoffs.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Shuffle className="h-4 w-4 text-emerald-500" aria-hidden /> Alternative valid approaches
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {reference.alternatives.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
