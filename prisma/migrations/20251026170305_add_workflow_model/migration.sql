-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('DESIGNER', 'FRONTEND_ENGINEER', 'BACKEND_ENGINEER', 'FULLSTACK_ENGINEER', 'QA_ENGINEER', 'DEVOPS_ENGINEER', 'PRODUCT_OWNER', 'SCRUM_MASTER', 'TECH_LEAD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AgentSpecialization" AS ENUM ('GENERALIST', 'REACT', 'VUE', 'ANGULAR', 'NODEJS', 'PYTHON', 'GOLANG', 'RUST', 'DATABASE', 'CLOUD_AWS', 'CLOUD_GCP', 'CLOUD_AZURE', 'KUBERNETES', 'TESTING', 'UI_UX', 'ACCESSIBILITY', 'PERFORMANCE', 'SECURITY', 'MOBILE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'QA', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AgentRole" NOT NULL,
    "specialization" "AgentSpecialization" NOT NULL DEFAULT 'GENERALIST',
    "description" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "capabilities" JSONB,
    "limitations" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxConcurrentTasks" INTEGER NOT NULL DEFAULT 3,
    "modelProvider" TEXT NOT NULL DEFAULT 'openai',
    "modelName" TEXT NOT NULL DEFAULT 'gpt-4',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stages" JSONB NOT NULL,
    "transitions" JSONB NOT NULL,
    "specializations" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT,
    "workflowId" TEXT,
    "workflowData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "workflowRole" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "canAssign" BOOLEAN NOT NULL DEFAULT false,
    "canReview" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "teamId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'BACKLOG',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedToId" TEXT,
    "labels" TEXT[],
    "tags" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_name_key" ON "agents"("name");

-- CreateIndex
CREATE INDEX "agents_role_isActive_idx" ON "agents"("role", "isActive");

-- CreateIndex
CREATE INDEX "agents_isDefault_isActive_idx" ON "agents"("isDefault", "isActive");

-- CreateIndex
CREATE INDEX "workflows_isDefault_isActive_idx" ON "workflows"("isDefault", "isActive");

-- CreateIndex
CREATE INDEX "teams_projectId_isActive_idx" ON "teams"("projectId", "isActive");

-- CreateIndex
CREATE INDEX "teams_workflowId_idx" ON "teams"("workflowId");

-- CreateIndex
CREATE INDEX "team_members_teamId_order_idx" ON "team_members"("teamId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_agentId_key" ON "team_members"("teamId", "agentId");

-- CreateIndex
CREATE INDEX "tickets_projectId_status_position_idx" ON "tickets"("projectId", "status", "position");

-- CreateIndex
CREATE INDEX "tickets_teamId_status_idx" ON "tickets"("teamId", "status");

-- CreateIndex
CREATE INDEX "tickets_assignedToId_status_idx" ON "tickets"("assignedToId", "status");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
