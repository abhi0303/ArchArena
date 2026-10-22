import type { QuestionDetailDTO } from '@arch-arena/shared';
import { useReactFlow } from '@xyflow/react';
import {
  ArrowLeft,
  CircleAlert,
  CloudOff,
  Flag,
  Keyboard,
  LayoutGrid,
  Lightbulb,
  LoaderCircle,
  Maximize,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Redo2,
  Send,
  ShieldCheck,
  StickyNote,
  Undo2,
  ZoomIn,
  ZoomOut,
  CircleCheck,
  HardDrive,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { DifficultyBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn, formatRelative } from '@/lib/cn';
import { STATIC_MODE } from '@/lib/env';
import { selectCanRedo, selectCanUndo, useEditor } from './store';
import type { SaveStatus } from './useDraftPersistence';

function SaveIndicator({ status, lastSavedAt }: { status: SaveStatus; lastSavedAt: string | null }) {
  const map: Record<SaveStatus, { icon: ReactNode; text: string; cls: string; hint: string }> = {
    loading: { icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />, text: 'Loading…', cls: 'text-slate-500', hint: 'Loading your draft' },
    pending: { icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />, text: 'Saving…', cls: 'text-slate-500', hint: 'Changes will be saved in a moment' },
    saving: { icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />, text: 'Saving…', cls: 'text-slate-500', hint: 'Saving to your account' },
    saved: {
      icon: <CircleCheck className="h-3.5 w-3.5" />,
      text: 'Saved',
      cls: 'text-emerald-600 dark:text-emerald-400',
      hint: `${STATIC_MODE ? 'Saved in this browser' : 'Saved to your account'}${lastSavedAt ? ` ${formatRelative(lastSavedAt)}` : ''}`,
    },
    local: { icon: <HardDrive className="h-3.5 w-3.5" />, text: 'Saved on this device', cls: 'text-slate-600 dark:text-slate-300', hint: 'Sign in to sync drafts across devices' },
    offline: {
      icon: <CloudOff className="h-3.5 w-3.5" />,
      text: 'Offline changes pending',
      cls: 'text-amber-600 dark:text-amber-400',
      hint: 'Saved on this device; will sync when you reconnect',
    },
    error: { icon: <CircleAlert className="h-3.5 w-3.5" />, text: 'Save failed', cls: 'text-rose-600', hint: 'Your work is kept on this device. We will retry on the next change.' },
    conflict: { icon: <CircleAlert className="h-3.5 w-3.5" />, text: 'Needs your decision', cls: 'text-rose-600', hint: 'This draft changed elsewhere' },
  };
  const s = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium', s.cls)} role="status" aria-live="polite" title={s.hint} data-testid="save-status">
      {s.icon}
      <span className="hidden sm:inline">{s.text}</span>
    </span>
  );
}

function IconAction({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <Tooltip content={label}>
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={label} onClick={onClick} disabled={disabled}>
        {children}
      </Button>
    </Tooltip>
  );
}

export interface ToolbarProps {
  question: QuestionDetailDTO;
  status: SaveStatus;
  lastSavedAt: string | null;
  onValidate: () => void;
  onEvaluate: () => void;
  onFinalSubmit: () => void;
  onHints: () => void;
  onShortcuts: () => void;
  onAddNote: () => void;
  onToggleLibrary: () => void;
  onToggleProperties: () => void;
  evaluating: boolean;
  hasSelection: boolean;
}

export function Toolbar(p: ToolbarProps) {
  const rf = useReactFlow();
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const canUndo = useEditor(selectCanUndo);
  const canRedo = useEditor(selectCanRedo);
  const autoLayout = useEditor((s) => s.autoLayout);
  const [menu, setMenu] = useState(false);

  const resetLayout = () => {
    autoLayout();
    setTimeout(() => void rf.fitView({ padding: 0.3, duration: 300, maxZoom: 1.1 }), 50);
  };

  const tools = [
    { label: 'Undo (⌘Z)', short: 'Undo', icon: Undo2, fn: undo, disabled: !canUndo },
    { label: 'Redo (⇧⌘Z)', short: 'Redo', icon: Redo2, fn: redo, disabled: !canRedo },
    { label: 'Zoom out', short: 'Zoom out', icon: ZoomOut, fn: () => void rf.zoomOut({ duration: 150 }) },
    { label: 'Zoom in', short: 'Zoom in', icon: ZoomIn, fn: () => void rf.zoomIn({ duration: 150 }) },
    { label: 'Fit to screen', short: 'Fit to screen', icon: Maximize, fn: () => void rf.fitView({ padding: 0.3, duration: 300, maxZoom: 1.1 }) },
    { label: 'Reset layout (auto-arrange)', short: 'Reset layout', icon: LayoutGrid, fn: resetLayout },
    { label: 'Add note', short: 'Add note', icon: StickyNote, fn: p.onAddNote },
    { label: 'Keyboard shortcuts (?)', short: 'Shortcuts & help', icon: Keyboard, fn: p.onShortcuts },
  ];

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)] dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-14 items-center gap-1 pr-[max(0.5rem,env(safe-area-inset-right))] pl-[max(0.5rem,env(safe-area-inset-left))] sm:gap-2 sm:pr-[max(0.75rem,env(safe-area-inset-right))] sm:pl-[max(0.75rem,env(safe-area-inset-left))]">
        <Link
          to={`/challenges/${p.question.slug}`}
          className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Back to challenge details"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 lg:hidden" aria-label="Toggle component library" onClick={p.onToggleLibrary}>
          <PanelLeft className="h-4 w-4" />
        </Button>

        {/* Title takes the remaining space and truncates instead of pushing buttons off-screen. */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-sm font-semibold" title={p.question.title}>
              {p.question.title}
            </h1>
            <DifficultyBadge difficulty={p.question.difficulty} className="hidden shrink-0 sm:inline-flex" />
          </div>
          <SaveIndicator status={p.status} lastSavedAt={p.lastSavedAt} />
        </div>

        {/* Full tool row only where it fits; smaller screens use the "More" menu. */}
        <div className="hidden shrink-0 items-center gap-0.5 border-l border-slate-200 pl-2 dark:border-slate-800 xl:flex">
          {tools.map((t, i) => (
            <span key={t.label} className="flex items-center">
              {(i === 2 || i === 5) && <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" aria-hidden />}
              <IconAction label={t.label} onClick={t.fn} disabled={t.disabled}>
                <t.icon className="h-4 w-4" />
              </IconAction>
            </span>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Button variant="ghost" size="sm" className="hidden lg:inline-flex" icon={<Lightbulb className="h-4 w-4 text-amber-500" />} onClick={p.onHints}>
            Hints
          </Button>
          <Button variant="outline" size="sm" className="px-2.5 sm:px-3" icon={<ShieldCheck className="h-4 w-4" />} onClick={p.onValidate} data-testid="validate-button">
            <span className="hidden sm:inline">Validate</span>
            <span className="sr-only sm:hidden">Validate design</span>
          </Button>
          <Button size="sm" className="px-2.5 sm:px-3" icon={<Send className="h-4 w-4" />} onClick={p.onEvaluate} loading={p.evaluating} data-testid="evaluate-button">
            <span className="hidden sm:inline">Evaluate</span>
            <span className="sr-only sm:hidden">Submit for evaluation</span>
          </Button>
          <Button variant="success" size="sm" className="hidden md:inline-flex" icon={<Flag className="h-4 w-4" />} onClick={p.onFinalSubmit} data-testid="final-submit-button">
            Final submit
          </Button>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 xl:hidden" aria-label="Toggle properties panel" onClick={p.onToggleProperties}>
            <PanelRight className="h-4 w-4" />
            {p.hasSelection && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-indigo-500" aria-hidden />}
          </Button>
          <div className="relative xl:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {menu && (
              <>
                {/* Tap anywhere outside to close. */}
                <button className="fixed inset-0 z-[1290] cursor-default" aria-label="Close menu" tabIndex={-1} onClick={() => setMenu(false)} />
                <div
                  className="absolute right-0 top-10 z-[1300] max-h-[70dvh] w-56 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  role="menu"
                  onKeyDown={(e) => e.key === 'Escape' && setMenu(false)}
                >
                  <MenuItem className="md:hidden" icon={Flag} label="Final submit" onClick={() => { setMenu(false); p.onFinalSubmit(); }} />
                  <MenuItem className="lg:hidden" icon={Lightbulb} label="Hints" onClick={() => { setMenu(false); p.onHints(); }} />
                  <div className="my-1 h-px bg-slate-100 dark:bg-slate-800 lg:hidden" aria-hidden />
                  {tools.map((t) => (
                    <MenuItem key={t.label} icon={t.icon} label={t.short} disabled={t.disabled} onClick={() => { setMenu(false); t.fn(); }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon: Icon, label, onClick, disabled, className }: { icon: typeof Flag; label: string; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden /> {label}
    </button>
  );
}
