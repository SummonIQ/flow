import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

// POST - Add a new file to the template
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;
    const body = await request.json();
    const { path, content = '', isDirectory = false } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Path is required and must be a string' },
        { status: 400 },
      );
    }

    // Check if template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 },
      );
    }

    // Check if file already exists
    const existingFile = await prisma.templateFile.findFirst({
      where: {
        templateId,
        path,
      },
    });

    if (existingFile) {
      return NextResponse.json(
        { error: 'A file with this path already exists' },
        { status: 409 },
      );
    }

    // Create the file
    const newFile = await prisma.templateFile.create({
      data: {
        templateId,
        path,
        content: isDirectory ? '' : content,
        isDirectory,
      },
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error('Error creating template file:', error);
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 },
    );
  }
}
