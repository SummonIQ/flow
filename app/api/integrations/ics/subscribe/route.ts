import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/db/prisma';

const bodySchema = z.object({
  url: z.string().url(),
  name: z.string().min(1).max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = (await req.json().catch(() => null)) as unknown;
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const calendarId = crypto.randomUUID();
    const calendarName = parsed.data.name || 'ICS Feed';

    await prisma.calendarConnection.create({
      data: {
        provider: 'ics',
        providerAccountId: parsed.data.url,
        accessToken: parsed.data.url,
        refreshToken: null,
        expiresAt: null,
        calendarId,
        calendarName,
        isPrimary: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to subscribe to ICS feed:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to ICS feed' },
      { status: 500 },
    );
  }
}
