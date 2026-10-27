import { Fragment, useMemo, type ReactNode } from 'react';
import { usePreferences } from '@/stores/preferences';
import { GlossarySkipContext, useGlossarySkip } from './context';
import { splitTerms } from './index';
import { useGlossary } from './store';

/** A glossary term inside text: dotted underline; opens the explanation popup. */
export function TermButton({ id, children }: { id: string; children: ReactNode }) {
  const open = useGlossary((s) => s.open);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        open(id);
      }}
      className="cursor-help rounded-sm text-left underline decoration-indigo-400/80 decoration-dotted decoration-2 underline-offset-[3px] hover:bg-indigo-50 hover:decoration-indigo-600 focus-visible:bg-indigo-50 dark:decoration-indigo-400/70 dark:hover:bg-indigo-950/60 dark:focus-visible:bg-indigo-950/60"
      aria-haspopup="dialog"
      title="What does this mean?"
      data-testid="glossary-term"
      data-term={id}
    >
      {children}
    </button>
  );
}

/**
 * Renders text with **bold**, `inline code` and — unless turned off — glossary terms linked to
 * their explanation. Each term is linked once per text block.
 */
export function InlineText({ text, terms = true }: { text: string; terms?: boolean }) {
  const enabled = usePreferences((s) => s.termHints);
  const skip = useGlossarySkip();
  const link = terms && enabled;
  const seen = new Set<string>();

  const linkify = (s: string, key: string): ReactNode => {
    if (!link) return s;
    return splitTerms(s, skip, seen).map((piece, i) =>
      typeof piece === 'string' ? (
        <Fragment key={`${key}-${i}`}>{piece}</Fragment>
      ) : (
        <TermButton key={`${key}-${i}`} id={piece.id}>
          {piece.text}
        </TermButton>
      ),
    );
  };

  const isCode = (part: string) => part.startsWith('`') && part.endsWith('`') && part.length > 2;
  const code = (part: string, key: string) => (
    <code key={key} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-rose-700 dark:bg-slate-800 dark:text-rose-300">
      {part.slice(1, -1)}
    </code>
  );

  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          // Bold text may itself contain `code`.
          return (
            <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
              {part
                .slice(2, -2)
                .split(/(`[^`]+`)/g)
                .map((inner, j) => (isCode(inner) ? code(inner, `b${i}-${j}`) : <Fragment key={`b${i}-${j}`}>{linkify(inner, `b${i}-${j}`)}</Fragment>))}
            </strong>
          );
        }
        if (isCode(part)) return code(part, `c${i}`);
        return <Fragment key={i}>{linkify(part, `t${i}`)}</Fragment>;
      })}
    </>
  );
}

/** Don’t underline these terms inside `children` (for example, the topic of the page itself). */
export function GlossarySkip({ ids, children }: { ids: string[]; children: ReactNode }) {
  const parent = useGlossarySkip();
  const key = ids.join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => new Set([...parent, ...ids]), [parent, key]);
  return <GlossarySkipContext.Provider value={value}>{children}</GlossarySkipContext.Provider>;
}
