import {
  CONNECTION_FIELD_HELP,
  CONNECTION_TYPES,
  PROTOCOLS,
  getComponent,
  getPropertyField,
  type ConnectionProps,
  type CoverageStatus,
  type PropertyField,
  type QuestionDetailDTO,
  type ValidationResult,
} from '@arch-arena/shared';
import { ArrowLeftRight, ChevronDown, CircleCheck, CircleDashed, Copy, GraduationCap, Info, SquareStack, Trash2, Ungroup } from 'lucide-react';
import { useState } from 'react';
import { ACCENTS, DynamicIcon } from '@/components/icons';
import { useExplanation } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/misc';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { LearnDialog } from '@/features/learn/LearnDialog';
import type { AppEdge, AppNode, ComponentNodeT } from './model';
import { useEditor } from './store';

function Help({ text }: { text: string }) {
  return (
    <Tooltip content={text} side="left">
      <button type="button" className="rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label={text}>
        <Info className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  );
}

function FieldLabel({ htmlFor, label, help }: { htmlFor: string; label: string; help?: string }) {
  return (
    <div className="mb-1 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {help && <Help text={help} />}
    </div>
  );
}

function PropertyInput({ node, field }: { node: ComponentNodeT; field: PropertyField }) {
  const setProp = useEditor((s) => s.setNodeProp);
  const id = `prop-${node.id}-${field.key}`;
  const value = node.data.props[field.key];
  if (field.type === 'boolean') {
    return (
      <div className="flex items-center justify-between gap-2 py-1">
        <label htmlFor={id} className="flex items-center gap-2 text-sm">
          <input
            id={id}
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            checked={value === true}
            onChange={(e) => setProp(node.id, field.key, e.target.checked ? true : undefined)}
          />
          {field.label}
        </label>
        <Help text={field.help} />
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div>
        <FieldLabel htmlFor={id} label={field.label} help={field.help} />
        <select id={id} className="input" value={value === undefined ? '' : String(value)} onChange={(e) => setProp(node.id, field.key, e.target.value || undefined)}>
          <option value="">Not set</option>
          {field.options!.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div>
      <FieldLabel htmlFor={id} label={field.label} help={field.help} />
      <input
        id={id}
        className="input"
        maxLength={200}
        placeholder={field.placeholder}
        value={value === undefined ? '' : String(value)}
        onChange={(e) => setProp(node.id, field.key, e.target.value || undefined)}
      />
    </div>
  );
}

function ComponentProperties({ node }: { node: ComponentNodeT }) {
  const def = getComponent(node.data.componentType);
  const update = useEditor((s) => s.updateNodeData);
  const duplicate = useEditor((s) => s.duplicateSelected);
  const remove = useEditor((s) => s.deleteSelected);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const fields = (def?.properties ?? []).map((k) => getPropertyField(k)).filter((f): f is PropertyField => !!f);
  const basic = fields.filter((f) => !f.advanced);
  const advanced = fields.filter((f) => f.advanced);
  const accent = ACCENTS[def?.accent ?? 'slate']!;
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1', accent.bg, accent.ring)}>
          <DynamicIcon name={def?.icon ?? 'Box'} className={cn('h-4 w-4', accent.icon)} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{def?.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{def?.details}</p>
          <button
            type="button"
            onClick={() => setLearnOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
            data-testid="learn-component"
          >
            <GraduationCap className="h-3.5 w-3.5" aria-hidden /> Learn about {def?.label}
          </button>
        </div>
      </div>
      <LearnDialog type={node.data.componentType} open={learnOpen} onClose={() => setLearnOpen(false)} />
      <div>
        <FieldLabel htmlFor={`name-${node.id}`} label="Name" help="Rename this instance, e.g. “Order Service” or “Read Replica (EU)”." />
        <input
          id={`name-${node.id}`}
          className="input"
          maxLength={80}
          value={node.data.label}
          onChange={(e) => update(node.id, { label: e.target.value }, `label-${node.id}`)}
          data-testid="node-name-input"
        />
      </div>
      {basic.map((f) => (
        <PropertyInput key={f.key} node={node} field={f} />
      ))}
      {advanced.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced((v) => !v)}
          >
            Advanced settings
            <ChevronDown className={cn('h-4 w-4 transition-transform', showAdvanced && 'rotate-180')} aria-hidden />
          </button>
          {showAdvanced && (
            <div className="space-y-3 border-t border-slate-200 p-3 dark:border-slate-800">
              {advanced.map((f) => (
                <PropertyInput key={f.key} node={node} field={f} />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        <Button variant="outline" size="sm" icon={<Copy className="h-3.5 w-3.5" />} onClick={duplicate}>
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={remove}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function EdgeProperties({ edge, nodes }: { edge: AppEdge; nodes: AppNode[] }) {
  const update = useEditor((s) => s.updateEdgeProps);
  const reverse = useEditor((s) => s.reverseEdge);
  const remove = useEditor((s) => s.deleteSelected);
  const props = edge.data!.props;
  const label = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    return n?.type === 'component' ? n.data.label : 'Unknown';
  };
  const set = (patch: Partial<ConnectionProps>) => update(edge.id, patch);
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">Connection</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">{label(edge.source)}</span> → <span className="font-medium text-slate-700 dark:text-slate-200">{label(edge.target)}</span>
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Arrows point from the caller to the component it calls. Responses flow back automatically.</p>
      </div>
      <div>
        <FieldLabel htmlFor="edge-label" label="Label" help="Short text shown on the arrow, e.g. “write order” or “publish OrderPlaced”." />
        <input id="edge-label" className="input" maxLength={80} value={props.label ?? ''} onChange={(e) => update(edge.id, { label: e.target.value || undefined }, `edge-label-${edge.id}`)} />
      </div>
      <div>
        <FieldLabel htmlFor="edge-type" label="Connection type" help={CONNECTION_FIELD_HELP.connectionType} />
        <select id="edge-type" className="input" value={props.connectionType} onChange={(e) => set({ connectionType: e.target.value as ConnectionProps['connectionType'] })}>
          {CONNECTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel htmlFor="edge-mode" label="Communication" help={CONNECTION_FIELD_HELP.mode} />
        <Segmented
          label="Communication"
          value={props.mode}
          onChange={(mode) => set({ mode })}
          options={[
            { value: 'sync', label: 'Synchronous' },
            { value: 'async', label: 'Asynchronous' },
          ]}
        />
      </div>
      <div>
        <FieldLabel htmlFor="edge-op" label="Operation" help={CONNECTION_FIELD_HELP.operation} />
        <Segmented
          label="Operation"
          value={props.operation}
          onChange={(operation) => set({ operation })}
          options={[
            { value: 'read', label: 'Read' },
            { value: 'write', label: 'Write' },
            { value: 'read-write', label: 'Both' },
          ]}
        />
      </div>
      <div>
        <FieldLabel htmlFor="edge-protocol" label="Protocol" help={CONNECTION_FIELD_HELP.protocol} />
        <select id="edge-protocol" className="input" value={props.protocol} onChange={(e) => set({ protocol: e.target.value as ConnectionProps['protocol'] })}>
          {PROTOCOLS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel htmlFor="edge-dir" label="Direction" help={CONNECTION_FIELD_HELP.direction} />
        <Segmented
          label="Direction"
          value={props.direction}
          onChange={(direction) => set({ direction })}
          options={[
            { value: 'one-way', label: 'One-way' },
            { value: 'bidirectional', label: 'Bidirectional' },
          ]}
        />
      </div>
      <label className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={props.critical} onChange={(e) => set({ critical: e.target.checked })} />
          Critical path
        </span>
        <Help text={CONNECTION_FIELD_HELP.critical} />
      </label>
      <div>
        <FieldLabel htmlFor="edge-desc" label="Data flow description" help={CONNECTION_FIELD_HELP.description} />
        <textarea
          id="edge-desc"
          className="input min-h-16"
          maxLength={200}
          value={props.description ?? ''}
          onChange={(e) => update(edge.id, { description: e.target.value || undefined }, `edge-desc-${edge.id}`)}
        />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        <Button variant="outline" size="sm" icon={<ArrowLeftRight className="h-3.5 w-3.5" />} onClick={() => reverse(edge.id)}>
          Reverse
        </Button>
        <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={remove}>
          Delete
        </Button>
      </div>
    </div>
  );
}

const COVERAGE_STYLE: Record<CoverageStatus, { label: string; cls: string }> = {
  met: { label: 'Covered', cls: 'text-emerald-600 dark:text-emerald-400' },
  partial: { label: 'Partly covered', cls: 'text-amber-600 dark:text-amber-400' },
  unmet: { label: 'Not covered yet', cls: 'text-slate-400' },
  'needs-config': { label: 'Needs configuration', cls: 'text-indigo-600 dark:text-indigo-400' },
  'not-assessed': { label: 'Not assessed', cls: 'text-slate-400' },
};

function Brief({ question, validation }: { question: QuestionDetailDTO; validation: ValidationResult | null }) {
  const t = useExplanation();
  const coverage = new Map(validation?.requirementCoverage.map((c) => [c.id, c.status]) ?? []);
  const renderReq = (r: QuestionDetailDTO['functional'][number]) => {
    const status = coverage.get(r.id);
    const style = status ? COVERAGE_STYLE[status] : null;
    return (
      <li key={r.id} className="flex gap-2 text-xs">
        {status === 'met' ? (
          <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-label="Covered" />
        ) : (
          <CircleDashed className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', style?.cls ?? 'text-slate-300')} aria-label={style?.label ?? 'Not checked yet'} />
        )}
        <span>
          {t(r)}
          {style && status !== 'met' && <span className={cn('ml-1 font-medium', style.cls)}>· {style.label}</span>}
        </span>
      </li>
    );
  };
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brief</p>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{t(question.statement)}</p>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Functional requirements</p>
        <ul className="space-y-1.5">{question.functional.map(renderReq)}</ul>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Non-functional requirements</p>
        <ul className="space-y-1.5">{question.nonFunctional.map(renderReq)}</ul>
      </div>
      {!validation && <p className="text-[11px] text-slate-500">Run “Validate” to see which requirements your design covers.</p>}
      <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
        <p className="mb-1 font-semibold">Connection legend</p>
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            <svg width="36" height="6" aria-hidden>
              <line x1="0" y1="3" x2="36" y2="3" stroke="#64748b" strokeWidth="2" />
            </svg>
            Synchronous request
          </li>
          <li className="flex items-center gap-2">
            <svg width="36" height="6" aria-hidden>
              <line x1="0" y1="3" x2="36" y2="3" stroke="#f97316" strokeWidth="2" strokeDasharray="7 5" />
            </svg>
            Asynchronous / event
          </li>
          <li className="flex items-center gap-2">
            <svg width="36" height="6" aria-hidden>
              <line x1="0" y1="3" x2="36" y2="3" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 5" />
            </svg>
            Replication / data sync
          </li>
          <li className="flex items-center gap-2">
            <svg width="36" height="6" aria-hidden>
              <line x1="0" y1="3" x2="36" y2="3" stroke="#4f46e5" strokeWidth="3" />
            </svg>
            Critical path
          </li>
        </ul>
      </div>
    </div>
  );
}

export function PropertiesPanel({ question, validation }: { question: QuestionDetailDTO; validation: ValidationResult | null }) {
  const nodes = useEditor((s) => s.nodes);
  const edges = useEditor((s) => s.edges);
  const groupSelected = useEditor((s) => s.groupSelected);
  const ungroup = useEditor((s) => s.ungroup);
  const update = useEditor((s) => s.updateNodeData);
  const duplicate = useEditor((s) => s.duplicateSelected);
  const remove = useEditor((s) => s.deleteSelected);
  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);
  const count = selectedNodes.length + selectedEdges.length;

  let content: React.ReactNode;
  let title = 'Challenge';
  if (count === 0) {
    content = <Brief question={question} validation={validation} />;
  } else if (count === 1 && selectedNodes[0]?.type === 'component') {
    title = 'Component';
    content = <ComponentProperties key={selectedNodes[0].id} node={selectedNodes[0]} />;
  } else if (count === 1 && selectedEdges[0]) {
    title = 'Connection';
    content = <EdgeProperties key={selectedEdges[0].id} edge={selectedEdges[0]} nodes={nodes} />;
  } else if (count === 1 && selectedNodes[0]?.type === 'note') {
    const note = selectedNodes[0];
    title = 'Note';
    content = (
      <div className="space-y-3">
        <label htmlFor="note-text" className="label">
          Note text
        </label>
        <textarea id="note-text" className="input min-h-32" maxLength={2000} value={note.data.text} onChange={(e) => update(note.id, { text: e.target.value }, `note-${note.id}`)} />
        <Button variant="ghost" size="sm" className="text-rose-600" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={remove}>
          Delete note
        </Button>
      </div>
    );
  } else if (count === 1 && selectedNodes[0]?.type === 'group') {
    const group = selectedNodes[0];
    title = 'Section';
    content = (
      <div className="space-y-3">
        <div>
          <label htmlFor="group-label" className="label">
            Section name
          </label>
          <input id="group-label" className="input" maxLength={80} value={group.data.label} onChange={(e) => update(group.id, { label: e.target.value }, `group-${group.id}`)} />
        </div>
        <p className="text-xs text-slate-500">Sections are visual only: they help you organise related components (e.g. “Read path” or “Region EU”).</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Ungroup className="h-3.5 w-3.5" />} onClick={() => ungroup(group.id)}>
            Ungroup
          </Button>
          <Button variant="ghost" size="sm" className="text-rose-600" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={remove}>
            Remove section
          </Button>
        </div>
      </div>
    );
  } else {
    title = 'Selection';
    content = (
      <div className="space-y-3">
        <p className="text-sm">
          {selectedNodes.length} component{selectedNodes.length === 1 ? '' : 's'} and {selectedEdges.length} connection{selectedEdges.length === 1 ? '' : 's'} selected.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={<SquareStack className="h-3.5 w-3.5" />} onClick={groupSelected} disabled={!selectedNodes.some((n) => n.type !== 'group' && !n.parentId)}>
            Group into section
          </Button>
          <Button variant="outline" size="sm" icon={<Copy className="h-3.5 w-3.5" />} onClick={duplicate}>
            Duplicate
          </Button>
          <Button variant="ghost" size="sm" className="text-rose-600" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={remove}>
            Delete
          </Button>
        </div>
        <p className="text-xs text-slate-500">Tip: hold Shift and drag on empty canvas to select an area.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" data-testid="properties-panel">
        {content}
      </div>
    </div>
  );
}
