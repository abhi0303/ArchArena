import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import { memo } from 'react';
import { cn } from '@/lib/cn';
import { edgeColor, type AppEdge } from './model';
import { useEditor } from './store';

export const ConnectionEdge = memo(function ConnectionEdge(p: EdgeProps<AppEdge>) {
  const props = p.data?.props;
  const highlight = useEditor((s) => s.highlights[p.id]);
  const [path, labelX, labelY] = getBezierPath({
    sourceX: p.sourceX,
    sourceY: p.sourceY,
    targetX: p.targetX,
    targetY: p.targetY,
    sourcePosition: p.sourcePosition,
    targetPosition: p.targetPosition,
  });
  if (!props) return null;
  const dash = props.connectionType === 'replication' || props.connectionType === 'data-sync' ? '2 5' : props.mode === 'async' ? '7 5' : undefined;
  const stroke = highlight === 'error' ? '#e11d48' : highlight === 'warning' ? '#f59e0b' : edgeColor(props);
  const label = props.label?.trim();
  return (
    <>
      <BaseEdge
        id={p.id}
        path={path}
        markerEnd={p.markerEnd}
        markerStart={p.markerStart}
        interactionWidth={18}
        style={{ stroke, strokeWidth: props.critical ? 2.5 : 1.6, strokeDasharray: dash }}
      />
      {(label || p.selected) && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'nodrag nopan pointer-events-auto absolute rounded-md border bg-white px-1.5 py-0.5 text-[10px] font-medium shadow-sm dark:bg-slate-900',
              p.selected ? 'border-indigo-400 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300',
            )}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {label || `${props.mode === 'async' ? 'async' : 'sync'} · ${props.operation}`}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export const edgeTypes = { connection: ConnectionEdge };
