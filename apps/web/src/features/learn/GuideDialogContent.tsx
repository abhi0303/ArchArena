import { getGuide } from './content';
import { GuideView } from './GuideView';
import { GlossarySkip } from '@/features/glossary/InlineText';
import { termIdsForComponent } from '@/features/glossary';

/** Loaded on demand inside the playground's “Learn” dialog. */
export default function GuideDialogContent({ type }: { type: string }) {
  const guide = getGuide(type);
  if (!guide) return <p className="text-sm text-slate-500">No guide is available for this component yet.</p>;
  return (
    <GlossarySkip ids={termIdsForComponent(type)}>
      <GuideView guide={guide} compact />
    </GlossarySkip>
  );
}
