import type { Bi, Scene, Text } from '@/features/learn/types';

export type { Bi, Text };

/**
 * concept: “what is / why”; scenario: something is going wrong, what do you do;
 * comparison: A vs B; behavioral: “tell me about a time / how do you work”.
 */
export type PrepKind = 'concept' | 'scenario' | 'comparison' | 'behavioral';

export type PrepLevel = 'beginner' | 'intermediate' | 'advanced';

/** One titled part of a longer explanation (a principle, a step, a strategy…). */
export interface PrepPart {
  /** A plain string is shown as-is in both languages. */
  title: Text;
  text: Bi;
}

export interface PrepQuestion {
  /** URL slug, unique across all categories. */
  id: string;
  category: string;
  topic: string;
  question: Bi;
  kind: PrepKind;
  level: PrepLevel;
  /** Search keywords (English). */
  tags: string[];

  /** Scenario questions: the situation, explained in detail. */
  scenario?: Bi;
  /** The idea in the simplest possible words. */
  simple: Bi;
  /** A real-life example. */
  example: Bi;
  /** Why we need it. */
  why?: Bi;
  /** What happens without it. */
  without?: Bi;
  /** The deeper explanation, in parts (principles, steps, strategies…). */
  parts?: PrepPart[];
  /** Heading shown above `parts`, e.g. “Step by step”. Defaults to “In detail”. */
  partsTitle?: Bi;
  /** A comparison table. Plain strings are shown as-is in both languages. */
  table?: { columns: string[]; rows: Text[][] };
  /** An illustration (same format as the Learn guides). */
  scene?: Scene;

  /** What to say in the interview: a one-line answer, crisp points and the terms to use. */
  interview: { opening: Bi; points: Bi[]; keywords: string[] };
  /** What the interviewer is listening for. */
  listenFor: Bi[];
  /** Mistakes and red flags. */
  mistakes?: Bi[];
  /** Questions an interviewer is likely to ask next, with short answers. */
  followUps?: { q: Bi; a: Bi }[];
  /** Learn guides (component types) and challenges (slugs) that go deeper. */
  related?: { components?: string[]; challenges?: string[] };
}
