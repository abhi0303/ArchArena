import { getComponent } from '@arch-arena/shared';
import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';
import { memo, useState } from 'react';
import { ACCENTS, DynamicIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ComponentNodeT, GroupNodeT, NoteNodeT } from './model';
import { useEditor } from './store';

const HANDLE_CLASS = '!border-white !bg-indigo-500 dark:!border-slate-900';

function Handles() {
  return (
    <>
      <Handle type="source" position={Position.Top} id="t" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} id="r" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} id="b" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Left} id="l" className={HANDLE_CLASS} />
    </>
  );
}

/** Small chips that summarise key configuration at a glance. */
function configChips(props: Record<string, unknown>): string[] {
  const chips: string[] = [];
  if (props.instances === 'multiple') chips.push('×N');
  if (props.instances === 'autoscaled') chips.push('auto');
  if (props.replication && props.replication !== 'none') chips.push('replicated');
  if (Number(props.replicationFactor) >= 2) chips.push(`RF${String(props.replicationFactor)}`);
  if (String(props.deployment ?? '').startsWith('multi-region')) chips.push('multi-region');
  return chips.slice(0, 2);
}

export const ComponentNode = memo(function ComponentNode({ id, data, selected }: NodeProps<ComponentNodeT>) {
  const def = getComponent(data.componentType);
  const accent = ACCENTS[def?.accent ?? 'slate']!;
  const highlight = useEditor((s) => s.highlights[id]);
  const chips = configChips(data.props);
  return (
    <div
      className={cn(
        'relative flex w-44 items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2 shadow-sm transition-shadow dark:bg-slate-900',
        selected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-200 hover:shadow-md dark:border-slate-700',
        highlight === 'error' && 'ring-2 ring-rose-500/70',
        highlight === 'warning' && !selected && 'ring-2 ring-amber-400/70',
      )}
      title={def?.description}
      data-testid={`node-${data.componentType}`}
    >
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1', accent.bg, accent.ring)}>
        <DynamicIcon name={def?.icon ?? 'Box'} className={cn('h-4 w-4', accent.icon)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">{data.label}</div>
        <div className="truncate text-[10px] leading-tight text-slate-500 dark:text-slate-400">
          {def?.label}
          {chips.length > 0 && <span className="ml-1 text-indigo-600 dark:text-indigo-400">· {chips.join(' · ')}</span>}
        </div>
      </div>
      <Handles />
    </div>
  );
});

export const NoteNode = memo(function NoteNode({ id, data, selected }: NodeProps<NoteNodeT>) {
  const update = useEditor((s) => s.updateNodeData);
  const [editing, setEditing] = useState(false);
  return (
    <div
      className={cn(
        'h-full w-full rounded-lg border bg-amber-50 p-2 text-xs text-amber-950 shadow-sm dark:bg-amber-950/60 dark:text-amber-100',
        selected ? 'border-amber-500' : 'border-amber-200 dark:border-amber-900',
      )}
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer isVisible={selected} minWidth={120} minHeight={60} color="#f59e0b" />
      {editing ? (
        <textarea
          autoFocus
          className="nodrag h-full w-full resize-none bg-transparent outline-none"
          defaultValue={data.text}
          maxLength={2000}
          aria-label="Note text"
          onBlur={(e) => {
            setEditing(false);
            if (e.target.value !== data.text) update(id, { text: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur();
          }}
        />
      ) : (
        <p className="h-full overflow-hidden whitespace-pre-wrap">{data.text || <span className="italic opacity-60">Double-click to write a note…</span>}</p>
      )}
    </div>
  );
});

export const GroupNode = memo(function GroupNode({ data, selected }: NodeProps<GroupNodeT>) {
  return (
    <div
      className={cn(
        'h-full w-full rounded-2xl border-2 border-dashed bg-slate-100/40 dark:bg-slate-800/30',
        selected ? 'border-indigo-400' : 'border-slate-300 dark:border-slate-700',
      )}
    >
      <NodeResizer isVisible={selected} minWidth={160} minHeight={100} color="#6366f1" />
      <div className="absolute left-3 top-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{data.label}</div>
    </div>
  );
});

export const nodeTypes = { component: ComponentNode, note: NoteNode, group: GroupNode };
