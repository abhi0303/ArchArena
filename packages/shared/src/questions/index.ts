import { easyQuestions } from './data/easy';
import { easyQuestions2 } from './data/easy-2';
import { easyQuestions3 } from './data/easy-3';
import { mediumQuestions1 } from './data/medium-1';
import { mediumQuestions2 } from './data/medium-2';
import { mediumQuestions3 } from './data/medium-3';
import { mediumQuestions4 } from './data/medium-4';
import { hardQuestions1 } from './data/hard-1';
import { hardQuestions2 } from './data/hard-2';
import { hardQuestions3 } from './data/hard-3';
import { hardQuestions4 } from './data/hard-4';
import { hardQuestions5 } from './data/hard-5';
import type { QuestionDefinition } from './types';
export { EXPECTED_DISTRIBUTION, validateQuestionBank, validateQuestion } from './validation';

export * from './types';
export { referenceToDiagram, starterToDiagram, toEvaluationInput, requirementRefs } from './reference';

export const QUESTIONS: QuestionDefinition[] = [...easyQuestions, ...easyQuestions2, ...easyQuestions3, ...mediumQuestions1, ...mediumQuestions2, ...mediumQuestions3, ...mediumQuestions4, ...hardQuestions1, ...hardQuestions2, ...hardQuestions3, ...hardQuestions4, ...hardQuestions5];



export function getQuestionById(id: string): QuestionDefinition | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getQuestionBySlug(slug: string): QuestionDefinition | undefined {
  return QUESTIONS.find((q) => q.slug === slug);
}
