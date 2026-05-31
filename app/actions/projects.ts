'use server';

import prisma from '@/lib/db/prisma';
import type { Priority, ProjectStatus } from '@prisma/client';

export async function getProjects(limit = 10) {
  try {
    const projects = await prisma.project.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        client: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
    });
    return { success: true, data: projects };
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return { success: false, error: 'Failed to fetch projects' };
  }
}

export async function getProjectStats() {
  try {
    const [total, byStatus, atRisk] = await Promise.all([
      prisma.project.count(),
      prisma.project.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.project.count({
        where: {
          dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])),
        atRisk,
      },
    };
  } catch (error) {
    console.error('Failed to fetch project stats:', error);
    return { success: false, error: 'Failed to fetch project stats' };
  }
}

export async function createProject(data: {
  clientId: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  owner?: string;
  budget?: number;
  startDate?: Date;
  dueDate?: Date;
}) {
  try {
    const project = await prisma.project.create({ data });
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { success: false, error: 'Failed to create project' };
  }
}

export async function updateProject(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    status: ProjectStatus;
    priority: Priority;
    owner: string;
    budget: number;
    startDate: Date;
    dueDate: Date;
    completedAt: Date;
  }>,
) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data,
    });
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to update project:', error);
    return { success: false, error: 'Failed to update project' };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { success: false, error: 'Failed to delete project' };
  }
}
