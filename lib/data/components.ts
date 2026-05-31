'use cache';

import { prisma } from '@/lib/db/prisma';
import { cacheTag } from 'next/cache';

export async function getComponentCategories() {
  'use cache';
  cacheTag('components', 'component-categories');

  const components = await prisma.component.groupBy({
    by: ['category'],
    where: {
      isPublished: true,
      category: { notIn: ['backgrounds', 'hero-backgrounds'] },
    },
    _count: { id: true },
  });

  return components.map(c => ({
    name: c.category,
    count: c._count.id,
  }));
}

export async function getComponentsByCategory(category: string) {
  if (category === 'backgrounds' || category === 'hero-backgrounds') {
    return [];
  }

  'use cache';
  cacheTag('components', `components-${category}`);

  return prisma.component.findMany({
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
}

export async function getComponentBySlug(category: string, slug: string) {
  'use cache';
  cacheTag('components', `component-${category}-${slug}`);

  return prisma.component.findFirst({
    where: {
      category,
      slug,
      isPublished: true,
    },
  });
}
