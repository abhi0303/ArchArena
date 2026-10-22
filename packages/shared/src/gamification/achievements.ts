import type { Difficulty } from '../questions/types';

export interface AchievementDefinition {
  key: string;
  title: string;
  description: string;
  /** Lucide icon name. */
  icon: string;
  xp: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    key: 'first-architecture',
    title: 'First Architecture',
    description: 'Complete a challenge with a final submission (score 40 or more).',
    icon: 'Sparkles',
    xp: 50,
  },
  {
    key: 'first-five-star',
    title: 'First Five-Star Design',
    description: 'Earn 5 stars on a final submission.',
    icon: 'Star',
    xp: 100,
  },
  {
    key: 'ten-completed',
    title: 'Ten Challenges Completed',
    description: 'Complete 10 different challenges.',
    icon: 'Trophy',
    xp: 150,
  },
  {
    key: 'all-easy',
    title: 'All Easy Challenges Completed',
    description: 'Complete every Easy challenge.',
    icon: 'Medal',
    xp: 200,
  },
  {
    key: 'medium-master',
    title: 'Medium Master',
    description: 'Complete every Medium challenge.',
    icon: 'Crown',
    xp: 500,
  },
  {
    key: 'hard-finisher',
    title: 'Hard Challenge Finisher',
    description: 'Complete your first Hard challenge.',
    icon: 'Mountain',
    xp: 150,
  },
  {
    key: 'perfect-connection-flow',
    title: 'Perfect Connection Flow',
    description: 'Score 100% in “Connections & data flow” on a final submission.',
    icon: 'Cable',
    xp: 75,
  },
  {
    key: 'improved-score',
    title: 'Improved Previous Score',
    description: 'Beat your previous best final score on a challenge.',
    icon: 'TrendingUp',
    xp: 50,
  },
];

export interface AchievementContext {
  completedByDifficulty: Record<Difficulty, number>;
  totalByDifficulty: Record<Difficulty, number>;
  submission: {
    difficulty: Difficulty;
    score: number;
    stars: number;
    connectionsScore: number;
    /** Best final score on this question before this submission, if any. */
    previousBestScore: number | null;
    completed: boolean;
  };
}

/** Returns achievements whose conditions are met and that the user does not have yet. */
export function newlyEarnedAchievements(ctx: AchievementContext, alreadyEarned: Set<string>): AchievementDefinition[] {
  const s = ctx.submission;
  const totalCompleted = ctx.completedByDifficulty.easy + ctx.completedByDifficulty.medium + ctx.completedByDifficulty.hard;
  const conditions: Record<string, boolean> = {
    'first-architecture': s.completed,
    'first-five-star': s.stars >= 5,
    'ten-completed': totalCompleted >= 10,
    'all-easy': ctx.totalByDifficulty.easy > 0 && ctx.completedByDifficulty.easy >= ctx.totalByDifficulty.easy,
    'medium-master': ctx.totalByDifficulty.medium > 0 && ctx.completedByDifficulty.medium >= ctx.totalByDifficulty.medium,
    'hard-finisher': s.difficulty === 'hard' && s.completed,
    'perfect-connection-flow': s.connectionsScore >= 100,
    'improved-score': s.previousBestScore !== null && s.score > s.previousBestScore,
  };
  return ACHIEVEMENTS.filter((a) => conditions[a.key] && !alreadyEarned.has(a.key));
}

export function getAchievement(key: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
