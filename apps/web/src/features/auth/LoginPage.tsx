import { loginSchema } from '@arch-arena/shared';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { errorMessage, fieldErrors } from '@/lib/api';
import { useLogin, useMe } from '@/lib/queries';
import { toast } from '@/stores/toast';
import { AuthCard, GoogleButton, useSafeRedirect } from './AuthShared';

export default function LoginPage() {
  const { data: user } = useMe();
  const login = useLogin();
  const navigate = useNavigate();
  const redirect = useSafeRedirect();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (user) return <Navigate to={redirect} replace />;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    try {
      const r = await login.mutateAsync(parsed.data);
      toast.success(`Welcome back, ${r.user.displayName}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Continue your system design practice."
      footer={
        <>
          New here?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => void submit(e)} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className="input" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-err' : undefined} />
          {errors.email && (
            <p id="email-err" className="mt-1 text-xs text-rose-600">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" className="input" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-err' : undefined} />
          {errors.password && (
            <p id="password-err" className="mt-1 text-xs text-rose-600">
              {errors.password}
            </p>
          )}
        </div>
        {formError && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" loading={login.isPending}>
          Sign in
        </Button>
      </form>
      <GoogleButton onSuccess={() => navigate(redirect, { replace: true })} />
    </AuthCard>
  );
}
