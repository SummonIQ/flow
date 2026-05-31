/**
 * POST /api/work-sessions/[sessionId]/resume
 * Resume a paused or blocked work session
 */

import { getAgentExecutor } from '@/lib/orchestration/agent-executor';
import { NextRequest, NextResponse } from 'next/server';

const executor = getAgentExecutor();

interface RouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { sessionId } = await context.params;

    // Resume the blocked session
    await executor.resumeSession(sessionId);

    // Get updated session status
    const session = await executor.getSession(sessionId);

    return NextResponse.json({
      success: true,
      session,
      message: 'Work session resumed',
    });
  } catch (error) {
    console.error('Error resuming session:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to resume session',
      },
      { status: 400 },
    );
  }
}
