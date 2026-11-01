import { ChevronLeft, ChevronRight, ListOrdered, Pause, Play } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useExplanation } from '@/components/LanguageToggle';
import { InlineText } from '@/features/glossary/InlineText';
import { SCENE_ACCENT } from '@/features/learn/sceneStyles';
import { learnIcon } from '@/features/learn/icons';
import { cn } from '@/lib/cn';
import type { SeqMsgKind, SeqStep, Sequence, Text } from './types';

/**
 * A sequence diagram: actors across the top, time flowing down, one numbered row per step.
 * “Walk through” highlights one step at a time and explains it in plain words below the picture.
 */

const GUTTER = 30; // step numbers
const COL = 116; // width per actor
const HEAD = 78; // icons and names
const LINE = 11.5; // text line height
const CHAR = 5.3; // average character width at font size 10
const BOX_HEAD = 18; // room for a group's label

const MSG: Record<SeqMsgKind, { line: string; head: string; dash?: string }> = {
  flow: { line: 'stroke-indigo-500 dark:stroke-indigo-400', head: 'fill-indigo-500 dark:fill-indigo-400' },
  reply: { line: 'stroke-slate-400 dark:stroke-slate-500', head: 'fill-slate-400 dark:fill-slate-500', dash: '4 3' },
  async: { line: 'stroke-amber-500 dark:stroke-amber-400', head: 'fill-amber-500 dark:fill-amber-400', dash: '6 4' },
  bad: { line: 'stroke-rose-500 dark:stroke-rose-400', head: 'fill-rose-500 dark:fill-rose-400', dash: '4 4' },
};

const NOTE: Record<'info' | 'good' | 'bad' | 'wait', { box: string; text: string }> = {
  info: { box: 'fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600', text: 'fill-slate-700 dark:fill-slate-200' },
  good: { box: 'fill-emerald-50 stroke-emerald-300 dark:fill-emerald-950 dark:stroke-emerald-700', text: 'fill-emerald-800 dark:fill-emerald-200' },
  bad: { box: 'fill-rose-50 stroke-rose-300 dark:fill-rose-950 dark:stroke-rose-700', text: 'fill-rose-800 dark:fill-rose-200' },
  wait: { box: 'fill-amber-50 stroke-amber-300 dark:fill-amber-950 dark:stroke-amber-700', text: 'fill-amber-900 dark:fill-amber-200' },
};

const BOX: Record<'good' | 'bad' | 'info', { box: string; text: string }> = {
  good: { box: 'fill-emerald-400/10 stroke-emerald-400 dark:stroke-emerald-600', text: 'fill-emerald-700 dark:fill-emerald-300' },
  bad: { box: 'fill-rose-400/10 stroke-rose-400 dark:stroke-rose-600', text: 'fill-rose-700 dark:fill-rose-300' },
  info: { box: 'fill-indigo-400/10 stroke-indigo-400 dark:stroke-indigo-500', text: 'fill-indigo-700 dark:fill-indigo-300' },
};

/** Splits text into lines that fit `width` pixels. */
function wrap(text: string, width: number): string[] {
  const max = Math.max(8, Math.floor(width / CHAR));
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (!line) line = word;
    else if ((line + ' ' + word).length <= max) line += ' ' + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface Row {
  step: SeqStep;
  /** Top of the row. */
  y: number;
  h: number;
  /** Vertical centre of the arrow or note box (where the step number sits). */
  mid: number;
  lines: string[];
  /** Horizontal centre, used to scroll the step into view on small screens. */
  cx: number;
}

function layout(seq: Sequence, txt: (v: Text) => string) {
  const xOf = new Map(seq.actors.map((a, i) => [a.id, GUTTER + COL * (i + 0.5)]));
  const x = (id: string) => xOf.get(id) ?? GUTTER;
  const width = GUTTER + seq.actors.length * COL + 6;
  const rows: Row[] = [];
  const boxes: { x1: number; x2: number; y1: number; y2: number; label: string; tone: 'good' | 'bad' | 'info' }[] = [];
  let y = HEAD + 8;
  seq.steps.forEach((step, i) => {
    const box = seq.groups?.find((g) => g.from === i);
    if (box) y += BOX_HEAD;
    if (step.type === 'msg') {
      const x1 = x(step.from);
      const x2 = x(step.to);
      const lines = wrap(txt(step.label), Math.abs(x2 - x1) - 14);
      const mid = y + 8 + lines.length * LINE + 3;
      rows.push({ step, y, h: lines.length * LINE + 20, mid, lines, cx: (x1 + x2) / 2 });
      y += lines.length * LINE + 20;
    } else {
      const xs = step.over.map(x);
      const left = Math.min(...xs) - COL / 2 + 8;
      const right = Math.max(...xs) + COL / 2 - 8;
      const lines = wrap(txt(step.text), right - left - 14);
      const boxH = lines.length * LINE + 10;
      rows.push({ step, y, h: boxH + 10, mid: y + 5 + boxH / 2, lines, cx: (left + right) / 2 });
      y += boxH + 10;
    }
    const end = seq.groups?.find((g) => g.to === i);
    if (end) {
      const inside = seq.steps.slice(end.from, end.to + 1).flatMap((s) => (s.type === 'msg' ? [s.from, s.to] : s.over)).map(x);
      const first = rows[end.from]!;
      boxes.push({
        x1: Math.max(GUTTER - 2, Math.min(...inside) - COL * 0.42),
        x2: Math.min(width - 2, Math.max(...inside) + COL * 0.42),
        y1: first.y - BOX_HEAD + 2,
        y2: y + 2,
        label: txt(end.label),
        tone: end.tone,
      });
      y += 8;
    }
  });
  return { rows, boxes, width, height: y + 10, x };
}

function stepTitle(step: SeqStep, txt: (v: Text) => string, name: (id: string) => string): string {
  if (step.type === 'note') return txt(step.text);
  return `${name(step.from)} → ${name(step.to)}: ${txt(step.label)}`;
}

export function SequenceView({ sequence: seq }: { sequence: Sequence }) {
  const t = useExplanation();
  const txt = (v: Text) => (typeof v === 'string' ? v : t(v));
  const uid = useId().replace(/:/g, '');
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const { rows, boxes, width, height, x } = layout(seq, txt);
  const name = (id: string) => txt(seq.actors.find((a) => a.id === id)?.label ?? id);
  const last = seq.steps.length - 1;
  const caption = t(seq.caption);

  // Auto-play: move to the next step every few seconds, stop at the end.
  useEffect(() => {
    if (!playing || active === null) return;
    if (active >= last) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setActive((a) => (a === null ? 0 : Math.min(last, a + 1))), 2800);
    return () => window.clearTimeout(id);
  }, [playing, active, last]);

  // On narrow screens the diagram scrolls sideways: keep the current step in view.
  const activeCx = active === null ? null : rows[active]!.cx;
  useEffect(() => {
    const el = scroller.current;
    if (!el || activeCx === null || el.scrollWidth <= el.clientWidth + 4) return;
    const scale = el.scrollWidth / width;
    el.scrollTo?.({ left: Math.max(0, activeCx * scale - el.clientWidth / 2) });
  }, [activeCx, width]);

  const go = (i: number) => {
    setPlaying(false);
    setActive(Math.max(0, Math.min(last, i)));
  };
  const current = active === null ? null : seq.steps[active]!;

  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40" data-testid="prep-sequence">
      <div ref={scroller} className="scrollbar-thin overflow-x-auto overscroll-x-contain">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto block h-auto w-full"
          style={{ minWidth: Math.round(width * 0.78), maxWidth: Math.round(width * 1.15) }}
          role="img"
          aria-label={caption}
        >
          <defs>
            {(Object.keys(MSG) as SeqMsgKind[]).map((k) => (
              <marker key={k} id={`${uid}-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={MSG[k].head} />
              </marker>
            ))}
          </defs>

          {/* lifelines */}
          {seq.actors.map((a) => (
            <line key={a.id} x1={x(a.id)} x2={x(a.id)} y1={HEAD} y2={height - 6} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1.2} strokeDasharray="3 4" />
          ))}

          {/* groups (e.g. one transaction) */}
          {boxes.map((b, i) => (
            <g key={`b${i}`}>
              <rect x={b.x1} y={b.y1} width={b.x2 - b.x1} height={b.y2 - b.y1} rx={10} className={BOX[b.tone].box} strokeWidth={1.3} strokeDasharray="5 4" />
              <text x={b.x1 + 8} y={b.y1 + 12} fontSize={8.5} fontWeight={700} letterSpacing={0.4} className={BOX[b.tone].text}>
                {b.label.toUpperCase()}
              </text>
            </g>
          ))}

          {rows.map((r, i) => {
            const state = active === null || i === active ? 'on' : i < active ? 'past' : 'future';
            const step = r.step;
            return (
              <g key={i} opacity={state === 'on' ? 1 : state === 'past' ? 0.5 : 0.14} style={{ transition: 'opacity 200ms' }}>
                {active === i && <rect x={0} y={r.y - 1} width={width} height={r.h} className="fill-indigo-500/10 dark:fill-indigo-400/10" />}
                <g transform={`translate(${GUTTER / 2},${r.mid})`}>
                  <circle r={8} className={active === i ? 'fill-indigo-600' : 'fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600'} strokeWidth={1.2} />
                  <text y={3.2} textAnchor="middle" fontSize={8.5} fontWeight={700} className={active === i ? 'fill-white' : 'fill-slate-500 dark:fill-slate-400'}>
                    {i + 1}
                  </text>
                </g>
                {step.type === 'msg' ? (
                  (() => {
                    const x1 = x(step.from);
                    const x2 = x(step.to);
                    const dir = x2 > x1 ? 1 : -1;
                    const sx = x1 + dir * 4;
                    const ex = step.kind === 'bad' ? x1 + (x2 - x1) * 0.8 : x2 - dir * 5;
                    const style = MSG[step.kind];
                    return (
                      <>
                        <line
                          x1={sx}
                          x2={ex}
                          y1={r.mid}
                          y2={r.mid}
                          className={style.line}
                          strokeWidth={1.8}
                          strokeDasharray={style.dash}
                          markerEnd={step.kind === 'bad' ? undefined : `url(#${uid}-${step.kind})`}
                        />
                        {step.kind === 'bad' && (
                          <g transform={`translate(${ex},${r.mid})`}>
                            <circle r={7} className="fill-white stroke-rose-400 dark:fill-slate-900" strokeWidth={1.5} />
                            <path d="M-3,-3 L3,3 M3,-3 L-3,3" className="stroke-rose-500" strokeWidth={1.8} strokeLinecap="round" />
                          </g>
                        )}
                        {r.lines.map((line, k) => (
                          <text
                            key={k}
                            x={(x1 + x2) / 2}
                            y={r.mid - 6 - (r.lines.length - 1 - k) * LINE}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight={active === i ? 700 : 600}
                            className={step.kind === 'bad' ? 'fill-rose-700 dark:fill-rose-300' : 'fill-slate-700 dark:fill-slate-200'}
                          >
                            {line}
                          </text>
                        ))}
                      </>
                    );
                  })()
                ) : (
                  (() => {
                    const xs = step.over.map(x);
                    const left = Math.min(...xs) - COL / 2 + 8;
                    const right = Math.max(...xs) + COL / 2 - 8;
                    const boxH = r.lines.length * LINE + 10;
                    const tone = NOTE[step.tone];
                    return (
                      <>
                        <rect x={left} y={r.mid - boxH / 2} width={right - left} height={boxH} rx={8} className={tone.box} strokeWidth={1.2} />
                        {r.lines.map((line, k) => (
                          <text key={k} x={(left + right) / 2} y={r.mid - boxH / 2 + 5 + LINE * (k + 0.5) + 3.5} textAnchor="middle" fontSize={9.5} fontWeight={600} className={tone.text}>
                            {line}
                          </text>
                        ))}
                      </>
                    );
                  })()
                )}
              </g>
            );
          })}

          {/* actors */}
          {seq.actors.map((a) => {
            const cx = x(a.id);
            const accent = SCENE_ACCENT[a.accent];
            const Icon = learnIcon(a.icon);
            const lines = wrap(txt(a.label), COL - 10).slice(0, 2);
            return (
              <g key={a.id}>
                <rect x={cx - 17} y={8} width={34} height={34} rx={10} className={cn(accent.fill, accent.stroke)} strokeWidth={1.5} />
                <Icon x={cx - 10} y={15} width={20} height={20} className={accent.icon} strokeWidth={2} aria-hidden />
                {lines.map((line, k) => (
                  <text key={k} x={cx} y={56 + k * LINE} textAnchor="middle" fontSize={10.5} fontWeight={700} className="fill-slate-800 dark:fill-slate-100">
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <figcaption className="border-t border-slate-200 px-3 py-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:border-slate-800 dark:text-slate-300">{caption}</figcaption>

      <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">
        {current === null ? (
          <button
            type="button"
            onClick={() => {
              setActive(0);
              setPlaying(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            data-testid="sequence-start"
          >
            <ListOrdered className="h-4 w-4" aria-hidden /> Walk through it step by step
          </button>
        ) : (
          <div className="space-y-2" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300" data-testid="sequence-position">
                Step {active! + 1} of {seq.steps.length}
              </p>
              <div className="flex items-center gap-1">
                <SeqButton label="Previous step" onClick={() => go(active! - 1)} disabled={active === 0} testId="sequence-prev">
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </SeqButton>
                <SeqButton
                  label={playing ? 'Pause' : 'Play'}
                  onClick={() => {
                    if (active === last) setActive(0);
                    setPlaying((p) => !p);
                  }}
                  testId="sequence-play"
                >
                  {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                </SeqButton>
                <SeqButton label="Next step" onClick={() => go(active! + 1)} disabled={active === last} testId="sequence-next">
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </SeqButton>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setActive(null);
                  }}
                  className="ml-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
                  data-testid="sequence-all"
                >
                  Show all
                </button>
              </div>
            </div>
            <p className="font-semibold leading-snug text-slate-900 dark:text-slate-100" data-testid="sequence-step-title">
              {stepTitle(current, txt, name)}
            </p>
            {current.explain && (
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300" data-testid="sequence-step-explain">
                <InlineText text={t(current.explain)} />
              </p>
            )}
          </div>
        )}
      </div>

      {/* The whole story as text, for screen readers. */}
      <ol className="sr-only">
        {seq.steps.map((s, i) => (
          <li key={i}>
            {stepTitle(s, txt, name)}
            {s.explain ? ` — ${t(s.explain)}` : ''}
          </li>
        ))}
      </ol>
    </figure>
  );
}

function SeqButton({ label, onClick, disabled, testId, children }: { label: string; onClick: () => void; disabled?: boolean; testId: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}
