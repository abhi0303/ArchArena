import { beforeEach, describe, expect, it } from 'vitest';
import { fromSnapshot, toSnapshot } from '@/features/playground/model';
import { useEditor } from '@/features/playground/store';

const ed = () => useEditor.getState();

function add(type: string, x = 0, y = 0) {
  return ed().addComponent(type, { x, y });
}

beforeEach(() => {
  ed().load({ version: 1, nodes: [], edges: [] });
});

describe('editor store', () => {
  it('adds components with readable default labels', () => {
    add('app-server');
    add('app-server', 200, 0);
    const labels = ed().nodes.map((n) => (n.type === 'component' ? n.data.label : ''));
    expect(labels).toEqual(['Application Server', 'Application Server 2']);
  });

  it('connects components with inferred properties and rejects duplicates and self-loops', () => {
    const a = add('app-server');
    const q = add('message-queue', 200, 0);
    expect(ed().connect({ source: a, target: q, sourceHandle: 'r', targetHandle: 'l' })).toBe('ok');
    expect(ed().connect({ source: a, target: q, sourceHandle: 'r', targetHandle: 'l' })).toBe('duplicate');
    expect(ed().connect({ source: a, target: a, sourceHandle: 'r', targetHandle: 'l' })).toBe('self');
    expect(ed().edges).toHaveLength(1);
    expect(ed().edges[0]!.data!.props.mode).toBe('async');
  });

  it('deletes nodes together with their connections', () => {
    const a = add('app-server');
    const b = add('sql-db', 200, 0);
    ed().connect({ source: a, target: b, sourceHandle: null, targetHandle: null });
    ed().deleteElements([b], []);
    expect(ed().nodes.map((n) => n.id)).toEqual([a]);
    expect(ed().edges).toHaveLength(0);
  });

  it('supports undo and redo across adds, connections and property edits', () => {
    const a = add('app-server');
    const b = add('sql-db', 200, 0);
    ed().connect({ source: a, target: b, sourceHandle: null, targetHandle: null });
    ed().setNodeProp(a, 'instances', 'multiple');
    expect(ed().nodes.find((n) => n.id === a)!.data).toMatchObject({ props: { instances: 'multiple' } });

    ed().undo(); // property
    expect((ed().nodes.find((n) => n.id === a)!.data as { props: object }).props).toEqual({});
    ed().undo(); // connection
    expect(ed().edges).toHaveLength(0);
    ed().undo(); // second node
    expect(ed().nodes).toHaveLength(1);
    ed().redo();
    ed().redo();
    expect(ed().nodes).toHaveLength(2);
    expect(ed().edges).toHaveLength(1);
  });

  it('coalesces rapid edits of the same field into one undo step', () => {
    const a = add('app-server');
    ed().updateNodeData(a, { label: 'O' });
    ed().updateNodeData(a, { label: 'Or' });
    ed().updateNodeData(a, { label: 'Order Service' });
    ed().undo();
    expect((ed().nodes[0]!.data as { label: string }).label).toBe('Application Server');
  });

  it('records a single history entry for a drag', () => {
    const a = add('app-server');
    const before = ed().past.length;
    ed().beginDrag();
    ed().onNodesChange([{ type: 'position', id: a, position: { x: 50, y: 60 }, dragging: true }]);
    ed().onNodesChange([{ type: 'position', id: a, position: { x: 100, y: 120 }, dragging: true }]);
    ed().endDrag();
    expect(ed().past.length).toBe(before + 1);
    ed().undo();
    expect(ed().nodes[0]!.position).toEqual({ x: 0, y: 0 });
  });

  it('duplicates the selection including connections between selected nodes', () => {
    const a = add('app-server');
    const b = add('sql-db', 200, 0);
    ed().connect({ source: a, target: b, sourceHandle: null, targetHandle: null });
    ed().selectOnly([a, b]);
    ed().duplicateSelected();
    expect(ed().nodes).toHaveLength(4);
    expect(ed().edges).toHaveLength(2);
  });

  it('groups and ungroups while preserving absolute positions', () => {
    const a = add('app-server', 100, 100);
    ed().selectOnly([a]);
    ed().groupSelected();
    const group = ed().nodes.find((n) => n.type === 'group')!;
    const child = ed().nodes.find((n) => n.id === a)!;
    expect(child.parentId).toBe(group.id);
    expect(group.position.x + child.position.x).toBe(100);
    ed().deleteElements([group.id], []);
    const after = ed().nodes.find((n) => n.id === a)!;
    expect(after.parentId).toBeUndefined();
    expect(after.position).toEqual({ x: 100, y: 100 });
  });

  it('bumps the content version on semantic changes only', () => {
    const a = add('app-server');
    const v = ed().version;
    ed().onNodesChange([{ type: 'select', id: a, selected: true }]);
    expect(ed().version).toBe(v);
    ed().setNodeProp(a, 'instances', 'autoscaled');
    expect(ed().version).toBe(v + 1);
  });
});

describe('diagram serialization', () => {
  it('round-trips components, notes, groups and connections', () => {
    const a = add('app-server', 10, 20);
    const b = add('sql-db', 300, 20);
    ed().connect({ source: a, target: b, sourceHandle: 'r', targetHandle: 'l' });
    ed().setNodeProp(b, 'replication', 'leader-follower-async');
    ed().addNote({ x: 0, y: 200 });
    const note = ed().nodes.find((n) => n.type === 'note')!;
    ed().updateNodeData(note.id, { text: 'Writes go to the primary' });
    ed().selectOnly([a]);
    ed().groupSelected();

    const snap = toSnapshot(ed().nodes, ed().edges);
    const restored = fromSnapshot(JSON.parse(JSON.stringify(snap)));
    const again = toSnapshot(restored.nodes, restored.edges);
    expect(again).toEqual(snap);
    expect(snap.nodes.find((n) => n.kind === 'note')?.text).toBe('Writes go to the primary');
    expect(snap.edges[0]!.props.connectionType).toBe('request');
    // groups must come before their children for React Flow
    const groupIdx = restored.nodes.findIndex((n) => n.type === 'group');
    const childIdx = restored.nodes.findIndex((n) => n.id === a);
    expect(groupIdx).toBeLessThan(childIdx);
  });

  it('drops edges that reference missing nodes when restoring', () => {
    const restored = fromSnapshot({
      version: 1,
      nodes: [{ id: 'a', kind: 'component', componentType: 'app-server', label: 'A', position: { x: 0, y: 0 }, props: {} }],
      edges: [{ id: 'e', source: 'a', target: 'ghost', props: { connectionType: 'request', protocol: 'https', mode: 'sync', operation: 'read', direction: 'one-way', critical: false } }],
    });
    expect(restored.edges).toHaveLength(0);
  });
});

describe('replace component', () => {
  const comp = (id: string) => {
    const n = ed().nodes.find((x) => x.id === id);
    if (!n || n.type !== 'component') throw new Error('not a component');
    return n;
  };

  it('swaps the type in place and keeps every connection wired', () => {
    const lb = add('load-balancer');
    const app = add('app-server', 200, 0);
    const cache = add('in-memory-cache', 400, -100);
    const db = add('sql-db', 400, 100);
    ed().connect({ source: lb, target: app, sourceHandle: 'r', targetHandle: 'l' });
    ed().connect({ source: app, target: cache, sourceHandle: 't', targetHandle: 'l' });
    ed().connect({ source: app, target: db, sourceHandle: 'r', targetHandle: 'l' });
    const before = ed().edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }));
    const position = { ...comp(app).position };

    const result = ed().replaceComponent(app, 'microservice');
    expect(result).toEqual({ label: 'Microservice', connections: 3, keptSettings: [], droppedSettings: [] });
    expect(comp(app).data.componentType).toBe('microservice');
    expect(comp(app).data.label).toBe('Microservice');
    expect(comp(app).position).toEqual(position);
    expect(ed().edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }))).toEqual(before);
  });

  it('keeps custom names and numbers default names', () => {
    add('distributed-cache', 0, 200);
    const a = add('in-memory-cache');
    const b = add('app-server', 200, 0);
    ed().updateNodeData(b, { label: 'Order Service' });
    ed().replaceComponent(a, 'distributed-cache');
    ed().replaceComponent(b, 'microservice');
    expect(comp(a).data.label).toBe('Distributed Cache 2');
    expect(comp(b).data.label).toBe('Order Service');
  });

  it('carries over only the settings the new component supports', () => {
    const app = add('app-server');
    ed().setNodeProp(app, 'instances', 'autoscaled');
    ed().setNodeProp(app, 'timeout', 'short');
    ed().setNodeProp(app, 'stateless', true);
    const result = ed().replaceComponent(app, 'background-worker');
    expect(result?.keptSettings).toEqual(['instances']);
    expect(result?.droppedSettings.sort()).toEqual(['stateless', 'timeout']);
    expect(comp(app).data.props).toEqual({ instances: 'autoscaled' });
  });

  it('re-detects untouched connection defaults but keeps customised connections and labels', () => {
    const app = add('app-server');
    const queue = add('message-queue', 200, 0);
    const other = add('app-server', 0, 200);
    ed().connect({ source: app, target: queue, sourceHandle: 'r', targetHandle: 'l' });
    ed().connect({ source: other, target: queue, sourceHandle: 'r', targetHandle: 'l' });
    const [untouched, custom] = ed().edges;
    ed().updateEdgeProps(untouched!.id, { label: 'store orders' });
    ed().updateEdgeProps(custom!.id, { critical: true });
    expect(untouched!.data!.props.mode).toBe('async');

    ed().replaceComponent(queue, 'sql-db');
    const after = (id: string) => ed().edges.find((e) => e.id === id)!.data!.props;
    expect(after(untouched!.id).mode).toBe('sync');
    expect(after(untouched!.id).protocol).not.toBe('queue');
    expect(after(untouched!.id).label).toBe('store orders');
    // The customised connection is left exactly as the user set it.
    expect(after(custom!.id).critical).toBe(true);
    expect(after(custom!.id).mode).toBe('async');
  });

  it('is a single undo step', () => {
    const app = add('app-server');
    const db = add('sql-db', 200, 0);
    ed().connect({ source: app, target: db, sourceHandle: 'r', targetHandle: 'l' });
    ed().setNodeProp(db, 'replication', 'leader-follower-sync');
    const snapshot = JSON.stringify(ed().snapshot());
    ed().replaceComponent(db, 'nosql-db');
    expect(comp(db).data.componentType).toBe('nosql-db');
    ed().undo();
    expect(JSON.stringify(ed().snapshot())).toBe(snapshot);
    ed().redo();
    expect(comp(db).data.componentType).toBe('nosql-db');
  });

  it('ignores invalid replacements', () => {
    const app = add('app-server');
    const note = ed().addNote({ x: 0, y: 200 });
    expect(ed().replaceComponent(app, 'app-server')).toBeNull();
    expect(ed().replaceComponent(app, 'not-a-component')).toBeNull();
    expect(ed().replaceComponent(note, 'sql-db')).toBeNull();
    expect(ed().replaceComponent('missing', 'sql-db')).toBeNull();
  });
});
