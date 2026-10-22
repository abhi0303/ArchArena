import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Logo } from '@/app/Logo';
import { errorMessage } from '@/lib/api';
import { useAuthConfig, useGoogleLogin } from '@/lib/queries';
import { toast } from '@/stores/toast';

/** Only allow same-site relative redirects (prevents open redirects). */
export function useSafeRedirect(fallback = '/dashboard'): string {
  const [params] = useSearchParams();
  const r = params.get('redirect');
  return r && r.startsWith('/') && !r.startsWith('//') ? r : fallback;
}

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="card p-6 sm:p-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 font-semibold">
          <Logo className="h-8 w-8" /> HLD Arena
        </Link>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">{footer}</p>
    </div>
  );
}

interface GoogleId {
  accounts: {
    id: {
      initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void;
      renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
    };
  };
}

let scriptPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load Google sign-in'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** "Sign in with Google" — only rendered when the server has GOOGLE_CLIENT_ID configured. */
export function GoogleButton({ onSuccess }: { onSuccess: () => void }) {
  const { data: config } = useAuthConfig();
  const ref = useRef<HTMLDivElement>(null);
  const login = useGoogleLogin();
  const clientId = config?.googleClientId;

  useEffect(() => {
    if (!clientId || !ref.current) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        const google = (window as unknown as { google?: GoogleId }).google;
        if (cancelled || !google || !ref.current) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (r) =>
            login.mutate(r.credential, {
              onSuccess,
              onError: (err) => toast.error('Google sign-in failed', errorMessage(err)),
            }),
        });
        google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: ref.current.offsetWidth || 320, text: 'continue_with' });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (!clientId) return null;
  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>
      <div ref={ref} className="flex justify-center" />
    </div>
  );
}
