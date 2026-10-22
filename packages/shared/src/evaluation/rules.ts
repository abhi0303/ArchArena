import { getComponent, type ComponentTag } from '../catalog/components';
import { describePropertyValue, getPropertyField } from '../catalog/properties';
import type { DiagramGraph, GraphNode, Selector } from '../diagram/graph';
import type { CheckStatus, Rule, RuleResult } from './types';

const TAG_NAMES: Partial<Record<ComponentTag, string>> = {
  client: 'a client',
  dns: 'DNS',
  edge: 'an edge component',
  cdn: 'a CDN',
  lb: 'a load balancer',
  gateway: 'an API gateway',
  proxy: 'a reverse proxy',
  entry: 'an entry point (load balancer / gateway / proxy)',
  compute: 'a compute component',
  service: 'an application service',
  auth: 'an authentication component',
  worker: 'a background worker',
  consumer: 'a consumer',
  realtime: 'a real-time connection server',
  db: 'a database',
  sql: 'a SQL database',
  nosql: 'a NoSQL database',
  replica: 'a read replica',
  sharded: 'a sharded database',
  persistent: 'persistent storage',
  store: 'a data store',
  blob: 'object storage',
  'search-index': 'a search index',
  warehouse: 'a data warehouse',
  analytics: 'an analytics store',
  cache: 'a cache',
  'edge-cache': 'an edge cache',
  queue: 'a queue',
  stream: 'an event stream',
  channel: 'a queue or event stream',
  dlq: 'a dead-letter queue',
  scheduler: 'a scheduler',
  'rate-limit': 'a rate limiter',
  notification: 'a notification component',
  provider: 'an external provider',
  external: 'an external service',
  payment: 'a payment provider',
  search: 'a search service',
  observability: 'observability (logs / metrics / tracing)',
  logging: 'a logging service',
  metrics: 'metrics & monitoring',
  tracing: 'distributed tracing',
  security: 'a security component',
  secrets: 'a secrets manager',
  config: 'a configuration service',
  push: 'a push notification provider',
  media: 'a media component',
  'stream-processing': 'a stream processor',
  batch: 'a batch processor',
  ml: 'an ML component',
  geo: 'a geospatial index',
  'id-gen': 'an ID generator',
  coordination: 'a coordination service',
  sandbox: 'a sandboxed runner',
  tsdb: 'a time-series database',
  graph: 'a graph database',
  waf: 'a web application firewall',
  idp: 'an identity provider',
  matching: 'a matching engine',
};

export function describeSelector(sel: Selector): string {
  if (sel.name) return sel.name;
  const parts: string[] = [];
  for (const t of sel.types ?? []) parts.push(getComponent(t)?.label ?? t);
  for (const t of sel.tags ?? []) parts.push(TAG_NAMES[t] ?? t);
  let base = parts.length ? parts.join(' or ') : 'a component';
  if (sel.labels?.length) base += ` named like “${sel.labels[0]}”`;
  if (sel.where) {
    const field = getPropertyField(sel.where.key);
    base += ` with ${field?.label ?? sel.where.key} = ${sel.where.values.map((v) => describePropertyValue(sel.where!.key, v)).join(' / ')}`;
  }
  return base;
}

const STATUS_RANK: Record<CheckStatus, number> = { pass: 3, partial: 2, 'needs-config': 1, fail: 0 };

export function statusFraction(status: CheckStatus): number {
  return status === 'pass' ? 1 : status === 'partial' ? 0.5 : 0;
}

const result = (status: CheckStatus, detail: string, nodeIds: string[] = [], edgeIds: string[] = []): RuleResult => ({
  status,
  detail,
  nodeIds,
  edgeIds,
});

const names = (nodes: GraphNode[], max = 3) => {
  const labels = nodes.slice(0, max).map((n) => n.label);
  return labels.join(', ') + (nodes.length > max ? ` and ${nodes.length - max} more` : '');
};

/** True when a component is not a single point of failure. */
export function isRedundant(node: GraphNode, g: DiagramGraph): boolean {
  const p = node.props;
  const str = (k: string) => (p[k] === undefined ? '' : String(p[k]));
  if (['multiple', 'autoscaled'].includes(str('instances'))) return true;
  if (['managed-ha', 'active-passive'].includes(str('availability'))) return true;
  if (str('replication') && str('replication') !== 'none') return true;
  if (Number(str('replicationFactor')) >= 2) return true;
  if (['replicas', 'cluster'].includes(str('cacheReplication'))) return true;
  if (str('deployment').startsWith('multi-region')) return true;
  if (Number(str('ensembleSize')) >= 3) return true;
  if (str('standby') === 'hot-standby') return true;
  if (node.def?.tags.includes('managed')) return true;
  // Managed load balancers and gateways are highly available unless explicitly configured otherwise.
  if ((node.def?.tags.includes('lb') || node.def?.tags.includes('gateway')) && str('availability') !== 'single-instance') return true;
  // A replica attached to this store.
  if (g.outgoing(node.id).some((id) => g.node(id)?.def?.tags.includes('replica'))) return true;
  // Sibling instances of the same type behind a common upstream component.
  const ups = new Set(g.incoming(node.id));
  if (
    ups.size &&
    g.nodes.some((o) => o.id !== node.id && o.type === node.type && g.incoming(o.id).some((u) => ups.has(u)))
  ) {
    return true;
  }
  return false;
}

export function evaluateRule(rule: Rule, g: DiagramGraph): RuleResult {
  switch (rule.kind) {
    case 'has': {
      const all = g.match(rule.sel);
      // Components that are not connected to anything do not take part in the system yet.
      const found = all.filter((n) => g.degree(n.id) > 0);
      const min = rule.min ?? 1;
      const what = describeSelector(rule.sel);
      if (found.length >= min) return result('pass', `Found ${names(found)}.`, found.map((n) => n.id));
      if (found.length > 0) {
        return result('partial', `Found ${found.length} of the ${min} expected (${what}).`, found.map((n) => n.id));
      }
      if (all.length > 0) {
        return result('partial', `${names(all)} ${all.length > 1 ? 'are' : 'is'} on the canvas but not connected to anything yet.`, all.map((n) => n.id));
      }
      return result('fail', `No ${what.replace(/^(a|an) /, '')} on the canvas.`);
    }

    case 'path': {
      const path = g.findPath(rule.from, rule.to, rule.via ?? [], rule.maxHops ?? 8);
      const fromName = describeSelector(rule.from);
      const toName = describeSelector(rule.to);
      if (path) return result('pass', `Flow found: ${g.describePath(path)}.`, path);
      const froms = g.match(rule.from);
      const tos = g.match(rule.to);
      if (!froms.length || !tos.length) {
        const missing = !froms.length ? fromName : toName;
        return result('fail', `Cannot trace this flow because there is no ${missing.replace(/^(a|an) /, '')}.`);
      }
      if (rule.via?.length) {
        const direct = g.findPath(rule.from, rule.to, [], rule.maxHops ?? 8);
        if (direct) {
          return result(
            'partial',
            `A flow exists (${g.describePath(direct)}) but it does not pass through ${rule.via.map(describeSelector).join(', then ')}.`,
            direct,
          );
        }
      }
      const reverse = g.findPath(rule.to, rule.from, [], rule.maxHops ?? 8);
      if (reverse) {
        return result(
          'partial',
          `${toName} and ${fromName} are connected, but the arrows point the wrong way (${g.describePath(reverse)}).`,
          reverse,
        );
      }
      return result('fail', `There is no connected flow from ${fromName} to ${toName}.`, [...froms, ...tos].map((n) => n.id));
    }

    case 'edge': {
      const froms = g.match(rule.from);
      const tos = g.match(rule.to);
      const fromName = describeSelector(rule.from);
      const toName = describeSelector(rule.to);
      if (!froms.length || !tos.length) {
        return result('fail', `Missing ${(!froms.length ? fromName : toName).replace(/^(a|an) /, '')} for this connection.`);
      }
      const direct = g.directEdges(froms, tos);
      const callers = new Set(direct.map((e) => (froms.some((f) => f.id === e.source) ? e.source : e.target)));
      if (rule.min && callers.size < rule.min && callers.size > 0) {
        return result(
          'partial',
          `Only ${callers.size} of the expected ${rule.min} components connect to ${toName}.`,
          [],
          direct.map((e) => e.id),
        );
      }
      if (direct.length) {
        return result(
          'pass',
          `Connected: ${direct.map((e) => `${g.labelOf(e.source)} → ${g.labelOf(e.target)}`).join('; ')}.`,
          [],
          direct.map((e) => e.id),
        );
      }
      const reversed = g.directEdges(tos, froms);
      if (reversed.length) {
        return result(
          'partial',
          `The connection exists but points the wrong way (${g.labelOf(reversed[0]!.source)} → ${g.labelOf(reversed[0]!.target)}). Arrows should go from the caller to the component it calls.`,
          [],
          reversed.map((e) => e.id),
        );
      }
      const indirect = g.findPath(rule.from, rule.to, [], 3);
      if (indirect) {
        return result('partial', `Only connected indirectly (${g.describePath(indirect)}).`, indirect);
      }
      return result('fail', `${fromName} is not connected to ${toName}.`, [...froms, ...tos].map((n) => n.id));
    }

    case 'async': {
      const channelSel: Selector = rule.channel ?? { tags: ['channel'] };
      const producers = new Set(g.match(rule.producer).map((n) => n.id));
      const consumers = new Set(g.match(rule.consumer).map((n) => n.id));
      const channels = g.match(channelSel);
      const prodName = describeSelector(rule.producer);
      const consName = describeSelector(rule.consumer);
      const chanName = describeSelector(channelSel);
      let best: RuleResult | null = null;
      for (const c of channels) {
        const ins = g.incoming(c.id).filter((id) => producers.has(id));
        const outs = g.outgoing(c.id).filter((id) => consumers.has(id));
        if (ins.length && outs.length) {
          return result(
            'pass',
            `Asynchronous flow: ${g.labelOf(ins[0]!)} → ${c.label} → ${g.labelOf(outs[0]!)}.`,
            [ins[0]!, c.id, outs[0]!],
          );
        }
        if ((ins.length || outs.length) && !best) {
          best = result(
            'partial',
            ins.length
              ? `${c.label} receives work from ${g.labelOf(ins[0]!)} but nothing matching ${consName} consumes it.`
              : `${c.label} feeds ${g.labelOf(outs[0]!)} but nothing matching ${prodName} publishes to it.`,
            [c.id],
          );
        }
      }
      if (best) return best;
      const sync = g.directEdges(g.match(rule.producer), g.match(rule.consumer));
      if (sync.length) {
        return result(
          'partial',
          `${g.labelOf(sync[0]!.source)} calls ${g.labelOf(sync[0]!.target)} directly. Put ${chanName} between them to decouple the work.`,
          [],
          sync.map((e) => e.id),
        );
      }
      if (!channels.length) return result('fail', `No ${chanName.replace(/^(a|an) /, '')} connects ${prodName} to ${consName}.`);
      return result('fail', `${chanName} is not wired between ${prodName} and ${consName}.`, channels.map((c) => c.id));
    }

    case 'guarded': {
      const froms = g.match(rule.from);
      const tos = g.match(rule.to);
      const guards = g.match(rule.guard);
      const guardName = describeSelector(rule.guard);
      const toName = describeSelector(rule.to);
      if (!froms.length || !tos.length) return result('fail', `Cannot check this flow: missing ${(!froms.length ? describeSelector(rule.from) : toName).replace(/^(a|an) /, '')}.`);
      const toIds = new Set(tos.map((n) => n.id));
      const reach = g.reachable(froms.map((n) => n.id));
      if (![...toIds].some((id) => reach.has(id))) {
        return result('fail', `${toName} is not reachable from ${describeSelector(rule.from)}.`);
      }
      if (!guards.length) return result('fail', `No ${guardName.replace(/^(a|an) /, '')} protects requests to ${toName}.`);
      const blocked = new Set(guards.map((n) => n.id));
      const bypass = g.findPath(rule.from, rule.to, [], 12, blocked);
      if (bypass) {
        return result('partial', `Some traffic bypasses ${guardName}: ${g.describePath(bypass)}.`, bypass);
      }
      const through = g.findPath(rule.from, rule.to, [rule.guard], 12);
      return result('pass', through ? `All requests pass through ${guardName}: ${g.describePath(through)}.` : `All requests pass through ${guardName}.`, through ?? []);
    }

    case 'redundant': {
      const all = g.match(rule.sel);
      const found = all.filter((n) => g.degree(n.id) > 0);
      const what = describeSelector(rule.sel);
      if (!found.length && all.length) return result('fail', `${names(all)} is not connected to the rest of the design yet.`, all.map((n) => n.id));
      if (!found.length) return result('fail', `No ${what.replace(/^(a|an) /, '')} to make redundant.`);
      const redundant = found.filter((n) => isRedundant(n, g));
      if (redundant.length === found.length) return result('pass', `${names(found)} ${found.length > 1 ? 'are' : 'is'} redundant.`, found.map((n) => n.id));
      const single = found.filter((n) => !redundant.includes(n));
      if (redundant.length) {
        return result('partial', `${names(single)} still run${single.length === 1 ? 's' : ''} as a single instance.`, single.map((n) => n.id));
      }
      return result(
        'fail',
        `${names(single)} ${single.length > 1 ? 'are single points' : 'is a single point'} of failure (no extra instances, replicas or replication configured).`,
        single.map((n) => n.id),
      );
    }

    case 'prop': {
      const all = g.match(rule.sel);
      const found = all.filter((n) => g.degree(n.id) > 0);
      const field = getPropertyField(rule.key);
      const fieldName = field?.label ?? rule.key;
      const what = describeSelector(rule.sel);
      if (!found.length && all.length) return result('fail', `${names(all)} is not connected to the rest of the design yet.`, all.map((n) => n.id));
      if (!found.length) return result('fail', `No ${what.replace(/^(a|an) /, '')} to configure.`);
      const configured = found.filter((n) => n.props[rule.key] !== undefined && n.props[rule.key] !== '');
      if (!configured.length) {
        return result(
          'needs-config',
          `Not assessed yet: set “${fieldName}” on ${names(found)} so the evaluator can verify this.`,
          found.map((n) => n.id),
        );
      }
      const good = rule.values ? configured.filter((n) => rule.values!.includes(String(n.props[rule.key]))) : configured;
      if (good.length) {
        const n = good[0]!;
        return result('pass', `${n.label}: ${fieldName} = ${describePropertyValue(rule.key, n.props[rule.key])}.`, good.map((x) => x.id));
      }
      const n = configured[0]!;
      const want = (rule.values ?? []).map((v) => describePropertyValue(rule.key, v)).join(' or ');
      return result(
        'partial',
        `${n.label} has ${fieldName} = ${describePropertyValue(rule.key, n.props[rule.key])}; this requirement needs ${want}.`,
        configured.map((x) => x.id),
      );
    }

    case 'edgeProp': {
      const edges = g.directEdges(g.match(rule.from), g.match(rule.to));
      if (!edges.length) {
        return result('fail', `No connection from ${describeSelector(rule.from)} to ${describeSelector(rule.to)}.`);
      }
      const good = edges.filter((e) => rule.values.includes(String(e.props?.[rule.key])));
      if (good.length) return result('pass', `Connection ${g.labelOf(good[0]!.source)} → ${g.labelOf(good[0]!.target)} is ${String(good[0]!.props[rule.key])}.`, [], good.map((e) => e.id));
      return result(
        'partial',
        `Connection ${g.labelOf(edges[0]!.source)} → ${g.labelOf(edges[0]!.target)} is ${String(edges[0]!.props?.[rule.key])}; expected ${rule.values.join(' or ')}.`,
        [],
        edges.map((e) => e.id),
      );
    }

    case 'absent': {
      const found = g.match(rule.sel);
      if (!found.length) return result('pass', `No ${describeSelector(rule.sel).replace(/^(a|an) /, '')} present.`);
      return result('fail', `Found ${names(found)}, which should not be part of this design.`, found.map((n) => n.id));
    }

    case 'noEdge': {
      const edges = g.directEdges(g.match(rule.from), g.match(rule.to));
      if (!edges.length) return result('pass', `No direct connection from ${describeSelector(rule.from)} to ${describeSelector(rule.to)}.`);
      return result(
        'fail',
        `Direct connection ${g.labelOf(edges[0]!.source)} → ${g.labelOf(edges[0]!.target)} should not exist.`,
        [],
        edges.map((e) => e.id),
      );
    }

    case 'any': {
      const results = rule.rules.map((r) => evaluateRule(r, g));
      return results.reduce((best, r) => (STATUS_RANK[r.status] > STATUS_RANK[best.status] ? r : best));
    }

    case 'all': {
      const results = rule.rules.map((r) => evaluateRule(r, g));
      const passed = results.filter((r) => r.status === 'pass');
      const nodeIds = results.flatMap((r) => r.nodeIds);
      const edgeIds = results.flatMap((r) => r.edgeIds);
      if (passed.length === results.length) return result('pass', results.map((r) => r.detail).join(' '), nodeIds, edgeIds);
      const failing = results.filter((r) => r.status !== 'pass');
      const detail = failing.map((r) => r.detail).join(' ');
      if (passed.length || results.some((r) => r.status === 'partial')) return result('partial', detail, nodeIds, edgeIds);
      if (results.some((r) => r.status === 'needs-config')) return result('needs-config', detail, nodeIds, edgeIds);
      return result('fail', detail, nodeIds, edgeIds);
    }
  }
}

/** Collects every component type and tag referenced by a rule (used to validate question data). */
export function collectRuleSelectors(rule: Rule): Selector[] {
  switch (rule.kind) {
    case 'has':
    case 'redundant':
    case 'prop':
    case 'absent':
      return [rule.sel];
    case 'path':
      return [rule.from, rule.to, ...(rule.via ?? [])];
    case 'edge':
    case 'edgeProp':
    case 'noEdge':
      return [rule.from, rule.to];
    case 'async':
      return [rule.producer, rule.consumer, ...(rule.channel ? [rule.channel] : [])];
    case 'guarded':
      return [rule.from, rule.to, rule.guard];
    case 'any':
    case 'all':
      return rule.rules.flatMap(collectRuleSelectors);
  }
}

/** True when a rule is fundamentally about a component being present. */
export function isPresenceRule(rule: Rule): boolean {
  if (rule.kind === 'has') return true;
  if (rule.kind === 'any' || rule.kind === 'all') return rule.rules.every(isPresenceRule);
  return false;
}

export function isConnectionRule(rule: Rule): boolean {
  if (['path', 'edge', 'async', 'guarded'].includes(rule.kind)) return true;
  if (rule.kind === 'any' || rule.kind === 'all') return rule.rules.some(isConnectionRule);
  return false;
}
