import { COMPONENT_CATEGORIES, getComponent } from '@arch-arena/shared';
import { ArrowLeft, ArrowRight, ChevronRight, Swords } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { GUIDES, comparisonsFor, getGuide } from './content';
import { GuideView } from './GuideView';
import { ComponentTile, componentLabel } from './parts';
import { GlossarySkip } from '@/features/glossary/InlineText';
import { termIdsForComponent } from '@/features/glossary';

export default function ComponentGuidePage() {
  const { type = '' } = useParams();
  const guide = getGuide(type);
  const def = getComponent(type);
  const t = useExplanation();

  useEffect(() => {
    if (def) document.title = `${def.label} — Learn · HLD Arena`;
  }, [def]);

  if (!guide || !def) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Guide not found"
          description="This component does not have a guide yet."
          action={
            <ButtonLink to="/learn" variant="outline">
              Back to Learn
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const category = COMPONENT_CATEGORIES.find((c) => c.id === def.category);
  const index = GUIDES.findIndex((g) => g.type === type);
  const prev = GUIDES[index - 1];
  const next = GUIDES[index + 1];
  const comparisons = comparisonsFor(type);

  return (
    <article className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/learn" className="hover:text-slate-900 hover:underline dark:hover:text-white">
          Learn
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link to={`/learn?category=${def.category}`} className="hover:text-slate-900 hover:underline dark:hover:text-white">
          {category?.label}
        </Link>
      </nav>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <ComponentTile type={type} size="xl" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{def.label}</h1>
            <p className="mt-1 text-base text-slate-600 dark:text-slate-300 sm:text-lg">{t(guide.tagline)}</p>
          </div>
        </div>
        <div className="shrink-0">
          <LanguageToggle size="xs" />
        </div>
      </header>

      {comparisons.length > 0 && (
        <div className="mb-8 rounded-xl border border-fuchsia-200 bg-fuchsia-50/60 p-4 dark:border-fuchsia-900/60 dark:bg-fuchsia-950/20">
          <p className="mb-2 text-sm font-medium text-fuchsia-900 dark:text-fuchsia-200">Often mixed up — see the side-by-side comparisons:</p>
          <ul className="flex flex-wrap gap-2">
            {comparisons.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/learn/compare/${c.slug}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-medium text-fuchsia-800 ring-1 ring-fuchsia-200 hover:bg-fuchsia-100 dark:bg-slate-900 dark:text-fuchsia-200 dark:ring-fuchsia-900"
                >
                  {c.types.map(componentLabel).join(' vs ')}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <GlossarySkip ids={termIdsForComponent(type)}>
        <GuideView guide={guide} />
      </GlossarySkip>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold">Ready to use {def.label} in a real design?</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pick a challenge, drop it on the canvas and see how the evaluator judges it.</p>
        <ButtonLink to="/challenges" className="mt-4" icon={<Swords className="h-4 w-4" />}>
          Practice with challenges
        </ButtonLink>
      </div>

      <nav aria-label="More guides" className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/learn/${prev.type}`} className="card flex items-center gap-3 p-4 hover:shadow-md">
            <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <ComponentTile type={prev.type} size="sm" />
            <span className="min-w-0">
              <span className="block text-xs text-slate-500">Previous</span>
              <span className="block truncate font-medium">{componentLabel(prev.type)}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/learn/${next.type}`} className="card flex items-center justify-end gap-3 p-4 text-right hover:shadow-md">
            <span className="min-w-0">
              <span className="block text-xs text-slate-500">Next</span>
              <span className="block truncate font-medium">{componentLabel(next.type)}</span>
            </span>
            <ComponentTile type={next.type} size="sm" />
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          </Link>
        )}
      </nav>
    </article>
  );
}
