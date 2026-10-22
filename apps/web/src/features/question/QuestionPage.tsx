import { SCORE_CATEGORIES, type QuestionDetailDTO } from '@arch-arena/shared';
import { BookOpen, CircleHelp, Clock, ExternalLink, Gauge, Lightbulb, ListChecks, Play, Target, Trophy, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { Badge, DifficultyBadge, StatusBadge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Stars } from '@/components/ui/Stars';
import { isNetworkError } from '@/lib/api';
import { GUEST, getLocalDraft } from '@/lib/drafts/localDrafts';
import { useAttempts, useMe, useProgress, useQuestion } from '@/lib/queries';
import { HintsPanel } from './HintsPanel';

function Section({ icon, title, children, aside }: { icon: React.ReactNode; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ProgressCard({ question }: { question: QuestionDetailDTO }) {
  const { data: user } = useMe();
  const { data: progress } = useProgress(!!user);
  const { data: attempts } = useAttempts(question.id, !!user);
  const p = progress?.find((x) => x.questionId === question.id);
  if (!user) {
    return (
      <div className="card p-5 text-sm">
        <p className="font-semibold">Track your progress</p>
        <p className="mt-1 text-slate-500 dark:text-slate-400">You can design and validate without an account. Sign in to get scored, earn stars and XP, and sync drafts.</p>
        <div className="mt-3 flex gap-2">
          <ButtonLink to={`/register?redirect=/challenges/${question.slug}`} size="sm">
            Create account
          </ButtonLink>
          <ButtonLink to={`/login?redirect=/challenges/${question.slug}`} size="sm" variant="outline">
            Sign in
          </ButtonLink>
        </div>
      </div>
    );
  }
  const latest = attempts?.[0];
  return (
    <div className="card space-y-3 p-5 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Your progress</p>
        <StatusBadge status={p?.status ?? 'not_started'} />
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-slate-500">Best score</dt>
          <dd className="text-lg font-semibold">{p?.bestScore ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Stars earned</dt>
          <dd>
            <Stars count={p?.bestStars ?? 0} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Evaluations</dt>
          <dd className="font-semibold">{p?.attemptsCount ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Hints used</dt>
          <dd className="font-semibold">{p?.hintsUsed ?? 0} / 4</dd>
        </div>
      </dl>
      {latest && (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          <Link to={`/challenges/${question.slug}/attempts/${latest.id}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Latest evaluation ({latest.score}/100)
          </Link>
          <span className="text-slate-300">·</span>
          <Link to={`/challenges/${question.slug}/reference`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Reference architecture
          </Link>
        </div>
      )}
    </div>
  );
}

export default function QuestionPage() {
  const { slug } = useParams();
  const { data: q, isLoading, error } = useQuestion(slug);
  const { data: user } = useMe();
  const t = useExplanation();
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    if (!q) return;
    void getLocalDraft(user?.id ?? GUEST, q.id).then((d) => setHasDraft(!!d && d.diagram.nodes.length > q.starter.length));
  }, [q, user?.id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!q) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={isNetworkError(error) ? <WifiOff className="h-8 w-8" /> : undefined}
          title={isNetworkError(error) ? 'Not available offline yet' : 'Challenge not found'}
          description={isNetworkError(error) ? 'Open this challenge once while online to keep it available offline.' : undefined}
          action={<ButtonLink to="/challenges">Browse challenges</ButtonLink>}
        />
      </div>
    );
  }

  const evaluated = SCORE_CATEGORIES.filter((c) => q.rubric.checks.some((ch) => ch.category === c.key));
  const start = (
    <ButtonLink to={`/challenges/${q.slug}/play`} size="lg" icon={<Play className="h-4 w-4" />} data-testid="start-challenge">
      {hasDraft ? 'Continue challenge' : 'Start challenge'}
    </ButtonLink>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
        <Link to="/challenges" className="hover:underline">
          Challenges
        </Link>{' '}
        / {q.title}
      </nav>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={q.difficulty} />
            <Badge>{q.category}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" aria-hidden /> Suggested time: {q.estimatedMinutes} min
            </span>
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">{q.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LanguageToggle />
          {start}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Section icon={<BookOpen className="h-5 w-5 text-indigo-500" />} title="Problem">
            <p className="leading-relaxed text-slate-700 dark:text-slate-300" data-testid="problem-statement">
              {t(q.statement)}
            </p>
          </Section>

          <Section icon={<ListChecks className="h-5 w-5 text-indigo-500" />} title="Requirements">
            <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Functional</h3>
            <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {q.functional.map((r) => (
                <li key={r.id}>{t(r)}</li>
              ))}
            </ul>
            <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Non-functional</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {q.nonFunctional.map((r) => (
                <li key={r.id}>{t(r)}</li>
              ))}
            </ul>
          </Section>

          <Section icon={<Gauge className="h-5 w-5 text-indigo-500" />} title="Scale & constraints">
            <dl className="mb-4 grid gap-3 sm:grid-cols-3">
              {q.scale.map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <dt className="text-xs text-slate-500">{s.label}</dt>
                  <dd className="text-sm font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Constraints & assumptions</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {t(q.constraints).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>

          {q.clarifications.length > 0 && (
            <Section icon={<CircleHelp className="h-5 w-5 text-indigo-500" />} title="Clarifications">
              <dl className="space-y-3 text-sm">
                {q.clarifications.map((c, i) => (
                  <div key={i}>
                    <dt className="font-medium">{t(c.q)}</dt>
                    <dd className="text-slate-600 dark:text-slate-300">{t(c.a)}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          <Section icon={<Target className="h-5 w-5 text-indigo-500" />} title="What you need to deliver">
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>A connected architecture diagram that supports every functional requirement end to end.</li>
              <li>Connections that show how requests and data flow, pointing from caller to callee (async flows through queues or streams).</li>
              <li>Key components configured where it matters — for example replication, caching policy, sharding or delivery guarantees.</li>
              <li>A design that meets the stated scale without unnecessary components.</li>
            </ul>
            <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Concepts evaluated</h3>
            <div className="flex flex-wrap gap-2">
              {q.concepts.map((c) => (
                <Badge key={c} tone="indigo">
                  {c}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Scored across: {evaluated.map((c) => c.label).join(', ')}.</p>
          </Section>

          <Section icon={<Lightbulb className="h-5 w-5 text-amber-500" />} title="Progressive hints">
            <HintsPanel question={q} />
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="text-sm font-semibold">Ready?</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Open the playground, build your architecture and validate it as often as you like.</p>
            <div className="mt-3">{start}</div>
          </div>
          <ProgressCard question={q} />
          <div className="card p-5 text-sm">
            <p className="mb-2 flex items-center gap-2 font-semibold">
              <Trophy className="h-4 w-4 text-amber-500" aria-hidden /> Rewards
            </p>
            <p className="text-slate-500 dark:text-slate-400">Final submissions earn up to 5 stars and XP based on difficulty and score. Improving later only adds the difference — never double rewards.</p>
          </div>
          {q.sources.length > 0 && (
            <div className="card p-5 text-sm">
              <p className="mb-2 font-semibold">Sources & further reading</p>
              <ul className="space-y-2">
                {q.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-start gap-1 text-indigo-600 hover:underline dark:text-indigo-400">
                      {s.title} <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                    </a>
                    <span className="ml-1 text-xs text-slate-400">{s.verification === 'verified' ? '· link verified' : '· pending verification'}</span>
                    {s.note && <p className="text-xs text-slate-500">{s.note}</p>}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                This is a commonly discussed interview-style problem. It is not a claim that any specific company asks it. Explanations, rubrics and reference designs here are original.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
