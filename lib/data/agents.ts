'use cache';

import { prisma } from '@/lib/db/prisma';
import { cacheTag } from 'next/cache';

export async function getAgents() {
  'use cache';
  cacheTag('agents');

  return prisma.agent.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { assignedTickets: true },
      },
    },
  });
}

export async function getAgentById(id: string) {
  'use cache';
  cacheTag('agents', `agent-${id}`);

  return prisma.agent.findUnique({
    where: { id },
    include: {
      assignedTickets: {
        orderBy: { updatedAt: 'desc' },
        take: 10,
      },
      teamMembers: {
        include: { team: true },
      },
    },
  });
}

export async function getTeams() {
  'use cache';
  cacheTag('teams');

  return prisma.team.findMany({
    orderBy: { name: 'asc' },
    include: {
      members: {
        include: { agent: true },
      },
      _count: {
        select: { members: true },
      },
    },
  });
}
