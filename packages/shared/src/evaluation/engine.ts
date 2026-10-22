import { DiagramGraph } from '../diagram/graph';
import type { DiagramSnapshot } from '../diagram/types';
import { ratingForScore, ratingLabel, starsForScore } from '../gamification/scoring';
import { evaluateRule, isConnectionRule, isPresenceRule, statusFraction } from './rules';
import { analyzeStructure, penaltiesByCategory } from './structural';
import {
  DEFAULT_WEIGHTS,
  SCORE_CATEGORIES,
  type CategoryScore,
  type CategoryWeights,
  type CheckOutcome,
  type CoverageStatus,
  type Deduction,
  type EvaluationInput,
  type EvaluationReport,
  type Finding,
  type RequirementCoverage,
  type ScoreCategoryKey,
  type Suggestion,
} from './types';

export const ENGINE_VERSION = '1.0.0';
export const DEFAULT_CRITICAL_CAP = 50;

const round1 = (n: number) => Math.round(n * 10) / 10;

export function resolveWeights(input: EvaluationInput): CategoryWeights {
  return { ...DEFAULT_WEIGHTS, ...(input.rubric.weights ?? {}) };
}

export function runChecks(graph: DiagramGraph, input: EvaluationInput): CheckOutcome[] {
  return input.rubric.checks.map((c) => {
    const r = evaluateRule(c.rule, graph);
    const fraction = statusFraction(r.status);
    const message = r.status === 'pass' ? c.pass : r.status === 'needs-config' ? r.detail : c.fail;
    return {
      id: c.id,
      title: c.title,
      category: c.category,
      status: r.status,
      points: c.points,
      earned: c.points * fraction,
      critical: !!c.critical,
      optional: !!c.optional,
      message,
      evidence: r.detail,
      fix: r.status === 'pass' ? undefined : c.fix,
      nodeIds: r.nodeIds,
      edgeIds: r.edgeIds,
    };
  });
}

export function requirementCoverage(input: EvaluationInput, outcomes: CheckOutcome[]): RequirementCoverage[] {
  const byId = new Map(outcomes.map((o) => [o.id, o]));
  return input.requirements.map((req) => {
    const linked = req.checks.map((id) => byId.get(id)).filter((o): o is CheckOutcome => !!o);
    let status: CoverageStatus;
    if (!linked.length) status = 'not-assessed';
    else if (linked.every((o) => o.status === 'pass')) status = 'met';
    else if (linked.some((o) => o.status === 'pass' || o.status === 'partial')) status = 'partial';
    else if (linked.some((o) => o.status === 'needs-config')) status = 'needs-config';
    else status = 'unmet';
    return { id: req.id, kind: req.kind, text: req.text, status, checkIds: req.checks };
  });
}

function emptyReport(input: EvaluationInput): EvaluationReport {
  const coverage = requirementCoverage(
    input,
    input.rubric.checks.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      status: 'fail' as const,
      points: c.points,
      earned: 0,
      critical: !!c.critical,
      optional: !!c.optional,
      message: c.fail,
      evidence: '',
      nodeIds: [],
      edgeIds: [],
    })),
  );
  const weights = resolveWeights(input);
  return {
    engineVersion: ENGINE_VERSION,
    rubricVersion: input.rubricVersion,
    questionId: input.questionId,
    score: 0,
    rating: 0,
    stars: 0,
    ratingLabel: ratingLabel(0),
    categories: SCORE_CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      weight: weights[c.key],
      score: 0,
      assessed: true,
      earnedPoints: 0,
      possiblePoints: 0,
      explanation: 'Nothing to evaluate yet.',
      deductions: [],
    })),
    checks: [],
    requirementCoverage: coverage,
    coverage: { met: 0, partial: 0, total: coverage.length, percent: 0 },
    issues: [],
    missingComponents: [],
    missingConnections: [],
    invalidConnections: [],
    bottlenecks: [],
    unnecessaryComplexity: [],
    securityConcerns: [],
    strengths: [],
    weaknesses: ['The canvas has no components yet.'],
    suggestions: [
      {
        title: 'Start with the request path',
        detail: 'Add the clients, an entry point, an application service and a data store, then connect them in the order a request travels.',
        impact: 100,
      },
    ],
    criticalFailures: [],
    scoreCap: null,
    stats: { components: 0, connections: 0 },
    summary: 'Add components and connect them to get a score.',
  };
}

/**
 * Evaluates a diagram against a question's rubric. Deterministic and side-effect free,
 * so the browser (quick feedback) and the server (authoritative score) share it.
 */
export function evaluateDesign(diagram: DiagramSnapshot, input: EvaluationInput): EvaluationReport {
  const graph = new DiagramGraph(diagram);
  if (graph.size === 0) return emptyReport(input);

  const weights = resolveWeights(input);
  const outcomes = runChecks(graph, input);
  const issues = analyzeStructure({ graph, diagram, rubric: input.rubric, difficulty: input.difficulty });
  const penalties = penaltiesByCategory(issues);

  // ── Category scores ─────────────────────────────────────────────────────
  // Connections are first-class: every flow/connection check in any category also counts
  // towards "Connections & data flow", on top of the category's own checks.
  const ruleById = new Map(input.rubric.checks.map((c) => [c.id, c]));
  const derivedConnections = outcomes.filter(
    (o) => o.category !== 'connections' && !o.optional && isConnectionRule(ruleById.get(o.id)!.rule),
  );
  const raw = SCORE_CATEGORIES.map((cat) => {
    const own = outcomes.filter((o) => o.category === cat.key && !o.optional);
    const required = cat.key === 'connections' ? [...own, ...derivedConnections] : own;
    const optional = outcomes.filter((o) => o.category === cat.key && o.optional);
    const possible = required.reduce((s, o) => s + o.points, 0);
    const earnedRequired = required.reduce((s, o) => s + o.earned, 0);
    const earnedOptional = optional.reduce((s, o) => s + o.earned, 0);
    const penalty = penalties.get(cat.key)?.total ?? 0;
    const structuralOnly = possible === 0 && (cat.key === 'simplicity' || cat.key === 'connections' || penalty > 0);
    const assessed = possible > 0 || structuralOnly;
    let base = possible > 0 ? Math.min(1, (earnedRequired + earnedOptional) / possible) : 1;
    if (!assessed) base = 0;
    const value = assessed ? Math.max(0, Math.min(1, base - penalty)) : 0;
    return { cat, required, possible, earned: earnedRequired + earnedOptional, penalty, assessed, value, base, derived: required.length - own.length };
  });

  const totalWeight = raw.filter((r) => r.assessed).reduce((s, r) => s + weights[r.cat.key], 0) || 1;
  const share = (key: ScoreCategoryKey) => (weights[key] / totalWeight) * 100;

  const categories: CategoryScore[] = raw.map((r) => {
    const deductions: Deduction[] = [];
    if (r.possible > 0) {
      for (const o of r.required) {
        if (o.status === 'pass') continue;
        const lost = ((o.points - o.earned) / r.possible) * share(r.cat.key);
        if (lost > 0.05) deductions.push({ reason: `${o.title}: ${o.message}`, points: round1(lost), source: 'rubric' });
      }
    }
    const catIssues = issues.filter((i) => i.category === r.cat.key && i.penalty > 0);
    const byCode = penalties.get(r.cat.key)?.byCode;
    const seen = new Set<string>();
    for (const i of catIssues) {
      if (seen.has(i.code)) continue;
      seen.add(i.code);
      const count = catIssues.filter((x) => x.code === i.code).length;
      const pts = round1(Math.min((byCode?.get(i.code) ?? 0) * share(r.cat.key), r.base * share(r.cat.key)));
      if (pts >= 0.1) {
        deductions.push({
          reason: count > 1 ? `${i.title} (${count}×): ${i.message}` : `${i.title}: ${i.message}`,
          points: pts,
          source: 'structure',
        });
      }
    }
    const pct = Math.round(r.value * 100);
    let explanation: string;
    if (!r.assessed) explanation = 'Not assessed for this question.';
    else if (r.possible > 0) {
      explanation = `Earned ${round1(r.earned)} of ${r.possible} rubric points`;
      if (r.derived > 0) explanation += ` (including ${r.derived} flow checks shared with other categories)`;
      if (r.penalty > 0) explanation += `, minus ${Math.round(r.penalty * 100)}% for structural issues`;
      explanation += '.';
    } else {
      explanation = r.penalty > 0 ? `Starts at 100% and loses ${Math.round(r.penalty * 100)}% for structural issues.` : 'No structural issues found.';
    }
    return {
      key: r.cat.key,
      label: r.cat.label,
      weight: weights[r.cat.key],
      score: pct,
      assessed: r.assessed,
      earnedPoints: round1(r.earned),
      possiblePoints: r.possible,
      explanation,
      deductions: deductions.sort((a, b) => b.points - a.points),
    };
  });

  let score = raw.filter((r) => r.assessed).reduce((s, r) => s + r.value * share(r.cat.key), 0);

  // ── Critical failures cap the score ─────────────────────────────────────
  const criticalFailures = outcomes
    .filter((o) => o.critical && (o.status === 'fail' || o.status === 'needs-config'))
    .map((o) => ({ checkId: o.id, title: o.title, message: o.message }));
  const cap = input.rubric.criticalCap ?? DEFAULT_CRITICAL_CAP;
  let scoreCap: number | null = null;
  if (criticalFailures.length && score > cap) {
    score = cap;
    scoreCap = cap;
  }
  score = Math.round(Math.max(0, Math.min(100, score)));

  // ── Findings ────────────────────────────────────────────────────────────
  const failing = outcomes.filter((o) => o.status !== 'pass' && !o.optional);
  const toFinding = (o: CheckOutcome): Finding => ({
    title: o.title,
    detail: `${o.message}${o.evidence && o.evidence !== o.message ? ` (${o.evidence})` : ''}`,
    fix: o.fix,
    severity: o.critical ? 'error' : 'warning',
    nodeIds: o.nodeIds,
    edgeIds: o.edgeIds,
    checkId: o.id,
  });
  const missingComponents = failing.filter((o) => isPresenceRule(ruleById.get(o.id)!.rule)).map(toFinding);
  const missingConnections = failing
    .filter((o) => !isPresenceRule(ruleById.get(o.id)!.rule) && isConnectionRule(ruleById.get(o.id)!.rule))
    .map(toFinding);
  const fromIssues = (bucket: string) =>
    issues
      .filter((i) => i.bucket === bucket)
      .map<Finding>((i) => ({ title: i.title, detail: i.message, fix: i.fix, severity: i.severity, nodeIds: i.nodeIds, edgeIds: i.edgeIds }));
  const invalidConnections = [...fromIssues('invalid-connection'), ...fromIssues('disconnected')];
  const bottlenecks = [
    ...failing.filter((o) => ruleById.get(o.id)!.concern === 'bottleneck').map(toFinding),
    ...fromIssues('bottleneck'),
  ];
  const unnecessaryComplexity = fromIssues('complexity');
  const securityConcerns = [
    ...failing.filter((o) => ruleById.get(o.id)!.concern === 'security').map(toFinding),
    ...fromIssues('security'),
  ];

  // ── Strengths, weaknesses, suggestions ─────────────────────────────────
  const strengths = outcomes
    .filter((o) => o.status === 'pass')
    .sort((a, b) => b.points * share(b.category) - a.points * share(a.category))
    .map((o) => o.message);
  if (!issues.some((i) => i.bucket === 'disconnected' || i.bucket === 'invalid-connection')) {
    strengths.push('Every component is connected and connection directions look valid.');
  }

  const weaknesses = [
    ...failing
      .sort((a, b) => (b.points - b.earned) * share(b.category) - (a.points - a.earned) * share(a.category))
      .map((o) => o.message),
    ...issues.filter((i) => i.severity === 'error').map((i) => i.message),
  ];

  const possibleByCat = new Map(raw.map((r) => [r.cat.key, r.possible]));
  const suggestions: Suggestion[] = [];
  for (const o of outcomes) {
    if (o.status === 'pass' || !o.fix) continue;
    const possible = possibleByCat.get(o.category) || o.points;
    const impact = ((o.points - o.earned) / possible) * share(o.category);
    suggestions.push({ title: o.title, detail: o.fix, impact: round1(o.optional ? impact / 2 : impact) });
  }
  const seenFix = new Set<string>();
  for (const i of issues) {
    if (i.penalty <= 0 || seenFix.has(i.code)) continue;
    seenFix.add(i.code);
    suggestions.push({ title: i.title, detail: i.fix, impact: round1(Math.min(i.penalty, 0.45) * share(i.category)) });
  }
  suggestions.sort((a, b) => b.impact - a.impact);

  const coverageList = requirementCoverage(input, outcomes);
  const met = coverageList.filter((c) => c.status === 'met').length;
  const partial = coverageList.filter((c) => c.status === 'partial').length;
  const total = coverageList.length;

  const stars = starsForScore(score);
  const label = ratingLabel(score);
  const summaryParts = [`${label} design: ${score}/100.`];
  if (total) summaryParts.push(`${met} of ${total} requirements fully covered.`);
  if (scoreCap !== null) summaryParts.push(`Score capped at ${scoreCap} because of a critical gap.`);
  else if (suggestions[0]) summaryParts.push(`Biggest opportunity: ${suggestions[0].title.toLowerCase()}.`);

  return {
    engineVersion: ENGINE_VERSION,
    rubricVersion: input.rubricVersion,
    questionId: input.questionId,
    score,
    rating: ratingForScore(score),
    stars,
    ratingLabel: label,
    categories,
    checks: outcomes,
    requirementCoverage: coverageList,
    coverage: { met, partial, total, percent: total ? Math.round(((met + partial * 0.5) / total) * 100) : 0 },
    issues,
    missingComponents,
    missingConnections,
    invalidConnections,
    bottlenecks,
    unnecessaryComplexity,
    securityConcerns,
    strengths: strengths.slice(0, 10),
    weaknesses: weaknesses.slice(0, 10),
    suggestions: suggestions.slice(0, 10),
    criticalFailures,
    scoreCap,
    stats: { components: graph.size, connections: graph.edges.length },
    summary: summaryParts.join(' '),
  };
}
