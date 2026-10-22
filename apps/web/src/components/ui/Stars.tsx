import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Stars({ count, max = 5, size = 'sm', className }: { count: number; max?: number; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const px = size === 'lg' ? 'h-8 w-8' : size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(px, i < count ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300 dark:text-slate-600')}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}
