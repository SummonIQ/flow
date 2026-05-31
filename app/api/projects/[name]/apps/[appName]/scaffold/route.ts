import { prisma } from '@/lib/db/prisma';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';

const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

function toKebabCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

async function ensureConfigPath(params: {
  projectPath: string;
  appName: string;
  appRelativePath: string;
}) {
  const configPath = path.join(params.projectPath, 'applab.config.ts');

  let configContent: string;
  try {
    configContent = await fs.readFile(configPath, 'utf-8');
  } catch {
    return;
  }

  const appsMatch = configContent.match(/apps:\s*\[([\s\S]*?)\]/);
  if (!appsMatch) return;

  const appsContent = appsMatch[1];
  const appMatches = appsContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
  if (!appMatches) return;

  const target = appMatches.find(match => {
    const nameMatch = match.match(/name:\s*['"`]([^'"`]+)['"`]/);
    return nameMatch?.[1] === params.appName;
  });

  if (!target) return;
  if (/path:\s*['"`]/.test(target)) return;

  const insertion = `\n      path: '${params.appRelativePath}',`;
  const updatedTarget = target.replace(
    /(description:\s*['"`][^'"`]*['"`],?)/,
    `$1${insertion}`,
  );

  const replaced = updatedTarget !== target;
  const fallbackUpdatedTarget = replaced
    ? updatedTarget
    : target.replace(/(type:\s*['"`][^'"`]+['"`],?)/, `$1${insertion}`);

  if (fallbackUpdatedTarget === target) return;

  const escaped = escapeRegExp(target);
  const targetRegex = new RegExp(escaped);
  const updatedAppsContent = appsContent.replace(
    targetRegex,
    fallbackUpdatedTarget,
  );
  const updatedConfig = configContent.replace(
    /apps:\s*\[[\s\S]*?\]/,
    `apps: [${updatedAppsContent}]`,
  );

  if (updatedConfig !== configContent) {
    await fs.writeFile(configPath, updatedConfig, 'utf-8');
  }
}

function isWithinProject(projectPath: string, candidatePath: string): boolean {
  const projectResolved = path.resolve(projectPath);
  const candidateResolved = path.resolve(candidatePath);
  return (
    candidateResolved === projectResolved ||
    candidateResolved.startsWith(projectResolved + path.sep)
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; appName: string }> },
) {
  try {
    const { name: projectName, appName } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      projectPath?: string;
      type?: string;
      description?: string;
      path?: string;
      devPort?: number;
    };

    const project = await prisma.project.findUnique({
      where: { name: projectName },
    });

    const projectPath =
      project?.path ||
      body.projectPath ||
      path.join(PROJECTS_BASE, projectName);

    if (!projectPath) {
      return NextResponse.json(
        { success: false, error: 'Project path not found' },
        { status: 404 },
      );
    }

    const appRelativePath = body.path || `apps/${toKebabCase(appName)}`;
    const fullAppPath = path.join(projectPath, appRelativePath);

    if (!isWithinProject(projectPath, fullAppPath)) {
      return NextResponse.json(
        { success: false, error: 'Invalid app path' },
        { status: 400 },
      );
    }

    const pkgPath = path.join(fullAppPath, 'package.json');

    try {
      await fs.access(pkgPath);
      return NextResponse.json({
        success: true,
        alreadyScaffolded: true,
        appPath: appRelativePath,
      });
    } catch {
      // continue
    }

    await fs.mkdir(fullAppPath, { recursive: true });

    await ensureConfigPath({
      projectPath,
      appName,
      appRelativePath,
    });

    const templateType = body.type || 'web-app';

    const template = await prisma.template.findFirst({
      where: { type: templateType },
      include: {
        files: {
          orderBy: { path: 'asc' },
        },
      },
    });

    if (template && template.files.length > 0) {
      for (const file of template.files) {
        const targetPath = path.join(fullAppPath, file.path);

        if (!isWithinProject(projectPath, targetPath)) {
          continue;
        }

        if (file.isDirectory) {
          await fs.mkdir(targetPath, { recursive: true });
        } else {
          const dir = path.dirname(targetPath);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(targetPath, file.content, 'utf-8');
        }
      }

      await ensurePackageJson({
        fullAppPath,
        appName,
        description: body.description,
        devPort: body.devPort,
      });

      return NextResponse.json({
        success: true,
        appPath: appRelativePath,
        templateId: template.id,
      });
    }

    await ensurePackageJson({
      fullAppPath,
      appName,
      description: body.description,
      devPort: body.devPort,
    });

    await fs.mkdir(path.join(fullAppPath, 'app'), { recursive: true });

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

    const pageContent = `export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>${appName}</h1>
      <p>${body.description || 'Welcome to your new app!'}</p>
    </main>
  );
}
`;

    await fs.writeFile(
      path.join(fullAppPath, 'app/page.tsx'),
      pageContent,
      'utf-8',
    );

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
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    };

    await fs.writeFile(
      path.join(fullAppPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2),
      'utf-8',
    );

    const nextEnvContent = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
`;

    await fs.writeFile(
      path.join(fullAppPath, 'next-env.d.ts'),
      nextEnvContent,
      'utf-8',
    );

    const nextConfig = `const nextConfig = {};

export default nextConfig;
`;

    await fs.writeFile(
      path.join(fullAppPath, 'next.config.ts'),
      nextConfig,
      'utf-8',
    );

    return NextResponse.json({
      success: true,
      appPath: appRelativePath,
      templateId: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
