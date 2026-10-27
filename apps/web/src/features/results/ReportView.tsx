import { getComponent, getPropertyField, type AttemptDTO, type CoverageStatus, type EvaluationReport, type Finding, type QuestionDetailDTO, type Rubric } from '@arch-arena/shared';
import {
  ArrowDownRight,
  ArrowUpRight,
  Cable,
  ChevronDown,
  GraduationCap,
  CircleCheck,
  CircleDashed,
  CircleMinus,
  Gauge,
  Lightbulb,
  Puzzle,
  ShieldAlert,
  Shrink,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ACCENTS, DynamicIcon } from '@/components/icons';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { ProgressBar, scoreTone } from '@/components/ui/ProgressBar';
import { Stars } from '@/components/ui/Stars';
import { cn } from '@/lib/cn';
import { learnTypesForCheck, settingKeysForCheck } from '@/features/learn/related';
import { settingsGuidePath } from '@/features/learn/settingsCatalog';

export function ScoreHero({ report, children }: { report: EvaluationReport; children?: ReactNode }) {
  return (
    <div className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-32 w-32 shrink-0 sm:mx-0" aria-hidden>
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" className="fill-none stroke-slate-200 dark:stroke-slate-800" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            className={cn(
              'fill-none transition-[stroke-dashoffset] duration-700',
              { emerald: 'stroke-emerald-500', indigo: 'stroke-indigo-500', amber: 'stroke-amber-500', rose: 'stroke-rose-500' }[scoreTone(report.score)],
            )}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - report.score / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" data-testid="report-score">
            {report.score}
          </span>
          <span className="text-xs text-slate-500">out of 100</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <p className="sr-only">Score {report.score} out of 100.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <Stars count={report.stars} size="lg" />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold dark:bg-slate-800">
            {report.rating.toFixed(1)} / 5 · {report.ratingLabel}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{report.summary}</p>
        {children}
      </div>
    </div>
  );
}

export function Comparison({ attempt }: { attempt: AttemptDTO }) {
  const prev = attempt.previous;
  if (!prev) return null;
  const delta = attempt.score - prev.score;
  const prevByKey = new Map(prev.categories.map((c) => [c.key, c.score]));
  return (
    <section className="card p-5" aria-labelledby="compare-title">
      <h2 id="compare-title" className="mb-3 text-sm font-semibold">
        Compared with your previous attempt
      </h2>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-slate-500">{prev.score}</span>
        <span aria-hidden>→</span>
        <span className="text-lg font-bold">{attempt.score}</span>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
            delta > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : delta < 0 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800',
          )}
        >
          {delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : delta < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
          {delta > 0 ? '+' : ''}
          {delta}
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {attempt.report.categories
          .filter((c) => c.assessed)
          .map((c) => {
            const before = prevByKey.get(c.key);
            const d = before === undefined ? 0 : c.score - before;
            return (
              <li key={c.key} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">{c.label}</span>
                <span className="tabular-nums">
                  {before ?? '–'} → <strong>{c.score}</strong>
                  {d !== 0 && <span className={cn('ml-1 text-xs', d > 0 ? 'text-emerald-600' : 'text-rose-600')}>({d > 0 ? '+' : ''}{d})</span>}
                </span>
              </li>
            );
          })}
      </ul>
    </section>
  );
}

function CategoryRow({ c }: { c: EvaluationReport['categories'][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="py-3">
      <button type="button" className="w-full text-left" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">
            {c.label} <span className="text-xs font-normal text-slate-400">· weight {c.weight}%</span>
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold tabular-nums">
            {c.assessed ? `${c.score}%` : 'Not assessed'}
            <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
          </span>
        </div>
        {c.assessed && <ProgressBar value={c.score} label={`${c.label} score`} tone={scoreTone(c.score)} />}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          <p>{c.explanation}</p>
          {c.deductions.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {c.deductions.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 font-semibold text-rose-600 tabular-nums">−{d.points}</span>
                  <span>{d.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            c.assessed && c.score === 100 && <p className="mt-1 text-emerald-600">No deductions.</p>
          )}
        </div>
      )}
    </li>
  );
}

const COVERAGE: Record<CoverageStatus, { icon: LucideIcon; cls: string; label: string }> = {
  met: { icon: CircleCheck, cls: 'text-emerald-500', label: 'Covered' },
  partial: { icon: CircleMinus, cls: 'text-amber-500', label: 'Partly covered' },
  unmet: { icon: CircleDashed, cls: 'text-rose-500', label: 'Not covered' },
  'needs-config': { icon: CircleDashed, cls: 'text-indigo-500', label: 'Needs configuration' },
  'not-assessed': { icon: CircleDashed, cls: 'text-slate-400', label: 'Not assessed' },
};

/** Links from a piece of feedback to the guides of the components and settings it is about. */
function LearnLinks({ types, settings = [], className }: { types: string[]; settings?: string[]; className?: string }) {
  if (!types.length && !settings.length) return null;
  return (
    <p className={cn('mt-1.5 flex flex-wrap items-center gap-1.5 text-xs', className)} data-testid="learn-links">
      <span className="inline-flex items-center gap-1 text-slate-500">
        <GraduationCap className="h-3.5 w-3.5" aria-hidden /> Learn:
      </span>
      {types.map((type) => {
        const def = getComponent(type);
        const accent = ACCENTS[def?.accent ?? 'slate']!;
        return (
          <Link
            key={type}
            to={`/learn/${type}`}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white py-0.5 pl-1 pr-2 font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
          >
            <DynamicIcon name={def?.icon ?? 'Box'} className={cn('h-3 w-3', accent.icon)} />
            {def?.label ?? type}
          </Link>
        );
      })}
      {settings.map((key) => (
        <Link
          key={key}
          to={settingsGuidePath({ key })}
          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 py-0.5 pl-1.5 pr-2 font-medium text-emerald-800 hover:border-emerald-300 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          data-testid="learn-setting-link"
        >
          <SlidersHorizontal className="h-3 w-3" aria-hidden />
          Setting: {getPropertyField(key)?.label ?? key}
        </Link>
      ))}
    </p>
  );
}

function FindingList({ title, icon: Icon, items, tone, empty, rubric }: { title: string; icon: LucideIcon; items: Finding[]; tone: string; empty?: string; rubric?: Rubric }) {
  if (!items.length && !empty) return null;
  return (
    <section className="card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className={cn('h-4 w-4', tone)} aria-hidden /> {title}
        {items.length > 0 && <span className="text-xs font-normal text-slate-400">({items.length})</span>}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((f, i) => (
            <li key={i} className="text-sm">
              <p className="font-medium">{f.title}</p>
              <p className="text-slate-600 dark:text-slate-300">{f.detail}</p>
              {f.fix && <p className="mt-1 text-slate-500">→ {f.fix}</p>}
              <LearnLinks types={learnTypesForCheck(rubric, f.checkId)} settings={settingKeysForCheck(rubric, f.checkId)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ReportDetails({ report, question }: { report: EvaluationReport; question?: QuestionDetailDTO }) {
  const t = useExplanation();
  const rubric = question?.rubric;
  const criticalTypes = [...new Set(report.criticalFailures.flatMap((c) => learnTypesForCheck(rubric, c.checkId)))].slice(0, 4);
  const criticalSettings = [...new Set(report.criticalFailures.flatMap((c) => settingKeysForCheck(rubric, c.checkId)))].slice(0, 3);
  return (
    <div className="space-y-6">
      <section className="card p-5" aria-labelledby="breakdown-title">
        <h2 id="breakdown-title" className="text-sm font-semibold">
          Evaluation breakdown
        </h2>
        <p className="text-xs text-slate-500">Click a category to see exactly why points were deducted.</p>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {report.categories.map((c) => (
            <CategoryRow key={c.key} c={c} />
          ))}
        </ul>
        {report.scoreCap !== null && (
          <p className="mt-2 flex gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              Score capped at {report.scoreCap} because a critical capability is missing: {report.criticalFailures.map((c) => c.title).join('; ')}.
              <LearnLinks types={criticalTypes} settings={criticalSettings} />
            </span>
          </p>
        )}
      </section>

      <section className="card p-5" aria-labelledby="coverage-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="coverage-title" className="text-sm font-semibold">
            Requirement coverage <span className="font-normal text-slate-500">· {report.coverage.percent}%</span>
          </h2>
          <LanguageToggle size="xs" />
        </div>
        <ul className="space-y-2">
          {report.requirementCoverage.map((r) => {
            const s = COVERAGE[r.status];
            return (
              <li key={r.id} className="flex gap-2 text-sm">
                <s.icon className={cn('mt-0.5 h-4 w-4 shrink-0', s.cls)} aria-label={s.label} />
                <span>
                  <span className="mr-1 text-xs uppercase text-slate-400">{r.kind === 'functional' ? 'FR' : 'NFR'}</span>
                  {t(r.text)}
                  {r.status !== 'met' && <span className={cn('ml-1 text-xs font-medium', s.cls)}>· {s.label}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-emerald-500" aria-hidden /> Strengths
          </h3>
          {report.strengths.length ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {report.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Strengths will appear as your design covers more requirements.</p>
          )}
        </section>
        <section className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <TriangleAlert className="h-4 w-4 text-amber-500" aria-hidden /> Weaknesses
          </h3>
          {report.weaknesses.length ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {report.weaknesses.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No significant weaknesses found.</p>
          )}
        </section>
      </div>

      <section className="card p-5" aria-labelledby="suggestions-title">
        <h2 id="suggestions-title" className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-indigo-500" aria-hidden /> Suggested improvements
        </h2>
        {report.suggestions.length ? (
          <ol className="space-y-3">
            {report.suggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{i + 1}</span>
                <span>
                  <span className="font-medium">{s.title}</span>
                  {s.impact >= 1 && <span className="ml-2 text-xs text-emerald-600">up to +{Math.round(s.impact)} pts</span>}
                  <span className="block text-slate-600 dark:text-slate-300">{s.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">Nothing major to improve. Compare with the reference to explore alternatives.</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <FindingList rubric={rubric} title="Critical missing connections" icon={Cable} items={report.missingConnections} tone="text-rose-500" empty="All expected flows are connected." />
        <FindingList rubric={rubric} title="Missing components" icon={Puzzle} items={report.missingComponents} tone="text-rose-500" empty="All required capabilities are present." />
        <FindingList rubric={rubric} title="Invalid or suspicious connections" icon={TriangleAlert} items={report.invalidConnections} tone="text-amber-500" empty="No invalid connections found." />
        <FindingList rubric={rubric} title="Scalability & availability: bottlenecks" icon={Gauge} items={report.bottlenecks} tone="text-amber-500" empty="No single points of failure detected on the main path." />
        <FindingList rubric={rubric} title="Security concerns" icon={ShieldAlert} items={report.securityConcerns} tone="text-rose-500" empty="No security concerns detected from the diagram." />
        <FindingList rubric={rubric} title="Unnecessary complexity" icon={Shrink} items={report.unnecessaryComplexity} tone="text-slate-500" empty="The design is focused." />
      </div>
      <p className="text-xs text-slate-500">
        Evaluated with rubric v{report.rubricVersion} · engine {report.engineVersion} · {report.stats.components} components, {report.stats.connections} connections. Some properties (like
        consistency or idempotency) can only be credited when you set them explicitly on components.
      </p>
    </div>
  );
}
