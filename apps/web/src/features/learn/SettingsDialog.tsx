import { getComponent } from '@arch-arena/shared';
import { ExternalLink } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Dialog } from '@/components/ui/Dialog';
import { PageSpinner } from '@/components/ui/Spinner';
import { appPath } from '@/lib/env';
import { settingsGuidePath } from './settingsCatalog';

const SettingsDialogContent = lazy(() => import('./SettingsDialogContent'));

/**
 * Explains every setting of the selected component (or of a connection when no component type
 * is given) on top of the playground, highlighting the values currently chosen.
 */
export function SettingsDialog({
  componentType,
  values,
  open,
  onClose,
}: {
  componentType?: string;
  values: Record<string, unknown>;
  open: boolean;
  onClose: () => void;
}) {
  const label = componentType ? (getComponent(componentType)?.label ?? componentType) : null;
  const fullPage = componentType ? settingsGuidePath({ component: componentType }) : '/learn/settings#group-connections';
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={label ? `Settings explained: ${label}` : 'Connection settings explained'}
      description="What each setting means, what every option does, and what helps in challenges. Your current choices are highlighted."
      size="lg"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <LanguageToggle size="xs" />
        <a
          href={appPath(fullPage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Open configuration guide <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
      {open && (
        <Suspense fallback={<PageSpinner label="Loading explanations…" />}>
          <SettingsDialogContent componentType={componentType} values={values} />
        </Suspense>
      )}
    </Dialog>
  );
}
