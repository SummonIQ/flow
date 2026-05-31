import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function GET() {
  try {
    const { start, end } = getTodayRange();

    const count = await prisma.meeting.count({
      where: {
        startTime: {
          gte: start,
          lt: end,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('[API] Error counting today\'s meetings:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
