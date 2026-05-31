import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;

    const project = await prisma.project.findUnique({
      where: { name: projectName },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 },
      );
    }

    const team = await prisma.team.findFirst({
      where: {
        projectId: project.id,
        isActive: true,
      },
      include: {
        members: {
          include: {
            agent: true,
          },
          orderBy: { order: 'asc' },
        },
        workflow: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('[API] Error fetching project team:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
