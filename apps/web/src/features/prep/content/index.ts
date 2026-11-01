import { PREP_CATEGORIES } from '../catalog';
import type { PrepQuestion } from '../types';
import { backendQuestions } from './backend';
import { databaseQuestions } from './database';
import { devopsQuestions } from './devops';
import { messagingQuestions } from './messaging';
import { practicesQuestions } from './practices';
import { securityQuestions, serverQuestions } from './servers-security';
import { systemDesignQuestions } from './system-design';

const ALL: PrepQuestion[] = [
  ...backendQuestions,
  ...databaseQuestions,
  ...systemDesignQuestions,
  ...messagingQuestions,
  ...serverQuestions,
  ...securityQuestions,
  ...devopsQuestions,
  ...practicesQuestions,
];

const order = (q: PrepQuestion) => {
  const ci = PREP_CATEGORIES.findIndex((c) => c.id === q.category);
  const ti = PREP_CATEGORIES[ci]?.topics.findIndex((t) => t.id === q.topic) ?? 0;
  return ci * 100 + ti;
};

/** Every question, in category and topic order (questions keep their file order inside a topic). */
export const PREP_QUESTIONS: PrepQuestion[] = ALL.map((q, i) => ({ q, i }))
  .sort((a, b) => order(a.q) - order(b.q) || a.i - b.i)
  .map(({ q }) => q);

const byId = new Map(PREP_QUESTIONS.map((q) => [q.id, q]));

export function getPrepQuestion(id: string): PrepQuestion | undefined {
  return byId.get(id);
}

export function questionsIn(category: string, topic?: string): PrepQuestion[] {
  return PREP_QUESTIONS.filter((q) => q.category === category && (!topic || q.topic === topic));
}

/** Lower-case text used by search: the question in both languages, tags, topic and keywords. */
export function prepSearchText(q: PrepQuestion): string {
  return [q.question.en, q.question.hi, q.answer.en, ...q.tags, ...q.interview.keywords, q.category, q.topic].join(' ').toLowerCase();
}
