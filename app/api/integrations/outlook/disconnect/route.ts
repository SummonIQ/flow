import { NextResponse } from 'next/server';

import prisma from '@/lib/db/prisma';

export async function POST() {
  try {
    await prisma.calendarConnection.deleteMany({
      where: { provider: 'microsoft' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect Outlook:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Outlook' },
      { status: 500 },
    );
  }
}
