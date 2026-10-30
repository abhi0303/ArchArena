import { TERMS_1 } from './terms-1';
import { TERMS_2 } from './terms-2';
import { TERMS_3 } from './terms-3';
import type { GlossaryTerm } from './types';

/** Every glossary term, sorted by title. */
export const GLOSSARY: GlossaryTerm[] = [...TERMS_1, ...TERMS_2, ...TERMS_3].sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

const byId = new Map(GLOSSARY.map((t) => [t.id, t]));

export function getTerm(id: string): GlossaryTerm | undefined {
  return byId.get(id);
}

/** Terms that name a catalog component (not underlined on that component’s own guide). */
export function termIdsForComponent(type: string): string[] {
  return GLOSSARY.filter((t) => (Array.isArray(t.component) ? t.component : t.component ? [t.component] : []).includes(type)).map((t) => t.id);
}

// ───────────── matching ─────────────

const WORD = '[\\p{L}\\p{N}_]';
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

let matcher: { re: RegExp; aliasToId: Map<string, string> } | null = null;

function getMatcher() {
  if (matcher) return matcher;
  const aliasToId = new Map<string, string>();
  for (const t of GLOSSARY) for (const a of t.aliases) aliasToId.set(a.toLowerCase(), t.id);
  // Longest first, so “non-idempotent request” wins over “idempotent”.
  const aliases = [...aliasToId.keys()].sort((a, b) => b.length - a.length).map(escape);
  // (prefix)(term + optional plural), followed by a non-word character. No look-behind, for older Safari.
  const re = new RegExp(`(^|[^\\p{L}\\p{N}_])((?:${aliases.join('|')})(?:e?s)?)(?!${WORD})`, 'giu');
  matcher = { re, aliasToId };
  return matcher;
}

function lookup(word: string, aliasToId: Map<string, string>): string | undefined {
  const w = word.toLowerCase();
  return aliasToId.get(w) ?? (w.endsWith('es') ? aliasToId.get(w.slice(0, -2)) : undefined) ?? (w.endsWith('s') ? aliasToId.get(w.slice(0, -1)) : undefined);
}

export type TermPiece = string | { text: string; id: string };

/**
 * Splits text into plain pieces and glossary terms. Each term is linked once per call site:
 * ids already in `seen` (or in `skip`) are left as plain text, and newly linked ids are added to `seen`.
 */
export function splitTerms(text: string, skip: ReadonlySet<string> = new Set(), seen: Set<string> = new Set()): TermPiece[] {
  const { re, aliasToId } = getMatcher();
  const out: TermPiece[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const prefix = m[1] ?? '';
    const word = m[2] ?? '';
    const id = lookup(word, aliasToId);
    if (!id || skip.has(id) || seen.has(id)) continue;
    seen.add(id);
    const start = (m.index ?? 0) + prefix.length;
    if (start > last) out.push(text.slice(last, start));
    out.push({ text: word, id });
    last = start + word.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Ids of the terms that appear in a piece of text (e.g. a question’s title). */
export function termIdsIn(text: string): string[] {
  return splitTerms(text)
    .filter((p): p is { text: string; id: string } => typeof p !== 'string')
    .map((p) => p.id);
}
