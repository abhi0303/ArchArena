import { getComponent } from '@arch-arena/shared';
import type { Bi, Scene, SceneAccent, SceneEdge, SceneEdgeKind, SceneNode, SceneNodeState, Text } from './types';

/**
 * Tiny helpers for writing learning content compactly.
 *
 *   scene(
 *     [[a('users', 'Users', 'Users')], [c('load-balancer', { state: 'focus' })], [c('app-server', { id: 's1' }), c('app-server', { id: 's2' })]],
 *     ['users>load-balancer', 'load-balancer>s1', ['load-balancer>s2', 'spread']],
 *     bi('caption', 'caption in Hinglish'),
 *   )
 *
 * Edge syntax: `a>b` request flow · `a~>b` asynchronous / later · `a!>b` broken or harmful ·
 * `a.>b` optional / rare · `a<>b` two-way live traffic.
 */

export const bi = (en: string, hi: string): Bi => ({ en, hi });

interface NodeOptions {
  id?: string;
  label?: Text;
  note?: Text;
  state?: SceneNodeState;
}

/** A catalog component (icon, colour and name come from the catalog). */
export function c(type: string, o: NodeOptions = {}): SceneNode {
  const def = getComponent(type);
  if (!def) throw new Error(`Unknown component type "${type}" in learning content`);
  return {
    id: o.id ?? type,
    icon: def.icon,
    label: o.label ?? def.label,
    accent: def.accent,
    note: o.note,
    state: o.state ?? 'normal',
  };
}

/** Any other actor or thing (people, phones, files…). */
export function a(id: string, icon: string, label: Text, o: Omit<NodeOptions, 'id' | 'label'> & { accent?: SceneAccent } = {}): SceneNode {
  return { id, icon, label, accent: o.accent ?? 'slate', note: o.note, state: o.state ?? 'normal' };
}

export type EdgeInput = string | [spec: string, label?: Text];

function parseEdge(input: EdgeInput): SceneEdge {
  const [spec, label] = typeof input === 'string' ? [input, undefined] : input;
  const m = /^(.+?)(<>|~>|!>|\.>|>)(.+)$/.exec(spec);
  if (!m) throw new Error(`Invalid scene edge "${spec}"`);
  const [, from, op, to] = m;
  const kind: SceneEdgeKind = op === '~>' ? 'async' : op === '!>' ? 'bad' : op === '.>' ? 'muted' : 'flow';
  return { from: from!.trim(), to: to!.trim(), kind, label, both: op === '<>' };
}

export function scene(cols: SceneNode[][], edges: EdgeInput[], caption: Bi): Scene {
  return { cols, edges: edges.map(parseEdge), caption };
}
