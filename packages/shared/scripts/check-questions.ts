/**
 * Prints a health report for the question bank:
 *   npm run questions:check
 * Shows distribution, validation errors, and how each reference architecture scores against its own rubric.
 */
import { evaluateDesign } from '../src/evaluation/engine';
import { QUESTIONS, referenceToDiagram, starterToDiagram, toEvaluationInput } from '../src/questions';
import { validateQuestionBank } from '../src/questions/validation';

const report = validateQuestionBank(QUESTIONS, { strictDistribution: true });
console.log(`Questions: ${QUESTIONS.length}  ${JSON.stringify(report.distribution)}`);
for (const e of report.errors) console.log(`  ✗ ${e}`);
for (const w of report.warnings) console.log(`  ! ${w}`);

let low = 0;
for (const q of QUESTIONS) {
  const input = toEvaluationInput(q);
  const ref = referenceToDiagram(q.reference);
  const full = evaluateDesign(ref, input);
  const bare = evaluateDesign({ ...ref, edges: [] }, input);
  const starter = evaluateDesign(starterToDiagram(q.starter), input);
  const flag = full.score < 90 || bare.score >= 45 || starter.score >= 30 ? '✗' : '✓';
  if (flag === '✗') low++;
  console.log(`${flag} ${q.id.padEnd(4)} ref ${String(full.score).padStart(3)}  no-edges ${String(bare.score).padStart(3)}  starter ${String(starter.score).padStart(3)}  ${q.title}`);
  if (full.score < 90) {
    for (const c of full.checks.filter((c) => c.status !== 'pass' && !c.optional)) console.log(`      - ${c.id} [${c.status}] ${c.evidence}`);
    for (const i of full.issues.filter((i) => i.penalty > 0)) console.log(`      - ${i.code}: ${i.message}`);
  }
}
console.log(low ? `\n${low} question(s) need attention.` : '\nAll reference architectures are consistent with their rubrics.');
process.exit(report.errors.length || low ? 1 : 0);
