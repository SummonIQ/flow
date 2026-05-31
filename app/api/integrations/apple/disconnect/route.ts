import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/db/prisma';

export async function POST(_req: NextRequest) {
  try {
    await prisma.calendarConnection.deleteMany({
      where: { provider: 'apple' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect Apple Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Apple Calendar' },
      { status: 500 },
    );
  }
}
