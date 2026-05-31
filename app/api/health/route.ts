import { NextResponse } from 'next/server';

const startTime = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  return NextResponse.json({
    status: 'ok',
    uptime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`,
    timestamp: new Date().toISOString(),
  });
}
