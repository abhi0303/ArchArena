import { ArrowLeft, LayoutDashboard, PartyPopper, Zap } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { DynamicIcon } from '@/components/icons';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageSpinner } from '@/components/ui/Spinner';
import { Stars } from '@/components/ui/Stars';
import { errorMessage } from '@/lib/api';
import { useMe, useQuestion, useSubmission } from '@/lib/queries';
import { ReportDetails, ScoreHero } from './ReportView';
import { NextChallengeCard, RevealReferenceButton } from './shared';

export default function SubmissionResultPage() {
  const { slug, submissionId } = useParams();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: s, isLoading, error } = useSubmission(user ? submissionId : undefined);
  const { data: question } = useQuestion(slug);

  if (userLoading || (user && isLoading)) return <PageSpinner />;
  if (!s) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title="Submission not found" description={error ? errorMessage(error) : 'Sign in to view your submissions.'} action={<ButtonLink to="/dashboard">Go to dashboard</ButtonLink>} />
      </div>
    );
  }

  const improved = s.previousBestScore !== null && s.score > s.previousBestScore;
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/challenges" className="hover:underline">
          Challenges
        </Link>{' '}
        /{' '}
        <Link to={`/challenges/${slug}`} className="hover:underline">
          {question?.title ?? 'Challenge'}
        </Link>{' '}
        / Final result
      </nav>

      <section className="card overflow-hidden" aria-labelledby="final-title">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white sm:p-8">
          <p className="flex items-center gap-2 text-sm font-medium text-indigo-100">
            <PartyPopper className="h-4 w-4" aria-hidden /> Final submission recorded
          </p>
          <h1 id="final-title" className="mt-1 text-2xl font-bold sm:text-3xl">
            {s.completed ? `${question?.title ?? 'Challenge'} completed!` : 'Submission saved — not completed yet'}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-200">Stars earned</p>
              <Stars count={s.stars} size="lg" className="[&_svg]:text-amber-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-200">Score</p>
              <p className="text-3xl font-bold" data-testid="submission-score">
                {s.score}
                <span className="text-base text-indigo-200">/100</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-200">Rating</p>
              <p className="text-3xl font-bold">{s.rating.toFixed(1)}<span className="text-base text-indigo-200">/5</span></p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-200">XP gained</p>
              <p className="flex items-center gap-1 text-3xl font-bold" data-testid="xp-gained">
                <Zap className="h-6 w-6 text-amber-300" aria-hidden />+{s.xpAwarded}
              </p>
            </div>
          </div>
          {s.replayed && <p className="mt-3 text-xs text-indigo-100">This submission was already processed — no rewards were counted twice.</p>}
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">XP breakdown</h2>
            {s.rewards.length + s.achievements.length === 0 ? (
              <p className="text-sm text-slate-500">
                {s.completed
                  ? 'You already earned the rewards for this score level. Beat your best score to earn more.'
                  : `Reach at least 40/100 to complete the challenge and earn XP.`}
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {s.rewards.map((r) => (
                  <li key={r.reason} className="flex justify-between gap-3">
                    <span>{r.label}</span>
                    <span className="font-semibold tabular-nums text-emerald-600">+{r.amount}</span>
                  </li>
                ))}
                {s.achievements.map((a) => (
                  <li key={a.key} className="flex justify-between gap-3">
                    <span>Achievement: {a.title}</span>
                    <span className="font-semibold tabular-nums text-emerald-600">+{a.xp}</span>
                  </li>
                ))}
              </ul>
            )}
            {improved && <p className="mt-3 text-sm text-emerald-600">New personal best: {s.previousBestScore} → {s.score}</p>}
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">
              Level {s.user.level.level} · {s.user.level.title}
            </h2>
            <ProgressBar value={s.user.xp - s.user.level.currentLevelXp} max={s.user.level.nextLevelXp - s.user.level.currentLevelXp} label="Progress to next level" />
            <p className="mt-1 text-xs text-slate-500">
              {s.user.xp} XP · {s.user.level.nextLevelXp - s.user.xp} XP to level {s.user.level.level + 1}
            </p>
            {s.achievements.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold">Achievements unlocked</h3>
                <ul className="space-y-2">
                  {s.achievements.map((a) => (
                    <li key={a.key} className="flex items-center gap-3 rounded-lg bg-amber-50 p-2 dark:bg-amber-950/50">
                      <DynamicIcon name={a.icon} className="h-5 w-5 text-amber-600" />
                      <span className="text-sm">
                        <span className="font-semibold">{a.title}</span> — {a.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <ButtonLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
            Go to dashboard
          </ButtonLink>
          <ButtonLink to={`/challenges/${slug}/play`} variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
            Improve this design
          </ButtonLink>
          {slug && <RevealReferenceButton slug={slug} />}
        </div>
      </section>

      <ScoreHero report={s.report} />
      <ReportDetails report={s.report} question={question} />
      <NextChallengeCard currentId={s.questionId} />
    </div>
  );
}
