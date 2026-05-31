import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/db/prisma';
import { fetchIcsEvents } from '@/lib/calendar/ics-import';

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

    const start = new Date(parsed.data.start);
    const end = new Date(parsed.data.end);

    const connections = await prisma.calendarConnection.findMany({
      where: { provider: 'ics' },
      select: { calendarId: true, calendarName: true, accessToken: true },
    });

    if (connections.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const results = await Promise.allSettled(
      connections.map(async connection => {
        const events = await fetchIcsEvents({
          source: connection.accessToken,
          start,
          end,
        });
        return events.map(event => ({
          ...event,
          calendarId: connection.calendarId,
          calendarName: connection.calendarName,
        }));
      }),
    );

    const all: Array<{
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      isAllDay: boolean;
      calendarId: string;
      calendarName: string;
    }> = [];

    for (const result of results) {
      if (result.status === 'fulfilled') all.push(...result.value);
    }

    const dedup = new Map<string, (typeof all)[number]>();
    for (const event of all) {
      const key = `${event.calendarId}:${event.id}:${event.startTime}`;
      if (!dedup.has(key)) dedup.set(key, event);
    }

    const events = Array.from(dedup.values()).sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch ICS events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ICS events' },
      { status: 500 },
    );
  }
}
