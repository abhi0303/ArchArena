import { bi } from '@/features/learn/dsl';
import type { Scene } from '@/features/learn/types';
import type { Bi, PrepBlock, PrepSection, Text } from './types';

/**
 * Compact helpers for writing answers:
 *
 *   section('Key principles', 'Key principles',
 *     h('Resource-based URLs', 'Resource-based URLs'),
 *     p('English…', 'Hinglish…'),
 *     table(['Method', 'Endpoint'], [['GET', '/api/v1/expenses']]),
 *     code('json', '{ "data": {} }'),
 *   )
 */

export { bi };

/** English and Hinglish; identical text (technical terms) is stored once. */
const text = (en: string, hi: string): Text => (en === hi ? en : bi(en, hi));

export const section = (en: string, hi: string, ...blocks: PrepBlock[]): PrepSection => ({ title: text(en, hi), blocks });

export const p = (en: string, hi: string): PrepBlock => ({ type: 'p', text: bi(en, hi) });

export const h = (en: string, hi: string): PrepBlock => ({ type: 'h', text: text(en, hi) });

/** Bullet list; each item is [English, Hinglish]. */
export const ul = (...items: [string, string][]): PrepBlock => ({ type: 'list', items: items.map(([en, hi]) => bi(en, hi)) });

export const ol = (...items: [string, string][]): PrepBlock => ({ type: 'list', ordered: true, items: items.map(([en, hi]) => bi(en, hi)) });

export const table = (columns: Text[], rows: Text[][]): PrepBlock => ({ type: 'table', columns, rows });

export const code = (lang: string, source: string, title?: string): PrepBlock => ({ type: 'code', lang, code: source.replace(/^\n/, '').replace(/\s+$/, ''), title });

export const note = (tone: 'important' | 'tip' | 'warning' | 'example', en: string, hi: string): PrepBlock => ({ type: 'note', tone, text: bi(en, hi) });

/** Numbered steps; each step is [title EN, title HI, text EN, text HI]. */
export const steps = (...items: [string, string, string, string][]): PrepBlock => ({
  type: 'steps',
  items: items.map(([te, th, xe, xh]) => ({ title: text(te, th), text: bi(xe, xh) })),
});

export const options = (...items: { title: string; badge?: Bi; text: Bi; code?: string; lang?: string }[]): PrepBlock => ({
  type: 'options',
  items: items.map((i) => ({ ...i, code: i.code?.replace(/^\n/, '').replace(/\s+$/, '') })),
});

export const figure = (scene: Scene): PrepBlock => ({ type: 'scene', scene });
