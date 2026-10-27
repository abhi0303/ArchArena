import {
  ArrowLeft,
  ArrowRight,
  Ban,
  ChevronRight,
  CircleCheck,
  Clapperboard,
  Copy,
  Ear,
  Eye,
  GraduationCap,
  Lightbulb,
  ListOrdered,
  MessageSquareQuote,
  MessagesSquare,
  RotateCcw,
  Sparkles,
  Swords,
  Table2,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { ComponentChip, LearnSection, Paragraphs } from '@/features/learn/parts';
import { SceneView } from '@/features/learn/SceneView';
import { cn } from '@/lib/cn';
import { useQuestions } from '@/lib/queries';
import { usePreferences } from '@/stores/preferences';
import { toast } from '@/stores/toast';
import { getPrepCategory, getPrepTopic, questionPath } from './catalog';
import { getPrepQuestion, questionsIn } from './content';
import { CategoryTile, KindBadge, LevelBadge } from './parts';
import { usePrepProgress } from './progress';
import type { PrepQuestion, Text } from './types';

function Callout({ tone, icon, title, children, id }: { tone: 'amber' | 'emerald' | 'rose'; icon: ReactNode; title: string; children: ReactNode; id: string }) {
  const tones = {
    amber: 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/25',
    emerald: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/25',
    rose: 'border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/25',
  };
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('scroll-mt-20 rounded-xl border p-4 sm:p-5', tones[tone])}>
      <h2 id={`${id}-title`} className="mb-2 flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function InterviewAnswer({ q }: { q: PrepQuestion }) {
  const language = usePreferences((s) => s.language);
  const [showHinglish, setShowHinglish] = useState(false);
  const copy = async () => {
    const text = [q.interview.opening.en, '', ...q.interview.points.map((p) => `• ${p.en}`), '', `Keywords: ${q.interview.keywords.join(', ')}`].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Answer copied', 'Paste it into your notes.');
    } catch {
      toast.error('Could not copy', 'Your browser blocked clipboard access.');
    }
  };
  return (
    <section
      id="interview"
      aria-labelledby="interview-title"
      className="scroll-mt-20 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 sm:p-6 dark:border-indigo-900/60 dark:bg-indigo-950/25"
      data-testid="prep-interview-answer"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="interview-title" className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquareQuote className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden /> Interview-ready answer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Point-to-point, with the terms interviewers expect. Interviews are usually in English, so this part stays in English.</p>
        </div>
        <Button variant="outline" size="sm" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => void copy()}>
          Copy
        </Button>
      </div>
      <p className="mb-3 font-medium leading-relaxed text-slate-900 dark:text-slate-100">{q.interview.opening.en}</p>
      <ol className="space-y-2">
        {q.interview.points.map((p, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">{i + 1}</span>
            {p.en}
          </li>
        ))}
      </ol>
      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Keywords to use</p>
      <ul className="flex flex-wrap gap-1.5" data-testid="prep-keywords">
        {q.interview.keywords.map((k) => (
          <li key={k} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-indigo-800 ring-1 ring-indigo-200 dark:bg-slate-900 dark:text-indigo-200 dark:ring-indigo-900">
            {k}
          </li>
        ))}
      </ul>
      {language === 'hinglish' && (
        <div className="mt-4 border-t border-indigo-200 pt-3 dark:border-indigo-900/60">
          <button type="button" className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-300" aria-expanded={showHinglish} onClick={() => setShowHinglish((v) => !v)}>
            {showHinglish ? 'Hinglish wala version chhupao' : 'Hinglish mein samjho'}
          </button>
          {showHinglish && (
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <p className="font-medium">{q.interview.opening.hi}</p>
              <ul className="list-disc space-y-1 pl-5">
                {q.interview.points.map((p, i) => (
                  <li key={i}>{p.hi}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SelfCheck({ id }: { id: string }) {
  const status = usePrepProgress((s) => s.status[id]);
  const setStatus = usePrepProgress((s) => s.setStatus);
  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" data-testid="prep-self-check">
      <div>
        <p className="font-semibold">How did you do?</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Mark it so you know what to revise. Saved in this browser.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={status === 'known' ? 'primary' : 'outline'}
          size="sm"
          icon={<CircleCheck className="h-4 w-4" />}
          aria-pressed={status === 'known'}
          onClick={() => setStatus(id, status === 'known' ? null : 'known')}
          data-testid="prep-mark-known"
        >
          I knew this
        </Button>
        <Button
          variant={status === 'revise' ? 'primary' : 'outline'}
          size="sm"
          icon={<RotateCcw className="h-4 w-4" />}
          aria-pressed={status === 'revise'}
          onClick={() => setStatus(id, status === 'revise' ? null : 'revise')}
          data-testid="prep-mark-revise"
        >
          Revise later
        </Button>
      </div>
    </div>
  );
}

function Answer({ q }: { q: PrepQuestion }) {
  const t = useExplanation();
  const txt = (v: Text) => (typeof v === 'string' ? v : t(v));
  const { data: challenges } = useQuestions();
  const challengeTitle = (slug: string) => challenges?.find((c) => c.slug === slug)?.title ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const related = q.related ?? {};
  const hasRelated = !!(related.components?.length || related.challenges?.length);

  return (
    <div className="space-y-8">
      {q.scenario && (
        <Callout id="scenario" tone="amber" icon={<Clapperboard className="h-4 w-4 text-amber-600" aria-hidden />} title="The scenario, explained">
          <Paragraphs text={t(q.scenario)} />
        </Callout>
      )}

      <LearnSection id="simple" icon={<Sparkles className="h-4 w-4" />} title="In simple words">
        <Paragraphs text={t(q.simple)} className="text-base" />
      </LearnSection>

      <Callout id="example" tone="amber" icon={<Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />} title="Real-life example">
        <Paragraphs text={t(q.example)} />
      </Callout>

      {(q.why || q.without) && (
        <div className="grid gap-4 md:grid-cols-2">
          {q.why && (
            <Callout id="why" tone="emerald" icon={<CircleCheck className="h-4 w-4 text-emerald-600" aria-hidden />} title="Why we need it">
              <Paragraphs text={t(q.why)} />
            </Callout>
          )}
          {q.without && (
            <Callout id="without" tone="rose" icon={<TriangleAlert className="h-4 w-4 text-rose-500" aria-hidden />} title="What happens without it">
              <Paragraphs text={t(q.without)} />
            </Callout>
          )}
        </div>
      )}

      {q.scene && <SceneView scene={q.scene} />}

      {q.parts && q.parts.length > 0 && (
        <LearnSection id="details" icon={<ListOrdered className="h-4 w-4" />} title={q.partsTitle ? t(q.partsTitle) : 'In detail'}>
          <ol className="space-y-3">
            {q.parts.map((p, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-1 font-semibold">{txt(p.title)}</p>
                <Paragraphs text={t(p.text)} className="text-sm" />
              </li>
            ))}
          </ol>
        </LearnSection>
      )}

      {q.table && (
        <LearnSection id="table" icon={<Table2 className="h-4 w-4" />} title="At a glance">
          <div className="scrollbar-thin overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {q.table.columns.map((c, i) => (
                    <th key={i} scope="col" className="px-3 py-2 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.table.rows.map((row, r) => (
                  <tr key={r} className="border-t border-slate-200 align-top dark:border-slate-800">
                    {row.map((cell, i) =>
                      i === 0 ? (
                        <th key={i} scope="row" className="px-3 py-2 font-medium">
                          {txt(cell)}
                        </th>
                      ) : (
                        <td key={i} className="px-3 py-2 text-slate-600 dark:text-slate-300">
                          {txt(cell)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LearnSection>
      )}

      <InterviewAnswer q={q} />

      <LearnSection id="listen" icon={<Ear className="h-4 w-4" />} title="What the interviewer listens for">
        <ul className="space-y-2">
          {q.listenFor.map((l, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <Ear className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" aria-hidden />
              {t(l)}
            </li>
          ))}
        </ul>
      </LearnSection>

      {q.mistakes && q.mistakes.length > 0 && (
        <LearnSection id="mistakes" icon={<Ban className="h-4 w-4 text-rose-500" />} title="Common mistakes">
          <ul className="space-y-2">
            {q.mistakes.map((m, i) => (
              <li key={i} className="flex gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden />
                {t(m)}
              </li>
            ))}
          </ul>
        </LearnSection>
      )}

      {q.followUps && q.followUps.length > 0 && (
        <LearnSection id="followups" icon={<MessagesSquare className="h-4 w-4" />} title="Likely follow-up questions">
          <div className="space-y-2">
            {q.followUps.map((f, i) => (
              <details key={i} className="group rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" data-testid="prep-follow-up">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {t(f.q)}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" aria-hidden />
                </summary>
                <p className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">{t(f.a)}</p>
              </details>
            ))}
          </div>
        </LearnSection>
      )}

      {hasRelated && (
        <LearnSection id="related" icon={<GraduationCap className="h-4 w-4" />} title="Go deeper">
          {related.components && related.components.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">Component guides in the Learn tab:</p>
              <ul className="flex flex-wrap gap-1.5">
                {related.components.map((type) => (
                  <li key={type}>
                    <ComponentChip type={type} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {related.challenges && related.challenges.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">Practise it in a challenge:</p>
              <ul className="flex flex-wrap gap-1.5">
                {related.challenges.map((slug) => (
                  <li key={slug}>
                    <Link
                      to={`/challenges/${slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                    >
                      <Swords className="h-3 w-3" aria-hidden /> {challengeTitle(slug)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </LearnSection>
      )}
    </div>
  );
}

const SECTIONS: { id: string; label: string; show: (q: PrepQuestion) => boolean }[] = [
  { id: 'scenario', label: 'Scenario', show: (q) => !!q.scenario },
  { id: 'simple', label: 'Simple words', show: () => true },
  { id: 'example', label: 'Example', show: () => true },
  { id: 'why', label: 'Why', show: (q) => !!q.why },
  { id: 'details', label: 'In detail', show: (q) => !!q.parts?.length },
  { id: 'table', label: 'At a glance', show: (q) => !!q.table },
  { id: 'interview', label: 'Interview answer', show: () => true },
  { id: 'listen', label: 'Listens for', show: () => true },
  { id: 'followups', label: 'Follow-ups', show: (q) => !!q.followUps?.length },
];

function QuestionView({ q }: { q: PrepQuestion }) {
  const t = useExplanation();
  const language = usePreferences((s) => s.language);
  const practiceMode = usePrepProgress((s) => s.practiceMode);
  const setPracticeMode = usePrepProgress((s) => s.setPracticeMode);
  const [revealed, setRevealed] = useState(false);
  const category = getPrepCategory(q.category)!;
  const topic = getPrepTopic(q.category, q.topic);
  const siblings = questionsIn(q.category);
  const index = siblings.findIndex((x) => x.id === q.id);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];
  const hidden = practiceMode && !revealed;

  useEffect(() => {
    document.title = `${q.question.en} — Interview Prep · HLD Arena`;
  }, [q]);

  return (
    <article className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/prep" className="hover:text-slate-900 hover:underline dark:hover:text-white">
          Interview Prep
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link to={`/prep/${category.id}`} className="hover:text-slate-900 hover:underline dark:hover:text-white">
          {category.title}
        </Link>
        {topic && (
          <>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <Link to={`/prep/${category.id}?topic=${topic.id}`} className="hover:text-slate-900 hover:underline dark:hover:text-white">
              {topic.title}
            </Link>
          </>
        )}
      </nav>

      <header className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CategoryTile id={category.id} size="sm" />
          <KindBadge kind={q.kind} />
          <LevelBadge level={q.level} />
        </div>
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl" data-testid="prep-question-title">
          {t(q.question)}
        </h1>
        {language === 'hinglish' && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">In the interview: “{q.question.en}”</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <LanguageToggle size="xs" />
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600" checked={practiceMode} onChange={(e) => setPracticeMode(e.target.checked)} data-testid="prep-practice-mode" />
            Practice mode: answer first, then check
          </label>
        </div>
      </header>

      {hidden ? (
        <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 p-6 text-center dark:border-indigo-800 dark:bg-indigo-950/20" data-testid="prep-practice-card">
          <p className="text-lg font-semibold">Your turn first</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t({
              en: 'Say your answer out loud or jot it down: start with a one-line answer, add three to five key points, then a real example. Then reveal the answer and compare.',
              hi: 'Apna jawab bol ke ya likh ke do: ek line ke jawab se shuru karo, teen se paanch key points jodo, phir ek asli example. Phir answer kholo aur compare karo.',
            })}
          </p>
          <Button className="mt-4" icon={<Eye className="h-4 w-4" />} onClick={() => setRevealed(true)} data-testid="prep-reveal">
            Show the answer
          </Button>
        </div>
      ) : (
        <>
          <nav aria-label="Jump to" className="scrollbar-thin -mx-4 mb-8 flex gap-1.5 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {SECTIONS.filter((s) => s.show(q)).map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <Answer q={q} />
        </>
      )}

      <div className="mt-10 space-y-6">
        <SelfCheck id={q.id} />
        <nav aria-label="More questions" className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link to={questionPath(prev)} className="card flex items-center gap-3 p-4 hover:shadow-md">
              <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <span className="min-w-0">
                <span className="block text-xs text-slate-500">Previous</span>
                <span className="line-clamp-2 block text-sm font-medium">{t(prev.question)}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={questionPath(next)} className="card flex items-center justify-end gap-3 p-4 text-right hover:shadow-md" data-testid="prep-next">
              <span className="min-w-0">
                <span className="block text-xs text-slate-500">Next</span>
                <span className="line-clamp-2 block text-sm font-medium">{t(next.question)}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}

export default function PrepQuestionPage() {
  const { category = '', questionId = '' } = useParams();
  const q = getPrepQuestion(questionId);
  if (!q || q.category !== category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Question not found"
          description="It may have moved to another category."
          action={
            <ButtonLink to="/prep" variant="outline">
              Back to Interview Prep
            </ButtonLink>
          }
        />
      </div>
    );
  }
  // A fresh view per question resets “Show the answer” in practice mode.
  return <QuestionView key={q.id} q={q} />;
}
