/*
  Warnings:

  - The values [DESKTOP] on the enum `AppType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppType_new" AS ENUM ('WEB_APP', 'DESKTOP_APP', 'MOBILE_APP', 'API', 'MARKETING_SITE', 'LIBRARY', 'MONOREPO', 'CLI', 'EXTENSION', 'CUSTOM');
ALTER TABLE "config_templates" ALTER COLUMN "appType" TYPE "AppType_new" USING ("appType"::text::"AppType_new");
ALTER TABLE "app_configs" ALTER COLUMN "appType" TYPE "AppType_new" USING ("appType"::text::"AppType_new");
ALTER TABLE "shared_configs" ALTER COLUMN "appType" TYPE "AppType_new" USING ("appType"::text::"AppType_new");
ALTER TABLE "dependencies" ALTER COLUMN "appType" TYPE "AppType_new" USING ("appType"::text::"AppType_new");
ALTER TABLE "apps" ALTER COLUMN "type" TYPE "AppType_new" USING ("type"::text::"AppType_new");
ALTER TYPE "AppType" RENAME TO "AppType_old";
ALTER TYPE "AppType_new" RENAME TO "AppType";
DROP TYPE "public"."AppType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TicketStatus" ADD VALUE 'DESIGN';
ALTER TYPE "TicketStatus" ADD VALUE 'UNREFINED';
ALTER TYPE "TicketStatus" ADD VALUE 'READY';

-- DropForeignKey
ALTER TABLE "public"."TemplateFile" DROP CONSTRAINT "TemplateFile_templateId_fkey";

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "acceptanceCriteria" JSONB,
ADD COLUMN     "businessRequirements" TEXT,
ADD COLUMN     "checklistItems" JSONB,
ADD COLUMN     "estimatedValue" TEXT,
ADD COLUMN     "isFrontend" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."Template";

-- DropTable
DROP TABLE "public"."TemplateFile";

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorType" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "requestsAction" BOOLEAN NOT NULL DEFAULT false,
    "actionType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'article',
    "category" TEXT,
    "tags" TEXT[],
    "ticketId" TEXT,
    "projectId" TEXT,
    "createdById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_memories" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "context" TEXT,
    "type" TEXT NOT NULL DEFAULT 'preference',
    "scope" TEXT NOT NULL DEFAULT 'global',
    "scopeId" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "framework" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_files" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDirectory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_comments_ticketId_createdAt_idx" ON "ticket_comments"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "ticket_comments_authorId_idx" ON "ticket_comments"("authorId");

-- CreateIndex
CREATE INDEX "knowledge_documents_projectId_status_idx" ON "knowledge_documents"("projectId", "status");

-- CreateIndex
CREATE INDEX "knowledge_documents_ticketId_idx" ON "knowledge_documents"("ticketId");

-- CreateIndex
CREATE INDEX "knowledge_documents_category_status_idx" ON "knowledge_documents"("category", "status");

-- CreateIndex
CREATE INDEX "agent_memories_agentId_scope_priority_idx" ON "agent_memories"("agentId", "scope", "priority");

-- CreateIndex
CREATE INDEX "agent_memories_type_scope_idx" ON "agent_memories"("type", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "agent_memories_agentId_key_scope_scopeId_key" ON "agent_memories"("agentId", "key", "scope", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "templates_name_type_key" ON "templates"("name", "type");

-- CreateIndex
CREATE INDEX "template_files_templateId_idx" ON "template_files"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "template_files_templateId_path_key" ON "template_files"("templateId", "path");

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_memories" ADD CONSTRAINT "agent_memories_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_files" ADD CONSTRAINT "template_files_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
