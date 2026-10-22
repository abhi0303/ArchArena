import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, ConnectionMode, MiniMap, ReactFlow, useReactFlow, type Connection, type IsValidConnection } from '@xyflow/react';
import { MousePointerClick, Spline } from 'lucide-react';
import { useCallback, type DragEvent } from 'react';
import { toast } from '@/stores/toast';
import { DRAG_MIME } from './ComponentLibrary';
import { edgeTypes } from './edges';
import { NODE_SIZE, type AppEdge, type AppNode } from './model';
import { nodeTypes } from './nodes';
import { useEditor } from './store';

const isValidConnection: IsValidConnection<AppEdge> = (c) => c.source !== c.target;

export function Canvas({ dark, onNodeDoubleClick }: { dark: boolean; onNodeDoubleClick?: () => void }) {
  const nodes = useEditor((s) => s.nodes);
  const edges = useEditor((s) => s.edges);
  const onNodesChange = useEditor((s) => s.onNodesChange);
  const onEdgesChange = useEditor((s) => s.onEdgesChange);
  const connect = useEditor((s) => s.connect);
  const beginDrag = useEditor((s) => s.beginDrag);
  const endDrag = useEditor((s) => s.endDrag);
  const addComponent = useEditor((s) => s.addComponent);
  const rf = useReactFlow<AppNode, AppEdge>();

  const onConnect = useCallback(
    (c: Connection) => {
      const r = connect(c);
      if (r === 'duplicate') toast.info('These components are already connected', 'Select the existing arrow to change its properties.');
    },
    [connect],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      const type = e.dataTransfer.getData(DRAG_MIME);
      if (!type) return;
      e.preventDefault();
      const p = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addComponent(type, { x: p.x - NODE_SIZE.component.width / 2, y: p.y - NODE_SIZE.component.height / 2 });
    },
    [rf, addComponent],
  );

  const componentCount = nodes.filter((n) => n.type === 'component').length;

  return (
    <div className="relative h-full w-full" onDragOver={onDragOver} onDrop={onDrop} data-testid="canvas">
      <ReactFlow<AppNode, AppEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={beginDrag}
        onNodeDragStop={endDrag}
        onSelectionDragStart={beginDrag}
        onSelectionDragStop={endDrag}
        onNodeDoubleClick={onNodeDoubleClick}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={28}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Control', 'Shift']}
        selectionKeyCode="Shift"
        snapToGrid
        snapGrid={[10, 10]}
        minZoom={0.2}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.1 }}
        colorMode={dark ? 'dark' : 'light'}
        onlyRenderVisibleElements={nodes.length > 80}
        defaultEdgeOptions={{ type: 'connection' }}
        aria-label="Architecture canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <MiniMap pannable zoomable className="!hidden md:!block" nodeStrokeWidth={2} ariaLabel="Mini map" />
      </ReactFlow>
      {componentCount === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-sm rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
            <MousePointerClick className="mx-auto mb-3 h-8 w-8 text-indigo-500" aria-hidden />
            <h3 className="text-sm font-semibold">Your canvas is empty</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Drag components from the library on the left (or tap one to add it). Then connect them by dragging from the dot on a component’s edge to another component.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Spline className="h-3.5 w-3.5" aria-hidden /> Tip: start with the path a user request takes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
