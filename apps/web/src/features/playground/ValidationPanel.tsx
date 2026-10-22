import type { ValidationResult } from '@arch-arena/shared';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { cn } from '@/lib/cn';
import { useEditor } from './store';

const ICON = { error: CircleX, warning: TriangleAlert, info: Info };
const COLOR = { error: 'text-rose-500', warning: 'text-amber-500', info: 'text-sky-500' };

export function ValidationPanel({ result, onClose }: { result: ValidationResult; onClose: () => void }) {
  const rf = useReactFlow();
  const selectOnly = useEditor((s) => s.selectOnly);
  const met = result.requirementCoverage.filter((r) => r.status === 'met').length;
  const total = result.requirementCoverage.length;

  const focus = (nodeIds: string[], edgeIds: string[]) => {
    const ids = [...nodeIds, ...edgeIds];
    if (!ids.length) return;
    selectOnly(ids);
    const edges = useEditor.getState().edges.filter((e) => edgeIds.includes(e.id));
    const focusNodes = [...new Set([...nodeIds, ...edges.flatMap((e) => [e.source, e.target])])];
    void rf.fitView({ nodes: focusNodes.map((id) => ({ id })), padding: 0.6, duration: 300, maxZoom: 1.2 });
  };

  return (
    <section
      aria-labelledby="validation-title"
      className="absolute bottom-3 left-3 z-[1100] flex max-h-[45%] w-[min(420px,calc(100%-1.5rem))] animate-slide-up flex-col rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      data-testid="validation-panel"
    >
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
        <div>
          <h2 id="validation-title" className="flex items-center gap-2 text-sm font-semibold">
            {result.ok ? <CircleCheck className="h-4 w-4 text-emerald-500" aria-hidden /> : <CircleX className="h-4 w-4 text-rose-500" aria-hidden />}
            {result.ok ? 'No blocking problems found' : `${result.errorCount} problem${result.errorCount === 1 ? '' : 's'} to fix`}
          </h2>
          <p className="text-xs text-slate-500">
            {result.warningCount} warning{result.warningCount === 1 ? '' : 's'} · {met}/{total} requirements covered · quick check, no attempt used
          </p>
        </div>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Close validation results">
          <X className="h-4 w-4" />
        </button>
      </header>
      <ul className="scrollbar-thin overflow-y-auto p-2">
        {result.issues.length === 0 && <li className="p-2 text-sm text-slate-600 dark:text-slate-300">Looks good! Submit for evaluation to get a full score and feedback.</li>}
        {result.issues.map((issue, i) => {
          const Icon = ICON[issue.severity];
          const clickable = issue.nodeIds.length + issue.edgeIds.length > 0;
          return (
            <li key={i}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => focus(issue.nodeIds, issue.edgeIds)}
                className={cn('flex w-full gap-2 rounded-lg p-2 text-left', clickable && 'hover:bg-slate-50 dark:hover:bg-slate-800')}
              >
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', COLOR[issue.severity])} aria-label={issue.severity} />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">{issue.title}</span>
                  <span className="block text-xs text-slate-600 dark:text-slate-300">{issue.message}</span>
                  {issue.fix && <span className="mt-0.5 block text-xs text-slate-500">→ {issue.fix}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
