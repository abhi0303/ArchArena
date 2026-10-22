import { registerSchema } from '@arch-arena/shared';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { errorMessage, fieldErrors } from '@/lib/api';
import { useMe, useRegister } from '@/lib/queries';
import { toast } from '@/stores/toast';
import { AuthCard, GoogleButton, useSafeRedirect } from './AuthShared';

export default function RegisterPage() {
  const { data: user } = useMe();
  const register = useRegister();
  const navigate = useNavigate();
  const redirect = useSafeRedirect();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (user) return <Navigate to={redirect} replace />;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    try {
      const r = await register.mutateAsync(parsed.data);
      toast.success(`Welcome, ${r.user.displayName}!`, 'Your progress will now be saved to your account.');
      navigate(redirect, { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
    }
  };

  const field = (name: string, label: string, type: string, autoComplete: string, hint?: string) => (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="input"
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-err` : hint ? `${name}-hint` : undefined}
      />
      {errors[name] ? (
        <p id={`${name}-err`} className="mt-1 text-xs text-rose-600">
          {errors[name]}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className="mt-1 text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save drafts, get scored, earn stars and XP."
      footer={
        <>
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => void submit(e)} noValidate className="space-y-4">
        {field('displayName', 'Name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Password', 'password', 'new-password', 'At least 8 characters with a letter and a number.')}
        {formError && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" loading={register.isPending}>
          Create account
        </Button>
      </form>
      <GoogleButton onSuccess={() => navigate(redirect, { replace: true })} />
    </AuthCard>
  );
}
