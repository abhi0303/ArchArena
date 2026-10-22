import { getComponent } from '../catalog/components';
import type { DiagramGraph, GraphNode, Selector } from '../diagram/graph';
import type { DiagramSnapshot } from '../diagram/types';
import type { Difficulty } from '../questions/types';
import { isRedundant } from './rules';
import type { Rubric, ScoreCategoryKey, StructuralIssue } from './types';

const has = (n: GraphNode | undefined, ...tags: string[]) => !!n?.def && tags.some((t) => n.def!.tags.includes(t as never));

/** Passive stores answer requests; they should not initiate calls to services or clients. */
const isPassiveStore = (n: GraphNode | undefined) =>
  has(n, 'db', 'cache', 'search-index', 'warehouse', 'store') && !has(n, 'channel', 'blob', 'edge', 'dlq');

/** Stores a client must never talk to directly. */
const isPrivateStore = (n: GraphNode | undefined) => has(n, 'db', 'cache', 'search-index', 'warehouse', 'channel', 'tsdb', 'graph') && !has(n, 'edge');

/** Penalty caps per issue code so a single repeated mistake cannot zero a whole category. */
const PENALTY_CAPS: Record<string, number> = {
  'broken-edge': 0.3,
  'self-loop': 0.2,
  'duplicate-edge': 0.2,
  'isolated-component': 0.45,
  'disconnected-cluster': 0.3,
  'client-to-store': 0.45,
  'store-initiates': 0.3,
  'channel-no-producer': 0.4,
  'channel-no-consumer': 0.4,
  'worker-no-input': 0.25,
  'push-to-client': 0.15,
  'client-to-client': 0.15,
  'exposed-service': 0.3,
  spof: 0.45,
  'discouraged-component': 0.6,
  'excess-components': 0.4,
};

export interface StructuralContext {
  graph: DiagramGraph;
  diagram: DiagramSnapshot;
  rubric: Rubric;
  difficulty: Difficulty;
}

function issue(
  code: string,
  severity: StructuralIssue['severity'],
  category: ScoreCategoryKey,
  penalty: number,
  title: string,
  message: string,
  fix: string,
  nodeIds: string[] = [],
  edgeIds: string[] = [],
  bucket?: StructuralIssue['bucket'],
): StructuralIssue {
  return { code, severity, category, penalty, title, message, fix, nodeIds, edgeIds, bucket };
}

/** Generic checks that apply to every question (configurable through rubric.structural). */
export function analyzeStructure({ graph: g, diagram, rubric, difficulty }: StructuralContext): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const opts = rubric.structural ?? {};
  const clientSel: Selector = opts.clientSelector ?? { tags: ['client'] };
  const clientIds = new Set(g.match(clientSel).map((n) => n.id));
  const isClient = (id: string) => clientIds.has(id);

  // Broken / self / duplicate edges.
  for (const e of g.brokenEdges) {
    issues.push(
      issue('broken-edge', 'error', 'connections', 0.1, 'Broken connection', 'A connection points to a component that no longer exists.', 'Delete the dangling connection.', [], [e.id], 'invalid-connection'),
    );
  }
  const seenPairs = new Map<string, string>();
  for (const e of g.edges) {
    if (e.source === e.target) {
      issues.push(
        issue('self-loop', 'error', 'connections', 0.1, 'Self connection', `${g.labelOf(e.source)} is connected to itself.`, 'Remove the self connection; it does not describe a real data flow.', [e.source], [e.id], 'invalid-connection'),
      );
      continue;
    }
    const key = `${e.source}->${e.target}`;
    if (seenPairs.has(key)) {
      issues.push(
        issue('duplicate-edge', 'warning', 'simplicity', 0.1, 'Duplicate connection', `${g.labelOf(e.source)} → ${g.labelOf(e.target)} is drawn more than once.`, 'Keep a single connection and describe it with its properties.', [], [e.id], 'complexity'),
      );
    }
    seenPairs.set(key, e.id);
  }

  // No clients at all.
  if (!clientIds.size) {
    issues.push(
      issue(
        'no-client',
        'error',
        'connections',
        0.25,
        'No client or entry point',
        'There is no client on the canvas, so no request flow can start.',
        'Add the clients that use this system (web, mobile or calling services) and connect them to your entry point.',
        [],
        [],
        'disconnected',
      ),
    );
  }

  // Isolated components.
  for (const n of g.nodes) {
    if (g.degree(n.id) === 0) {
      issues.push(
        issue(
          'isolated-component',
          'warning',
          'connections',
          0.08,
          'Unconnected component',
          `${n.label} is not connected to anything, so it does not take part in any flow.`,
          `Connect ${n.label} to the components that use it, or remove it.`,
          [n.id],
          [],
          'disconnected',
        ),
      );
    }
  }

  // Clusters that cannot be reached from any client.
  if (clientIds.size) {
    for (const group of g.connectedComponents()) {
      if (group.length < 2) continue;
      if (group.some(isClient)) continue;
      issues.push(
        issue(
          'disconnected-cluster',
          'warning',
          'connections',
          0.12,
          'Disconnected part of the design',
          `${group.map((id) => g.labelOf(id)).slice(0, 4).join(', ')} ${group.length > 4 ? '…' : ''} form a group that no client request can reach.`,
          'Connect this group to the main flow so it actually serves user requests.',
          group,
          [],
          'disconnected',
        ),
      );
    }
  }

  for (const e of g.edges) {
    if (e.source === e.target) continue;
    const s = g.node(e.source);
    const t = g.node(e.target);

    // Clients talking straight to private stores.
    if (isClient(e.source) && isPrivateStore(t)) {
      issues.push(
        issue(
          'client-to-store',
          'error',
          'connections',
          0.18,
          'Client accesses a backend store directly',
          `${s!.label} connects directly to ${t!.label}. Clients should never reach databases, caches or queues directly — it bypasses validation, authorization and rate limiting.`,
          `Route ${s!.label} through an entry point and an application service that owns access to ${t!.label}.`,
          [e.source, e.target],
          [e.id],
          'security',
        ),
      );
    }

    // Stores initiating requests towards services or clients.
    if (isPassiveStore(s) && !isPassiveStore(t) && !has(t, 'channel', 'dlq', 'replica', 'stream-processing', 'batch')) {
      issues.push(
        issue(
          'store-initiates',
          'warning',
          'connections',
          0.08,
          'Connection direction looks reversed',
          `${s!.label} → ${t!.label}: data stores answer requests rather than calling other components.`,
          `Reverse the arrow so it points from ${t!.label} (the caller) to ${s!.label}. For change-data-capture, connect the store to an event stream instead.`,
          [e.source, e.target],
          [e.id],
          'invalid-connection',
        ),
      );
    }

    // Edges into clients from components that cannot push.
    if (isClient(e.target) && !isClient(e.source) && !has(s, 'realtime', 'push', 'notification', 'provider', 'edge', 'media')) {
      issues.push(
        issue(
          'push-to-client',
          'info',
          'connections',
          0.04,
          'Unusual connection into a client',
          `${s!.label} → ${t!.label}: responses flow back automatically, so arrows normally start at the client.`,
          `Reverse the arrow (client → ${s!.label}). Only push channels such as WebSockets or push providers should point at clients.`,
          [e.source, e.target],
          [e.id],
          'invalid-connection',
        ),
      );
    }

    if (isClient(e.source) && isClient(e.target)) {
      issues.push(
        issue('client-to-client', 'warning', 'connections', 0.06, 'Client-to-client connection', `${s!.label} → ${t!.label} skips the backend entirely.`, 'Clients should communicate through your backend (or a media server for calls).', [e.source, e.target], [e.id], 'invalid-connection'),
      );
    }
  }

  // Queues and streams need producers and consumers.
  for (const n of g.nodes) {
    if (!has(n, 'channel')) continue;
    if (!g.incoming(n.id).length) {
      issues.push(
        issue('channel-no-producer', 'error', 'connections', 0.15, 'Queue without producer', `Nothing publishes to ${n.label}, so it will always be empty.`, `Connect the service that produces messages to ${n.label}.`, [n.id], [], 'invalid-connection'),
      );
    }
    if (!g.outgoing(n.id).length) {
      issues.push(
        issue('channel-no-consumer', 'error', 'connections', 0.15, 'Queue without consumer', `Nothing consumes from ${n.label}, so messages pile up forever.`, `Connect a worker or consumer that reads from ${n.label} (arrow from the queue to the consumer).`, [n.id], [], 'invalid-connection'),
      );
    }
  }

  // Workers with no source of work.
  for (const n of g.nodes) {
    if (!has(n, 'worker', 'consumer', 'stream-processing') || has(n, 'service')) continue;
    if (g.degree(n.id) === 0) continue; // already reported as isolated
    if (!g.incoming(n.id).length) {
      issues.push(
        issue('worker-no-input', 'warning', 'connections', 0.08, 'Worker without input', `${n.label} has no incoming connection, so nothing triggers its work.`, `Connect a queue, stream or scheduler to ${n.label}.`, [n.id], [], 'invalid-connection'),
      );
    }
  }

  // Services exposed directly to clients.
  const exposed = opts.exposedServices ?? (difficulty === 'easy' ? 'info' : 'warn');
  if (exposed !== 'off') {
    for (const e of g.edges) {
      const t = g.node(e.target);
      if (!isClient(e.source) || !has(t, 'service') || has(t, 'entry', 'media')) continue;
      const severity = exposed === 'warn' && !has(t, 'realtime') ? 'warning' : 'info';
      issues.push(
        issue(
          'exposed-service',
          severity,
          'reliability',
          severity === 'warning' ? 0.1 : 0.02,
          'Service exposed directly to clients',
          `${g.labelOf(e.source)} calls ${t!.label} directly, with no load balancer or gateway in front.`,
          'Put a load balancer or API gateway in front of client-facing services: it adds health checks, TLS termination, authentication and lets you scale instances behind it.',
          [e.source, e.target],
          [e.id],
          'security',
        ),
      );
    }
  }

  // Single points of failure on the main request path.
  const spof = opts.spof ?? (difficulty === 'easy' ? 'info' : 'warn');
  if (spof !== 'off' && clientIds.size) {
    const fromClients = g.reachable([...clientIds]);
    for (const n of g.nodes) {
      if (!fromClients.has(n.id) || isClient(n.id)) continue;
      const relevant = has(n, 'service', 'entry', 'realtime') || (has(n, 'db') && !has(n, 'replica'));
      if (!relevant || isRedundant(n, g)) continue;
      const isData = has(n, 'db');
      issues.push(
        issue(
          'spof',
          spof === 'warn' ? 'warning' : 'info',
          'reliability',
          spof === 'warn' ? 0.12 : 0.04,
          'Single point of failure',
          `${n.label} runs as a single ${isData ? 'database without replication' : 'instance'}; if it fails, requests that depend on it fail too.`,
          isData
            ? `Configure replication on ${n.label} (or attach a read replica) so a standby can take over.`
            : `Set “Instances” on ${n.label} to multiple or autoscaled, behind a load balancer.`,
          [n.id],
          [],
          'bottleneck',
        ),
      );
    }
  }

  // Components that only add complexity for this question.
  for (const d of rubric.discouraged ?? []) {
    const found = g.nodes.filter((n) => d.types.includes(n.type));
    if (!found.length) continue;
    issues.push(
      issue(
        'discouraged-component',
        'warning',
        'simplicity',
        0.3,
        'Unnecessary component',
        `${found.map((n) => n.label).join(', ')}: ${d.reason}`,
        `Consider removing ${found.length > 1 ? 'these components' : found[0]!.label} to keep the design focused.`,
        found.map((n) => n.id),
        [],
        'complexity',
      ),
    );
  }

  const reference = rubric.referenceSize ?? 8;
  const maxComponents = opts.maxComponents ?? Math.max(reference * 2, reference + 8);
  if (g.size > maxComponents) {
    issues.push(
      issue(
        'excess-components',
        'warning',
        'simplicity',
        0.4,
        'Design is larger than needed',
        `The design uses ${g.size} components; a solid answer needs around ${reference}. Extra pieces add cost, latency and failure points.`,
        'Remove components that do not serve a requirement, or merge responsibilities that do not need separate services.',
        [],
        [],
        'complexity',
      ),
    );
  }

  void diagram;
  return issues;
}

/** Sums penalties per category, respecting per-code caps. */
export function penaltiesByCategory(issues: StructuralIssue[]): Map<ScoreCategoryKey, { total: number; byCode: Map<string, number> }> {
  const out = new Map<ScoreCategoryKey, { total: number; byCode: Map<string, number> }>();
  for (const i of issues) {
    if (!out.has(i.category)) out.set(i.category, { total: 0, byCode: new Map() });
    const bucket = out.get(i.category)!;
    const used = bucket.byCode.get(i.code) ?? 0;
    const cap = PENALTY_CAPS[i.code] ?? 0.3;
    const add = Math.max(0, Math.min(i.penalty, cap - used));
    bucket.byCode.set(i.code, used + add);
    bucket.total += add;
  }
  return out;
}

export function componentLabel(type: string): string {
  return getComponent(type)?.label ?? type;
}
