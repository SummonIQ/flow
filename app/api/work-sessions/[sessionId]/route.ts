import { getAgentExecutor } from '@/lib/orchestration/agent-executor';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/work-sessions/[sessionId] - Get work session status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    const executor = getAgentExecutor();
    const session = await executor.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('[Session Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get session status' },
      { status: 500 },
    );
  }
}

// POST /api/work-sessions/[sessionId] - Control work session (pause/resume)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { action } = body;

    const executor = getAgentExecutor();

    switch (action) {
      case 'pause':
        await executor.pauseSession(sessionId);
        return NextResponse.json({
          success: true,
          message: 'Session paused',
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('[Session Control] Error:', error);
    return NextResponse.json(
      { error: 'Failed to control session' },
      { status: 500 },
    );
  }
}
