/**
 * Filesystem Sync Service
 * Handles writing configuration changes from DB to filesystem
 */

import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../db/prisma';
import type { SyncQueue } from '@prisma/client';

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  });
}

function log(message: string) {
  console.log(`[${timestamp()}] [Sync] ${message}`);
}

function error(message: string, err?: any) {
  console.error(`[${timestamp()}] [Sync] ${message}`, err || '');
}

export class FilesystemSyncService {
  /**
   * Process pending sync items
   */
  static async processSyncQueue(batchSize = 10) {
    // Get pending items
    const items = await prisma.syncQueue.findMany({
      where: {
        status: 'PENDING',
        attempts: {
          lt: 3, // Max 3 attempts
        },
      },
      take: batchSize,
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (items.length > 0) {
      log(`Processing ${items.length} pending sync items...`);
    }

    for (const item of items) {
      await this.processSyncItem(item);
    }
  }

  /**
   * Process a single sync item
   */
  private static async processSyncItem(item: SyncQueue) {
    try {
      // Update status to SYNCING
      await prisma.syncQueue.update({
        where: { id: item.id },
        data: {
          status: 'SYNCING',
          attempts: item.attempts + 1,
        },
      });

      // Handle different entity types
      if (item.entityType === 'ProjectConfig') {
        await this.syncProjectConfig(item);
      } else if (item.entityType === 'AppConfig') {
        await this.syncAppConfig(item);
      } else if (item.entityType === 'Dependency') {
        await this.syncDependency(item);
      }

      // Mark as SYNCED
      await prisma.syncQueue.update({
        where: { id: item.id },
        data: {
          status: 'SYNCED',
          processedAt: new Date(),
        },
      });

      // Update entity sync status
      await this.updateEntitySyncStatus(item.entityType, item.entityId, 'SYNCED');

      log(`✓ Synced ${item.entityType} ${item.entityId} to ${item.targetPath}`);
    } catch (err) {
      error(`✗ Failed to sync ${item.entityType} ${item.entityId}:`, err);

      // Mark as ERROR
      await prisma.syncQueue.update({
        where: { id: item.id },
        data: {
          status: 'ERROR',
          error: err instanceof Error ? err.message : String(err),
        },
      });

      // Update entity sync status
      await this.updateEntitySyncStatus(item.entityType, item.entityId, 'ERROR');
    }
  }

  /**
   * Sync project config to filesystem
   */
  private static async syncProjectConfig(item: SyncQueue) {
    const config = await prisma.projectConfig.findUnique({
      where: { id: item.entityId },
    });

    if (!config) {
      throw new Error('ProjectConfig not found');
    }

    // Convert JSON content to file format
    const fileContent = this.formatConfigContent(config.configType, config.content);

    // Ensure directory exists
    await fs.mkdir(path.dirname(item.targetPath), { recursive: true });

    // Write to file
    await fs.writeFile(item.targetPath, fileContent, 'utf-8');
  }

  /**
   * Sync app config to filesystem
   */
  private static async syncAppConfig(item: SyncQueue) {
    const config = await prisma.appConfig.findUnique({
      where: { id: item.entityId },
    });

    if (!config) {
      throw new Error('AppConfig not found');
    }

    // Convert JSON content to file format
    const fileContent = this.formatConfigContent(config.configType, config.content);

    // Ensure directory exists
    await fs.mkdir(path.dirname(item.targetPath), { recursive: true });

    // Write to file
    await fs.writeFile(item.targetPath, fileContent, 'utf-8');
  }

  /**
   * Sync dependency to package.json
   */
  private static async syncDependency(item: SyncQueue) {
    // Read current package.json
    let packageJson: any = {};
    try {
      const content = await fs.readFile(item.targetPath, 'utf-8');
      packageJson = JSON.parse(content);
    } catch (error) {
      // File doesn't exist, start fresh
      packageJson = {
        name: '',
        version: '0.1.0',
        private: true,
      };
    }

    // Get all dependencies for this target
    const projectId = await this.getProjectIdFromPath(item.targetPath);
    const appId = await this.getAppIdFromPath(item.targetPath);

    const dependencies = await prisma.dependency.findMany({
      where: {
        OR: [{ projectId }, { appId }],
      },
    });

    // Group by type
    const deps = {
      dependencies: {} as Record<string, string>,
      devDependencies: {} as Record<string, string>,
      peerDependencies: {} as Record<string, string>,
      optionalDependencies: {} as Record<string, string>,
    };

    for (const dep of dependencies) {
      const key =
        dep.type === 'DEV'
          ? 'devDependencies'
          : dep.type === 'PEER'
            ? 'peerDependencies'
            : dep.type === 'OPTIONAL'
              ? 'optionalDependencies'
              : 'dependencies';

      deps[key][dep.packageName] = dep.version;
    }

    // Update package.json
    packageJson.dependencies = this.sortObject(deps.dependencies);
    packageJson.devDependencies = this.sortObject(deps.devDependencies);
    if (Object.keys(deps.peerDependencies).length > 0) {
      packageJson.peerDependencies = this.sortObject(deps.peerDependencies);
    }
    if (Object.keys(deps.optionalDependencies).length > 0) {
      packageJson.optionalDependencies = this.sortObject(deps.optionalDependencies);
    }

    // Write back to file
    await fs.writeFile(item.targetPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  }

  /**
   * Format config content based on type
   */
  private static formatConfigContent(configType: string, content: any): string {
    switch (configType) {
      case 'ESLINT':
      case 'PRETTIER':
      case 'POSTCSS':
        // ESM module format
        return this.formatAsESModule(content);

      case 'TYPESCRIPT':
      case 'TAILWIND':
      case 'NEXTJS':
      case 'VERCEL':
      case 'TURBO':
      case 'BIOME':
        // JSON format (with or without imports)
        return JSON.stringify(content, null, 2) + '\n';

      case 'GITIGNORE':
        // Plain text, line by line
        return Array.isArray(content) ? content.join('\n') + '\n' : content;

      case 'BUNFIG':
        // TOML format
        return this.formatAsTOML(content);

      default:
        // Default to JSON
        return JSON.stringify(content, null, 2) + '\n';
    }
  }

  /**
   * Format content as ES module
   */
  private static formatAsESModule(content: any): string {
    // Extract imports if they exist
    const imports = content.imports || [];
    const config = content.config || content;

    let output = '';

    // Add imports
    if (imports.length > 0) {
      output += imports.join('\n') + '\n\n';
    }

    // Add config export
    output += `const config = ${JSON.stringify(config, null, 2)};\n\n`;
    output += 'export default config;\n';

    return output;
  }

  /**
   * Format content as TOML (basic implementation)
   */
  private static formatAsTOML(content: any): string {
    let output = '';

    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        output += `[${key}]\n`;
        for (const [subKey, subValue] of Object.entries(value)) {
          output += `${subKey} = ${JSON.stringify(subValue)}\n`;
        }
        output += '\n';
      } else {
        output += `${key} = ${JSON.stringify(value)}\n`;
      }
    }

    return output;
  }

  /**
   * Update entity sync status
   */
  private static async updateEntitySyncStatus(
    entityType: string,
    entityId: string,
    status: 'SYNCED' | 'ERROR',
  ) {
    const updateData = {
      lastSyncedAt: new Date(),
      syncStatus: status,
    };

    if (entityType === 'ProjectConfig') {
      await prisma.projectConfig.update({
        where: { id: entityId },
        data: updateData,
      });
    } else if (entityType === 'AppConfig') {
      await prisma.appConfig.update({
        where: { id: entityId },
        data: updateData,
      });
    } else if (entityType === 'Dependency') {
      await prisma.dependency.update({
        where: { id: entityId },
        data: updateData,
      });
    }
  }

  /**
   * Get project ID from file path
   */
  private static async getProjectIdFromPath(filePath: string): Promise<string | undefined> {
    const projectPath = path.dirname(filePath);
    const project = await prisma.project.findFirst({
      where: {
        path: {
          startsWith: projectPath,
        },
      },
    });
    return project?.id;
  }

  /**
   * Get app ID from file path
   */
  private static async getAppIdFromPath(filePath: string): Promise<string | undefined> {
    // Try to match app path
    const app = await prisma.app.findFirst({
      where: {
        OR: [
          { path: { startsWith: path.dirname(filePath) } },
          {
            project: {
              path: { startsWith: path.dirname(path.dirname(filePath)) },
            },
          },
        ],
      },
    });
    return app?.id;
  }

  /**
   * Sort object keys alphabetically
   */
  private static sortObject(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj)
      .sort()
      .reduce(
        (sorted, key) => {
          sorted[key] = obj[key];
          return sorted;
        },
        {} as Record<string, any>,
      );
  }
}
