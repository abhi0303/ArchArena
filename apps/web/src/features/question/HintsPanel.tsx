import type { QuestionDetailDTO } from '@arch-arena/shared';
import { Lightbulb, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useExplanation } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { queryClient, qk, useMe, useRecordHint } from '@/lib/queries';

const HINT_TITLES = ['The core challenge', 'A helpful concept', 'A missing responsibility', 'A key trade-off'];

const storageKey = (id: string) => `archarena-hints-${id}`;

function readRevealed(id: string): number {
  try {
    return Math.min(4, Number(localStorage.getItem(storageKey(id)) ?? 0) || 0);
  } catch {
    return 0;
  }
}

/** Progressive hints: each one must be revealed in order. Using hints never lowers a score. */
export function HintsPanel({ question }: { question: QuestionDetailDTO }) {
  const t = useExplanation();
  const [revealed, setRevealed] = useState(() => readRevealed(question.id));
  const record = useRecordHint(question.slug);
  const { data: user } = useMe();

  useEffect(() => setRevealed(readRevealed(question.id)), [question.id]);

  const reveal = (level: number) => {
    setRevealed(level);
    try {
      localStorage.setItem(storageKey(question.id), String(level));
    } catch {
      /* storage unavailable */
    }
    record.mutate(level, {
      onSuccess: () => {
        if (user) void queryClient.invalidateQueries({ queryKey: qk.progress });
      },
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Hints guide you without giving the answer away. Using them never lowers your score — finishing without hints just earns a small bonus.
      </p>
      <ol className="space-y-2">
        {question.hints.map((hint, i) => {
          const level = i + 1;
          const open = level <= revealed;
          const next = level === revealed + 1;
          return (
            <li key={level} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {open ? <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden /> : <Lock className="h-4 w-4 text-slate-400" aria-hidden />}
                  Hint {level}: {HINT_TITLES[i]}
                </p>
                {!open && (
                  <Button size="xs" variant={next ? 'outline' : 'ghost'} disabled={!next} onClick={() => reveal(level)}>
                    Reveal
                  </Button>
                )}
              </div>
              {open && <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t(hint)}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
