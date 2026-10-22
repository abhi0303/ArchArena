import { Download, HardDrive, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState, Segmented } from '@/components/ui/misc';
import { errorMessage } from '@/lib/api';
import { GUEST, clearOwner, listLocalDrafts } from '@/lib/drafts/localDrafts';
import { useInstallPrompt } from '@/lib/pwa';
import { useMe, useUpdatePreferences } from '@/lib/queries';
import { applyTheme, usePreferences, type ThemePreference } from '@/stores/preferences';
import { toast } from '@/stores/toast';

export default function SettingsPage() {
  const { data: user } = useMe();
  const update = useUpdatePreferences();
  const theme = usePreferences((s) => s.theme);
  const setTheme = usePreferences((s) => s.setTheme);
  const setWalkthroughDone = usePreferences((s) => s.setWalkthroughDone);
  const install = useInstallPrompt();
  const [localCount, setLocalCount] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const owner = user?.id ?? GUEST;

  useEffect(() => {
    void listLocalDrafts(owner).then((d) => setLocalCount(d.length));
  }, [owner]);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title="Sign in to manage settings" action={<ButtonLink to="/login?redirect=/settings">Sign in</ButtonLink>} />
      </div>
    );
  }

  const saveName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get('displayName') ?? '').trim();
    if (!name) return;
    try {
      await update.mutateAsync({ displayName: name });
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Could not update profile', errorMessage(err));
    }
  };

  const changeTheme = (t: ThemePreference) => {
    setTheme(t);
    applyTheme(t);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Profile</h2>
        <form onSubmit={(e) => void saveName(e)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="displayName" className="label">
              Display name
            </label>
            <input id="displayName" name="displayName" defaultValue={user.displayName} maxLength={60} className="input" />
          </div>
          <Button type="submit" loading={update.isPending}>
            Save
          </Button>
        </form>
        <p className="mt-2 text-xs text-slate-500">Signed in as {user.email}</p>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Preferences</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Explanation language</p>
            <p className="text-xs text-slate-500">Applies to problem statements, requirements, hints and clarifications only.</p>
          </div>
          <LanguageToggle />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">Theme</p>
          <Segmented
            label="Theme"
            value={theme}
            onChange={changeTheme}
            options={[
              { value: 'light', label: <span className="inline-flex items-center gap-1"><Sun className="h-3.5 w-3.5" /> Light</span> },
              { value: 'dark', label: <span className="inline-flex items-center gap-1"><Moon className="h-3.5 w-3.5" /> Dark</span> },
              { value: 'system', label: <span className="inline-flex items-center gap-1"><Monitor className="h-3.5 w-3.5" /> System</span> },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Playground tour</p>
            <p className="text-xs text-slate-500">Show the 4-step introduction again next time you open a challenge.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setWalkthroughDone(false);
              toast.info('The tour will show next time you open the playground');
            }}
          >
            Replay tour
          </Button>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">App & offline data</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Install HLD Arena</p>
            <p className="text-xs text-slate-500">{install.installed ? 'Already installed on this device.' : 'Use it like a native app and practise offline.'}</p>
          </div>
          {install.canPrompt && (
            <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => void install.prompt()}>
              Install
            </Button>
          )}
          {!install.canPrompt && install.showIosInstructions && <p className="text-xs text-slate-500">In Safari: Share → Add to Home Screen.</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <HardDrive className="h-4 w-4" aria-hidden /> Drafts stored on this device
            </p>
            <p className="text-xs text-slate-500">{localCount} draft copies. Synced drafts stay in your account if you clear them here.</p>
          </div>
          <Button variant="outline" size="sm" disabled={!localCount} onClick={() => setConfirmClear(true)}>
            Clear device copies
          </Button>
        </div>
      </section>

      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        size="sm"
        title="Clear drafts stored on this device?"
        description="Any changes that have not synced to your account yet will be lost."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await clearOwner(owner);
                setLocalCount(0);
                setConfirmClear(false);
                toast.success('Device copies cleared');
              }}
            >
              Clear
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">Your account’s saved drafts, attempts and submissions are not affected.</p>
      </Dialog>
    </div>
  );
}
