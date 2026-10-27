import type { ExplanationLanguage } from '@arch-arena/shared';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

interface PreferencesState {
  /** Language for problem explanations only. The rest of the UI is always English. */
  language: ExplanationLanguage;
  theme: ThemePreference;
  walkthroughDone: boolean;
  /** Underline glossary terms in explanations. */
  termHints: boolean;
  setLanguage: (l: ExplanationLanguage) => void;
  setTheme: (t: ThemePreference) => void;
  setWalkthroughDone: (done: boolean) => void;
  setTermHints: (on: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'system',
      walkthroughDone: false,
      termHints: true,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setWalkthroughDone: (walkthroughDone) => set({ walkthroughDone }),
      setTermHints: (termHints) => set({ termHints }),
    }),
    {
      name: 'archarena-preferences',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export function applyTheme(theme: ThemePreference): void {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', !!dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1020' : '#4f46e5');
}

export function isDarkActive(): boolean {
  return document.documentElement.classList.contains('dark');
}

function subscribeDark(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => obs.disconnect();
}

/** Reactive "is dark mode currently applied" flag. */
export function useIsDark(): boolean {
  return useSyncExternalStore(subscribeDark, isDarkActive, () => false);
}
