import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db/prisma';

// GET /api/projects/[name]/files/content?path=... - Get file content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: projectName } = await params;
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Get project path from database
    const project = await prisma.project.findUnique({
      where: { name: projectName },
      select: { path: true },
    });

    if (!project?.path) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Construct full file path and ensure it's within project directory
    const fullPath = path.join(project.path, filePath);
    
    // Security check: ensure file is within project directory
    if (!fullPath.startsWith(project.path)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if file exists
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        return NextResponse.json(
          { error: 'Not a file' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file content
    const content = await fs.readFile(fullPath, 'utf-8');

    return NextResponse.json({ 
      content,
      path: filePath,
    });
  } catch (error) {
    console.error('[File Content API] Error:', error);
    
    // Check if it's a binary file or encoding error
    if (error instanceof Error && error.message.includes('invalid')) {
      return NextResponse.json(
        { error: 'Cannot read binary file' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}
