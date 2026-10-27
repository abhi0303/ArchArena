import { ChevronRight, Inbox } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { LanguageToggle, useExplanation } from '@/components/LanguageToggle';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { getPrepCategory, type PrepTopic } from './catalog';
import { questionsIn } from './content';
import { CategoryTile, QuestionCard } from './parts';
import { usePrepProgress } from './progress';
import type { PrepQuestion } from './types';

const FILTERS = { topic: 'all', status: 'all' };

const STATUS_OPTIONS = [
  { value: 'all', label: 'All questions' },
  { value: 'new', label: 'Not marked yet' },
  { value: 'known', label: 'Known' },
  { value: 'revise', label: 'Revise later' },
];

function TopicList({ topic, questions, start }: { topic: PrepTopic; questions: PrepQuestion[]; start: number }) {
  const t = useExplanation();
  return (
    <section aria-labelledby={`topic-${topic.id}`} data-testid="prep-topic">
      <h2 id={`topic-${topic.id}`} className="text-lg font-semibold">
        {topic.title} <span className="text-sm font-normal text-slate-500">({questions.length})</span>
      </h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t(topic.description)}</p>
      {questions.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title={`No ${topic.title} questions yet`}
          description="This section is ready — questions will appear here as they are added."
          className="py-6"
        />
      ) : (
        <ol className="grid gap-3 lg:grid-cols-2">
          {questions.map((q, i) => (
            <li key={q.id}>
              <QuestionCard q={q} index={start + i} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function PrepCategoryPage() {
  const { category: categoryId = '' } = useParams();
  const category = getPrepCategory(categoryId);
  const t = useExplanation();
  const [{ topic, status: statusFilter }, setFilters] = useUrlFilters(FILTERS);
  const progress = usePrepProgress((s) => s.status);

  useEffect(() => {
    if (category) document.title = `${category.title} — Interview Prep · HLD Arena`;
  }, [category]);

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Category not found"
          description="This interview prep category does not exist."
          action={
            <ButtonLink to="/prep" variant="outline">
              Back to Interview Prep
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const matchesStatus = (q: PrepQuestion) => {
    const s = progress[q.id];
    return statusFilter === 'all' || (statusFilter === 'new' ? !s : s === statusFilter);
  };
  const all = questionsIn(category.id);
  const topics = category.topics.filter((tp) => topic === 'all' || tp.id === topic);
  let counter = 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/prep" className="hover:text-slate-900 hover:underline dark:hover:text-white">
          Interview Prep
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-slate-700 dark:text-slate-200">{category.title}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <CategoryTile id={category.id} size="lg" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{category.title}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{t(category.description)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {all.length} question{all.length === 1 ? '' : 's'} in {category.topics.length} sections
            </p>
          </div>
        </div>
        <LanguageToggle size="xs" />
      </header>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Sections">
          {[{ id: 'all', title: 'All sections' }, ...category.topics].map((tp) => {
            const n = tp.id === 'all' ? all.length : questionsIn(category.id, tp.id).length;
            return (
              <button
                key={tp.id}
                type="button"
                onClick={() => setFilters({ topic: tp.id })}
                aria-pressed={topic === tp.id}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-sm font-medium',
                  topic === tp.id
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                )}
                data-testid={`prep-topic-${tp.id}`}
              >
                {tp.title} <span className={topic === tp.id ? 'text-indigo-200' : 'text-slate-400'}>{n}</span>
              </button>
            );
          })}
        </div>
        <label className="block shrink-0 sm:w-48">
          <span className="sr-only">Filter by your progress</span>
          <select className="input" value={statusFilter} onChange={(e) => setFilters({ status: e.target.value })} data-testid="prep-status-filter">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-10">
        {topics.map((tp) => {
          const questions = questionsIn(category.id, tp.id).filter(matchesStatus);
          const start = counter;
          counter += questions.length;
          if (!questions.length && statusFilter !== 'all') return null;
          return <TopicList key={tp.id} topic={tp} questions={questions} start={start} />;
        })}
        {statusFilter !== 'all' && topics.every((tp) => !questionsIn(category.id, tp.id).some(matchesStatus)) && (
          <EmptyState title="Nothing here" description="No questions match this progress filter." />
        )}
      </div>
    </div>
  );
}
