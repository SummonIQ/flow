import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET brand colors for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    console.log('[API] GET branding for project:', name);

    const project = await prisma.project.findFirst({
      where: { name },
      select: {
        brandColors: true,
      },
    });

    console.log('[API] Found project:', project ? 'yes' : 'no');

    if (!project) {
      console.log('[API] Project not found:', name);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('[API] Returning brandColors:', project.brandColors);
    return NextResponse.json({ brandColors: project.brandColors || [] });
  } catch (error) {
    console.error('[API] Error fetching brand colors:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch brand colors',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// POST/PUT brand colors for a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const { brandColors } = await request.json();

    if (!Array.isArray(brandColors)) {
      return NextResponse.json(
        { error: 'brandColors must be an array' },
        { status: 400 },
      );
    }

    // First find the project to get its ID
    const existingProject = await prisma.project.findFirst({
      where: { name },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id: existingProject.id },
      data: {
        brandColors,
      },
    });

    return NextResponse.json({
      success: true,
      brandColors: project.brandColors,
    });
  } catch (error) {
    console.error('Error saving brand colors:', error);
    return NextResponse.json(
      { error: 'Failed to save brand colors' },
      { status: 500 },
    );
  }
}
