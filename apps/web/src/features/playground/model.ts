import {
  DIAGRAM_SCHEMA_VERSION,
  getComponent,
  type ConnectionProps,
  type DiagramNode,
  type DiagramSnapshot,
  type PropertyValue,
} from '@arch-arena/shared';
import { MarkerType, type Edge, type Node } from '@xyflow/react';

export type ComponentNodeData = { componentType: string; label: string; props: Record<string, PropertyValue> };
export type NoteNodeData = { text: string };
export type GroupNodeData = { label: string };

export type ComponentNodeT = Node<ComponentNodeData, 'component'>;
export type NoteNodeT = Node<NoteNodeData, 'note'>;
export type GroupNodeT = Node<GroupNodeData, 'group'>;
export type AppNode = ComponentNodeT | NoteNodeT | GroupNodeT;

export type ConnectionEdgeData = { props: ConnectionProps };
export type AppEdge = Edge<ConnectionEdgeData, 'connection'>;

export const NODE_SIZE = { component: { width: 176, height: 56 }, note: { width: 200, height: 120 } };

export function edgeColor(props: ConnectionProps): string {
  if (props.critical) return '#4f46e5';
  if (props.connectionType === 'replication' || props.connectionType === 'data-sync') return '#94a3b8';
  if (props.mode === 'async') return '#f97316';
  return '#64748b';
}

/** Applies visual markers derived from connection properties. */
export function decorateEdge(edge: AppEdge): AppEdge {
  const props = edge.data!.props;
  const color = edgeColor(props);
  const marker = { type: MarkerType.ArrowClosed, width: 16, height: 16, color };
  return {
    ...edge,
    type: 'connection',
    markerEnd: marker,
    markerStart: props.direction === 'bidirectional' ? marker : undefined,
  };
}

/** Converts editor state into the persisted diagram format (strips React Flow internals). */
export function toSnapshot(nodes: AppNode[], edges: AppEdge[], viewport?: { x: number; y: number; zoom: number }): DiagramSnapshot {
  const ids = new Set(nodes.map((n) => n.id));
  const out: DiagramNode[] = nodes.map((n) => {
    const base = {
      id: n.id,
      position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
      ...(n.parentId ? { parentId: n.parentId } : {}),
    };
    if (n.type === 'component') {
      return { ...base, kind: 'component', componentType: n.data.componentType, label: n.data.label, props: { ...n.data.props } };
    }
    const width = Math.round(n.width ?? n.measured?.width ?? NODE_SIZE.note.width);
    const height = Math.round(n.height ?? n.measured?.height ?? NODE_SIZE.note.height);
    if (n.type === 'note') return { ...base, kind: 'note', label: '', text: n.data.text, props: {}, width, height };
    return { ...base, kind: 'group', label: n.data.label, props: {}, width, height };
  });
  return {
    version: DIAGRAM_SCHEMA_VERSION,
    nodes: out,
    edges: edges
      .filter((e) => ids.has(e.source) && ids.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? null,
        targetHandle: e.targetHandle ?? null,
        props: { ...e.data!.props },
      })),
    ...(viewport ? { viewport } : {}),
  };
}

/** Restores editor state from a persisted diagram. Groups are ordered before their children. */
export function fromSnapshot(snapshot: DiagramSnapshot): { nodes: AppNode[]; edges: AppEdge[] } {
  const groups = snapshot.nodes.filter((n) => n.kind === 'group');
  const others = snapshot.nodes.filter((n) => n.kind !== 'group');
  const groupIds = new Set(groups.map((g) => g.id));
  const nodes: AppNode[] = [...groups, ...others].map((n) => {
    const parent = n.parentId && groupIds.has(n.parentId) ? { parentId: n.parentId } : {};
    if (n.kind === 'component') {
      return {
        id: n.id,
        type: 'component',
        position: n.position,
        ...parent,
        data: {
          componentType: n.componentType ?? 'app-server',
          label: n.label || getComponent(n.componentType ?? '')?.label || 'Component',
          props: { ...(n.props ?? {}) },
        },
      } satisfies ComponentNodeT;
    }
    if (n.kind === 'note') {
      return {
        id: n.id,
        type: 'note',
        position: n.position,
        ...parent,
        width: n.width ?? NODE_SIZE.note.width,
        height: n.height ?? NODE_SIZE.note.height,
        data: { text: n.text ?? '' },
      } satisfies NoteNodeT;
    }
    return {
      id: n.id,
      type: 'group',
      position: n.position,
      width: n.width ?? 320,
      height: n.height ?? 200,
      zIndex: -1,
      data: { label: n.label || 'Section' },
    } satisfies GroupNodeT;
  });
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: AppEdge[] = snapshot.edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) =>
      decorateEdge({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        targetHandle: e.targetHandle ?? undefined,
        type: 'connection',
        data: { props: { ...e.props } },
      }),
    );
  return { nodes, edges };
}
