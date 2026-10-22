import { COMPONENTS, getComponent } from '@arch-arena/shared';
import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '@arch-arena/shared/questions';
import { COMPARISONS, GUIDES, LEARNING_PATH, getComparison, getGuide } from '@/features/learn/content';
import { learnTypesForCheck } from '@/features/learn/related';
import { hasLearnIcon } from '@/features/learn/icons';
import type { Bi, Scene } from '@/features/learn/types';

/** Finds every bilingual text inside a value, with a path for helpful failure messages. */
function collectBi(value: unknown, path: string, out: { path: string; bi: Bi }[] = []): { path: string; bi: Bi }[] {
  if (Array.isArray(value)) value.forEach((v, i) => collectBi(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 2 && keys.includes('en') && keys.includes('hi')) out.push({ path, bi: value as Bi });
    else for (const [k, v] of Object.entries(value)) collectBi(v, `${path}.${k}`, out);
  }
  return out;
}

function checkScene(scene: Scene, where: string): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const node of scene.cols.flat()) {
    if (ids.has(node.id)) problems.push(`${where}: duplicate node id "${node.id}"`);
    ids.add(node.id);
    if (!hasLearnIcon(node.icon)) problems.push(`${where}: unknown icon "${node.icon}"`);
  }
  for (const e of scene.edges) {
    if (!ids.has(e.from)) problems.push(`${where}: edge from unknown node "${e.from}"`);
    if (!ids.has(e.to)) problems.push(`${where}: edge to unknown node "${e.to}"`);
  }
  if (scene.cols.length > 4) problems.push(`${where}: more than 4 columns will not fit on phones`);
  if (Math.max(...scene.cols.map((c) => c.length)) > 4) problems.push(`${where}: more than 4 rows`);
  return problems;
}

describe('learn: component guides', () => {
  it('has exactly one guide for every catalog component', () => {
    const types = GUIDES.map((g) => g.type);
    expect(new Set(types).size).toBe(types.length);
    expect(types.sort()).toEqual(COMPONENTS.map((c) => c.type).sort());
  });

  it('every guide is complete', () => {
    const problems: string[] = [];
    for (const g of GUIDES) {
      if (g.steps.length < 3) problems.push(`${g.type}: needs at least 3 steps`);
      if (g.avoidWhen.length < 2) problems.push(`${g.type}: needs at least 2 “wrong tool” cases`);
      if (g.decisions.length < 1) problems.push(`${g.type}: needs decisions`);
      if (g.perfectFit.why.length < 2) problems.push(`${g.type}: perfect fit needs reasons`);
      if (g.analogy.icons.length < 1) problems.push(`${g.type}: analogy needs icons`);
      for (const icon of g.analogy.icons) if (!hasLearnIcon(icon)) problems.push(`${g.type}: unknown analogy icon "${icon}"`);
      problems.push(...checkScene(g.before, `${g.type}.before`), ...checkScene(g.after, `${g.type}.after`));
      for (const cw of g.confusedWith) {
        if (!getComponent(cw.type)) problems.push(`${g.type}: confusedWith unknown type "${cw.type}"`);
        if (cw.compare) {
          const cmp = getComparison(cw.compare);
          if (!cmp) problems.push(`${g.type}: unknown comparison "${cw.compare}"`);
          else if (!cmp.types.includes(g.type) || !cmp.types.includes(cw.type)) {
            problems.push(`${g.type}: comparison "${cw.compare}" does not include both ${g.type} and ${cw.type}`);
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('learn: comparisons', () => {
  it('every comparison is consistent', () => {
    const problems: string[] = [];
    const slugs = new Set<string>();
    for (const c of COMPARISONS) {
      if (slugs.has(c.slug)) problems.push(`duplicate slug ${c.slug}`);
      slugs.add(c.slug);
      if (!/^[a-z0-9-]+$/.test(c.slug)) problems.push(`${c.slug}: slug must be kebab-case`);
      for (const t of c.types) if (!getComponent(t)) problems.push(`${c.slug}: unknown type "${t}"`);
      if (c.types.length < 2) problems.push(`${c.slug}: compare at least two components`);
      for (const r of c.rows) {
        const label = typeof r.feature === 'string' ? r.feature : r.feature.en;
        if (r.values.length !== c.types.length) problems.push(`${c.slug}: row “${label}” has ${r.values.length} values`);
      }
      const roleTypes = c.story.roles.map((r) => r.type).sort();
      if (JSON.stringify(roleTypes) !== JSON.stringify([...c.types].sort())) problems.push(`${c.slug}: story roles must cover each type once`);
      for (const r of c.story.roles) if (!hasLearnIcon(r.icon)) problems.push(`${c.slug}: unknown role icon "${r.icon}"`);
      const pickTypes = c.pickWhen.map((p) => p.type).sort();
      if (JSON.stringify(pickTypes) !== JSON.stringify([...c.types].sort())) problems.push(`${c.slug}: pickWhen must cover each type once`);
      if (c.quiz.length < 3) problems.push(`${c.slug}: needs at least 3 quiz questions`);
      for (const q of c.quiz) if (!c.types.includes(q.answer)) problems.push(`${c.slug}: quiz answer "${q.answer}" is not an option`);
    }
    expect(problems).toEqual([]);
  });

  it('every guide names at least one look-alike component', () => {
    expect(GUIDES.filter((g) => g.confusedWith.length === 0).map((g) => g.type)).toEqual([]);
  });

  it('most components have a side-by-side comparison', () => {
    const compared = new Set(COMPARISONS.flatMap((c) => c.types));
    expect(compared.size).toBeGreaterThanOrEqual(45);
  });
});

describe('learn: language', () => {
  it('every explanation has English and a different Hinglish version', () => {
    const all = [...collectBi(GUIDES, 'guides'), ...collectBi(COMPARISONS, 'comparisons'), ...collectBi(LEARNING_PATH, 'path')];
    expect(all.length).toBeGreaterThan(1000);
    const problems = all
      .filter(({ bi }) => !bi.en.trim() || !bi.hi.trim() || bi.en.trim() === bi.hi.trim())
      .map(({ path, bi }) => `${path}: "${bi.en.slice(0, 60)}"`);
    expect(problems).toEqual([]);
  });

  it('the learning path only uses real components', () => {
    for (const step of LEARNING_PATH) expect(getComponent(step.type), step.type).toBeTruthy();
  });
});

describe('learn: links from evaluation feedback', () => {
  it('rubric checks link to existing guides, and most checks get a link', () => {
    let total = 0;
    let linked = 0;
    const missing: string[] = [];
    for (const q of QUESTIONS) {
      for (const check of q.rubric.checks) {
        total++;
        const types = learnTypesForCheck(q.rubric, check.id);
        if (types.length) linked++;
        for (const t of types) if (!getGuide(t)) missing.push(`${q.id}/${check.id}: ${t}`);
        expect(types.length).toBeLessThanOrEqual(3);
      }
    }
    expect(missing).toEqual([]);
    expect(linked / total).toBeGreaterThan(0.6);
  });

  it('points a missing load balancer or gateway check at those guides', () => {
    const q = QUESTIONS.find((x) => x.id === 'e01')!;
    expect(learnTypesForCheck(q.rubric, 'entry')).toEqual(expect.arrayContaining(['load-balancer', 'api-gateway']));
    expect(learnTypesForCheck(q.rubric, 'does-not-exist')).toEqual([]);
  });
});
