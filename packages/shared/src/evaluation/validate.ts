import { DiagramGraph } from '../diagram/graph';
import type { DiagramSnapshot } from '../diagram/types';
import { requirementCoverage, runChecks } from './engine';
import { isPresenceRule } from './rules';
import { analyzeStructure } from './structural';
import type { EvaluationInput, ValidationIssue, ValidationResult } from './types';

/**
 * Quick local validation for the "Validate Design" button.
 * Runs entirely in the browser, never consumes an attempt and gives a lighter report
 * than the full evaluation: missing components, broken/invalid connections,
 * disconnected elements and basic requirement coverage.
 */
export function validateDesign(diagram: DiagramSnapshot, input: EvaluationInput): ValidationResult {
  const graph = new DiagramGraph(diagram);
  const issues: ValidationIssue[] = [];

  if (graph.size === 0) {
    issues.push({
      severity: 'error',
      title: 'Empty canvas',
      message: 'Add components from the library to start your design.',
      nodeIds: [],
      edgeIds: [],
    });
  }

  if (graph.size > 0 && graph.edges.length === 0) {
    issues.push({
      severity: 'error',
      title: 'No connections yet',
      message: 'Components are placed but not connected. Drag from a component’s edge handle to another component to show how requests flow.',
      nodeIds: [],
      edgeIds: [],
    });
  }

  const structural = analyzeStructure({ graph, diagram, rubric: input.rubric, difficulty: input.difficulty });
  for (const s of structural) {
    // Validation focuses on correctness; scalability hints are left to the full evaluation.
    if (s.code === 'spof' || s.code === 'excess-components' || s.code === 'discouraged-component') continue;
    issues.push({ severity: s.severity, title: s.title, message: s.message, fix: s.fix, nodeIds: s.nodeIds, edgeIds: s.edgeIds });
  }

  const outcomes = graph.size ? runChecks(graph, input) : [];
  const ruleById = new Map(input.rubric.checks.map((c) => [c.id, c]));
  const missingComponents = outcomes
    .filter((o) => !o.optional && o.status === 'fail' && isPresenceRule(ruleById.get(o.id)!.rule))
    .map((o) => o.title);

  for (const title of missingComponents) {
    issues.push({ severity: 'warning', title: 'Missing capability', message: title, nodeIds: [], edgeIds: [] });
  }

  const coverage = graph.size
    ? requirementCoverage(input, outcomes)
    : input.requirements.map((r) => ({ id: r.id, kind: r.kind, text: r.text, status: 'unmet' as const, checkIds: r.checks }));

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const order = { error: 0, warning: 1, info: 2 } as const;
  issues.sort((a, b) => order[a.severity] - order[b.severity]);
  return { ok: errorCount === 0, errorCount, warningCount, issues, missingComponents, requirementCoverage: coverage };
}
