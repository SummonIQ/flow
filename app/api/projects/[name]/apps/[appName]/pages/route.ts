import { prisma } from '@/lib/db/prisma';
import { resolveProjectPath } from '@/lib/services/project-service';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

interface DetectedPage {
  id: string;
  name: string;
  route: string;
  type: 'page' | 'layout' | 'loading' | 'error';
  filePath: string;
}

// Recursively scan app directory for Next.js pages
async function scanNextJsPages(
  appDir: string,
  basePath: string = '',
): Promise<DetectedPage[]> {
  const pages: DetectedPage[] = [];

  try {
    const entries = await fs.readdir(appDir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden files and common non-page directories
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
      if (
        [
          'node_modules',
          'api',
          'components',
          'lib',
          'utils',
          'hooks',
          'styles',
        ].includes(entry.name)
      )
        continue;

      const fullPath = path.join(appDir, entry.name);

      if (entry.isDirectory()) {
        // Check if this is a route group (parentheses)
        const isRouteGroup =
          entry.name.startsWith('(') && entry.name.endsWith(')');
        const newBasePath = isRouteGroup
          ? basePath
          : `${basePath}/${entry.name}`;

        // Recursively scan subdirectories
        const subPages = await scanNextJsPages(fullPath, newBasePath);
        pages.push(...subPages);
      } else if (entry.isFile()) {
        // Check for page files
        const fileName = entry.name;
        const route = basePath || '/';

        if (
          fileName === 'page.tsx' ||
          fileName === 'page.js' ||
          fileName === 'page.jsx'
        ) {
          // Generate a readable name from the route
          const routeParts = route.split('/').filter(Boolean);
          const name =
            routeParts.length > 0
              ? routeParts[routeParts.length - 1]
                  .replace(/\[([^\]]+)\]/g, ':$1') // Convert [id] to :id
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase()) // Capitalize
              : 'Home';

          pages.push({
            id: `nextjs-${route.replace(/\//g, '-') || 'home'}`,
            name,
            route,
            type: 'page',
            filePath: fullPath,
          });
        }
      }
    }
  } catch (error) {
    console.error('[Pages API] Error scanning directory:', appDir, error);
  }

  return pages;
}

// GET - Detect pages in a Next.js app
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; appName: string }> },
) {
  try {
    const { name: projectName, appName } = await params;

    const resolvedProjectPath = await resolveProjectPath(projectName);
    if (!resolvedProjectPath) {
      return NextResponse.json(
        { error: 'Project directory could not be resolved' },
        { status: 404 },
      );
    }

    // Get project from database
    const project =
      (await prisma.project.findUnique({
        where: { name: projectName },
        include: { apps: true },
      })) ??
      (await prisma.project.findUnique({
        where: { path: resolvedProjectPath },
        include: { apps: true },
      }));

    // Find the app
    const app = project?.apps?.find(a => a.name === appName);
    const appPath = app?.path || '.';

    // Determine the app directory path
    const projectPath = project?.path ?? resolvedProjectPath;
    const fullAppPath =
      appPath === '.' ? projectPath : path.join(projectPath, appPath);

    // Check for app directory (Next.js App Router)
    const appDir = path.join(fullAppPath, 'app');

    try {
      await fs.access(appDir);
    } catch {
      // No app directory, check for pages directory (Pages Router)
      const pagesDir = path.join(fullAppPath, 'pages');
      try {
        await fs.access(pagesDir);
        // TODO: Add Pages Router detection if needed
        return NextResponse.json({
          pages: [],
          source: 'pages-router-not-implemented',
        });
      } catch {
        return NextResponse.json({ pages: [], source: 'no-app-or-pages-dir' });
      }
    }

    // Scan for pages
    const pages = await scanNextJsPages(appDir);

    // Sort by route
    pages.sort((a, b) => {
      if (a.route === '/') return -1;
      if (b.route === '/') return 1;
      return a.route.localeCompare(b.route);
    });

    return NextResponse.json({
      pages,
      source: 'app-router',
      appPath: fullAppPath,
    });
  } catch (error) {
    console.error('[Pages API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect pages',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
