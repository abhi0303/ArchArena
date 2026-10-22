import { COMPONENTS } from '@arch-arena/shared';
import type { Comparison, ComponentGuide } from '../types';
import { applicationGuides } from './application';
import { cachingGuides } from './caching';
import { clientGuides } from './clients';
import { comparisons1 } from './comparisons-1';
import { comparisons2 } from './comparisons-2';
import { comparisons3 } from './comparisons-3';
import { messagingGuides } from './messaging';
import { specializedGuides1 } from './specialized-1';
import { specializedGuides2 } from './specialized-2';
import { storageGuides } from './storage';
import { supportingGuides } from './supporting';

const ALL_GUIDES: ComponentGuide[] = [
  ...clientGuides,
  ...applicationGuides,
  ...storageGuides,
  ...cachingGuides,
  ...messagingGuides,
  ...supportingGuides,
  ...specializedGuides1,
  ...specializedGuides2,
];

const byType = new Map(ALL_GUIDES.map((g) => [g.type, g]));

/** Guides in catalog order (the same order as the playground's component library). */
export const GUIDES: ComponentGuide[] = COMPONENTS.map((c) => byType.get(c.type)).filter((g): g is ComponentGuide => !!g);

export const COMPARISONS: Comparison[] = [...comparisons1, ...comparisons2, ...comparisons3];

const comparisonBySlug = new Map(COMPARISONS.map((c) => [c.slug, c]));

export function getGuide(type: string): ComponentGuide | undefined {
  return byType.get(type);
}

export function getComparison(slug: string): Comparison | undefined {
  return comparisonBySlug.get(slug);
}

export function comparisonsFor(type: string): Comparison[] {
  return COMPARISONS.filter((c) => c.types.includes(type));
}

/** "Start here": the journey of one request through a typical system. */
export const LEARNING_PATH: { type: string; step: { en: string; hi: string } }[] = [
  { type: 'web-client', step: { en: 'A user opens your app', hi: 'User aapka app kholta hai' } },
  { type: 'dns', step: { en: 'The name becomes an address', hi: 'Naam address mein badalta hai' } },
  { type: 'cdn', step: { en: 'Static files come from nearby', hi: 'Static files paas se aati hain' } },
  { type: 'load-balancer', step: { en: 'Traffic is shared fairly', hi: 'Traffic barabar baantta hai' } },
  { type: 'app-server', step: { en: 'Your code does the work', hi: 'Aapka code kaam karta hai' } },
  { type: 'distributed-cache', step: { en: 'Hot answers are remembered', hi: 'Baar-baar ke jawab yaad rakhe jaate hain' } },
  { type: 'sql-db', step: { en: 'Data is stored safely', hi: 'Data safely store hota hai' } },
  { type: 'message-queue', step: { en: 'Slow work waits in line', hi: 'Slow kaam line mein wait karta hai' } },
  { type: 'background-worker', step: { en: 'Workers finish it later', hi: 'Workers use baad mein poora karte hain' } },
  { type: 'metrics-monitoring', step: { en: 'You watch it all stay healthy', hi: 'Aap sab healthy rehta hai, yeh dekhte ho' } },
];
