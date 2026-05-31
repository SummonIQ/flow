import { prisma } from '@/lib/db/prisma';
import {
  isBinaryFile,
  isProtectedPath,
  validateFileName,
  validatePath,
} from '@/lib/file-operations';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

interface RouteParams {
  params: Promise<{ name: string }>;
}

async function getProjectPath(projectName: string): Promise<string | null> {
  const project = await prisma.project.findUnique({
    where: { name: projectName },
    select: { path: true },
  });
  return project?.path || null;
}

// POST - Create file or folder
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { name: projectName } = await params;
    const body = await request.json();
    const { path: relativePath, type, content } = body;

    if (!relativePath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    if (!type || !['file', 'directory'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "file" or "directory"' },
        { status: 400 },
      );
    }

    const projectPath = await getProjectPath(projectName);
    if (!projectPath) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Validate the path
    const validation = validatePath(projectPath, relativePath);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    // Validate the file/folder name
    const name = path.basename(relativePath);
    const nameValidation = validateFileName(name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 },
      );
    }

    const fullPath = validation.resolvedPath!;

    // Check if already exists
    try {
      await fs.access(fullPath);
      return NextResponse.json(
        { error: `${type === 'file' ? 'File' : 'Folder'} already exists` },
        { status: 409 },
      );
    } catch {
      // Good - doesn't exist
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(fullPath);
    await fs.mkdir(parentDir, { recursive: true });

    if (type === 'directory') {
      await fs.mkdir(fullPath);
    } else {
      await fs.writeFile(fullPath, content || '', 'utf-8');
    }

    return NextResponse.json({
      success: true,
      path: relativePath,
      type,
    });
  } catch (error) {
    console.error('[File Operations API] Create error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// PUT - Rename file/folder or update file content
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { name: projectName } = await params;
    const body = await request.json();
    const { path: relativePath, newPath, content } = body;

    if (!relativePath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const projectPath = await getProjectPath(projectName);
    if (!projectPath) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Validate source path
    const sourceValidation = validatePath(projectPath, relativePath);
    if (!sourceValidation.valid) {
      return NextResponse.json(
        { error: sourceValidation.error },
        { status: 403 },
      );
    }

    const fullPath = sourceValidation.resolvedPath!;

    // Check if source exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { error: 'File or folder not found' },
        { status: 404 },
      );
    }

    // If newPath is provided, this is a rename operation
    if (newPath) {
      // Validate destination path
      const destValidation = validatePath(projectPath, newPath);
      if (!destValidation.valid) {
        return NextResponse.json(
          { error: destValidation.error },
          { status: 403 },
        );
      }

      // Validate new name
      const newName = path.basename(newPath);
      const nameValidation = validateFileName(newName);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 },
        );
      }

      const newFullPath = destValidation.resolvedPath!;

      // Check if destination already exists
      try {
        await fs.access(newFullPath);
        return NextResponse.json(
          { error: 'Destination already exists' },
          { status: 409 },
        );
      } catch {
        // Good - doesn't exist
      }

      // Ensure parent directory exists
      const parentDir = path.dirname(newFullPath);
      await fs.mkdir(parentDir, { recursive: true });

      // Rename
      await fs.rename(fullPath, newFullPath);

      return NextResponse.json({
        success: true,
        path: newPath,
        previousPath: relativePath,
      });
    }

    // Otherwise, update content
    if (content === undefined) {
      return NextResponse.json(
        { error: 'Either newPath or content is required' },
        { status: 400 },
      );
    }

    // Check if it's a binary file
    if (isBinaryFile(relativePath)) {
      return NextResponse.json(
        { error: 'Cannot edit binary files' },
        { status: 400 },
      );
    }

    // Check if it's a file (not directory)
    const stats = await fs.stat(fullPath);
    if (!stats.isFile()) {
      return NextResponse.json(
        { error: 'Cannot write content to a directory' },
        { status: 400 },
      );
    }

    await fs.writeFile(fullPath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      path: relativePath,
    });
  } catch (error) {
    console.error('[File Operations API] Update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE - Delete file or folder
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { name: projectName } = await params;
    const searchParams = request.nextUrl.searchParams;
    const relativePath = searchParams.get('path');

    if (!relativePath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const projectPath = await getProjectPath(projectName);
    if (!projectPath) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Validate the path
    const validation = validatePath(projectPath, relativePath);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    // Extra check for protected paths on delete
    if (isProtectedPath(relativePath)) {
      return NextResponse.json(
        { error: 'Cannot delete protected files or folders' },
        { status: 403 },
      );
    }

    const fullPath = validation.resolvedPath!;

    // Check if exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { error: 'File or folder not found' },
        { status: 404 },
      );
    }

    // Get stats to determine if file or directory
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      // Delete directory recursively
      await fs.rm(fullPath, { recursive: true });
    } else {
      await fs.unlink(fullPath);
    }

    return NextResponse.json({
      success: true,
      path: relativePath,
      deleted: true,
    });
  } catch (error) {
    console.error('[File Operations API] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
