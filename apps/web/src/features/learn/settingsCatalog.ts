import { COMPONENTS, CONNECTION_FIELD_HELP, CONNECTION_TYPES, PROPERTY_FIELDS, PROTOCOLS, type PropertyField } from '@arch-arena/shared';
import { Cable, Database, HardDrive, Inbox, Layers, Lock, Radio, ShieldCheck, Signpost, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import { bi } from './dsl';
import type { Bi } from './types';

/**
 * Every setting a learner can change in the playground's Properties panel: the component
 * properties from the shared catalog plus the settings of a connection (arrow).
 * The plain-language explanations live in content/settings and are loaded on demand.
 */

export type SettingScope = 'component' | 'connection';

export interface SettingField extends PropertyField {
  scope: SettingScope;
  /** Component types that offer this setting (empty for connection settings). */
  usedBy: string[];
}

export interface SettingGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  intro: Bi;
  keys: string[];
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: 'scaling',
    title: 'Scaling & availability',
    icon: Layers,
    intro: bi('How many copies run and where, so one failure does not take you down.', 'Kitni copies chalti hain aur kahan, taaki ek failure se sab band na ho.'),
    keys: ['role', 'instances', 'stateless', 'availability', 'deployment'],
  },
  {
    id: 'reliability',
    title: 'Reliability: when calls fail',
    icon: ShieldCheck,
    intro: bi('What happens when another component is slow, broken or answers twice.', 'Jab doosra component slow ho, toota ho ya do baar jawab de, tab kya hota hai.'),
    keys: ['timeout', 'retryStrategy', 'circuitBreaker', 'idempotency', 'healthChecks'],
  },
  {
    id: 'traffic',
    title: 'Traffic & routing',
    icon: Signpost,
    intro: bi('How requests find the right server, region or cached copy.', 'Requests sahi server, region ya cached copy tak kaise pahunchti hain.'),
    keys: ['lbAlgorithm', 'lbLayer', 'routingPolicy', 'cachedContent', 'invalidation'],
  },
  {
    id: 'databases',
    title: 'Databases',
    icon: Database,
    intro: bi('Copies, correctness and splitting data across machines.', 'Copies, sahi data aur data ko machines mein baantna.'),
    keys: [
      'replication',
      'consistency',
      'concurrencyControl',
      'backups',
      'access',
      'dataModel',
      'partitionKey',
      'replicationFactor',
      'shardingStrategy',
      'shardCount',
      'replicaCount',
    ],
  },
  {
    id: 'storage',
    title: 'Files, retention & analytics',
    icon: HardDrive,
    intro: bi('Uploading files, keeping them safe and deciding how long data lives.', 'Files upload karna, unhe safe rakhna aur data kitne din rahega yeh decide karna.'),
    keys: ['uploadMethod', 'durability', 'lifecycle', 'retention', 'downsampling', 'ingestion'],
  },
  {
    id: 'caching',
    title: 'Caching',
    icon: Zap,
    intro: bi('What the cache keeps, for how long, and how it stays in step with the database.', 'Cache kya rakhta hai, kitni der, aur database ke saath kaise sync rehta hai.'),
    keys: ['evictionPolicy', 'writePolicy', 'ttl', 'cacheReplication'],
  },
  {
    id: 'messaging',
    title: 'Queues, events & jobs',
    icon: Inbox,
    intro: bi('Delivery promises, ordering, parallelism and scheduled work.', 'Delivery ke vaade, order, parallel kaam aur scheduled jobs.'),
    keys: ['delivery', 'ordering', 'deadLetter', 'partitions', 'consumerGroup', 'processingState', 'windowing', 'trigger', 'schedule'],
  },
  {
    id: 'security',
    title: 'Security & limits',
    icon: Lock,
    intro: bi('Who may call, how often, and how secrets stay secret.', 'Kaun call kar sakta hai, kitni baar, aur secrets secret kaise rehte hain.'),
    keys: ['authentication', 'authMethod', 'mfa', 'idpProtocol', 'rateLimiting', 'rlAlgorithm', 'rlScope', 'rlStore', 'failMode', 'wafRules', 'rotation'],
  },
  {
    id: 'realtime',
    title: 'Real-time & notifications',
    icon: Radio,
    intro: bi('Live connections, calls, alerts and instant config changes.', 'Live connections, calls, alerts aur turant config changes.'),
    keys: ['connectionRegistry', 'heartbeat', 'mediaTopology', 'channels', 'webhooks', 'propagation'],
  },
  {
    id: 'specialized',
    title: 'Special-purpose engines',
    icon: Sparkles,
    intro: bi('Coordination, IDs, machine learning, maps, code sandboxes and trading engines.', 'Coordination, IDs, machine learning, maps, code sandboxes aur trading engines.'),
    keys: [
      'ensembleSize',
      'coordinationUse',
      'idStrategy',
      'servingMode',
      'storeMode',
      'indexType',
      'isolation',
      'resourceLimits',
      'networkAccess',
      'standby',
      'persistence',
    ],
  },
  {
    id: 'connections',
    title: 'Connections (the arrows)',
    icon: Cable,
    intro: bi('Settings you see after clicking an arrow between two components.', 'Do components ke beech ke arrow pe click karne ke baad dikhne wali settings.'),
    keys: ['label', 'connectionType', 'mode', 'operation', 'protocol', 'direction', 'critical', 'description'],
  },
];

const connectionField = (field: PropertyField): SettingField => ({ ...field, scope: 'connection', usedBy: [] });

/** Settings of a connection, in the order the Properties panel shows them. */
export const CONNECTION_FIELDS: SettingField[] = [
  connectionField({ key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. write order', help: 'Short text shown on the arrow.' }),
  connectionField({ key: 'connectionType', label: 'Connection type', type: 'select', options: CONNECTION_TYPES.map((o) => ({ ...o })), help: CONNECTION_FIELD_HELP.connectionType }),
  connectionField({
    key: 'mode',
    label: 'Communication',
    type: 'select',
    options: [
      { value: 'sync', label: 'Synchronous' },
      { value: 'async', label: 'Asynchronous' },
    ],
    help: CONNECTION_FIELD_HELP.mode,
  }),
  connectionField({
    key: 'operation',
    label: 'Operation',
    type: 'select',
    options: [
      { value: 'read', label: 'Read' },
      { value: 'write', label: 'Write' },
      { value: 'read-write', label: 'Both' },
    ],
    help: CONNECTION_FIELD_HELP.operation,
  }),
  connectionField({ key: 'protocol', label: 'Protocol', type: 'select', options: PROTOCOLS.map((o) => ({ ...o })), help: CONNECTION_FIELD_HELP.protocol }),
  connectionField({
    key: 'direction',
    label: 'Direction',
    type: 'select',
    options: [
      { value: 'one-way', label: 'One-way' },
      { value: 'bidirectional', label: 'Bidirectional' },
    ],
    help: CONNECTION_FIELD_HELP.direction,
  }),
  connectionField({ key: 'critical', label: 'Critical path', type: 'boolean', help: CONNECTION_FIELD_HELP.critical }),
  connectionField({ key: 'description', label: 'Data flow description', type: 'text', help: CONNECTION_FIELD_HELP.description }),
];

const COMPONENT_FIELDS: SettingField[] = Object.values(PROPERTY_FIELDS as Record<string, PropertyField>).map((field) => ({
  ...field,
  scope: 'component',
  usedBy: COMPONENTS.filter((c) => (c.properties as string[]).includes(field.key)).map((c) => c.type),
}));

const byKey = new Map<string, SettingField>([...COMPONENT_FIELDS, ...CONNECTION_FIELDS].map((f) => [`${f.scope}:${f.key}`, f]));

/** Look up a setting. Component settings and connection settings live in separate namespaces. */
export function getSettingField(key: string, scope: SettingScope = 'component'): SettingField | undefined {
  return byKey.get(`${scope}:${key}`);
}

export const groupScope = (group: SettingGroup): SettingScope => (group.id === 'connections' ? 'connection' : 'component');

/** All settings, grouped and in reading order. */
export const SETTING_FIELDS: { group: SettingGroup; fields: SettingField[] }[] = SETTING_GROUPS.map((group) => ({
  group,
  fields: group.keys.map((k) => getSettingField(k, groupScope(group))).filter((f): f is SettingField => !!f),
}));

/** Every component setting key, for completeness checks. */
export const COMPONENT_SETTING_KEYS: string[] = COMPONENT_FIELDS.map((f) => f.key);

/** Anchor id of a setting on the configuration guide page. */
export const settingAnchor = (key: string, scope: SettingScope = 'component') => (scope === 'connection' ? `connection-${key}` : `setting-${key}`);

/** Link to the configuration guide, optionally filtered to one component and/or scrolled to one setting. */
export function settingsGuidePath(opts: { component?: string; key?: string; scope?: SettingScope } = {}): string {
  const query = opts.component ? `?component=${encodeURIComponent(opts.component)}` : '';
  const hash = opts.key ? `#${settingAnchor(opts.key, opts.scope)}` : '';
  return `/learn/settings${query}${hash}`;
}
