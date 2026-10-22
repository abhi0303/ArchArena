import {
  GAMIFICATION,
  hashDiagram,
  validateDesign,
  type AttemptDTO,
  type AttemptSummaryDTO,
  type EvaluationInput,
  type QuestionDetailDTO,
  type ValidationResult,
} from '@arch-arena/shared';
import { CircleCheck, Flag, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { Stars } from '@/components/ui/Stars';
import { api, errorMessage } from '@/lib/api';
import { queryClient, qk, useEvaluate, useFinalSubmit } from '@/lib/queries';
import { useEditor } from './store';

type Step = 'saving' | 'validating' | 'evaluating' | 'review' | 'submitting' | 'error';

const STEP_LABEL: Record<Step, string> = {
  saving: 'Saving your latest diagram…',
  validating: 'Running validation…',
  evaluating: 'Evaluating your design…',
  review: '',
  submitting: 'Submitting…',
  error: '',
};

export function FinalSubmitDialog({
  open,
  onClose,
  question,
  input,
  flush,
}: {
  open: boolean;
  onClose: () => void;
  question: QuestionDetailDTO;
  input: EvaluationInput;
  flush: () => Promise<void>;
}) {
  const [step, setStep] = useState<Step>('saving');
  const [attempt, setAttempt] = useState<AttemptDTO | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useRef<string>('');
  const evaluate = useEvaluate();
  const submit = useFinalSubmit();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    idempotencyKey.current = crypto.randomUUID();
    setAttempt(null);
    setError(null);
    (async () => {
      try {
        setStep('saving');
        await flush();
        setStep('validating');
        const snapshot = useEditor.getState().snapshot();
        setValidation(validateDesign(snapshot, input));
        const hash = hashDiagram(snapshot);
        const attempts = await queryClient.fetchQuery({
          queryKey: qk.attempts(question.id),
          queryFn: () => api<{ attempts: AttemptSummaryDTO[] }>(`/attempts?questionId=${encodeURIComponent(question.id)}`).then((r) => r.attempts),
          staleTime: 0,
        });
        const existing = attempts.find((a) => a.diagramHash === hash && !a.isFinal);
        let result: AttemptDTO;
        if (existing) {
          result = await queryClient.fetchQuery({
            queryKey: qk.attempt(existing.id),
            queryFn: () => api<{ attempt: AttemptDTO }>(`/attempts/${existing.id}`).then((r) => r.attempt),
          });
        } else {
          setStep('evaluating');
          result = await evaluate.mutateAsync({ questionId: question.id, diagram: snapshot });
        }
        if (cancelled) return;
        setAttempt(result);
        setStep('review');
      } catch (err) {
        if (cancelled) return;
        setError(errorMessage(err));
        setStep('error');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const confirm = async () => {
    if (!attempt) return;
    setStep('submitting');
    try {
      const result = await submit.mutateAsync({ attemptId: attempt.id, idempotencyKey: idempotencyKey.current });
      onClose();
      navigate(`/challenges/${question.slug}/submissions/${result.submissionId}`);
    } catch (err) {
      setError(errorMessage(err));
      setStep('error');
    }
  };

  const report = attempt?.report;
  const willComplete = (report?.score ?? 0) >= GAMIFICATION.completionMinScore;
  const criticalWarnings = [
    ...(report?.criticalFailures.map((c) => `${c.title}: ${c.message}`) ?? []),
    ...(validation?.issues.filter((i) => i.severity === 'error').map((i) => `${i.title}: ${i.message}`) ?? []),
  ];
  const busy = step !== 'review' && step !== 'error';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!busy || step === 'validating'}
      title="Final submission"
      description="Your final submission is recorded and earns stars and XP. You can keep improving and submit again later — rewards are never counted twice."
      footer={
        step === 'review' || step === 'submitting' ? (
          <>
            <Button variant="outline" onClick={onClose} disabled={step === 'submitting'}>
              Keep improving
            </Button>
            <Button variant="success" icon={<Flag className="h-4 w-4" />} loading={step === 'submitting'} onClick={() => void confirm()} data-testid="confirm-final-submit">
              Confirm final submission
            </Button>
          </>
        ) : step === 'error' ? (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        ) : null
      }
    >
      {busy && step !== 'submitting' && (
        <div className="flex items-center gap-3 py-6 text-sm text-slate-600 dark:text-slate-300" role="status">
          <Spinner className="h-5 w-5 text-indigo-500" /> {STEP_LABEL[step]}
        </div>
      )}
      {step === 'error' && <p className="py-4 text-sm text-rose-600">{error}</p>}
      {report && (step === 'review' || step === 'submitting') && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Current score</p>
              <p className="text-3xl font-bold" data-testid="final-score">
                {report.score}
                <span className="text-base font-medium text-slate-400">/100</span>
              </p>
            </div>
            <div>
              <Stars count={report.stars} size="md" />
              <p className="mt-1 text-xs text-slate-500">
                Rating {report.rating.toFixed(1)}/5 · {report.ratingLabel}
              </p>
            </div>
          </div>
          {!willComplete && (
            <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Scores below {GAMIFICATION.completionMinScore} are recorded but do not complete the challenge or earn XP. Consider improving first.
            </p>
          )}
          {criticalWarnings.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-semibold">Remaining critical warnings</p>
              <ul className="space-y-1.5">
                {criticalWarnings.slice(0, 6).map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CircleCheck className="h-4 w-4" aria-hidden /> No critical warnings remain.
            </p>
          )}
          <p className="text-xs text-slate-500">
            {report.coverage.met} of {report.coverage.total} requirements fully covered. This score comes from the server’s evaluation of exactly the diagram you see.
          </p>
        </div>
      )}
    </Dialog>
  );
}
