import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';

// Convert DB AppType to UI format
function convertAppType(dbType: string): string {
  const map: Record<string, string> = {
    'WEB_APP': 'web-app',
    'DESKTOP_APP': 'desktop',
    'MOBILE_APP': 'mobile-app',
    'API': 'api',
    'MARKETING_SITE': 'marketing-site',
    'LIBRARY': 'library',
    'MONOREPO': 'monorepo',
    'CLI': 'cli',
    'EXTENSION': 'extension',
    'CUSTOM': 'custom',
  };
  return map[dbType] || dbType;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const practice = await prisma.bestPractice.findUnique({
      where: { id },
    });

    if (!practice) {
      return NextResponse.json(
        { error: 'Best practice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...practice,
      appType: convertAppType(practice.appType),
    });
  } catch (error) {
    console.error('Failed to fetch best practice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch best practice' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.priority !== undefined && { priority: body.priority }),
    };

    const practice = await prisma.bestPractice.update({
      where: { id },
      data: updateData,
    });

    // Mark embedding as stale if content fields changed
    const changedFields = ragEmbeddingService.detectChangedContentFields(
      'BestPractice',
      updateData
    );
    if (changedFields.length > 0) {
      await ragEmbeddingService.onUpdated('BestPractice', id, changedFields);
    }

    return NextResponse.json({
      ...practice,
      appType: convertAppType(practice.appType),
    });
  } catch (error) {
    console.error('Failed to update best practice:', error);
    return NextResponse.json(
      { error: 'Failed to update best practice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete embeddings first
    await ragEmbeddingService.onDeleted('BestPractice', id);

    await prisma.bestPractice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete best practice:', error);
    return NextResponse.json(
      { error: 'Failed to delete best practice' },
      { status: 500 }
    );
  }
}
