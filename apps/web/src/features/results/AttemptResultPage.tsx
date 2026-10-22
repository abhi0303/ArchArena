import { ArrowLeft, Flag, PencilRuler } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { PageSpinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/lib/api';
import { formatRelative } from '@/lib/cn';
import { useAttempt, useFinalSubmit, useMe, useQuestion } from '@/lib/queries';
import { toast } from '@/stores/toast';
import { Comparison, ReportDetails, ScoreHero } from './ReportView';
import { NextChallengeCard, RevealReferenceButton } from './shared';

const DiagramViewer = lazy(() => import('@/components/DiagramViewer'));

export default function AttemptResultPage() {
  const { slug, attemptId } = useParams();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: attempt, isLoading, error } = useAttempt(user ? attemptId : undefined);
  const { data: question } = useQuestion(slug);
  const [confirm, setConfirm] = useState(false);
  const submit = useFinalSubmit();
  const key = useRef(crypto.randomUUID());
  const navigate = useNavigate();

  if (userLoading || (user && isLoading)) return <PageSpinner />;
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title="Sign in to see your results" action={<ButtonLink to={`/login?redirect=/challenges/${slug}/attempts/${attemptId}`}>Sign in</ButtonLink>} />
      </div>
    );
  }
  if (!attempt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title="Attempt not found" description={error ? errorMessage(error) : undefined} action={<ButtonLink to={`/challenges/${slug}`}>Back to challenge</ButtonLink>} />
      </div>
    );
  }

  const finalSubmit = async () => {
    try {
      const r = await submit.mutateAsync({ attemptId: attempt.id, idempotencyKey: key.current });
      navigate(`/challenges/${slug}/submissions/${r.submissionId}`);
    } catch (err) {
      toast.error('Final submission failed', errorMessage(err));
    }
  };

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
        / Evaluation
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{question?.title ?? 'Evaluation result'}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            Evaluated {formatRelative(attempt.createdAt)}
            {attempt.isFinal ? <Badge tone="emerald">Final submission</Badge> : <Badge tone="violet">Evaluated attempt</Badge>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to={`/challenges/${slug}/play`} icon={<ArrowLeft className="h-4 w-4" />} variant="outline">
            Back to playground
          </ButtonLink>
          {!attempt.isFinal && (
            <Button variant="success" icon={<Flag className="h-4 w-4" />} onClick={() => setConfirm(true)}>
              Make this my final submission
            </Button>
          )}
        </div>
      </div>

      <ScoreHero report={attempt.report}>
        {!attempt.isFinal && (
          <p className="text-xs text-slate-500">
            These stars show what this design would earn. Stars and XP are awarded only when you make a final submission.
          </p>
        )}
      </ScoreHero>

      <Comparison attempt={attempt} />
      <ReportDetails report={attempt.report} question={question} />

      <section className="card overflow-hidden" aria-labelledby="your-design">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 id="your-design" className="flex items-center gap-2 text-sm font-semibold">
            <PencilRuler className="h-4 w-4" aria-hidden /> Your evaluated design
          </h2>
          {slug && <RevealReferenceButton slug={slug} />}
        </div>
        <Suspense fallback={<Skeleton className="h-80 w-full rounded-none" />}>
          <DiagramViewer diagram={attempt.diagram} label="Your evaluated design" className="h-96 w-full" />
        </Suspense>
      </section>

      <NextChallengeCard currentId={attempt.questionId} />

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Make this your final submission?"
        description={`Score ${attempt.report.score}/100 · ${attempt.report.stars} star${attempt.report.stars === 1 ? '' : 's'}. You can still improve and submit again later; rewards are never counted twice.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button variant="success" loading={submit.isPending} onClick={() => void finalSubmit()}>
              Confirm final submission
            </Button>
          </>
        }
      >
        {attempt.report.criticalFailures.length > 0 ? (
          <p className="text-sm text-rose-600">Critical gaps remain: {attempt.report.criticalFailures.map((c) => c.title).join('; ')}.</p>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">No critical warnings remain for this design.</p>
        )}
      </Dialog>
    </div>
  );
}
