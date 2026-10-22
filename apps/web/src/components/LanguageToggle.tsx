import type { ExplanationLanguage } from '@arch-arena/shared';
import { Languages } from 'lucide-react';
import { useMe, useUpdatePreferences } from '@/lib/queries';
import { usePreferences } from '@/stores/preferences';
import { Segmented } from './ui/misc';

/**
 * Toggles the language of *explanatory content only* (problem statement, requirements, hints, clarifications).
 * Everything else in the UI stays English.
 */
export function LanguageToggle({ size = 'sm' }: { size?: 'xs' | 'sm' }) {
  const language = usePreferences((s) => s.language);
  const setLanguage = usePreferences((s) => s.setLanguage);
  const { data: user } = useMe();
  const update = useUpdatePreferences();
  const change = (l: ExplanationLanguage) => {
    setLanguage(l);
    if (user && user.preferredLanguage !== l) update.mutate({ preferredLanguage: l });
  };
  return (
    <div className="inline-flex items-center gap-2">
      <Languages className="h-4 w-4 text-slate-400" aria-hidden />
      <Segmented
        label="Explanation language"
        size={size}
        value={language}
        onChange={change}
        options={[
          { value: 'en', label: 'English' },
          { value: 'hinglish', label: 'Hinglish' },
        ]}
      />
    </div>
  );
}

/** Picks the English or Hinglish variant of a bilingual text. */
export function useExplanation() {
  const language = usePreferences((s) => s.language);
  return <T,>(text: { en: T; hi: T }): T => (language === 'hinglish' ? text.hi : text.en);
}
