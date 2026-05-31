import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get a single memory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; id: string }> },
) {
  try {
    const { id } = await params;

    const memory = await prisma.projectMemory.findUnique({
      where: { id },
    });

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    return NextResponse.json({ memory });
  } catch (error) {
    console.error('[API] Error fetching memory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory' },
      { status: 500 },
    );
  }
}

// PATCH - Update a memory
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const memory = await prisma.projectMemory.update({
      where: { id },
      data: body,
    });

    const changedFields = ragEmbeddingService.detectChangedContentFields(
      'ProjectMemory',
      body as Record<string, unknown>,
    );
    if (changedFields.length > 0) {
      await ragEmbeddingService.onUpdated('ProjectMemory', id, changedFields);
    }

    return NextResponse.json({ memory });
  } catch (error) {
    console.error('[API] Error updating memory:', error);
    return NextResponse.json(
      { error: 'Failed to update memory' },
      { status: 500 },
    );
  }
}

// DELETE - Delete a memory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; id: string }> },
) {
  try {
    const { id } = await params;

    await ragEmbeddingService.onDeleted('ProjectMemory', id);

    await prisma.projectMemory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting memory:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 },
    );
  }
}
