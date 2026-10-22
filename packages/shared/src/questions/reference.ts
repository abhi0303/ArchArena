import { getComponent } from '../catalog/components';
import { inferConnectionProps } from '../catalog/connections';
import { layeredLayout } from '../diagram/layout';
import { DIAGRAM_SCHEMA_VERSION, type DiagramSnapshot } from '../diagram/types';
import type { EvaluationInput, RequirementRef } from '../evaluation/types';
import type { QuestionDefinition, ReferenceArchitecture, StarterNode } from './types';

export function referenceToDiagram(ref: ReferenceArchitecture): DiagramSnapshot {
  const typeOf = new Map(ref.nodes.map((n) => [n.id, n.type]));
  const positions = layeredLayout(
    ref.nodes.map((n) => ({ id: n.id, at: n.at })),
    ref.edges.map((e) => ({ source: e.from, target: e.to })),
  );
  return {
    version: DIAGRAM_SCHEMA_VERSION,
    nodes: ref.nodes.map((n) => ({
      id: n.id,
      kind: 'component' as const,
      componentType: n.type,
      label: n.label ?? getComponent(n.type)?.label ?? n.type,
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      props: { ...(n.props ?? {}) },
    })),
    edges: ref.edges.map((e) => ({
      id: `ref-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      props: { ...inferConnectionProps(typeOf.get(e.from) ?? '', typeOf.get(e.to) ?? ''), ...(e.props ?? {}) },
    })),
  };
}

export function starterToDiagram(starter: StarterNode[]): DiagramSnapshot {
  return {
    version: DIAGRAM_SCHEMA_VERSION,
    nodes: starter.map((s, i) => ({
      id: `starter-${i + 1}`,
      kind: 'component' as const,
      componentType: s.type,
      label: s.label ?? getComponent(s.type)?.label ?? s.type,
      position: s.at ? { x: 60 + s.at[0] * 250, y: 60 + s.at[1] * 120 } : { x: 60, y: 80 + i * 130 },
      props: {},
    })),
    edges: [],
  };
}

export function requirementRefs(q: Pick<QuestionDefinition, 'functional' | 'nonFunctional'>): RequirementRef[] {
  return [
    ...q.functional.map((r) => ({ id: r.id, kind: 'functional' as const, text: { en: r.en, hi: r.hi }, checks: r.checks })),
    ...q.nonFunctional.map((r) => ({ id: r.id, kind: 'non-functional' as const, text: { en: r.en, hi: r.hi }, checks: r.checks })),
  ];
}

export function toEvaluationInput(q: QuestionDefinition, rubricVersion = 1): EvaluationInput {
  return {
    questionId: q.id,
    difficulty: q.difficulty,
    rubricVersion,
    rubric: q.rubric,
    requirements: requirementRefs(q),
  };
}
