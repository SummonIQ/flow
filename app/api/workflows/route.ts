import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      include: {
        _count: {
          select: {
            teams: true,
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate uniqueness
    const existing = await prisma.workflow.findFirst({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A workflow with this name already exists' },
        { status: 400 },
      );
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: body.name,
        description: body.description,
        stages: body.stages || [],
        transitions: body.transitions || [],
        specializations: body.specializations || [],
        isDefault: body.isDefault || false,
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 },
    );
  }
}
