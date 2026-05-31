import { prisma } from '@/lib/db/prisma';
import { getNextAvailablePortForProject } from '@/lib/port-manager';
import { resolveProjectPath } from '@/lib/services/project-service';
import { AppType } from '@prisma/client';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

function toAppType(value: unknown): AppType | null {
  if (typeof value !== 'string') return null;

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
  };

  const normalized = value.trim();
  const mapped = typeMap[normalized] ?? typeMap[normalized.toLowerCase()];
  if (mapped) return mapped;

  const upper = normalized.toUpperCase();
  return (Object.values(AppType) as string[]).includes(upper)
    ? (upper as AppType)
    : null;
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensurePackageJson(params: {
  fullAppPath: string;
  appName: string;
  description?: string;
  devPort?: number;
}) {
  const pkgPath = path.join(params.fullAppPath, 'package.json');
  try {
    await fs.access(pkgPath);
    return;
  } catch {
    // continue
  }

  const packageJson = {
    name: toKebabCase(params.appName),
    version: '1.0.0',
    description: params.description || '',
    scripts: {
      dev: 'next dev --port ' + String(params.devPort || 3000),
      build: 'next build',
      start: 'next start',
    },
    dependencies: {
      next: '^14.2.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
    },
  };

  await fs.writeFile(pkgPath, JSON.stringify(packageJson, null, 2), 'utf-8');
}

// GET - Retrieve apps from project config
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;

    console.log('[API] Getting apps for project:', projectName);

    // Resolve project path (DB path > conventional path > config-name scan)
    const projectPath =
      (await resolveProjectPath(projectName)) ??
      path.join(PROJECTS_BASE, projectName);
    const configPath = path.join(projectPath, 'applab.config.ts');

    console.log('[API] Reading config from:', configPath);

    // Read existing config
    let configContent: string;
    try {
      configContent = await fs.readFile(configPath, 'utf-8');
    } catch (err) {
      console.error('[API] Failed to read config file:', err);
      return NextResponse.json(
        {
          error: 'Project config not found',
          details: 'Could not read applab.config.ts',
        },
        { status: 404 },
      );
    }

    // Parse the config to extract apps
    const appsMatch = configContent.match(/apps:\s*\[([\s\S]*?)\]/);
    if (!appsMatch) {
      return NextResponse.json({ apps: [] });
    }

    // Simple parsing - extract app objects
    const appsContent = appsMatch[1];
    const apps: any[] = [];

    // Split by objects (look for { ... } patterns)
    const appMatches = appsContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);

    if (appMatches) {
      for (const appMatch of appMatches) {
        try {
          // Extract properties using regex
          const nameMatch = appMatch.match(/name:\s*['"`]([^'"`]+)['"`]/);
          const typeMatch = appMatch.match(/type:\s*['"`]([^'"`]+)['"`]/);
          const descMatch = appMatch.match(
            /description:\s*['"`]([^'"`]*)['"`]/,
          );
          const pathMatch = appMatch.match(/path:\s*['"`]([^'"`]+)['"`]/);
          const portMatch = appMatch.match(/port:\s*(\d+)/);

          if (nameMatch) {
            const appPath = pathMatch ? pathMatch[1] : undefined;
            let displayName: string | undefined;

            // Try to read friendly name from app's package.json
            if (appPath) {
              try {
                const appPkgPath = path.join(
                  projectPath,
                  appPath,
                  'package.json',
                );
                const appPkgContent = await fs.readFile(appPkgPath, 'utf-8');
                const appPkg = JSON.parse(appPkgContent);
                if (appPkg.name && appPkg.name !== nameMatch[1]) {
                  displayName = appPkg.name;
                }
              } catch {
                // No package.json or can't read it, use config name
              }
            }

            const app = {
              name: nameMatch[1],
              displayName,
              type: typeMatch ? typeMatch[1] : 'web-app',
              description: descMatch ? descMatch[1] : '',
              path: appPath,
              devPort: portMatch ? parseInt(portMatch[1]) : undefined,
            };
            apps.push(app);
          }
        } catch (parseError) {
          console.warn('[API] Failed to parse app:', appMatch, parseError);
        }
      }
    }

    console.log(
      '[API] Found',
      apps.length,
      'apps:',
      apps.map(a => a.name),
    );

    return NextResponse.json({ apps });
  } catch (error) {
    console.error('[API] Error getting apps:', error);
    return NextResponse.json(
      {
        error: 'Failed to get apps',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// POST - Add app to project config
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;
    const appData = await request.json();

    console.log('[API] Adding app to project:', projectName, 'app:', appData);

    // Get project from database to obtain project ID
    const project = await prisma.project.findUnique({
      where: { name: projectName },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found in database' },
        { status: 404 },
      );
    }

    const appTypeEnum = toAppType(appData.type) ?? 'WEB_APP';

    // Auto-assign port if not provided
    let devPort = appData.devPort;
    if (!devPort) {
      try {
        const autoPort = await getNextAvailablePortForProject(
          project.id,
          appTypeEnum,
        );
        if (autoPort) {
          devPort = autoPort;
          console.log(
            '[API] Auto-assigned project port:',
            devPort,
            'for type:',
            appTypeEnum,
          );
        }
      } catch (error) {
        console.warn('[API] Could not auto-assign port:', error);
        // Continue without a port
      }
    }

    // Get project path from database or use default
    const projectPath = project.path || path.join(PROJECTS_BASE, projectName);
    const configPath = path.join(projectPath, 'applab.config.ts');

    console.log('[API] Reading config from:', configPath);

    // Read existing config
    let configContent: string;
    try {
      configContent = await fs.readFile(configPath, 'utf-8');
    } catch (err) {
      console.error('[API] Failed to read config file:', err);
      return NextResponse.json(
        {
          error: 'Project config not found',
          details: 'Could not read applab.config.ts',
        },
        { status: 404 },
      );
    }

    // Parse the config (simple regex approach for now)
    // Extract the apps array
    const appsMatch = configContent.match(/apps:\s*\[([\s\S]*?)\]/);
    if (!appsMatch) {
      return NextResponse.json(
        {
          error: 'Invalid config format',
          details: 'Could not find apps array',
        },
        { status: 400 },
      );
    }

    // Auto-generate path if not provided - apps go in apps/ directory
    const appPath = appData.path || `apps/${toKebabCase(appData.name)}`;

    // Create new app entry
    const newApp = {
      name: appData.name,
      type: appData.type || 'web-app',
      description: appData.description || '',
      path: appPath,
      ...(devPort && {
        dev: {
          command: appData.devCommand || 'bun dev',
          port: devPort,
        },
      }),
      ...(appData.buildCommand && {
        build: {
          command: appData.buildCommand,
        },
      }),
    };

    console.log('[API] New app object:', newApp);

    // Convert to string format
    const appString = `    {
      name: '${newApp.name}',
      type: '${newApp.type}',
      description: '${newApp.description}',${
        newApp.path
          ? `
      path: '${newApp.path}',`
          : ''
      }${
        (newApp as any).dev
          ? `
      dev: {
        command: '${(newApp as any).dev.command}',
        port: ${(newApp as any).dev.port},
      },`
          : ''
      }${
        (newApp as any).build
          ? `
      build: {
        command: '${(newApp as any).build.command}',
      },`
          : ''
      }
    }`;

    // Insert the new app
    const currentApps = appsMatch[1].trim();
    let newAppsArray: string;

    if (currentApps === '') {
      // Empty array, just add the new app
      newAppsArray = `[\n${appString}\n  ]`;
    } else {
      // Add comma and new app
      newAppsArray = `[\n${currentApps},\n${appString}\n  ]`;
    }

    // Replace the apps array in config
    const newConfigContent = configContent.replace(
      /apps:\s*\[[\s\S]*?\]/,
      `apps: ${newAppsArray}`,
    );

    console.log('[API] Writing updated config...');

    // Write updated config
    await fs.writeFile(configPath, newConfigContent, 'utf-8');

    console.log('[API] Config updated successfully');

    // Save app to database
    try {
      await prisma.app.create({
        data: {
          projectId: project.id,
          name: appData.name,
          description: appData.description || '',
          type: appTypeEnum,
          path: appPath,
          devPort: devPort,
          autoOpen: false,
        },
      });
      console.log('[API] App saved to database with port:', devPort);
    } catch (dbError) {
      console.error('[API] Failed to save app to database:', dbError);
      // Continue even if database save fails
    }

    // Step 2: Scaffold app from template - always scaffold since we always have a path now
    const fullAppPath = path.join(projectPath, appPath);
    console.log('[API] Scaffolding app at:', fullAppPath);

    try {
      // Create app directory
      await fs.mkdir(fullAppPath, { recursive: true });
      console.log('[API] Created directory:', fullAppPath);

      // Fetch template based on app type
      const templateType = appData.type || 'web-app';
      console.log('[API] Fetching template for type:', templateType);

      const template = await prisma.template.findFirst({
        where: {
          type: templateType,
        },
        include: {
          files: {
            orderBy: {
              path: 'asc',
            },
          },
        },
      });

      if (template && template.files.length > 0) {
        console.log(
          '[API] Found template:',
          template.name,
          'with',
          template.files.length,
          'files',
        );

        // Copy template files
        for (const file of template.files) {
          const filePath = path.join(fullAppPath, file.path);

          if (file.isDirectory) {
            await fs.mkdir(filePath, { recursive: true });
            console.log('[API] Created directory:', file.path);
          } else {
            // Ensure parent directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });

            // Write file content
            await fs.writeFile(filePath, file.content, 'utf-8');
            console.log('[API] Created file:', file.path);
          }
        }

        console.log('[API] All template files copied');

        // Templates must produce a runnable app; ensure package.json exists.
        await ensurePackageJson({
          fullAppPath,
          appName: appData.name,
          description: appData.description,
          devPort,
        });
      } else {
        console.warn('[API] No template found for type:', templateType);
        // Create a minimal but runnable Next.js app
        const packageJson = {
          name: appData.name,
          version: '1.0.0',
          description: appData.description || '',
          scripts: {
            dev: 'next dev --port ' + (devPort || 3000),
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            next: '^14.2.0',
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            typescript: '^5.0.0',
            '@types/node': '^20.0.0',
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
          },
        };
        await fs.writeFile(
          path.join(fullAppPath, 'package.json'),
          JSON.stringify(packageJson, null, 2),
          'utf-8',
        );

        // Create app directory structure
        await fs.mkdir(path.join(fullAppPath, 'app'), { recursive: true });

        // Create layout.tsx
        const layoutContent = `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
        await fs.writeFile(
          path.join(fullAppPath, 'app/layout.tsx'),
          layoutContent,
          'utf-8',
        );

        // Create page.tsx
        const pageContent = `export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>${appData.name}</h1>
      <p>${appData.description || 'Welcome to your new app!'}</p>
    </main>
  );
}
`;
        await fs.writeFile(
          path.join(fullAppPath, 'app/page.tsx'),
          pageContent,
          'utf-8',
        );

        // Create tsconfig.json
        const tsConfig = {
          compilerOptions: {
            target: 'es5',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
            paths: { '@/*': ['./*'] },
          },
          include: [
            'next-env.d.ts',
            '**/*.ts',
            '**/*.tsx',
            '.next/types/**/*.ts',
          ],
          exclude: ['node_modules'],
        };
        await fs.writeFile(
          path.join(fullAppPath, 'tsconfig.json'),
          JSON.stringify(tsConfig, null, 2),
          'utf-8',
        );

        // Create next.config.js
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
`;
        await fs.writeFile(
          path.join(fullAppPath, 'next.config.js'),
          nextConfig,
          'utf-8',
        );

        console.log('[API] Created Next.js app structure');
      }
    } catch (scaffoldError) {
      console.error('[API] Error scaffolding app:', scaffoldError);
      // Continue even if scaffolding fails, config is already updated
    }

    return NextResponse.json({
      success: true,
      message: 'App added to project and scaffolded',
      app: newApp,
    });
  } catch (error) {
    console.error('[API] Error adding app:', error);
    return NextResponse.json(
      {
        error: 'Failed to add app',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
