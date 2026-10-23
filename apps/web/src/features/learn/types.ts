/** A text in both explanation languages. */
export interface Bi {
  en: string;
  hi: string;
}

/** Plain strings are shown as-is in both languages (component names, technical terms). */
export type Text = string | Bi;

export type SceneAccent = 'sky' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan' | 'orange' | 'fuchsia' | 'lime' | 'indigo';

export type SceneNodeState = 'normal' | 'focus' | 'bad' | 'good' | 'muted';

export interface SceneNode {
  id: string;
  /** Lucide icon name (see learn/icons.ts). */
  icon: string;
  label: Text;
  accent: SceneAccent;
  /** Small text under the label, e.g. "100% CPU". */
  note?: Text;
  state: SceneNodeState;
}

/** flow: normal request · async: queued / later · bad: broken or harmful · muted: optional/rare. */
export type SceneEdgeKind = 'flow' | 'async' | 'bad' | 'muted';

export interface SceneEdge {
  from: string;
  to: string;
  kind: SceneEdgeKind;
  label?: Text;
  /** Two-way traffic (e.g. a live connection). */
  both?: boolean;
}

/** A small illustration: nodes arranged in columns (left → right), connected by edges. */
export interface Scene {
  cols: SceneNode[][];
  edges: SceneEdge[];
  caption: Bi;
}

export interface ComponentGuide {
  /** Catalog component type, e.g. "load-balancer". */
  type: string;
  /** One line that sticks in memory. */
  tagline: Bi;
  /** Plain-language explanation for a complete beginner. */
  intro: Bi;
  /** What went wrong before this component existed. */
  problem: Bi;
  before: Scene;
  /** What changes once you add it. */
  solution: Bi;
  after: Scene;
  /** How it works, step by step. */
  steps: Bi[];
  /** A real-life analogy. */
  analogy: { icons: string[]; title: Bi; text: Bi };
  /** A situation where this component is exactly the right choice (not an alternative). */
  perfectFit: { title: Bi; text: Bi; why: Bi[] };
  /** When it is the wrong tool, or common mistakes. */
  avoidWhen: Bi[];
  /** Decisions you make when you add it (mirrors the playground's properties). */
  decisions: Bi[];
  /** Look-alike components and the one difference that matters. */
  confusedWith: { type: string; difference: Bi; compare?: string }[];
  /** Well-known products of this kind. */
  examples: string[];
}

export interface Comparison {
  slug: string;
  /** Catalog types compared, in display order. */
  types: string[];
  /** Why people mix them up. */
  confusion: Bi;
  /** What they genuinely have in common. */
  common: Bi;
  /** One everyday story where each component plays a different role. */
  story: { setting: Bi; roles: { type: string; icon: string; role: Bi }[] };
  /** Feature table: one value per compared type, in `types` order. */
  rows: { feature: Text; values: Text[] }[];
  /** When to pick each one. */
  pickWhen: { type: string; points: Bi[] }[];
  /** A one-sentence rule of thumb. */
  rule: Bi;
  /** "Which one would you pick?" scenarios. The options are the compared types. */
  quiz: { scenario: Bi; answer: string; why: Bi }[];
}

/** Plain-language explanation of one property field shown in the playground's Properties panel. */
export interface SettingGuide {
  /** Property key, e.g. "replication". */
  key: string;
  /** What the setting means. */
  what: Bi;
  /** Why it matters — what goes wrong if it is set badly. */
  why: Bi;
  /** A real-life example. */
  example: Bi;
  /** Meaning of every option; on/off settings use the keys "true" and "false". */
  options?: Record<string, Bi>;
  /** Good example values for free-text settings. */
  goodValues?: Bi;
  /** Practical advice for challenges (what the evaluator rewards). */
  inChallenges: Bi;
}
