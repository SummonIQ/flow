import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db/prisma';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const IGNORED_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.turbo',
  '.cache',
  'coverage',
  '.DS_Store',
  '.env',
  '.env.local',
];

async function buildFileTree(dirPath: string, relativePath = ''): Promise<FileNode[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      // Skip ignored patterns
      if (IGNORED_PATTERNS.some(pattern => entry.name.includes(pattern))) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        const children = await buildFileTree(fullPath, relPath);
        nodes.push({
          name: entry.name,
          path: relPath,
          type: 'directory',
          children,
        });
      } else {
        nodes.push({
          name: entry.name,
          path: relPath,
          type: 'file',
        });
      }
    }

    // Sort: directories first, then files, both alphabetically
    return nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error('Error building file tree:', error);
    return [];
  }
}

// GET /api/projects/[name]/files - Get file tree
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: projectName } = await params;

    // Get project path from database
    const project = await prisma.project.findUnique({
      where: { name: projectName },
      select: { path: true },
    });

    if (!project?.path) {
      return NextResponse.json(
        { error: 'Project path not found' },
        { status: 404 }
      );
    }

    // Check if path exists
    try {
      await fs.access(project.path);
    } catch {
      return NextResponse.json(
        { error: 'Project path does not exist' },
        { status: 404 }
      );
    }

    // Build file tree
    const files = await buildFileTree(project.path);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('[Files API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load file tree' },
      { status: 500 }
    );
  }
}
