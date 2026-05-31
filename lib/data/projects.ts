'use cache';

import { prisma } from '@/lib/db/prisma';
import { cacheTag } from 'next/cache';

export async function getProjects() {
  'use cache';
  cacheTag('projects');

  return prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });
}

export async function getProjectByName(name: string) {
  'use cache';
  cacheTag('projects', `project-${name}`);

  return prisma.project.findUnique({
    where: { name },
    include: {
      tickets: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: { tickets: true },
      },
    },
  });
}

export async function getProjectStats() {
  'use cache';
  cacheTag('projects', 'project-stats');

  const [totalProjects, totalTickets, recentActivity] = await Promise.all([
    prisma.project.count(),
    prisma.ticket.count(),
    prisma.ticket.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        project: { select: { name: true } },
      },
    }),
  ]);

  return { totalProjects, totalTickets, recentActivity };
}
