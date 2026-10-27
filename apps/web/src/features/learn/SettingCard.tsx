import { Link2, Lightbulb, ListChecks, Target, TriangleAlert, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useExplanation } from '@/components/LanguageToggle';
import { cn } from '@/lib/cn';
import { ComponentChip } from './parts';
import { settingAnchor, type SettingField } from './settingsCatalog';
import type { SettingGuide } from './types';

const TYPE_LABEL: Record<SettingField['type'], string> = { select: 'Pick one option', boolean: 'On / off switch', text: 'Free text' };

/** Value as the Properties panel stores it → option key used by the explanations. */
function currentOption(field: SettingField, current: unknown): string | undefined {
  if (field.type === 'boolean') return current === true ? 'true' : 'false';
  if (current === undefined || current === '') return undefined;
  return String(current);
}

function currentLabel(field: SettingField, current: unknown): string {
  if (field.type === 'boolean') return current === true ? 'On' : 'Off';
  if (current === undefined || current === '') return 'Not set';
  return field.options?.find((o) => o.value === String(current))?.label ?? String(current);
}

function Block({ icon, title, children, tone = 'plain' }: { icon: React.ReactNode; title: string; children: React.ReactNode; tone?: 'plain' | 'amber' | 'indigo' }) {
  return (
    <div
      className={cn(
        tone === 'amber' && 'rounded-lg bg-amber-50 p-3 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:ring-amber-900/60',
        tone === 'indigo' && 'rounded-lg bg-indigo-50 p-3 ring-1 ring-indigo-200 dark:bg-indigo-950/30 dark:ring-indigo-900/60',
      )}
    >
      <p
        className={cn(
          'mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide',
          tone === 'amber' ? 'text-amber-800 dark:text-amber-300' : tone === 'indigo' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400',
        )}
      >
        {icon}
        {title}
      </p>
      <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  );
}

/**
 * One setting explained: what it means, why it matters, a real-life example, the meaning of
 * every option and what helps in challenges. `current` highlights the value chosen on the canvas.
 */
export function SettingCard({
  field,
  guide,
  current,
  showCurrent = false,
  compact = false,
}: {
  field: SettingField;
  guide: SettingGuide | undefined;
  current?: unknown;
  /** Show the value currently chosen in the playground. */
  showCurrent?: boolean;
  /** Inside a dialog: links open in a new tab and “Used by” is hidden. */
  compact?: boolean;
}) {
  const t = useExplanation();
  const [allUsers, setAllUsers] = useState(false);
  const anchor = settingAnchor(field.key, field.scope);
  const chosen = showCurrent ? currentOption(field, current) : undefined;
  const options =
    field.type === 'boolean'
      ? [
          { value: 'true', label: 'On (ticked)' },
          { value: 'false', label: 'Off (not ticked)' },
        ]
      : (field.options ?? []);
  const users = allUsers ? field.usedBy : field.usedBy.slice(0, 8);

  return (
    <article id={anchor} className="card scroll-mt-24 p-4 sm:p-5" data-testid={`setting-card-${anchor}`}>
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold leading-snug">
            {field.label}
            {field.advanced && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">Advanced</span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{TYPE_LABEL[field.type]}</p>
        </div>
        <div className="flex items-center gap-2">
          {showCurrent && (
            <span
              className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900"
              data-testid="setting-current"
            >
              Your choice: {currentLabel(field, current)}
            </span>
          )}
          {!compact && (
            <a href={`#${anchor}`} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label={`Link to ${field.label}`}>
              <Link2 className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </header>

      {!guide ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">{field.help}</p>
      ) : (
        <div className="space-y-4">
          <Block icon={<Wand2 className="h-3.5 w-3.5" aria-hidden />} title="What it means">
            {t(guide.what)}
          </Block>
          <Block icon={<TriangleAlert className="h-3.5 w-3.5" aria-hidden />} title="Why it matters">
            {t(guide.why)}
          </Block>
          <Block icon={<Lightbulb className="h-3.5 w-3.5" aria-hidden />} title="Real-life example" tone="amber">
            {t(guide.example)}
          </Block>

          {options.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <ListChecks className="h-3.5 w-3.5" aria-hidden /> {field.type === 'boolean' ? 'On or off' : `The ${options.length} options`}
              </p>
              <ul className="space-y-2">
                {options.map((o) => {
                  const meaning = guide.options?.[o.value];
                  const isChosen = chosen === o.value;
                  return (
                    <li
                      key={o.value}
                      className={cn(
                        'rounded-lg border p-3 text-sm leading-relaxed',
                        isChosen ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800',
                      )}
                      data-testid={`setting-option-${o.value}`}
                    >
                      <p className="mb-0.5 flex flex-wrap items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                        {o.label}
                        {isChosen && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Selected</span>}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">{meaning ? t(meaning).replace(/^(On|Off):\s*/, '') : ''}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {guide.goodValues && (
            <Block icon={<ListChecks className="h-3.5 w-3.5" aria-hidden />} title="Good values to type">
              {t(guide.goodValues)}
            </Block>
          )}

          <Block icon={<Target className="h-3.5 w-3.5" aria-hidden />} title="In challenges" tone="indigo">
            {t(guide.inChallenges)}
          </Block>
        </div>
      )}

      {!compact && field.usedBy.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Found on {field.usedBy.length} component{field.usedBy.length === 1 ? '' : 's'}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {users.map((type) => (
              <li key={type}>
                <ComponentChip type={type} />
              </li>
            ))}
            {field.usedBy.length > users.length && (
              <li>
                <button type="button" onClick={() => setAllUsers(true)} className="rounded-full px-2.5 py-0.5 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  +{field.usedBy.length - users.length} more
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </article>
  );
}
