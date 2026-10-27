import { COMPONENT_CATEGORIES, getComponent, type ComponentCategoryId } from '@arch-arena/shared';
import { ArrowRight, BookA, ChevronRight, GraduationCap, Route, Search, SearchX, SlidersHorizontal, Split } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { EmptyState } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { COMPARISONS, GUIDES, LEARNING_PATH } from './content';
import { ComponentTile, componentLabel } from './parts';

const FILTERS = { q: '', category: 'all' };

export default function LearnPage() {
  const t = useExplanation();
  const [filters, setFilters] = useUrlFilters(FILTERS);
  const q = filters.q;
  const category = filters.category as 'all' | ComponentCategoryId;

  useEffect(() => {
    document.title = 'Learn the building blocks · HLD Arena';
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUIDES.filter((g) => {
      const def = getComponent(g.type);
      if (!def) return false;
      if (category !== 'all' && def.category !== category) return false;
      if (!needle) return true;
      return [def.label, def.description, g.tagline.en, g.tagline.hi, ...def.tags].join(' ').toLowerCase().includes(needle);
    });
  }, [q, category]);

  const filtering = q.trim() !== '' || category !== 'all';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden /> Learn
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Understand every building block</h1>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            {t({
              en: 'Each guide explains a component in plain words: the problem it solves, what life looked like before it, a real-life analogy, the situation where it fits perfectly, and how it differs from the components people confuse it with.',
              hi: 'Har guide ek component ko simple shabdon mein samjhati hai: woh kaunsi problem solve karta hai, uske bina zindagi kaisi thi, ek real-life analogy, woh situation jahan woh bilkul perfect baithta hai, aur woh un components se kaise alag hai jinse log use confuse karte hain.',
            })}
          </p>
        </div>
        <LanguageToggle size="xs" />
      </header>

      <div className="mb-10 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Link
          to="/learn/settings"
          className="group flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 hover:shadow-md sm:flex-row sm:items-center dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-slate-900"
          data-testid="configuration-guide-link"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm" aria-hidden>
            <SlidersHorizontal className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold">Configuration guide</span>
            <span className="mt-0.5 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t({
                en: 'Confused by settings like “Availability”, “Consistency” or “Retry strategy” in the Properties panel? Every setting of every component — and every option — explained simply, with real-life examples and tips for challenges.',
                hi: 'Properties panel mein “Availability”, “Consistency” ya “Retry strategy” jaisi settings samajh nahi aa rahi? Har component ki har setting — aur har option — simple tareeke se, real-life examples aur challenges ke tips ke saath.',
              })}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white group-hover:bg-emerald-700 sm:self-center">
            Open guide <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
        <Link
          to="/learn/glossary"
          className="group flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 hover:shadow-md dark:border-indigo-900/60 dark:from-indigo-950/40 dark:to-slate-900"
          data-testid="glossary-link"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm" aria-hidden>
              <BookA className="h-6 w-6" />
            </span>
            <span className="text-lg font-semibold">Glossary</span>
          </span>
          <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t({
              en: 'Every technical term in simple words. Tip: tap any word with a dotted underline to see its meaning right there.',
              hi: 'Har technical term simple shabdon mein. Tip: dotted underline wale kisi bhi shabd pe tap karo, matlab wahin dikh jaayega.',
            })}
          </span>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            Browse terms <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      </div>

      {!filtering && (
        <>
          <section aria-labelledby="path-title" className="mb-10">
            <h2 id="path-title" className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <Route className="h-5 w-5 text-indigo-500" aria-hidden /> Start here: follow one request
            </h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {t({
                en: 'New to system design? Read these ten guides in order — they follow a single request from the user’s screen to the database and back.',
                hi: 'System design mein naye ho? Yeh das guides order mein padho — yeh ek request ko user ki screen se database tak aur wapas follow karti hain.',
              })}
            </p>
            <ol className="scrollbar-thin -mx-4 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:px-0" data-testid="learning-path">
              {LEARNING_PATH.map((s, i) => (
                <li key={s.type} className="flex shrink-0 snap-start items-center gap-3">
                  <Link to={`/learn/${s.type}`} className="card flex w-44 flex-col gap-2 p-3 hover:shadow-md">
                    <span className="flex items-center justify-between">
                      <ComponentTile type={s.type} size="md" />
                      <span className="text-xs font-semibold text-slate-400">Step {i + 1}</span>
                    </span>
                    <span className="font-semibold leading-tight">{componentLabel(s.type)}</span>
                    <span className="text-xs leading-snug text-slate-500 dark:text-slate-400">{t(s.step)}</span>
                  </Link>
                  {i < LEARNING_PATH.length - 1 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="confused-title" className="mb-10">
            <h2 id="confused-title" className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <Split className="h-5 w-5 text-fuchsia-500" aria-hidden /> Commonly confused
            </h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {t({
                en: 'These components look alike at first glance. Each comparison shows the one or two features that make them different — with a story, a table and a quick quiz.',
                hi: 'Yeh components pehli nazar mein ek jaise lagte hain. Har comparison woh ek-do features dikhata hai jo inhe alag banate hain — ek kahani, ek table aur ek chhote quiz ke saath.',
              })}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="comparison-list">
              {COMPARISONS.map((c) => (
                <li key={c.slug}>
                  <Link to={`/learn/compare/${c.slug}`} className="card group flex h-full flex-col p-4 hover:shadow-md">
                    <span className="mb-3 flex -space-x-2">
                      {c.types.map((type) => (
                        <ComponentTile key={type} type={type} size="md" className="ring-2 ring-white dark:ring-slate-900" />
                      ))}
                    </span>
                    <span className="font-semibold leading-snug">{c.types.map(componentLabel).join(' vs ')}</span>
                    <span className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{t(c.rule)}</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
                      Compare <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section aria-labelledby="all-title">
        <h2 id="all-title" className="mb-3 text-lg font-semibold">
          All component guides <span className="text-sm font-normal text-slate-500">({GUIDES.length})</span>
        </h2>
        <div className="mb-5 flex flex-col gap-3">
          <label className="relative block max-w-md">
            <span className="sr-only">Search components</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              className="input pl-9"
              placeholder="Search: cache, queue, login…"
              value={q}
              onChange={(e) => setFilters({ q: e.target.value })}
            />
          </label>
          <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
            {[{ id: 'all', label: 'All' }, ...COMPONENT_CATEGORIES].map((c) => (
              <button
                key={c.id}
                onClick={() => setFilters({ category: c.id })}
                aria-pressed={category === c.id}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-sm font-medium',
                  category === c.id
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<SearchX className="h-6 w-6" />} title="No matching components" description="Try a different word, or clear the category filter." />
        ) : (
          <div className="space-y-8">
            {COMPONENT_CATEGORIES.filter((cat) => filtered.some((g) => getComponent(g.type)?.category === cat.id)).map((cat) => (
              <div key={cat.id}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{cat.label}</h3>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="guide-list">
                  {filtered
                    .filter((g) => getComponent(g.type)?.category === cat.id)
                    .map((g) => (
                      <li key={g.type}>
                        <Link to={`/learn/${g.type}`} className="card flex h-full items-start gap-3 p-4 hover:shadow-md">
                          <ComponentTile type={g.type} />
                          <span className="min-w-0">
                            <span className="block font-semibold leading-snug">{componentLabel(g.type)}</span>
                            <span className="mt-0.5 line-clamp-2 block text-sm text-slate-500 dark:text-slate-400">{t(g.tagline)}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
