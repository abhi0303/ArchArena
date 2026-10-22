import type {
  Bilingual,
  Clarification,
  ComponentCategoryId,
  EvaluationInput,
  QuestionCategory,
  QuestionDetailDTO,
  QuestionSummaryDTO,
  Requirement,
  Rubric,
  StarterNode,
} from '@arch-arena/shared';
import type { Db } from '../db';

export interface QuestionContent {
  statement: Bilingual;
  constraints: Bilingual<string[]>;
  clarifications: Clarification[];
  scale: { label: string; value: string }[];
  hints: Bilingual[];
  suggestedCategories: ComponentCategoryId[];
  starter: StarterNode[];
  interviewClaim: 'commonly-discussed';
}

interface Entry {
  summary: QuestionSummaryDTO;
  detail: QuestionDetailDTO;
  evaluation: EvaluationInput;
}

const TTL_MS = 5 * 60 * 1000;

/**
 * Read-mostly in-memory view of the question bank, loaded from PostgreSQL.
 * Questions change only when the seed runs, so a short TTL keeps things fresh without per-request queries.
 */
export class QuestionStore {
  private entries: Entry[] = [];
  private bySlug = new Map<string, Entry>();
  private byId = new Map<string, Entry>();
  private loadedAt = 0;
  private loading: Promise<void> | null = null;

  constructor(private readonly db: Db) {}

  private async ensure(): Promise<void> {
    if (Date.now() - this.loadedAt < TTL_MS && this.entries.length) return;
    this.loading ??= this.load().finally(() => {
      this.loading = null;
    });
    await this.loading;
  }

  async load(): Promise<void> {
    const rows = await this.db.question.findMany({
      where: { status: 'published' },
      orderBy: [{ sortOrder: 'asc' }],
      include: {
        requirements: { orderBy: { position: 'asc' } },
        sources: { orderBy: { position: 'asc' } },
        rubrics: true,
      },
    });
    const entries: Entry[] = rows.map((q) => {
      const content = q.content as unknown as QuestionContent;
      const rubricRow = q.rubrics.find((r) => r.version === q.activeRubricVersion) ?? q.rubrics.at(-1);
      const rubric = (rubricRow?.rubric ?? { checks: [] }) as unknown as Rubric;
      const toReq = (kind: 'functional' | 'non_functional'): Requirement[] =>
        q.requirements
          .filter((r) => r.kind === kind)
          .map((r) => ({ id: r.code, en: r.textEn, hi: r.textHi, checks: r.checkIds }));
      const functional = toReq('functional');
      const nonFunctional = toReq('non_functional');
      const summary: QuestionSummaryDTO = {
        id: q.id,
        slug: q.slug,
        title: q.title,
        difficulty: q.difficulty,
        category: q.category as QuestionCategory,
        estimatedMinutes: q.estimatedMinutes,
        tags: q.tags,
        concepts: q.concepts,
        sortOrder: q.sortOrder,
      };
      const detail: QuestionDetailDTO = {
        ...summary,
        statement: content.statement,
        functional,
        nonFunctional,
        constraints: content.constraints,
        clarifications: content.clarifications,
        scale: content.scale,
        suggestedCategories: content.suggestedCategories,
        starter: content.starter,
        hints: content.hints,
        rubric,
        rubricVersion: rubricRow?.version ?? 1,
        sources: q.sources.map((s) => ({
          title: s.title,
          url: s.url,
          type: s.sourceType as QuestionDetailDTO['sources'][number]['type'],
          verification: s.verification as 'verified' | 'pending',
          note: s.note ?? undefined,
        })),
        interviewClaim: 'commonly-discussed',
      };
      const evaluation: EvaluationInput = {
        questionId: q.id,
        difficulty: q.difficulty,
        rubricVersion: rubricRow?.version ?? 1,
        rubric,
        requirements: [
          ...functional.map((r) => ({ id: r.id, kind: 'functional' as const, text: { en: r.en, hi: r.hi }, checks: r.checks })),
          ...nonFunctional.map((r) => ({ id: r.id, kind: 'non-functional' as const, text: { en: r.en, hi: r.hi }, checks: r.checks })),
        ],
      };
      return { summary, detail, evaluation };
    });
    this.entries = entries;
    this.bySlug = new Map(entries.map((e) => [e.summary.slug, e]));
    this.byId = new Map(entries.map((e) => [e.summary.id, e]));
    this.loadedAt = Date.now();
  }

  async list(): Promise<QuestionSummaryDTO[]> {
    await this.ensure();
    return this.entries.map((e) => e.summary);
  }

  async detailBySlugOrId(key: string): Promise<QuestionDetailDTO | undefined> {
    await this.ensure();
    return (this.bySlug.get(key) ?? this.byId.get(key))?.detail;
  }

  async summaryById(id: string): Promise<QuestionSummaryDTO | undefined> {
    await this.ensure();
    return this.byId.get(id)?.summary;
  }

  async evaluationInput(id: string): Promise<EvaluationInput | undefined> {
    await this.ensure();
    return this.byId.get(id)?.evaluation;
  }

  async countsByDifficulty(): Promise<Record<'easy' | 'medium' | 'hard', number>> {
    await this.ensure();
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const e of this.entries) counts[e.summary.difficulty]++;
    return counts;
  }

  invalidate(): void {
    this.loadedAt = 0;
  }
}
