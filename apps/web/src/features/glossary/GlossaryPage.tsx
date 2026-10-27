import { ArrowRight, BookA, ChevronRight, Lightbulb, Search, SearchX } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { EmptyState } from '@/components/ui/misc';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { usePreferences } from '@/stores/preferences';
import { GLOSSARY, getTerm } from './index';
import { InlineText } from './InlineText';
import { useGlossary } from './store';
import type { GlossaryTerm } from './types';

const FILTERS = { q: '' };

function TermCard({ term }: { term: GlossaryTerm }) {
  const t = useExplanation();
  const open = useGlossary((s) => s.open);
  return (
    <article id={`term-${term.id}`} className="card scroll-mt-24 p-4" data-testid="glossary-card">
      <h3 className="font-semibold">{term.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <InlineText text={t(term.simple)} terms={false} />
      </p>
      {term.example && (
        <p className="mt-2 flex gap-2 rounded-lg bg-amber-50/80 p-2.5 text-sm leading-relaxed text-slate-700 dark:bg-amber-950/30 dark:text-slate-300">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
          <span>
            <InlineText text={t(term.example)} terms={false} />
          </span>
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {term.related?.map((id) => {
          const r = getTerm(id);
          return r ? (
            <button
              key={id}
              type="button"
              onClick={() => open(id)}
              className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
            >
              {r.title}
            </button>
          ) : null;
        })}
        {term.more && (
          <Link to={term.more} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Go deeper <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}

export default function GlossaryPage() {
  const t = useExplanation();
  const { hash } = useLocation();
  const [{ q }, setFilters] = useUrlFilters(FILTERS);
  const termHints = usePreferences((s) => s.termHints);
  const setTermHints = usePreferences((s) => s.setTermHints);

  useEffect(() => {
    document.title = 'Glossary — Learn · HLD Arena';
  }, []);

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    const frame = requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  const index = useMemo(() => new Map(GLOSSARY.map((g) => [g.id, [g.title, ...g.aliases, g.simple.en, g.simple.hi].join(' ').toLowerCase()])), []);
  const needle = q.trim().toLowerCase();
  // Best matches first: an exact name, then names starting with the search, then anything mentioning it.
  const rank = (g: GlossaryTerm) => {
    const names = [g.title, ...g.aliases].map((n) => n.toLowerCase());
    if (names.includes(needle)) return 0;
    if (names.some((n) => n.startsWith(needle) || n.includes(` ${needle}`))) return 1;
    return 2;
  };
  const terms = needle
    ? GLOSSARY.filter((g) => needle.split(/\s+/).every((w) => index.get(g.id)?.includes(w))).sort((a, b) => rank(a) - rank(b))
    : GLOSSARY;
  const groups = new Map<string, GlossaryTerm[]>();
  for (const term of terms) {
    const letter = needle ? 'Results' : /[a-z]/i.test(term.title[0] ?? '') ? term.title[0]!.toUpperCase() : '#';
    groups.set(letter, [...(groups.get(letter) ?? []), term]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/learn" className="hover:text-slate-900 hover:underline dark:hover:text-white">
          Learn
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-slate-700 dark:text-slate-200">Glossary</span>
      </nav>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <BookA className="h-3.5 w-3.5" aria-hidden /> Glossary
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Every term, in simple words</h1>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            {t({
              en: `${GLOSSARY.length} terms you will meet in the guides and interview answers, each with a simple meaning and a real-life example. In any explanation, words with a dotted underline open their meaning right there — no need to search elsewhere.`,
              hi: `${GLOSSARY.length} terms jo guides aur interview answers mein milenge, har ek simple matlab aur real-life example ke saath. Kisi bhi explanation mein dotted underline wale shabd pe tap karo, matlab wahin khul jaata hai — kahin aur search karne ki zaroorat nahi.`,
            })}
          </p>
        </div>
        <LanguageToggle size="xs" />
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block flex-1 sm:max-w-md">
          <span className="sr-only">Search terms</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" className="input pl-9" placeholder="Search: idempotent, JWT, backoff…" value={q} onChange={(e) => setFilters({ q: e.target.value })} data-testid="glossary-search" />
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600" checked={termHints} onChange={(e) => setTermHints(e.target.checked)} />
          Underline terms in explanations
        </label>
      </div>

      {terms.length === 0 ? (
        <EmptyState icon={<SearchX className="h-6 w-6" />} title="No matching terms" description="Try another word." />
      ) : (
        <div className="space-y-8">
          {[...groups.entries()].map(([letter, list]) => (
            <section key={letter} aria-labelledby={`letter-${letter}`}>
              <h2 id={`letter-${letter}`} className="mb-3 text-lg font-semibold text-slate-400">
                {letter}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((term) => (
                  <TermCard key={term.id} term={term} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
