-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'hinglish');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('not_started', 'in_progress', 'evaluated', 'completed');

-- CreateEnum
CREATE TYPE "RequirementKind" AS ENUM ('functional', 'non_functional');

-- CreateEnum
CREATE TYPE "XpReason" AS ENUM ('challenge_completion', 'score_improvement', 'first_completion_bonus', 'hint_free_bonus', 'achievement');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_sub" TEXT,
    "display_name" TEXT NOT NULL,
    "preferred_language" "Language" NOT NULL DEFAULT 'en',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "category" TEXT NOT NULL,
    "estimated_minutes" INTEGER NOT NULL,
    "tags" TEXT[],
    "concepts" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'published',
    "sort_order" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "active_rubric_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_sources" (
    "id" UUID NOT NULL,
    "question_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "verification" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "question_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_requirements" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "RequirementKind" NOT NULL,
    "position" INTEGER NOT NULL,
    "text_en" TEXT NOT NULL,
    "text_hi" TEXT NOT NULL,
    "check_ids" TEXT[],

    CONSTRAINT "question_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_rubrics" (
    "id" UUID NOT NULL,
    "question_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content_hash" TEXT NOT NULL,
    "rubric" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_reference_architectures" (
    "question_id" TEXT NOT NULL,
    "reference" JSONB NOT NULL,
    "diagram" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_reference_architectures_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "user_question_progress" (
    "user_id" UUID NOT NULL,
    "question_id" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'in_progress',
    "best_score" INTEGER,
    "best_stars" INTEGER NOT NULL DEFAULT 0,
    "best_submission_id" UUID,
    "best_attempt_score" INTEGER,
    "xp_value_awarded" INTEGER NOT NULL DEFAULT 0,
    "attempts_count" INTEGER NOT NULL DEFAULT 0,
    "hints_used" INTEGER NOT NULL DEFAULT 0,
    "hint_free_bonus_awarded" BOOLEAN NOT NULL DEFAULT false,
    "reference_revealed_at" TIMESTAMP(3),
    "first_completed_at" TIMESTAMP(3),
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_question_progress_pkey" PRIMARY KEY ("user_id","question_id")
);

-- CreateTable
CREATE TABLE "design_drafts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" TEXT NOT NULL,
    "diagram" JSONB NOT NULL,
    "diagram_hash" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "client_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" TEXT NOT NULL,
    "diagram" JSONB NOT NULL,
    "diagram_hash" TEXT NOT NULL,
    "rubric_version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_results" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "stars" INTEGER NOT NULL,
    "rubric_version" INTEGER NOT NULL,
    "engine_version" TEXT NOT NULL,
    "report" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" TEXT NOT NULL,
    "attempt_id" UUID NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "stars" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "xp_awarded" INTEGER NOT NULL,
    "rubric_version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "achievement_key" TEXT NOT NULL,
    "submission_id" UUID,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_xp_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "XpReason" NOT NULL,
    "question_id" TEXT,
    "submission_id" UUID,
    "achievement_key" TEXT,
    "dedupe_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_xp_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hint_usages" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hint_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_sub_key" ON "users"("google_sub");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "questions_slug_key" ON "questions"("slug");

-- CreateIndex
CREATE INDEX "questions_difficulty_sort_order_idx" ON "questions"("difficulty", "sort_order");

-- CreateIndex
CREATE INDEX "questions_category_idx" ON "questions"("category");

-- CreateIndex
CREATE INDEX "question_sources_question_id_idx" ON "question_sources"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_requirements_question_id_code_key" ON "question_requirements"("question_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "question_rubrics_question_id_version_key" ON "question_rubrics"("question_id", "version");

-- CreateIndex
CREATE INDEX "user_question_progress_user_id_status_idx" ON "user_question_progress"("user_id", "status");

-- CreateIndex
CREATE INDEX "design_drafts_user_id_updated_at_idx" ON "design_drafts"("user_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "design_drafts_user_id_question_id_key" ON "design_drafts"("user_id", "question_id");

-- CreateIndex
CREATE INDEX "design_attempts_user_id_question_id_created_at_idx" ON "design_attempts"("user_id", "question_id", "created_at");

-- CreateIndex
CREATE INDEX "design_attempts_user_id_created_at_idx" ON "design_attempts"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_results_attempt_id_key" ON "evaluation_results"("attempt_id");

-- CreateIndex
CREATE UNIQUE INDEX "design_submissions_attempt_id_key" ON "design_submissions"("attempt_id");

-- CreateIndex
CREATE INDEX "design_submissions_user_id_question_id_idx" ON "design_submissions"("user_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "design_submissions_user_id_idempotency_key_key" ON "design_submissions"("user_id", "idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_key_key" ON "user_achievements"("user_id", "achievement_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_xp_transactions_dedupe_key_key" ON "user_xp_transactions"("dedupe_key");

-- CreateIndex
CREATE INDEX "user_xp_transactions_user_id_created_at_idx" ON "user_xp_transactions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hint_usages_user_id_question_id_level_key" ON "hint_usages"("user_id", "question_id", "level");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_sources" ADD CONSTRAINT "question_sources_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_requirements" ADD CONSTRAINT "question_requirements_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_rubrics" ADD CONSTRAINT "question_rubrics_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reference_architectures" ADD CONSTRAINT "question_reference_architectures_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_question_progress" ADD CONSTRAINT "user_question_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_question_progress" ADD CONSTRAINT "user_question_progress_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_drafts" ADD CONSTRAINT "design_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_drafts" ADD CONSTRAINT "design_drafts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_attempts" ADD CONSTRAINT "design_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_attempts" ADD CONSTRAINT "design_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_results" ADD CONSTRAINT "evaluation_results_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "design_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_submissions" ADD CONSTRAINT "design_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_submissions" ADD CONSTRAINT "design_submissions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_submissions" ADD CONSTRAINT "design_submissions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "design_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_xp_transactions" ADD CONSTRAINT "user_xp_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hint_usages" ADD CONSTRAINT "hint_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hint_usages" ADD CONSTRAINT "hint_usages_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
