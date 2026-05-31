import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
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
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate uniqueness if name is being updated
    if (body.name) {
      const existing = await prisma.team.findFirst({
        where: {
          name: body.name,
          isActive: true,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'A team with this name already exists' },
          { status: 400 },
        );
      }
    }

    const team = await prisma.team.update({
      where: { id },
      data: body,
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
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.team.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 },
    );
  }
}
