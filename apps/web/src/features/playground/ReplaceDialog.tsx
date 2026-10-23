import { COMPONENT_CATEGORIES, COMPONENTS, getComponent, getPropertyField, type ComponentDefinition } from '@arch-arena/shared';
import { Replace, Search, SearchX } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ACCENTS, DynamicIcon } from '@/components/icons';
import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/cn';
import { toast } from '@/stores/toast';
import type { ComponentNodeT } from './model';
import { useEditor } from './store';

function Option({ def, keeps, total, onPick }: { def: ComponentDefinition; keeps: number; total: number; onPick: () => void }) {
  const accent = ACCENTS[def.accent]!;
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-100 focus-visible:bg-slate-100 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800"
        data-testid={`replace-with-${def.type}`}
      >
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1', accent.bg, accent.ring)}>
          <DynamicIcon name={def.icon} className={cn('h-4 w-4', accent.icon)} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{def.label}</span>
          <span className="line-clamp-2 block text-xs text-slate-500 dark:text-slate-400">{def.description}</span>
        </span>
        {total > 0 && (
          <span className={cn('shrink-0 self-center text-[11px]', keeps === total ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')}>
            keeps {keeps}/{total} settings
          </span>
        )}
      </button>
    </li>
  );
}

/**
 * “Replace with…” for the selected component: swaps its type in place so every connection
 * stays wired. Components from the same category are offered first.
 */
export function ReplaceDialog({ node, open, onClose }: { node: ComponentNodeT; open: boolean; onClose: () => void }) {
  const replace = useEditor((s) => s.replaceComponent);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const current = getComponent(node.data.componentType);
  const setKeys = Object.keys(node.data.props);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  const candidates = useMemo(() => COMPONENTS.filter((c) => c.type !== node.data.componentType), [node.data.componentType]);
  const keeps = (def: ComponentDefinition) => setKeys.filter((k) => (def.properties as string[]).includes(k)).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return candidates.filter((c) => `${c.label} ${c.description} ${c.tags.join(' ')}`.toLowerCase().includes(q));
  }, [candidates, query]);

  const pick = (def: ComponentDefinition) => {
    const result = replace(node.id, def.type);
    onClose();
    if (!result) return;
    const parts = [`${result.connections} connection${result.connections === 1 ? '' : 's'} kept`];
    if (result.keptSettings.length) parts.push(`${result.keptSettings.length} setting${result.keptSettings.length === 1 ? '' : 's'} carried over`);
    if (result.droppedSettings.length) {
      const names = result.droppedSettings.map((k) => getPropertyField(k)?.label ?? k).join(', ');
      parts.push(`not applicable: ${names}`);
    }
    toast.success(`Replaced ${current?.label ?? 'component'} with ${def.label}`, `${parts.join(' · ')}. Undo with ⌘Z / Ctrl+Z.`);
  };

  const similar = candidates.filter((c) => c.category === current?.category);
  const rest = COMPONENT_CATEGORIES.map((cat) => ({ cat, items: candidates.filter((c) => c.category === cat.id && c.category !== current?.category) })).filter((g) => g.items.length);
  const option = (def: ComponentDefinition) => <Option key={def.type} def={def} keeps={keeps(def)} total={setKeys.length} onPick={() => pick(def)} />;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Replace ${node.data.label}`}
      description="Pick another component. It takes this one’s place, so all connections stay wired; settings that also apply are kept."
      size="md"
    >
      <label className="relative mb-3 block">
        <span className="sr-only">Search components</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input ref={inputRef} type="search" className="input pl-9" placeholder="Search: cache, queue, gateway…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      {filtered ? (
        filtered.length ? (
          <ul className="space-y-0.5">{filtered.map(option)}</ul>
        ) : (
          <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <SearchX className="h-4 w-4" aria-hidden /> No component matches “{query}”.
          </p>
        )
      ) : (
        <div className="space-y-4">
          {similar.length > 0 && (
            <section>
              <h3 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                <Replace className="h-3.5 w-3.5" aria-hidden /> Similar components
              </h3>
              <ul className="space-y-0.5" data-testid="replace-similar">
                {similar.map(option)}
              </ul>
            </section>
          )}
          {rest.map(({ cat, items }) => (
            <section key={cat.id}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{cat.label}</h3>
              <ul className="space-y-0.5">{items.map(option)}</ul>
            </section>
          ))}
        </div>
      )}
    </Dialog>
  );
}
