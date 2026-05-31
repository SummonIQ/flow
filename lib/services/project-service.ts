import { prisma } from '@/lib/db/prisma';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

export interface ProjectData {
  name: string;
  description: string;
  path: string | undefined;
  id?: string;
}

export interface AppData {
  name: string;
  type: string;
  description: string;
  path?: string;
  devPort?: number;
}

function extractProjectNameFromConfig(content: string): string | null {
  const appsIndex = content.search(/\bapps\s*:/);
  const header = (
    appsIndex === -1 ? content : content.slice(0, appsIndex)
  ).slice(0, 5000);
  const match = header.match(/\bname\s*:\s*['"`']([^'"`]+)['"`']/);
  return match ? match[1] : null;
}

async function configExistsAt(projectPath: string): Promise<boolean> {
  try {
    await fs.access(path.join(projectPath, 'applab.config.ts'));
    return true;
  } catch {
    return false;
  }
}

async function getConfigProjectNameAt(
  projectPath: string,
): Promise<string | null> {
  try {
    const configContent = await fs.readFile(
      path.join(projectPath, 'applab.config.ts'),
      'utf-8',
    );
    return extractProjectNameFromConfig(configContent);
  } catch {
    return null;
  }
}

async function dirExists(projectPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(projectPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function findProjectPathByConfigName(
  projectName: string,
): Promise<string | null> {
  let entries: Array<{
    name: string;
    isDirectory: () => boolean;
    isSymbolicLink: () => boolean;
  }>;
  try {
    entries = (await fs.readdir(PROJECTS_BASE, { withFileTypes: true })) as any;
  } catch {
    return null;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const dirPath = path.join(PROJECTS_BASE, entry.name);

    if (!entry.isDirectory()) {
      if (!entry.isSymbolicLink()) continue;
      if (!(await dirExists(dirPath))) continue;
    }

    if (!(await configExistsAt(dirPath))) continue;

    let configContent: string;
    try {
      configContent = await fs.readFile(
        path.join(dirPath, 'applab.config.ts'),
        'utf-8',
      );
    } catch {
      continue;
    }

    const parsedName = extractProjectNameFromConfig(configContent);
    if (parsedName && parsedName === projectName) {
      return dirPath;
    }
  }

  return null;
}

/**
 * Resolve a project's filesystem path given the name used in URLs.
 *
 * Order:
 * - DB project.path (if present and exists)
 * - Conventional path: PROJECTS_BASE/<name> (if exists)
 * - Scan PROJECTS_BASE for a folder whose applab.config.ts name matches <name>
 */
export async function resolveProjectPath(name: string): Promise<string | null> {
  const dbProject = await prisma.project.findFirst({ where: { name } });
  if (dbProject?.path && (await dirExists(dbProject.path))) {
    return dbProject.path;
  }

  const conventionalPath = path.join(PROJECTS_BASE, name);
  if (await dirExists(conventionalPath)) {
    const configName = await getConfigProjectNameAt(conventionalPath);
    if (!configName || configName === name) {
      return conventionalPath;
    }
  }

  return await findProjectPathByConfigName(name);
}

/**
 * Get project metadata from database and filesystem
 * This is a server-side only function - do not use in client components
 */
export async function getProject(name: string): Promise<ProjectData> {
  // Check database first
  const dbProject = await prisma.project.findFirst({ where: { name } });

  if (dbProject) {
    const resolvedPath = await resolveProjectPath(dbProject.name);
    return {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description || '',
      path: resolvedPath ?? undefined,
    };
  }

  // Fall back to filesystem check
  const projectPath =
    (await resolveProjectPath(name)) ?? path.join(PROJECTS_BASE, name);
  const configPath = path.join(projectPath, 'applab.config.ts');

  try {
    await fs.access(configPath);

    // Try to parse description from config
    const configContent = await fs.readFile(configPath, 'utf-8');
    const descMatch = configContent.match(/description:\s*['"`]([^'"`]*)['"`]/);

    return {
      name,
      description: descMatch ? descMatch[1] : '',
      path: projectPath,
    };
  } catch {
    // Project exists only by name (URL param)
    return {
      name,
      description: '',
      path: undefined,
    };
  }
}

/**
 * Get apps for a project from the config file
 * This is a server-side only function - do not use in client components
 */
export async function getProjectApps(projectName: string): Promise<AppData[]> {
  try {
    const projectPath =
      (await resolveProjectPath(projectName)) ??
      (await (async () => {
        const project = await getProject(projectName);
        return project.path ?? null;
      })());

    if (!projectPath) {
      return [];
    }

    const configPath = path.join(projectPath, 'applab.config.ts');
    await fs.access(configPath);

    const configContent = await fs.readFile(configPath, 'utf-8');

    // Parse the config to extract apps
    const appsMatch = configContent.match(/apps:\s*\[([\s\S]*?)\]/);
    if (!appsMatch) {
      return [];
    }

    const appsContent = appsMatch[1];
    const apps: AppData[] = [];

    // Split by objects (look for { ... } patterns)
    const appMatches = appsContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);

    if (appMatches) {
      for (const appMatch of appMatches) {
        try {
          const nameMatch = appMatch.match(/name:\s*['"`]([^'"`]+)['"`]/);
          const typeMatch = appMatch.match(/type:\s*['"`]([^'"`]+)['"`]/);
          const descMatch = appMatch.match(
            /description:\s*['"`]([^'"`]*)['"`]/,
          );
          const pathMatch = appMatch.match(/path:\s*['"`]([^'"`]+)['"`]/);
          const portMatch = appMatch.match(/port:\s*(\d+)/);

          if (nameMatch) {
            apps.push({
              name: nameMatch[1],
              type: typeMatch ? typeMatch[1] : 'web-app',
              description: descMatch ? descMatch[1] : '',
              path: pathMatch ? pathMatch[1] : undefined,
              devPort: portMatch ? parseInt(portMatch[1]) : undefined,
            });
          }
        } catch (parseError) {
          console.warn(
            '[ProjectService] Failed to parse app:',
            appMatch,
            parseError,
          );
        }
      }
    }

    return apps;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: unknown }).code === 'ENOENT'
    ) {
      return [];
    }

    console.error('[ProjectService] Failed to read config:', error);
    return [];
  }
}

/**
 * Get project with apps in a single call
 * This is a server-side only function - do not use in client components
 */
export async function getProjectWithApps(
  projectName: string,
): Promise<ProjectData & { apps: AppData[] }> {
  const [project, apps] = await Promise.all([
    getProject(projectName),
    getProjectApps(projectName),
  ]);

  return { ...project, apps };
}
