import { prisma } from '@/lib/db/prisma';
import { getNextAvailablePortForProject } from '@/lib/port-manager';
import fs, { promises as fsPromises, type Dirent } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';

const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

// Check if a project directory exists on the filesystem
function checkFilesystemExists(projectPath: string): boolean {
  try {
    return fs.existsSync(projectPath) && fs.statSync(projectPath).isDirectory();
  } catch {
    return false;
  }
}

// Check if applab.config.ts exists
function checkConfigExists(projectPath: string): boolean {
  try {
    const configPath = path.join(projectPath, 'applab.config.ts');
    return fs.existsSync(configPath);
  } catch {
    return false;
  }
}

const resolvedProjectPathByName = new Map<string, string>();

function extractProjectNameFromConfig(content: string): string | null {
  const appsIndex = content.search(/\bapps\s*:/);
  const header = (
    appsIndex === -1 ? content : content.slice(0, appsIndex)
  ).slice(0, 5000);
  const match = header.match(/\bname\s*:\s*['"`']([^'"`]+)['"`']/);
  return match ? match[1] : null;
}

async function findProjectPathByConfigName(
  projectName: string,
): Promise<string | null> {
  const cachedPath = resolvedProjectPathByName.get(projectName);
  if (cachedPath) {
    return cachedPath;
  }

  let entries: Dirent[];
  try {
    entries = await fsPromises.readdir(PROJECTS_BASE, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const dirPath = path.join(PROJECTS_BASE, entry.name);

    if (!entry.isDirectory()) {
      if (!entry.isSymbolicLink()) {
        continue;
      }

      try {
        const stats = await fsPromises.stat(dirPath);
        if (!stats.isDirectory()) {
          continue;
        }
      } catch {
        continue;
      }
    }

    const configPath = path.join(dirPath, 'applab.config.ts');
    try {
      await fsPromises.access(configPath);
    } catch {
      continue;
    }

    let configContent: string;
    try {
      configContent = await fsPromises.readFile(configPath, 'utf-8');
    } catch {
      continue;
    }

    const parsedName = extractProjectNameFromConfig(configContent);
    if (parsedName && parsedName === projectName) {
      resolvedProjectPathByName.set(projectName, dirPath);
      return dirPath;
    }
  }

  return null;
}

// POST - Add project to database as managed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { path: projectPath, description } = body;

    console.log('[API] Adding project to database:', name, projectPath);

    // Check if already exists
    const existing = await prisma.project.findFirst({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        project: existing,
        message: 'Project already managed',
      });
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        path: projectPath || path.join(PROJECTS_BASE, name),
        description: description || '',
        packageManager: 'bun',
      },
    });

    console.log('[API] Project added successfully:', project.id);

    // Assign a port range to the project
    try {
      await getNextAvailablePortForProject(project.id, 'WEB_APP');
      console.log('[API] Port range assigned for project:', project.id);
    } catch (portError) {
      console.warn('[API] Failed to assign port range:', portError);
    }

    // Fetch updated project with port
    const updatedProject = await prisma.project.findUnique({
      where: { id: project.id },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: 'Project added to database',
    });
  } catch (error: unknown) {
    console.error('[API] Error adding project:', error);

    // Extract error details - Prisma errors don't serialize to JSON properly
    let errorMessage = 'Unknown error';
    let errorCode: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      // Prisma errors have a 'code' property
      if ('code' in error) {
        errorCode = String((error as { code: unknown }).code);
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to add project',
        message: errorMessage,
        code: errorCode,
      },
      { status: 500 },
    );
  }
}

// GET - Check if project is managed
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    console.log('[API] Checking project:', name);

    const project = await prisma.project.findFirst({
      where: { name },
      select: {
        id: true,
        name: true,
        path: true,
        description: true,
        starred: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const requestedPath = request.nextUrl.searchParams.get('path');
    const conventionalPath = path.join(PROJECTS_BASE, name);

    const dbPath = typeof project?.path === 'string' ? project.path : null;
    const dbPathExists = dbPath ? checkFilesystemExists(dbPath) : false;
    const requestedPathExists =
      typeof requestedPath === 'string' && requestedPath.length > 0
        ? checkFilesystemExists(requestedPath)
        : false;
    const conventionalExists = checkFilesystemExists(conventionalPath);

    // Prefer a path that actually exists on disk.
    let projectPath =
      (dbPathExists ? dbPath : null) ??
      (requestedPathExists ? requestedPath : null) ??
      (conventionalExists ? conventionalPath : null) ??
      (await findProjectPathByConfigName(name)) ??
      // Final fallback (may not exist, but keeps behavior predictable)
      conventionalPath;

    console.log('[API] Project path to check:', projectPath);
    console.log(
      '[API] Project from DB:',
      project ? `Found (id: ${project.id})` : 'Not found',
    );

    const filesystemExists = checkFilesystemExists(projectPath);
    console.log('[API] Filesystem exists:', filesystemExists);

    const hasConfig = filesystemExists && checkConfigExists(projectPath);
    console.log('[API] Has config:', hasConfig);

    return NextResponse.json({
      isManaged: !!project,
      project: project || null,
      filesystemExists,
      hasConfig,
      path: projectPath,
    });
  } catch (error) {
    console.error('[API] Error checking project:', error);
    return NextResponse.json(
      { error: 'Failed to check project' },
      { status: 500 },
    );
  }
}
