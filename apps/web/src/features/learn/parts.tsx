import { getComponent } from '@arch-arena/shared';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ACCENTS, DynamicIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { learnIcon } from './icons';
import { InlineText } from '@/features/glossary/InlineText';

/** The coloured icon tile used for a catalog component. */
export function ComponentTile({ type, size = 'md', className }: { type: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const def = getComponent(type);
  const accent = ACCENTS[def?.accent ?? 'slate']!;
  const box = size === 'sm' ? 'h-7 w-7 rounded-md' : size === 'md' ? 'h-10 w-10 rounded-lg' : size === 'lg' ? 'h-12 w-12 rounded-xl' : 'h-16 w-16 rounded-2xl';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-5 w-5' : size === 'lg' ? 'h-6 w-6' : 'h-8 w-8';
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center ring-1', box, accent.bg, accent.ring, className)} aria-hidden>
      <DynamicIcon name={def?.icon ?? 'Box'} className={cn(icon, accent.icon)} />
    </span>
  );
}

export function ActorIcon({ name, className }: { name: string; className?: string }) {
  const Icon = learnIcon(name);
  return <Icon className={className} aria-hidden />;
}

export function componentLabel(type: string): string {
  return getComponent(type)?.label ?? type;
}

/** A link chip to another component's guide. */
export function ComponentChip({ type, className }: { type: string; className?: string }) {
  return (
    <Link
      to={`/learn/${type}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300',
        className,
      )}
    >
      <ComponentTile type={type} size="sm" className="h-5 w-5 rounded-full [&_svg]:h-3 [&_svg]:w-3" />
      {componentLabel(type)}
    </Link>
  );
}

export function LearnSection({ id, icon, title, children, className }: { id?: string; icon: ReactNode; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('scroll-mt-20', className)} aria-labelledby={id ? `${id}-title` : undefined}>
      <h2 id={id ? `${id}-title` : undefined} className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" aria-hidden>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Renders paragraphs separated by blank lines. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('space-y-3 leading-relaxed text-slate-700 dark:text-slate-300', className)}>
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i}>
          <InlineText text={p.trim()} />
        </p>
      ))}
    </div>
  );
}
