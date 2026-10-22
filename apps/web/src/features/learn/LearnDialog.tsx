import { getComponent } from '@arch-arena/shared';
import { ExternalLink } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Dialog } from '@/components/ui/Dialog';
import { PageSpinner } from '@/components/ui/Spinner';

const GuideDialogContent = lazy(() => import('./GuideDialogContent'));

/** Opens a component guide on top of the playground without leaving the canvas. */
export function LearnDialog({ type, open, onClose }: { type: string; open: boolean; onClose: () => void }) {
  const label = getComponent(type)?.label ?? type;
  return (
    <Dialog open={open} onClose={onClose} title={`Learn: ${label}`} size="lg">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <LanguageToggle size="xs" />
        <a
          href={`/learn/${type}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Open full page <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
      {open && (
        <Suspense fallback={<PageSpinner label="Loading guide…" />}>
          <GuideDialogContent type={type} />
        </Suspense>
      )}
    </Dialog>
  );
}
