import { getComponent, type ComponentDefinition, type ComponentTag } from '../catalog/components';
import type { ConnectionProps } from '../catalog/connections';
import type { PropertyValue } from '../catalog/properties';
import type { DiagramSnapshot } from './types';

/**
 * Selects components on the canvas.
 * A node matches when (its type is in `types` OR it has one of `tags`) AND, if given,
 * its label/role contains one of `labels` AND its property matches `where`.
 * With neither `types` nor `tags`, any component matches the first clause.
 */
export interface Selector {
  types?: string[];
  tags?: ComponentTag[];
  labels?: string[];
  where?: { key: string; values: string[] };
  /** Human name used in feedback, e.g. "a cache". */
  name?: string;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  props: Record<string, PropertyValue>;
  def?: ComponentDefinition;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  props: ConnectionProps;
}

export class DiagramGraph {
  readonly nodes: GraphNode[];
  readonly edges: GraphEdge[];
  /** Edges that reference missing or non-component nodes. */
  readonly brokenEdges: { id: string; source: string; target: string }[];
  private readonly byId = new Map<string, GraphNode>();
  private readonly out = new Map<string, string[]>();
  private readonly inc = new Map<string, string[]>();

  constructor(diagram: DiagramSnapshot) {
    this.nodes = diagram.nodes
      .filter((n) => n.kind === 'component' && n.componentType)
      .map((n) => ({
        id: n.id,
        type: n.componentType as string,
        label: n.label || getComponent(n.componentType as string)?.label || n.componentType!,
        props: n.props ?? {},
        def: getComponent(n.componentType as string),
      }));
    for (const n of this.nodes) {
      this.byId.set(n.id, n);
      this.out.set(n.id, []);
      this.inc.set(n.id, []);
    }
    this.edges = [];
    this.brokenEdges = [];
    const allIds = new Set(diagram.nodes.map((n) => n.id));
    for (const e of diagram.edges) {
      const ok = this.byId.has(e.source) && this.byId.has(e.target);
      if (!ok) {
        // Edges touching notes/groups are decorative; edges to missing nodes are broken.
        if (!allIds.has(e.source) || !allIds.has(e.target)) {
          this.brokenEdges.push({ id: e.id, source: e.source, target: e.target });
        }
        continue;
      }
      this.edges.push({ id: e.id, source: e.source, target: e.target, props: e.props });
      this.out.get(e.source)!.push(e.target);
      this.inc.get(e.target)!.push(e.source);
      if (e.props?.direction === 'bidirectional') {
        this.out.get(e.target)!.push(e.source);
        this.inc.get(e.source)!.push(e.target);
      }
    }
  }

  node(id: string): GraphNode | undefined {
    return this.byId.get(id);
  }

  get size(): number {
    return this.nodes.length;
  }

  matches(node: GraphNode, sel: Selector): boolean {
    const hasTypeClause = (sel.types?.length ?? 0) > 0 || (sel.tags?.length ?? 0) > 0;
    if (hasTypeClause) {
      const typeHit = sel.types?.includes(node.type) ?? false;
      const tagHit = sel.tags?.some((t) => node.def?.tags.includes(t)) ?? false;
      if (!typeHit && !tagHit) return false;
    }
    if (sel.labels?.length) {
      const hay = `${node.label} ${String(node.props.role ?? '')}`.toLowerCase();
      if (!sel.labels.some((l) => hay.includes(l.toLowerCase()))) return false;
    }
    if (sel.where) {
      const v = node.props[sel.where.key];
      if (v === undefined || !sel.where.values.includes(String(v))) return false;
    }
    return true;
  }

  match(sel: Selector): GraphNode[] {
    return this.nodes.filter((n) => this.matches(n, sel));
  }

  outgoing(id: string): string[] {
    return this.out.get(id) ?? [];
  }

  incoming(id: string): string[] {
    return this.inc.get(id) ?? [];
  }

  degree(id: string): number {
    return this.outgoing(id).length + this.incoming(id).length;
  }

  /** Direct edges (respecting bidirectional edges) from any node in `from` to any node in `to`. */
  directEdges(from: GraphNode[], to: GraphNode[]): GraphEdge[] {
    const fromIds = new Set(from.map((n) => n.id));
    const toIds = new Set(to.map((n) => n.id));
    return this.edges.filter(
      (e) =>
        (fromIds.has(e.source) && toIds.has(e.target)) ||
        (e.props?.direction === 'bidirectional' && fromIds.has(e.target) && toIds.has(e.source)),
    );
  }

  /** Nodes reachable from `start` following edge direction, optionally avoiding `blocked` nodes. */
  reachable(start: string[], blocked: Set<string> = new Set(), maxHops = 12): Set<string> {
    const seen = new Set<string>();
    let frontier = start.filter((s) => !blocked.has(s));
    let hops = 0;
    while (frontier.length && hops < maxHops) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const nb of this.outgoing(id)) {
          if (blocked.has(nb) || seen.has(nb)) continue;
          seen.add(nb);
          next.push(nb);
        }
      }
      frontier = next;
      hops++;
    }
    return seen;
  }

  /**
   * Shortest directed path from any `from` node to any `to` node that passes through
   * nodes matching each `via` selector in order. Returns node ids or null.
   */
  findPath(from: Selector, to: Selector, via: Selector[] = [], maxHops = 8, blocked: Set<string> = new Set()): string[] | null {
    const starts = this.match(from).filter((n) => !blocked.has(n.id));
    if (!starts.length) return null;
    type State = { id: string; stage: number };
    const key = (s: State) => `${s.id}|${s.stage}`;
    const parent = new Map<string, string | null>();
    let frontier: State[] = [];
    for (const s of starts) {
      const st = { id: s.id, stage: 0 };
      parent.set(key(st), null);
      frontier.push(st);
    }
    for (let hop = 0; hop < maxHops && frontier.length; hop++) {
      const next: State[] = [];
      for (const cur of frontier) {
        for (const nb of this.outgoing(cur.id)) {
          if (blocked.has(nb)) continue;
          const node = this.byId.get(nb)!;
          let stage = cur.stage;
          if (stage < via.length && this.matches(node, via[stage]!)) stage++;
          const st = { id: nb, stage };
          const k = key(st);
          // A target may also be a start node (e.g. service → service); accept it when reached via ≥1 hop.
          if (stage === via.length && this.matches(node, to) && nb !== cur.id) {
            const path: string[] = [nb];
            let p: string | null | undefined = key(cur);
            while (p) {
              path.unshift(p.split('|')[0]!);
              p = parent.get(p) ?? null;
            }
            return path;
          }
          if (parent.has(k)) continue;
          parent.set(k, key(cur));
          next.push(st);
        }
      }
      frontier = next;
    }
    return null;
  }

  /** Groups of nodes connected when edge direction is ignored. */
  connectedComponents(): string[][] {
    const seen = new Set<string>();
    const groups: string[][] = [];
    for (const n of this.nodes) {
      if (seen.has(n.id)) continue;
      const group: string[] = [];
      const stack = [n.id];
      seen.add(n.id);
      while (stack.length) {
        const id = stack.pop()!;
        group.push(id);
        for (const nb of [...this.outgoing(id), ...this.incoming(id)]) {
          if (!seen.has(nb)) {
            seen.add(nb);
            stack.push(nb);
          }
        }
      }
      groups.push(group);
    }
    return groups;
  }

  labelOf(id: string): string {
    return this.byId.get(id)?.label ?? id;
  }

  describePath(path: string[]): string {
    return path.map((id) => this.labelOf(id)).join(' → ');
  }
}
