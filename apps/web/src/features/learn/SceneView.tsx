import { useId, useSyncExternalStore } from 'react';
import { useExplanation } from '@/components/LanguageToggle';
import { cn } from '@/lib/cn';
import { learnIcon } from './icons';
import type { Scene, SceneAccent, SceneEdge, SceneNode, Text } from './types';

/**
 * Renders a learning illustration as an SVG: nodes in columns, arrows between them and,
 * for live flows, small "packets" travelling along the arrows. Purely decorative motion
 * is skipped for people who prefer reduced motion.
 */

const W = 360;
const ROW = 80;
const BOX = 44;
const R = BOX / 2;

// Literal class strings so Tailwind can see them.
const ACCENT: Record<SceneAccent, { icon: string; stroke: string; fill: string }> = {
  sky: { icon: 'text-sky-600 dark:text-sky-400', stroke: 'stroke-sky-300 dark:stroke-sky-700', fill: 'fill-sky-50 dark:fill-sky-950' },
  violet: { icon: 'text-violet-600 dark:text-violet-400', stroke: 'stroke-violet-300 dark:stroke-violet-700', fill: 'fill-violet-50 dark:fill-violet-950' },
  emerald: { icon: 'text-emerald-600 dark:text-emerald-400', stroke: 'stroke-emerald-300 dark:stroke-emerald-700', fill: 'fill-emerald-50 dark:fill-emerald-950' },
  amber: { icon: 'text-amber-600 dark:text-amber-400', stroke: 'stroke-amber-300 dark:stroke-amber-700', fill: 'fill-amber-50 dark:fill-amber-950' },
  rose: { icon: 'text-rose-600 dark:text-rose-400', stroke: 'stroke-rose-300 dark:stroke-rose-700', fill: 'fill-rose-50 dark:fill-rose-950' },
  slate: { icon: 'text-slate-600 dark:text-slate-300', stroke: 'stroke-slate-300 dark:stroke-slate-600', fill: 'fill-white dark:fill-slate-900' },
  cyan: { icon: 'text-cyan-600 dark:text-cyan-400', stroke: 'stroke-cyan-300 dark:stroke-cyan-700', fill: 'fill-cyan-50 dark:fill-cyan-950' },
  orange: { icon: 'text-orange-600 dark:text-orange-400', stroke: 'stroke-orange-300 dark:stroke-orange-700', fill: 'fill-orange-50 dark:fill-orange-950' },
  fuchsia: { icon: 'text-fuchsia-600 dark:text-fuchsia-400', stroke: 'stroke-fuchsia-300 dark:stroke-fuchsia-700', fill: 'fill-fuchsia-50 dark:fill-fuchsia-950' },
  lime: { icon: 'text-lime-600 dark:text-lime-400', stroke: 'stroke-lime-300 dark:stroke-lime-700', fill: 'fill-lime-50 dark:fill-lime-950' },
  indigo: { icon: 'text-indigo-600 dark:text-indigo-400', stroke: 'stroke-indigo-300 dark:stroke-indigo-700', fill: 'fill-indigo-50 dark:fill-indigo-950' },
};

const EDGE: Record<SceneEdge['kind'], { line: string; head: string; dot: string; dash?: string; dur: number }> = {
  flow: { line: 'stroke-indigo-400 dark:stroke-indigo-500', head: 'fill-indigo-400 dark:fill-indigo-500', dot: 'fill-indigo-500 dark:fill-indigo-300', dur: 1.8 },
  async: { line: 'stroke-amber-400 dark:stroke-amber-500', head: 'fill-amber-400 dark:fill-amber-500', dot: 'fill-amber-500 dark:fill-amber-300', dash: '5 4', dur: 2.8 },
  bad: { line: 'stroke-rose-400 dark:stroke-rose-500', head: 'fill-rose-400 dark:fill-rose-500', dot: 'fill-rose-500', dash: '4 4', dur: 0 },
  muted: { line: 'stroke-slate-300 dark:stroke-slate-600', head: 'fill-slate-300 dark:fill-slate-600', dot: 'fill-slate-400', dash: '2 4', dur: 0 },
};

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  mq?.addEventListener('change', cb);
  return () => mq?.removeEventListener('change', cb);
}
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    () => true,
  );
}

/** Splits a label into at most two short lines. */
function wrap(text: string, max = 13): string[] {
  if (text.length <= max) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (!line) line = w;
    else if ((line + ' ' + w).length <= max) line += ' ' + w;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > 2) return [lines[0]!, `${lines.slice(1).join(' ').slice(0, max - 1)}…`];
  return lines;
}

interface Placed {
  node: SceneNode;
  x: number;
  y: number;
}

function layout(scene: Scene): { placed: Map<string, Placed>; height: number } {
  const rows = Math.max(1, ...scene.cols.map((c) => c.length));
  // Arrows between nodes stacked in the same column need room below each label.
  const colOf = new Map(scene.cols.flatMap((col, i) => col.map((n) => [n.id, i] as const)));
  const vertical = scene.edges.some((e) => colOf.get(e.from) !== undefined && colOf.get(e.from) === colOf.get(e.to));
  const rowGap = vertical ? ROW + 34 : ROW;
  const height = Math.max(150, rows * rowGap + 40);
  const n = scene.cols.length;
  const pad = n <= 1 ? W / 2 : n === 2 ? 80 : n === 3 ? 56 : 44;
  const placed = new Map<string, Placed>();
  scene.cols.forEach((col, i) => {
    const x = n <= 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (n - 1);
    col.forEach((node, j) => {
      const y = height / 2 - 10 + (j - (col.length - 1) / 2) * rowGap;
      placed.set(node.id, { node, x, y });
    });
  });
  return { placed, height };
}

export function SceneView({ scene, variant = 'neutral', className }: { scene: Scene; variant?: 'before' | 'after' | 'neutral'; className?: string }) {
  const t = useExplanation();
  const txt = (v: Text) => (typeof v === 'string' ? v : t(v));
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const { placed, height } = layout(scene);
  const caption = t(scene.caption);
  // How far below a node's centre its label (and note) reach, so arrows leaving downward do not cross the text.
  const labelDepth = (id: string) => {
    const p = placed.get(id);
    if (!p) return R + 5;
    const lines = wrap(txt(p.node.label)).length;
    return R + 13 + (lines - 1) * 11.5 + (p.node.note ? 11.5 : 0) + 7;
  };

  return (
    <figure
      className={cn(
        'overflow-hidden rounded-xl border',
        variant === 'before'
          ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
          : variant === 'after'
            ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
            : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40',
        className,
      )}
    >
      <svg viewBox={`0 0 ${W} ${height}`} className="mx-auto block h-auto w-full max-w-[560px]" role="img" aria-label={caption}>
        <defs>
          {(Object.keys(EDGE) as SceneEdge['kind'][]).map((k) => (
            <marker key={k} id={`${uid}-h-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={EDGE[k].head} />
            </marker>
          ))}
        </defs>

        {scene.edges.map((e, i) => {
          const from = placed.get(e.from);
          const to = placed.get(e.to);
          if (!from || !to) return null;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          // Leaving a node downward (or arriving at one from below) starts/ends under its label.
          const startGap = uy > 0.55 ? labelDepth(e.from) / uy : R + 5;
          const endGap = uy < -0.55 ? labelDepth(e.to) / -uy : R + 5;
          const x1 = from.x + ux * startGap;
          const y1 = from.y + uy * startGap;
          const x2 = to.x - ux * endGap;
          const y2 = to.y - uy * endGap;
          const d = `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`;
          const style = EDGE[e.kind];
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          // Labels sit just above (or to the right of) the line: offset along the perpendicular.
          let ox = uy * 9;
          let oy = -ux * 9;
          if (oy > 0 || (oy === 0 && ox < 0)) {
            ox = -ox;
            oy = -oy;
          }
          const label = e.label ? txt(e.label) : null;
          const lw = label ? label.length * 5.2 + 10 : 0;
          return (
            <g key={i}>
              <path
                d={d}
                className={style.line}
                strokeWidth={1.8}
                fill="none"
                strokeDasharray={style.dash}
                markerEnd={`url(#${uid}-h-${e.kind})`}
                markerStart={e.both ? `url(#${uid}-h-${e.kind})` : undefined}
              />
              {!reduced && style.dur > 0 && (
                <circle r={3.2} className={style.dot}>
                  <animateMotion
                    dur={`${e.both ? style.dur * 1.6 : style.dur}s`}
                    repeatCount="indefinite"
                    path={d}
                    begin={`${(i % 4) * 0.35}s`}
                    {...(e.both ? { keyPoints: '0;1;0', keyTimes: '0;0.5;1', calcMode: 'linear' } : {})}
                  />
                </circle>
              )}
              {e.kind === 'bad' && (
                <g transform={`translate(${mx},${my})`}>
                  <circle r={7} className="fill-white stroke-rose-400 dark:fill-slate-900" strokeWidth={1.5} />
                  <path d="M-3,-3 L3,3 M3,-3 L-3,3" className="stroke-rose-500" strokeWidth={1.8} strokeLinecap="round" />
                </g>
              )}
              {label && (
                <g transform={`translate(${mx + ox},${my + oy})`}>
                  <rect x={-lw / 2} y={-8} width={lw} height={14} rx={7} className="fill-white/90 dark:fill-slate-900/90" />
                  <text textAnchor="middle" y={3} fontSize={9} className="fill-slate-600 dark:fill-slate-300" fontWeight={500}>
                    {label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {[...placed.values()].map(({ node, x, y }) => {
          const accent = ACCENT[node.accent];
          const Icon = learnIcon(node.icon);
          const lines = wrap(txt(node.label));
          const note = node.note ? txt(node.note) : null;
          const ring =
            node.state === 'bad'
              ? 'stroke-rose-400 dark:stroke-rose-500'
              : node.state === 'good'
                ? 'stroke-emerald-400 dark:stroke-emerald-500'
                : node.state === 'focus'
                  ? 'stroke-indigo-500 dark:stroke-indigo-400'
                  : accent.stroke;
          const fill = node.state === 'bad' ? 'fill-rose-50 dark:fill-rose-950' : accent.fill;
          return (
            <g key={node.id} opacity={node.state === 'muted' ? 0.45 : 1}>
              {node.state === 'focus' && (
                <rect x={x - R - 6} y={y - R - 6} width={BOX + 12} height={BOX + 12} rx={16} className="fill-indigo-400/20 dark:fill-indigo-400/15">
                  {!reduced && <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />}
                </rect>
              )}
              <rect x={x - R} y={y - R} width={BOX} height={BOX} rx={12} className={cn(fill, ring)} strokeWidth={node.state === 'focus' ? 2.4 : 1.6} />
              <Icon x={x - 11} y={y - 11} width={22} height={22} className={node.state === 'bad' ? 'text-rose-600 dark:text-rose-400' : accent.icon} strokeWidth={2} aria-hidden />
              {(node.state === 'bad' || node.state === 'good') && (
                <g transform={`translate(${x + R - 3},${y - R + 3})`}>
                  <circle r={7} className={node.state === 'bad' ? 'fill-rose-500' : 'fill-emerald-500'} />
                  {node.state === 'bad' ? (
                    <path d="M0,-3.5 L0,0.8 M0,3 L0,3.2" className="stroke-white" strokeWidth={1.8} strokeLinecap="round" />
                  ) : (
                    <path d="M-3,0 L-1,2.2 L3,-2.2" className="stroke-white" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </g>
              )}
              {lines.map((line, i) => (
                <text
                  key={i}
                  x={x}
                  y={y + R + 13 + i * 11.5}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontWeight={node.state === 'focus' ? 700 : 600}
                  className="fill-slate-800 dark:fill-slate-100"
                >
                  {line}
                </text>
              ))}
              {note && (
                <text
                  x={x}
                  y={y + R + 13 + lines.length * 11.5}
                  textAnchor="middle"
                  fontSize={9}
                  className={node.state === 'bad' ? 'fill-rose-600 dark:fill-rose-400' : 'fill-slate-500 dark:fill-slate-400'}
                  fontStyle="italic"
                >
                  {note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption
        className={cn(
          'border-t px-3 py-2 text-xs leading-relaxed sm:text-sm',
          variant === 'before'
            ? 'border-rose-200 text-rose-900 dark:border-rose-900/60 dark:text-rose-200'
            : variant === 'after'
              ? 'border-emerald-200 text-emerald-900 dark:border-emerald-900/60 dark:text-emerald-200'
              : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300',
        )}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
