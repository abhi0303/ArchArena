import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToasts } from '@/stores/toast';

/** Registers the service worker and shows a friendly prompt when a new version is ready. */
export function PwaManager() {
  const push = useToasts((s) => s.push);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Check for updates every hour while the app is open.
      if (registration) setInterval(() => void registration.update(), 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    push({ tone: 'success', title: 'Ready to work offline', description: 'The Learn guides, challenges you have opened and your drafts work without a connection.' });
    setOfflineReady(false);
  }, [offlineReady, push, setOfflineReady]);

  if (!needRefresh) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-[1400] flex justify-center p-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm shadow-lg dark:border-indigo-900 dark:bg-slate-900">
        <RefreshCw className="h-4 w-4 text-indigo-500" aria-hidden />
        <span>A new version of HLD Arena is available.</span>
        <button className="font-medium text-indigo-600 hover:underline dark:text-indigo-400" onClick={() => void updateServiceWorker(true)}>
          Reload
        </button>
        <button className="text-slate-500 hover:underline" onClick={() => setNeedRefresh(false)}>
          Later
        </button>
      </div>
    </div>
  );
}
