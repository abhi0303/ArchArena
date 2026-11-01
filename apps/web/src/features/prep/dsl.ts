import { getComponent } from '@arch-arena/shared';
import { bi } from '@/features/learn/dsl';
import type { Scene, SceneAccent } from '@/features/learn/types';
import type { Bi, PrepBlock, PrepSection, SeqActor, SeqMsgKind, SeqStep, Sequence, Text } from './types';

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

export const figure = (scene: Scene, variant?: 'before' | 'after'): PrepBlock => ({ type: 'scene', scene, ...(variant ? { variant } : {}) });

// ───────── sequence diagrams ─────────
//
//   timeline(
//     [actor('user', 'User', 'User'), actorC('app-server', { id: 'api', label: 'Expense API' })],
//     [
//       msg('user>api', 'POST /expenses', explain('The user taps Save.', 'User ne Save dabaya.')),
//       inTxn(bi('one transaction', 'ek transaction'), 'good', msg('api>db', 'INSERT expense')),
//       mark(['relay'], bi('waits 2 s', '2 s wait'), 'wait'),
//     ],
//     bi('caption', 'caption in Hinglish'),
//   )
//
// Message syntax: `a>b` call · `a.>b` reply · `a~>b` async message · `a!>b` failed call.

/** A sequence participant from the component catalog (icon, colour and name come from the catalog). */
export function actorC(type: string, o: { id?: string; label?: Text } = {}): SeqActor {
  const def = getComponent(type);
  if (!def) throw new Error(`Unknown component type "${type}" in prep content`);
  return { id: o.id ?? type, icon: def.icon, label: o.label ?? def.label, accent: def.accent };
}

/** Any other sequence participant (a person, a phone…). */
export const actor = (id: string, icon: string, label: Text, accent: SceneAccent = 'slate'): SeqActor => ({ id, icon, label, accent });

export const explain = (en: string, hi: string): Bi => bi(en, hi);

export function msg(spec: string, label: Text, why?: Bi): SeqStep {
  const m = /^(.+?)(\.>|~>|!>|>)(.+)$/.exec(spec);
  if (!m) throw new Error(`Invalid sequence message "${spec}"`);
  const [, from, op, to] = m;
  const kind: SeqMsgKind = op === '.>' ? 'reply' : op === '~>' ? 'async' : op === '!>' ? 'bad' : 'flow';
  if (from!.trim() === to!.trim()) throw new Error(`A message needs two different actors: "${spec}" (use mark() instead)`);
  return { type: 'msg', from: from!.trim(), to: to!.trim(), label, kind, ...(why ? { explain: why } : {}) };
}

/** Something that happens over one or two actors. */
export const mark = (over: string[], text: Text, tone: 'info' | 'good' | 'bad' | 'wait' = 'info', why?: Bi): SeqStep => ({
  type: 'note',
  over,
  text,
  tone,
  ...(why ? { explain: why } : {}),
});

interface SeqBox {
  box: { label: Text; tone: 'good' | 'bad' | 'info' };
  steps: SeqStep[];
}

/** Draws a box around these steps, e.g. everything inside one database transaction. */
export const inTxn = (label: Text, tone: 'good' | 'bad' | 'info', ...steps: SeqStep[]): SeqBox => ({ box: { label, tone }, steps });

export function timeline(actors: SeqActor[], items: (SeqStep | SeqBox)[], caption: Bi): PrepBlock {
  const steps: SeqStep[] = [];
  const groups: NonNullable<Sequence['groups']> = [];
  for (const item of items) {
    if ('box' in item) {
      groups.push({ from: steps.length, to: steps.length + item.steps.length - 1, ...item.box });
      steps.push(...item.steps);
    } else steps.push(item);
  }
  return { type: 'sequence', sequence: { actors, steps, caption, ...(groups.length ? { groups } : {}) } };
}
