-- Create Template table
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- web-app, mobile-app, desktop-app, api, marketing-site
    "description" TEXT,
    "framework" TEXT NOT NULL, -- nextjs, expo, electron
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create TemplateFile table for storing all template files
CREATE TABLE "TemplateFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "path" TEXT NOT NULL, -- relative path like "app/page.tsx"
    "content" TEXT NOT NULL,
    "isDirectory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TemplateFile_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE UNIQUE INDEX "Template_name_type_key" ON "Template"("name", "type");
CREATE INDEX "TemplateFile_templateId_idx" ON "TemplateFile"("templateId");
CREATE UNIQUE INDEX "TemplateFile_templateId_path_key" ON "TemplateFile"("templateId", "path");
