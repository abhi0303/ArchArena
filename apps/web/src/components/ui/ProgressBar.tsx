import { cn } from '@/lib/cn';

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = 'indigo',
  className,
}: {
  value: number;
  max?: number;
  label: string;
  tone?: 'indigo' | 'emerald' | 'amber' | 'rose';
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = { indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' }[tone];
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function scoreTone(score: number): 'emerald' | 'indigo' | 'amber' | 'rose' {
  if (score >= 80) return 'emerald';
  if (score >= 55) return 'indigo';
  if (score >= 40) return 'amber';
  return 'rose';
}
