import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{
    type: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { type } = await params;

    // Find default template for this type
    const template = await prisma.template.findFirst({
      where: {
        type,
        isDefault: true,
      },
      include: {
        files: {
          orderBy: {
            path: 'asc',
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: `No template found for type: ${type}` },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}
