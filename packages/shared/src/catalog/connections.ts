import { componentHasTag, getComponent } from './components';

/**
 * Connection (edge) properties. Arrows always point from the caller / producer
 * to the component it calls or publishes to. Responses flow back implicitly.
 */

export const CONNECTION_TYPES = [
  { value: 'request', label: 'Request / response' },
  { value: 'event', label: 'Publish / consume event' },
  { value: 'replication', label: 'Data replication' },
  { value: 'data-sync', label: 'Data sync / CDC / ETL' },
  { value: 'push', label: 'Server push' },
  { value: 'media', label: 'Media stream' },
] as const;

export const PROTOCOLS = [
  { value: 'https', label: 'HTTPS / REST' },
  { value: 'grpc', label: 'gRPC' },
  { value: 'websocket', label: 'WebSocket' },
  { value: 'tcp', label: 'TCP' },
  { value: 'db-driver', label: 'Database protocol' },
  { value: 'queue', label: 'Queue / broker protocol' },
  { value: 'webrtc', label: 'WebRTC' },
  { value: 'other', label: 'Other' },
] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number]['value'];
export type Protocol = (typeof PROTOCOLS)[number]['value'];
export type CommunicationMode = 'sync' | 'async';
export type Operation = 'read' | 'write' | 'read-write';
export type Direction = 'one-way' | 'bidirectional';

export interface ConnectionProps {
  connectionType: ConnectionType;
  protocol: Protocol;
  mode: CommunicationMode;
  operation: Operation;
  direction: Direction;
  critical: boolean;
  description?: string;
  label?: string;
}

export const CONNECTION_FIELD_HELP = {
  connectionType: 'What kind of interaction this is. Most connections are request/response; queues and streams carry events.',
  protocol: 'How the two components talk. Pick the closest match — it does not need to be exact.',
  mode: 'Synchronous calls wait for a response; asynchronous calls hand off work and return immediately.',
  operation: 'Whether this connection reads data, writes data, or both.',
  direction: 'Bidirectional connections (e.g. WebSockets) let both sides send messages at any time.',
  critical: 'Mark connections the core user flow depends on. Critical connections should not rely on a single point of failure.',
  description: 'Optional short note describing what flows over this connection.',
} as const;

const isChannel = (type: string) => componentHasTag(type, 'channel') || componentHasTag(type, 'dlq');
const isStore = (type: string) =>
  ['db', 'cache', 'blob', 'search-index', 'warehouse', 'store'].some((t) => componentHasTag(type, t as never));

/** Sensible defaults so beginners can connect components without configuring anything. */
export function inferConnectionProps(sourceType: string, targetType: string): ConnectionProps {
  const base: ConnectionProps = {
    connectionType: 'request',
    protocol: 'https',
    mode: 'sync',
    operation: 'read-write',
    direction: 'one-way',
    critical: false,
  };

  if (isChannel(targetType)) {
    return { ...base, connectionType: 'event', protocol: 'queue', mode: 'async', operation: 'write' };
  }
  if (isChannel(sourceType)) {
    return { ...base, connectionType: 'event', protocol: 'queue', mode: 'async', operation: 'read' };
  }
  if (componentHasTag(sourceType, 'db') && (componentHasTag(targetType, 'replica') || componentHasTag(targetType, 'db'))) {
    return { ...base, connectionType: 'replication', protocol: 'db-driver', mode: 'async', operation: 'write' };
  }
  if (isStore(sourceType) && isStore(targetType)) {
    return { ...base, connectionType: 'data-sync', protocol: 'other', mode: 'async', operation: 'write' };
  }
  if (componentHasTag(targetType, 'media') && componentHasTag(targetType, 'realtime')) {
    return { ...base, connectionType: 'media', protocol: 'webrtc', direction: 'bidirectional' };
  }
  if (componentHasTag(targetType, 'realtime') || componentHasTag(sourceType, 'realtime')) {
    const towardsClient = componentHasTag(targetType, 'client');
    return {
      ...base,
      connectionType: towardsClient ? 'push' : 'request',
      protocol: 'websocket',
      direction: componentHasTag(sourceType, 'client') || towardsClient ? 'bidirectional' : 'one-way',
    };
  }
  if (componentHasTag(targetType, 'client')) {
    return { ...base, connectionType: 'push', mode: 'async', operation: 'write' };
  }
  if (componentHasTag(targetType, 'db') || componentHasTag(targetType, 'cache') || componentHasTag(targetType, 'search-index')) {
    return { ...base, protocol: 'db-driver' };
  }
  if (componentHasTag(targetType, 'external')) {
    return { ...base, protocol: 'https' };
  }
  const src = getComponent(sourceType);
  const tgt = getComponent(targetType);
  if (src?.tags.includes('service') && tgt?.tags.includes('service')) {
    return { ...base, protocol: 'grpc' };
  }
  return base;
}
