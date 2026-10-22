import { Download, GraduationCap, LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, Swords, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/cn';
import { countPendingDrafts } from '@/lib/drafts/sync';
import { clearOwner } from '@/lib/drafts/localDrafts';
import { useInstallPrompt } from '@/lib/pwa';
import { useLogout, useMe } from '@/lib/queries';
import { applyTheme, usePreferences } from '@/stores/preferences';
import { toast } from '@/stores/toast';
import { Logo } from './Logo';

const NAV = [
  { to: '/challenges', label: 'Challenges' },
  { to: '/learn', label: 'Learn' },
  { to: '/dashboard', label: 'Dashboard' },
];

export function ThemeToggle() {
  const theme = usePreferences((s) => s.theme);
  const setTheme = usePreferences((s) => s.setTheme);
  const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      onClick={() => {
        const next = dark ? 'light' : 'dark';
        setTheme(next);
        applyTheme(next);
      }}
      data-theme={theme}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function useSignOut() {
  const { data: user } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<number | null>(null);
  const doLogout = async () => {
    if (user) await clearOwner(user.id);
    await logout.mutateAsync().catch(() => undefined);
    setConfirm(null);
    toast.info('Signed out');
    navigate('/');
  };
  const start = async () => {
    if (!user) return;
    const pending = await countPendingDrafts(user.id);
    if (pending) setConfirm(pending);
    else await doLogout();
  };
  const dialog = (
    <Dialog
      open={confirm !== null}
      onClose={() => setConfirm(null)}
      title="Sign out with unsynced changes?"
      description={`${confirm ?? 0} draft${confirm === 1 ? ' has' : 's have'} changes that have not reached the server yet. Signing out removes them from this device.`}
      footer={
        <>
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Stay signed in
          </Button>
          <Button variant="danger" onClick={() => void doLogout()} loading={logout.isPending}>
            Sign out anyway
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">Reconnect to the internet and wait for “Saved” to keep these changes in your account.</p>
    </Dialog>
  );
  return { start, dialog, pending: logout.isPending };
}

export function Header() {
  const { data: user, isLoading } = useMe();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const install = useInstallPrompt();
  const signOut = useSignOut();
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const installButton =
    install.canPrompt || install.showIosInstructions ? (
      <Button
        variant="ghost"
        size="sm"
        icon={<Download className="h-4 w-4" />}
        onClick={() => (install.canPrompt ? void install.prompt() : setIosHelp(true))}
      >
        Install app
      </Button>
    ) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))]">
        <Link to="/" className="flex items-center gap-2 font-semibold" aria-label="HLD Arena home">
          <Logo className="h-7 w-7" />
          <span className="hidden sm:inline">HLD Arena</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium',
                  isActive ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {installButton}
          <ThemeToggle />
          {isLoading ? null : user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white" aria-hidden>
                  {user.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-32 truncate">{user.displayName}</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">Lv {user.level.level}</span>
              </Link>
              <ButtonLink to="/settings" variant="ghost" size="icon" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </ButtonLink>
              <Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" onClick={() => void signOut.start()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink to="/register" size="sm">
                Create account
              </ButtonLink>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <ul className="flex flex-col gap-1">
            <li>
              <Link to="/challenges" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                <Swords className="h-4 w-4" /> Challenges
              </Link>
            </li>
            <li>
              <Link to="/learn" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                <GraduationCap className="h-4 w-4" /> Learn
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            </li>
            {user && (
              <li>
                <Link to="/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
            {installButton}
            {user ? (
              <Button variant="outline" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={() => void signOut.start()}>
                Sign out ({user.displayName})
              </Button>
            ) : (
              <>
                <ButtonLink to="/login" variant="outline" size="sm">
                  Sign in
                </ButtonLink>
                <ButtonLink to="/register" size="sm">
                  Create account
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      )}
      {signOut.dialog}
      <Dialog open={iosHelp} onClose={() => setIosHelp(false)} title="Install HLD Arena" size="sm">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Tap the Share button in Safari’s toolbar.</li>
          <li>Choose “Add to Home Screen”.</li>
          <li>Tap “Add”. HLD Arena opens full-screen and works offline for challenges you have opened.</li>
        </ol>
      </Dialog>
    </header>
  );
}
