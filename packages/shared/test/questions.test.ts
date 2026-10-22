import { describe, expect, it } from 'vitest';
import { evaluateDesign } from '../src/evaluation/engine';
import { QUESTIONS, referenceToDiagram, starterToDiagram, toEvaluationInput } from '../src/questions';
import { EXPECTED_DISTRIBUTION, validateQuestionBank } from '../src/questions/validation';

describe('question bank', () => {
  it('contains exactly 100 questions: 15 Easy, 35 Medium, 50 Hard', () => {
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const q of QUESTIONS) counts[q.difficulty]++;
    expect(counts).toEqual(EXPECTED_DISTRIBUTION);
    expect(QUESTIONS).toHaveLength(100);
  });

  it('passes structural validation with no duplicates', () => {
    const report = validateQuestionBank(QUESTIONS, { strictDistribution: true });
    expect(report.errors).toEqual([]);
  });

  it('has unique ids, slugs and titles', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    expect(new Set(QUESTIONS.map((q) => q.slug)).size).toBe(QUESTIONS.length);
    expect(new Set(QUESTIONS.map((q) => q.title.toLowerCase())).size).toBe(QUESTIONS.length);
  });

  it('provides English and Hinglish for every explanation, requirement and hint', () => {
    for (const q of QUESTIONS) {
      const texts = [q.statement, ...q.functional, ...q.nonFunctional, ...q.hints, ...q.clarifications.flatMap((c) => [c.q, c.a])];
      for (const t of texts) {
        expect(t.en.trim().length, `${q.id} English`).toBeGreaterThan(0);
        expect(t.hi.trim().length, `${q.id} Hinglish`).toBeGreaterThan(0);
        expect(t.hi, `${q.id} Hinglish should differ from English`).not.toBe(t.en);
      }
      expect(q.constraints.hi).toHaveLength(q.constraints.en.length);
      expect(q.hints).toHaveLength(4);
    }
  });

  it('never claims that a company asks a question', () => {
    for (const q of QUESTIONS) {
      expect(q.interviewClaim).toBe('commonly-discussed');
      for (const s of q.sources) expect(s.note ?? '').not.toMatch(/asked (at|by)|interview question at/i);
    }
  });

  it('uses question-specific rubrics (no two questions share an identical rubric)', () => {
    const signatures = QUESTIONS.map((q) => JSON.stringify(q.rubric.checks.map((c) => [c.id, c.rule])));
    expect(new Set(signatures).size).toBe(QUESTIONS.length);
  });
});

describe.each(QUESTIONS.map((q) => [q.id, q] as const))('rubric consistency for %s', (_id, q) => {
  const input = toEvaluationInput(q);

  it('scores its reference architecture at 90 or more', () => {
    const report = evaluateDesign(referenceToDiagram(q.reference), input);
    const failing = report.checks.filter((c) => c.status !== 'pass' && !c.optional).map((c) => `${c.id}: ${c.evidence}`);
    const issues = report.issues.filter((i) => i.penalty > 0).map((i) => `${i.code}: ${i.message}`);
    expect(report.score, `${q.id} ${q.title}\n failing: ${failing.join('\n  ')}\n issues: ${issues.join('\n  ')}`).toBeGreaterThanOrEqual(90);
  });

  it('scores the reference components without connections far lower', () => {
    const ref = referenceToDiagram(q.reference);
    const report = evaluateDesign({ ...ref, edges: [] }, input);
    expect(report.score).toBeLessThan(45);
  });

  it('scores the empty starter canvas very low', () => {
    const report = evaluateDesign(starterToDiagram(q.starter), input);
    expect(report.score).toBeLessThan(30);
  });
});
