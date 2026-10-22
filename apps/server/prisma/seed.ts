/**
 * Seeds (or updates) the question bank from @arch-arena/shared.
 * Idempotent: re-running updates content and creates a new rubric version only when a rubric changed,
 * so historical evaluations stay interpretable.
 */
import { PrismaClient } from '@prisma/client';
import { hashJson } from '@arch-arena/shared';
import { QUESTIONS, referenceToDiagram } from '@arch-arena/shared/questions';
import { validateQuestionBank } from '@arch-arena/shared/questions/validation';

async function main() {
  const report = validateQuestionBank(QUESTIONS);
  if (report.errors.length) {
    console.error('Question bank has errors:\n' + report.errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }
  for (const w of report.warnings) console.warn(`  ! ${w}`);

  const prisma = new PrismaClient();
  let created = 0;
  let rubricBumps = 0;
  try {
    for (const [index, q] of QUESTIONS.entries()) {
      const content = {
        statement: q.statement,
        constraints: q.constraints,
        clarifications: q.clarifications,
        scale: q.scale,
        hints: q.hints,
        suggestedCategories: q.suggestedCategories,
        starter: q.starter,
        interviewClaim: q.interviewClaim,
      };
      const rubricHash = hashJson(q.rubric);

      await prisma.$transaction(async (tx) => {
        const existing = await tx.question.findUnique({ where: { id: q.id }, include: { rubrics: { orderBy: { version: 'desc' }, take: 1 } } });
        if (!existing) created++;
        const latest = existing?.rubrics[0];
        let version = latest?.version ?? 0;
        if (!latest || latest.contentHash !== rubricHash) {
          version += 1;
          if (latest) rubricBumps++;
        }

        await tx.question.upsert({
          where: { id: q.id },
          create: {
            id: q.id,
            slug: q.slug,
            title: q.title,
            difficulty: q.difficulty,
            category: q.category,
            estimatedMinutes: q.estimatedMinutes,
            tags: q.tags,
            concepts: q.concepts,
            status: q.status,
            sortOrder: index,
            content: content as object,
            activeRubricVersion: version,
          },
          update: {
            slug: q.slug,
            title: q.title,
            difficulty: q.difficulty,
            category: q.category,
            estimatedMinutes: q.estimatedMinutes,
            tags: q.tags,
            concepts: q.concepts,
            status: q.status,
            sortOrder: index,
            content: content as object,
            activeRubricVersion: version,
          },
        });

        if (!latest || latest.contentHash !== rubricHash) {
          await tx.questionRubric.create({ data: { questionId: q.id, version, contentHash: rubricHash, rubric: q.rubric as object } });
        }

        await tx.questionSource.deleteMany({ where: { questionId: q.id } });
        if (q.sources.length) {
          await tx.questionSource.createMany({
            data: q.sources.map((s, i) => ({
              questionId: q.id,
              position: i,
              title: s.title,
              url: s.url,
              sourceType: s.type,
              verification: s.verification,
              note: s.note,
            })),
          });
        }

        await tx.questionRequirement.deleteMany({ where: { questionId: q.id } });
        await tx.questionRequirement.createMany({
          data: [
            ...q.functional.map((r, i) => ({ id: `${q.id}:${r.id}`, questionId: q.id, code: r.id, kind: 'functional' as const, position: i, textEn: r.en, textHi: r.hi, checkIds: r.checks })),
            ...q.nonFunctional.map((r, i) => ({ id: `${q.id}:${r.id}`, questionId: q.id, code: r.id, kind: 'non_functional' as const, position: i, textEn: r.en, textHi: r.hi, checkIds: r.checks })),
          ],
        });

        const diagram = referenceToDiagram(q.reference);
        await tx.questionReferenceArchitecture.upsert({
          where: { questionId: q.id },
          create: { questionId: q.id, reference: q.reference as object, diagram: diagram as object },
          update: { reference: q.reference as object, diagram: diagram as object },
        });
      });
    }

    // Unpublish questions that were removed from the bank (keeps user history intact).
    const ids = QUESTIONS.map((q) => q.id);
    const removed = await prisma.question.updateMany({ where: { id: { notIn: ids }, status: 'published' }, data: { status: 'archived' } });

    console.log(
      `Seeded ${QUESTIONS.length} questions (${created} new, ${rubricBumps} rubric version bumps, ${removed.count} archived). ` +
        `Distribution: ${JSON.stringify(report.distribution)}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
