import { prisma } from '@/lib/db/prisma';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';

const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

interface ReconcileIssue {
  type:
    | 'config_name_mismatch'
    | 'db_name_mismatch'
    | 'missing_config'
    | 'missing_db_entry';
  description: string;
  expected: string;
  actual: string;
  autoFixable: boolean;
}

// GET - Check for discrepancies between filesystem, config, and database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;
    const projectPath = path.join(PROJECTS_BASE, projectName);
    const configPath = path.join(projectPath, 'applab.config.ts');

    const issues: ReconcileIssue[] = [];

    // Check if config file exists
    let configExists = false;
    let configName: string | null = null;
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      configExists = true;

      // Extract name from config
      const nameMatch = configContent.match(/name:\s*['"]([^'"]+)['"]/);
      if (nameMatch) {
        configName = nameMatch[1];
      }
    } catch {
      configExists = false;
    }

    // Check database
    const dbProject = await prisma.project.findFirst({
      where: {
        OR: [{ name: projectName }, { path: projectPath }],
      },
    });

    // Analyze issues
    if (!configExists) {
      issues.push({
        type: 'missing_config',
        description: 'No applab.config.ts file found',
        expected: configPath,
        actual: 'File does not exist',
        autoFixable: true,
      });
    } else if (configName && configName !== projectName) {
      issues.push({
        type: 'config_name_mismatch',
        description: 'Config name does not match directory name',
        expected: projectName,
        actual: configName,
        autoFixable: true,
      });
    }

    if (!dbProject) {
      issues.push({
        type: 'missing_db_entry',
        description: 'Project not registered in database',
        expected: `Database entry for "${projectName}"`,
        actual: 'No database entry',
        autoFixable: true,
      });
    } else if (dbProject.name !== projectName) {
      issues.push({
        type: 'db_name_mismatch',
        description: 'Database project name does not match directory name',
        expected: projectName,
        actual: dbProject.name,
        autoFixable: true,
      });
    }

    return NextResponse.json({
      projectName,
      projectPath,
      configExists,
      configName,
      dbProject: dbProject
        ? { id: dbProject.id, name: dbProject.name, path: dbProject.path }
        : null,
      issues,
      hasIssues: issues.length > 0,
    });
  } catch (error) {
    console.error('[Reconcile] Error checking project:', error);
    return NextResponse.json(
      {
        error: 'Failed to check project',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// POST - Fix discrepancies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;
    const projectPath = path.join(PROJECTS_BASE, projectName);
    const configPath = path.join(projectPath, 'applab.config.ts');

    const body = await request.json().catch(() => ({}));
    const { fixConfig = true, fixDatabase = true } = body;

    const fixes: string[] = [];

    // Check and fix config file
    if (fixConfig) {
      try {
        const configContent = await fs.readFile(configPath, 'utf-8');
        const nameMatch = configContent.match(/name:\s*['"]([^'"]+)['"]/);

        if (nameMatch && nameMatch[1] !== projectName) {
          // Update config name to match directory
          const updatedContent = configContent.replace(
            /name:\s*['"][^'"]+['"]/,
            `name: '${projectName}'`,
          );
          await fs.writeFile(configPath, updatedContent, 'utf-8');
          fixes.push(
            `Updated config name from "${nameMatch[1]}" to "${projectName}"`,
          );
        }
      } catch {
        // Config doesn't exist, create it
        const newConfig = `export default {
  name: '${projectName}',
  description: 'SummonIQ managed project',
  type: 'monorepo',
  apps: [],
};
`;
        await fs.writeFile(configPath, newConfig, 'utf-8');
        fixes.push('Created applab.config.ts file');
      }
    }

    // Check and fix database
    if (fixDatabase) {
      // Find any existing entry by path
      const existingByPath = await prisma.project.findFirst({
        where: { path: projectPath },
      });

      if (existingByPath && existingByPath.name !== projectName) {
        // Update database entry name to match directory
        await prisma.project.update({
          where: { id: existingByPath.id },
          data: { name: projectName, updatedAt: new Date() },
        });
        fixes.push(
          `Updated database name from "${existingByPath.name}" to "${projectName}"`,
        );
      } else if (!existingByPath) {
        // Check for entry with old name
        const existingByOldName = await prisma.project.findFirst({
          where: {
            path: { contains: projectName },
          },
        });

        if (existingByOldName) {
          await prisma.project.update({
            where: { id: existingByOldName.id },
            data: {
              name: projectName,
              path: projectPath,
              updatedAt: new Date(),
            },
          });
          fixes.push(`Fixed database entry path and name`);
        } else {
          // Create new database entry
          await prisma.project.create({
            data: {
              name: projectName,
              path: projectPath,
              description: 'SummonIQ managed project',
              starred: false,
            },
          });
          fixes.push('Created database entry');
        }
      }
    }

    return NextResponse.json({
      success: true,
      projectName,
      fixes,
      message:
        fixes.length > 0
          ? `Applied ${fixes.length} fix(es)`
          : 'No fixes needed',
    });
  } catch (error) {
    console.error('[Reconcile] Error fixing project:', error);
    return NextResponse.json(
      {
        error: 'Failed to reconcile project',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
