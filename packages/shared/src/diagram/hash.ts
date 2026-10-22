import type { DiagramSnapshot } from './types';

/** cyrb53 — small, fast, well-distributed 53-bit string hash. */
function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

function sortedEntries(obj: Record<string, unknown>): [string, unknown][] {
  return Object.keys(obj)
    .sort()
    .filter((k) => obj[k] !== undefined && obj[k] !== '')
    .map((k) => [k, obj[k]]);
}

/**
 * Hash of the *semantic* content of a diagram: components, their properties and connections.
 * Positions, notes and viewport are ignored, so moving boxes around does not count as a change
 * that needs re-evaluation.
 */
export function hashDiagram(diagram: DiagramSnapshot): string {
  const components = diagram.nodes
    .filter((n) => n.kind === 'component')
    .map((n) => [n.id, n.componentType ?? '', n.label.trim(), sortedEntries(n.props)] as const)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const ids = new Set(components.map((c) => c[0]));
  const edges = diagram.edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .map((e) => [e.source, e.target, sortedEntries(e.props as unknown as Record<string, unknown>)] as const)
    .sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
  return cyrb53(JSON.stringify([components, edges]));
}

/** Stable hash for arbitrary JSON-like content (used for rubric versioning). */
export function hashJson(value: unknown): string {
  return cyrb53(JSON.stringify(value, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(sortedEntries(v)) : v)));
}
