import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Accept or reject a revision
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ componentId: string; revisionId: string }> },
) {
  try {
    const { componentId, revisionId } = await params;
    const { status, isCurrent } = await request.json();

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // If accepting and setting as current, unset other current revisions
    if (status === 'ACCEPTED' && isCurrent) {
      await prisma.componentRevision.updateMany({
        where: {
          componentId,
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      });

      // Update the component's code if this is the current revision
      const revision = await prisma.componentRevision.findUnique({
        where: { id: revisionId },
      });

      if (revision) {
        await prisma.component.update({
          where: { id: componentId },
          data: { code: revision.code },
        });

        await ragEmbeddingService.onUpdated('Component', componentId, ['code']);
      }
    }

    const updatedRevision = await prisma.componentRevision.update({
      where: { id: revisionId },
      data: {
        status,
        isCurrent: status === 'ACCEPTED' ? isCurrent : false,
      },
    });

    return NextResponse.json(updatedRevision);
  } catch (error) {
    console.error('Error updating revision:', error);
    return NextResponse.json(
      { error: 'Failed to update revision' },
      { status: 500 },
    );
  }
}

// DELETE - Delete a revision
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ componentId: string; revisionId: string }> },
) {
  try {
    const { revisionId } = await params;

    await prisma.componentRevision.delete({
      where: { id: revisionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting revision:', error);
    return NextResponse.json(
      { error: 'Failed to delete revision' },
      { status: 500 },
    );
  }
}
