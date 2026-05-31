import { prisma } from '@/lib/db/prisma';
import { getNextAvailablePortForProject } from '@/lib/port-manager';
import { analyzeProject } from '@/lib/project-analyzer';
import { AppType } from '@prisma/client';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

function isPathInside(parent: string, child: string): boolean {
  const parentResolved = path.resolve(parent);
  const childResolved = path.resolve(child);
  if (parentResolved === childResolved) return true;
  const parentWithSep = parentResolved.endsWith(path.sep)
    ? parentResolved
    : `${parentResolved}${path.sep}`;
  return childResolved.startsWith(parentWithSep);
}

async function maybeRemoveFile(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore
  }
}

async function maybeRemoveDir(dirPath: string) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

function toAppType(value: unknown): AppType {
  if (typeof value !== 'string') return 'WEB_APP';

  const typeMap: Record<string, AppType> = {
    'web-app': 'WEB_APP',
    'desktop-app': 'DESKTOP_APP',
    'mobile-app': 'MOBILE_APP',
    api: 'API',
    'marketing-site': 'MARKETING_SITE',
    library: 'LIBRARY',
    monorepo: 'MONOREPO',
    cli: 'CLI',
    extension: 'EXTENSION',
    docs: 'CUSTOM',
    custom: 'CUSTOM',
    unknown: 'CUSTOM',
  };

  const normalized = value.trim();
  const mapped = typeMap[normalized] ?? typeMap[normalized.toLowerCase()];
  if (mapped) return mapped;

  const upper = normalized.toUpperCase();
  return (Object.values(AppType) as string[]).includes(upper)
    ? (upper as AppType)
    : 'WEB_APP';
}

// POST - Initialize SummonIQ config for a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  let projectPath: string | undefined;
  let projectDirExistedBefore = false;
  let createdProjectDir = false;
  let gitExistedBefore = false;
  let gitInitialized = false;
  let gitignoreExistedBefore = false;
  let wroteGitignore = false;
  let configExistedBefore = false;
  let wroteConfig = false;
  let configPath: string | undefined;
  let gitDir: string | undefined;
  let gitignorePath: string | undefined;

  try {
    const { name } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      projectPath?: string;
    };
    projectPath = body.projectPath;

    if (!projectPath || typeof projectPath !== 'string') {
      return NextResponse.json(
        { error: 'Missing projectPath' },
        { status: 400 },
      );
    }

    console.log(
      '[API] Initializing SummonIQ config for:',
      name,
      'at path:',
      projectPath,
    );

    // Create project directory if it doesn't exist
    try {
      try {
        await fs.access(projectPath);
        projectDirExistedBefore = true;
      } catch {
        projectDirExistedBefore = false;
      }
      await fs.mkdir(projectPath, { recursive: true });
      createdProjectDir = !projectDirExistedBefore;
      console.log('[API] Project directory ensured at:', projectPath);
    } catch (mkdirError) {
      console.error('[API] Failed to create directory:', mkdirError);
      return NextResponse.json(
        {
          error: 'Failed to create project directory',
          details:
            mkdirError instanceof Error
              ? mkdirError.message
              : String(mkdirError),
        },
        { status: 500 },
      );
    }

    // Initialize Git repository if it doesn't exist
    gitDir = path.join(projectPath, '.git');

    try {
      await fs.access(gitDir);
      gitExistedBefore = true;
      console.log('[API] Git repository already exists');
    } catch {
      gitExistedBefore = false;
      // .git doesn't exist, initialize it
      try {
        await execAsync('git init', { cwd: projectPath });
        console.log('[API] Git repository initialized');
        gitInitialized = true;

        // TODO: Optionally create a GitHub repo, set origin, and push the initial commit.
        // TODO: Optionally provision a Vercel project + deployment pipeline after repo creation.

        // Create basic .gitignore
        const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/
.next/
out/

# Misc
.DS_Store
*.log
*.swp
*.swo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.sublime-*
`;
        gitignorePath = path.join(projectPath, '.gitignore');
        try {
          await fs.access(gitignorePath);
          gitignoreExistedBefore = true;
        } catch {
          gitignoreExistedBefore = false;
        }
        await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');
        wroteGitignore = true;
        console.log('[API] .gitignore created');
      } catch (gitError) {
        console.error('[API] Failed to initialize Git:', gitError);
        // Don't fail the whole operation if git init fails
      }
    }

    // Analyze project to detect existing apps
    let detectedApps: Array<{
      name: string;
      path: string;
      type?: string;
      framework?: string;
      devPort?: number;
      devCommand?: string;
      description?: string;
    }> = [];

    try {
      const analysis = await analyzeProject(projectPath);
      if (analysis.apps && analysis.apps.length > 0) {
        detectedApps = analysis.apps;
        console.log(
          '[API] Detected',
          detectedApps.length,
          'existing apps:',
          detectedApps.map(a => a.name),
        );
      }
    } catch (analyzeError) {
      console.warn(
        '[API] Could not analyze project for existing apps:',
        analyzeError,
      );
    }

    configPath = path.join(projectPath, 'applab.config.ts');
    try {
      await fs.access(configPath);
      configExistedBefore = true;
    } catch {
      configExistedBefore = false;
    }

    // Generate apps array for config
    const appsConfigArray =
      detectedApps.length > 0
        ? detectedApps
            .map(
              app => `    {
      name: '${app.name}',
      type: '${app.type || 'web-app'}',
      description: '${app.description || ''}',
      path: '${app.path}',${
        app.devPort || app.devCommand
          ? `
      dev: {${
        app.devCommand
          ? `
        command: '${app.devCommand}',`
          : ''
      }${
        app.devPort
          ? `
        port: ${app.devPort},`
          : ''
      }
      },`
          : ''
      }
    }`,
            )
            .join(',\n')
        : '';

    // Create applab.config.ts content
    const configContent = `export default {
  name: '${name}',
  description: 'SummonIQ managed project',
  type: 'monorepo',
  apps: [
${appsConfigArray}
  ],
};
`;

    // Write config file
    const fileHandle = await fs.open(configPath, 'w');
    await fileHandle.write(configContent, 0, 'utf-8');
    await fileHandle.sync(); // Force flush to disk
    await fileHandle.close();

    wroteConfig = true;

    console.log('[API] Config file created and synced at:', configPath);

    // Verify file exists
    try {
      await fs.access(configPath);
      const stats = await fs.stat(configPath);
      console.log('[API] File verified - exists, size:', stats.size, 'bytes');
    } catch (err) {
      console.error('[API] ERROR: File does not exist after creation!', err);
      return NextResponse.json(
        { error: 'File created but verification failed' },
        { status: 500 },
      );
    }

    // Sync detected apps to database
    const project = await prisma.project.findUnique({
      where: { name },
    });

    if (project && detectedApps.length > 0) {
      console.log('[API] Syncing', detectedApps.length, 'apps to database');

      for (const app of detectedApps) {
        const appTypeEnum = toAppType(app.type);

        // Auto-assign port if not detected
        let devPort = app.devPort;
        if (!devPort) {
          try {
            const autoPort = await getNextAvailablePortForProject(
              project.id,
              appTypeEnum,
            );
            if (autoPort) {
              devPort = autoPort;
              app.devPort = devPort; // Update for response
              console.log(
                '[API] Auto-assigned port:',
                devPort,
                'for:',
                app.name,
              );
            }
          } catch (error) {
            console.warn('[API] Could not auto-assign port for:', app.name);
          }
        }

        // Upsert app in database
        await prisma.app.upsert({
          where: {
            projectId_name: {
              projectId: project.id,
              name: app.name,
            },
          },
          update: {
            type: appTypeEnum,
            path: app.path,
            devPort: devPort,
            description: app.description || undefined,
          },
          create: {
            projectId: project.id,
            name: app.name,
            type: appTypeEnum,
            path: app.path,
            devPort: devPort,
            description: app.description || '',
            autoOpen: false,
          },
        });
      }

      console.log('[API] Apps synced to database');
    }

    const appsDetected = detectedApps.length;
    let message = 'SummonIQ config created';
    if (gitInitialized && appsDetected > 0) {
      message = `SummonIQ config created with ${appsDetected} detected app${appsDetected > 1 ? 's' : ''} and Git repository initialized`;
    } else if (gitInitialized) {
      message = 'SummonIQ config created and Git repository initialized';
    } else if (appsDetected > 0) {
      message = `SummonIQ config created with ${appsDetected} detected app${appsDetected > 1 ? 's' : ''}`;
    }

    return NextResponse.json({
      success: true,
      message,
      configPath,
      gitInitialized,
      appsDetected,
      apps: detectedApps,
    });
  } catch (error) {
    console.error('[API] Error creating config:', error);

    try {
      const safeProjectPath =
        typeof projectPath === 'string' && projectPath.length > 0
          ? path.resolve(projectPath)
          : null;
      const canRemoveProjectDir =
        Boolean(safeProjectPath) &&
        createdProjectDir &&
        isPathInside(PROJECTS_BASE, safeProjectPath as string);

      if (
        typeof configPath === 'string' &&
        wroteConfig &&
        !configExistedBefore
      ) {
        await maybeRemoveFile(configPath);
      }

      if (
        typeof gitignorePath === 'string' &&
        wroteGitignore &&
        !gitignoreExistedBefore
      ) {
        await maybeRemoveFile(gitignorePath);
      }

      if (typeof gitDir === 'string' && gitInitialized && !gitExistedBefore) {
        await maybeRemoveDir(gitDir);
      }

      if (canRemoveProjectDir && safeProjectPath) {
        try {
          const entries = await fs.readdir(safeProjectPath);
          if (entries.length === 0) {
            await maybeRemoveDir(safeProjectPath);
          }
        } catch {
          // ignore
        }
      }
    } catch (cleanupError) {
      console.warn(
        '[API] Cleanup after failed init did not fully complete:',
        cleanupError,
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create config',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
