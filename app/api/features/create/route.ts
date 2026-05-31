import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createSchema = z.object({
  feature: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).default([]),
  docsUrl: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);

    const existing = await prisma.featureDefinition.findFirst({
      where: { feature: validated.feature as any },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Feature with this key already exists' },
        { status: 409 },
      );
    }

    const feature = await prisma.featureDefinition.create({
      data: {
        feature: validated.feature as any,
        name: validated.name,
        description: validated.description || null,
        icon: validated.icon || 'sparkles',
        color: validated.color || 'indigo',
        tags: validated.tags,
        providers: {},
        changes: [],
        settings: {},
        dependencies: [],
        docsUrl: validated.docsUrl || null,
      },
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating feature:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to create feature' },
      { status: 500 },
    );
  }
}
