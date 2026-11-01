import { describePropertyValue } from '@arch-arena/shared';

export interface PatternBadge {
  key: 'outbox' | 'dual-write' | 'idempotent' | 'unique';
  label: string;
  tone: 'good' | 'risk';
  /** Hover text explaining the choice. */
  title: string;
}

const isSet = (v: unknown) => v !== undefined && v !== '' && v !== 'none';

/**
 * Data-safety patterns chosen on a component (outbox, idempotency, unique constraints).
 * They are invisible in a plain box-and-arrow diagram, so the canvas shows them as small badges.
 */
export function patternBadges(props: Record<string, unknown>): PatternBadge[] {
  const badges: PatternBadge[] = [];
  const publishing = props.eventPublishing;
  if (publishing === 'outbox-polling' || publishing === 'outbox-cdc') {
    badges.push({
      key: 'outbox',
      label: 'outbox',
      tone: 'good',
      title: `${describePropertyValue('eventPublishing', publishing)}: events are saved with the data and a relay publishes them, so none is lost.`,
    });
  } else if (publishing === 'direct') {
    badges.push({ key: 'dual-write', label: 'dual write', tone: 'risk', title: 'Saves and publishes as two separate steps: a crash in between loses the event.' });
  }
  if (isSet(props.idempotency)) {
    badges.push({ key: 'idempotent', label: 'idempotent', tone: 'good', title: `Idempotency: ${describePropertyValue('idempotency', props.idempotency)}. Repeats and duplicate messages are applied once.` });
  }
  if (isSet(props.uniqueConstraints)) {
    badges.push({ key: 'unique', label: 'unique keys', tone: 'good', title: `Unique constraints: ${describePropertyValue('uniqueConstraints', props.uniqueConstraints)}. The database rejects duplicates.` });
  }
  return badges;
}
