import { randomUUID } from 'node:crypto';
import { getQuestionById, referenceToDiagram, starterToDiagram } from '@arch-arena/shared/questions';
import type { DiagramSnapshot } from '@arch-arena/shared';
import request from 'supertest';
import { expect } from 'vitest';
import { createApp } from '../src/app';

export const { app, db } = createApp();

export const PASSWORD = 'correct-horse-42';

export interface TestUser {
  agent: ReturnType<typeof request.agent>;
  email: string;
  id: string;
}

/** Registers a fresh user and returns a cookie-carrying agent. */
export async function newUser(displayName = 'Test User'): Promise<TestUser> {
  const agent = request.agent(app);
  const email = `test-${randomUUID()}@example.com`;
  const res = await agent.post('/api/auth/register').send({ email, password: PASSWORD, displayName });
  expect(res.status).toBe(201);
  return { agent, email, id: res.body.user.id };
}

export function referenceDiagram(questionId: string): DiagramSnapshot {
  const q = getQuestionById(questionId);
  if (!q) throw new Error(`Unknown question ${questionId}`);
  return referenceToDiagram(q.reference);
}

export function starterDiagram(questionId: string): DiagramSnapshot {
  const q = getQuestionById(questionId);
  if (!q) throw new Error(`Unknown question ${questionId}`);
  return starterToDiagram(q.starter);
}

/** Evaluates a diagram on the server and returns the stored attempt. */
export async function evaluate(user: TestUser, questionId: string, diagram: DiagramSnapshot) {
  const res = await user.agent.post('/api/attempts').send({ questionId, diagram });
  expect(res.status).toBe(201);
  return res.body.attempt as { id: string; score: number; stars: number; report: { score: number } };
}

export async function currentXp(user: TestUser): Promise<number> {
  const res = await user.agent.get('/api/auth/me');
  return res.body.user.xp as number;
}
