import { NextResponse } from 'next/server';

// POST /api/notifications/clear - Stub
export async function POST() {
  return NextResponse.json({ deleted: 0 });
}
