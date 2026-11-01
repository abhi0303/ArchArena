import type { Bi, Scene, SceneAccent, Text } from '@/features/learn/types';

export type { Bi, Text };

/**
 * concept: “what is / why”; scenario: something is going wrong, what do you do;
 * comparison: A vs B; behavioral: “tell me about a time / how do you work”.
 */
export type PrepKind = 'concept' | 'scenario' | 'comparison' | 'behavioral';

export type PrepLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * One building block of an answer. Text supports **bold** and `inline code`.
 * Plain strings (in tables, option titles) are shown as-is in both languages.
 */
export type PrepBlock =
  | { type: 'p'; text: Bi }
  /** A sub-heading inside a section. A plain string is the same in both languages. */
  | { type: 'h'; text: Text }
  | { type: 'list'; items: Bi[]; ordered?: boolean }
  | { type: 'table'; columns: Text[]; rows: Text[][] }
  /** Code, commands, JSON, config or console output. Never translated. */
  | { type: 'code'; lang: string; code: string; title?: string }
  | { type: 'note'; tone: 'important' | 'tip' | 'warning' | 'example'; text: Bi }
  /** Numbered steps with a title each (a migration, a debugging order…). */
  | { type: 'steps'; items: { title: Text; text: Bi }[] }
  /** Alternatives side by side (e.g. three versioning styles), optionally with a badge and code. */
  | { type: 'options'; items: { title: string; badge?: Bi; text: Bi; code?: string; lang?: string }[] }
  /** An illustration; `before` is tinted red (the problem), `after` green (the fix). */
  | { type: 'scene'; scene: Scene; variant?: 'before' | 'after' }
  /** A timeline: who talks to whom, in order, with a step-by-step walkthrough. */
  | { type: 'sequence'; sequence: Sequence };

/** A participant in a sequence diagram (drawn as a column with a lifeline). */
export interface SeqActor {
  id: string;
  /** Lucide icon name (see learn/icons.ts). */
  icon: string;
  label: Text;
  accent: SceneAccent;
}

/** flow: a call · reply: a response · async: a message sent for later · bad: a call that failed. */
export type SeqMsgKind = 'flow' | 'reply' | 'async' | 'bad';

export type SeqStep = (
  | { type: 'msg'; from: string; to: string; label: Text; kind: SeqMsgKind }
  /** Something that happens over one or two actors (a crash, a wait, a state change). */
  | { type: 'note'; over: string[]; text: Text; tone: 'info' | 'good' | 'bad' | 'wait' }
) & {
  /** Plain-language explanation shown when walking through the steps. */
  explain?: Bi;
};

export interface Sequence {
  actors: SeqActor[];
  steps: SeqStep[];
  /** Boxes around consecutive steps (indexes into `steps`, inclusive), e.g. one transaction. */
  groups?: { from: number; to: number; label: Text; tone: 'good' | 'bad' | 'info' }[];
  caption: Bi;
}

export interface PrepSection {
  /** A plain string is the same in both languages. */
  title: Text;
  blocks: PrepBlock[];
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

  /** The direct answer in two or three sentences — what you would say first. */
  answer: Bi;
  /** The explanation, as numbered sections full of concrete examples. */
  sections: PrepSection[];
  /** What to say in the interview: a short spoken answer, plus the terms to use. */
  interview: { text: Bi[]; keywords: string[] };
  /** What the interviewer is listening for. */
  listenFor: Bi[];
  /** Mistakes and red flags. */
  mistakes?: Bi[];
  /** Questions an interviewer is likely to ask next, with how to answer them. */
  followUps?: { q: Bi; a: Bi }[];
  /** Learn guides (component types) and challenges (slugs) that go deeper. */
  related?: { components?: string[]; challenges?: string[] };
}
