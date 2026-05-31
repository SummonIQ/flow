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

const querySchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse({
      start: req.nextUrl.searchParams.get('start'),
      end: req.nextUrl.searchParams.get('end'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const connection = await prisma.calendarConnection.findFirst({
      where: { provider: 'apple' },
      select: { providerAccountId: true, accessToken: true },
    });

    if (!connection) {
      return NextResponse.json({ events: [] });
    }

    const start = new Date(parsed.data.start);
    const end = new Date(parsed.data.end);

    const events = await fetchAppleCalendarEvents({
      icloudEmail: connection.providerAccountId,
      appPassword: connection.accessToken,
      start,
      end,
    });

    return NextResponse.json({ events });
  } catch (error) {
    const err = error as Error & { status?: number };
    const upstreamStatus = typeof err.status === 'number' ? err.status : undefined;
    console.error('Error fetching Apple Calendar events:', {
      message: err.message,
      upstreamStatus,
    });

    return NextResponse.json(
      {
        error: appleHintFromUpstreamStatus(upstreamStatus),
        upstreamStatus,
      },
      { status: 500 },
    );
  }
}
