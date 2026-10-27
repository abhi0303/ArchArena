import { ArrowRight, BriefcaseBusiness, Code, Ear, ListOrdered, MessageSquareQuote, MessagesSquare, RotateCcw, Search, SearchX, Zap } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { EmptyState } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { PREP_CATEGORIES } from './catalog';
import { PREP_QUESTIONS, prepSearchText, questionsIn } from './content';
import { CategoryTile, QuestionCard } from './parts';
import { usePrepProgress } from './progress';

const FILTERS = { q: '' };

/** The parts every answer is explained in — shown so learners know what to expect. */
const ANSWER_PARTS = [
  { icon: Zap, label: 'Short answer' },
  { icon: ListOrdered, label: 'Explained in numbered parts' },
  { icon: Code, label: 'Real examples: code, tables, commands' },
  { icon: MessageSquareQuote, label: 'Interview-ready answer + keywords' },
  { icon: Ear, label: 'What the interviewer listens for' },
  { icon: MessagesSquare, label: 'Follow-up questions' },
];

export default function PrepHomePage() {
  const t = useExplanation();
  const [{ q }, setFilters] = useUrlFilters(FILTERS);
  const status = usePrepProgress((s) => s.status);

  useEffect(() => {
    document.title = 'Interview Prep · HLD Arena';
  }, []);

  const index = useMemo(() => new Map(PREP_QUESTIONS.map((x) => [x.id, prepSearchText(x)])), []);
  const needle = q.trim().toLowerCase();
  const results = needle ? PREP_QUESTIONS.filter((x) => needle.split(/\s+/).every((w) => index.get(x.id)?.includes(w))) : [];

  const total = PREP_QUESTIONS.length;
  const known = PREP_QUESTIONS.filter((x) => status[x.id] === 'known').length;
  const revise = PREP_QUESTIONS.filter((x) => status[x.id] === 'revise');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden /> Interview Prep
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Prepare for interviews, one question at a time</h1>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            {t({
              en: 'Real interview questions, grouped by topic. Every answer is simple, informative and straight to the point: a short answer first, then numbered parts with concrete examples — endpoints, JSON, code, commands, tables — and finally an interview-ready answer you can say out loud, with the keywords interviewers listen for. Use it to prepare, to learn, or to clear a doubt.',
              hi: 'Asli interview questions, topic ke hisaab se. Har jawab simple, kaam ka aur seedha point pe hai: pehle short answer, phir thos examples ke saath numbered parts — endpoints, JSON, code, commands, tables — aur aakhir mein ek interview-ready answer jo aap bol sako, un keywords ke saath jo interviewer sunna chahte hain. Ise tayyari, seekhne, ya koi doubt clear karne ke liye use karo.',
            })}
          </p>
        </div>
        <LanguageToggle size="xs" />
      </header>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="card p-4">
          <label className="relative block">
            <span className="sr-only">Search questions</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              className="input pl-9"
              placeholder="Search: cache, JWT, kubernetes, retry…"
              value={q}
              onChange={(e) => setFilters({ q: e.target.value })}
              data-testid="prep-search"
            />
          </label>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">Every answer is explained in parts</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {ANSWER_PARTS.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4" data-testid="prep-progress">
          <p className="text-sm font-semibold">Your progress</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Saved in this browser. Mark questions as “I knew this” or “Revise later”.</p>
          <ProgressBar value={known} max={Math.max(total, 1)} label="Questions you know" tone="emerald" className="mt-3" />
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span>
              <strong className="tabular-nums">{known}</strong> of {total} known
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              <strong className="tabular-nums">{revise.length}</strong> to revise
            </span>
          </p>
        </div>
      </div>

      {needle ? (
        <section aria-labelledby="results-title">
          <h2 id="results-title" className="mb-3 text-lg font-semibold">
            Results <span className="text-sm font-normal text-slate-500">({results.length})</span>
          </h2>
          {results.length === 0 ? (
            <EmptyState icon={<SearchX className="h-6 w-6" />} title="No matching questions" description="Try another word, such as “database”, “token” or “deploy”." />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {results.map((x) => (
                <li key={x.id}>
                  <QuestionCard q={x} showCategory />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {revise.length > 0 && (
            <section aria-labelledby="revise-title" className="mb-10">
              <h2 id="revise-title" className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <RotateCcw className="h-5 w-5 text-amber-500" aria-hidden /> Revise later
              </h2>
              <ul className="grid gap-3 md:grid-cols-2" data-testid="prep-revise-list">
                {revise.map((x) => (
                  <li key={x.id}>
                    <QuestionCard q={x} showCategory />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="categories-title">
            <h2 id="categories-title" className="mb-3 text-lg font-semibold">
              Categories
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="prep-categories">
              {PREP_CATEGORIES.map((cat) => {
                const all = questionsIn(cat.id);
                const knownHere = all.filter((x) => status[x.id] === 'known').length;
                return (
                  <li key={cat.id} className="card flex flex-col p-4">
                    <Link to={`/prep/${cat.id}`} className="group flex items-start gap-3">
                      <CategoryTile id={cat.id} />
                      <span className="min-w-0">
                        <span className="block font-semibold leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{cat.title}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {all.length} question{all.length === 1 ? '' : 's'}
                          {all.length > 0 && ` · ${knownHere} known`}
                        </span>
                      </span>
                    </Link>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(cat.description)}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {cat.topics.map((topic) => {
                        const n = questionsIn(cat.id, topic.id).length;
                        return (
                          <li key={topic.id}>
                            <Link
                              to={`/prep/${cat.id}?topic=${topic.id}`}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                            >
                              {topic.title}
                              <span className={n ? 'text-slate-400' : 'text-slate-300 dark:text-slate-600'}>{n}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <Link to={`/prep/${cat.id}`} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                      Open {cat.title} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
