import { getGuide } from './content';
import { GuideView } from './GuideView';

/** Loaded on demand inside the playground's “Learn” dialog. */
export default function GuideDialogContent({ type }: { type: string }) {
  const guide = getGuide(type);
  if (!guide) return <p className="text-sm text-slate-500">No guide is available for this component yet.</p>;
  return <GuideView guide={guide} compact />;
}
