import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

// GET - Fetch all components grouped by category for navigation
export async function GET() {
  try {
    const components = await prisma.component.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: {
        slug: true,
        name: true,
        category: true,
      },
    });

    // Group components by category
    const grouped: Record<string, { slug: string; name: string }[]> = {};
    for (const component of components) {
      if (!grouped[component.category]) {
        grouped[component.category] = [];
      }
      grouped[component.category].push({
        slug: component.slug,
        name: component.name,
      });
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Error fetching navigation components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation' },
      { status: 500 },
    );
  }
}
