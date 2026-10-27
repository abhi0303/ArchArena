import { useExplanation } from '@/components/LanguageToggle';
import type { Text } from './types';

/** Plain strings are shown as-is; bilingual text follows the language toggle. */
export function useText() {
  const t = useExplanation();
  return (v: Text) => (typeof v === 'string' ? v : t(v));
}
