import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      where: { isActive: true },
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
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { members, ...teamData } = body;

    // Validate uniqueness
    const existing = await prisma.team.findFirst({
      where: {
        name: teamData.name,
        isActive: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 400 },
      );
    }

    const team = await prisma.team.create({
      data: {
        ...teamData,
        members: {
          create: members?.map((member: any, index: number) => ({
            agentId: member.agentId,
            workflowRole: member.workflowRole,
            order: index,
            canAssign: member.canAssign || false,
            canReview: member.canReview !== false,
          })),
        },
      },
      include: {
        members: {
          include: {
            agent: true,
          },
        },
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 },
    );
  }
}
