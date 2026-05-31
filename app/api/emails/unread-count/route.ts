import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const count = await prisma.email.count({
      where: { isRead: false },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error('[API] Error counting unread emails:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
