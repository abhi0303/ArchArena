import { Underline } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/stores/preferences';
import { LanguageToggle } from './LanguageToggle';

/** Pages whose explanations can be read in English or Hinglish. */
const EXPLAINED = [/^\/learn(\/|$)/, /^\/prep(\/|$)/, /^\/challenges\/[^/]+/];

/**
 * A floating language switch (plus the “underline terms” switch) that appears once the reader
 * scrolls away from the page header, so it is always within reach on long pages.
 */
export function FloatingLanguageBar() {
  const { pathname } = useLocation();
  const termHints = usePreferences((s) => s.termHints);
  const setTermHints = usePreferences((s) => s.setTermHints);
  const [scrolled, setScrolled] = useState(false);
  const relevant = EXPLAINED.some((re) => re.test(pathname));

  useEffect(() => {
    if (!relevant) return;
    const onScroll = () => setScrolled(window.scrollY > 240);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [relevant, pathname]);

  if (!relevant) return null;
  return (
    <div
      className={cn(
        'fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[1200] flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 py-1 pl-3 pr-1 shadow-lg backdrop-blur transition-all duration-200 dark:border-slate-700 dark:bg-slate-900/95',
        scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
      inert={!scrolled}
      data-testid="floating-language"
    >
      <LanguageToggle size="xs" />
      <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />
      <button
        type="button"
        onClick={() => setTermHints(!termHints)}
        aria-pressed={termHints}
        title={termHints ? 'Hide term underlines' : 'Underline terms you can tap for a meaning'}
        className={cn(
          'flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium',
          termHints ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
        )}
        data-testid="toggle-term-hints"
      >
        <Underline className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Terms</span>
      </button>
    </div>
  );
}
