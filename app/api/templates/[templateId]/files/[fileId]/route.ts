import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{
    templateId: string;
    fileId: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId, fileId } = await params;
    const body = await request.json();
    const { content } = body;

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content must be a string' },
        { status: 400 },
      );
    }

    const updatedFile = await prisma.templateFile.updateMany({
      where: {
        id: fileId,
        templateId,
      },
      data: {
        content,
      },
    });

    if (updatedFile.count === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating template file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId, fileId } = await params;

    const deletedFile = await prisma.templateFile.deleteMany({
      where: {
        id: fileId,
        templateId,
      },
    });

    if (deletedFile.count === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 },
    );
  }
}
