import { HardDrive, WifiOff, X } from 'lucide-react';
import { Suspense, useState } from 'react';
import { STATIC_MODE } from '@/lib/env';
import { Link, Outlet, ScrollRestoration } from 'react-router';
import { PageSpinner } from '@/components/ui/Spinner';
import { useOnlineStatus } from '@/lib/pwa';
import { Header } from './Header';

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <WifiOff className="h-3.5 w-3.5" aria-hidden />
      {STATIC_MODE
        ? 'You are offline. Everything keeps working — this version runs entirely in your browser.'
        : 'You are offline. Previously opened challenges and your drafts still work; evaluation needs a connection.'}
    </div>
  );
}

const NOTICE_KEY = 'archarena-static-notice-dismissed';

/** Explains, once, that the GitHub Pages build keeps everything in this browser. */
function StaticModeNotice() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(NOTICE_KEY) === '1';
    } catch {
      return false;
    }
  });
  if (hidden) return null;
  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(NOTICE_KEY, '1');
    } catch {
      /* private mode: just hide for this visit */
    }
  };
  return (
    <div role="note" className="border-b border-indigo-100 bg-indigo-50 text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-100" data-testid="static-notice">
      <div className="mx-auto flex max-w-7xl items-start gap-2 px-4 py-2 text-xs sm:items-center sm:px-6 sm:text-sm">
        <HardDrive className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden />
        <p className="flex-1">
          No account needed: this version runs entirely in your browser. Your drafts, scores, XP and achievements are saved on this device.
        </p>
        <button onClick={dismiss} className="rounded p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900" aria-label="Dismiss notice">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow">
        Skip to content
      </a>
      <Header />
      {STATIC_MODE && <StaticModeNotice />}
      <OfflineBanner />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <p>HLD Arena — practice system design by building it.</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/challenges" className="hover:underline">
              Challenges
            </Link>
            <Link to="/learn" className="hover:underline">
              Learn
            </Link>
            <Link to="/prep" className="hover:underline">
              Interview Prep
            </Link>
            <Link to="/about" className="hover:underline">
              How scoring works
            </Link>
          </nav>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
