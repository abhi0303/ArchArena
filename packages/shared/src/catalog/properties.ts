/**
 * Property fields that can appear in the playground's properties panel.
 * Each component type opts into the subset that is relevant to it (see components.ts),
 * so beginners only ever see contextual settings.
 */

export type PropertyValue = string | number | boolean;

export interface PropertyOption {
  value: string;
  label: string;
}

export interface PropertyField {
  key: string;
  label: string;
  type: 'select' | 'text' | 'boolean';
  options?: PropertyOption[];
  /** Short tooltip / help text shown next to the field. */
  help: string;
  /** Advanced fields are collapsed by default (progressive disclosure). */
  advanced?: boolean;
  placeholder?: string;
}

const opt = (value: string, label: string): PropertyOption => ({ value, label });

export const PROPERTY_FIELDS = {
  role: {
    key: 'role',
    label: 'Responsibility',
    type: 'text',
    placeholder: 'e.g. Booking service',
    help: 'What this component is responsible for. Clear responsibilities make the design easier to review.',
  },
  instances: {
    key: 'instances',
    label: 'Instances',
    type: 'select',
    options: [opt('single', 'Single instance'), opt('multiple', 'Multiple (2+)'), opt('autoscaled', 'Autoscaled')],
    help: 'How many copies run. More than one copy removes a single point of failure and adds capacity.',
  },
  stateless: {
    key: 'stateless',
    label: 'Stateless',
    type: 'boolean',
    help: 'A stateless service keeps no user session in local memory, so any instance can serve any request and scaling out is easy.',
  },
  deployment: {
    key: 'deployment',
    label: 'Deployment',
    type: 'select',
    advanced: true,
    options: [
      opt('single-region', 'Single region'),
      opt('multi-region-active-passive', 'Multi-region (active-passive)'),
      opt('multi-region-active-active', 'Multi-region (active-active)'),
    ],
    help: 'Running in several regions survives a regional outage and reduces latency for global users.',
  },
  timeout: {
    key: 'timeout',
    label: 'Timeout',
    type: 'select',
    advanced: true,
    options: [opt('none', 'No timeout'), opt('short', 'Short (< 1s)'), opt('standard', 'Standard (1–5s)'), opt('long', 'Long (> 5s)')],
    help: 'How long a caller waits before giving up. Timeouts stop slow dependencies from exhausting threads.',
  },
  retryStrategy: {
    key: 'retryStrategy',
    label: 'Retry strategy',
    type: 'select',
    advanced: true,
    options: [opt('none', 'No retries'), opt('fixed', 'Fixed delay'), opt('exponential-backoff', 'Exponential backoff + jitter')],
    help: 'How failed calls are retried. Exponential backoff with jitter avoids retry storms.',
  },
  circuitBreaker: {
    key: 'circuitBreaker',
    label: 'Circuit breaker',
    type: 'boolean',
    advanced: true,
    help: 'Stops calling a failing dependency for a while so it can recover, and fails fast instead of piling up requests.',
  },
  idempotency: {
    key: 'idempotency',
    label: 'Idempotency',
    type: 'select',
    advanced: true,
    options: [opt('none', 'None'), opt('idempotency-keys', 'Idempotency keys'), opt('dedupe-store', 'De-duplication store')],
    help: 'Makes retries safe: processing the same request twice has the same effect as processing it once.',
  },
  availability: {
    key: 'availability',
    label: 'Availability',
    type: 'select',
    options: [opt('managed-ha', 'Managed / highly available'), opt('active-passive', 'Active-passive pair'), opt('single-instance', 'Single instance')],
    help: 'A single instance is a single point of failure. Managed services and active-passive pairs keep working when one node dies.',
  },
  lbAlgorithm: {
    key: 'lbAlgorithm',
    label: 'Balancing strategy',
    type: 'select',
    options: [
      opt('round-robin', 'Round robin'),
      opt('least-connections', 'Least connections'),
      opt('ip-hash', 'IP hash (sticky)'),
      opt('weighted', 'Weighted'),
      opt('consistent-hash', 'Consistent hashing'),
    ],
    help: 'How requests are spread across instances. Least connections suits uneven request costs; consistent hashing keeps keys on the same node.',
  },
  lbLayer: {
    key: 'lbLayer',
    label: 'Layer',
    type: 'select',
    advanced: true,
    options: [opt('L4', 'Layer 4 (TCP)'), opt('L7', 'Layer 7 (HTTP)')],
    help: 'L4 balances raw connections; L7 understands HTTP and can route by path or header.',
  },
  healthChecks: {
    key: 'healthChecks',
    label: 'Health checks',
    type: 'boolean',
    help: 'Regularly probes instances and stops sending traffic to unhealthy ones.',
  },
  authentication: {
    key: 'authentication',
    label: 'Authentication',
    type: 'select',
    options: [opt('none', 'None'), opt('api-key', 'API keys'), opt('jwt', 'JWT validation'), opt('oauth2', 'OAuth 2.0 / OIDC')],
    help: 'Verifying identity at the edge keeps unauthenticated traffic away from internal services.',
  },
  rateLimiting: {
    key: 'rateLimiting',
    label: 'Rate limiting',
    type: 'select',
    options: [opt('off', 'Off'), opt('per-user', 'Per user'), opt('per-ip', 'Per IP'), opt('per-api-key', 'Per API key')],
    help: 'Caps how many requests a caller can make, protecting the system from abuse and overload.',
  },
  routingPolicy: {
    key: 'routingPolicy',
    label: 'Routing policy',
    type: 'select',
    options: [opt('simple', 'Simple'), opt('latency', 'Latency-based'), opt('geo', 'Geo-location'), opt('weighted', 'Weighted'), opt('failover', 'Failover')],
    help: 'Latency or geo routing sends users to the nearest healthy region; failover routing redirects traffic during outages.',
  },
  cachedContent: {
    key: 'cachedContent',
    label: 'Cached content',
    type: 'select',
    options: [opt('static-assets', 'Static assets'), opt('media', 'Media files'), opt('api-responses', 'API responses'), opt('all', 'All of the above')],
    help: 'What the edge serves from cache. Media and static files benefit most from edge caching.',
  },
  invalidation: {
    key: 'invalidation',
    label: 'Invalidation',
    type: 'select',
    advanced: true,
    options: [opt('ttl-expiry', 'TTL expiry'), opt('purge-on-update', 'Purge on update'), opt('versioned-urls', 'Versioned URLs')],
    help: 'How stale content leaves the cache. Versioned URLs avoid invalidation entirely for immutable files.',
  },
  replication: {
    key: 'replication',
    label: 'Replication',
    type: 'select',
    options: [
      opt('none', 'None'),
      opt('leader-follower-async', 'Leader-follower (async)'),
      opt('leader-follower-sync', 'Leader-follower (sync standby)'),
      opt('multi-leader', 'Multi-leader'),
    ],
    help: 'Copies data to other nodes. Followers serve reads and take over if the leader fails.',
  },
  consistency: {
    key: 'consistency',
    label: 'Consistency',
    type: 'select',
    options: [opt('strong', 'Strong'), opt('quorum', 'Quorum'), opt('read-your-writes', 'Read-your-writes'), opt('eventual', 'Eventual')],
    help: 'Strong consistency always returns the latest write; eventual consistency is faster but may briefly return stale data.',
  },
  concurrencyControl: {
    key: 'concurrencyControl',
    label: 'Concurrency control',
    type: 'select',
    advanced: true,
    options: [
      opt('none', 'None'),
      opt('optimistic', 'Optimistic (version check)'),
      opt('pessimistic-locks', 'Pessimistic row locks'),
      opt('serializable', 'Serializable transactions'),
      opt('conditional-writes', 'Conditional / atomic writes'),
    ],
    help: 'Prevents two concurrent writers from overwriting each other, e.g. selling the same seat twice.',
  },
  backups: {
    key: 'backups',
    label: 'Backups',
    type: 'select',
    advanced: true,
    options: [opt('none', 'None'), opt('daily', 'Daily snapshots'), opt('point-in-time', 'Point-in-time recovery')],
    help: 'Backups protect against data loss from bugs or operator mistakes, which replication alone does not.',
  },
  access: {
    key: 'access',
    label: 'Read/write role',
    type: 'select',
    options: [opt('read-write', 'Reads and writes'), opt('reads', 'Serves reads'), opt('writes', 'Receives writes')],
    help: 'Clarifies which traffic this store handles, e.g. a primary for writes and replicas for reads.',
  },
  dataModel: {
    key: 'dataModel',
    label: 'Data model',
    type: 'select',
    options: [opt('key-value', 'Key-value'), opt('document', 'Document'), opt('wide-column', 'Wide-column'), opt('graph', 'Graph')],
    help: 'Key-value suits lookups by id; wide-column suits huge write-heavy, time-ordered data; documents suit flexible records.',
  },
  partitionKey: {
    key: 'partitionKey',
    label: 'Partition key',
    type: 'text',
    placeholder: 'e.g. user_id',
    help: 'The field used to spread data across nodes. A good key distributes load evenly and keeps related data together.',
  },
  replicationFactor: {
    key: 'replicationFactor',
    label: 'Replication factor',
    type: 'select',
    options: [opt('1', '1 (no copies)'), opt('2', '2'), opt('3', '3'), opt('5', '5')],
    help: 'How many copies of each piece of data exist. 3 is a common default that survives a node failure.',
  },
  shardingStrategy: {
    key: 'shardingStrategy',
    label: 'Sharding strategy',
    type: 'select',
    options: [
      opt('hash', 'Hash-based'),
      opt('consistent-hash', 'Consistent hashing'),
      opt('range', 'Range-based'),
      opt('geo', 'Geographic'),
      opt('directory', 'Directory / lookup'),
    ],
    help: 'How rows map to shards. Hashing spreads load evenly; ranges keep ordered scans fast but can create hot spots.',
  },
  shardCount: {
    key: 'shardCount',
    label: 'Shard count',
    type: 'select',
    advanced: true,
    options: [opt('4', '4'), opt('16', '16'), opt('64', '64'), opt('256+', '256+')],
    help: 'More shards spread load further but add operational overhead.',
  },
  replicaCount: {
    key: 'replicaCount',
    label: 'Replica count',
    type: 'select',
    options: [opt('1', '1'), opt('2', '2'), opt('3+', '3+')],
    help: 'More replicas add read capacity and failover options.',
  },
  uploadMethod: {
    key: 'uploadMethod',
    label: 'Upload method',
    type: 'select',
    options: [opt('through-service', 'Through the app server'), opt('presigned-url', 'Direct via pre-signed URL')],
    help: 'Pre-signed URLs let clients upload large files straight to storage without tying up app servers.',
  },
  durability: {
    key: 'durability',
    label: 'Durability',
    type: 'select',
    advanced: true,
    options: [opt('standard', 'Standard'), opt('multi-az', 'Replicated across zones'), opt('cross-region', 'Cross-region replication')],
    help: 'Where copies of objects live. Cross-region replication survives a full regional outage.',
  },
  lifecycle: {
    key: 'lifecycle',
    label: 'Lifecycle policy',
    type: 'select',
    advanced: true,
    options: [opt('none', 'None'), opt('tiering', 'Move cold data to cheaper tiers'), opt('expiry', 'Expire old objects')],
    help: 'Lifecycle rules control storage cost by tiering or deleting old data.',
  },
  ingestion: {
    key: 'ingestion',
    label: 'Ingestion',
    type: 'select',
    options: [opt('batch', 'Batch (ETL)'), opt('streaming', 'Streaming')],
    help: 'Batch loads are cheap and simple; streaming keeps analytics fresh.',
  },
  evictionPolicy: {
    key: 'evictionPolicy',
    label: 'Eviction policy',
    type: 'select',
    options: [opt('lru', 'LRU'), opt('lfu', 'LFU'), opt('ttl', 'TTL only'), opt('none', 'No eviction')],
    help: 'Decides what leaves the cache when it is full. LRU is a solid default for most read-heavy workloads.',
  },
  writePolicy: {
    key: 'writePolicy',
    label: 'Cache pattern',
    type: 'select',
    options: [
      opt('cache-aside', 'Cache-aside'),
      opt('read-through', 'Read-through'),
      opt('write-through', 'Write-through'),
      opt('write-back', 'Write-back'),
    ],
    help: 'Cache-aside loads data on a miss; write-through updates cache and database together; write-back is fastest but risks data loss.',
  },
  ttl: {
    key: 'ttl',
    label: 'TTL',
    type: 'text',
    advanced: true,
    placeholder: 'e.g. 24h',
    help: 'Time-to-live bounds staleness: entries expire automatically after this duration.',
  },
  cacheReplication: {
    key: 'cacheReplication',
    label: 'Cache topology',
    type: 'select',
    options: [opt('single-node', 'Single node'), opt('replicas', 'Primary + replicas'), opt('cluster', 'Sharded cluster')],
    help: 'A clustered cache spreads keys across nodes and survives node loss.',
  },
  delivery: {
    key: 'delivery',
    label: 'Delivery guarantee',
    type: 'select',
    options: [opt('at-most-once', 'At most once'), opt('at-least-once', 'At least once'), opt('exactly-once', 'Exactly once (effectively)')],
    help: 'At-least-once never loses messages but may duplicate them, so consumers should be idempotent.',
  },
  ordering: {
    key: 'ordering',
    label: 'Ordering',
    type: 'select',
    options: [opt('none', 'No ordering'), opt('fifo', 'Strict FIFO'), opt('per-key', 'Ordered per key')],
    help: 'Per-key ordering keeps related events in order while still allowing parallelism.',
  },
  deadLetter: {
    key: 'deadLetter',
    label: 'Dead-letter queue',
    type: 'boolean',
    advanced: true,
    help: 'Messages that keep failing are moved aside instead of blocking the queue forever.',
  },
  partitions: {
    key: 'partitions',
    label: 'Partitions',
    type: 'select',
    options: [opt('1', '1'), opt('8', '8'), opt('32', '32'), opt('128+', '128+')],
    help: 'Partitions are the unit of parallelism: more partitions allow more consumers to work at once.',
  },
  retention: {
    key: 'retention',
    label: 'Retention',
    type: 'select',
    advanced: true,
    options: [opt('hours', 'Hours'), opt('days', 'Days'), opt('weeks', 'Weeks'), opt('forever', 'Indefinitely')],
    help: 'How long data is kept. Longer retention enables replay and reprocessing.',
  },
  consumerGroup: {
    key: 'consumerGroup',
    label: 'Consumer group',
    type: 'text',
    advanced: true,
    placeholder: 'e.g. notification-senders',
    help: 'Consumers in one group share the work; separate groups each receive every event.',
  },
  trigger: {
    key: 'trigger',
    label: 'Trigger',
    type: 'select',
    options: [opt('cron', 'Cron schedule'), opt('delayed', 'Delayed jobs'), opt('both', 'Cron + delayed')],
    help: 'Cron runs jobs on a fixed schedule; delayed jobs run once at a given time.',
  },
  rlAlgorithm: {
    key: 'rlAlgorithm',
    label: 'Algorithm',
    type: 'select',
    options: [
      opt('token-bucket', 'Token bucket'),
      opt('leaky-bucket', 'Leaky bucket'),
      opt('fixed-window', 'Fixed window counter'),
      opt('sliding-window-log', 'Sliding window log'),
      opt('sliding-window-counter', 'Sliding window counter'),
    ],
    help: 'Token bucket allows short bursts; sliding windows give smoother limits; fixed windows are simplest but allow edge bursts.',
  },
  rlScope: {
    key: 'rlScope',
    label: 'Limit by',
    type: 'select',
    options: [opt('per-user', 'User'), opt('per-ip', 'IP address'), opt('per-api-key', 'API key'), opt('global', 'Global')],
    help: 'The identity each limit applies to.',
  },
  rlStore: {
    key: 'rlStore',
    label: 'Counter store',
    type: 'select',
    options: [opt('in-memory', 'Local memory'), opt('shared-cache', 'Shared cache')],
    help: 'Counters in a shared cache give one consistent limit across many servers; local memory only limits per server.',
  },
  failMode: {
    key: 'failMode',
    label: 'Failure mode',
    type: 'select',
    advanced: true,
    options: [opt('fail-open', 'Fail open (allow)'), opt('fail-closed', 'Fail closed (block)')],
    help: 'What happens if the limiter itself is unavailable. Failing open favours availability; failing closed favours protection.',
  },
  channels: {
    key: 'channels',
    label: 'Channels',
    type: 'select',
    options: [opt('push', 'Push'), opt('email', 'Email'), opt('sms', 'SMS'), opt('multi-channel', 'Multiple channels')],
    help: 'Which delivery channels this service sends through.',
  },
  webhooks: {
    key: 'webhooks',
    label: 'Webhook confirmation',
    type: 'boolean',
    advanced: true,
    help: 'The provider calls back to confirm the final payment status, which handles timeouts and async settlement.',
  },
  connectionRegistry: {
    key: 'connectionRegistry',
    label: 'Connection registry',
    type: 'select',
    options: [opt('none', 'None'), opt('shared-cache', 'Shared cache (user → server)'), opt('pubsub', 'Pub/sub fan-out')],
    help: 'With many socket servers you need to know which server holds a user connection, or broadcast through pub/sub.',
  },
  rotation: {
    key: 'rotation',
    label: 'Automatic rotation',
    type: 'boolean',
    advanced: true,
    help: 'Rotating credentials regularly limits the damage of a leak.',
  },
  propagation: {
    key: 'propagation',
    label: 'Propagation',
    type: 'select',
    options: [opt('polling', 'Clients poll'), opt('push', 'Push on change'), opt('streaming', 'Streaming updates')],
    help: 'Push or streaming propagates changes in seconds; polling is simpler but slower.',
  },
  ensembleSize: {
    key: 'ensembleSize',
    label: 'Ensemble size',
    type: 'select',
    options: [opt('1', '1'), opt('3', '3'), opt('5', '5')],
    help: 'Consensus needs a majority, so 3 or 5 nodes tolerate 1 or 2 failures.',
  },
  coordinationUse: {
    key: 'coordinationUse',
    label: 'Used for',
    type: 'select',
    options: [opt('leader-election', 'Leader election'), opt('locks', 'Distributed locks'), opt('membership', 'Membership / discovery'), opt('metadata', 'Cluster metadata')],
    help: 'What the coordination service provides to the rest of the system.',
  },
  idStrategy: {
    key: 'idStrategy',
    label: 'ID strategy',
    type: 'select',
    options: [
      opt('uuid', 'Random UUID'),
      opt('snowflake', 'Snowflake (time + machine + sequence)'),
      opt('ticket-server', 'Ticket server'),
      opt('db-sequence', 'Database sequence'),
      opt('range-allocation', 'Pre-allocated ranges'),
    ],
    help: 'Snowflake-style IDs are unique, roughly time-ordered and need no coordination per ID.',
  },
  servingMode: {
    key: 'servingMode',
    label: 'Serving mode',
    type: 'select',
    options: [opt('online', 'Online (real-time)'), opt('batch', 'Batch (precomputed)'), opt('hybrid', 'Hybrid')],
    help: 'Online inference scores requests as they arrive; batch precomputes results ahead of time.',
  },
  storeMode: {
    key: 'storeMode',
    label: 'Store mode',
    type: 'select',
    options: [opt('online', 'Online (low latency)'), opt('offline', 'Offline (training)'), opt('both', 'Online + offline')],
    help: 'Online stores serve features at request time; offline stores keep history for training.',
  },
  indexType: {
    key: 'indexType',
    label: 'Spatial index',
    type: 'select',
    options: [opt('geohash', 'Geohash'), opt('quadtree', 'Quadtree'), opt('s2', 'S2 cells'), opt('h3', 'H3 hexagons'), opt('r-tree', 'R-tree')],
    help: 'Spatial indexes turn "what is near me?" into fast cell lookups instead of scanning every location.',
  },
  isolation: {
    key: 'isolation',
    label: 'Isolation',
    type: 'select',
    options: [opt('process', 'Process'), opt('container', 'Container'), opt('micro-vm', 'Micro-VM')],
    help: 'Untrusted code must be isolated. Micro-VMs give the strongest boundary; plain processes are the weakest.',
  },
  resourceLimits: {
    key: 'resourceLimits',
    label: 'CPU / memory / time limits',
    type: 'boolean',
    help: 'Hard limits stop infinite loops and memory bombs from affecting other users.',
  },
  networkAccess: {
    key: 'networkAccess',
    label: 'Network access',
    type: 'select',
    options: [opt('none', 'None'), opt('restricted', 'Restricted'), opt('full', 'Full')],
    help: 'Untrusted code should have no or tightly restricted network access.',
  },
  downsampling: {
    key: 'downsampling',
    label: 'Downsampling',
    type: 'boolean',
    advanced: true,
    help: 'Older data points are rolled up into coarser intervals to save space.',
  },
  wafRules: {
    key: 'wafRules',
    label: 'Rule set',
    type: 'select',
    options: [opt('managed', 'Managed rules'), opt('custom', 'Custom rules'), opt('both', 'Managed + custom')],
    help: 'Rules that block common attacks like SQL injection, XSS and bots.',
  },
  idpProtocol: {
    key: 'idpProtocol',
    label: 'Protocol',
    type: 'select',
    options: [opt('oidc', 'OpenID Connect'), opt('saml', 'SAML'), opt('oauth2', 'OAuth 2.0')],
    help: 'Standard federation protocols for signing in with an external identity.',
  },
  mediaTopology: {
    key: 'mediaTopology',
    label: 'Media topology',
    type: 'select',
    options: [opt('mesh', 'Peer-to-peer mesh'), opt('sfu', 'SFU (selective forwarding)'), opt('mcu', 'MCU (mixing)')],
    help: 'Mesh works for 2–4 people; an SFU forwards streams and scales to large calls; an MCU mixes streams at higher server cost.',
  },
  standby: {
    key: 'standby',
    label: 'Standby',
    type: 'select',
    options: [opt('none', 'None'), opt('hot-standby', 'Hot standby (replays the log)')],
    help: 'A hot standby replays the same input log and can take over within seconds.',
  },
  persistence: {
    key: 'persistence',
    label: 'Persistence',
    type: 'select',
    options: [opt('none', 'In-memory only'), opt('event-log', 'Event log'), opt('snapshot-log', 'Snapshots + event log')],
    help: 'Persisting every input to a log lets in-memory state be rebuilt after a crash.',
  },
  processingState: {
    key: 'processingState',
    label: 'State',
    type: 'select',
    options: [opt('stateless', 'Stateless'), opt('stateful-checkpointed', 'Stateful with checkpoints')],
    help: 'Checkpointed state lets a stream job recover exactly where it left off after a failure.',
  },
  windowing: {
    key: 'windowing',
    label: 'Windowing',
    type: 'select',
    advanced: true,
    options: [opt('none', 'None'), opt('tumbling', 'Tumbling'), opt('sliding', 'Sliding'), opt('session', 'Session')],
    help: 'Windows group events by time for aggregations such as counts per minute.',
  },
  schedule: {
    key: 'schedule',
    label: 'Schedule',
    type: 'select',
    options: [opt('hourly', 'Hourly'), opt('daily', 'Daily'), opt('on-demand', 'On demand')],
    help: 'How often the batch job runs.',
  },
  authMethod: {
    key: 'authMethod',
    label: 'Auth method',
    type: 'select',
    options: [opt('sessions', 'Server sessions'), opt('jwt', 'JWT tokens'), opt('oauth2-oidc', 'OAuth 2.0 / OIDC')],
    help: 'Sessions are easy to revoke; JWTs are verified without a lookup but are harder to revoke early.',
  },
  mfa: {
    key: 'mfa',
    label: 'Multi-factor auth',
    type: 'boolean',
    advanced: true,
    help: 'A second factor protects accounts when passwords leak.',
  },
  heartbeat: {
    key: 'heartbeat',
    label: 'Heartbeats',
    type: 'boolean',
    advanced: true,
    help: 'Periodic pings detect dead connections and power presence (online/offline) indicators.',
  },
} satisfies Record<string, PropertyField>;

export type PropertyKey = keyof typeof PROPERTY_FIELDS;

export function getPropertyField(key: string): PropertyField | undefined {
  return (PROPERTY_FIELDS as Record<string, PropertyField>)[key];
}

/** Human readable label for a property value, used in feedback text. */
export function describePropertyValue(key: string, value: unknown): string {
  const field = getPropertyField(key);
  if (field?.options) {
    const match = field.options.find((o) => o.value === String(value));
    if (match) return match.label;
  }
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
  return String(value);
}
