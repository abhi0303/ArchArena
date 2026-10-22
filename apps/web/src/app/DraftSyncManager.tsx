import { useEffect, useRef } from 'react';
import { adoptGuestDrafts } from '@/lib/drafts/localDrafts';
import { syncPendingDrafts } from '@/lib/drafts/sync';
import { useOnlineStatus } from '@/lib/pwa';
import { useMe, queryClient, qk } from '@/lib/queries';
import { toast } from '@/stores/toast';

/**
 * Background reconciliation of offline drafts:
 *  - on sign-in, guest drafts made on this device move into the account;
 *  - on app start and whenever the connection returns, pending drafts are pushed.
 * The playground handles its own open draft, including interactive conflict resolution.
 */
export function DraftSyncManager() {
  const { data: user } = useMe();
  const online = useOnlineStatus();
  const lastUser = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !online) return;
    let cancelled = false;
    (async () => {
      if (lastUser.current !== user.id) {
        lastUser.current = user.id;
        const moved = await adoptGuestDrafts(user.id);
        if (moved && !cancelled) toast.info(`${moved} draft${moved > 1 ? 's' : ''} from this device added to your account`);
      }
      const activeQuestion = document.body.dataset.activeQuestion;
      const r = await syncPendingDrafts(user.id, activeQuestion);
      if (cancelled) return;
      if (r.synced) {
        toast.success(`Synced ${r.synced} offline draft${r.synced > 1 ? 's' : ''}`);
        void queryClient.invalidateQueries({ queryKey: qk.drafts });
        void queryClient.invalidateQueries({ queryKey: qk.dashboard });
      }
      if (r.conflicts) toast.warning('Some drafts changed on another device', 'Open those challenges to choose which version to keep.');
    })();
    return () => {
      cancelled = true;
    };
  }, [user, online]);

  return null;
}
