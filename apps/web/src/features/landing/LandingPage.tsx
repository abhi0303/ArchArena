import { getComponent, type Difficulty, type QuestionSummaryDTO } from '@arch-arena/shared';
import { ArrowRight, BookOpen, Cable, CircleCheck, Eye, GraduationCap, Languages, MousePointerClick, ShieldCheck, Sparkles, Trophy, WifiOff } from 'lucide-react';
import { Link } from 'react-router';
import { ACCENTS, DynamicIcon } from '@/components/icons';
import { DifficultyBadge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/misc';
import { useMe, useQuestions } from '@/lib/queries';

const STEPS = [
  { icon: BookOpen, title: 'Pick a challenge', body: 'Read the problem, requirements and scale — in English or Hinglish.' },
  { icon: MousePointerClick, title: 'Build visually', body: 'Drag load balancers, services, caches, queues and databases onto a real canvas.' },
  { icon: Cable, title: 'Connect the flow', body: 'Draw how requests and events move. Connections are scored, not just boxes.' },
  { icon: ShieldCheck, title: 'Get explainable feedback', body: 'A question-specific rubric scores your design and explains every deduction.' },
];

const BENEFITS = [
  { icon: Eye, title: 'See the whole system', body: 'Diagrams make data flow, bottlenecks and single points of failure visible in a way text answers never do.' },
  { icon: Sparkles, title: 'Learn by iterating', body: 'Validate instantly, evaluate, improve and compare — the same loop real interviews reward.' },
  { icon: Trophy, title: 'Stay motivated', body: 'Stars, XP, levels and achievements track real progress without rewarding spam.' },
  { icon: Languages, title: 'Explanations in Hinglish too', body: 'Switch problem explanations, hints and every Learn guide between English and natural Hinglish.' },
  { icon: WifiOff, title: 'Works offline', body: 'Install the app, keep designing on a flight, and sync when you land.' },
  { icon: CircleCheck, title: 'Interview-ready topics', body: '100 challenges from URL shorteners to global payment systems.' },
];

/** A taste of the Learn tab: look-alike components people mix up most often. */
const LEARN_TEASERS = [
  { slug: 'load-balancer-vs-api-gateway-vs-reverse-proxy', types: ['load-balancer', 'api-gateway', 'reverse-proxy'], line: 'All three sit in front of your servers — but only one knows who the caller is.' },
  { slug: 'in-memory-vs-distributed-vs-cdn-cache', types: ['in-memory-cache', 'distributed-cache', 'cdn-cache'], line: 'Same idea, three very different places to keep the copy.' },
  { slug: 'message-queue-vs-event-stream-vs-task-queue', types: ['message-queue', 'event-stream', 'task-queue'], line: '“Please do this” versus “this happened” — and why it matters.' },
];

function LearnTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="learn-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden /> New to system design?
          </p>
          <h2 id="learn-title" className="text-2xl font-bold">
            Learn the building blocks first
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            57 illustrated guides and 26 side-by-side comparisons, in English and Hinglish: the problem each component solves, a real-life analogy, where it fits perfectly, and how to
            tell it apart from look-alikes.
          </p>
        </div>
        <ButtonLink to="/learn" variant="outline" icon={<ArrowRight className="h-4 w-4" />} className="shrink-0">
          Browse all guides
        </ButtonLink>
      </div>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {LEARN_TEASERS.map((t) => (
          <li key={t.slug}>
            <Link to={`/learn/compare/${t.slug}`} className="card group flex h-full flex-col p-5 transition-shadow hover:shadow-md">
              <span className="mb-3 flex -space-x-2" aria-hidden>
                {t.types.map((type) => {
                  const def = getComponent(type);
                  const accent = ACCENTS[def?.accent ?? 'slate']!;
                  return (
                    <span key={type} className={`flex h-10 w-10 items-center justify-center rounded-lg ring-2 ring-white dark:ring-slate-900 ${accent.bg}`}>
                      <DynamicIcon name={def?.icon ?? 'Box'} className={`h-5 w-5 ${accent.icon}`} />
                    </span>
                  );
                })}
              </span>
              <span className="font-semibold leading-snug">{t.types.map((type) => getComponent(type)?.label ?? type).join(' vs ')}</span>
              <span className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-300">{t.line}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
                See the difference <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArchitecturePreview() {
  const box = (x: number, y: number, w: number, label: string, color: string) => (
    <g>
      <rect x={x} y={y} width={w} height={40} rx={10} className="fill-white stroke-slate-200 dark:fill-slate-900 dark:stroke-slate-700" strokeWidth={1.5} />
      <rect x={x + 8} y={y + 9} width={22} height={22} rx={6} fill={color} opacity={0.18} />
      <circle cx={x + 19} cy={y + 20} r={5} fill={color} />
      <text x={x + 38} y={y + 25} className="fill-slate-700 text-[11px] font-semibold dark:fill-slate-200">
        {label}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 560 300" className="h-auto w-full" role="img" aria-label="Sample architecture: clients go through a CDN and load balancer to stateless services backed by a cache, database with replica, and a queue processed by workers.">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" fill="#64748b" />
        </marker>
        <marker id="arr-o" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" fill="#f97316" />
        </marker>
      </defs>
      <g stroke="#64748b" strokeWidth={1.6} fill="none" markerEnd="url(#arr)">
        <path d="M118 80 H150" />
        <path d="M118 200 C134 200 134 100 150 100" />
        <path d="M262 90 H292" />
        <path d="M402 70 H432" />
        <path d="M402 100 C418 100 418 150 432 150" />
        <path d="M480 172 V212" strokeDasharray="2 5" />
      </g>
      <g stroke="#f97316" strokeWidth={1.6} fill="none" strokeDasharray="7 5" markerEnd="url(#arr-o)">
        <path d="M347 112 V212" />
        <path d="M402 232 H432" />
      </g>
      {box(10, 60, 108, 'Web Client', '#64748b')}
      {box(10, 180, 108, 'Mobile App', '#64748b')}
      {box(150, 70, 112, 'Load Balancer', '#0ea5e9')}
      {box(292, 70, 110, 'API Service ×N', '#8b5cf6')}
      {box(432, 50, 118, 'Redis Cache', '#f59e0b')}
      {box(432, 130, 118, 'Primary DB', '#10b981')}
      {box(432, 212, 118, 'Read Replica', '#10b981')}
      {box(292, 212, 110, 'Message Queue', '#f97316')}
      <text x={180} y={150} className="fill-slate-400 text-[10px]">
        sync request
      </text>
      <text x={300} y={200} className="fill-orange-500 text-[10px]">
        async event
      </text>
    </svg>
  );
}

function FeaturedCard({ q }: { q: QuestionSummaryDTO }) {
  return (
    <li className="card flex flex-col p-4">
      <DifficultyBadge difficulty={q.difficulty} className="self-start" />
      <h3 className="mt-2 font-semibold">{q.title}</h3>
      <p className="mt-1 flex-1 text-xs text-slate-500">
        {q.category} · ~{q.estimatedMinutes} min
      </p>
      <Link to={`/challenges/${q.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
        View challenge <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </li>
  );
}

const DIFFICULTY_COPY: Record<Difficulty, string> = {
  easy: 'Foundations: request paths, storage choices, caching and simple async work.',
  medium: 'Classic interview systems: chat, feeds, video, ride-hailing, payments and more.',
  hard: 'Planet-scale designs: multi-region, consensus, streaming and strict correctness.',
};

export default function LandingPage() {
  const { data: questions, isLoading } = useQuestions();
  const { data: user } = useMe();
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const q of questions ?? []) counts[q.difficulty]++;
  const first = questions?.find((q) => q.difficulty === 'easy') ?? questions?.[0];
  const featured = (['easy', 'medium', 'hard'] as const).flatMap((d) => (questions ?? []).filter((q) => q.difficulty === d).slice(0, 2));

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50 to-white dark:border-slate-800 dark:from-indigo-950/40 dark:to-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-slate-900 dark:text-indigo-300 dark:ring-indigo-900">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Interactive system design practice
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              HLD Arena
              <span className="mt-2 block text-2xl font-semibold text-slate-600 sm:text-3xl dark:text-slate-300">Design it. Connect it. Get scored.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Learn high-level design by building real architectures on a drag-and-drop canvas. Every challenge has its own rubric that checks your components <em>and</em> your connections — then tells you exactly how to improve.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={first ? `/challenges/${first.slug}` : '/challenges'} size="lg" icon={<ArrowRight className="h-4 w-4" />} data-testid="start-learning">
                Start learning
              </ButtonLink>
              <ButtonLink to="/challenges" size="lg" variant="outline">
                Explore challenges
              </ButtonLink>
            </div>
            {!user && (
              <p className="mt-4 text-sm text-slate-500">
                No account needed to try. <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Create one</Link> to save progress and earn stars.
              </p>
            )}
          </div>
          <div className="card p-4 sm:p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Sample architecture</p>
            <ArchitecturePreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl font-bold">
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-xs font-semibold text-slate-400">Step {i + 1}</p>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900/40" aria-labelledby="levels-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 id="levels-title" className="text-2xl font-bold">
            Three levels, {questions?.length ?? 100} challenges
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Link key={d} to={`/challenges?difficulty=${d}`} className="card block p-5 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <DifficultyBadge difficulty={d} />
                  <span className="text-2xl font-bold">{isLoading ? '…' : counts[d]}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{DIFFICULTY_COPY[d]}</p>
              </Link>
            ))}
          </div>
          <h3 className="mt-10 text-lg font-semibold">Featured challenges</h3>
          {isLoading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((q) => (
                <FeaturedCard key={q.id} q={q} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <LearnTeaser />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="benefits-title">
        <h2 id="benefits-title" className="text-2xl font-bold">
          Why practice system design visually?
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex gap-3">
              <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" aria-hidden />
              <div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{b.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-indigo-600 px-6 py-10 text-center text-white">
          <h2 className="text-2xl font-bold">Your first architecture takes about 20 minutes.</h2>
          <p className="max-w-xl text-indigo-100">Start with a URL shortener, learn the playground with a 4-step tour, and get your first score.</p>
          <ButtonLink to={first ? `/challenges/${first.slug}` : '/challenges'} variant="secondary" size="lg">
            Start your first challenge
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
