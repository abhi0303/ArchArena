import {
  getAchievement,
  levelFromXp,
  type AttemptSummaryDTO,
  type DiagramSnapshot,
  type DraftDTO,
  type EarnedAchievementDTO,
  type ProgressDTO,
  type UserDTO,
} from '@arch-arena/shared';
import type { DesignAttempt, DesignDraft, EvaluationResult, UserAchievement, UserQuestionProgress } from '@prisma/client';
import type { AuthUser } from '../auth/sessions';

export function toUserDTO(user: AuthUser): UserDTO {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    preferredLanguage: user.preferredLanguage,
    xp: user.xp,
    level: levelFromXp(user.xp),
    createdAt: user.createdAt.toISOString(),
  };
}

export function toProgressDTO(p: UserQuestionProgress): ProgressDTO {
  return {
    questionId: p.questionId,
    status: p.status,
    bestScore: p.bestScore ?? p.bestAttemptScore,
    bestStars: p.bestStars,
    attemptsCount: p.attemptsCount,
    hintsUsed: p.hintsUsed,
    referenceRevealed: !!p.referenceRevealedAt,
    lastActivityAt: p.lastActivityAt.toISOString(),
    completedAt: p.firstCompletedAt?.toISOString() ?? null,
  };
}

export function toDraftDTO(d: DesignDraft): DraftDTO {
  return {
    questionId: d.questionId,
    diagram: d.diagram as unknown as DiagramSnapshot,
    revision: d.revision,
    diagramHash: d.diagramHash,
    updatedAt: d.updatedAt.toISOString(),
  };
}

export function toAttemptSummary(
  a: Pick<DesignAttempt, 'id' | 'questionId' | 'diagramHash' | 'createdAt'> & {
    evaluation: Pick<EvaluationResult, 'score' | 'stars' | 'rating'> | null;
    submission?: { id: string } | null;
  },
): AttemptSummaryDTO {
  return {
    id: a.id,
    questionId: a.questionId,
    score: a.evaluation?.score ?? 0,
    stars: a.evaluation?.stars ?? 0,
    rating: a.evaluation?.rating ?? 0,
    diagramHash: a.diagramHash,
    createdAt: a.createdAt.toISOString(),
    isFinal: !!a.submission,
  };
}

export function toEarnedAchievement(a: Pick<UserAchievement, 'achievementKey' | 'awardedAt'>): EarnedAchievementDTO | null {
  const def = getAchievement(a.achievementKey);
  if (!def) return null;
  return { ...def, awardedAt: a.awardedAt.toISOString() };
}
