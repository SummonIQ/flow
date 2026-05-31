'use cache';

import { prisma } from '@/lib/db/prisma';
import { cacheTag } from 'next/cache';

export async function getTemplates() {
  'use cache';
  cacheTag('templates');

  return prisma.template.findMany({
    orderBy: { name: 'asc' },
    include: {
      files: true,
    },
  });
}

export async function getTemplateById(id: string) {
  'use cache';
  cacheTag('templates', `template-${id}`);

  return prisma.template.findUnique({
    where: { id },
    include: {
      files: true,
    },
  });
}

export async function getTemplatesByType(type: string) {
  'use cache';
  cacheTag('templates', `templates-${type}`);

  return prisma.template.findMany({
    where: { type },
    orderBy: { name: 'asc' },
  });
}
