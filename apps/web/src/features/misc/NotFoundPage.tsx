import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <EmptyState
        icon={<Compass className="h-8 w-8" />}
        title="Page not found"
        description="The page you are looking for does not exist or has moved."
        action={<ButtonLink to="/challenges">Browse challenges</ButtonLink>}
      />
    </div>
  );
}
