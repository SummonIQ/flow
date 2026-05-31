import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  maxConcurrentTasks: z.number().min(1).max(10).optional(),
  modelProvider: z.string().optional(),
  modelName: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  capabilities: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = createAgentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation failed' },
        { status: 400 },
      );
    }

    // Validate uniqueness
    const existing = await prisma.agent.findFirst({
      where: {
        name: body.name,
        isActive: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An agent with this name already exists' },
        { status: 400 },
      );
    }

    const agent = await prisma.agent.create({
      data: body,
    });
    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 },
    );
  }
}
