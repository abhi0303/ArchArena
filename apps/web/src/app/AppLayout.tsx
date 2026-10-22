import { WifiOff } from 'lucide-react';
import { Suspense } from 'react';
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
      You are offline. Previously opened challenges and your drafts still work; evaluation needs a connection.
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
      <OfflineBanner />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <p>HLD Arena — practice system design by building it.</p>
          <nav aria-label="Footer" className="flex gap-4">
            <Link to="/challenges" className="hover:underline">
              Challenges
            </Link>
            <Link to="/learn" className="hover:underline">
              Learn
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
