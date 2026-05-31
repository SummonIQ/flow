/**
 * Configuration Management Service
 * Handles CRUD operations for configuration templates, project configs, and app configs
 */

import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';
import type {
  AppType,
  ConfigScope,
  ConfigType,
  DependencyType,
} from '@prisma/client';
import { prisma } from '../db/prisma';

// ============================================================================
// Config Template Operations
// ============================================================================

export class ConfigService {
  /**
   * Get all config templates, optionally filtered
   */
  static async getTemplates(filters?: {
    configType?: ConfigType;
    appType?: AppType;
    scope?: ConfigScope;
    isActive?: boolean;
  }) {
    return prisma.configTemplate.findMany({
      where: filters,
      orderBy: [{ scope: 'asc' }, { appType: 'asc' }, { version: 'desc' }],
    });
  }

  /**
   * Get a specific template
   */
  static async getTemplate(id: string) {
    return prisma.configTemplate.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { version: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Create a new config template
   */
  static async createTemplate(data: {
    name: string;
    description?: string;
    configType: ConfigType;
    appType?: AppType;
    scope: ConfigScope;
    content: any;
    rawContent?: string;
    createdBy?: string;
  }) {
    // Create the template
    const template = await prisma.configTemplate.create({
      data: {
        ...data,
        version: 1,
      },
    });

    // Create initial history entry
    await prisma.configHistory.create({
      data: {
        templateId: template.id,
        version: 1,
        content: data.content,
        changeLog: 'Initial version',
        changedBy: data.createdBy,
      },
    });

    // Queue sync for all affected projects/apps
    await this.queueTemplateSync(template.id);

    await ragEmbeddingService.onCreated('ConfigTemplate', template.id);

    return template;
  }

  /**
   * Update a config template (creates new version)
   */
  static async updateTemplate(
    id: string,
    data: {
      content: any;
      rawContent?: string;
      changeLog?: string;
      changedBy?: string;
    },
  ) {
    const current = await prisma.configTemplate.findUnique({ where: { id } });
    if (!current) throw new Error('Template not found');

    // Increment version
    const newVersion = current.version + 1;

    // Update template
    const updated = await prisma.configTemplate.update({
      where: { id },
      data: {
        content: data.content,
        rawContent: data.rawContent,
        version: newVersion,
        updatedAt: new Date(),
      },
    });

    // Create history entry
    await prisma.configHistory.create({
      data: {
        templateId: id,
        version: newVersion,
        content: data.content,
        changeLog: data.changeLog || 'Updated configuration',
        changedBy: data.changedBy,
      },
    });

    // Queue sync
    await this.queueTemplateSync(id);

    const changedFields = ragEmbeddingService.detectChangedContentFields(
      'ConfigTemplate',
      {
        content: data.content,
        rawContent: data.rawContent,
      },
    );
    if (changedFields.length > 0) {
      await ragEmbeddingService.onUpdated('ConfigTemplate', id, changedFields);
    }

    return updated;
  }

  /**
   * Delete a template (soft delete by setting isActive = false)
   */
  static async deleteTemplate(id: string) {
    await ragEmbeddingService.onDeleted('ConfigTemplate', id);

    return prisma.configTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============================================================================
  // Project Config Operations
  // ============================================================================

  /**
   * Get project configs
   */
  static async getProjectConfigs(projectId: string, configType?: ConfigType) {
    return prisma.projectConfig.findMany({
      where: {
        projectId,
        ...(configType && { configType }),
      },
      include: {
        template: true,
      },
    });
  }

  /**
   * Create or update project config
   */
  static async upsertProjectConfig(data: {
    projectId: string;
    configType: ConfigType;
    templateId?: string;
    content: any;
    overrides?: any;
  }) {
    const config = await prisma.projectConfig.upsert({
      where: {
        projectId_configType: {
          projectId: data.projectId,
          configType: data.configType,
        },
      },
      create: {
        ...data,
        syncStatus: 'PENDING',
      },
      update: {
        ...data,
        syncStatus: 'PENDING',
        updatedAt: new Date(),
      },
    });

    // Queue filesystem sync
    await this.queueConfigSync('ProjectConfig', config.id, data.projectId);

    return config;
  }

  // ============================================================================
  // App Config Operations
  // ============================================================================

  /**
   * Get app configs
   */
  static async getAppConfigs(appId: string, configType?: ConfigType) {
    return prisma.appConfig.findMany({
      where: {
        appId,
        ...(configType && { configType }),
      },
      include: {
        template: true,
      },
    });
  }

  /**
   * Create or update app config
   */
  static async upsertAppConfig(data: {
    appId: string;
    projectId: string;
    appType: AppType;
    configType: ConfigType;
    templateId?: string;
    content: any;
    overrides?: any;
  }) {
    const config = await prisma.appConfig.upsert({
      where: {
        appId_configType: {
          appId: data.appId,
          configType: data.configType,
        },
      },
      create: {
        ...data,
        syncStatus: 'PENDING',
      },
      update: {
        ...data,
        syncStatus: 'PENDING',
        updatedAt: new Date(),
      },
    });

    // Queue filesystem sync
    await this.queueConfigSync('AppConfig', config.id, data.appId);

    return config;
  }

  // ============================================================================
  // Dependency Management
  // ============================================================================

  /**
   * Get dependencies for a scope
   */
  static async getDependencies(filters: {
    scope: ConfigScope;
    appType?: AppType;
    projectId?: string;
    appId?: string;
    type?: DependencyType;
  }) {
    return prisma.dependency.findMany({
      where: filters,
      orderBy: [{ packageName: 'asc' }],
    });
  }

  /**
   * Upsert dependency
   */
  static async upsertDependency(data: {
    packageName: string;
    version: string;
    type: DependencyType;
    scope: ConfigScope;
    appType?: AppType;
    projectId?: string;
    appId?: string;
    description?: string;
    isRequired?: boolean;
  }) {
    const existing = await prisma.dependency.findFirst({
      where: {
        packageName: data.packageName,
        scope: data.scope,
        type: data.type,
        appType: data.appType ?? null,
        projectId: data.projectId ?? null,
        appId: data.appId ?? null,
      },
    });

    const dependency = existing
      ? await prisma.dependency.update({
          where: { id: existing.id },
          data: {
            version: data.version,
            description: data.description,
            isRequired: data.isRequired,
            syncStatus: 'PENDING',
            updatedAt: new Date(),
          },
        })
      : await prisma.dependency.create({
          data: {
            ...data,
            syncStatus: 'PENDING',
          },
        });

    // Queue sync
    await this.queueDependencySync(
      dependency.id,
      data.projectId || data.appId || '',
    );

    return dependency;
  }

  /**
   * Delete dependency
   */
  static async deleteDependency(id: string) {
    const dependency = await prisma.dependency.delete({
      where: { id },
    });

    // Queue sync to remove from package.json
    await this.queueDependencySync(
      id,
      dependency.projectId || dependency.appId || '',
    );

    return dependency;
  }

  // ============================================================================
  // Sync Queue Management
  // ============================================================================

  /**
   * Queue a template sync (affects all projects/apps using this template)
   */
  private static async queueTemplateSync(templateId: string) {
    const template = await prisma.configTemplate.findUnique({
      where: { id: templateId },
      include: {
        projectConfigs: true,
        appConfigs: true,
      },
    });

    if (!template) return;

    // Queue syncs for all affected configs
    for (const config of template.projectConfigs) {
      await this.queueConfigSync('ProjectConfig', config.id, config.projectId);
    }

    for (const config of template.appConfigs) {
      await this.queueConfigSync('AppConfig', config.id, config.appId);
    }
  }

  /**
   * Queue a config sync
   */
  private static async queueConfigSync(
    entityType: 'ProjectConfig' | 'AppConfig',
    entityId: string,
    targetId: string,
  ) {
    // Get project/app details to determine target path
    let targetPath = '';

    if (entityType === 'ProjectConfig') {
      const config = await prisma.projectConfig.findUnique({
        where: { id: entityId },
      });
      if (!config) return;

      const project = await prisma.project.findUnique({
        where: { id: config.projectId },
      });
      if (!project) return;

      targetPath = `${project.path}/${this.getConfigFileName(config.configType)}`;
    } else {
      const config = await prisma.appConfig.findUnique({
        where: { id: entityId },
      });
      if (!config) return;

      const app = await prisma.app.findUnique({
        where: { id: config.appId },
        include: { project: true },
      });
      if (!app) return;

      targetPath = `${app.project.path}/${app.path}/${this.getConfigFileName(config.configType)}`;
    }

    // Create sync queue entry
    await prisma.syncQueue.create({
      data: {
        entityType,
        entityId,
        operation: 'UPDATE',
        targetPath,
        status: 'PENDING',
      },
    });
  }

  /**
   * Queue dependency sync
   */
  private static async queueDependencySync(
    dependencyId: string,
    targetId: string,
  ) {
    // Determine target package.json path
    const dependency = await prisma.dependency.findUnique({
      where: { id: dependencyId },
    });
    if (!dependency) return;

    let targetPath = '';

    if (dependency.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: dependency.projectId },
      });
      if (project) {
        targetPath = `${project.path}/package.json`;
      }
    } else if (dependency.appId) {
      const app = await prisma.app.findUnique({
        where: { id: dependency.appId },
        include: { project: true },
      });
      if (app) {
        targetPath = `${app.project.path}/${app.path}/package.json`;
      }
    }

    if (targetPath) {
      await prisma.syncQueue.create({
        data: {
          entityType: 'Dependency',
          entityId: dependencyId,
          operation: 'UPDATE',
          targetPath,
          status: 'PENDING',
        },
      });
    }
  }

  /**
   * Get config file name for a config type
   */
  private static getConfigFileName(configType: ConfigType): string {
    const fileNames: Record<ConfigType, string> = {
      ESLINT: 'eslint.config.mjs',
      PRETTIER: '.prettierrc.mjs',
      TYPESCRIPT: 'tsconfig.json',
      TAILWIND: 'tailwind.config.ts',
      NEXTJS: 'next.config.ts',
      BABEL: 'babel.config.js',
      EXPO: 'app.json',
      POSTCSS: 'postcss.config.mjs',
      VITE: 'vite.config.ts',
      JEST: 'jest.config.js',
      PLAYWRIGHT: 'playwright.config.ts',
      VITEST: 'vitest.config.ts',
      TURBO: 'turbo.json',
      SENTRY: 'sentry.client.config.ts',
      VERCEL: 'vercel.json',
      BIOME: 'biome.json',
      STYLELINT: 'stylelint.config.js',
      TSUP: 'tsup.config.ts',
      BUNFIG: 'bunfig.toml',
      GITIGNORE: '.gitignore',
      PACKAGE_JSON: 'package.json',
      TSCONFIG: 'tsconfig.json',
      WINDSURF_RULES: '.windsurfrules',
      AGENTS_MD: 'AGENTS.md',
      CLAUDE_MD: 'CLAUDE.md',
      CURSOR_RULES: '.cursorrules',
      VSCODE: '.vscode/settings.json',
      APPLAB_CONFIG: 'applab.config.ts',
      COMPONENTS_JSON: 'components.json',
    };

    return fileNames[configType];
  }
}
