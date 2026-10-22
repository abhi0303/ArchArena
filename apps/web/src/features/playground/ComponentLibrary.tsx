import { componentsByCategory, type ComponentCategoryId, type ComponentDefinition } from '@arch-arena/shared';
import { ChevronRight, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ACCENTS, DynamicIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

export const DRAG_MIME = 'application/x-archarena-component';

function LibraryItem({ def, onAdd }: { def: ComponentDefinition; onAdd: (type: string) => void }) {
  const accent = ACCENTS[def.accent]!;
  return (
    <li>
      <button
        type="button"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(DRAG_MIME, def.type);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onClick={() => onAdd(def.type)}
        className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-100 active:cursor-grabbing dark:hover:bg-slate-800"
        title={`${def.description} Drag onto the canvas or click to add.`}
        aria-label={`Add ${def.label}: ${def.description}`}
        data-testid={`library-${def.type}`}
      >
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1', accent.bg, accent.ring)}>
          <DynamicIcon name={def.icon} className={cn('h-3.5 w-3.5', accent.icon)} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-slate-800 dark:text-slate-100">{def.label}</span>
          <span className="line-clamp-2 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">{def.description}</span>
        </span>
      </button>
    </li>
  );
}

export function ComponentLibrary({ suggested, onAdd }: { suggested: ComponentCategoryId[]; onAdd: (type: string) => void }) {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => componentsByCategory(), []);
  const [open, setOpen] = useState<Set<string>>(() => new Set(suggested.length ? suggested : ['clients', 'application', 'storage']));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? groups
        .map((g) => ({
          ...g,
          components: g.components.filter((c) => `${c.label} ${c.description} ${c.tags.join(' ')}`.toLowerCase().includes(q)),
        }))
        .filter((g) => g.components.length)
    : groups;
  const ordered = [...filtered].sort((a, b) => Number(suggested.includes(b.id)) - Number(suggested.includes(a.id)));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-3 dark:border-slate-800">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Components</h2>
        <label className="relative block">
          <span className="sr-only">Search components</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input className="input pl-8" placeholder="Search components…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Drag onto the canvas, or click to add.</p>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {ordered.length === 0 && <p className="p-3 text-sm text-slate-500">No components match “{query}”.</p>}
        {ordered.map((g) => {
          const isOpen = q.length > 0 || open.has(g.id);
          const isSuggested = suggested.includes(g.id);
          return (
            <section key={g.id} className="mb-1">
              <button
                type="button"
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpen((s) => {
                    const n = new Set(s);
                    if (n.has(g.id)) n.delete(g.id);
                    else n.add(g.id);
                    return n;
                  })
                }
              >
                <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-90')} aria-hidden />
                <span className="flex-1 text-left">{g.label}</span>
                {isSuggested && (
                  <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" title="Useful for this challenge">
                    <Sparkles className="h-3 w-3" aria-hidden /> Suggested
                  </span>
                )}
                <span className="text-[10px] font-normal text-slate-400">{g.components.length}</span>
              </button>
              {isOpen && (
                <ul className="mt-0.5 space-y-0.5">
                  {g.components.map((c) => (
                    <LibraryItem key={c.type} def={c} onAdd={onAdd} />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
