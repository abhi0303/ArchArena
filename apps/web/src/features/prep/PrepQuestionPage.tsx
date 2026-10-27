import { ArrowLeft, ArrowRight, Ban, ChevronRight, CircleCheck, Copy, Ear, Eye, GraduationCap, MessageSquareQuote, MessagesSquare, RotateCcw, Swords, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { ComponentChip } from '@/features/learn/parts';
import { useQuestions } from '@/lib/queries';
import { usePreferences } from '@/stores/preferences';
import { toast } from '@/stores/toast';
import { Blocks, RichText } from './Blocks';
import { getPrepCategory, getPrepTopic, questionPath } from './catalog';
import { getPrepQuestion, questionsIn } from './content';
import { CategoryTile, KindBadge, LevelBadge } from './parts';
import { usePrepProgress } from './progress';
import type { PrepQuestion } from './types';
import { useText } from './useText';
import { GlossarySkip } from '@/features/glossary/InlineText';
import { termIdsIn } from '@/features/glossary';

const sectionId = (i: number) => `part-${i + 1}`;

function InterviewAnswer({ q }: { q: PrepQuestion }) {
  const language = usePreferences((s) => s.language);
  const [showHinglish, setShowHinglish] = useState(false);
  const copy = async () => {
    const text = [...q.interview.text.map((p) => p.en), '', `Keywords: ${q.interview.keywords.join(', ')}`].join('\n\n');
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
          <p className="text-xs text-slate-500 dark:text-slate-400">Say it like this, in your own words. Interviews are usually in English, so this part stays in English.</p>
        </div>
        <Button variant="outline" size="sm" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => void copy()}>
          Copy
        </Button>
      </div>
      <div className="space-y-3 border-l-4 border-indigo-400 pl-4 leading-relaxed text-slate-800 dark:border-indigo-600 dark:text-slate-200">
        {q.interview.text.map((para, i) => (
          <p key={i}>
            <RichText text={para.en} />
          </p>
        ))}
      </div>
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
              {q.interview.text.map((para, i) => (
                <p key={i}>
                  <RichText text={para.hi} />
                </p>
              ))}
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
  const txt = useText();
  const { data: challenges } = useQuestions();
  const challengeTitle = (slug: string) => challenges?.find((c) => c.slug === slug)?.title ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const related = q.related ?? {};
  const hasRelated = !!(related.components?.length || related.challenges?.length);

  return (
    <div className="space-y-10">
      {q.sections.map((s, i) => (
        <section key={i} id={sectionId(i)} aria-labelledby={`${sectionId(i)}-title`} className="scroll-mt-20" data-testid="prep-section">
          <h2 id={`${sectionId(i)}-title`} className="mb-4 flex items-start gap-3 text-xl font-semibold tracking-tight">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">{i + 1}</span>
            <span>
              <RichText text={txt(s.title)} />
            </span>
          </h2>
          <Blocks blocks={s.blocks} />
        </section>
      ))}

      <InterviewAnswer q={q} />

      <div className="grid gap-4 md:grid-cols-2">
        <section id="listen" aria-labelledby="listen-title" className="card scroll-mt-20 p-4">
          <h2 id="listen-title" className="mb-2 flex items-center gap-2 font-semibold">
            <Ear className="h-4 w-4 text-indigo-500" aria-hidden /> What the interviewer listens for
          </h2>
          <ul className="space-y-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {q.listenFor.map((l, i) => (
              <li key={i} className="flex gap-2">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                <span>
                  <RichText text={t(l)} />
                </span>
              </li>
            ))}
          </ul>
        </section>
        {q.mistakes && q.mistakes.length > 0 && (
          <section id="mistakes" aria-labelledby="mistakes-title" className="card scroll-mt-20 p-4">
            <h2 id="mistakes-title" className="mb-2 flex items-center gap-2 font-semibold">
              <Ban className="h-4 w-4 text-rose-500" aria-hidden /> Common mistakes
            </h2>
            <ul className="space-y-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {q.mistakes.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <Ban className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden />
                  <span>
                    <RichText text={t(m)} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {q.followUps && q.followUps.length > 0 && (
        <section id="followups" aria-labelledby="followups-title" className="scroll-mt-20">
          <h2 id="followups-title" className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <MessagesSquare className="h-5 w-5 text-slate-500" aria-hidden /> Follow-up questions to prepare
          </h2>
          <div className="space-y-2">
            {q.followUps.map((f, i) => (
              <details key={i} className="group rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" data-testid="prep-follow-up">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {t(f.q)}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" aria-hidden />
                </summary>
                <p className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  <RichText text={t(f.a)} />
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {hasRelated && (
        <section aria-labelledby="related-title">
          <h2 id="related-title" className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <GraduationCap className="h-5 w-5 text-slate-500" aria-hidden /> Go deeper
          </h2>
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
        </section>
      )}
    </div>
  );
}

function QuestionView({ q }: { q: PrepQuestion }) {
  const t = useExplanation();
  const txt = useText();
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

  // Deep links such as #part-2 or #interview: scroll once the answer is rendered.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash || hidden) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    const frame = requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [hash, hidden]);

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
              en: 'Say your answer out loud or jot it down: start with a one-line answer, add three to five key points, then a concrete example. Then reveal the answer and compare.',
              hi: 'Apna jawab bol ke ya likh ke do: ek line ke jawab se shuru karo, teen se paanch key points jodo, phir ek thos example. Phir answer kholo aur compare karo.',
            })}
          </p>
          <Button className="mt-4" icon={<Eye className="h-4 w-4" />} onClick={() => setRevealed(true)} data-testid="prep-reveal">
            Show the answer
          </Button>
        </div>
      ) : (
        <>
          <section aria-labelledby="short-answer-title" className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900" data-testid="prep-short-answer">
            <h2 id="short-answer-title" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              <Zap className="h-3.5 w-3.5" aria-hidden /> Short answer
            </h2>
            <p className="text-[17px] leading-relaxed text-slate-800 dark:text-slate-200">
              <RichText text={t(q.answer)} />
            </p>
          </section>

          <nav aria-label="Jump to" className="scrollbar-thin -mx-4 mb-8 flex gap-1.5 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {[
              ...q.sections.map((s, i) => ({ id: sectionId(i), label: `${i + 1}. ${txt(s.title)}` })),
              { id: 'interview', label: 'Interview answer' },
              ...(q.followUps?.length ? [{ id: 'followups', label: 'Follow-ups' }] : []),
            ].map((s) => (
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
  // A fresh view per question resets “Show the answer” in practice mode. Terms named in the
  // question itself are what the whole answer explains, so they are not underlined.
  return (
    <GlossarySkip ids={termIdsIn(q.question.en)}>
      <QuestionView key={q.id} q={q} />
    </GlossarySkip>
  );
}
