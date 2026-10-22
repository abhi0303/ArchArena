import { z } from 'zod';
import type { ComponentCategoryId } from '../catalog/components';
import { diagramSnapshotSchema } from '../diagram/schema';
import type { DiagramSnapshot } from '../diagram/types';
import type { EvaluationReport, Rubric } from '../evaluation/types';
import type { LevelInfo } from '../gamification/config';
import type { RewardLine } from '../gamification/scoring';
import type {
  Bilingual,
  Clarification,
  Difficulty,
  ExplanationLanguage,
  QuestionCategory,
  QuestionSource,
  ReferenceArchitecture,
  Requirement,
  StarterNode,
} from '../questions/types';

// ── Request schemas (validated on the server, reused by the client) ─────────
export const emailSchema = z.email('Enter a valid email address').max(254).transform((e) => e.trim().toLowerCase());
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use at most 128 characters')
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), 'Include at least one letter and one number');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1, 'Enter your name').max(60),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password').max(128),
});

export const googleLoginSchema = z.object({ credential: z.string().min(10).max(5000) });

export const languageSchema = z.enum(['en', 'hinglish']);

export const updatePreferencesSchema = z.object({
  preferredLanguage: languageSchema.optional(),
  displayName: z.string().trim().min(1).max(60).optional(),
});

export const saveDraftSchema = z.object({
  diagram: diagramSnapshotSchema,
  /** Revision the client's copy was based on (optimistic concurrency). */
  baseRevision: z.number().int().min(0),
  /** Overwrite even if the server copy is newer (used after the user resolves a conflict). */
  force: z.boolean().optional(),
  clientUpdatedAt: z.iso.datetime().optional(),
});

export const createAttemptSchema = z.object({
  questionId: z.string().min(1).max(40),
  diagram: diagramSnapshotSchema,
});

export const finalSubmitSchema = z.object({
  attemptId: z.uuid(),
  idempotencyKey: z.string().min(8).max(100),
});

export const hintUsageSchema = z.object({ level: z.number().int().min(1).max(4) });

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type SaveDraftInput = z.input<typeof saveDraftSchema>;

// ── Response DTOs ───────────────────────────────────────────────────────────
export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: ExplanationLanguage;
  xp: number;
  level: LevelInfo;
  createdAt: string;
}

export interface QuestionSummaryDTO {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  category: QuestionCategory;
  estimatedMinutes: number;
  tags: string[];
  concepts: string[];
  sortOrder: number;
}

export interface QuestionDetailDTO extends QuestionSummaryDTO {
  statement: Bilingual;
  functional: Requirement[];
  nonFunctional: Requirement[];
  constraints: Bilingual<string[]>;
  clarifications: Clarification[];
  scale: { label: string; value: string }[];
  suggestedCategories: ComponentCategoryId[];
  starter: StarterNode[];
  hints: Bilingual[];
  rubric: Rubric;
  rubricVersion: number;
  sources: QuestionSource[];
  interviewClaim: 'commonly-discussed';
}

export interface ReferenceDTO {
  questionId: string;
  reference: ReferenceArchitecture;
  diagram: DiagramSnapshot;
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'evaluated' | 'completed';

export interface ProgressDTO {
  questionId: string;
  status: ProgressStatus;
  bestScore: number | null;
  bestStars: number;
  attemptsCount: number;
  hintsUsed: number;
  referenceRevealed: boolean;
  lastActivityAt: string | null;
  completedAt: string | null;
}

export interface DraftDTO {
  questionId: string;
  diagram: DiagramSnapshot;
  revision: number;
  diagramHash: string;
  updatedAt: string;
}

export interface DraftSummaryDTO {
  questionId: string;
  revision: number;
  updatedAt: string;
  components: number;
}

export interface AttemptSummaryDTO {
  id: string;
  questionId: string;
  score: number;
  stars: number;
  rating: number;
  diagramHash: string;
  createdAt: string;
  isFinal: boolean;
}

export interface AttemptDTO extends AttemptSummaryDTO {
  diagram: DiagramSnapshot;
  report: EvaluationReport;
  rubricVersion: number;
  /** Previous attempt on the same question (for before/after comparison). */
  previous: AttemptSummaryDTO & { categories: { key: string; score: number }[] } | null;
}

export interface EarnedAchievementDTO {
  key: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  awardedAt: string;
}

export interface SubmissionResultDTO {
  submissionId: string;
  attemptId: string;
  questionId: string;
  score: number;
  stars: number;
  rating: number;
  completed: boolean;
  xpAwarded: number;
  rewards: RewardLine[];
  achievements: EarnedAchievementDTO[];
  bestScore: number;
  bestStars: number;
  previousBestScore: number | null;
  user: { xp: number; level: LevelInfo };
  report: EvaluationReport;
  createdAt: string;
  /** True when this response replays an earlier identical request. */
  replayed: boolean;
}

export interface DashboardDTO {
  totals: {
    completed: number;
    totalQuestions: number;
    stars: number;
    maxStars: number;
    xp: number;
    averageRating: number | null;
    attempts: number;
  };
  level: LevelInfo;
  byDifficulty: Record<Difficulty, { completed: number; total: number; stars: number }>;
  recentAttempts: (AttemptSummaryDTO & { title: string; slug: string; difficulty: Difficulty })[];
  drafts: (DraftSummaryDTO & { title: string; slug: string; difficulty: Difficulty })[];
  recommended: { questionId: string; slug: string; title: string; difficulty: Difficulty; reason: string } | null;
  continueWith: { questionId: string; slug: string; title: string } | null;
  weakTopics: { key: string; label: string; averageScore: number; samples: number }[];
  achievements: EarnedAchievementDTO[];
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}
