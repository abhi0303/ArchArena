import type { Difficulty, ProgressStatus } from '@arch-arena/shared';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';

const tones: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900',
};

export function Badge({ tone = 'slate', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone], className)}>{children}</span>;
}

const DIFFICULTY_TONE: Record<Difficulty, Tone> = { easy: 'emerald', medium: 'amber', hard: 'rose' };
const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <Badge tone={DIFFICULTY_TONE[difficulty]} className={className}>
      {DIFFICULTY_LABEL[difficulty]}
    </Badge>
  );
}

const STATUS: Record<ProgressStatus, { label: string; tone: Tone }> = {
  not_started: { label: 'Not started', tone: 'slate' },
  in_progress: { label: 'Draft', tone: 'sky' },
  evaluated: { label: 'Evaluated', tone: 'violet' },
  completed: { label: 'Completed', tone: 'emerald' },
};

export function StatusBadge({ status }: { status: ProgressStatus }) {
  const s = STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export const difficultyLabel = (d: Difficulty) => DIFFICULTY_LABEL[d];
