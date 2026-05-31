import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// PATCH - Toggle star status for a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { starred } = body;

    console.log(
      '[API] Updating star status for project:',
      name,
      'to:',
      starred,
    );

    // Upsert the project - create if doesn't exist, update if it does
    const updatedProject = await prisma.project.upsert({
      where: { name },
      update: { starred },
      create: {
        name,
        path: `/Users/steven/Projects/${name}`,
        description: '',
        packageManager: 'bun',
        starred,
      },
    });

    console.log('[API] Project star status updated successfully');

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: starred ? 'Project starred' : 'Project unstarred',
    });
  } catch (error) {
    console.error('[API] Error updating project star status:', error);
    return NextResponse.json(
      {
        error: 'Failed to update star status',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
