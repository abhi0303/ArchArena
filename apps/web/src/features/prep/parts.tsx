import { ChevronRight, CircleCheck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';
import { ACCENTS } from '@/components/icons';
import { useExplanation } from '@/components/LanguageToggle';
import { cn } from '@/lib/cn';
import { KIND_LABEL, LEVEL_LABEL, getPrepCategory, getPrepTopic, questionPath } from './catalog';
import { usePrepProgress, type PrepStatus } from './progress';
import type { PrepKind, PrepLevel, PrepQuestion } from './types';

/** The coloured icon tile of a category. */
export function CategoryTile({ id, size = 'md', className }: { id: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const cat = getPrepCategory(id);
  if (!cat) return null;
  const accent = ACCENTS[cat.accent] ?? ACCENTS.slate!;
  const box = size === 'sm' ? 'h-7 w-7 rounded-md' : size === 'md' ? 'h-10 w-10 rounded-lg' : 'h-14 w-14 rounded-xl';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-5 w-5' : 'h-7 w-7';
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center ring-1', box, accent.bg, accent.ring, className)} aria-hidden>
      <cat.icon className={cn(icon, accent.icon)} />
    </span>
  );
}

const KIND_STYLE: Record<PrepKind, string> = {
  concept: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900',
  scenario: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900',
  comparison: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:ring-fuchsia-900',
  behavioral: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900',
};

export function KindBadge({ kind }: { kind: PrepKind }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium ring-1', KIND_STYLE[kind])}>{KIND_LABEL[kind]}</span>;
}

export function LevelBadge({ level }: { level: PrepLevel }) {
  const dots = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i <= dots ? 'bg-slate-500 dark:bg-slate-300' : 'bg-slate-300 dark:bg-slate-600')} />
        ))}
      </span>
      {LEVEL_LABEL[level]}
    </span>
  );
}

export function StatusBadge({ status }: { status: PrepStatus | undefined }) {
  if (status === 'known') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <CircleCheck className="h-3.5 w-3.5" aria-hidden /> Known
      </span>
    );
  }
  if (status === 'revise') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Revise
      </span>
    );
  }
  return null;
}

/** One question in a list: the question, its kind and level, and the learner’s status. */
export function QuestionCard({ q, index, showCategory = false }: { q: PrepQuestion; index?: number; showCategory?: boolean }) {
  const t = useExplanation();
  const status = usePrepProgress((s) => s.status[q.id]);
  const topic = getPrepTopic(q.category, q.topic);
  return (
    <Link to={questionPath(q)} className="card group flex items-start gap-3 p-4 hover:shadow-md" data-testid="prep-question-card">
      {showCategory ? (
        <CategoryTile id={q.category} size="sm" className="mt-0.5" />
      ) : (
        index !== undefined && <span className="mt-0.5 w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-400">{index}.</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-snug text-slate-900 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">{t(q.question)}</span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <KindBadge kind={q.kind} />
          <LevelBadge level={q.level} />
          {showCategory && topic && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {getPrepCategory(q.category)?.title} · {topic.title}
            </span>
          )}
          <StatusBadge status={status} />
        </span>
      </span>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-500" aria-hidden />
    </Link>
  );
}
