import { getAgentExecutor } from '@/lib/orchestration/agent-executor';
import { NextRequest, NextResponse } from 'next/server';

const executor = getAgentExecutor();

/**
 * POST /api/tickets/[id]/stop-work
 * Stop active work on a ticket
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: ticketId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Find active session for this ticket
    const activeSessions = await executor.listActiveSessions();
    const session = activeSessions.find(s => s.ticketId === ticketId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active work session found for this ticket',
        },
        { status: 404 },
      );
    }

    // Stop the session
    await executor.stopSession(session.id, reason);

    return NextResponse.json({
      success: true,
      message: 'Work session stopped successfully',
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error stopping work:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop work',
      },
      { status: 500 },
    );
  }
}
