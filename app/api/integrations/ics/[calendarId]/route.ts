import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/db/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> },
) {
  try {
    const { calendarId } = await params;
    await prisma.calendarConnection.deleteMany({
      where: {
        provider: 'ics',
        calendarId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ICS connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete ICS connection' },
      { status: 500 },
    );
  }
}
