import { getComponent } from '@arch-arena/shared';
import { ArrowRight, Ban, BookOpenCheck, CircleCheck, Lightbulb, ListOrdered, Puzzle, SlidersHorizontal, Sparkles, Split, Store, TriangleAlert, Wand2 } from 'lucide-react';
import { Link } from 'react-router';
import { useExplanation } from '@/components/LanguageToggle';
import { ActorIcon, ComponentTile, LearnSection, Paragraphs, componentLabel } from './parts';
import { settingsGuidePath } from './settingsCatalog';
import { SceneView } from './SceneView';
import type { ComponentGuide } from './types';
import { InlineText } from '@/features/glossary/InlineText';

/**
 * Every section of a component guide. Used by the full guide page and, in a compact
 * form, by the "Learn" dialog inside the playground.
 */
export function GuideView({ guide, compact = false }: { guide: ComponentGuide; compact?: boolean }) {
  const t = useExplanation();
  const label = getComponent(guide.type)?.label ?? guide.type;

  return (
    <div className="space-y-10">
      <LearnSection id="simple" icon={<Sparkles className="h-4 w-4" />} title="In simple words">
        <Paragraphs text={t(guide.intro)} className="text-base" />
      </LearnSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <LearnSection id="problem" icon={<TriangleAlert className="h-4 w-4 text-rose-500" />} title={`Life before ${label}`}>
          <Paragraphs text={t(guide.problem)} className="mb-4" />
          <SceneView scene={guide.before} variant="before" />
        </LearnSection>
        <LearnSection id="solution" icon={<CircleCheck className="h-4 w-4 text-emerald-500" />} title={`With ${label}`}>
          <Paragraphs text={t(guide.solution)} className="mb-4" />
          <SceneView scene={guide.after} variant="after" />
        </LearnSection>
      </div>

      <LearnSection id="how" icon={<ListOrdered className="h-4 w-4" />} title="How it works, step by step">
        <ol className="space-y-3">
          {guide.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white" aria-hidden>
                {i + 1}
              </span>
              <p className="pt-0.5 leading-relaxed text-slate-700 dark:text-slate-300">
                <InlineText text={t(s)} />
              </p>
            </li>
          ))}
        </ol>
      </LearnSection>

      <LearnSection id="analogy" icon={<Lightbulb className="h-4 w-4 text-amber-500" />} title="Real-life analogy">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-900/60 dark:from-amber-950/40 dark:to-orange-950/30">
          <div className="mb-3 flex flex-wrap items-center gap-2" aria-hidden>
            {guide.analogy.icons.map((icon, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-200 dark:bg-slate-900 dark:text-amber-400 dark:ring-amber-900">
                  <ActorIcon name={icon} className="h-5 w-5" />
                </span>
                {i < guide.analogy.icons.length - 1 && <ArrowRight className="h-4 w-4 text-amber-400" />}
              </span>
            ))}
          </div>
          <h3 className="text-base font-semibold text-amber-950 dark:text-amber-100">{t(guide.analogy.title)}</h3>
          <Paragraphs text={t(guide.analogy.text)} className="mt-2 text-amber-950/90 dark:text-amber-100/90" />
        </div>
      </LearnSection>

      <LearnSection id="perfect-fit" icon={<Wand2 className="h-4 w-4 text-indigo-500" />} title="Where it fits perfectly">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <h3 className="text-base font-semibold text-indigo-950 dark:text-indigo-100">{t(guide.perfectFit.title)}</h3>
          <Paragraphs text={t(guide.perfectFit.text)} className="mt-2" />
          <ul className="mt-4 space-y-2">
            {guide.perfectFit.why.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                <span>
                  <InlineText text={t(w)} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </LearnSection>

      <div className="grid gap-6 md:grid-cols-2">
        <LearnSection id="avoid" icon={<Ban className="h-4 w-4 text-rose-500" />} title="When it is the wrong tool">
          <ul className="space-y-2">
            {guide.avoidWhen.map((w, i) => (
              <li key={i} className="flex gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden />
                <span>
                  <InlineText text={t(w)} />
                </span>
              </li>
            ))}
          </ul>
        </LearnSection>
        <LearnSection id="decisions" icon={<SlidersHorizontal className="h-4 w-4" />} title="Decisions you will make">
          <ul className="space-y-2">
            {guide.decisions.map((w, i) => (
              <li key={i} className="flex gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <SlidersHorizontal className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" aria-hidden />
                <span>
                  <InlineText text={t(w)} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">You set these in the playground’s Properties panel after selecting the component.</p>
          {(getComponent(guide.type)?.properties.length ?? 0) > 0 && (
            <Link
              to={settingsGuidePath({ component: guide.type })}
              target={compact ? '_blank' : undefined}
              rel={compact ? 'noopener noreferrer' : undefined}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              data-testid="guide-settings-link"
            >
              Every {label} setting explained <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          )}
        </LearnSection>
      </div>

      {guide.confusedWith.length > 0 && (
        <LearnSection id="confused" icon={<Split className="h-4 w-4 text-fuchsia-500" />} title="Don’t confuse it with">
          <ul className="grid gap-3 sm:grid-cols-2">
            {guide.confusedWith.map((cw) => (
              <li key={cw.type} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center gap-2">
                  <ComponentTile type={cw.type} size="sm" />
                  <span className="font-semibold">{componentLabel(cw.type)}</span>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <InlineText text={t(cw.difference)} />
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium">
                  {cw.compare && (
                    <Link
                      to={`/learn/compare/${cw.compare}`}
                      target={compact ? '_blank' : undefined}
                      rel={compact ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Compare side by side <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  )}
                  {!compact && (
                    <Link to={`/learn/${cw.type}`} className="inline-flex items-center gap-1 text-slate-600 hover:underline dark:text-slate-300">
                      <BookOpenCheck className="h-3.5 w-3.5" aria-hidden /> {componentLabel(cw.type)} guide
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </LearnSection>
      )}

      {guide.examples.length > 0 && (
        <LearnSection id="examples" icon={<Store className="h-4 w-4" />} title="Seen in the real world">
          <div className="flex flex-wrap gap-2">
            {guide.examples.map((e) => (
              <span key={e} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {e}
              </span>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Puzzle className="h-3.5 w-3.5" aria-hidden /> Well-known products of this kind, listed to help you recognise it — not recommendations.
          </p>
        </LearnSection>
      )}
    </div>
  );
}
