import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useToasts, type Toast } from '@/stores/toast';

const ICONS = { success: CircleCheck, error: CircleX, info: Info, warning: TriangleAlert };
const COLORS = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-indigo-500',
  warning: 'text-amber-500',
};

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useToasts((s) => s.dismiss);
  useEffect(() => {
    if (t.duration <= 0) return;
    const timer = setTimeout(() => dismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t, dismiss]);
  const Icon = ICONS[t.tone];
  return (
    <div className="pointer-events-auto flex w-full animate-slide-up items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', COLORS[t.tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{t.title}</p>
        {t.description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t.description}</p>}
        {t.action && (
          <button
            className="mt-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            onClick={() => {
              t.action!.onClick();
              dismiss(t.id);
            }}
          >
            {t.action.label}
          </button>
        )}
      </div>
      <button onClick={() => dismiss(t.id)} className="rounded p-0.5 text-slate-400 hover:text-slate-600" aria-label="Dismiss notification">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-0 z-[1400] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end">
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}
