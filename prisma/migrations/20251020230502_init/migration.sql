-- CreateEnum
CREATE TYPE "ConfigType" AS ENUM ('ESLINT', 'PRETTIER', 'TYPESCRIPT', 'TAILWIND', 'NEXTJS', 'POSTCSS', 'VITE', 'JEST', 'PLAYWRIGHT', 'VITEST', 'TURBO', 'SENTRY', 'VERCEL', 'BIOME', 'STYLELINT', 'TSUP', 'BUNFIG', 'GITIGNORE', 'PACKAGE_JSON');

-- CreateEnum
CREATE TYPE "AppType" AS ENUM ('WEB_APP', 'DESKTOP', 'MARKETING_SITE', 'API');

-- CreateEnum
CREATE TYPE "ConfigScope" AS ENUM ('GLOBAL', 'TEMPLATE', 'PROJECT', 'APP');

-- CreateEnum
CREATE TYPE "DependencyType" AS ENUM ('REGULAR', 'DEV', 'PEER', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCING', 'SYNCED', 'ERROR', 'CONFLICT');

-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('AI', 'ANALYTICS', 'BLOB_STORAGE', 'DATABASE', 'EMAIL', 'ERROR_REPORTING', 'FINANCIAL_ACCOUNTS', 'PAYMENTS', 'REALTIME', 'USER_AUTH', 'SCRAPING', 'SPEED_INSIGHTS');

-- CreateTable
CREATE TABLE "config_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "configType" "ConfigType" NOT NULL,
    "appType" "AppType",
    "scope" "ConfigScope" NOT NULL,
    "content" JSONB NOT NULL,
    "rawContent" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "config_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_configs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "templateId" TEXT,
    "configType" "ConfigType" NOT NULL,
    "content" JSONB NOT NULL,
    "overrides" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "project_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_configs" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "appType" "AppType" NOT NULL,
    "templateId" TEXT,
    "configType" "ConfigType" NOT NULL,
    "content" JSONB NOT NULL,
    "overrides" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "app_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_history" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "changeLog" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "config_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependencies" (
    "id" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" "DependencyType" NOT NULL,
    "scope" "ConfigScope" NOT NULL,
    "appType" "AppType",
    "projectId" TEXT,
    "appId" TEXT,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "path" TEXT NOT NULL,
    "packageManager" TEXT NOT NULL DEFAULT 'bun',
    "ipAddress" TEXT,
    "port" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "AppType" NOT NULL,
    "path" TEXT NOT NULL,
    "devPort" INTEGER,
    "autoOpen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "content" JSONB,
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_sync" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_sync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_configs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "appId" TEXT,
    "feature" "Feature" NOT NULL,
    "provider" TEXT NOT NULL,
    "config" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "config_templates_configType_appType_scope_isActive_idx" ON "config_templates"("configType", "appType", "scope", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "config_templates_configType_appType_scope_version_key" ON "config_templates"("configType", "appType", "scope", "version");

-- CreateIndex
CREATE INDEX "project_configs_projectId_configType_isEnabled_idx" ON "project_configs"("projectId", "configType", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "project_configs_projectId_configType_key" ON "project_configs"("projectId", "configType");

-- CreateIndex
CREATE INDEX "app_configs_projectId_appId_configType_isEnabled_idx" ON "app_configs"("projectId", "appId", "configType", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "app_configs_appId_configType_key" ON "app_configs"("appId", "configType");

-- CreateIndex
CREATE INDEX "config_history_templateId_version_idx" ON "config_history"("templateId", "version");

-- CreateIndex
CREATE INDEX "dependencies_scope_appType_projectId_appId_type_idx" ON "dependencies"("scope", "appType", "projectId", "appId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "dependencies_packageName_scope_appType_projectId_appId_type_key" ON "dependencies"("packageName", "scope", "appType", "projectId", "appId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "projects_path_key" ON "projects"("path");

-- CreateIndex
CREATE INDEX "apps_projectId_type_idx" ON "apps"("projectId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "apps_projectId_name_key" ON "apps"("projectId", "name");

-- CreateIndex
CREATE INDEX "sync_queue_status_createdAt_idx" ON "sync_queue"("status", "createdAt");

-- CreateIndex
CREATE INDEX "sync_queue_entityType_entityId_idx" ON "sync_queue"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "network_sync_deviceId_key" ON "network_sync"("deviceId");

-- CreateIndex
CREATE INDEX "network_sync_isOnline_lastSeen_idx" ON "network_sync"("isOnline", "lastSeen");

-- CreateIndex
CREATE INDEX "feature_configs_feature_isEnabled_idx" ON "feature_configs"("feature", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "feature_configs_projectId_appId_feature_key" ON "feature_configs"("projectId", "appId", "feature");

-- AddForeignKey
ALTER TABLE "project_configs" ADD CONSTRAINT "project_configs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "config_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_configs" ADD CONSTRAINT "app_configs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "config_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_history" ADD CONSTRAINT "config_history_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "config_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
