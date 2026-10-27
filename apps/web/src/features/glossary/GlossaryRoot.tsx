import { lazy, Suspense } from 'react';
import { useGlossary } from './store';

const GlossaryDialog = lazy(() => import('./GlossaryDialog'));

/** Mounted once at the app root; loads the glossary popup the first time a term is opened. */
export function GlossaryRoot() {
  const openId = useGlossary((s) => s.openId);
  if (!openId) return null;
  return (
    <Suspense fallback={null}>
      <GlossaryDialog />
    </Suspense>
  );
}
