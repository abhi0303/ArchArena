import { GAMIFICATION, SCORE_CATEGORIES, xpForLevel } from '@arch-arena/shared';
import { ButtonLink } from '@/components/ui/Button';

export default function AboutPage() {
  const [s1, s2, s3, s4, s5] = GAMIFICATION.starThresholds;
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold">How scoring works</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Every challenge has its own rubric: a list of checks that look at which components you used, how they are connected, and how key components are configured. Nothing is random and every deduction is explained.
        </p>
      </header>

      <section className="card p-6">
        <h2 className="mb-3 text-lg font-semibold">Score categories (default weights)</h2>
        <ul className="space-y-2 text-sm">
          {SCORE_CATEGORIES.map((c) => (
            <li key={c.key} className="flex justify-between gap-4">
              <span>
                <span className="font-medium">{c.label}</span> — <span className="text-slate-500">{c.description}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{c.defaultWeight}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">Weights can differ per challenge — a payment system cares more about reliability than a pastebin does. The total is always normalised to 100.</p>
      </section>

      <section className="card space-y-3 p-6 text-sm text-slate-700 dark:text-slate-300">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">What the evaluator checks</h2>
        <p>
          <strong>Flows, not just boxes.</strong> Checks trace directed paths (e.g. client → load balancer → service → database), asynchronous producer → queue → consumer flows, and whether every path to a protected service passes through a guard such as a rate limiter.
        </p>
        <p>
          <strong>Connections count twice.</strong> Every flow check also feeds the “Connections & data flow” category, and generic checks flag reversed arrows, clients talking directly to databases, queues without consumers and disconnected components.
        </p>
        <p>
          <strong>Alternatives are accepted.</strong> Rules match capabilities (e.g. “any horizontally scalable store”), so several valid designs can score full marks.
        </p>
        <p>
          <strong>Configuration you didn’t specify is not guessed.</strong> If a requirement depends on a setting (replication, delivery guarantees, idempotency…), it is marked “needs configuration” until you set it on the component.
        </p>
        <p>
          <strong>Critical gaps cap the score.</strong> Missing something essential (like durable storage) caps the score at 50, with an explanation.
        </p>
        <p>
          <strong>Single points of failure, unnecessary components and isolated pieces</strong> reduce reliability and simplicity scores.
        </p>
      </section>

      <section className="card space-y-3 p-6 text-sm">
        <h2 className="text-lg font-semibold">Stars, rating and XP</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300">
          <li>
            Stars: 0–{s1 - 1} → 0★, {s1}–{s2 - 1} → 1★, {s2}–{s3 - 1} → 2★, {s3}–{s4 - 1} → 3★, {s4}–{s5 - 1} → 4★, {s5}–100 → 5★.
          </li>
          <li>Rating: score ÷ 20, e.g. 84 → 4.2 / 5. The rating shows quality; stars are the achievement you keep.</li>
          <li>Stars and XP are only awarded for final submissions with a score of at least {GAMIFICATION.completionMinScore}.</li>
          <li>
            XP per challenge = base ({GAMIFICATION.xp.base.easy} Easy / {GAMIFICATION.xp.base.medium} Medium / {GAMIFICATION.xp.base.hard} Hard) × quality + {GAMIFICATION.xp.perStar} per star, plus a one-time{' '}
            {GAMIFICATION.xp.firstCompletionBonus} XP first-completion bonus and {GAMIFICATION.xp.hintFreeBonus} XP if you never opened a hint.
          </li>
          <li>Improving a completed challenge only pays the difference to your previous best — resubmitting cannot farm XP.</li>
          <li>
            Levels grow gradually: level 2 at {xpForLevel(2)} XP, level 3 at {xpForLevel(3)} XP, level 5 at {xpForLevel(5)} XP, level 10 at {xpForLevel(10)} XP.
          </li>
        </ul>
      </section>

      <section className="card space-y-2 p-6 text-sm text-slate-700 dark:text-slate-300">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Limits of diagram-based evaluation</h2>
        <p>
          A diagram cannot prove implementation details such as query plans, exact capacity numbers or code correctness. The evaluator only credits what the diagram and its configured properties show, and the reference architecture is one strong answer — not the only one.
        </p>
      </section>

      <ButtonLink to="/challenges">Browse challenges</ButtonLink>
    </div>
  );
}
