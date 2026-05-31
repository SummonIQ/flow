import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const count = await prisma.client.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('[API] Error counting clients:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
