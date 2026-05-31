import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET - Get rate limit config for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    const project = await prisma.project.findUnique({
      where: { name },
      select: { rateLimitConfig: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      config: project.rateLimitConfig || {
        enabled: false,
        storage: 'memory',
        presets: {},
      },
    });
  } catch (error) {
    console.error('Error fetching rate limit config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit config' },
      { status: 500 }
    );
  }
}

// PUT - Update rate limit config for a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Config is required' },
        { status: 400 }
      );
    }

    // Validate config structure
    if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    if (config.storage && !['kv', 'database', 'memory'].includes(config.storage)) {
      return NextResponse.json(
        { error: 'storage must be one of: kv, database, memory' },
        { status: 400 }
      );
    }

    // Update project
    const project = await prisma.project.update({
      where: { name },
      data: {
        rateLimitConfig: config,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Rate limit config updated successfully',
      config: project.rateLimitConfig,
    });
  } catch (error: any) {
    console.error('Error updating rate limit config:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update rate limit config' },
      { status: 500 }
    );
  }
}
