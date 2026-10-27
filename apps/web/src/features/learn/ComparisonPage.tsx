import { ArrowRight, BookOpenCheck, ChevronRight, CircleCheck, CircleHelp, CircleX, Eye, Handshake, Quote, Shuffle, Table2, Target, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { getComparison, getGuide } from './content';
import { ActorIcon, ComponentTile, LearnSection, Paragraphs, componentLabel } from './parts';
import { SceneView } from './SceneView';
import type { Comparison, Text } from './types';
import { InlineText } from '@/features/glossary/InlineText';

function Quiz({ comparison }: { comparison: Comparison }) {
  const t = useExplanation();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answered = Object.keys(answers).length;
  const correct = comparison.quiz.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="space-y-4">
      {comparison.quiz.map((q, i) => {
        const chosen = answers[i];
        return (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" data-testid="quiz-question">
            <p className="font-medium leading-relaxed">
              <span className="mr-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">Q{i + 1}.</span>
              {t(q.scenario)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`Answer question ${i + 1}`}>
              {comparison.types.map((type) => {
                const isChosen = chosen === type;
                const isAnswer = q.answer === type;
                return (
                  <button
                    key={type}
                    disabled={!!chosen}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: type }))}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-default',
                      !chosen && 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40',
                      chosen && isAnswer && 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
                      chosen && isChosen && !isAnswer && 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
                      chosen && !isChosen && !isAnswer && 'border-slate-200 opacity-50 dark:border-slate-800',
                    )}
                  >
                    <ComponentTile type={type} size="sm" />
                    {componentLabel(type)}
                    {chosen && isAnswer && <CircleCheck className="h-4 w-4 text-emerald-600" aria-label="Correct answer" />}
                    {chosen && isChosen && !isAnswer && <CircleX className="h-4 w-4 text-rose-500" aria-label="Your answer" />}
                  </button>
                );
              })}
            </div>
            {chosen && (
              <p
                role="status"
                className={cn(
                  'mt-3 rounded-lg p-3 text-sm leading-relaxed',
                  chosen === q.answer ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' : 'bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100',
                )}
              >
                <strong>{chosen === q.answer ? 'Correct! ' : `Not quite — it’s ${componentLabel(q.answer)}. `}</strong>
                {t(q.why)}
              </p>
            )}
          </div>
        );
      })}
      {answered === comparison.quiz.length && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
          <p className="font-semibold text-indigo-900 dark:text-indigo-100" data-testid="quiz-score">
            You got {correct} of {comparison.quiz.length} right{correct === comparison.quiz.length ? ' — you can tell them apart!' : '.'}
          </p>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-300" onClick={() => setAnswers({})}>
            <Shuffle className="h-4 w-4" aria-hidden /> Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default function ComparisonPage() {
  const { slug = '' } = useParams();
  const comparison = getComparison(slug);
  const t = useExplanation();
  const txt = (v: Text) => (typeof v === 'string' ? v : t(v));
  const title = comparison ? comparison.types.map(componentLabel).join(' vs ') : '';

  useEffect(() => {
    if (title) document.title = `${title} — Learn · HLD Arena`;
  }, [title]);

  if (!comparison) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Comparison not found"
          action={
            <ButtonLink to="/learn" variant="outline">
              Back to Learn
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const cols = comparison.types.length;

  return (
    <article className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/learn" className="hover:text-slate-900 hover:underline dark:hover:text-white">
          Learn
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span>Commonly confused</span>
      </nav>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex -space-x-2">
            {comparison.types.map((type) => (
              <ComponentTile key={type} type={type} size="lg" className="ring-2 ring-white dark:ring-slate-950" />
            ))}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        </div>
        <div className="shrink-0">
          <LanguageToggle size="xs" />
        </div>
      </header>

      <div className="space-y-10">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-100">
              <CircleHelp className="h-5 w-5" aria-hidden /> Why people mix them up
            </h2>
            <Paragraphs text={t(comparison.confusion)} />
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/30">
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-sky-950 dark:text-sky-100">
              <Handshake className="h-5 w-5" aria-hidden /> What they really share
            </h2>
            <Paragraphs text={t(comparison.common)} />
          </div>
        </div>

        <LearnSection id="story" icon={<Users className="h-4 w-4" />} title="One story, different jobs">
          <Paragraphs text={t(comparison.story.setting)} className="mb-4" />
          <ul className={cn('grid gap-3', cols >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2')}>
            {comparison.story.roles.map((r) => (
              <li key={r.type} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" aria-hidden>
                    <ActorIcon name={r.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-semibold">{componentLabel(r.type)}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <InlineText text={t(r.role)} />
                </p>
              </li>
            ))}
          </ul>
        </LearnSection>

        <LearnSection id="see" icon={<Eye className="h-4 w-4" />} title="See each one at work">
          <div className={cn('grid gap-4', cols >= 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2')}>
            {comparison.types.map((type) => {
              const guide = getGuide(type);
              if (!guide) return null;
              return (
                <div key={type}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <ComponentTile type={type} size="sm" /> {componentLabel(type)}
                  </h3>
                  <SceneView scene={guide.after} variant="after" />
                </div>
              );
            })}
          </div>
        </LearnSection>

        <LearnSection id="table" icon={<Table2 className="h-4 w-4" />} title="Side by side">
          {/* Wide screens: a real table. */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th scope="col" className="w-1/4 px-4 py-3 font-semibold text-slate-500">
                    Feature
                  </th>
                  {comparison.types.map((type) => (
                    <th key={type} scope="col" className="px-4 py-3 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <ComponentTile type={type} size="sm" /> {componentLabel(type)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                {comparison.rows.map((row, i) => (
                  <tr key={i}>
                    <th scope="row" className="px-4 py-3 align-top font-medium text-slate-700 dark:text-slate-200">
                      {txt(row.feature)}
                    </th>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-4 py-3 align-top leading-relaxed text-slate-700 dark:text-slate-300">
                        {txt(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Phones: one card per feature, so nothing scrolls sideways. */}
          <ul className="space-y-3 md:hidden">
            {comparison.rows.map((row, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-2 font-semibold">{txt(row.feature)}</p>
                <dl className="space-y-2">
                  {row.values.map((v, j) => (
                    <div key={j} className="flex gap-2 text-sm">
                      <dt className="flex w-32 shrink-0 items-start gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                        <ComponentTile type={comparison.types[j]!} size="sm" className="h-5 w-5 rounded [&_svg]:h-3 [&_svg]:w-3" />
                        <span className="leading-tight">{componentLabel(comparison.types[j]!)}</span>
                      </dt>
                      <dd className="min-w-0 leading-relaxed text-slate-700 dark:text-slate-300">{txt(v)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </LearnSection>

        <LearnSection id="pick" icon={<Target className="h-4 w-4" />} title="Pick it when…">
          <div className={cn('grid gap-3', cols >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2')}>
            {comparison.pickWhen.map((p) => (
              <div key={p.type} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <ComponentTile type={p.type} size="sm" /> {componentLabel(p.type)}
                </h3>
                <ul className="space-y-2">
                  {p.points.map((pt, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                      {t(pt)}
                    </li>
                  ))}
                </ul>
                <Link to={`/learn/${p.type}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  <BookOpenCheck className="h-3.5 w-3.5" aria-hidden /> Full guide
                </Link>
              </div>
            ))}
          </div>
        </LearnSection>

        <figure className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
          <Quote className="mb-2 h-6 w-6 opacity-70" aria-hidden />
          <blockquote className="text-lg font-medium leading-relaxed">{t(comparison.rule)}</blockquote>
          <figcaption className="mt-2 text-sm text-indigo-100">Rule of thumb</figcaption>
        </figure>

        <LearnSection id="quiz" icon={<CircleHelp className="h-4 w-4" />} title="Which one would you pick?">
          <Quiz comparison={comparison} />
        </LearnSection>

        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink to="/learn" variant="outline">
            All guides
          </ButtonLink>
          <ButtonLink to="/challenges" icon={<ArrowRight className="h-4 w-4" />}>
            Practice with challenges
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
