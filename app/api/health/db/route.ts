import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return NextResponse.json({
      connected: true,
      latency,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error:
          error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
