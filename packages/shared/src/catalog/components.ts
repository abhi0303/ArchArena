import type { PropertyKey } from './properties';

/**
 * Component library used by the playground and by the evaluation engine.
 *
 * `tags` describe what a component *does*. Rubrics select components by type or tag,
 * which is how one question can accept several valid alternatives
 * (e.g. "any cache" or "any persistent store").
 */

export const COMPONENT_CATEGORIES = [
  { id: 'clients', label: 'Clients & Entry Points' },
  { id: 'application', label: 'Application Layer' },
  { id: 'storage', label: 'Storage' },
  { id: 'caching', label: 'Caching' },
  { id: 'messaging', label: 'Messaging & Processing' },
  { id: 'supporting', label: 'Supporting Services' },
  { id: 'specialized', label: 'Specialized' },
] as const;

export type ComponentCategoryId = (typeof COMPONENT_CATEGORIES)[number]['id'];

export type ComponentTag =
  | 'client'
  | 'dns'
  | 'edge'
  | 'cdn'
  | 'lb'
  | 'gateway'
  | 'proxy'
  | 'entry'
  | 'compute'
  | 'service'
  | 'auth'
  | 'worker'
  | 'consumer'
  | 'realtime'
  | 'aggregator'
  | 'db'
  | 'sql'
  | 'nosql'
  | 'replica'
  | 'sharded'
  | 'persistent'
  | 'store'
  | 'blob'
  | 'search-index'
  | 'warehouse'
  | 'analytics'
  | 'cache'
  | 'edge-cache'
  | 'queue'
  | 'stream'
  | 'channel'
  | 'dlq'
  | 'scheduler'
  | 'rate-limit'
  | 'notification'
  | 'provider'
  | 'external'
  | 'payment'
  | 'search'
  | 'observability'
  | 'logging'
  | 'metrics'
  | 'tracing'
  | 'security'
  | 'secrets'
  | 'config'
  | 'push'
  | 'media'
  | 'stream-processing'
  | 'batch'
  | 'ml'
  | 'geo'
  | 'id-gen'
  | 'coordination'
  | 'sandbox'
  | 'tsdb'
  | 'graph'
  | 'waf'
  | 'idp'
  | 'matching'
  | 'managed';

export interface ComponentDefinition {
  type: string;
  label: string;
  category: ComponentCategoryId;
  /** Lucide icon name, resolved by the web app. */
  icon: string;
  /** One-line tooltip. */
  description: string;
  /** Longer beginner-friendly explanation. */
  details: string;
  tags: ComponentTag[];
  properties: PropertyKey[];
  /** Accent colour token used for the node's visual identity. */
  accent: 'sky' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan' | 'orange' | 'fuchsia' | 'lime';
}

const SERVICE_PROPS: PropertyKey[] = [
  'role',
  'instances',
  'stateless',
  'timeout',
  'retryStrategy',
  'circuitBreaker',
  'idempotency',
  'deployment',
];

const define = <const T extends ComponentDefinition[]>(defs: T) => defs;

export const COMPONENTS = define([
  // ── Clients & entry points ───────────────────────────────────────────────
  {
    type: 'web-client',
    label: 'Web Client',
    category: 'clients',
    icon: 'Monitor',
    description: 'Users in a web browser.',
    details: 'A browser-based client that sends HTTP requests to your system.',
    tags: ['client'],
    properties: ['role'],
    accent: 'slate',
  },
  {
    type: 'mobile-client',
    label: 'Mobile Client',
    category: 'clients',
    icon: 'Smartphone',
    description: 'iOS or Android app users.',
    details: 'A native mobile app. Mobile clients often have flaky networks, so offline handling and push notifications matter.',
    tags: ['client'],
    properties: ['role'],
    accent: 'slate',
  },
  {
    type: 'desktop-client',
    label: 'Desktop Client',
    category: 'clients',
    icon: 'Laptop',
    description: 'Installed desktop application users.',
    details: 'A native desktop app, e.g. a sync client that watches local folders.',
    tags: ['client'],
    properties: ['role'],
    accent: 'slate',
  },
  {
    type: 'dns',
    label: 'DNS',
    category: 'clients',
    icon: 'Globe',
    description: 'Resolves domain names to the right endpoint or region.',
    details: 'DNS turns a hostname into an IP address. Geo or latency-based DNS can send users to the closest healthy region.',
    tags: ['dns', 'edge', 'managed'],
    properties: ['routingPolicy'],
    accent: 'sky',
  },
  {
    type: 'cdn',
    label: 'CDN',
    category: 'clients',
    icon: 'Cloud',
    description: 'Edge network that serves content close to users.',
    details: 'A content delivery network caches static files and media at edge locations worldwide, cutting latency and origin load.',
    tags: ['cdn', 'edge', 'edge-cache', 'managed'],
    properties: ['cachedContent', 'invalidation'],
    accent: 'sky',
  },
  {
    type: 'load-balancer',
    label: 'Load Balancer',
    category: 'clients',
    icon: 'Scale',
    description: 'Spreads traffic across multiple server instances.',
    details: 'A load balancer distributes requests over healthy instances so you can scale horizontally and survive instance failures.',
    tags: ['lb', 'entry'],
    properties: ['lbAlgorithm', 'healthChecks', 'availability', 'lbLayer', 'deployment'],
    accent: 'sky',
  },
  {
    type: 'api-gateway',
    label: 'API Gateway',
    category: 'clients',
    icon: 'Waypoints',
    description: 'Single entry point that routes, authenticates and throttles API calls.',
    details: 'An API gateway terminates client requests, applies authentication and rate limits, and routes calls to internal services.',
    tags: ['gateway', 'entry'],
    properties: ['authentication', 'rateLimiting', 'availability', 'timeout', 'deployment'],
    accent: 'sky',
  },
  {
    type: 'reverse-proxy',
    label: 'Reverse Proxy',
    category: 'clients',
    icon: 'ArrowRightLeft',
    description: 'Forwards client requests to backend servers.',
    details: 'A reverse proxy (e.g. Nginx) sits in front of servers to terminate TLS, compress, cache and forward requests.',
    tags: ['proxy', 'entry'],
    properties: ['lbAlgorithm', 'availability', 'healthChecks', 'deployment'],
    accent: 'sky',
  },

  // ── Application layer ─────────────────────────────────────────────────────
  {
    type: 'app-server',
    label: 'Application Server',
    category: 'application',
    icon: 'Server',
    description: 'Runs your core business logic and APIs.',
    details: 'Handles API requests, applies business rules and talks to storage. Keep it stateless so it can scale out.',
    tags: ['compute', 'service'],
    properties: SERVICE_PROPS,
    accent: 'violet',
  },
  {
    type: 'microservice',
    label: 'Microservice',
    category: 'application',
    icon: 'Boxes',
    description: 'An independently deployable service owning one capability.',
    details: 'A focused service with its own responsibility and usually its own data. Name it after what it owns, e.g. "Payment Service".',
    tags: ['compute', 'service'],
    properties: SERVICE_PROPS,
    accent: 'violet',
  },
  {
    type: 'auth-service',
    label: 'Authentication Service',
    category: 'application',
    icon: 'ShieldCheck',
    description: 'Verifies identity and issues sessions or tokens.',
    details: 'Handles sign-in, token issuing and validation so other services can trust who the caller is.',
    tags: ['auth', 'compute', 'service', 'security'],
    properties: ['authMethod', 'mfa', 'instances', 'deployment'],
    accent: 'violet',
  },
  {
    type: 'background-worker',
    label: 'Background Worker',
    category: 'application',
    icon: 'Cog',
    description: 'Processes jobs asynchronously, outside the request path.',
    details: 'Workers pick up jobs from a queue and do slow work (emails, thumbnails, reports) without making users wait.',
    tags: ['worker', 'compute', 'consumer'],
    properties: ['role', 'instances', 'idempotency', 'retryStrategy', 'circuitBreaker', 'consumerGroup', 'deployment'],
    accent: 'violet',
  },
  {
    type: 'websocket-server',
    label: 'WebSocket Server',
    category: 'application',
    icon: 'Radio',
    description: 'Keeps persistent connections for real-time updates.',
    details: 'Maintains long-lived bidirectional connections so the server can push messages instantly instead of clients polling.',
    tags: ['realtime', 'compute', 'service'],
    properties: ['role', 'instances', 'connectionRegistry', 'heartbeat', 'deployment'],
    accent: 'violet',
  },
  {
    type: 'bff',
    label: 'BFF (Backend for Frontend)',
    category: 'application',
    icon: 'Layers',
    description: 'API layer tailored to one client type.',
    details: 'A backend-for-frontend aggregates calls to several services and shapes responses for a specific client, e.g. mobile.',
    tags: ['compute', 'service', 'aggregator'],
    properties: ['role', 'instances', 'stateless', 'timeout', 'deployment'],
    accent: 'violet',
  },

  // ── Storage ───────────────────────────────────────────────────────────────
  {
    type: 'sql-db',
    label: 'SQL Database',
    category: 'storage',
    icon: 'Database',
    description: 'Relational database with transactions and joins.',
    details: 'Stores structured data with ACID transactions — great for money, bookings and anything that needs strong consistency.',
    tags: ['db', 'sql', 'persistent', 'store'],
    properties: ['role', 'replication', 'consistency', 'access', 'concurrencyControl', 'backups', 'deployment'],
    accent: 'emerald',
  },
  {
    type: 'nosql-db',
    label: 'NoSQL Database',
    category: 'storage',
    icon: 'DatabaseZap',
    description: 'Horizontally scalable non-relational database.',
    details: 'Key-value, document or wide-column stores scale writes across many nodes and suit huge, simple access patterns.',
    tags: ['db', 'nosql', 'persistent', 'store'],
    properties: ['role', 'dataModel', 'partitionKey', 'replicationFactor', 'consistency', 'concurrencyControl', 'deployment'],
    accent: 'emerald',
  },
  {
    type: 'read-replica',
    label: 'Read Replica',
    category: 'storage',
    icon: 'DatabaseBackup',
    description: 'Read-only copy of a database that offloads reads.',
    details: 'Replicas receive changes from the primary and serve read traffic. They can be promoted if the primary fails.',
    tags: ['db', 'replica', 'store'],
    properties: ['replicaCount', 'consistency'],
    accent: 'emerald',
  },
  {
    type: 'sharded-db',
    label: 'Sharded Database',
    category: 'storage',
    icon: 'LayoutGrid',
    description: 'Database split across shards by a shard key.',
    details: 'Sharding partitions data across many database servers so writes and storage scale beyond one machine.',
    tags: ['db', 'sharded', 'persistent', 'store'],
    properties: ['role', 'shardingStrategy', 'partitionKey', 'shardCount', 'replication', 'consistency', 'concurrencyControl', 'backups', 'deployment'],
    accent: 'emerald',
  },
  {
    type: 'object-storage',
    label: 'Object Storage',
    category: 'storage',
    icon: 'Archive',
    description: 'Durable storage for files, images and videos.',
    details: 'Stores large binary objects (blobs) cheaply and durably, e.g. S3. Pair it with a CDN for fast downloads.',
    tags: ['blob', 'persistent', 'store', 'managed'],
    properties: ['uploadMethod', 'durability', 'lifecycle', 'deployment'],
    accent: 'emerald',
  },
  {
    type: 'search-index',
    label: 'Search Index',
    category: 'storage',
    icon: 'FileSearch',
    description: 'Inverted index for full-text and faceted search.',
    details: 'An inverted index (e.g. Elasticsearch) maps terms to documents so text queries return in milliseconds.',
    tags: ['search-index', 'store'],
    properties: ['replicationFactor', 'partitionKey', 'deployment'],
    accent: 'emerald',
  },
  {
    type: 'data-warehouse',
    label: 'Data Warehouse',
    category: 'storage',
    icon: 'Warehouse',
    description: 'Columnar store for analytics and reporting.',
    details: 'Optimised for large analytical queries over historical data, not for serving user requests.',
    tags: ['warehouse', 'analytics', 'store', 'persistent'],
    properties: ['ingestion', 'retention'],
    accent: 'emerald',
  },

  // ── Caching ───────────────────────────────────────────────────────────────
  {
    type: 'in-memory-cache',
    label: 'In-Memory Cache',
    category: 'caching',
    icon: 'Zap',
    description: 'Fast cache inside or next to a single service.',
    details: 'Keeps hot data in RAM for sub-millisecond reads. Local caches are fast but not shared between instances.',
    tags: ['cache'],
    properties: ['evictionPolicy', 'writePolicy', 'ttl'],
    accent: 'amber',
  },
  {
    type: 'distributed-cache',
    label: 'Distributed Cache',
    category: 'caching',
    icon: 'MemoryStick',
    description: 'Shared cache cluster such as Redis or Memcached.',
    details: 'A cache shared by all instances. Use it for hot reads, sessions, counters and rate-limit state.',
    tags: ['cache'],
    properties: ['evictionPolicy', 'writePolicy', 'ttl', 'cacheReplication', 'deployment'],
    accent: 'amber',
  },
  {
    type: 'cdn-cache',
    label: 'CDN Cache',
    category: 'caching',
    icon: 'CloudDownload',
    description: 'Edge cache for cacheable responses.',
    details: 'Caches HTTP responses at the edge, so repeated requests never reach your servers.',
    tags: ['cache', 'edge-cache', 'cdn', 'edge', 'managed'],
    properties: ['cachedContent', 'invalidation', 'ttl'],
    accent: 'amber',
  },

  // ── Messaging & processing ────────────────────────────────────────────────
  {
    type: 'message-queue',
    label: 'Message Queue',
    category: 'messaging',
    icon: 'Inbox',
    description: 'Buffers messages between producers and consumers.',
    details: 'Decouples services: producers enqueue work and return quickly; consumers process at their own pace and retry on failure.',
    tags: ['queue', 'channel'],
    properties: ['delivery', 'ordering', 'deadLetter', 'retention', 'deployment'],
    accent: 'orange',
  },
  {
    type: 'event-stream',
    label: 'Event Stream',
    category: 'messaging',
    icon: 'Waves',
    description: 'Durable, replayable log of events (e.g. Kafka).',
    details: 'An append-only, partitioned log. Many consumer groups can read the same events independently and replay history.',
    tags: ['stream', 'channel'],
    properties: ['partitions', 'partitionKey', 'replicationFactor', 'retention', 'delivery', 'deployment'],
    accent: 'orange',
  },
  {
    type: 'event-consumer',
    label: 'Event Consumer',
    category: 'messaging',
    icon: 'ArrowDownToLine',
    description: 'Reads events from a queue or stream and reacts to them.',
    details: 'Consumes events and performs side effects such as updating a read model or sending a notification.',
    tags: ['consumer', 'compute', 'worker'],
    properties: ['role', 'instances', 'idempotency', 'retryStrategy', 'consumerGroup', 'deployment'],
    accent: 'orange',
  },
  {
    type: 'scheduler',
    label: 'Scheduler',
    category: 'messaging',
    icon: 'CalendarClock',
    description: 'Triggers jobs on a schedule or after a delay.',
    details: 'Fires cron or delayed jobs. Run it with leader election so jobs are not skipped or duplicated when a node fails.',
    tags: ['scheduler'],
    properties: ['trigger', 'availability', 'role', 'deployment'],
    accent: 'orange',
  },
  {
    type: 'task-queue',
    label: 'Task Queue',
    category: 'messaging',
    icon: 'ListTodo',
    description: 'Queue of jobs for background workers.',
    details: 'Holds units of work (tasks) with retries and priorities for a pool of workers.',
    tags: ['queue', 'channel'],
    properties: ['delivery', 'ordering', 'deadLetter', 'retention'],
    accent: 'orange',
  },
  {
    type: 'dead-letter-queue',
    label: 'Dead-Letter Queue',
    category: 'messaging',
    icon: 'OctagonAlert',
    description: 'Parks messages that repeatedly fail processing.',
    details: 'Failed messages are moved here after a number of retries so they can be inspected and replayed instead of being lost.',
    tags: ['dlq', 'queue'],
    properties: ['retention'],
    accent: 'orange',
  },

  // ── Supporting services ───────────────────────────────────────────────────
  {
    type: 'rate-limiter',
    label: 'Rate Limiter',
    category: 'supporting',
    icon: 'Gauge',
    description: 'Rejects callers that exceed their request quota.',
    details: 'Counts requests per user, IP or key and rejects excess traffic with HTTP 429 to protect the system.',
    tags: ['rate-limit', 'security'],
    properties: ['rlAlgorithm', 'rlScope', 'rlStore', 'failMode', 'instances', 'deployment'],
    accent: 'rose',
  },
  {
    type: 'notification-service',
    label: 'Notification Service',
    category: 'supporting',
    icon: 'Bell',
    description: 'Decides what to notify and dispatches it to channels.',
    details: 'Applies user preferences and templates, then hands messages to push, email or SMS providers.',
    tags: ['notification', 'compute', 'service'],
    properties: ['channels', 'instances', 'retryStrategy', 'idempotency', 'deployment'],
    accent: 'rose',
  },
  {
    type: 'email-sms-provider',
    label: 'Email/SMS Provider',
    category: 'supporting',
    icon: 'Mail',
    description: 'Third-party service that delivers email or SMS.',
    details: 'An external provider (e.g. SES, Twilio) that actually sends messages. It can be slow or fail, so call it asynchronously.',
    tags: ['provider', 'external', 'notification', 'managed'],
    properties: ['channels'],
    accent: 'rose',
  },
  {
    type: 'payment-provider',
    label: 'Payment Provider',
    category: 'supporting',
    icon: 'CreditCard',
    description: 'External payment processor (card networks, UPI, wallets).',
    details: 'Processes payments. Calls must be idempotent and results confirmed via webhooks because responses can time out.',
    tags: ['payment', 'external', 'provider', 'managed'],
    properties: ['webhooks', 'idempotency'],
    accent: 'rose',
  },
  {
    type: 'search-service',
    label: 'Search Service',
    category: 'supporting',
    icon: 'Search',
    description: 'Service that answers search queries.',
    details: 'Parses queries, queries the search index, ranks results and returns them.',
    tags: ['search', 'compute', 'service'],
    properties: ['role', 'instances', 'timeout', 'deployment'],
    accent: 'rose',
  },
  {
    type: 'logging-service',
    label: 'Logging Service',
    category: 'supporting',
    icon: 'ScrollText',
    description: 'Collects and stores application logs.',
    details: 'Centralises logs from every service so you can search and debug issues across the system.',
    tags: ['logging', 'observability'],
    properties: ['retention'],
    accent: 'cyan',
  },
  {
    type: 'metrics-monitoring',
    label: 'Metrics & Monitoring',
    category: 'supporting',
    icon: 'Activity',
    description: 'Collects metrics, draws dashboards and fires alerts.',
    details: 'Tracks latency, errors, saturation and traffic, and alerts on-call engineers when something goes wrong.',
    tags: ['metrics', 'observability'],
    properties: ['retention'],
    accent: 'cyan',
  },
  {
    type: 'distributed-tracing',
    label: 'Distributed Tracing',
    category: 'supporting',
    icon: 'Route',
    description: 'Follows a request across services.',
    details: 'Records spans for each hop of a request so you can see where time is spent across many services.',
    tags: ['tracing', 'observability'],
    properties: ['retention'],
    accent: 'cyan',
  },
  {
    type: 'secrets-manager',
    label: 'Secrets Manager',
    category: 'supporting',
    icon: 'KeyRound',
    description: 'Stores credentials and keys securely.',
    details: 'Keeps API keys, database passwords and encryption keys out of code and config files, with access control and rotation.',
    tags: ['secrets', 'security', 'managed'],
    properties: ['rotation'],
    accent: 'cyan',
  },
  {
    type: 'config-service',
    label: 'Configuration Service',
    category: 'supporting',
    icon: 'SlidersHorizontal',
    description: 'Central store for runtime configuration.',
    details: 'Serves configuration and flags to services so behaviour can change without redeploying.',
    tags: ['config'],
    properties: ['propagation', 'availability', 'deployment'],
    accent: 'cyan',
  },

  // ── Specialized ───────────────────────────────────────────────────────────
  {
    type: 'push-provider',
    label: 'Push Notification Provider',
    category: 'specialized',
    icon: 'BellRing',
    description: 'APNs / FCM gateway that delivers mobile push notifications.',
    details: 'Platform push services wake up mobile devices even when the app is closed.',
    tags: ['push', 'provider', 'external', 'notification', 'managed'],
    properties: [],
    accent: 'fuchsia',
  },
  {
    type: 'transcoder',
    label: 'Media Transcoder',
    category: 'specialized',
    icon: 'Film',
    description: 'Converts uploaded media into multiple formats and bitrates.',
    details: 'Transcodes video/audio into several resolutions and segments for adaptive bitrate streaming.',
    tags: ['media', 'compute', 'worker', 'consumer'],
    properties: ['instances', 'retryStrategy', 'idempotency', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'stream-processor',
    label: 'Stream Processor',
    category: 'specialized',
    icon: 'Workflow',
    description: 'Continuously computes over event streams (e.g. Flink).',
    details: 'Runs real-time aggregations, joins and detections over streams with checkpointed state.',
    tags: ['stream-processing', 'compute', 'consumer'],
    properties: ['processingState', 'windowing', 'delivery', 'instances', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'batch-processor',
    label: 'Batch Processor',
    category: 'specialized',
    icon: 'Factory',
    description: 'Runs large periodic jobs over stored data (e.g. Spark).',
    details: 'Processes big datasets offline, e.g. building indexes, training data or daily reports.',
    tags: ['batch', 'compute', 'analytics'],
    properties: ['schedule', 'role', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'ml-service',
    label: 'ML Inference Service',
    category: 'specialized',
    icon: 'BrainCircuit',
    description: 'Serves machine-learning model predictions.',
    details: 'Scores candidates or transactions with a trained model, online or in batch.',
    tags: ['ml', 'compute', 'service'],
    properties: ['servingMode', 'instances', 'timeout', 'role', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'feature-store',
    label: 'Feature Store',
    category: 'specialized',
    icon: 'Table',
    description: 'Stores ML features for training and real-time inference.',
    details: 'Keeps precomputed features consistent between offline training and online serving.',
    tags: ['ml', 'store'],
    properties: ['storeMode', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'geo-index',
    label: 'Geospatial Index',
    category: 'specialized',
    icon: 'MapPin',
    description: 'Indexes locations for fast proximity queries.',
    details: 'Uses geohash, quadtree, S2 or H3 cells to find nearby drivers, places or users quickly.',
    tags: ['geo', 'store'],
    properties: ['indexType', 'replicationFactor', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'id-generator',
    label: 'ID Generator',
    category: 'specialized',
    icon: 'Hash',
    description: 'Issues globally unique identifiers.',
    details: 'Generates unique IDs without collisions across many machines, e.g. Snowflake-style IDs.',
    tags: ['id-gen', 'service'],
    properties: ['idStrategy', 'instances', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'coordination-service',
    label: 'Coordination Service',
    category: 'specialized',
    icon: 'Network',
    description: 'Consensus store for leader election and locks (ZooKeeper/etcd).',
    details: 'A small strongly-consistent cluster used for leader election, distributed locks, membership and metadata.',
    tags: ['coordination'],
    properties: ['ensembleSize', 'coordinationUse', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'code-sandbox',
    label: 'Sandboxed Runner',
    category: 'specialized',
    icon: 'Container',
    description: 'Executes untrusted code in isolation.',
    details: 'Runs user code inside containers or micro-VMs with strict CPU, memory, time and network limits.',
    tags: ['sandbox', 'compute', 'worker', 'consumer', 'security'],
    properties: ['isolation', 'resourceLimits', 'networkAccess', 'instances', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'time-series-db',
    label: 'Time-Series Database',
    category: 'specialized',
    icon: 'TrendingUp',
    description: 'Stores timestamped metrics efficiently.',
    details: 'Optimised for append-heavy timestamped data with compression, retention and downsampling.',
    tags: ['tsdb', 'db', 'persistent', 'store'],
    properties: ['retention', 'downsampling', 'replicationFactor', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'graph-db',
    label: 'Graph Database',
    category: 'specialized',
    icon: 'Share2',
    description: 'Stores entities and relationships for traversal queries.',
    details: 'Efficient for "friends of friends" style queries over connected data.',
    tags: ['graph', 'db', 'persistent', 'store'],
    properties: ['replication', 'partitionKey', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'waf',
    label: 'Web Application Firewall',
    category: 'specialized',
    icon: 'Shield',
    description: 'Filters malicious HTTP traffic at the edge.',
    details: 'Blocks common attacks such as injection, XSS, credential stuffing and abusive bots before they reach your services.',
    tags: ['waf', 'security', 'edge', 'managed'],
    properties: ['wafRules'],
    accent: 'fuchsia',
  },
  {
    type: 'identity-provider',
    label: 'Identity Provider',
    category: 'specialized',
    icon: 'FingerprintPattern',
    description: 'External sign-in provider (OAuth / OIDC / SAML).',
    details: 'Federated identity such as Google or an enterprise SSO that your auth service trusts.',
    tags: ['idp', 'auth', 'external', 'provider', 'managed'],
    properties: ['idpProtocol'],
    accent: 'fuchsia',
  },
  {
    type: 'media-server',
    label: 'Media Server (SFU)',
    category: 'specialized',
    icon: 'Video',
    description: 'Routes real-time audio/video between participants.',
    details: 'A selective forwarding unit receives each participant’s stream once and forwards it to the others.',
    tags: ['media', 'realtime', 'compute'],
    properties: ['mediaTopology', 'instances', 'deployment'],
    accent: 'fuchsia',
  },
  {
    type: 'matching-engine',
    label: 'Matching Engine',
    category: 'specialized',
    icon: 'GitMerge',
    description: 'Matches buy and sell orders deterministically.',
    details: 'An in-memory, single-threaded-per-market engine that matches orders by price-time priority.',
    tags: ['matching', 'compute'],
    properties: ['standby', 'persistence', 'role'],
    accent: 'fuchsia',
  },
  {
    type: 'external-api',
    label: 'Third-party API',
    category: 'specialized',
    icon: 'Plug',
    description: 'An external partner/supplier API you do not control.',
    details: 'A third-party service such as an airline, hotel or shipping supplier API. It can be slow, rate limited or down, so call it with timeouts, retries and circuit breakers.',
    tags: ['external', 'provider'],
    properties: ['role'],
    accent: 'slate',
  },
]);

export type ComponentType = (typeof COMPONENTS)[number]['type'];

const BY_TYPE = new Map<string, ComponentDefinition>(COMPONENTS.map((c) => [c.type, c]));

export function getComponent(type: string): ComponentDefinition | undefined {
  return BY_TYPE.get(type);
}

export function isComponentType(type: string): type is ComponentType {
  return BY_TYPE.has(type);
}

export function componentsByCategory(): { id: ComponentCategoryId; label: string; components: ComponentDefinition[] }[] {
  return COMPONENT_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    components: COMPONENTS.filter((c) => c.category === cat.id),
  }));
}

export function componentHasTag(type: string, tag: ComponentTag): boolean {
  return BY_TYPE.get(type)?.tags.includes(tag) ?? false;
}
