import { COMPONENT_CATEGORIES, getComponent } from '../catalog/components';
import { getPropertyField } from '../catalog/properties';
import { collectRuleSelectors } from '../evaluation/rules';
import { SCORE_CATEGORIES } from '../evaluation/types';
import { QUESTION_CATEGORIES, type Difficulty, type QuestionDefinition } from './types';

export const EXPECTED_DISTRIBUTION: Record<Difficulty, number> = { easy: 15, medium: 35, hard: 50 };

export interface BankReport {
  errors: string[];
  warnings: string[];
  distribution: Record<Difficulty, number>;
}

const normalizeTitle = (t: string) =>
  t
    .toLowerCase()
    .replace(/^design (a |an )?/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Structural validation of one question. Returns human-readable problems. */
export function validateQuestion(q: QuestionDefinition): string[] {
  const p: string[] = [];
  const at = (msg: string) => p.push(`${q.id} (${q.title}): ${msg}`);

  if (!/^[a-z0-9-]+$/.test(q.slug)) at('slug must be kebab-case');
  if (!q.title.trim()) at('missing title');
  if (!QUESTION_CATEGORIES.includes(q.category)) at(`unknown category "${q.category}"`);
  if (q.estimatedMinutes < 10 || q.estimatedMinutes > 120) at('estimatedMinutes must be between 10 and 120');
  if (!q.tags.length) at('needs at least one tag');
  if (q.concepts.length < 2) at('needs at least two concepts');

  const bilingual = (label: string, v: { en: string; hi: string }) => {
    if (!v.en?.trim()) at(`${label}: missing English text`);
    if (!v.hi?.trim()) at(`${label}: missing Hinglish text`);
    if (v.en && v.hi && v.en.trim() === v.hi.trim()) at(`${label}: Hinglish text is identical to English`);
  };
  bilingual('statement', q.statement);
  if (q.functional.length < 2) at('needs at least two functional requirements');
  if (q.nonFunctional.length < 2) at('needs at least two non-functional requirements');
  if (q.constraints.en.length !== q.constraints.hi.length) at('constraints: English and Hinglish lists differ in length');
  if (!q.constraints.en.length) at('needs at least one constraint');
  q.constraints.en.forEach((c, i) => bilingual(`constraint ${i + 1}`, { en: c, hi: q.constraints.hi[i] ?? '' }));
  q.clarifications.forEach((c, i) => {
    bilingual(`clarification ${i + 1} question`, c.q);
    bilingual(`clarification ${i + 1} answer`, c.a);
  });
  if (q.hints.length !== 4) at(`needs exactly 4 progressive hints (has ${q.hints.length})`);
  q.hints.forEach((h, i) => bilingual(`hint ${i + 1}`, h));
  if (!q.scale.length) at('needs an expected scale');

  // Rubric
  const checkIds = new Set<string>();
  const categories = new Set(SCORE_CATEGORIES.map((c) => c.key));
  if (q.rubric.checks.length < 6) at('rubric needs at least 6 checks');
  for (const c of q.rubric.checks) {
    if (checkIds.has(c.id)) at(`duplicate check id "${c.id}"`);
    checkIds.add(c.id);
    if (!categories.has(c.category)) at(`check ${c.id}: unknown category`);
    if (!(c.points > 0)) at(`check ${c.id}: points must be positive`);
    if (!c.pass || !c.fail || !c.fix) at(`check ${c.id}: needs pass, fail and fix text`);
    for (const sel of collectRuleSelectors(c.rule)) {
      for (const t of sel.types ?? []) if (!getComponent(t)) at(`check ${c.id}: unknown component type "${t}"`);
      if (sel.where && !getPropertyField(sel.where.key)) at(`check ${c.id}: unknown property "${sel.where.key}"`);
    }
    const walk = (r: typeof c.rule): void => {
      if (r.kind === 'prop' && !getPropertyField(r.key)) at(`check ${c.id}: unknown property "${r.key}"`);
      if (r.kind === 'any' || r.kind === 'all') r.rules.forEach(walk);
    };
    walk(c.rule);
  }
  const required = q.rubric.checks.filter((c) => !c.optional);
  const usedCats = new Set(required.map((c) => c.category));
  for (const needed of ['functional', 'components'] as const) {
    if (!usedCats.has(needed)) at(`rubric has no required "${needed}" checks`);
  }
  if (!q.rubric.checks.some((c) => ['path', 'edge', 'async', 'guarded'].includes(c.rule.kind) || c.rule.kind === 'any' || c.rule.kind === 'all')) {
    at('rubric has no connection checks');
  }
  for (const r of [...q.functional, ...q.nonFunctional]) {
    bilingual(`requirement ${r.id}`, r);
    if (!r.checks.length) at(`requirement ${r.id} is not linked to any check`);
    for (const id of r.checks) if (!checkIds.has(id)) at(`requirement ${r.id} references unknown check "${id}"`);
  }
  for (const d of q.rubric.discouraged ?? []) for (const t of d.types) if (!getComponent(t)) at(`discouraged: unknown type "${t}"`);

  // Reference architecture
  const refIds = new Set<string>();
  if (q.reference.nodes.length < 3) at('reference architecture needs at least 3 components');
  for (const n of q.reference.nodes) {
    if (refIds.has(n.id)) at(`reference: duplicate node id "${n.id}"`);
    refIds.add(n.id);
    if (!getComponent(n.type)) at(`reference: unknown component type "${n.type}"`);
    if (!n.why?.trim()) at(`reference: node ${n.id} needs an explanation`);
    const def = getComponent(n.type);
    for (const k of Object.keys(n.props ?? {})) {
      if (!getPropertyField(k)) at(`reference: node ${n.id} has unknown property "${k}"`);
      else if (def && !(def.properties as string[]).includes(k)) at(`reference: node ${n.id} (${n.type}) does not support property "${k}"`);
    }
  }
  for (const e of q.reference.edges) {
    if (!refIds.has(e.from) || !refIds.has(e.to)) at(`reference: edge ${e.from}>${e.to} references a missing node`);
  }
  if (!q.reference.edges.some((e) => e.why)) at('reference: explain at least one critical connection');
  if (!q.reference.summary.trim()) at('reference: missing summary');
  if (!q.reference.tradeoffs.length) at('reference: needs trade-offs');
  if (!q.reference.alternatives.length) at('reference: needs alternative approaches');

  for (const s of q.starter) if (!getComponent(s.type)) at(`starter: unknown component type "${s.type}"`);
  const catIds = new Set<string>(COMPONENT_CATEGORIES.map((c) => c.id));
  for (const c of q.suggestedCategories) if (!catIds.has(c)) at(`unknown suggested category "${c}"`);
  for (const s of q.sources) if (!/^https:\/\//.test(s.url)) at(`source URL must be https: ${s.url}`);
  return p;
}

/** Validates the whole bank: per-question structure, uniqueness and the 15/35/50 distribution. */
export function validateQuestionBank(questions: QuestionDefinition[], options: { strictDistribution?: boolean } = {}): BankReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const distribution: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const titles = new Map<string, string>();

  for (const q of questions) {
    distribution[q.difficulty]++;
    if (ids.has(q.id)) errors.push(`duplicate question id ${q.id}`);
    ids.add(q.id);
    if (slugs.has(q.slug)) errors.push(`duplicate slug ${q.slug}`);
    slugs.add(q.slug);
    const norm = normalizeTitle(q.title);
    if (titles.has(norm)) errors.push(`duplicate title: "${q.title}" and "${titles.get(norm)}"`);
    titles.set(norm, q.title);
    errors.push(...validateQuestion(q));
  }

  const total = questions.length;
  const distMsg = (d: Difficulty) => `${d}: expected ${EXPECTED_DISTRIBUTION[d]}, found ${distribution[d]}`;
  for (const d of ['easy', 'medium', 'hard'] as const) {
    if (distribution[d] !== EXPECTED_DISTRIBUTION[d]) (options.strictDistribution ? errors : warnings).push(distMsg(d));
  }
  if (total !== 100) (options.strictDistribution ? errors : warnings).push(`expected 100 questions, found ${total}`);
  const pending = questions.flatMap((q) => q.sources).filter((s) => s.verification === 'pending').length;
  if (pending) warnings.push(`${pending} source(s) still need verification`);
  return { errors, warnings, distribution };
}
