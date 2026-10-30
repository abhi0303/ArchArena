import { COMPONENTS } from '@arch-arena/shared';
import { QUESTIONS } from '@arch-arena/shared/questions';
import { describe, expect, it } from 'vitest';
import { hasLearnIcon } from '@/features/learn/icons';
import type { Bi } from '@/features/learn/types';
import { PREP_CATEGORIES, getPrepCategory, getPrepTopic } from '@/features/prep/catalog';
import { PREP_QUESTIONS, questionsIn } from '@/features/prep/content';

function collectBi(value: unknown, path: string, out: { path: string; bi: Bi }[] = []): { path: string; bi: Bi }[] {
  if (Array.isArray(value)) value.forEach((v, i) => collectBi(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 2 && keys.includes('en') && keys.includes('hi')) out.push({ path, bi: value as Bi });
    else for (const [k, v] of Object.entries(value)) collectBi(v, `${path}.${k}`, out);
  }
  return out;
}

describe('interview prep: catalog', () => {
  it('has the requested categories and sub-sections', () => {
    expect(getPrepCategory('frontend')?.topics.map((t) => t.id)).toEqual(['general', 'react', 'angular']);
    expect(getPrepCategory('backend')?.topics.map((t) => t.id)).toEqual(['general', 'nodejs', 'nestjs']);
    for (const id of ['database', 'servers', 'security', 'devops', 'system-design', 'practices']) expect(getPrepCategory(id), id).toBeDefined();
    expect(getPrepCategory('devops')?.topics.map((t) => t.id)).toContain('kubernetes');
  });

  it('uses unique category and topic ids', () => {
    expect(new Set(PREP_CATEGORIES.map((c) => c.id)).size).toBe(PREP_CATEGORIES.length);
    for (const c of PREP_CATEGORIES) expect(new Set(c.topics.map((t) => t.id)).size, c.id).toBe(c.topics.length);
  });
});

describe('interview prep: questions', () => {
  it('includes every question from the original list, in the right section', () => {
    const expected: [string, string, string][] = [
      ['When designing a REST API', 'backend', 'general'],
      ['microservices architecture compared to a monolith', 'system-design', 'architecture'],
      ['two similar user actions have dramatically different latencies', 'devops', 'observability'],
      ['What is a database index', 'database', 'general'],
      ['When would you use a cache', 'system-design', 'scaling'],
      ['Why do we use a load balancer', 'servers', 'load-balancing'],
      ['A pod keeps restarting', 'devops', 'kubernetes'],
      ['readiness probe and a liveness probe', 'devops', 'kubernetes'],
      ['connection pool becomes exhausted', 'database', 'performance'],
      ['distributed system be harder to debug', 'system-design', 'architecture'],
      ['use a queue instead of a synchronous API call', 'system-design', 'messaging'],
      ['What metrics would you monitor for a production API', 'devops', 'observability'],
      ['A query that was fast last month is now slow', 'database', 'performance'],
      ['What is a race condition', 'backend', 'general'],
      ['Should every failed request be retried', 'backend', 'general'],
      ['error rates spike', 'devops', 'incidents'],
      ['logs, metrics, and traces', 'devops', 'observability'],
      ['In an SSO system', 'security', 'auth'],
      ['production incident you have been involved in', 'devops', 'incidents'],
      ['when/how do you find out', 'devops', 'observability'],
      ['completed a task on your machine', 'devops', 'cicd'],
      ['How do you ensure your work is of good quality', 'practices', 'quality'],
      ['Transactional Outbox pattern', 'system-design', 'messaging'],
      ['Idempotent Consumer pattern', 'system-design', 'messaging'],
    ];
    const missing: string[] = [];
    for (const [text, category, topic] of expected) {
      const q = PREP_QUESTIONS.find((x) => x.question.en.toLowerCase().includes(text.toLowerCase().replace('when/how', 'when and how')) || x.question.en.includes(text));
      if (!q) missing.push(`missing: ${text}`);
      else if (q.category !== category || q.topic !== topic) missing.push(`${text}: in ${q.category}/${q.topic}, expected ${category}/${topic}`);
    }
    expect(missing).toEqual([]);
  });

  it('every question has a unique id and a real category and topic', () => {
    expect(new Set(PREP_QUESTIONS.map((q) => q.id)).size).toBe(PREP_QUESTIONS.length);
    for (const q of PREP_QUESTIONS) {
      expect(q.id, q.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(getPrepTopic(q.category, q.topic), `${q.id}: ${q.category}/${q.topic}`).toBeDefined();
    }
  });

  it('every answer has a short answer, numbered parts with concrete examples, and an interview answer', () => {
    const problems: string[] = [];
    for (const q of PREP_QUESTIONS) {
      if (q.answer.en.length < 150) problems.push(`${q.id}: the short answer is too short`);
      if (q.answer.en.length > 700) problems.push(`${q.id}: the short answer should stay short (under 700 characters)`);
      if (q.sections.length < 3) problems.push(`${q.id}: explain it in at least 3 numbered parts`);
      for (const [i, s] of q.sections.entries()) if (!s.blocks.length) problems.push(`${q.id}: part ${i + 1} is empty`);
      const blocks = q.sections.flatMap((s) => s.blocks);
      const concrete = blocks.filter((b) => b.type === 'code' || b.type === 'table' || b.type === 'steps' || b.type === 'options' || b.type === 'scene');
      if (concrete.length < 2) problems.push(`${q.id}: add concrete examples (code, tables, steps, diagrams)`);
      if (q.kind === 'comparison' && !blocks.some((b) => b.type === 'table')) problems.push(`${q.id}: comparisons need a side-by-side table`);
      for (const b of blocks) {
        if (b.type === 'table' && b.rows.some((r) => r.length !== b.columns.length)) problems.push(`${q.id}: table rows must match the columns`);
        if (b.type === 'code' && !b.code.trim()) problems.push(`${q.id}: empty code block`);
      }
      if (q.interview.text.length < 1 || q.interview.text.map((p) => p.en).join(' ').length < 300) problems.push(`${q.id}: the interview answer needs a few spoken sentences`);
      if (q.interview.keywords.length < 6) problems.push(`${q.id}: list at least 6 keywords`);
      if (new Set(q.interview.keywords).size !== q.interview.keywords.length) problems.push(`${q.id}: duplicate keywords`);
      if (q.listenFor.length < 2) problems.push(`${q.id}: say what the interviewer listens for`);
      if (!q.followUps?.length) problems.push(`${q.id}: add at least one follow-up question`);
    }
    expect(problems).toEqual([]);
  });

  it('every explanation has English and a different Hinglish version', () => {
    const all = collectBi(PREP_QUESTIONS, 'prep').concat(collectBi(PREP_CATEGORIES, 'categories'));
    expect(all.length).toBeGreaterThan(800);
    const problems = all.filter(({ bi }) => !bi.en.trim() || !bi.hi.trim() || bi.en.trim() === bi.hi.trim()).map(({ path, bi }) => `${path}: "${bi.en.slice(0, 60)}"`);
    expect(problems).toEqual([]);
  });

  it('links point to real component guides and challenges', () => {
    const types = new Set<string>(COMPONENTS.map((c) => c.type));
    const slugs = new Set(QUESTIONS.map((q) => q.slug));
    const problems: string[] = [];
    for (const q of PREP_QUESTIONS) {
      for (const t of q.related?.components ?? []) if (!types.has(t)) problems.push(`${q.id}: unknown component ${t}`);
      for (const s of q.related?.challenges ?? []) if (!slugs.has(s)) problems.push(`${q.id}: unknown challenge ${s}`);
    }
    expect(problems).toEqual([]);
  });

  it('illustrations use real icons and connect real nodes', () => {
    const problems: string[] = [];
    for (const q of PREP_QUESTIONS) {
      for (const b of q.sections.flatMap((s) => s.blocks)) {
        if (b.type === 'scene') {
          const ids = new Set(b.scene.cols.flat().map((n) => n.id));
          for (const n of b.scene.cols.flat()) if (!hasLearnIcon(n.icon)) problems.push(`${q.id}: unknown icon ${n.icon}`);
          for (const e of b.scene.edges) if (!ids.has(e.from) || !ids.has(e.to)) problems.push(`${q.id}: edge ${e.from} → ${e.to}`);
          for (const g of b.scene.groups ?? []) for (const id of g.ids) if (!ids.has(id)) problems.push(`${q.id}: group member ${id}`);
        }
        if (b.type === 'sequence') {
          const { actors, steps, groups } = b.sequence;
          const ids = new Set(actors.map((a) => a.id));
          if (ids.size !== actors.length) problems.push(`${q.id}: duplicate actor ids`);
          for (const a of actors) if (!hasLearnIcon(a.icon)) problems.push(`${q.id}: unknown icon ${a.icon}`);
          for (const [i, st] of steps.entries()) {
            for (const id of st.type === 'msg' ? [st.from, st.to] : st.over) if (!ids.has(id)) problems.push(`${q.id}: step ${i + 1} uses unknown actor ${id}`);
            if (!st.explain) problems.push(`${q.id}: step ${i + 1} needs a plain-language explanation for the walkthrough`);
          }
          for (const g of groups ?? []) if (g.from > g.to || g.to >= steps.length) problems.push(`${q.id}: group ${g.from}–${g.to} is out of range`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('keeps questions in category and topic order', () => {
    const flat = PREP_CATEGORIES.flatMap((c) => c.topics.flatMap((t) => questionsIn(c.id, t.id)));
    expect(flat.map((q) => q.id)).toEqual(PREP_QUESTIONS.map((q) => q.id));
  });
});
