import { COMPONENTS, collectRuleSelectors, type Rubric, type Selector } from '@arch-arena/shared';

/** Clients appear in almost every flow rule; they are rarely what a learner is missing. */
const CLIENTS = new Set(['web-client', 'mobile-client', 'desktop-client']);

/**
 * Component types a selector refers to. Tag selectors that match many components
 * (for example “any service”) are too vague to recommend a specific guide, so they are skipped.
 */
export function typesForSelector(sel: Selector): string[] {
  if (sel.types?.length) return sel.types;
  if (sel.tags?.length) {
    const matches = COMPONENTS.filter((c) => sel.tags!.some((t) => (c.tags as readonly string[]).includes(t))).map((c) => c.type);
    return matches.length <= 3 ? matches : [];
  }
  return [];
}

/** Guides that help with a failed rubric check, most specific first (at most `max`). */
export function learnTypesForCheck(rubric: Rubric | undefined, checkId: string | undefined, max = 3): string[] {
  if (!rubric || !checkId) return [];
  const check = rubric.checks.find((c) => c.id === checkId);
  if (!check) return [];
  const out: string[] = [];
  for (const sel of collectRuleSelectors(check.rule)) {
    for (const type of typesForSelector(sel)) if (!CLIENTS.has(type) && !out.includes(type)) out.push(type);
  }
  return out.slice(0, max);
}
