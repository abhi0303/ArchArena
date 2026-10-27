import { COMPONENT_CATEGORIES, COMPONENTS, getComponent } from '@arch-arena/shared';
import { ArrowRight, ChevronRight, CircleCheck, CircleDashed, CircleDot, MousePointerClick, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { EmptyState } from '@/components/ui/misc';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { getSettingGuide } from './content/settings';
import { ComponentTile, componentLabel } from './parts';
import { SettingCard } from './SettingCard';
import { SETTING_FIELDS, getSettingField, settingAnchor, type SettingField } from './settingsCatalog';

/** Settings that make a component redundant (not a single point of failure) in the evaluator. */
const REDUNDANCY_KEYS = ['instances', 'availability', 'replication', 'replicationFactor', 'cacheReplication', 'deployment', 'ensembleSize', 'standby'];

const CONFIGURABLE = COMPONENTS.filter((c) => c.properties.length > 0);
const FILTERS = { q: '', component: '' };

function searchText(field: SettingField): string {
  const g = getSettingGuide(field.key, field.scope);
  const parts = [field.key, field.label, field.help, ...(field.options ?? []).map((o) => o.label), ...field.usedBy.map(componentLabel)];
  if (g) {
    for (const b of [g.what, g.why, g.example, g.inChallenges, ...(g.goodValues ? [g.goodValues] : []), ...Object.values(g.options ?? {})]) parts.push(b.en, b.hi);
  }
  return parts.join(' ').toLowerCase();
}

function Cards({ fields }: { fields: SettingField[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {fields.map((f) => (
        <SettingCard key={`${f.scope}-${f.key}`} field={f} guide={getSettingGuide(f.key, f.scope)} />
      ))}
    </div>
  );
}

export default function SettingsGuidePage() {
  const t = useExplanation();
  const location = useLocation();
  const [{ q, component: componentType }, setFilters] = useUrlFilters(FILTERS);
  const component = componentType ? getComponent(componentType) : undefined;

  useEffect(() => {
    document.title = component ? `${component.label} settings — Configuration guide · HLD Arena` : 'Configuration guide · HLD Arena';
  }, [component]);

  // Deep links such as /learn/settings#setting-replication: scroll once the cards are rendered.
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!el) return;
    const frame = requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [location.hash, componentType]);

  const index = useMemo(() => new Map(SETTING_FIELDS.flatMap(({ fields }) => fields).map((f) => [f, searchText(f)])), []);
  const needle = q.trim().toLowerCase();
  const matches = (f: SettingField) => !needle || needle.split(/\s+/).every((w) => index.get(f)?.includes(w));

  const componentFields = component ? component.properties.map((k) => getSettingField(k)).filter((f): f is SettingField => !!f) : [];
  const basic = componentFields.filter((f) => !f.advanced && matches(f));
  const advanced = componentFields.filter((f) => f.advanced && matches(f));
  const groups = SETTING_FIELDS.map(({ group, fields }) => ({ group, fields: fields.filter(matches) })).filter((g) => g.fields.length);
  const total = component ? basic.length + advanced.length : groups.reduce((n, g) => n + g.fields.length, 0);
  const allCount = SETTING_FIELDS.reduce((n, g) => n + g.fields.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/learn" className="hover:text-slate-900 hover:underline dark:hover:text-white">
          Learn
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-slate-700 dark:text-slate-200">Configuration guide</span>
      </nav>

      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden /> Configuration guide
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Every setting, explained simply</h1>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            {t({
              en: `When you click a component in the playground, the Properties panel shows settings such as “Availability”, “Consistency” or “Retry strategy”. This page explains all ${allCount} of them: what each one means, why it matters, a real-life example, the meaning of every option, and what helps in challenges.`,
              hi: `Playground mein component pe click karte hi Properties panel mein “Availability”, “Consistency” ya “Retry strategy” jaisi settings dikhti hain. Yeh page in sabhi ${allCount} settings ko samjhata hai: har ek ka matlab, woh kyun zaroori hai, ek real-life example, har option ka matlab, aur challenges mein kya kaam aata hai.`,
            })}
          </p>
        </div>
        <LanguageToggle size="xs" />
      </header>

      {!component && !needle && (
        <section aria-labelledby="how-title" className="mb-10">
          <h2 id="how-title" className="sr-only">
            How settings work
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="card p-4">
              <MousePointerClick className="mb-2 h-5 w-5 text-indigo-500" aria-hidden />
              <p className="font-semibold">Where to find them</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t({
                  en: 'Click a component on the canvas: its settings appear in the Properties panel (on phones, in the Properties drawer). Less common ones sit under “Advanced settings”. Click an arrow to see the connection settings.',
                  hi: 'Canvas pe component pe click karo: uski settings Properties panel mein dikhti hain (phone pe Properties drawer mein). Kam use hone wali settings “Advanced settings” ke andar hain. Connection settings dekhne ke liye arrow pe click karo.',
                })}
              </p>
            </div>
            <div className="card p-4">
              <CircleCheck className="mb-2 h-5 w-5 text-emerald-500" aria-hidden />
              <p className="font-semibold">How challenges score them</p>
              <ul className="mt-1 space-y-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <li className="flex gap-1.5">
                  <CircleCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
                  {t({ en: 'The option the requirement needs: full points.', hi: 'Requirement ko jo option chahiye: poore points.' })}
                </li>
                <li className="flex gap-1.5">
                  <CircleDot className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                  {t({ en: 'A different option: half points, and the feedback names the option it wanted.', hi: 'Koi aur option: aadhe points, aur feedback batata hai kaunsa option chahiye tha.' })}
                </li>
                <li className="flex gap-1.5">
                  <CircleDashed className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  {t({
                    en: '“Not set”: no points — the requirement shows “Needs configuration”. Settings a challenge does not check cost nothing either way.',
                    hi: '“Not set”: zero points — requirement pe “Needs configuration” dikhta hai. Jo setting challenge check nahi karta, use chhodne ka koi nuksaan nahi.',
                  })}
                </li>
              </ul>
            </div>
            <div className="card p-4">
              <SlidersHorizontal className="mb-2 h-5 w-5 text-fuchsia-500" aria-hidden />
              <p className="font-semibold">Settings that remove a single point of failure</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t({
                  en: '“High availability” checks look for any one of these on each important component:',
                  hi: '“High availability” checks har zaroori component pe inme se koi ek dhoondhte hain:',
                })}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {REDUNDANCY_KEYS.map((k) => (
                  <li key={k}>
                    <a
                      href={`#${settingAnchor(k)}`}
                      className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                    >
                      {getSettingField(k)?.label ?? k}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1 sm:max-w-md">
          <span className="sr-only">Search settings</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" className="input pl-9" placeholder="Search: timeout, replication, TTL…" value={q} onChange={(e) => setFilters({ q: e.target.value })} data-testid="settings-search" />
        </label>
        <label className="block sm:w-72">
          <span className="sr-only">Show the settings of one component</span>
          <select className="input" value={component ? componentType : ''} onChange={(e) => setFilters({ component: e.target.value })} data-testid="settings-component-filter">
            <option value="">All components</option>
            {COMPONENT_CATEGORIES.map((cat) => (
              <optgroup key={cat.id} label={cat.label}>
                {CONFIGURABLE.filter((c) => c.category === cat.id).map((c) => (
                  <option key={c.type} value={c.type}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      {!component && !needle && (
        <nav aria-label="Setting groups" className="scrollbar-thin -mx-4 mb-8 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {SETTING_FIELDS.map(({ group, fields }) => (
            <a
              key={group.id}
              href={`#group-${group.id}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
            >
              <group.icon className="h-3.5 w-3.5" aria-hidden />
              {group.title}
              <span className="text-xs text-slate-400">{fields.length}</span>
            </a>
          ))}
        </nav>
      )}

      {component && (
        <div className="mb-8 flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-indigo-900/60 dark:bg-indigo-950/20" data-testid="settings-component-banner">
          <div className="flex items-start gap-3">
            <ComponentTile type={component.type} />
            <div>
              <p className="font-semibold">Settings of {component.label}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t({
                  en: 'In the same order as the Properties panel: main settings first, then the ones under “Advanced settings”.',
                  hi: 'Properties panel wale order mein hi: pehle main settings, phir “Advanced settings” ke andar wali.',
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/learn/${component.type}`} className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100 dark:bg-slate-900 dark:text-indigo-300 dark:ring-indigo-900">
              {component.label} guide <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setFilters({ component: '' })}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <X className="h-3.5 w-3.5" aria-hidden /> All settings
            </button>
          </div>
        </div>
      )}

      {total === 0 ? (
        <EmptyState icon={<SearchX className="h-6 w-6" />} title="No matching settings" description="Try another word, or clear the component filter." />
      ) : component ? (
        <div className="space-y-10">
          {basic.length > 0 && (
            <section aria-labelledby="main-settings-title">
              <h2 id="main-settings-title" className="mb-3 text-lg font-semibold">
                Main settings <span className="text-sm font-normal text-slate-500">({basic.length})</span>
              </h2>
              <Cards fields={basic} />
            </section>
          )}
          {advanced.length > 0 && (
            <section aria-labelledby="advanced-settings-title">
              <h2 id="advanced-settings-title" className="mb-3 text-lg font-semibold">
                Advanced settings <span className="text-sm font-normal text-slate-500">({advanced.length})</span>
              </h2>
              <Cards fields={advanced} />
            </section>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The arrows have settings too —{' '}
            <Link to="/learn/settings#group-connections" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              see the connection settings
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map(({ group, fields }) => (
            <section key={group.id} id={`group-${group.id}`} className="scroll-mt-20" aria-labelledby={`group-${group.id}-title`} data-testid="settings-group">
              <h2 id={`group-${group.id}-title`} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" aria-hidden>
                  <group.icon className="h-4 w-4" />
                </span>
                {group.title}
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-slate-400">{t(group.intro)}</p>
              <Cards fields={fields} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
