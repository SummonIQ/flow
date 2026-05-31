import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { fetchAppleCalendarEvents } from '@/lib/calendar/apple-caldav';
import { fetchIcsEvents } from '@/lib/calendar/ics-import';
import prisma from '@/lib/db/prisma';
import {
  fetchOutlookCalendarEvents,
  refreshAccessToken,
} from '@/lib/oauth/microsoft';

const querySchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  source: 'meeting' | 'apple' | 'ics' | 'microsoft';
  calendarName?: string;
  location?: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse({
      start: req.nextUrl.searchParams.get('start'),
      end: req.nextUrl.searchParams.get('end'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const start = new Date(parsed.data.start);
    const end = new Date(parsed.data.end);

    let meetings: Array<{
      id: string;
      title: string;
      startTime: Date;
      endTime: Date;
      location: string | null;
      client: { name: string } | null;
    }> = [];

    try {
      meetings = await prisma.meeting.findMany({
        where: {
          startTime: { lte: end },
          endTime: { gte: start },
        },
        orderBy: { startTime: 'asc' },
        include: { client: { select: { name: true } } },
      });
    } catch (error) {
      // If the DB isn't initialized yet (or the table doesn't exist), don't break the calendar UI.
      console.error('Failed to fetch meetings for calendar:', error);
    }

    const meetingEvents: CalendarEvent[] = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.client?.name
        ? `${meeting.title} · ${meeting.client.name}`
        : meeting.title,
      startTime: meeting.startTime.toISOString(),
      endTime: meeting.endTime.toISOString(),
      isAllDay: false,
      source: 'meeting',
      location: meeting.location,
    }));

    const events: CalendarEvent[] = [...meetingEvents];

    let appleConnection: {
      providerAccountId: string;
      accessToken: string;
    } | null = null;
    try {
      appleConnection = await prisma.calendarConnection.findFirst({
        where: { provider: 'apple' },
        select: { providerAccountId: true, accessToken: true },
      });
    } catch (error) {
      // DB schema may not include calendar tables yet; treat as "no connection".
      console.error('Failed to load Apple calendar connection:', error);
    }

    if (appleConnection) {
      try {
        const appleEvents = await fetchAppleCalendarEvents({
          icloudEmail: appleConnection.providerAccountId,
          appPassword: appleConnection.accessToken,
          start,
          end,
        });
        events.push(
          ...appleEvents.map(event => ({
            id: `apple:${event.id}`,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            isAllDay: event.isAllDay,
            source: 'apple' as const,
            calendarName: 'Apple Calendar',
          })),
        );
      } catch (error) {
        console.error('Failed to fetch Apple calendar events:', error);
      }
    }

    let icsConnections: Array<{
      calendarId: string;
      calendarName: string;
      accessToken: string;
    }> = [];
    try {
      icsConnections = await prisma.calendarConnection.findMany({
        where: { provider: 'ics' },
        select: { calendarId: true, calendarName: true, accessToken: true },
      });
    } catch (error) {
      // DB schema may not include calendar tables yet; treat as "no connections".
      console.error('Failed to load ICS calendar connections:', error);
    }

    if (icsConnections.length > 0) {
      const results = await Promise.allSettled(
        icsConnections.map(async connection => {
          const icsEvents = await fetchIcsEvents({
            source: connection.accessToken,
            start,
            end,
          });
          return icsEvents.map(event => ({
            id: `ics:${connection.calendarId}:${event.id}`,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            isAllDay: event.isAllDay,
            source: 'ics' as const,
            calendarName: connection.calendarName,
          }));
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          events.push(...result.value);
        }
      }
    }

    // Fetch Microsoft/Outlook calendar events
    let microsoftConnection: {
      accessToken: string;
      refreshToken: string | null;
      expiresAt: Date | null;
      calendarName: string;
    } | null = null;
    try {
      microsoftConnection = await prisma.calendarConnection.findFirst({
        where: { provider: 'microsoft' },
        select: {
          accessToken: true,
          refreshToken: true,
          expiresAt: true,
          calendarName: true,
        },
      });
    } catch (error) {
      console.error('Failed to load Microsoft calendar connection:', error);
    }

    if (microsoftConnection) {
      try {
        let accessToken = microsoftConnection.accessToken;

        // Refresh token if expired
        if (
          microsoftConnection.expiresAt &&
          microsoftConnection.refreshToken &&
          new Date() >= microsoftConnection.expiresAt
        ) {
          const newTokens = await refreshAccessToken(
            microsoftConnection.refreshToken,
          );
          accessToken = newTokens.accessToken;

          // Update stored tokens
          await prisma.calendarConnection.updateMany({
            where: { provider: 'microsoft' },
            data: {
              accessToken: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
              expiresAt: newTokens.expiresAt,
            },
          });
        }

        const outlookEvents = await fetchOutlookCalendarEvents({
          accessToken,
          start,
          end,
        });

        events.push(
          ...outlookEvents.map(event => ({
            id: `microsoft:${event.id}`,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            isAllDay: event.isAllDay,
            source: 'microsoft' as const,
            calendarName: microsoftConnection!.calendarName || 'Outlook',
            location: event.location,
          })),
        );
      } catch (error) {
        console.error('Failed to fetch Microsoft calendar events:', error);
      }
    }

    events.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 },
    );
  }
}
