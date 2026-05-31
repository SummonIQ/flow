import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const name = form.get('name');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const text = await file.text();
    if (!text.trim()) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    const calendarId = crypto.randomUUID();
    const calendarName =
      typeof name === 'string' && name.trim() ? name.trim() : file.name || 'ICS File';

    await prisma.calendarConnection.create({
      data: {
        provider: 'ics',
        providerAccountId: file.name || 'file',
        accessToken: text,
        refreshToken: null,
        expiresAt: null,
        calendarId,
        calendarName,
        isPrimary: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to upload ICS file:', error);
    return NextResponse.json(
      { error: 'Failed to upload ICS file' },
      { status: 500 },
    );
  }
}
