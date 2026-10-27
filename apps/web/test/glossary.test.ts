import { COMPONENTS } from '@arch-arena/shared';
import { describe, expect, it } from 'vitest';
import { GLOSSARY, getTerm, splitTerms, termIdsIn } from '@/features/glossary';
import { PREP_QUESTIONS } from '@/features/prep/content';

const linked = (text: string) => splitTerms(text).filter((p): p is { text: string; id: string } => typeof p !== 'string');

describe('glossary: content', () => {
  it('has unique ids and unique aliases', () => {
    expect(new Set(GLOSSARY.map((t) => t.id)).size).toBe(GLOSSARY.length);
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const t of GLOSSARY) {
      for (const a of t.aliases) {
        const key = a.toLowerCase();
        if (seen.has(key) && seen.get(key) !== t.id) clashes.push(`"${a}" is used by ${seen.get(key)} and ${t.id}`);
        seen.set(key, t.id);
      }
    }
    expect(clashes).toEqual([]);
  });

  it('explains every term in English and a different Hinglish, with real-life examples for most', () => {
    const problems: string[] = [];
    for (const t of GLOSSARY) {
      if (!t.aliases.length) problems.push(`${t.id}: no aliases`);
      for (const [name, b] of [['simple', t.simple], ['example', t.example]] as const) {
        if (!b) continue;
        if (!b.en.trim() || !b.hi.trim()) problems.push(`${t.id}.${name}: empty`);
        else if (b.en === b.hi) problems.push(`${t.id}.${name}: Hinglish is identical to English`);
      }
      if (t.simple.en.length < 60) problems.push(`${t.id}: the meaning is too short to be useful`);
    }
    expect(problems).toEqual([]);
    expect(GLOSSARY.length).toBeGreaterThan(120);
    expect(GLOSSARY.filter((t) => t.example).length / GLOSSARY.length).toBeGreaterThan(0.6);
  });

  it('links only to things that exist', () => {
    const types = new Set<string>(COMPONENTS.map((c) => c.type));
    const prepPaths = new Set(PREP_QUESTIONS.map((q) => `/prep/${q.category}/${q.id}`));
    const problems: string[] = [];
    for (const t of GLOSSARY) {
      for (const r of t.related ?? []) if (!getTerm(r)) problems.push(`${t.id}: unknown related term ${r}`);
      for (const c of [t.component].flat()) if (c && !types.has(c)) problems.push(`${t.id}: unknown component ${c}`);
      if (t.more?.startsWith('/prep/') && !prepPaths.has(t.more)) problems.push(`${t.id}: unknown prep page ${t.more}`);
      if (t.more?.startsWith('/learn/') && !types.has(t.more.slice('/learn/'.length))) problems.push(`${t.id}: unknown guide ${t.more}`);
    }
    expect(problems).toEqual([]);
  });
});

describe('glossary: finding terms in text', () => {
  it('underlines the terms from the example sentence', () => {
    const text =
      'No. I retry only when the failure is likely temporary and the operation is safe to repeat. Retrying a permanent error just wastes resources, and retrying a non-idempotent request — like a payment — can execute it twice.';
    const found = linked(text);
    expect(found).toContainEqual({ text: 'non-idempotent request', id: 'idempotency' });
    expect(found).toContainEqual({ text: 'permanent error', id: 'transient' });
    expect(linked('How I retry: exponential backoff with jitter').map((p) => p.id)).toEqual(['exponential-backoff', 'jitter']);
  });

  it('keeps the text intact around the links', () => {
    const text = 'Put a load balancer in front of two servers.';
    const pieces = splitTerms(text);
    expect(pieces.map((p) => (typeof p === 'string' ? p : p.text)).join('')).toBe(text);
    expect(pieces).toContainEqual({ text: 'load balancer', id: 'load-balancer' });
  });

  it('prefers the longest phrase, matches whole words only and allows plurals', () => {
    expect(linked('JWTs are signed')).toEqual([{ text: 'JWTs', id: 'jwt' }]);
    expect(linked('three pods restarted').map((p) => p.id)).toEqual(['pod']);
    expect(linked('a spanish podcast about spans')).toEqual([{ text: 'spans', id: 'distributed-tracing' }]);
    expect(linked('use CI/CD')).toEqual([{ text: 'CI/CD', id: 'ci' }]);
  });

  it('links each term once per block and respects skipped terms', () => {
    expect(linked('a cache, then another cache').length).toBe(1);
    expect(splitTerms('a cache and a TTL', new Set(['cache'])).filter((p) => typeof p !== 'string')).toEqual([{ text: 'TTL', id: 'ttl' }]);
  });

  it('knows which terms a question is about', () => {
    expect(termIdsIn('What is a race condition?')).toEqual(['race-condition']);
    expect(termIdsIn('In an SSO system, how can authentication be implemented, and where does JWT fit into it?').sort()).toEqual(['authentication', 'jwt', 'sso']);
  });

  it('finds explainable terms in every interview answer', () => {
    const thin = PREP_QUESTIONS.filter((q) => {
      const text = [q.answer.en, ...q.interview.text.map((t) => t.en)].join(' ');
      return new Set(linked(text).map((p) => p.id)).size < 3;
    }).map((q) => q.id);
    expect(thin).toEqual([]);
  });
});
