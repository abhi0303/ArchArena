import { describe, expect, it } from 'vitest';
import type { ConnectionProps } from '../src/catalog/connections';
import type { PropertyValue } from '../src/catalog/properties';
import type { DiagramSnapshot } from '../src/diagram/types';
import { evaluateDesign } from '../src/evaluation/engine';
import type { EvaluationInput, Rubric } from '../src/evaluation/types';
import { validateDesign } from '../src/evaluation/validate';
import { getQuestionBySlug, referenceToDiagram, toEvaluationInput } from '../src/questions';
import { S, T } from '../src/questions/dsl';
import { diagram } from './helpers';

type Props = Record<string, PropertyValue>;

/** A rubric that checks none of the data-safety settings, so every tip can appear. */
const input = (rubric: Rubric = { checks: [] }): EvaluationInput => ({ questionId: 'test', difficulty: 'medium', rubricVersion: 1, rubric, requirements: [] });

/** Order API saves to a database and publishes to a queue; a consumer reads the queue. */
function orderFlow({ api = {}, db = {}, consumer = {}, queue = {} }: { api?: Props; db?: Props; consumer?: Props; queue?: Props } = {}, dbEdge: Partial<ConnectionProps> = {}): DiagramSnapshot {
  return diagram(
    {
      web: 'web-client',
      lb: ['load-balancer', { availability: 'managed-ha' }],
      api: ['microservice', { instances: 'multiple', ...api }],
      db: ['sql-db', { replication: 'leader-follower-sync', ...db }],
      q: ['message-queue', queue],
      w: ['event-consumer', { instances: 'multiple', ...consumer }],
    },
    ['web>lb', 'lb>api', ['api>db', dbEdge], 'api>q', 'q>w'],
  );
}

const tips = (d: DiagramSnapshot, rubric?: Rubric) => evaluateDesign(d, input(rubric)).issues.filter((i) => i.bucket === 'data-safety');
const codes = (d: DiagramSnapshot, rubric?: Rubric) => tips(d, rubric).map((i) => i.code);

describe('data safety tips: transactional outbox', () => {
  it('flags a service that saves and publishes as two separate steps', () => {
    const tip = tips(orderFlow()).find((i) => i.code === 'dual-write')!;
    expect(tip).toBeDefined();
    expect(tip.severity).toBe('info');
    expect(tip.settings).toEqual(['eventPublishing']);
    expect(tip.nodeIds).toEqual(expect.arrayContaining(['api', 'db', 'q']));
    expect(tip.fix).toContain('Publishing events');
  });

  it('is satisfied by either outbox relay, but not by direct publishing', () => {
    expect(codes(orderFlow({ api: { eventPublishing: 'outbox-polling' } }))).not.toContain('dual-write');
    expect(codes(orderFlow({ api: { eventPublishing: 'outbox-cdc' } }))).not.toContain('dual-write');
    expect(codes(orderFlow({ api: { eventPublishing: 'direct' } }))).toContain('dual-write');
  });

  it('ignores services that only read from the database', () => {
    expect(codes(orderFlow({}, { operation: 'read' }))).not.toContain('dual-write');
  });
});

describe('data safety tips: idempotent consumer', () => {
  it('flags a consumer of an at-least-once queue without idempotency', () => {
    const tip = tips(orderFlow()).find((i) => i.code === 'duplicate-delivery')!;
    expect(tip.nodeIds).toEqual(expect.arrayContaining(['w', 'q']));
    expect(tip.settings).toEqual(['idempotency']);
  });

  it('is satisfied by any idempotency technique, or an at-most-once queue', () => {
    for (const idempotency of ['idempotency-keys', 'dedupe-store', 'idempotent-writes']) {
      expect(codes(orderFlow({ consumer: { idempotency } }))).not.toContain('duplicate-delivery');
    }
    expect(codes(orderFlow({ consumer: { idempotency: 'none' } }))).toContain('duplicate-delivery');
    expect(codes(orderFlow({ queue: { delivery: 'at-most-once' } }))).not.toContain('duplicate-delivery');
  });
});

describe('data safety tips: unique constraints', () => {
  it('flags idempotency keys stored without a unique constraint', () => {
    const tip = tips(orderFlow({ api: { idempotency: 'idempotency-keys' } })).find((i) => i.code === 'idempotency-race')!;
    expect(tip.nodeIds).toEqual(['api', 'db']);
    expect(tip.settings).toEqual(['uniqueConstraints']);
  });

  it('needs request ids for idempotency keys, and any unique key for idempotent writes', () => {
    const race = (api: Props, db: Props) => codes(orderFlow({ api, db })).includes('idempotency-race');
    expect(race({ idempotency: 'idempotency-keys' }, { uniqueConstraints: 'request-ids' })).toBe(false);
    expect(race({ idempotency: 'idempotency-keys' }, { uniqueConstraints: 'both' })).toBe(false);
    expect(race({ idempotency: 'idempotency-keys' }, { uniqueConstraints: 'business-keys' })).toBe(true);
    expect(race({ idempotency: 'idempotent-writes' }, { uniqueConstraints: 'business-keys' })).toBe(false);
    expect(race({ idempotency: 'dedupe-store' }, { concurrencyControl: 'conditional-writes' })).toBe(false);
    expect(race({ idempotency: 'none' }, {})).toBe(false);
  });

  it('does not ask for a unique constraint when duplicates are tracked in a cache', () => {
    const d = orderFlow({ api: { idempotency: 'dedupe-store' } });
    d.nodes.push({ id: 'cache', kind: 'component', componentType: 'distributed-cache', label: 'Seen ids', position: { x: 0, y: 0 }, props: {} });
    d.edges.push({ ...d.edges[2]!, id: 'e-cache', target: 'cache' });
    expect(codes(d)).not.toContain('idempotency-race');
  });
});

describe('data safety tips: scoring and feedback', () => {
  it('never changes the score', () => {
    const risky = evaluateDesign(orderFlow(), input());
    const safe = evaluateDesign(
      orderFlow({ api: { eventPublishing: 'outbox-cdc', idempotency: 'idempotency-keys' }, db: { uniqueConstraints: 'both' }, consumer: { idempotency: 'dedupe-store' } }),
      input(),
    );
    expect(risky.dataSafety!.length).toBe(2);
    expect(safe.dataSafety).toEqual([]);
    expect(risky.score).toBe(safe.score);
    expect(risky.issues.filter((i) => i.bucket === 'data-safety').every((i) => i.penalty === 0)).toBe(true);
  });

  it('shows tips in quick validation without blocking it', () => {
    const result = validateDesign(orderFlow(), input());
    const tip = result.issues.find((i) => i.title === 'An event can be lost after a save');
    expect(tip?.severity).toBe('info');
    expect(result.errorCount).toBe(0);
  });

  it('stays quiet where the challenge rubric already checks the same setting', () => {
    const rubric: Rubric = { checks: [T.outbox(S.service), T.idempotent(S.worker), T.uniqueKeys(S.db)] };
    expect(codes(orderFlow({ api: { idempotency: 'idempotency-keys' } }), rubric)).toEqual([]);
  });
});

describe('bonus checks in challenges', () => {
  it('rewards the outbox and unique constraints in the reference designs, without making them required', () => {
    for (const slug of ['ecommerce-checkout', 'payment-processing-platform', 'ticket-booking-system', 'distributed-wallet-and-ledger', 'banking-transaction-platform']) {
      const q = getQuestionBySlug(slug)!;
      const checks = q.rubric.checks.filter((c) => c.id === 'outbox' || c.id === 'unique-keys');
      expect(checks.map((c) => c.id).sort(), slug).toEqual(['outbox', 'unique-keys']);
      expect(checks.every((c) => c.optional), slug).toBe(true);

      const ref = referenceToDiagram(q.reference);
      const withPatterns = evaluateDesign(ref, toEvaluationInput(q));
      for (const c of checks) expect(withPatterns.checks.find((o) => o.id === c.id)?.status, `${slug} ${c.id}`).toBe('pass');

      // Removing the bonus settings costs nothing: the checks only ever add credit.
      const stripped = structuredClone(ref);
      for (const n of stripped.nodes) {
        delete n.props.eventPublishing;
        delete n.props.uniqueConstraints;
      }
      const without = evaluateDesign(stripped, toEvaluationInput(q));
      expect(without.score, slug).toBe(withPatterns.score);
    }
  });

  it('accepts a unique constraint on the short code as collision-safe', () => {
    const q = getQuestionBySlug('url-shortener-basic')!;
    const d = diagram({ web: 'web-client', app: 'app-server', db: ['sql-db', { uniqueConstraints: 'business-keys' }] }, ['web>app', 'app>db']);
    const report = evaluateDesign(d, toEvaluationInput(q));
    expect(report.checks.find((c) => c.id === 'unique-codes')?.status).toBe('pass');
  });
});
