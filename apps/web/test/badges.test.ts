import { describe, expect, it } from 'vitest';
import { patternBadges } from '@/features/playground/badges';

const keys = (props: Record<string, unknown>) => patternBadges(props).map((b) => b.key);

describe('canvas badges for data-safety settings', () => {
  it('shows nothing until a pattern is chosen', () => {
    expect(keys({})).toEqual([]);
    expect(keys({ idempotency: 'none', uniqueConstraints: 'none', instances: 'multiple' })).toEqual([]);
  });

  it('marks an outbox as safe and a direct publish as a risk', () => {
    const outbox = patternBadges({ eventPublishing: 'outbox-cdc' })[0]!;
    expect(outbox).toMatchObject({ key: 'outbox', tone: 'good' });
    expect(outbox.title).toContain('CDC relay');
    expect(patternBadges({ eventPublishing: 'direct' })[0]).toMatchObject({ key: 'dual-write', tone: 'risk' });
  });

  it('shows idempotency and unique constraints with the chosen option on hover', () => {
    const [idem, unique] = patternBadges({ idempotency: 'dedupe-store', uniqueConstraints: 'both' });
    expect(idem!.title).toContain('De-duplication store');
    expect(unique!.title).toContain('Business keys + request ids');
    expect(keys({ eventPublishing: 'outbox-polling', idempotency: 'idempotency-keys' })).toEqual(['outbox', 'idempotent']);
  });
});
