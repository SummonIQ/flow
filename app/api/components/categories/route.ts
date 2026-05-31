import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch all categories with component counts
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.component.groupBy({
      by: ['category'],
      where: {
        isPublished: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    const categoryData = categories.map((cat) => ({
      name: cat.category,
      count: cat._count.id,
    }));

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}

