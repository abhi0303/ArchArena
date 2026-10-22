import type {
  ACHIEVEMENTS,
  AttemptDTO,
  AttemptSummaryDTO,
  DashboardDTO,
  DiagramSnapshot,
  DraftSummaryDTO,
  EarnedAchievementDTO,
  ExplanationLanguage,
  ProgressDTO,
  QuestionDetailDTO,
  QuestionSummaryDTO,
  ReferenceDTO,
  SubmissionResultDTO,
  UserDTO,
} from '@arch-arena/shared';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, isApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) => !isApiError(err) && count < 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const qk = {
  me: ['me'] as const,
  authConfig: ['auth-config'] as const,
  questions: ['questions'] as const,
  question: (key: string) => ['question', key] as const,
  progress: ['progress'] as const,
  dashboard: ['dashboard'] as const,
  drafts: ['drafts'] as const,
  attempts: (questionId: string) => ['attempts', questionId] as const,
  attempt: (id: string) => ['attempt', id] as const,
  submission: (id: string) => ['submission', id] as const,
  reference: (key: string) => ['reference', key] as const,
  achievements: ['achievements'] as const,
};

// ── Auth ────────────────────────────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: () => api<{ user: UserDTO | null }>('/auth/me').then((r) => r.user),
    staleTime: 5 * 60_000,
  });
}

export function useAuthConfig() {
  return useQuery({
    queryKey: qk.authConfig,
    queryFn: () => api<{ googleClientId: string | null }>('/auth/config'),
    staleTime: Infinity,
  });
}

function useAuthSuccess() {
  const qc = useQueryClient();
  return (user: UserDTO) => {
    qc.setQueryData(qk.me, user);
    void qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'me' && q.queryKey[0] !== 'questions' && q.queryKey[0] !== 'question' });
  };
}

export function useLogin() {
  const onSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => api<{ user: UserDTO }>('/auth/login', { method: 'POST', body }),
    onSuccess: (r) => onSuccess(r.user),
  });
}

export function useRegister() {
  const onSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: (body: { email: string; password: string; displayName: string }) => api<{ user: UserDTO }>('/auth/register', { method: 'POST', body }),
    onSuccess: (r) => onSuccess(r.user),
  });
}

export function useGoogleLogin() {
  const onSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: (credential: string) => api<{ user: UserDTO }>('/auth/google', { method: 'POST', body: { credential } }),
    onSuccess: (r) => onSuccess(r.user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      qc.setQueryData(qk.me, null);
      qc.removeQueries({ predicate: (q) => !['questions', 'question', 'auth-config', 'me'].includes(String(q.queryKey[0])) });
    },
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { preferredLanguage?: ExplanationLanguage; displayName?: string }) =>
      api<{ user: UserDTO }>('/me/preferences', { method: 'PATCH', body }),
    onSuccess: (r) => qc.setQueryData(qk.me, r.user),
  });
}

// ── Questions ───────────────────────────────────────────────────────────────
export function useQuestions() {
  return useQuery({
    queryKey: qk.questions,
    queryFn: () => api<{ questions: QuestionSummaryDTO[] }>('/questions').then((r) => r.questions),
    staleTime: 10 * 60_000,
  });
}

export function useQuestion(key: string | undefined) {
  return useQuery({
    queryKey: qk.question(key ?? ''),
    queryFn: () => api<{ question: QuestionDetailDTO }>(`/questions/${encodeURIComponent(key!)}`).then((r) => r.question),
    enabled: !!key,
    staleTime: 10 * 60_000,
  });
}

export function useReference(key: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: qk.reference(key ?? ''),
    queryFn: () => api<ReferenceDTO>(`/questions/${encodeURIComponent(key!)}/reference`),
    enabled: !!key && enabled,
    staleTime: Infinity,
    retry: false,
  });
}

export function useRecordHint(key: string) {
  return useMutation({
    mutationFn: (level: number) => api<{ hintsUsed: number } | undefined>(`/questions/${encodeURIComponent(key)}/hints`, { method: 'POST', body: { level } }),
  });
}

// ── Progress & dashboard ────────────────────────────────────────────────────
export function useProgress(enabled = true) {
  return useQuery({
    queryKey: qk.progress,
    queryFn: () => api<{ progress: ProgressDTO[] }>('/me/progress').then((r) => r.progress),
    enabled,
  });
}

export function useDashboard(enabled = true) {
  return useQuery({ queryKey: qk.dashboard, queryFn: () => api<DashboardDTO>('/me/dashboard'), enabled });
}

export function useDrafts(enabled = true) {
  return useQuery({
    queryKey: qk.drafts,
    queryFn: () => api<{ drafts: DraftSummaryDTO[] }>('/drafts').then((r) => r.drafts),
    enabled,
  });
}

export function useAchievements(enabled = true) {
  return useQuery({
    queryKey: qk.achievements,
    queryFn: () => api<{ all: typeof ACHIEVEMENTS; earned: EarnedAchievementDTO[] }>('/me/achievements'),
    enabled,
  });
}

// ── Attempts & submissions ──────────────────────────────────────────────────
export function useAttempts(questionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.attempts(questionId ?? ''),
    queryFn: () => api<{ attempts: AttemptSummaryDTO[] }>(`/attempts?questionId=${encodeURIComponent(questionId!)}`).then((r) => r.attempts),
    enabled: !!questionId && enabled,
  });
}

export function useAttempt(id: string | undefined) {
  return useQuery({
    queryKey: qk.attempt(id ?? ''),
    queryFn: () => api<{ attempt: AttemptDTO }>(`/attempts/${id}`).then((r) => r.attempt),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useEvaluate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { questionId: string; diagram: DiagramSnapshot }) =>
      api<{ attempt: AttemptDTO }>('/attempts', { method: 'POST', body }).then((r) => r.attempt),
    onSuccess: (attempt) => {
      qc.setQueryData(qk.attempt(attempt.id), attempt);
      void qc.invalidateQueries({ queryKey: qk.attempts(attempt.questionId) });
      void qc.invalidateQueries({ queryKey: qk.progress });
      void qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}

export function useFinalSubmit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { attemptId: string; idempotencyKey: string }) =>
      api<{ submission: SubmissionResultDTO }>('/submissions', { method: 'POST', body }).then((r) => r.submission),
    onSuccess: (s) => {
      qc.setQueryData(qk.submission(s.submissionId), s);
      qc.setQueryData<UserDTO | null>(qk.me, (u) => (u ? { ...u, xp: s.user.xp, level: s.user.level } : u));
      for (const key of [qk.progress, qk.dashboard, qk.achievements, qk.attempts(s.questionId)]) void qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useSubmission(id: string | undefined) {
  return useQuery({
    queryKey: qk.submission(id ?? ''),
    queryFn: () => api<{ submission: SubmissionResultDTO }>(`/submissions/${id}`).then((r) => r.submission),
    enabled: !!id,
    staleTime: Infinity,
  });
}
