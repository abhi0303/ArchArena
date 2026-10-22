import { formatRelative } from '@/lib/cn';
import { useLocation } from 'react-router';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import type { DraftConflict } from './useDraftPersistence';
import { SHORTCUTS } from './useKeyboardShortcuts';

export function ConflictDialog({ conflict, onResolve }: { conflict: DraftConflict | null; onResolve: (choice: 'mine' | 'theirs') => void }) {
  if (!conflict) return null;
  const serverCount = conflict.server.diagram.nodes.filter((n) => n.kind === 'component').length;
  const localCount = conflict.local.diagram.nodes.filter((n) => n.kind === 'component').length;
  return (
    <Dialog
      open
      onClose={() => undefined}
      dismissible={false}
      title="This draft changed somewhere else"
      description="You edited this challenge on this device while a different version was saved from another device or tab. Choose which one to keep."
      footer={
        <>
          <Button variant="outline" onClick={() => onResolve('theirs')}>
            Use the other version
          </Button>
          <Button onClick={() => onResolve('mine')}>Keep this device’s version</Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-indigo-200 p-3 dark:border-indigo-900">
          <p className="text-sm font-semibold">This device</p>
          <p className="text-xs text-slate-500">
            {localCount} components · edited {formatRelative(conflict.local.updatedAt)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <p className="text-sm font-semibold">Other version</p>
          <p className="text-xs text-slate-500">
            {serverCount} components · saved {formatRelative(conflict.server.updatedAt)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">The version you don’t keep is backed up on this device, so nothing is lost.</p>
    </Dialog>
  );
}

export function SignInDialog({ open, onClose, action }: { open: boolean; onClose: () => void; action: string }) {
  const location = useLocation();
  const redirect = encodeURIComponent(location.pathname);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={`Sign in to ${action}`}
      description="Evaluation runs on the server and is saved to your account. Your draft is safe on this device and will be added to your account when you sign in."
      footer={
        <>
          <ButtonLink to={`/login?redirect=${redirect}`} variant="outline">
            Sign in
          </ButtonLink>
          <ButtonLink to={`/register?redirect=${redirect}`}>Create free account</ButtonLink>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">“Validate” keeps working without an account — it runs instantly in your browser.</p>
    </Dialog>
  );
}

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} size="sm" title="Keyboard shortcuts">
      <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
        {SHORTCUTS.map((s) => (
          <div key={s.keys} className="flex items-center justify-between gap-4 py-2">
            <dt className="text-slate-600 dark:text-slate-300">{s.action}</dt>
            <dd>
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-800">{s.keys}</kbd>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-500">
        On touch screens: tap a component in the library to add it, tap a connection dot then another component’s dot to connect.
      </p>
    </Dialog>
  );
}
