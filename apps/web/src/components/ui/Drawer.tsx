import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Slide-over panel used for the library and properties on small screens. */
export function Drawer({ open, onClose, side, label, children }: { open: boolean; onClose: () => void; side: 'left' | 'right'; label: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[1200] flex" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 animate-fade-in bg-slate-950/40" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'relative flex h-full w-[min(20rem,88vw)] animate-slide-up flex-col bg-white shadow-xl dark:bg-slate-950',
          side === 'right' ? 'ml-auto border-l border-slate-200 dark:border-slate-800' : 'border-r border-slate-200 dark:border-slate-800',
        )}
      >
        <button onClick={onClose} className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={`Close ${label}`}>
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
