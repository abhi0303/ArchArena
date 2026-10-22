/**
 * A compact authoring DSL for questions. It keeps 100 question files readable:
 * selectors (S), rule builders (R), reusable check templates (T) and `defineQuestion`.
 */
import type { ComponentCategoryId } from '../catalog/components';
import type { ConnectionProps } from '../catalog/connections';
import type { PropertyValue } from '../catalog/properties';
import type { Selector } from '../diagram/graph';
import type { Check, Rule, Rubric, ScoreCategoryKey } from '../evaluation/types';
import verification from './source-verification.json';
import type {
  Bilingual,
  Clarification,
  Difficulty,
  QuestionCategory,
  QuestionDefinition,
  QuestionSource,
  ReferenceEdge,
  ReferenceNode,
  Requirement,
  SourceType,
  StarterNode,
} from './types';

// ── Selectors ───────────────────────────────────────────────────────────────
export const S = {
  client: { tags: ['client'], name: 'a client' },
  web: { types: ['web-client'] },
  mobile: { types: ['mobile-client'] },
  dns: { types: ['dns'] },
  entry: { tags: ['lb', 'gateway', 'proxy'], name: 'a load balancer or API gateway' },
  lb: { tags: ['lb'], name: 'a load balancer' },
  gateway: { types: ['api-gateway'] },
  proxy: { types: ['reverse-proxy'] },
  service: { tags: ['service'], name: 'an application service' },
  compute: { tags: ['compute'], name: 'a compute component' },
  auth: { tags: ['auth'], name: 'an authentication service' },
  worker: { tags: ['worker', 'consumer'], name: 'a background worker or consumer' },
  realtime: { tags: ['realtime'], name: 'a WebSocket / real-time server' },
  db: { types: ['sql-db', 'nosql-db', 'sharded-db'], name: 'a database' },
  sql: { types: ['sql-db', 'sharded-db'], name: 'a relational (SQL) database' },
  nosql: { types: ['nosql-db', 'sharded-db'], name: 'a NoSQL or sharded database' },
  scalableDb: { types: ['nosql-db', 'sharded-db'], name: 'a horizontally scalable database (NoSQL or sharded)' },
  anyDb: { tags: ['db'], name: 'a database' },
  persistent: { tags: ['persistent'], name: 'persistent storage' },
  replica: { types: ['read-replica'] },
  cache: { tags: ['cache'], name: 'a cache' },
  distCache: { types: ['distributed-cache'] },
  blob: { types: ['object-storage'] },
  cdn: { tags: ['cdn'], name: 'a CDN' },
  queue: { types: ['message-queue', 'task-queue'], name: 'a message or task queue' },
  stream: { types: ['event-stream'] },
  channel: { tags: ['channel'], name: 'a queue or event stream' },
  dlq: { types: ['dead-letter-queue'] },
  scheduler: { types: ['scheduler'] },
  searchIndex: { types: ['search-index'] },
  searchSvc: { types: ['search-service'] },
  warehouse: { types: ['data-warehouse'] },
  rateLimiter: { types: ['rate-limiter'] },
  notification: { types: ['notification-service'] },
  notifyProvider: { types: ['email-sms-provider', 'push-provider'], name: 'a delivery provider (email/SMS/push)' },
  emailSms: { types: ['email-sms-provider'] },
  push: { types: ['push-provider'] },
  payment: { types: ['payment-provider'] },
  observability: { tags: ['observability'], name: 'observability (logging, metrics or tracing)' },
  logging: { types: ['logging-service'] },
  metrics: { types: ['metrics-monitoring'] },
  tracing: { types: ['distributed-tracing'] },
  secrets: { types: ['secrets-manager'] },
  config: { types: ['config-service'] },
  transcoder: { types: ['transcoder'] },
  streamProc: { types: ['stream-processor'] },
  batch: { types: ['batch-processor'] },
  ml: { types: ['ml-service'] },
  featureStore: { types: ['feature-store'] },
  geo: { types: ['geo-index'] },
  idGen: { types: ['id-generator'] },
  coordination: { types: ['coordination-service'] },
  sandbox: { types: ['code-sandbox'] },
  tsdb: { types: ['time-series-db'] },
  graphDb: { types: ['graph-db'] },
  waf: { types: ['waf'] },
  idp: { types: ['identity-provider'] },
  mediaServer: { types: ['media-server'] },
  matching: { types: ['matching-engine'] },
  externalApi: { types: ['external-api'], name: 'a third-party API' },
} satisfies Record<string, Selector>;

/** Narrow a selector to components whose label or responsibility mentions one of `words`. */
export const named = (sel: Selector, ...words: string[]): Selector => ({
  ...sel,
  labels: words,
  name: `${sel.name ?? 'a component'} named for “${words[0]}”`,
});

/** Merge several selectors into "any of these". */
export const anyOf = (name: string, ...sels: Selector[]): Selector => ({
  types: sels.flatMap((s) => s.types ?? []),
  tags: sels.flatMap((s) => s.tags ?? []),
  name,
});

export const withName = (sel: Selector, name: string): Selector => ({ ...sel, name });

// ── Rule builders ───────────────────────────────────────────────────────────
export const R = {
  has: (sel: Selector, min?: number): Rule => ({ kind: 'has', sel, min }),
  path: (from: Selector, to: Selector, via: Selector[] = [], maxHops?: number): Rule => ({ kind: 'path', from, to, via, maxHops }),
  edge: (from: Selector, to: Selector, min?: number): Rule => ({ kind: 'edge', from, to, min }),
  async: (producer: Selector, consumer: Selector, channel?: Selector): Rule => ({ kind: 'async', producer, consumer, channel }),
  guarded: (from: Selector, to: Selector, guard: Selector): Rule => ({ kind: 'guarded', from, to, guard }),
  redundant: (sel: Selector): Rule => ({ kind: 'redundant', sel }),
  prop: (sel: Selector, key: string, values?: string[]): Rule => ({ kind: 'prop', sel, key, values }),
  edgeProp: (from: Selector, to: Selector, key: keyof ConnectionProps, values: string[]): Rule => ({ kind: 'edgeProp', from, to, key, values }),
  absent: (sel: Selector): Rule => ({ kind: 'absent', sel }),
  noEdge: (from: Selector, to: Selector): Rule => ({ kind: 'noEdge', from, to }),
  any: (...rules: Rule[]): Rule => ({ kind: 'any', rules }),
  all: (...rules: Rule[]): Rule => ({ kind: 'all', rules }),
};

// ── Checks ──────────────────────────────────────────────────────────────────
export interface CheckInput {
  id: string;
  cat: ScoreCategoryKey;
  pts: number;
  title: string;
  rule: Rule;
  pass: string;
  fail: string;
  fix: string;
  critical?: boolean;
  optional?: boolean;
  concern?: 'security' | 'bottleneck';
}

export function ck(c: CheckInput): Check {
  return {
    id: c.id,
    category: c.cat,
    points: c.pts,
    title: c.title,
    rule: c.rule,
    pass: c.pass,
    fail: c.fail,
    fix: c.fix,
    critical: c.critical,
    optional: c.optional,
    concern: c.concern,
  };
}

/** Positional shorthand: C(id, category, points, title, rule, pass, fail, fix, extra). */
export function C(
  id: string,
  cat: ScoreCategoryKey,
  pts: number,
  title: string,
  rule: Rule,
  pass: string,
  fail: string,
  fix: string,
  extra: Pick<CheckInput, 'critical' | 'optional' | 'concern'> = {},
): Check {
  return ck({ id, cat, pts, title, rule, pass, fail, fix, ...extra });
}

type Overrides = Partial<CheckInput>;
const tpl = (base: CheckInput, o: Overrides = {}): Check => ck({ ...base, ...o });

const GATEWAY_AUTH: Selector = {
  types: ['api-gateway'],
  where: { key: 'authentication', values: ['jwt', 'oauth2', 'api-key'] },
  name: 'an API gateway with authentication enabled',
};

/** Reusable check templates with sensible wording. Every field can be overridden per question. */
export const T = {
  entry: (o?: Overrides) =>
    tpl(
      {
        id: 'entry',
        cat: 'scalability',
        pts: 2,
        title: 'Traffic enters through a load balancer or gateway',
        rule: R.path(S.client, S.service, [S.entry]),
        pass: 'Client traffic enters through a load balancer or gateway, so instances can be added behind it.',
        fail: 'Clients do not reach the application through a load balancer or gateway, so the service cannot scale out or fail over cleanly.',
        fix: 'Route clients through a load balancer or API gateway to the application service. It spreads load, runs health checks and lets you add instances without clients noticing.',
      },
      o,
    ),
  scaleOut: (sel: Selector = S.service, o?: Overrides) =>
    tpl(
      {
        id: 'scale-out',
        cat: 'scalability',
        pts: 2,
        title: 'Application tier scales horizontally',
        rule: R.redundant(sel),
        pass: 'The application tier runs multiple instances, so it can absorb more traffic and survive instance failures.',
        fail: 'The application tier runs as a single instance — a capacity ceiling and a single point of failure.',
        fix: 'Set the service’s Instances to “Multiple” or “Autoscaled” behind the load balancer so capacity grows with traffic.',
        concern: 'bottleneck',
      },
      o,
    ),
  dbReplication: (sel: Selector = S.db, o?: Overrides) =>
    tpl(
      {
        id: 'db-replication',
        cat: 'reliability',
        pts: 2,
        title: 'Database is replicated',
        rule: R.redundant(sel),
        pass: 'The primary data store is replicated, so a node failure does not lose data or take the system down.',
        fail: 'The database has no replication, so a single machine failure means downtime and possible data loss.',
        fix: 'Configure replication (or attach a read replica) so a standby can take over and serve reads.',
        concern: 'bottleneck',
      },
      o,
    ),
  observability: (o?: Overrides) =>
    tpl(
      {
        id: 'observability',
        cat: 'reliability',
        pts: 1,
        optional: true,
        title: 'Monitoring and logging',
        rule: R.path({ tags: ['compute', 'service', 'entry', 'rate-limit'], name: 'an active component' }, S.observability, [], 2),
        pass: 'Services report to monitoring/logging, so failures are detected and debugged quickly.',
        fail: 'No monitoring or logging is connected, so problems would go unnoticed until users complain.',
        fix: 'Connect services to Metrics & Monitoring and/or a Logging Service to detect errors, latency spikes and saturation early.',
      },
      o,
    ),
  rateLimit: (o?: Overrides) =>
    tpl(
      {
        id: 'rate-limit',
        cat: 'reliability',
        pts: 2,
        title: 'Abuse protection with rate limiting',
        rule: R.any(
          R.guarded(S.client, S.service, S.rateLimiter),
          R.guarded(S.client, S.service, { types: ['api-gateway'], where: { key: 'rateLimiting', values: ['per-user', 'per-ip', 'per-api-key'] }, name: 'an API gateway with rate limiting enabled' }),
        ),
        pass: 'Requests are rate limited before they reach the application.',
        fail: 'Nothing limits how many requests a client can send, leaving the service open to abuse and overload.',
        fix: 'Put a rate limiter (or enable rate limiting on the API gateway) in front of the service. It rejects abusive traffic early and protects downstream capacity.',
        concern: 'security',
      },
      o,
    ),
  cdn: (o?: Overrides) =>
    tpl(
      {
        id: 'cdn',
        cat: 'scalability',
        pts: 2,
        title: 'Static and media content is served from a CDN',
        rule: R.all(R.path(S.client, S.cdn, [], 4), R.path(S.cdn, S.blob, [], 2)),
        pass: 'Clients download content from a CDN that pulls from object storage, keeping latency low and origin load small.',
        fail: 'Content is not delivered through a CDN backed by object storage, so every download travels to your origin.',
        fix: 'Connect clients to a CDN and connect the CDN to object storage (origin). Edge caching cuts latency for distant users and absorbs read spikes.',
      },
      o,
    ),
  auth: (o?: Overrides) =>
    tpl(
      {
        id: 'auth',
        cat: 'reliability',
        pts: 2,
        title: 'Requests are authenticated',
        rule: R.any(R.path(S.client, S.auth, [], 4), R.path(S.service, S.auth, [], 2), R.has(GATEWAY_AUTH)),
        pass: 'Users are authenticated before they can act, through an auth service or gateway authentication.',
        fail: 'Nothing verifies who is calling, so any client could read or change other users’ data.',
        fix: 'Add an Authentication Service (or enable authentication on the API gateway) and route requests through it before they reach business services.',
        concern: 'security',
      },
      o,
    ),
  shard: (sel: Selector = S.nosql, o?: Overrides) =>
    tpl(
      {
        id: 'partitioning',
        cat: 'scalability',
        pts: 2,
        title: 'Data is partitioned to scale writes',
        rule: R.any(R.prop(sel, 'partitionKey'), R.prop({ types: ['sharded-db'] }, 'shardingStrategy')),
        pass: 'The main data store is partitioned with an explicit key, so storage and writes scale horizontally.',
        fail: 'The data store has no partitioning strategy, so one node must hold all data and absorb all writes.',
        fix: 'Use a sharded or NoSQL store and set its partition/shard key (e.g. by user or entity id) so load spreads evenly across nodes.',
      },
      o,
    ),
  idempotent: (sel: Selector, o?: Overrides) =>
    tpl(
      {
        id: 'idempotency',
        cat: 'reliability',
        pts: 2,
        title: 'Retries are safe (idempotency)',
        rule: R.prop(sel, 'idempotency', ['idempotency-keys', 'dedupe-store']),
        pass: 'Processing is idempotent, so retries and duplicate deliveries cannot apply the same change twice.',
        fail: 'Nothing prevents a retried request or a redelivered message from being applied twice.',
        fix: 'Set Idempotency to “Idempotency keys” or a de-duplication store on the component that applies the change, so duplicates are detected and ignored.',
      },
      o,
    ),
  multiRegion: (sel: Selector, o?: Overrides) =>
    tpl(
      {
        id: 'multi-region',
        cat: 'reliability',
        pts: 2,
        title: 'Survives a regional outage',
        rule: R.prop(sel, 'deployment', ['multi-region-active-passive', 'multi-region-active-active']),
        pass: 'Critical components run in multiple regions, so a regional outage does not take the product down.',
        fail: 'Everything runs in a single region: one regional outage means a full outage.',
        fix: 'Set Deployment to multi-region (active-active or active-passive) on the critical services and data stores, and route users with latency/geo DNS.',
      },
      o,
    ),
  geoRouting: (o?: Overrides) =>
    tpl(
      {
        id: 'geo-routing',
        cat: 'scalability',
        pts: 1,
        title: 'Users are routed to a nearby region',
        rule: R.prop(S.dns, 'routingPolicy', ['latency', 'geo', 'failover', 'weighted']),
        pass: 'DNS routes users to the closest healthy region.',
        fail: 'There is no latency- or geo-aware routing, so global users may hit a distant or failed region.',
        fix: 'Add DNS with a latency-based or geo routing policy in front of your regional entry points.',
      },
      o,
    ),
  dlq: (o?: Overrides) =>
    tpl(
      {
        id: 'dlq',
        cat: 'reliability',
        pts: 1,
        optional: true,
        title: 'Failed messages are not lost',
        rule: R.any(R.has(S.dlq), R.prop(S.channel, 'deadLetter', ['true'])),
        pass: 'Messages that keep failing are moved to a dead-letter queue for inspection and replay.',
        fail: 'Poison messages could block processing or be dropped silently.',
        fix: 'Add a dead-letter queue (or enable it on the queue) so failing messages are parked after retries instead of being lost.',
      },
      o,
    ),
};

// ── Question definition ─────────────────────────────────────────────────────
type ReqInput = [en: string, hi: string, checks: string[]];
type RefNodeInput = [id: string, type: string, why: string, extra?: { label?: string; props?: Record<string, PropertyValue>; at?: [number, number] }];
type RefEdgeInput = string | [spec: string, why: string] | [spec: string, why: string | null, props: Partial<ConnectionProps>];

export interface QuestionInput {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  category: QuestionCategory;
  minutes: number;
  tags: string[];
  concepts: string[];
  statement: Bilingual;
  functional: ReqInput[];
  nonFunctional: ReqInput[];
  constraints: Bilingual<string[]>;
  clarifications?: [qEn: string, qHi: string, aEn: string, aHi: string][];
  scale: [label: string, value: string][];
  suggested?: ComponentCategoryId[];
  starter?: (string | StarterNode)[];
  hints: [en: string, hi: string][];
  rubric: Omit<Rubric, 'checks' | 'referenceSize'> & { checks: Check[] };
  reference: {
    nodes: RefNodeInput[];
    edges: RefEdgeInput[];
    summary: string;
    tradeoffs: string[];
    alternatives: string[];
  };
  sources: [title: string, url: string, type: SourceType, note?: string][];
}

const verified = verification as Record<string, { status: number; checkedAt: string }>;

export function src(title: string, url: string, type: SourceType, note?: string): QuestionSource {
  const v = verified[url];
  return { title, url, type, note, verification: v && v.status >= 200 && v.status < 400 ? 'verified' : 'pending' };
}

function parseEdge(input: RefEdgeInput): ReferenceEdge {
  const [spec, why, props] = typeof input === 'string' ? [input, undefined, undefined] : input;
  const bidi = spec.includes('<>');
  const [from, to] = spec.split(bidi ? '<>' : '>').map((s) => s.trim());
  if (!from || !to) throw new Error(`Invalid edge spec "${spec}"`);
  return {
    from,
    to,
    why: why ?? undefined,
    props: { ...(bidi ? { direction: 'bidirectional' as const } : {}), ...(why ? { critical: true } : {}), ...(props ?? {}) },
  };
}

export function defineQuestion(q: QuestionInput): QuestionDefinition {
  const req = (prefix: string) => (r: ReqInput, i: number): Requirement => ({ id: `${prefix}${i + 1}`, en: r[0], hi: r[1], checks: r[2] });
  const nodes: ReferenceNode[] = q.reference.nodes.map(([id, type, why, extra]) => ({
    id,
    type,
    why,
    label: extra?.label,
    props: extra?.props,
    at: extra?.at,
  }));
  const clarifications: Clarification[] = (q.clarifications ?? []).map(([qEn, qHi, aEn, aHi]) => ({
    q: { en: qEn, hi: qHi },
    a: { en: aEn, hi: aHi },
  }));
  return {
    id: q.id,
    slug: q.slug,
    title: q.title,
    difficulty: q.difficulty,
    category: q.category,
    estimatedMinutes: q.minutes,
    tags: q.tags,
    concepts: q.concepts,
    status: 'published',
    interviewClaim: 'commonly-discussed',
    statement: q.statement,
    functional: q.functional.map(req('fr')),
    nonFunctional: q.nonFunctional.map(req('nfr')),
    constraints: q.constraints,
    clarifications,
    scale: q.scale.map(([label, value]) => ({ label, value })),
    suggestedCategories: q.suggested ?? ['clients', 'application', 'storage', 'caching'],
    starter: (q.starter ?? ['web-client']).map((s) => (typeof s === 'string' ? { type: s } : s)),
    hints: q.hints.map(([en, hi]) => ({ en, hi })),
    rubric: { ...q.rubric, referenceSize: nodes.length },
    reference: {
      nodes,
      edges: q.reference.edges.map(parseEdge),
      summary: q.reference.summary,
      tradeoffs: q.reference.tradeoffs,
      alternatives: q.reference.alternatives,
    },
    sources: q.sources.map(([title, url, type, note]) => src(title, url, type, note)),
  };
}
