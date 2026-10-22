import '@xyflow/react/dist/style.css';
import type { DiagramSnapshot } from '@arch-arena/shared';
import { Background, BackgroundVariant, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useMemo } from 'react';
import { edgeTypes } from '@/features/playground/edges';
import { fromSnapshot } from '@/features/playground/model';
import { nodeTypes } from '@/features/playground/nodes';
import { useIsDark } from '@/stores/preferences';

/** Read-only rendering of a saved diagram (results, reference comparison). */
export default function DiagramViewer({
  diagram,
  className,
  onNodeClick,
  selectedId,
  label,
}: {
  diagram: DiagramSnapshot;
  className?: string;
  onNodeClick?: (id: string) => void;
  selectedId?: string | null;
  label: string;
}) {
  const dark = useIsDark();
  const { nodes, edges } = useMemo(() => fromSnapshot(diagram), [diagram]);
  const shown = useMemo(() => nodes.map((n) => ({ ...n, selected: n.id === selectedId })), [nodes, selectedId]);
  return (
    <div className={className ?? 'h-80 w-full'} aria-label={label} role="img">
      <ReactFlowProvider>
        <ReactFlow
          nodes={shown}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={!!onNodeClick}
          onNodeClick={onNodeClick ? (_e, n) => onNodeClick(n.id) : undefined}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
          minZoom={0.2}
          colorMode={dark ? 'dark' : 'light'}
          proOptions={{ hideAttribution: false }}
          panOnScroll={false}
          zoomOnScroll={false}
          preventScrolling={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
