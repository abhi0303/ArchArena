import type { ComponentCategoryId } from '../catalog/components';
import type { ConnectionProps } from '../catalog/connections';
import type { PropertyValue } from '../catalog/properties';
import type { Rubric } from '../evaluation/types';

export type Difficulty = 'easy' | 'medium' | 'hard';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export type ExplanationLanguage = 'en' | 'hinglish';

export interface Bilingual<T = string> {
  en: T;
  hi: T;
}

export const QUESTION_CATEGORIES = [
  'Web Services',
  'Messaging & Real-time',
  'Social & Feeds',
  'Media & Streaming',
  'Storage & Files',
  'Commerce & Payments',
  'Location & Mobility',
  'Search & Discovery',
  'Data & Analytics',
  'Infrastructure & Platform',
  'Databases',
  'Observability',
  'Security & Identity',
  'Collaboration',
  'Gaming',
] as const;

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export interface Requirement {
  id: string;
  en: string;
  hi: string;
  /** Check ids from the rubric that evaluate this requirement. */
  checks: string[];
}

export interface Clarification {
  q: Bilingual;
  a: Bilingual;
}

export interface ReferenceNode {
  id: string;
  type: string;
  label?: string;
  props?: Record<string, PropertyValue>;
  /** Why this component is in the reference design. */
  why: string;
  /** Optional manual grid placement [column, row]. */
  at?: [number, number];
}

export interface ReferenceEdge {
  from: string;
  to: string;
  props?: Partial<ConnectionProps>;
  /** Explanation for critical connections. */
  why?: string;
}

export interface ReferenceArchitecture {
  nodes: ReferenceNode[];
  edges: ReferenceEdge[];
  /** Why the design meets the requirements. */
  summary: string;
  tradeoffs: string[];
  alternatives: string[];
}

export type SourceType = 'interview-prep' | 'engineering-blog' | 'paper' | 'documentation';

export interface QuestionSource {
  title: string;
  url: string;
  type: SourceType;
  /**
   * 'verified' means the URL was checked to resolve to the named resource.
   * 'pending' marks a source that still needs manual verification.
   */
  verification: 'verified' | 'pending';
  /** What the source is used for (never a claim that a company asks this question). */
  note?: string;
}

export interface StarterNode {
  type: string;
  label?: string;
  at?: [number, number];
}

export interface QuestionDefinition {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  category: QuestionCategory;
  estimatedMinutes: number;
  tags: string[];
  concepts: string[];
  status: 'published' | 'draft';
  /**
   * How the question is described. This platform only states that problems are
   * commonly discussed interview-style problems unless a source verifies more.
   */
  interviewClaim: 'commonly-discussed';
  statement: Bilingual;
  functional: Requirement[];
  nonFunctional: Requirement[];
  constraints: Bilingual<string[]>;
  clarifications: Clarification[];
  scale: { label: string; value: string }[];
  suggestedCategories: ComponentCategoryId[];
  starter: StarterNode[];
  /** Exactly four progressive hints. */
  hints: Bilingual[];
  rubric: Rubric;
  reference: ReferenceArchitecture;
  sources: QuestionSource[];
}
