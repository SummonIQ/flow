import * as fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import * as path from 'path';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';

const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

const deleteProjectSchema = z.object({
  deleteFiles: z.boolean().optional(),
  path: z.string().optional(),
});

const getErrorCode = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  if (!('code' in error)) {
    return undefined;
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
};

// PUT - Update project configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const body = await request.json();

    const projectPath = path.join(PROJECTS_BASE, name);
    const configPath = path.join(projectPath, 'applab.config.ts');

    // Update in database if managed
    const existingProject = await prisma.project.findFirst({
      where: { name },
    });

    if (existingProject) {
      await prisma.project.update({
        where: { id: existingProject.id },
        data: {
          name: body.name || name,
          description: body.description || existingProject.description,
        },
      });
    }

    // Check if config file exists
    try {
      await fs.access(configPath);
    } catch {
      return NextResponse.json(
        { error: 'Project configuration not found' },
        { status: 404 },
      );
    }

    // Read current config
    let configContent = await fs.readFile(configPath, 'utf-8');

    // Update project name and description in config
    if (body.name && body.name !== name) {
      configContent = configContent.replace(
        /name:\s*['"].*?['"]/,
        `name: '${body.name}'`,
      );

      // Rename project directory if name changed
      const newProjectPath = path.join(PROJECTS_BASE, body.name);
      await fs.rename(projectPath, newProjectPath);
    }

    if (body.description !== undefined) {
      configContent = configContent.replace(
        /description:\s*['"].*?['"]/,
        `description: '${body.description}'`,
      );
    }

    // Write the updated config
    await fs.writeFile(
      body.name
        ? path.join(PROJECTS_BASE, body.name, 'applab.config.ts')
        : configPath,
      configContent,
      'utf-8',
    );

    console.log(`[API] Updated project ${name}`);

    return NextResponse.json({
      success: true,
      project: {
        name: body.name || name,
        description: body.description,
      },
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('[API] Error updating project:', error);
    return NextResponse.json(
      {
        error: 'Failed to update project',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete project configuration (optionally remove project directory)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;

    const body = deleteProjectSchema.parse(
      await request.json().catch(() => ({})),
    );

    const resolvedRequestPath =
      body.path && path.isAbsolute(body.path) ? body.path : undefined;

    // Remove from database if managed
    const existingProject = await prisma.project.findFirst({
      where: { name },
    });

    const projectPath =
      existingProject?.path ??
      resolvedRequestPath ??
      path.join(PROJECTS_BASE, name);
    const configPath = path.join(projectPath, 'applab.config.ts');

    if (existingProject) {
      await prisma.project.delete({
        where: { id: existingProject.id },
      });
    }

    if (body.deleteFiles) {
      const resolvedPath = path.resolve(projectPath);
      const resolvedBase = path.resolve(PROJECTS_BASE);
      const rootPath = path.parse(resolvedPath).root;

      if (resolvedPath === resolvedBase || resolvedPath === rootPath) {
        return NextResponse.json(
          { error: 'Refusing to delete the base projects directory' },
          { status: 400 },
        );
      }

      await fs.rm(resolvedPath, { recursive: true, force: true });
      console.log(`[API] Deleted project files for ${name}`);

      return NextResponse.json({
        success: true,
        message: 'Project deleted from SummonIQ and filesystem',
      });
    }

    // Delete config file (if present)
    try {
      await fs.unlink(configPath);
      console.log(`[API] Deleted project config for ${name}`);
    } catch (error) {
      if (getErrorCode(error) !== 'ENOENT') {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted from SummonIQ',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid delete project request' },
        { status: 400 },
      );
    }
    console.error('[API] Error deleting project:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete project',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
