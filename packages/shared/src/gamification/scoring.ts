import type { Difficulty } from '../questions/types';
import { GAMIFICATION, type GamificationConfig } from './config';

/** Stars (0–5) earned for a normalized score. */
export function starsForScore(score: number, thresholds = GAMIFICATION.starThresholds): number {
  let stars = 0;
  for (const t of thresholds) if (score >= t) stars++;
  return stars;
}

/** Numerical rating out of 5.0, e.g. 84 → 4.2. */
export function ratingForScore(score: number): number {
  return Math.round((Math.max(0, Math.min(100, score)) / 20) * 10) / 10;
}

export function ratingLabel(score: number): string {
  if (score >= 90) return 'Outstanding';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 40) return 'Developing';
  return 'Needs work';
}

/**
 * XP that a final submission with this score is *worth* for a question.
 * Rewards for a question are the best value ever reached: improving a solution
 * only awards the difference, which prevents XP farming through resubmission.
 */
export function challengeXpValue(difficulty: Difficulty, score: number, config: GamificationConfig = GAMIFICATION): number {
  if (score < config.completionMinScore) return 0;
  const [lo, hi] = config.xp.qualityRange;
  const quality = lo + (hi - lo) * (Math.max(0, Math.min(100, score)) / 100);
  const stars = starsForScore(score, config.starThresholds);
  return Math.round(config.xp.base[difficulty] * quality + stars * config.xp.perStar);
}

export interface RewardInput {
  difficulty: Difficulty;
  score: number;
  /** XP already awarded for this question's challenge value (excluding one-time bonuses). */
  previouslyAwardedValue: number;
  /** Whether the question was completed before this submission. */
  previouslyCompleted: boolean;
  /** Whether a hint-free bonus was already awarded for this question. */
  hintFreeBonusAwarded: boolean;
  hintsUsed: number;
}

export interface RewardLine {
  reason: 'challenge_completion' | 'score_improvement' | 'first_completion_bonus' | 'hint_free_bonus';
  amount: number;
  label: string;
}

/** Computes the XP lines for a final submission. Pure and deterministic. */
export function computeSubmissionRewards(input: RewardInput, config: GamificationConfig = GAMIFICATION): RewardLine[] {
  const lines: RewardLine[] = [];
  const completed = input.score >= config.completionMinScore;
  if (!completed) return lines;
  const value = challengeXpValue(input.difficulty, input.score, config);
  const delta = Math.max(0, value - input.previouslyAwardedValue);
  if (delta > 0) {
    lines.push({
      reason: input.previouslyAwardedValue > 0 ? 'score_improvement' : 'challenge_completion',
      amount: delta,
      label: input.previouslyAwardedValue > 0 ? 'Improved your best solution' : 'Challenge completed',
    });
  }
  if (!input.previouslyCompleted) {
    lines.push({ reason: 'first_completion_bonus', amount: config.xp.firstCompletionBonus, label: 'First-time completion' });
  }
  if (input.hintsUsed === 0 && !input.hintFreeBonusAwarded && config.xp.hintFreeBonus > 0) {
    lines.push({ reason: 'hint_free_bonus', amount: config.xp.hintFreeBonus, label: 'Solved without hints' });
  }
  return lines;
}
