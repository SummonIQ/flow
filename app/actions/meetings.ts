'use server';

import prisma from '@/lib/db/prisma';
import type { MeetingStatus, MeetingType } from '@prisma/client';

export async function getMeetings(options?: { date?: Date; limit?: number }) {
  try {
    const today = options?.date ?? new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const meetings = await prisma.meeting.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      take: options?.limit ?? 10,
      orderBy: { startTime: 'asc' },
      include: {
        client: { select: { name: true } },
      },
    });
    return { success: true, data: meetings };
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    return { success: false, error: 'Failed to fetch meetings' };
  }
}

export async function getUpcomingMeetings(limit = 5) {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        startTime: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      take: limit,
      orderBy: { startTime: 'asc' },
      include: {
        client: { select: { name: true } },
      },
    });
    return { success: true, data: meetings };
  } catch (error) {
    console.error('Failed to fetch upcoming meetings:', error);
    return { success: false, error: 'Failed to fetch upcoming meetings' };
  }
}

export async function getMeetingStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [todayCount, upcomingCount] = await Promise.all([
      prisma.meeting.count({
        where: {
          startTime: { gte: today, lte: endOfDay },
        },
      }),
      prisma.meeting.count({
        where: {
          startTime: { gt: endOfDay },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),
    ]);

    return {
      success: true,
      data: { todayCount, upcomingCount },
    };
  } catch (error) {
    console.error('Failed to fetch meeting stats:', error);
    return { success: false, error: 'Failed to fetch meeting stats' };
  }
}

export async function createMeeting(data: {
  title: string;
  description?: string;
  type?: MeetingType;
  startTime: Date;
  endTime: Date;
  clientId?: string;
  location?: string;
  meetingUrl?: string;
  attendees?: string[];
}) {
  try {
    const meeting = await prisma.meeting.create({ data });
    return { success: true, data: meeting };
  } catch (error) {
    console.error('Failed to create meeting:', error);
    return { success: false, error: 'Failed to create meeting' };
  }
}

export async function updateMeeting(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    type: MeetingType;
    status: MeetingStatus;
    startTime: Date;
    endTime: Date;
    location: string;
    meetingUrl: string;
    attendees: string[];
    notes: string;
  }>,
) {
  try {
    const meeting = await prisma.meeting.update({
      where: { id },
      data,
    });
    return { success: true, data: meeting };
  } catch (error) {
    console.error('Failed to update meeting:', error);
    return { success: false, error: 'Failed to update meeting' };
  }
}

export async function deleteMeeting(id: string) {
  try {
    await prisma.meeting.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    return { success: false, error: 'Failed to delete meeting' };
  }
}
