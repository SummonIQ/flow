-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AppType" ADD VALUE 'MOBILE_APP';
ALTER TYPE "AppType" ADD VALUE 'LIBRARY';
ALTER TYPE "AppType" ADD VALUE 'MONOREPO';
ALTER TYPE "AppType" ADD VALUE 'CLI';
ALTER TYPE "AppType" ADD VALUE 'EXTENSION';
ALTER TYPE "AppType" ADD VALUE 'CUSTOM';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ConfigType" ADD VALUE 'TSCONFIG';
ALTER TYPE "ConfigType" ADD VALUE 'WINDSURF_RULES';
ALTER TYPE "ConfigType" ADD VALUE 'AGENTS_MD';
ALTER TYPE "ConfigType" ADD VALUE 'CLAUDE_MD';
ALTER TYPE "ConfigType" ADD VALUE 'CURSOR_RULES';

-- CreateTable
CREATE TABLE "shared_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "configType" "ConfigType" NOT NULL,
    "appType" "AppType",
    "content" JSONB NOT NULL,
    "tags" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "shared_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shared_configs_configType_appType_idx" ON "shared_configs"("configType", "appType");

-- CreateIndex
CREATE INDEX "shared_configs_isDefault_idx" ON "shared_configs"("isDefault");
