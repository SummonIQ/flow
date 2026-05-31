import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            teams: true,
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
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
      const existing = await prisma.workflow.findFirst({
        where: {
          name: body.name,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'A workflow with this name already exists' },
          { status: 400 },
        );
      }
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        stages: body.stages,
        transitions: body.transitions,
        specializations: body.specializations,
        isDefault: body.isDefault,
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
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

    // Check if workflow is being used by teams
    const teamsCount = await prisma.team.count({
      where: { workflowId: id },
    });

    if (teamsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete workflow. It is being used by ${teamsCount} team(s).`,
        },
        { status: 400 },
      );
    }

    await prisma.workflow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 },
    );
  }
}
