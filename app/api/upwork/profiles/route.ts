import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';

const profileSchema = z.object({
  teamId: z.string().min(1),
  displayName: z.string().optional(),
  skillsText: z.string().min(1),
  skills: z.array(z.string()).min(1),
  industries: z.array(z.string()).optional().default([]),
  stack: z.string().optional(),
  offer: z.string().optional(),
  proof: z.string().optional(),
  hourlyRate: z.string().optional(),
  minFixedBudget: z.string().optional(),
  maxFixedBudget: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId') || '';
  if (!teamId) {
    return NextResponse.json({ error: 'teamId required' }, { status: 400 });
  }

  try {
    const profile = await prisma.upworkSkillProfile.findUnique({
      where: { teamId },
    });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[upwork/profiles] GET error', error);
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const profile = await prisma.upworkSkillProfile.upsert({
      where: { teamId: parsed.data.teamId },
      create: parsed.data,
      update: parsed.data,
    });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[upwork/profiles] POST error', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 },
    );
  }
}
