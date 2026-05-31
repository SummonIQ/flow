import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all memories for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;

    const project = await prisma.project.findUnique({
      where: { name },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const memories = await prisma.projectMemory.findMany({
      where: { projectId: project.id },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('[API] Error fetching memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories' },
      { status: 500 },
    );
  }
}

// POST - Create a new memory
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const body = await request.json();

    const project = await prisma.project.findUnique({
      where: { name },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { title, content, category, source, importance, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 },
      );
    }

    const memory = await prisma.projectMemory.create({
      data: {
        projectId: project.id,
        title,
        content,
        category: category || 'GENERAL',
        source: source || null,
        importance: importance || 5,
        tags: tags || [],
      },
    });

    // Queue embedding for the new memory
    await ragEmbeddingService.onCreated('ProjectMemory', memory.id);

    return NextResponse.json({ memory }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating memory:', error);
    return NextResponse.json(
      { error: 'Failed to create memory' },
      { status: 500 },
    );
  }
}
