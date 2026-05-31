import { prisma } from '@/lib/db/prisma';
import * as fs from 'fs/promises';
import { NextResponse } from 'next/server';
import * as path from 'path';

// Base paths for scanning
const PROJECTS_BASE = '/Users/steven/Projects';
const APPLAB_BASE = '/Users/steven/Projects/applab';

// Parse .env file content
function parseEnvFile(
  content: string,
): Array<{ key: string; value: string; description?: string }> {
  const lines = content.split('\n');
  const vars: Array<{ key: string; value: string; description?: string }> = [];
  let currentDescription = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      currentDescription = '';
      continue;
    }

    // Handle comments as descriptions
    if (trimmed.startsWith('#')) {
      currentDescription = trimmed.substring(1).trim();
      continue;
    }

    // Parse KEY=value
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      vars.push({
        key: key.trim(),
        value: value.trim().replace(/^["']|["']$/g, ''), // Remove quotes
        description: currentDescription || undefined,
      });
      currentDescription = '';
    }
  }

  return vars;
}

// Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// GET - Fetch all environment variables grouped by project/app
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        path: true,
        apps: {
          select: {
            id: true,
            name: true,
            path: true,
            envVars: {
              select: {
                id: true,
                key: true,
                value: true,
                description: true,
                isSecret: true,
                category: true,
              },
              orderBy: { key: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
        envVars: {
          where: { appId: null },
          select: {
            id: true,
            key: true,
            value: true,
            description: true,
            isSecret: true,
            category: true,
          },
          orderBy: { key: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate summary
    const totalProjects = projects.length;
    const totalApps = projects.reduce((sum, p) => sum + p.apps.length, 0);
    const totalEnvVars = projects.reduce(
      (sum, p) =>
        sum +
        p.envVars.length +
        p.apps.reduce((appSum, a) => appSum + a.envVars.length, 0),
      0,
    );

    return NextResponse.json({
      projects,
      summary: {
        totalProjects,
        totalApps,
        totalEnvVars,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching environment variables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch environment variables' },
      { status: 500 },
    );
  }
}

// POST - Sync environment variables from .env files to database
export async function POST() {
  try {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Get all projects with their apps
    const projects = await prisma.project.findMany({
      include: {
        apps: true,
      },
    });

    for (const project of projects) {
      const projectPath = project.path;
      if (!projectPath) continue;

      // Check for project-level .env file
      const projectEnvPath = path.join(projectPath, '.env');
      if (await fileExists(projectEnvPath)) {
        try {
          const content = await fs.readFile(projectEnvPath, 'utf-8');
          const envVars = parseEnvFile(content);

          for (const envVar of envVars) {
            // Skip empty keys
            if (!envVar.key) continue;

            // Check if exists
            const existing = await prisma.environmentVariable.findFirst({
              where: {
                projectId: project.id,
                appId: null,
                key: envVar.key,
              },
            });

            if (existing) {
              // Update if value changed
              if (existing.value !== envVar.value) {
                await prisma.environmentVariable.update({
                  where: { id: existing.id },
                  data: {
                    value: envVar.value,
                    description: envVar.description || existing.description,
                  },
                });
                updated++;
              } else {
                skipped++;
              }
            } else {
              // Create new
              await prisma.environmentVariable.create({
                data: {
                  projectId: project.id,
                  key: envVar.key,
                  value: envVar.value,
                  description: envVar.description,
                  isSecret:
                    envVar.key.includes('SECRET') ||
                    envVar.key.includes('PASSWORD') ||
                    envVar.key.includes('KEY') ||
                    envVar.key.includes('TOKEN'),
                },
              });
              created++;
            }
          }
        } catch (err) {
          console.log(`[API] Could not read ${projectEnvPath}:`, err);
        }
      }

      // Check for app-level .env files
      for (const app of project.apps) {
        const appPath = app.path;
        if (!appPath) continue;

        // Construct full app path
        const fullAppPath = appPath.startsWith('/')
          ? appPath
          : path.join(projectPath, appPath);

        const appEnvPath = path.join(fullAppPath, '.env');
        if (await fileExists(appEnvPath)) {
          try {
            const content = await fs.readFile(appEnvPath, 'utf-8');
            const envVars = parseEnvFile(content);

            for (const envVar of envVars) {
              // Skip empty keys
              if (!envVar.key) continue;

              // Check if exists
              const existing = await prisma.environmentVariable.findFirst({
                where: {
                  projectId: project.id,
                  appId: app.id,
                  key: envVar.key,
                },
              });

              if (existing) {
                // Update if value changed
                if (existing.value !== envVar.value) {
                  await prisma.environmentVariable.update({
                    where: { id: existing.id },
                    data: {
                      value: envVar.value,
                      description: envVar.description || existing.description,
                    },
                  });
                  updated++;
                } else {
                  skipped++;
                }
              } else {
                // Create new
                await prisma.environmentVariable.create({
                  data: {
                    projectId: project.id,
                    appId: app.id,
                    key: envVar.key,
                    value: envVar.value,
                    description: envVar.description,
                    isSecret:
                      envVar.key.includes('SECRET') ||
                      envVar.key.includes('PASSWORD') ||
                      envVar.key.includes('KEY') ||
                      envVar.key.includes('TOKEN'),
                  },
                });
                created++;
              }
            }
          } catch (err) {
            console.log(`[API] Could not read ${appEnvPath}:`, err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Environment variables synced successfully',
      created,
      updated,
      skipped,
    });
  } catch (error) {
    console.error('[API] Error syncing environment variables:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync environment variables',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
