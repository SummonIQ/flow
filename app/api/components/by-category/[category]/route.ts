import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all components in a category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  try {
    const { category } = await params;

    const components = await prisma.component.findMany({
      where: {
        category,
        isPublished: true,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        category: true,
        type: true,
        tags: true,
      },
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error('Error fetching category components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 },
    );
  }
}
