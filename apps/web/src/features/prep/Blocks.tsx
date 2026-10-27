import { Check, Copy, Info, Lightbulb, Sparkles, TriangleAlert } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useExplanation } from '@/components/LanguageToggle';
import { SceneView } from '@/features/learn/SceneView';
import { cn } from '@/lib/cn';
import type { PrepBlock } from './types';
import { useText } from './useText';
import { InlineText } from '@/features/glossary/InlineText';

/** Renders **bold**, `inline code` and linked glossary terms inside answer text. */
export function RichText({ text }: { text: string }) {
  return <InlineText text={text} />;
}

export function CodeBlock({ code, lang, title }: { code: string; lang: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  };
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100" data-testid="prep-code">
      <figcaption className="flex items-center justify-between gap-2 border-b border-slate-800 px-3 py-1.5 text-[11px] text-slate-400">
        <span className="truncate">{title ?? lang}</span>
        <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-800 hover:text-slate-200" aria-label="Copy code">
          {copied ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre className="scrollbar-thin overflow-x-auto overscroll-x-contain p-3 text-[12.5px] leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </figure>
  );
}

const NOTE_STYLE = {
  important: { icon: Info, label: 'Important', cls: 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/30', ic: 'text-indigo-600 dark:text-indigo-400' },
  tip: { icon: Lightbulb, label: 'Tip', cls: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30', ic: 'text-emerald-600 dark:text-emerald-400' },
  warning: { icon: TriangleAlert, label: 'Watch out', cls: 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30', ic: 'text-amber-600 dark:text-amber-400' },
  example: { icon: Sparkles, label: 'Example', cls: 'border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/30', ic: 'text-sky-600 dark:text-sky-400' },
} as const;

export function Block({ block }: { block: PrepBlock }) {
  const t = useExplanation();
  const txt = useText();
  switch (block.type) {
    case 'p':
      return (
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          <RichText text={t(block.text)} />
        </p>
      );
    case 'h':
      return (
        <h3 className="pt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <RichText text={txt(block.text)} />
        </h3>
      );
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List className={cn('space-y-1.5 pl-5 leading-relaxed text-slate-700 marker:text-slate-400 dark:text-slate-300', block.ordered ? 'list-decimal' : 'list-disc')}>
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={t(item)} />
            </li>
          ))}
        </List>
      );
    }
    case 'table':
      return (
        <div className="scrollbar-thin overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {block.columns.map((col, i) => (
                  <th key={i} scope="col" className="px-3 py-2 font-semibold">
                    {txt(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t border-slate-200 align-top dark:border-slate-800">
                  {row.map((cell, i) => (
                    <td key={i} className={cn('px-3 py-2', i === 0 ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300')}>
                      <RichText text={txt(cell)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'code':
      return <CodeBlock code={block.code} lang={block.lang} title={block.title} />;
    case 'note': {
      const style = NOTE_STYLE[block.tone];
      return (
        <div className={cn('flex gap-3 rounded-xl border p-3 sm:p-4', style.cls)}>
          <style.icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.ic)} aria-hidden />
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <span className={cn('mr-1 font-semibold', style.ic)}>{style.label}:</span>
            <RichText text={t(block.text)} />
          </p>
        </div>
      );
    }
    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">{i + 1}</span>
              <div className="min-w-0 pt-0.5">
                <p className="font-semibold leading-snug">{txt(s.title)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  <RichText text={t(s.text)} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'options':
      return (
        <ul className="grid gap-3 md:grid-cols-3">
          {block.items.map((o, i) => (
            <li key={i} className={cn('flex flex-col gap-2 rounded-xl border bg-white p-3 dark:bg-slate-900', o.badge ? 'border-indigo-300 ring-1 ring-indigo-200 dark:border-indigo-800 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-800')}>
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {o.title}
                {o.badge && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">{t(o.badge)}</span>}
              </p>
              {o.code && <CodeBlock code={o.code} lang={o.lang ?? 'text'} />}
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <RichText text={t(o.text)} />
              </p>
            </li>
          ))}
        </ul>
      );
    case 'scene':
      return <SceneView scene={block.scene} />;
  }
}

export function Blocks({ blocks }: { blocks: PrepBlock[] }): ReactNode {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}
