/*
  Warnings:

  - You are about to drop the column `embeddedAt` on the `agent_memories` table. All the data in the column will be lost.
  - You are about to drop the column `embeddingStatus` on the `agent_memories` table. All the data in the column will be lost.
  - You are about to drop the column `embeddedAt` on the `config_templates` table. All the data in the column will be lost.
  - You are about to drop the column `embeddingStatus` on the `config_templates` table. All the data in the column will be lost.
  - You are about to drop the column `embeddedAt` on the `knowledge_documents` table. All the data in the column will be lost.
  - You are about to drop the column `embeddingStatus` on the `knowledge_documents` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `port` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `embeddedAt` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `embeddingStatus` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the `best_practices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `embedding_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `embeddings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `query_embedding_cache` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ClientTier" AS ENUM ('STANDARD', 'GROWTH', 'ENTERPRISE', 'VIP');

-- CreateEnum
CREATE TYPE "ClientHealth" AS ENUM ('HEALTHY', 'WATCH', 'AT_RISK', 'CHURNED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('INTERNAL', 'CLIENT_CALL', 'ONBOARDING', 'REVIEW', 'DELIVERY', 'BILLING', 'OTHER');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'CHECK', 'CASH', 'PAYPAL', 'STRIPE', 'OTHER');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENT', 'FAILED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "UpworkJobStatus" AS ENUM ('NEW', 'DETAILS_ENRICHED', 'MATCHED', 'PROPOSAL_GENERATED', 'READY_TO_SUBMIT', 'SUBMITTED', 'FAILED');

-- CreateEnum
CREATE TYPE "UpworkExtractMethod" AS ENUM ('LISTING_DOM', 'LISTING_AI', 'DETAIL_DOM', 'DETAIL_AI', 'DETAIL_VISION');

-- CreateEnum
CREATE TYPE "UpworkProposalStatus" AS ENUM ('DRAFT', 'READY', 'SUBMITTED', 'FAILED');

-- CreateEnum
CREATE TYPE "UpworkAutomationStatus" AS ENUM ('RUNNING', 'PAUSED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('FRONTEND', 'BACKEND', 'FULLSTACK', 'DATABASE', 'DEVOPS', 'TESTING', 'SECURITY', 'PERFORMANCE', 'ACCESSIBILITY', 'DOCUMENTATION', 'ARCHITECTURE', 'TOOLING', 'AI_ML', 'MOBILE', 'API', 'STYLING', 'STATE_MANAGEMENT', 'BUILD_TOOLS', 'VERSION_CONTROL', 'DEBUGGING', 'DEPLOYMENT', 'MONITORING', 'OTHER');

-- DropIndex
DROP INDEX "agent_memories_embeddingStatus_idx";

-- DropIndex
DROP INDEX "config_templates_embeddingStatus_idx";

-- DropIndex
DROP INDEX "knowledge_documents_embeddingStatus_idx";

-- DropIndex
DROP INDEX "projects_path_key";

-- DropIndex
DROP INDEX "tickets_embeddingStatus_idx";

-- AlterTable
ALTER TABLE "agent_memories" DROP COLUMN "embeddedAt",
DROP COLUMN "embeddingStatus";

-- AlterTable
ALTER TABLE "config_templates" DROP COLUMN "embeddedAt",
DROP COLUMN "embeddingStatus";

-- AlterTable
ALTER TABLE "knowledge_documents" DROP COLUMN "embeddedAt",
DROP COLUMN "embeddingStatus";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "ipAddress",
DROP COLUMN "port",
ADD COLUMN     "budget" DECIMAL(12,2),
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "owner" TEXT,
ADD COLUMN     "portRangeEnd" INTEGER,
ADD COLUMN     "portRangeStart" INTEGER,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "starred" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
ALTER COLUMN "path" DROP NOT NULL,
ALTER COLUMN "packageManager" DROP NOT NULL,
ALTER COLUMN "packageManager" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "embeddedAt",
DROP COLUMN "embeddingStatus";

-- DropTable
DROP TABLE "best_practices";

-- DropTable
DROP TABLE "embedding_jobs";

-- DropTable
DROP TABLE "embeddings";

-- DropTable
DROP TABLE "query_embedding_cache";

-- DropEnum
DROP TYPE "EmbeddingJobStatus";

-- DropEnum
DROP TYPE "EmbeddingSourceType";

-- DropEnum
DROP TYPE "EmbeddingStatus";

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "tier" "ClientTier" NOT NULL DEFAULT 'STANDARD',
    "health" "ClientHealth" NOT NULL DEFAULT 'HEALTHY',
    "owner" TEXT,
    "notes" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "nextTouchAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_summaries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "technicalOverview" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "assignee" TEXT,
    "dueDate" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "description" TEXT,
    "hours" DECIMAL(5,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MeetingType" NOT NULL DEFAULT 'INTERNAL',
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "meetingUrl" TEXT,
    "attendees" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_connections" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "calendarId" TEXT NOT NULL,
    "calendarName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "reference" TEXT,
    "notes" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT[],
    "cc" TEXT[],
    "status" "EmailStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "threadId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "databases" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "database" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "connectionString" TEXT,
    "containerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "databases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upwork_skill_profiles" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "displayName" TEXT,
    "skillsText" TEXT NOT NULL,
    "skills" TEXT[],
    "industries" TEXT[],
    "stack" TEXT,
    "offer" TEXT,
    "proof" TEXT,
    "hourlyRate" TEXT,
    "minFixedBudget" TEXT,
    "maxFixedBudget" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upwork_skill_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upwork_jobs" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "tags" TEXT[],
    "paymentVerified" BOOLEAN,
    "clientSpent" TEXT,
    "proposals" TEXT,
    "posted" TEXT,
    "budgetLine" TEXT,
    "budgetType" TEXT,
    "experienceLevel" TEXT,
    "budgetEstimate" TEXT,
    "bids" TEXT,
    "avgBid" TEXT,
    "status" "UpworkJobStatus" NOT NULL DEFAULT 'NEW',
    "matchScore" DOUBLE PRECISION,
    "matchReason" TEXT,
    "isEligible" BOOLEAN NOT NULL DEFAULT false,
    "lastMatchedAt" TIMESTAMP(3),
    "lastExtractedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upwork_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upwork_job_details" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "connectsRequired" INTEGER,
    "duration" TEXT,
    "projectType" TEXT,
    "location" TEXT,
    "activity" TEXT,
    "clientLocation" TEXT,
    "clientJobsPosted" INTEGER,
    "clientHireRate" TEXT,
    "clientSpent" TEXT,
    "clientHourlyRange" TEXT,
    "clientAvgHourly" TEXT,
    "clientTotalHires" INTEGER,
    "clientOpenJobs" INTEGER,
    "experienceLevel" TEXT,
    "weeklyHours" TEXT,
    "hourlyRange" TEXT,
    "fixedPrice" TEXT,
    "skills" TEXT[],
    "attachments" JSONB,
    "rawSections" JSONB,
    "lastExtractedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upwork_job_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upwork_job_extracts" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "method" "UpworkExtractMethod" NOT NULL,
    "sourceUrl" TEXT,
    "html" TEXT,
    "screenshotBase64" TEXT,
    "screenshotMime" TEXT,
    "extracted" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upwork_job_extracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upwork_proposal_drafts" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "profileId" TEXT,
    "proposal" TEXT NOT NULL,
    "bid" TEXT,
    "questions" TEXT[],
    "milestones" TEXT[],
    "highlights" TEXT[],
    "status" "UpworkProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "submitLog" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upwork_proposal_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upwork_automation_runs" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" "UpworkAutomationStatus" NOT NULL DEFAULT 'RUNNING',
    "currentStep" TEXT,
    "error" TEXT,
    "stats" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upwork_automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "license" TEXT,
    "compatibility" TEXT,
    "author" TEXT,
    "version" TEXT,
    "allowedTools" TEXT[],
    "tags" TEXT[],
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_tier_idx" ON "clients"("tier");

-- CreateIndex
CREATE INDEX "clients_health_idx" ON "clients"("health");

-- CreateIndex
CREATE INDEX "clients_owner_idx" ON "clients"("owner");

-- CreateIndex
CREATE INDEX "contacts_clientId_idx" ON "contacts"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "project_summaries_projectId_key" ON "project_summaries"("projectId");

-- CreateIndex
CREATE INDEX "project_summaries_projectId_idx" ON "project_summaries"("projectId");

-- CreateIndex
CREATE INDEX "tasks_projectId_status_idx" ON "tasks"("projectId", "status");

-- CreateIndex
CREATE INDEX "tasks_assignee_idx" ON "tasks"("assignee");

-- CreateIndex
CREATE INDEX "milestones_projectId_dueDate_idx" ON "milestones"("projectId", "dueDate");

-- CreateIndex
CREATE INDEX "time_entries_projectId_date_idx" ON "time_entries"("projectId", "date");

-- CreateIndex
CREATE INDEX "time_entries_billable_invoiced_idx" ON "time_entries"("billable", "invoiced");

-- CreateIndex
CREATE INDEX "meetings_startTime_idx" ON "meetings"("startTime");

-- CreateIndex
CREATE INDEX "meetings_clientId_idx" ON "meetings"("clientId");

-- CreateIndex
CREATE INDEX "meetings_type_idx" ON "meetings"("type");

-- CreateIndex
CREATE INDEX "calendar_connections_provider_idx" ON "calendar_connections"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_connections_provider_calendarId_key" ON "calendar_connections"("provider", "calendarId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE INDEX "invoices_clientId_status_idx" ON "invoices"("clientId", "status");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "emails_clientId_idx" ON "emails"("clientId");

-- CreateIndex
CREATE INDEX "emails_status_idx" ON "emails"("status");

-- CreateIndex
CREATE INDEX "emails_threadId_idx" ON "emails"("threadId");

-- CreateIndex
CREATE INDEX "emails_isRead_isStarred_idx" ON "emails"("isRead", "isStarred");

-- CreateIndex
CREATE INDEX "databases_projectId_idx" ON "databases"("projectId");

-- CreateIndex
CREATE INDEX "databases_status_idx" ON "databases"("status");

-- CreateIndex
CREATE UNIQUE INDEX "databases_projectId_name_key" ON "databases"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "upwork_skill_profiles_teamId_key" ON "upwork_skill_profiles"("teamId");

-- CreateIndex
CREATE INDEX "upwork_skill_profiles_teamId_idx" ON "upwork_skill_profiles"("teamId");

-- CreateIndex
CREATE INDEX "upwork_jobs_teamId_status_idx" ON "upwork_jobs"("teamId", "status");

-- CreateIndex
CREATE INDEX "upwork_jobs_teamId_isEligible_idx" ON "upwork_jobs"("teamId", "isEligible");

-- CreateIndex
CREATE UNIQUE INDEX "upwork_jobs_teamId_url_key" ON "upwork_jobs"("teamId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "upwork_job_details_jobId_key" ON "upwork_job_details"("jobId");

-- CreateIndex
CREATE INDEX "upwork_job_extracts_jobId_method_createdAt_idx" ON "upwork_job_extracts"("jobId", "method", "createdAt");

-- CreateIndex
CREATE INDEX "upwork_proposal_drafts_teamId_status_idx" ON "upwork_proposal_drafts"("teamId", "status");

-- CreateIndex
CREATE INDEX "upwork_automation_runs_teamId_status_idx" ON "upwork_automation_runs"("teamId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skills_category_idx" ON "skills"("category");

-- CreateIndex
CREATE INDEX "skills_isEnabled_idx" ON "skills"("isEnabled");

-- CreateIndex
CREATE INDEX "skills_tags_idx" ON "skills"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "projects"("name");

-- CreateIndex
CREATE INDEX "projects_clientId_status_idx" ON "projects"("clientId", "status");

-- CreateIndex
CREATE INDEX "projects_owner_idx" ON "projects"("owner");

-- CreateIndex
CREATE INDEX "projects_dueDate_idx" ON "projects"("dueDate");

-- CreateIndex
CREATE INDEX "projects_starred_idx" ON "projects"("starred");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_summaries" ADD CONSTRAINT "project_summaries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_configs" ADD CONSTRAINT "project_configs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "databases" ADD CONSTRAINT "databases_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_configs" ADD CONSTRAINT "app_configs_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "knowledge_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upwork_skill_profiles" ADD CONSTRAINT "upwork_skill_profiles_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upwork_jobs" ADD CONSTRAINT "upwork_jobs_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upwork_job_details" ADD CONSTRAINT "upwork_job_details_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "upwork_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upwork_job_extracts" ADD CONSTRAINT "upwork_job_extracts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "upwork_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upwork_proposal_drafts" ADD CONSTRAINT "upwork_proposal_drafts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "upwork_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upwork_proposal_drafts" ADD CONSTRAINT "upwork_proposal_drafts_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upwork_proposal_drafts" ADD CONSTRAINT "upwork_proposal_drafts_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "upwork_skill_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upwork_automation_runs" ADD CONSTRAINT "upwork_automation_runs_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
