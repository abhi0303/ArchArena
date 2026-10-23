import { lazy, Suspense, useEffect, useRef } from 'react';
import { createBrowserRouter, Outlet, useRouteError, isRouteErrorResponse, Link, Navigate } from 'react-router';
import { Toaster } from '@/components/ui/Toaster';
import { PageSpinner } from '@/components/ui/Spinner';
import { buttonClasses } from '@/components/ui/Button';
import { BASE_URL, STATIC_MODE } from '@/lib/env';
import { useMe } from '@/lib/queries';
import { applyTheme, usePreferences } from '@/stores/preferences';
import { AppLayout } from './AppLayout';
import { DraftSyncManager } from './DraftSyncManager';
import { PwaManager } from './PwaManager';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const ExplorerPage = lazy(() => import('@/features/explorer/ExplorerPage'));
const QuestionPage = lazy(() => import('@/features/question/QuestionPage'));
const PlaygroundPage = lazy(() => import('@/features/playground/PlaygroundPage'));
const AttemptResultPage = lazy(() => import('@/features/results/AttemptResultPage'));
const SubmissionResultPage = lazy(() => import('@/features/results/SubmissionResultPage'));
const ReferencePage = lazy(() => import('@/features/results/ReferencePage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const AboutPage = lazy(() => import('@/features/misc/AboutPage'));
const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'));
const LearnPage = lazy(() => import('@/features/learn/LearnPage'));
const ComponentGuidePage = lazy(() => import('@/features/learn/ComponentGuidePage'));
const ComparisonPage = lazy(() => import('@/features/learn/ComparisonPage'));
const SettingsGuidePage = lazy(() => import('@/features/learn/SettingsGuidePage'));

function PreferenceSync() {
  const theme = usePreferences((s) => s.theme);
  const setLanguage = usePreferences((s) => s.setLanguage);
  const { data: user } = useMe();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  // After sign-in, the account's saved explanation language wins.
  useEffect(() => {
    if (user && syncedFor.current !== user.id) {
      syncedFor.current = user.id;
      setLanguage(user.preferredLanguage);
    }
  }, [user, setLanguage]);
  return null;
}

function Root() {
  return (
    <>
      <PreferenceSync />
      <DraftSyncManager />
      <PwaManager />
      <Outlet />
      <Toaster />
    </>
  );
}

function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : 'Unknown error';
  const chunkError = /dynamically imported module|Failed to fetch/i.test(message);
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">{chunkError ? 'This page is not available offline yet' : 'Something went wrong'}</h1>
      <p className="text-sm text-slate-500">
        {chunkError ? 'Reconnect to the internet to load this part of the app. Pages you have visited before keep working offline.' : message}
      </p>
      <div className="flex gap-2">
        <button className={buttonClasses('primary')} onClick={() => window.location.reload()}>
          Reload
        </button>
        <Link className={buttonClasses('outline')} to="/">
          Go home
        </Link>
      </div>
    </div>
  );
}

const page = (el: React.ReactNode) => <Suspense fallback={<PageSpinner />}>{el}</Suspense>;

export const router = createBrowserRouter(
  [
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'challenges', element: <ExplorerPage /> },
          { path: 'challenges/:slug', element: <QuestionPage /> },
          { path: 'challenges/:slug/attempts/:attemptId', element: <AttemptResultPage /> },
          { path: 'challenges/:slug/submissions/:submissionId', element: <SubmissionResultPage /> },
          { path: 'challenges/:slug/reference', element: <ReferencePage /> },
          { path: 'learn', element: <LearnPage /> },
          { path: 'learn/settings', element: <SettingsGuidePage /> },
          { path: 'learn/compare/:slug', element: <ComparisonPage /> },
          { path: 'learn/:type', element: <ComponentGuidePage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          // No accounts in the browser-only build: progress is saved on this device automatically.
          { path: 'login', element: STATIC_MODE ? <Navigate to="/dashboard" replace /> : <LoginPage /> },
          { path: 'register', element: STATIC_MODE ? <Navigate to="/dashboard" replace /> : <RegisterPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'about', element: <AboutPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      { path: 'challenges/:slug/play', element: page(<PlaygroundPage />) },
    ],
  },
  ],
  // Served from a sub-path on GitHub Pages (e.g. /ArchArena/).
  { basename: BASE_URL === '/' ? '/' : BASE_URL.replace(/\/$/, '') },
);
