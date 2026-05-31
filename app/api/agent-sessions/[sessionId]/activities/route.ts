/**
 * Agent Session Activities API
 *
 * Get activities, decisions, and mentoring sessions for a work session
 */

import { prisma } from '@/lib/db/prisma';
import { getActivityLogger } from '@/lib/orchestration/agent-activity-logger';
import { getAgentExecutor } from '@/lib/orchestration/agent-executor';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

const executor = getAgentExecutor();

/**
 * GET /api/agent-sessions/[sessionId]/activities
 *
 * Get all activities for a session
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const type = searchParams.get('type'); // Filter by type
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeDecisions = searchParams.get('decisions') !== 'false';
    const includeMentoring = searchParams.get('mentoring') !== 'false';

    // Get session to find project
    const session = await executor.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get project ID from ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: session.ticketId },
      select: { projectId: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Associated ticket not found' },
        { status: 404 },
      );
    }

    const logger = getActivityLogger(ticket.projectId);

    // Get activities
    let activities = logger.getSessionActivities(sessionId);

    // Filter by type if specified
    if (type) {
      activities = activities.filter(a => a.type === type);
    }

    // Limit results
    activities = activities.slice(-limit);

    // Get decisions if requested
    const decisions = includeDecisions
      ? logger.getSessionDecisions(sessionId)
      : [];

    // Get summary
    const summary = logger.getSessionSummary(sessionId);

    return NextResponse.json({
      sessionId,
      activities,
      decisions,
      summary,
      total: activities.length,
    });
  } catch (error) {
    console.error('Error getting session activities:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to get activities',
      },
      { status: 500 },
    );
  }
}
