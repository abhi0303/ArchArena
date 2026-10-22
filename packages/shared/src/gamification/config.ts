import type { Difficulty } from '../questions/types';

/**
 * All reward rules live here so they can be tuned without touching logic.
 * The server is the only place these are applied authoritatively.
 */
export interface GamificationConfig {
  /** Minimum score for 1..5 stars (ascending). */
  starThresholds: [number, number, number, number, number];
  /** Minimum score for a challenge to count as completed on final submission. */
  completionMinScore: number;
  xp: {
    /** Base XP for completing a challenge, by difficulty. */
    base: Record<Difficulty, number>;
    /** Extra XP per earned star. */
    perStar: number;
    /** Multiplier applied to base XP according to score (score / 100 scaled into this range). */
    qualityRange: [number, number];
    /** One-time bonus for the first completion of a challenge. */
    firstCompletionBonus: number;
    /** Optional bonus for completing a challenge without opening hints (never a penalty). */
    hintFreeBonus: number;
  };
  /** Max evaluations per user per question per day (fair-use limit). */
  dailyEvaluationLimit: number;
}

export const GAMIFICATION: GamificationConfig = {
  starThresholds: [40, 55, 70, 80, 90],
  completionMinScore: 40,
  xp: {
    base: { easy: 100, medium: 200, hard: 350 },
    perStar: 20,
    qualityRange: [0.5, 1],
    firstCompletionBonus: 50,
    hintFreeBonus: 25,
  },
  dailyEvaluationLimit: 60,
};

export interface LevelInfo {
  level: number;
  title: string;
  /** XP at which the current level started. */
  currentLevelXp: number;
  /** XP needed to reach the next level. */
  nextLevelXp: number;
  progress: number;
}

const LEVEL_TITLES = [
  'Curious Builder',
  'Junior Engineer',
  'Engineer',
  'Senior Engineer',
  'Tech Lead',
  'Staff Engineer',
  'Senior Staff Engineer',
  'Principal Engineer',
  'Distinguished Architect',
  'Systems Legend',
];

/** Total XP required to reach `level` (level 1 starts at 0). Grows by +100 per level. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * (level + 2);
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const titleIndex = Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 3));
  return {
    level,
    title: LEVEL_TITLES[titleIndex]!,
    currentLevelXp,
    nextLevelXp,
    progress: (xp - currentLevelXp) / (nextLevelXp - currentLevelXp),
  };
}
