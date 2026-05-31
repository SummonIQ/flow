import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const template = await prisma.configTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Config template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching config template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData = {
      name: data.name,
      description: data.description,
      content: data.content,
      rawContent: data.rawContent,
      isActive: data.isActive,
    };

    const template = await prisma.configTemplate.update({
      where: { id },
      data: updateData,
    });

    // Mark embedding as stale if content fields changed
    const changedFields = ragEmbeddingService.detectChangedContentFields(
      'ConfigTemplate',
      updateData
    );
    if (changedFields.length > 0) {
      await ragEmbeddingService.onUpdated('ConfigTemplate', id, changedFields);
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating config template:', error);
    return NextResponse.json(
      { error: 'Failed to update config template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete embeddings (even for soft delete, we remove from search)
    await ragEmbeddingService.onDeleted('ConfigTemplate', id);

    // Soft delete by setting isActive to false
    await prisma.configTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting config template:', error);
    return NextResponse.json(
      { error: 'Failed to delete config template' },
      { status: 500 }
    );
  }
}
