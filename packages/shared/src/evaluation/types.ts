import type { ConnectionProps } from '../catalog/connections';
import type { Selector } from '../diagram/graph';
import type { Difficulty } from '../questions/types';

export type { Selector };

export const SCORE_CATEGORIES = [
  {
    key: 'functional',
    label: 'Functional correctness',
    defaultWeight: 25,
    description: 'Does the design support every functional requirement end to end?',
  },
  {
    key: 'connections',
    label: 'Connections & data flow',
    defaultWeight: 20,
    description: 'Are the right components connected, in the right direction, with valid producers and consumers?',
  },
  {
    key: 'components',
    label: 'Component selection',
    defaultWeight: 15,
    description: 'Are the components appropriate for the problem?',
  },
  {
    key: 'scalability',
    label: 'Scalability',
    defaultWeight: 15,
    description: 'Can the design grow to the expected scale without a redesign?',
  },
  {
    key: 'reliability',
    label: 'Reliability & availability',
    defaultWeight: 10,
    description: 'Does the design survive failures and protect itself and its users?',
  },
  {
    key: 'data',
    label: 'Data storage & caching',
    defaultWeight: 10,
    description: 'Are storage and caching choices suited to the access patterns?',
  },
  {
    key: 'simplicity',
    label: 'Simplicity & efficiency',
    defaultWeight: 5,
    description: 'Is the design free of unnecessary components and dangling pieces?',
  },
] as const;

export type ScoreCategoryKey = (typeof SCORE_CATEGORIES)[number]['key'];
export type CategoryWeights = Record<ScoreCategoryKey, number>;

export const DEFAULT_WEIGHTS: CategoryWeights = Object.fromEntries(
  SCORE_CATEGORIES.map((c) => [c.key, c.defaultWeight]),
) as CategoryWeights;

/** Building blocks for question-specific evaluation rules. */
export type Rule =
  /** At least `min` (default 1) components match. */
  | { kind: 'has'; sel: Selector; min?: number }
  /** A directed path exists from `from` to `to`, passing through each `via` in order. */
  | { kind: 'path'; from: Selector; to: Selector; via?: Selector[]; maxHops?: number }
  /** A direct connection exists from `from` to `to` (from at least `min` distinct callers). */
  | { kind: 'edge'; from: Selector; to: Selector; min?: number }
  /** producer → channel (queue/stream) → consumer. */
  | { kind: 'async'; producer: Selector; channel?: Selector; consumer: Selector }
  /** Every path from `from` to `to` passes through `guard` (and at least one path exists). */
  | { kind: 'guarded'; from: Selector; to: Selector; guard: Selector }
  /** Matching components are redundant (multiple instances, replication, managed HA…). */
  | { kind: 'redundant'; sel: Selector }
  /** A matching component has property `key` set (optionally to one of `values`). */
  | { kind: 'prop'; sel: Selector; key: string; values?: string[] }
  /** A direct connection between matches has a connection property in `values`. */
  | { kind: 'edgeProp'; from: Selector; to: Selector; key: keyof ConnectionProps; values: string[] }
  /** No component matches (anti-pattern). */
  | { kind: 'absent'; sel: Selector }
  /** No direct connection from `from` to `to` (anti-pattern). */
  | { kind: 'noEdge'; from: Selector; to: Selector }
  /** Best result among acceptable alternatives. */
  | { kind: 'any'; rules: Rule[] }
  /** All sub-rules must hold; partial credit when some do. */
  | { kind: 'all'; rules: Rule[] };

export type CheckStatus = 'pass' | 'partial' | 'fail' | 'needs-config';

export interface RuleResult {
  status: CheckStatus;
  detail: string;
  nodeIds: string[];
  edgeIds: string[];
}

export interface Check {
  id: string;
  category: ScoreCategoryKey;
  /** Relative weight within its category. */
  points: number;
  title: string;
  rule: Rule;
  /** Strength shown when the check passes. */
  pass: string;
  /** Why points were deducted when it fails. */
  fail: string;
  /** Recommendation, including how it improves the architecture. */
  fix: string;
  /** Failing a critical check caps the overall score. */
  critical?: boolean;
  /** Optional capabilities only add credit; they never deduct. */
  optional?: boolean;
  /** Buckets the finding in the report. */
  concern?: 'security' | 'bottleneck';
}

export interface StructuralOptions {
  /** Which components count as "the client side". Defaults to client-tagged components. */
  clientSelector?: Selector;
  /** How strictly single points of failure are flagged. Defaults depend on difficulty. */
  spof?: 'off' | 'info' | 'warn';
  /** How strictly clients calling services directly (no LB/gateway) is flagged. */
  exposedServices?: 'off' | 'info' | 'warn';
  /** Override for the component count that is considered excessive. */
  maxComponents?: number;
}

export interface Rubric {
  weights?: Partial<CategoryWeights>;
  checks: Check[];
  /** Components that add complexity without helping this question. */
  discouraged?: { types: string[]; reason: string }[];
  /** Maximum score when a critical check fails. Default 50. */
  criticalCap?: number;
  structural?: StructuralOptions;
  /** Number of components in the reference architecture (filled in automatically). */
  referenceSize?: number;
}

export interface RequirementRef {
  id: string;
  kind: 'functional' | 'non-functional';
  text: { en: string; hi: string };
  checks: string[];
}

/** Everything the engine needs about a question. Kept small so the server can load it from the DB. */
export interface EvaluationInput {
  questionId: string;
  difficulty: Difficulty;
  rubricVersion: number;
  rubric: Rubric;
  requirements: RequirementRef[];
}

export type IssueSeverity = 'error' | 'warning' | 'info';
export type FindingBucket = 'invalid-connection' | 'bottleneck' | 'complexity' | 'security' | 'disconnected';

export interface StructuralIssue {
  code: string;
  severity: IssueSeverity;
  category: ScoreCategoryKey;
  /** Fraction (0–1) of the category score removed. */
  penalty: number;
  title: string;
  message: string;
  fix: string;
  nodeIds: string[];
  edgeIds: string[];
  bucket?: FindingBucket;
}

export interface CheckOutcome {
  id: string;
  title: string;
  category: ScoreCategoryKey;
  status: CheckStatus;
  points: number;
  earned: number;
  critical: boolean;
  optional: boolean;
  /** Explanation of the result (strength or deduction reason). */
  message: string;
  /** Evidence from the diagram, e.g. the path that was found. */
  evidence: string;
  fix?: string;
  nodeIds: string[];
  edgeIds: string[];
}

export interface Deduction {
  reason: string;
  /** Approximate overall points (out of 100) lost. */
  points: number;
  source: 'rubric' | 'structure';
}

export interface CategoryScore {
  key: ScoreCategoryKey;
  label: string;
  weight: number;
  /** 0–100 */
  score: number;
  assessed: boolean;
  earnedPoints: number;
  possiblePoints: number;
  explanation: string;
  deductions: Deduction[];
}

export type CoverageStatus = 'met' | 'partial' | 'unmet' | 'needs-config' | 'not-assessed';

export interface RequirementCoverage {
  id: string;
  kind: 'functional' | 'non-functional';
  text: { en: string; hi: string };
  status: CoverageStatus;
  checkIds: string[];
}

export interface Finding {
  title: string;
  detail: string;
  fix?: string;
  severity: IssueSeverity;
  nodeIds: string[];
  edgeIds: string[];
  checkId?: string;
}

export interface Suggestion {
  title: string;
  detail: string;
  /** Approximate overall points this would recover. */
  impact: number;
}

export interface EvaluationReport {
  engineVersion: string;
  rubricVersion: number;
  questionId: string;
  score: number;
  rating: number;
  stars: number;
  ratingLabel: string;
  categories: CategoryScore[];
  checks: CheckOutcome[];
  requirementCoverage: RequirementCoverage[];
  coverage: { met: number; partial: number; total: number; percent: number };
  issues: StructuralIssue[];
  missingComponents: Finding[];
  missingConnections: Finding[];
  invalidConnections: Finding[];
  bottlenecks: Finding[];
  unnecessaryComplexity: Finding[];
  securityConcerns: Finding[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  criticalFailures: { checkId: string; title: string; message: string }[];
  scoreCap: number | null;
  stats: { components: number; connections: number };
  summary: string;
}

export interface ValidationIssue {
  severity: IssueSeverity;
  title: string;
  message: string;
  fix?: string;
  nodeIds: string[];
  edgeIds: string[];
}

export interface ValidationResult {
  ok: boolean;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  missingComponents: string[];
  requirementCoverage: RequirementCoverage[];
}
