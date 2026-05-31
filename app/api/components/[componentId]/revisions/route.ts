import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db/prisma";


// GET - Fetch all revisions for a component
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ componentId: string }> },
) {
  try {
    const { componentId } = await params;

    const revisions = await prisma.componentRevision.findMany({
      where: { componentId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revisions' },
      { status: 500 },
    );
  }
}

