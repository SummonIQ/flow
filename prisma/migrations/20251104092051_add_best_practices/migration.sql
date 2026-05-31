-- CreateTable
CREATE TABLE "best_practices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "appType" "AppType" NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "best_practices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "best_practices_topic_appType_idx" ON "best_practices"("topic", "appType");

-- CreateIndex
CREATE INDEX "best_practices_appType_idx" ON "best_practices"("appType");
