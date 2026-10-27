import { ArrowRight, BookA, Lightbulb } from 'lucide-react';
import { Link } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { Dialog } from '@/components/ui/Dialog';
import { getTerm } from './index';
import { InlineText } from './InlineText';
import { useGlossary } from './store';

/** The “what does this term mean?” popup. Mounted once at the app root. */
export default function GlossaryDialog() {
  const openId = useGlossary((s) => s.openId);
  const open = useGlossary((s) => s.open);
  const close = useGlossary((s) => s.close);
  const t = useExplanation();
  const term = openId ? getTerm(openId) : undefined;

  return (
    <Dialog open={!!term} onClose={close} title={term?.title ?? ''} size="sm">
      {term && (
        <div className="space-y-4" data-testid="glossary-dialog">
          <LanguageToggle size="xs" />
          <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200" data-testid="glossary-meaning">
            <InlineText text={t(term.simple)} terms={false} />
          </p>
          {term.example && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden /> {t({ en: 'Real-life example', hi: 'Asli zindagi ka example' })}
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <InlineText text={t(term.example)} terms={false} />
              </p>
            </div>
          )}
          {term.related && term.related.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{t({ en: 'Related terms', hi: 'Judi hui terms' })}</p>
              <ul className="flex flex-wrap gap-1.5">
                {term.related.map((id) => {
                  const r = getTerm(id);
                  if (!r) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => open(id)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                        data-testid="glossary-related"
                      >
                        {r.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
            {term.more ? (
              <Link to={term.more} onClick={close} className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                {term.more.startsWith('/prep/') ? 'Read the full interview answer' : 'Open the full guide'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : (
              <span />
            )}
            <Link to={`/learn/glossary#term-${term.id}`} onClick={close} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-slate-200">
              <BookA className="h-3.5 w-3.5" aria-hidden /> All terms
            </Link>
          </div>
        </div>
      )}
    </Dialog>
  );
}
