import { useId, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Lightweight CSS tooltip shown on hover and keyboard focus.
 * The trigger is wrapped so it receives `aria-describedby` semantics through the wrapper.
 */
export function Tooltip({
  content,
  children,
  side = 'bottom',
  className,
}: {
  content: ReactNode;
  children: ReactElement;
  side?: 'top' | 'bottom' | 'right' | 'left';
  className?: string;
}) {
  const id = useId();
  const pos = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  }[side];
  return (
    <span className={cn('group/tt relative inline-flex', className)} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 w-max max-w-64 rounded-md bg-slate-900 px-2 py-1 text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity delay-300 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100 dark:bg-slate-700',
          pos,
        )}
      >
        {content}
      </span>
    </span>
  );
}
