import type { Bi } from '@/features/learn/types';

export interface GlossaryTerm {
  /** Unique id, e.g. "idempotency". */
  id: string;
  /** Display name, e.g. "Idempotency". */
  title: string;
  /** Words and phrases that link to this term (matched case-insensitively, whole words, plural “s” allowed). */
  aliases: string[];
  /** The meaning in simple words. */
  simple: Bi;
  /** A real-life example, when it helps. */
  example?: Bi;
  /** Ids of related terms. */
  related?: string[];
  /** An in-app page that goes deeper (a Learn guide or an Interview Prep answer). */
  more?: string;
  /** Catalog component(s) this term names — not underlined on those components’ own guides. */
  component?: string | string[];
}
