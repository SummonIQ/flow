import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/db/prisma';
import { fetchAppleCalendarEvents } from '@/lib/calendar/apple-caldav';

function appleHintFromUpstreamStatus(status?: number) {
  if (status === 401 || status === 403) {
    return 'Apple rejected the credentials. Use an app-specific password and confirm iCloud Calendar is enabled.';
  }
  if (status === 429) {
    return 'Apple rate-limited the request. Please try again in a minute.';
  }
  if (status && status >= 500) {
    return 'Apple calendar service returned an error. Please try again shortly.';
  }
  return 'Unable to fetch events from Apple. Please re-connect and try again.';
}

const connectSchema = z.object({
  icloudEmail: z.string().email(),
  appPassword: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as unknown;
    const parsed = connectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { icloudEmail, appPassword } = parsed.data;

    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await fetchAppleCalendarEvents({
        icloudEmail,
        appPassword,
        start: now,
        end: tomorrow,
      });
    } catch (error) {
      const err = error as Error & { status?: number };
      const upstreamStatus = typeof err.status === 'number' ? err.status : undefined;
      return NextResponse.json(
        {
          error: appleHintFromUpstreamStatus(upstreamStatus),
          upstreamStatus,
        },
        { status: 400 },
      );
    }

    await prisma.calendarConnection.upsert({
      where: {
        provider_calendarId: {
          provider: 'apple',
          calendarId: 'primary',
        },
      },
      create: {
        provider: 'apple',
        providerAccountId: icloudEmail,
        accessToken: appPassword,
        refreshToken: null,
        expiresAt: null,
        calendarId: 'primary',
        calendarName: 'Apple Calendar',
        isPrimary: true,
      },
      update: {
        providerAccountId: icloudEmail,
        accessToken: appPassword,
        refreshToken: null,
        expiresAt: null,
        calendarName: 'Apple Calendar',
        isPrimary: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error connecting Apple Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to connect Apple Calendar' },
      { status: 500 },
    );
  }
}
