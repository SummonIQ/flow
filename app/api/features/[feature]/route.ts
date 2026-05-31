import { prisma } from '@/lib/db/prisma';
import { Feature } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
  docsUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ feature: string }>;
}

// GET - Fetch a single feature definition by feature enum
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { feature } = await params;
    const featureEnum = feature.toUpperCase() as Feature;

    // Validate feature enum
    if (!Object.values(Feature).includes(featureEnum)) {
      return NextResponse.json(
        { error: 'Invalid feature type' },
        { status: 400 },
      );
    }

    const featureDefinition = await prisma.featureDefinition.findUnique({
      where: { feature: featureEnum },
    });

    if (!featureDefinition) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    return NextResponse.json(featureDefinition);
  } catch (error) {
    console.error('[API] Error fetching feature:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature' },
      { status: 500 },
    );
  }
}

// PUT - Update a feature definition (changes, settings, etc.)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { feature } = await params;
    const featureEnum = feature.toUpperCase() as Feature;
    const body = await request.json();

    // Validate feature enum
    if (!Object.values(Feature).includes(featureEnum)) {
      return NextResponse.json(
        { error: 'Invalid feature type' },
        { status: 400 },
      );
    }

    const existing = await prisma.featureDefinition.findUnique({
      where: { feature: featureEnum },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    // Only allow updating specific fields
    const allowedFields = [
      'name',
      'description',
      'icon',
      'color',
      'tags',
      'providers',
      'changes',
      'settings',
      'dependencies',
      'docsUrl',
      'isActive',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await prisma.featureDefinition.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API] Error updating feature:', error);
    return NextResponse.json(
      {
        error: 'Failed to update feature',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// PATCH - Update a feature definition with validation
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { feature } = await params;
    const featureEnum = feature.toUpperCase() as Feature;
    const body = await request.json();

    // Validate feature enum
    if (!Object.values(Feature).includes(featureEnum)) {
      return NextResponse.json(
        { error: 'Invalid feature type' },
        { status: 400 },
      );
    }

    const validated = updateSchema.parse(body);

    const existing = await prisma.featureDefinition.findUnique({
      where: { feature: featureEnum },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    const updated = await prisma.featureDefinition.update({
      where: { id: existing.id },
      data: validated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API] Error updating feature:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to update feature' },
      { status: 500 },
    );
  }
}

// DELETE - Delete a feature definition
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { feature } = await params;
    const featureEnum = feature.toUpperCase() as Feature;

    // Validate feature enum
    if (!Object.values(Feature).includes(featureEnum)) {
      return NextResponse.json(
        { error: 'Invalid feature type' },
        { status: 400 },
      );
    }

    const existing = await prisma.featureDefinition.findUnique({
      where: { feature: featureEnum },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    await prisma.featureDefinition.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting feature:', error);
    return NextResponse.json(
      { error: 'Failed to delete feature' },
      { status: 500 },
    );
  }
}
