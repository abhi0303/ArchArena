import { ArrowRight, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DifficultyBadge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useMe, useProgress, useQuestions } from '@/lib/queries';

/** Next unfinished challenge after the current one, in curriculum order. */
export function useNextChallenge(currentId: string | undefined) {
  const { data: questions } = useQuestions();
  const { data: user } = useMe();
  const { data: progress } = useProgress(!!user);
  if (!questions || !currentId) return null;
  const done = new Set((progress ?? []).filter((p) => p.status === 'completed').map((p) => p.questionId));
  const idx = questions.findIndex((q) => q.id === currentId);
  const ordered = [...questions.slice(idx + 1), ...questions.slice(0, idx)];
  return ordered.find((q) => !done.has(q.id) && q.id !== currentId) ?? null;
}

export function NextChallengeCard({ currentId }: { currentId: string | undefined }) {
  const next = useNextChallenge(currentId);
  if (!next) return null;
  return (
    <section className="card flex flex-wrap items-center justify-between gap-4 p-5" aria-label="Next recommended challenge">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next recommended challenge</p>
        <p className="mt-1 flex items-center gap-2 font-semibold">
          {next.title} <DifficultyBadge difficulty={next.difficulty} />
        </p>
        <p className="text-sm text-slate-500">
          {next.category} · ~{next.estimatedMinutes} min
        </p>
      </div>
      <ButtonLink to={`/challenges/${next.slug}`} variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
        Open challenge
      </ButtonLink>
    </section>
  );
}

export function RevealReferenceButton({ slug, variant = 'outline' }: { slug: string; variant?: 'outline' | 'secondary' }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <Button variant={variant} icon={<Eye className="h-4 w-4" />} onClick={() => setOpen(true)} data-testid="reveal-reference">
        Reveal reference architecture
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title="Reveal the reference architecture?"
        description="You will see one well-reasoned solution with explanations and trade-offs. Your own design stays untouched, and you can keep improving it afterwards."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Not yet
            </Button>
            <Button onClick={() => navigate(`/challenges/${slug}/reference`)}>Show reference</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">Tip: try one more improvement round first — learning sticks better when you find the gap yourself.</p>
      </Dialog>
    </>
  );
}
