/**
 * Notifications API - Stub implementation
 * Flow doesn't have a Notification model - returns empty data
 */

import { NextResponse } from 'next/server';

// GET /api/notifications
export async function GET() {
  return NextResponse.json({ notifications: [], unreadCount: 0 });
}

// POST /api/notifications
export async function POST() {
  return NextResponse.json({
    notification: null,
    message: 'Notifications not implemented in Flow',
  });
}
