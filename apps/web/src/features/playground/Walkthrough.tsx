import { CircleCheck, MousePointerClick, Send, ShieldCheck, Spline, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/stores/preferences';
import { useEditor } from './store';

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Add a component',
    body: 'Drag a component from the library onto the canvas — or simply click it. Try adding an Application Server.',
  },
  {
    icon: Spline,
    title: 'Connect components',
    body: 'Hover a component to see its connection dots. Drag from a dot to another component to show how requests flow. Arrows point from caller to callee.',
  },
  {
    icon: ShieldCheck,
    title: 'Validate your design',
    body: 'Click “Validate” in the toolbar for an instant check of missing pieces and broken connections. It never uses up an attempt.',
  },
  {
    icon: Send,
    title: 'Get feedback',
    body: 'When you are happy, “Evaluate” scores your design against the challenge rubric and explains every deduction. Improve and evaluate again as often as you like.',
  },
];

/** A short, skippable first-use tour that advances as the user actually performs each step. */
export function Walkthrough({ initialComponents }: { initialComponents: number }) {
  const done = usePreferences((s) => s.walkthroughDone);
  const setDone = usePreferences((s) => s.setWalkthroughDone);
  const [step, setStep] = useState(0);
  const components = useEditor((s) => s.nodes.filter((n) => n.type === 'component').length);
  const edges = useEditor((s) => s.edges.length);
  const lastAction = useEditor((s) => s.lastAction);

  useEffect(() => {
    if (step === 0 && components > initialComponents) setStep(1);
    else if (step === 1 && edges > 0 && lastAction === 'connect') setStep(2);
    else if (step === 2 && lastAction === 'validate') setStep(3);
  }, [step, components, edges, lastAction, initialComponents]);

  if (done) return null;
  const s = STEPS[step]!;
  const Icon = s.icon;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-[1100] flex justify-center px-3" role="dialog" aria-label="Getting started tour" aria-live="polite">
      <div className="pointer-events-auto w-full max-w-md animate-slide-up rounded-xl border border-indigo-200 bg-white p-4 shadow-xl dark:border-indigo-900 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="text-sm font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.body}</p>
          </div>
          <button className="rounded p-1 text-slate-400 hover:text-slate-600" onClick={() => setDone(true)} aria-label="Skip tour">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1" aria-hidden>
            {STEPS.map((_, i) => (
              <span key={i} className={cn('h-1.5 w-6 rounded-full', i <= step ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700')} />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" onClick={() => setDone(true)}>
              Skip tour
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="xs" variant="outline" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button size="xs" icon={<CircleCheck className="h-3.5 w-3.5" />} onClick={() => setDone(true)}>
                Got it
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
