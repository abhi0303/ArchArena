import type { SceneAccent } from './types';

/** Colours for each accent, shared by the illustrations (literal class strings so Tailwind can see them). */
export const SCENE_ACCENT: Record<SceneAccent, { icon: string; stroke: string; fill: string }> = {
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
