import type { Difficulty } from '@arch-arena/shared';
import { ArrowRight, Award, FileClock, History, Play, Star, Target, TrendingDown, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { DynamicIcon } from '@/components/icons';
import { DifficultyBadge, Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, SectionTitle, Skeleton } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Stars } from '@/components/ui/Stars';
import { cn, formatRelative } from '@/lib/cn';
import { useAchievements, useDashboard, useMe } from '@/lib/queries';

const TOPIC_ADVICE: Record<string, string> = {
  functional: 'Trace each requirement as a flow from client to storage before adding extras.',
  connections: 'Check arrow directions and make sure every queue has a producer and a consumer.',
  components: 'Revisit which building blocks each requirement needs (cache, queue, object storage…).',
  scalability: 'Put a load balancer in front of stateless services and scale instances horizontally.',
  reliability: 'Remove single points of failure with replicas, multiple instances and dead-letter queues.',
  data: 'Match storage to access patterns and configure caching policies explicitly.',
  simplicity: 'Remove components that do not serve a requirement and connect everything you keep.',
};

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

const DIFF_TONE: Record<Difficulty, 'emerald' | 'amber' | 'rose'> = { easy: 'emerald', medium: 'amber', hard: 'rose' };

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useMe();
  const { data: d, isLoading } = useDashboard(!!user);
  const { data: ach } = useAchievements(!!user);

  if (!userLoading && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={<Trophy className="h-8 w-8" />}
          title="Your dashboard lives in your account"
          description="Sign in to track completed challenges, stars, XP, levels and achievements. Drafts you made on this device will be added to your account."
          action={
            <div className="flex gap-2">
              <ButtonLink to="/login?redirect=/dashboard" variant="outline">
                Sign in
              </ButtonLink>
              <ButtonLink to="/register?redirect=/dashboard">Create account</ButtonLink>
            </div>
          }
        />
      </div>
    );
  }

  if (isLoading || !d || !user) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const lvl = d.level;
  const earned = new Set(ach?.earned.map((a) => a.key));

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, {user.displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Level {lvl.level} · {lvl.title}
          </p>
        </div>
        {d.continueWith ? (
          <ButtonLink to={`/challenges/${d.continueWith.slug}/play`} size="lg" icon={<Play className="h-4 w-4" />} data-testid="continue-practicing">
            Continue practicing
          </ButtonLink>
        ) : d.recommended ? (
          <ButtonLink to={`/challenges/${d.recommended.slug}`} size="lg" icon={<Play className="h-4 w-4" />} data-testid="continue-practicing">
            Continue practicing
          </ButtonLink>
        ) : null}
      </header>

      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Target className="h-4 w-4 text-emerald-500" />} label="Challenges completed" value={<span data-testid="stat-completed">{d.totals.completed}</span>} sub={`of ${d.totals.totalQuestions}`} />
        <Stat icon={<Star className="h-4 w-4 text-amber-500" />} label="Stars earned" value={<span data-testid="stat-stars">{d.totals.stars}</span>} sub={`of ${d.totals.maxStars} possible`} />
        <Stat
          icon={<Zap className="h-4 w-4 text-indigo-500" />}
          label="Experience"
          value={<span data-testid="stat-xp">{d.totals.xp} XP</span>}
          sub={
            <div className="space-y-1">
              <ProgressBar value={d.totals.xp - lvl.currentLevelXp} max={lvl.nextLevelXp - lvl.currentLevelXp} label="Progress to next level" />
              <span>
                {lvl.nextLevelXp - d.totals.xp} XP to level {lvl.level + 1}
              </span>
            </div>
          }
        />
        <Stat icon={<Award className="h-4 w-4 text-violet-500" />} label="Average rating" value={d.totals.averageRating !== null ? `${d.totals.averageRating.toFixed(1)} / 5` : '—'} sub={`${d.totals.attempts} evaluations run`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-1" aria-labelledby="difficulty-progress">
          <SectionTitle id="difficulty-progress">Progress by difficulty</SectionTitle>
          <ul className="space-y-4">
            {(['easy', 'medium', 'hard'] as const).map((k) => {
              const p = d.byDifficulty[k];
              return (
                <li key={k}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <DifficultyBadge difficulty={k} />
                    <span className="text-xs text-slate-500">
                      {p.completed}/{p.total} · {p.stars}★
                    </span>
                  </div>
                  <ProgressBar value={p.completed} max={p.total || 1} label={`${k} challenges completed`} tone={DIFF_TONE[k]} />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-5 lg:col-span-2" aria-labelledby="next-up">
          <SectionTitle id="next-up">Next up</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {d.recommended ? (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Recommended</p>
                <p className="mt-1 flex items-center gap-2 font-semibold">
                  {d.recommended.title} <DifficultyBadge difficulty={d.recommended.difficulty} />
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{d.recommended.reason}</p>
                <ButtonLink to={`/challenges/${d.recommended.slug}`} size="sm" className="mt-3" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Open
                </ButtonLink>
              </div>
            ) : (
              <p className="text-sm text-slate-500">You have completed every challenge. Legendary!</p>
            )}
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <TrendingDown className="h-3.5 w-3.5" aria-hidden /> Topics to improve
              </p>
              {d.weakTopics.length ? (
                <ul className="mt-2 space-y-2">
                  {d.weakTopics.map((t) => (
                    <li key={t.key} className="text-sm">
                      <span className="font-medium">{t.label}</span> <span className="text-xs text-slate-500">· avg {t.averageScore}%</span>
                      <p className="text-xs text-slate-500">{TOPIC_ADVICE[t.key]}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">{d.totals.attempts ? 'No weak spots right now — keep it up!' : 'Evaluate a design to see which topics need practice.'}</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="recent-attempts">
          <SectionTitle id="recent-attempts">
            <span className="inline-flex items-center gap-2">
              <History className="h-4 w-4" aria-hidden /> Recent attempts
            </span>
          </SectionTitle>
          {d.recentAttempts.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {d.recentAttempts.map((a) => (
                <li key={a.id}>
                  <Link to={`/challenges/${a.slug}/attempts/${a.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{a.title}</span>
                      <span className="text-xs text-slate-500">
                        {formatRelative(a.createdAt)} {a.isFinal && <Badge tone="emerald">Final</Badge>}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Stars count={a.stars} />
                      <span className="w-8 text-right text-sm font-semibold tabular-nums">{a.score}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No evaluations yet. Build a design and press “Evaluate” to get feedback.</p>
          )}
        </section>

        <section className="card p-5" aria-labelledby="saved-drafts">
          <SectionTitle id="saved-drafts">
            <span className="inline-flex items-center gap-2">
              <FileClock className="h-4 w-4" aria-hidden /> Saved drafts
            </span>
          </SectionTitle>
          {d.drafts.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {d.drafts.map((dr) => (
                <li key={dr.questionId}>
                  <Link to={`/challenges/${dr.slug}/play`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{dr.title}</span>
                      <span className="text-xs text-slate-500">
                        {dr.components} components · saved {formatRelative(dr.updatedAt)}
                      </span>
                    </span>
                    <DifficultyBadge difficulty={dr.difficulty} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Drafts appear here automatically as you build.</p>
          )}
        </section>
      </div>

      <section className="card p-5" aria-labelledby="achievements">
        <SectionTitle id="achievements">
          <span className="inline-flex items-center gap-2">
            <Trophy className="h-4 w-4" aria-hidden /> Achievements
          </span>
        </SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(ach?.all ?? []).map((a) => {
            const has = earned.has(a.key);
            return (
              <li key={a.key} className={cn('flex gap-3 rounded-lg border p-3', has ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40' : 'border-slate-200 opacity-60 dark:border-slate-800')}>
                <DynamicIcon name={a.icon} className={cn('mt-0.5 h-5 w-5 shrink-0', has ? 'text-amber-600' : 'text-slate-400')} />
                <span>
                  <span className="block text-sm font-semibold">{a.title}</span>
                  <span className="block text-xs text-slate-500">{a.description}</span>
                  <span className="text-xs font-medium text-slate-400">{has ? 'Unlocked' : `+${a.xp} XP`}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
