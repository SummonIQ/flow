import { getAgentExecutor } from '@/lib/orchestration/agent-executor';
import { NextRequest, NextResponse } from 'next/server';

const executor = getAgentExecutor();

/**
 * POST /api/sessions/[id]/stop
 * Deprecated: use /api/agent-sessions/[sessionId]/control with action STOP.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: sessionId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Stop the session
    await executor.stopSession(sessionId, reason);

    const response = NextResponse.json({
      success: true,
      message: 'Work session stopped successfully',
      deprecated: true,
      next: '/api/agent-sessions/[sessionId]/control',
    });
    response.headers.set('Deprecation', 'true');
    response.headers.set(
      'Link',
      '</api/agent-sessions/[sessionId]/control>; rel="successor-version"',
    );
    return response;
  } catch (error) {
    console.error('Error stopping session:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to stop session',
      },
      { status: 500 },
    );
  }
}
