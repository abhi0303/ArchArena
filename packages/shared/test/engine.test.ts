import { describe, expect, it } from 'vitest';
import { evaluateDesign } from '../src/evaluation/engine';
import { validateDesign } from '../src/evaluation/validate';
import { DiagramGraph } from '../src/diagram/graph';
import { evaluateRule } from '../src/evaluation/rules';
import { getQuestionBySlug, referenceToDiagram, toEvaluationInput } from '../src/questions';
import { diagram } from './helpers';

const urlShortener = getQuestionBySlug('url-shortener-basic')!;
const input = toEvaluationInput(urlShortener);

describe('evaluation engine — URL shortener', () => {
  it('scores the reference architecture highly', () => {
    const report = evaluateDesign(referenceToDiagram(urlShortener.reference), input);
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.stars).toBe(5);
    expect(report.criticalFailures).toHaveLength(0);
  });

  it('gives zero for an empty canvas', () => {
    const report = evaluateDesign({ version: 1, nodes: [], edges: [] }, input);
    expect(report.score).toBe(0);
    expect(report.stars).toBe(0);
  });

  it('heavily penalises the right components without connections', () => {
    const ref = referenceToDiagram(urlShortener.reference);
    const unconnected = { ...ref, edges: [] };
    const report = evaluateDesign(unconnected, input);
    expect(report.score).toBeLessThan(45);
    expect(report.invalidConnections.length).toBeGreaterThan(0);
    expect(report.missingConnections.length).toBeGreaterThan(0);
  });

  it('caps the score when a critical capability is missing (no database)', () => {
    const d = diagram(
      { web: 'web-client', lb: 'load-balancer', app: ['app-server', { instances: 'multiple' }], cache: 'distributed-cache' },
      ['web>lb', 'lb>app', 'app>cache'],
    );
    const report = evaluateDesign(d, input);
    expect(report.criticalFailures.length).toBeGreaterThan(0);
    expect(report.score).toBeLessThanOrEqual(50);
  });

  it('rewards adding a cache to a minimal working design', () => {
    const minimal = diagram({ web: 'web-client', app: 'app-server', db: 'sql-db' }, ['web>app', 'app>db']);
    const withCache = diagram({ web: 'web-client', app: 'app-server', db: 'sql-db', cache: 'distributed-cache' }, ['web>app', 'app>db', 'app>cache']);
    const a = evaluateDesign(minimal, input);
    const b = evaluateDesign(withCache, input);
    expect(b.score).toBeGreaterThan(a.score);
    expect(a.checks.find((c) => c.id === 'redirect-cache')?.status).toBe('fail');
    expect(b.checks.find((c) => c.id === 'redirect-cache')?.status).toBe('pass');
  });

  it('flags clients that talk to the database directly', () => {
    const d = diagram({ web: 'web-client', app: 'app-server', db: 'sql-db' }, ['web>app', 'app>db', 'web>db']);
    const report = evaluateDesign(d, input);
    expect(report.securityConcerns.some((f) => f.title.includes('directly'))).toBe(true);
  });

  it('flags reversed connections', () => {
    const d = diagram({ web: 'web-client', app: 'app-server', db: 'sql-db' }, ['web>app', 'db>app']);
    const report = evaluateDesign(d, input);
    expect(report.invalidConnections.some((f) => f.title.includes('reversed'))).toBe(true);
    expect(report.checks.find((c) => c.id === 'persist')?.status).toBe('partial');
  });

  it('explains every deduction', () => {
    const d = diagram({ web: 'web-client', app: 'app-server', db: 'sql-db' }, ['web>app', 'app>db']);
    const report = evaluateDesign(d, input);
    for (const cat of report.categories) {
      if (cat.score < 100 && cat.assessed) expect(cat.deductions.length).toBeGreaterThan(0);
    }
    expect(report.suggestions.length).toBeGreaterThan(0);
  });

  it('marks unconfigured properties as needing configuration instead of guessing', () => {
    const d = diagram({ web: 'web-client', app: 'app-server', db: 'sql-db' }, ['web>app', 'app>db']);
    const report = evaluateDesign(d, input);
    expect(report.checks.find((c) => c.id === 'unique-codes')?.status).toBe('needs-config');
  });
});

describe('quick validation', () => {
  it('reports queues without consumers and isolated components', () => {
    const d = diagram({ web: 'web-client', app: 'app-server', q: 'message-queue', lonely: 'distributed-cache' }, ['web>app', 'app>q']);
    const result = validateDesign(d, input);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.title === 'Queue without consumer')).toBe(true);
    expect(result.issues.some((i) => i.title === 'Unconnected component')).toBe(true);
  });

  it('reports requirement coverage', () => {
    const result = validateDesign(referenceToDiagram(urlShortener.reference), input);
    expect(result.requirementCoverage.every((r) => r.status === 'met')).toBe(true);
  });
});

describe('rules', () => {
  it('detects guard bypasses', () => {
    const d = diagram(
      { web: 'web-client', rl: 'rate-limiter', app: 'app-server' },
      ['web>rl', 'rl>app', 'web>app'],
    );
    const g = new DiagramGraph(d);
    const r = evaluateRule({ kind: 'guarded', from: { tags: ['client'] }, to: { tags: ['service'] }, guard: { types: ['rate-limiter'] } }, g);
    expect(r.status).toBe('partial');
  });

  it('follows async producer → channel → consumer flows', () => {
    const d = diagram({ app: 'app-server', q: 'message-queue', w: 'background-worker' }, ['app>q', 'q>w']);
    const g = new DiagramGraph(d);
    const r = evaluateRule({ kind: 'async', producer: { tags: ['service'] }, consumer: { tags: ['worker'] } }, g);
    expect(r.status).toBe('pass');
  });

  it('gives partial credit for synchronous calls where async is expected', () => {
    const d = diagram({ app: 'app-server', w: 'background-worker' }, ['app>w']);
    const g = new DiagramGraph(d);
    const r = evaluateRule({ kind: 'async', producer: { tags: ['service'] }, consumer: { tags: ['worker'] } }, g);
    expect(r.status).toBe('partial');
  });

  it('respects bidirectional edges when finding paths', () => {
    const d = diagram({ web: 'web-client', ws: 'websocket-server' }, ['ws<>web']);
    const g = new DiagramGraph(d);
    expect(g.findPath({ tags: ['client'] }, { tags: ['realtime'] })).not.toBeNull();
  });
});
