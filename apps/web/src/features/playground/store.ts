import { getComponent, inferConnectionProps, layeredLayout, type ConnectionProps, type DiagramSnapshot, type PropertyValue } from '@arch-arena/shared';
import { applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange, type XYPosition } from '@xyflow/react';
import { create } from 'zustand';
import { uid } from '@/lib/cn';
import { NODE_SIZE, decorateEdge, fromSnapshot, toSnapshot, type AppEdge, type AppNode, type ComponentNodeT, type GroupNodeT, type NoteNodeT } from './model';

interface HistoryEntry {
  nodes: AppNode[];
  edges: AppEdge[];
}

const HISTORY_LIMIT = 100;
const COALESCE_MS = 800;

export type Highlight = 'error' | 'warning';

/** What a component replacement kept and dropped, for user feedback. */
export interface ReplaceResult {
  label: string;
  connections: number;
  keptSettings: string[];
  droppedSettings: string[];
}

const INFERRED_FIELDS = ['connectionType', 'protocol', 'mode', 'operation', 'direction', 'critical'] as const;

/** True when a connection still has exactly the defaults inferred for its endpoint types (the user never changed them). */
function hasInferredDefaults(props: ConnectionProps, sourceType: string, targetType: string): boolean {
  const inferred = inferConnectionProps(sourceType, targetType);
  return INFERRED_FIELDS.every((k) => props[k] === inferred[k]);
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface EditorState {
  nodes: AppNode[];
  edges: AppEdge[];
  past: HistoryEntry[];
  future: HistoryEntry[];
  /** Increments on every semantic change; autosave watches it. */
  version: number;
  highlights: Record<string, Highlight>;
  /** Last action, used by the walkthrough. */
  lastAction: 'add' | 'connect' | 'validate' | 'other' | null;

  load: (snapshot: DiagramSnapshot) => void;
  snapshot: () => DiagramSnapshot;
  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => void;
  connect: (c: Connection) => 'ok' | 'duplicate' | 'self';
  addComponent: (type: string, position: XYPosition) => string;
  addNote: (position: XYPosition) => string;
  updateNodeData: (id: string, patch: Partial<{ label: string; props: Record<string, PropertyValue>; text: string }>, coalesceKey?: string) => void;
  setNodeProp: (id: string, key: string, value: PropertyValue | undefined) => void;
  updateEdgeProps: (id: string, patch: Partial<ConnectionProps>, coalesceKey?: string) => void;
  reverseEdge: (id: string) => void;
  deleteElements: (nodeIds: string[], edgeIds: string[]) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  /**
   * Swaps a component for another type in place: same id, position and group, so every connection
   * stays attached. Settings the new type supports are kept; default names and untouched connection
   * defaults follow the new type. One undo step. Returns null if nothing changed.
   */
  replaceComponent: (id: string, componentType: string) => ReplaceResult | null;
  groupSelected: () => void;
  ungroup: (groupId: string) => void;
  autoLayout: () => void;
  undo: () => void;
  redo: () => void;
  beginDrag: () => void;
  endDrag: () => void;
  selectOnly: (ids: string[]) => void;
  setHighlights: (h: Record<string, Highlight>) => void;
  markAction: (a: EditorState['lastAction']) => void;
}

let lastCommitKey: string | null = null;
let lastCommitAt = 0;
let dragStart: HistoryEntry | null = null;

const clone = (nodes: AppNode[], edges: AppEdge[]): HistoryEntry => ({
  nodes: nodes.map((n) => ({ ...n, data: structuredClone(n.data), position: { ...n.position }, selected: false })) as AppNode[],
  edges: edges.map((e) => ({ ...e, data: structuredClone(e.data), selected: false })) as AppEdge[],
});

/** Absolute canvas position (children of groups store relative positions). */
function absolutePosition(node: AppNode, nodes: AppNode[]): XYPosition {
  if (!node.parentId) return node.position;
  const parent = nodes.find((n) => n.id === node.parentId);
  if (!parent) return node.position;
  const p = absolutePosition(parent, nodes);
  return { x: p.x + node.position.x, y: p.y + node.position.y };
}

function sizeOf(n: AppNode): { width: number; height: number } {
  const fallback = n.type === 'component' ? NODE_SIZE.component : NODE_SIZE.note;
  return { width: n.width ?? n.measured?.width ?? fallback.width, height: n.height ?? n.measured?.height ?? fallback.height };
}

export const useEditor = create<EditorState>((set, get) => {
  /** Records the current state for undo before a mutation. Rapid edits with the same key coalesce. */
  const commit = (key?: string) => {
    const now = Date.now();
    if (key && key === lastCommitKey && now - lastCommitAt < COALESCE_MS) {
      lastCommitAt = now;
      return;
    }
    lastCommitKey = key ?? null;
    lastCommitAt = now;
    const { nodes, edges, past } = get();
    set({ past: [...past.slice(-(HISTORY_LIMIT - 1)), clone(nodes, edges)], future: [] });
  };
  const bump = () => set((s) => ({ version: s.version + 1 }));

  return {
    nodes: [],
    edges: [],
    past: [],
    future: [],
    version: 0,
    highlights: {},
    lastAction: null,

    load: (snapshot) => {
      const { nodes, edges } = fromSnapshot(snapshot);
      lastCommitKey = null;
      set({ nodes, edges, past: [], future: [], highlights: {}, lastAction: null });
    },

    snapshot: () => toSnapshot(get().nodes, get().edges),

    onNodesChange: (changes) => {
      const removals = changes.filter((c) => c.type === 'remove');
      if (removals.length) {
        commit('delete');
        // Removing a group keeps its children: convert them to absolute positions first.
        for (const r of removals) {
          const node = get().nodes.find((n) => n.id === r.id);
          if (node?.type === 'group') get().ungroup(node.id);
        }
      }
      const adds = changes.some((c) => c.type === 'add' || c.type === 'replace');
      if (adds) commit();
      const resizing = changes.find((c) => c.type === 'dimensions' && c.resizing !== undefined) as
        | (NodeChange<AppNode> & { type: 'dimensions'; resizing?: boolean; id: string })
        | undefined;
      if (resizing?.resizing) commit(`resize-${resizing.id}`);
      set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) }));
      if (removals.length || adds || (resizing && resizing.resizing === false)) bump();
    },

    onEdgesChange: (changes) => {
      const removals = changes.filter((c) => c.type === 'remove');
      if (removals.length) commit('delete');
      set((s) => ({ edges: applyEdgeChanges(changes, s.edges) }));
      if (removals.length) bump();
    },

    connect: (c) => {
      if (!c.source || !c.target) return 'self';
      if (c.source === c.target) return 'self';
      const { nodes, edges } = get();
      if (edges.some((e) => e.source === c.source && e.target === c.target)) return 'duplicate';
      const src = nodes.find((n) => n.id === c.source);
      const tgt = nodes.find((n) => n.id === c.target);
      if (!src || !tgt || src.type !== 'component' || tgt.type !== 'component') return 'self';
      commit();
      const edge = decorateEdge({
        id: uid('e'),
        source: c.source,
        target: c.target,
        sourceHandle: c.sourceHandle ?? undefined,
        targetHandle: c.targetHandle ?? undefined,
        type: 'connection',
        data: { props: inferConnectionProps(src.data.componentType, tgt.data.componentType) },
      });
      set((s) => ({ edges: [...s.edges, edge], lastAction: 'connect' }));
      bump();
      return 'ok';
    },

    addComponent: (type, position) => {
      const def = getComponent(type);
      commit();
      const sameType = get().nodes.filter((n) => n.type === 'component' && n.data.componentType === type).length;
      const node: ComponentNodeT = {
        id: uid('c'),
        type: 'component',
        position,
        selected: true,
        data: { componentType: type, label: sameType ? `${def?.label ?? type} ${sameType + 1}` : (def?.label ?? type), props: {} },
      };
      set((s) => ({ nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), node], edges: s.edges.map((e) => ({ ...e, selected: false })), lastAction: 'add' }));
      bump();
      return node.id;
    },

    addNote: (position) => {
      commit();
      const node: NoteNodeT = { id: uid('note'), type: 'note', position, width: NODE_SIZE.note.width, height: NODE_SIZE.note.height, selected: true, data: { text: '' } };
      set((s) => ({ nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), node] }));
      bump();
      return node.id;
    },

    updateNodeData: (id, patch, coalesceKey) => {
      commit(coalesceKey ?? `node-${id}-${Object.keys(patch).join(',')}`);
      set((s) => ({
        nodes: s.nodes.map((n) => (n.id === id ? ({ ...n, data: { ...n.data, ...patch } } as AppNode) : n)),
      }));
      bump();
    },

    setNodeProp: (id, key, value) => {
      const node = get().nodes.find((n) => n.id === id);
      if (!node || node.type !== 'component') return;
      const props = { ...node.data.props };
      if (value === undefined || value === '') delete props[key];
      else props[key] = value;
      get().updateNodeData(id, { props }, `prop-${id}-${key}`);
    },

    updateEdgeProps: (id, patch, coalesceKey) => {
      commit(coalesceKey ?? `edge-${id}-${Object.keys(patch).join(',')}`);
      set((s) => ({
        edges: s.edges.map((e) => (e.id === id ? decorateEdge({ ...e, data: { props: { ...e.data!.props, ...patch } } }) : e)),
      }));
      bump();
    },

    reverseEdge: (id) => {
      const edge = get().edges.find((e) => e.id === id);
      if (!edge) return;
      if (get().edges.some((e) => e.source === edge.target && e.target === edge.source)) return;
      commit();
      set((s) => ({
        edges: s.edges.map((e) =>
          e.id === id ? { ...e, source: e.target, target: e.source, sourceHandle: e.targetHandle, targetHandle: e.sourceHandle } : e,
        ),
      }));
      bump();
    },

    deleteElements: (nodeIds, edgeIds) => {
      if (!nodeIds.length && !edgeIds.length) return;
      commit();
      for (const id of nodeIds) {
        const n = get().nodes.find((x) => x.id === id);
        if (n?.type === 'group') get().ungroup(n.id);
      }
      const ids = new Set(nodeIds);
      const eids = new Set(edgeIds);
      set((s) => ({
        nodes: s.nodes.filter((n) => !ids.has(n.id)),
        edges: s.edges.filter((e) => !eids.has(e.id) && !ids.has(e.source) && !ids.has(e.target)),
      }));
      bump();
    },

    replaceComponent: (id, componentType) => {
      const { nodes, edges } = get();
      const node = nodes.find((n) => n.id === id);
      const next = getComponent(componentType);
      if (!node || node.type !== 'component' || !next || node.data.componentType === componentType) return null;
      const oldType = node.data.componentType;
      const prev = getComponent(oldType);
      commit();

      // Default names (“Load Balancer”, “Load Balancer 2”) follow the new type; custom names are kept.
      const isDefaultName = !prev || node.data.label === prev.label || new RegExp(`^${escapeRegExp(prev.label)} \\d+$`).test(node.data.label);
      const others = nodes.filter((n) => n.id !== id && n.type === 'component' && n.data.componentType === componentType).length;
      const label = isDefaultName ? (others ? `${next.label} ${others + 1}` : next.label) : node.data.label;

      // Keep only the settings the new component understands.
      const allowed = new Set<string>(next.properties);
      const keptSettings = Object.keys(node.data.props).filter((k) => allowed.has(k));
      const droppedSettings = Object.keys(node.data.props).filter((k) => !allowed.has(k));
      const props = Object.fromEntries(keptSettings.map((k) => [k, node.data.props[k]!]));

      // Connections stay attached. Ones still on their automatic defaults are re-inferred for the new pair
      // (e.g. queue → database); customised connections, labels and descriptions are left alone.
      const typeOf = (nodeId: string, replaced: boolean) => {
        if (nodeId === id) return replaced ? componentType : oldType;
        const n = nodes.find((x) => x.id === nodeId);
        return n?.type === 'component' ? n.data.componentType : '';
      };
      let connections = 0;
      const nextEdges = edges.map((e) => {
        if (e.source !== id && e.target !== id) return e;
        connections++;
        const current = e.data!.props;
        if (!hasInferredDefaults(current, typeOf(e.source, false), typeOf(e.target, false))) return e;
        const inferred = inferConnectionProps(typeOf(e.source, true), typeOf(e.target, true));
        return decorateEdge({ ...e, data: { props: { ...current, ...inferred } } });
      });

      set({
        nodes: nodes.map((n) => (n.id === id ? ({ ...n, data: { ...n.data, componentType, label, props } } as ComponentNodeT) : n)),
        edges: nextEdges,
        lastAction: 'other',
      });
      bump();
      return { label, connections, keptSettings, droppedSettings };
    },

    deleteSelected: () => {
      const { nodes, edges } = get();
      get().deleteElements(
        nodes.filter((n) => n.selected).map((n) => n.id),
        edges.filter((e) => e.selected).map((e) => e.id),
      );
    },

    duplicateSelected: () => {
      const { nodes, edges } = get();
      const selected = nodes.filter((n) => n.selected && n.type !== 'group');
      if (!selected.length) return;
      commit();
      const idMap = new Map<string, string>();
      const copies = selected.map((n) => {
        const id = uid(n.type === 'note' ? 'note' : 'c');
        idMap.set(n.id, id);
        const pos = absolutePosition(n, nodes);
        const copy = {
          ...n,
          id,
          parentId: undefined,
          position: { x: pos.x + 40, y: pos.y + 40 },
          selected: true,
          data: structuredClone(n.data),
        } as AppNode;
        if (copy.type === 'component') copy.data = { ...copy.data, label: `${copy.data.label} (copy)` };
        return copy;
      });
      const copiedEdges = edges
        .filter((e) => idMap.has(e.source) && idMap.has(e.target))
        .map((e) => decorateEdge({ ...e, id: uid('e'), source: idMap.get(e.source)!, target: idMap.get(e.target)!, selected: false, data: structuredClone(e.data) }));
      set((s) => ({
        nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), ...copies],
        edges: [...s.edges.map((e) => ({ ...e, selected: false })), ...copiedEdges],
      }));
      bump();
    },

    groupSelected: () => {
      const { nodes } = get();
      const selected = nodes.filter((n) => n.selected && n.type !== 'group' && !n.parentId);
      if (!selected.length) return;
      commit();
      const boxes = selected.map((n) => ({ ...n.position, ...sizeOf(n) }));
      const minX = Math.min(...boxes.map((b) => b.x)) - 24;
      const minY = Math.min(...boxes.map((b) => b.y)) - 44;
      const maxX = Math.max(...boxes.map((b) => b.x + b.width)) + 24;
      const maxY = Math.max(...boxes.map((b) => b.y + b.height)) + 24;
      const group: GroupNodeT = {
        id: uid('group'),
        type: 'group',
        position: { x: minX, y: minY },
        width: maxX - minX,
        height: maxY - minY,
        zIndex: -1,
        selected: true,
        data: { label: 'Section' },
      };
      const ids = new Set(selected.map((n) => n.id));
      set((s) => ({
        nodes: [
          group,
          ...s.nodes.map((n) =>
            ids.has(n.id) ? ({ ...n, selected: false, parentId: group.id, position: { x: n.position.x - minX, y: n.position.y - minY } } as AppNode) : { ...n, selected: false },
          ),
        ],
      }));
      bump();
    },

    ungroup: (groupId) => {
      const { nodes } = get();
      const group = nodes.find((n) => n.id === groupId);
      if (!group) return;
      set({
        nodes: nodes.map((n) =>
          n.parentId === groupId ? ({ ...n, parentId: undefined, extent: undefined, position: { x: n.position.x + group.position.x, y: n.position.y + group.position.y } } as AppNode) : n,
        ),
      });
    },

    autoLayout: () => {
      const { nodes, edges } = get();
      const comps = nodes.filter((n) => n.type === 'component' && !n.parentId);
      if (!comps.length) return;
      commit();
      const positions = layeredLayout(
        comps.map((n) => ({ id: n.id })),
        edges.map((e) => ({ source: e.source, target: e.target })),
        { columnWidth: 240, rowHeight: 110 },
      );
      set((s) => ({ nodes: s.nodes.map((n) => (positions.has(n.id) ? { ...n, position: positions.get(n.id)! } : n)) }));
      bump();
    },

    undo: () => {
      const { past, future, nodes, edges } = get();
      const prev = past.at(-1);
      if (!prev) return;
      lastCommitKey = null;
      set({ nodes: prev.nodes, edges: prev.edges, past: past.slice(0, -1), future: [clone(nodes, edges), ...future].slice(0, HISTORY_LIMIT) });
      bump();
    },

    redo: () => {
      const { past, future, nodes, edges } = get();
      const next = future[0];
      if (!next) return;
      lastCommitKey = null;
      set({ nodes: next.nodes, edges: next.edges, past: [...past, clone(nodes, edges)].slice(-HISTORY_LIMIT), future: future.slice(1) });
      bump();
    },

    beginDrag: () => {
      const { nodes, edges } = get();
      dragStart = clone(nodes, edges);
    },

    endDrag: () => {
      if (!dragStart) return;
      const before = new Map(dragStart.nodes.map((n) => [n.id, n.position]));
      const moved = get().nodes.some((n) => {
        const p = before.get(n.id);
        return p && (Math.abs(p.x - n.position.x) > 0.5 || Math.abs(p.y - n.position.y) > 0.5);
      });
      if (moved) {
        lastCommitKey = null;
        set((s) => ({ past: [...s.past.slice(-(HISTORY_LIMIT - 1)), dragStart!], future: [] }));
        bump();
      }
      dragStart = null;
    },

    selectOnly: (ids) => {
      const set_ = new Set(ids);
      set((s) => ({
        nodes: s.nodes.map((n) => ({ ...n, selected: set_.has(n.id) })),
        edges: s.edges.map((e) => ({ ...e, selected: set_.has(e.id) })),
      }));
    },

    setHighlights: (highlights) => set({ highlights }),
    markAction: (lastAction) => set({ lastAction }),
  };
});

export const selectCanUndo = (s: EditorState) => s.past.length > 0;
export const selectCanRedo = (s: EditorState) => s.future.length > 0;
