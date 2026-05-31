/**
 * Agent Session Control API
 *
 * Endpoints for controlling agent work sessions:
 * - Pause/Resume work
 * - Stop work
 * - Provide corrections
 * - Get session status
 */

import { prisma } from '@/lib/db/prisma';
import { getActivityLogger } from '@/lib/orchestration/agent-activity-logger';
import { getAgentExecutor } from '@/lib/orchestration/agent-executor';
import type { AgentControlAction } from '@/types/agent-activity';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

// Singleton executor for session management
const executor = getAgentExecutor();

/**
 * POST /api/agent-sessions/[sessionId]/control
 *
 * Control an active agent session
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { action, reason, correction } = body as {
      action: AgentControlAction;
      reason?: string;
      correction?: {
        what: string;
        how: string;
        newDirection?: string;
      };
    };

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 },
      );
    }

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

    let result: {
      success: boolean;
      message: string;
      previousState: string;
      newState: string;
    };

    switch (action) {
      case 'PAUSE': {
        const previousState = session.status;
        await logger.pauseSession(sessionId, reason);
        await executor.pauseSession(sessionId);
        result = {
          success: true,
          message: reason || 'Session paused',
          previousState,
          newState: 'PAUSED',
        };
        break;
      }

      case 'RESUME': {
        const previousState = session.status;
        await logger.resumeSession(sessionId);
        await executor.resumeSession(sessionId);
        const updatedSession = await executor.getSession(sessionId);
        result = {
          success: true,
          message: 'Session resumed',
          previousState,
          newState: updatedSession?.status ?? 'ACTIVE',
        };
        break;
      }

      case 'STOP': {
        const previousState = session.status;
        await executor.stopSession(sessionId, reason);
        await logger.endSession(sessionId, 'STOPPED');
        result = {
          success: true,
          message: reason || 'Session stopped',
          previousState,
          newState: 'STOPPED',
        };
        break;
      }

      case 'CORRECT':
        if (!correction) {
          return NextResponse.json(
            { error: 'Correction details required for CORRECT action' },
            { status: 400 },
          );
        }
        await logger.addCorrection(
          sessionId,
          correction.what,
          correction.how,
          correction.newDirection,
        );
        result = {
          success: true,
          message: `Correction added: ${correction.what}`,
          previousState: session.status,
          newState: session.status,
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }

    // Broadcast control action via Pusher
    try {
      const project = await prisma.project.findUnique({
        where: { id: ticket.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-control',
            {
              sessionId,
              action,
              ...result,
              timestamp: new Date().toISOString(),
            },
          );
        }
      }
    } catch (error) {
      console.error('[Pusher] Failed to broadcast control action:', error);
    }

    return NextResponse.json({
      sessionId,
      action,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error controlling session:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to control session',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/agent-sessions/[sessionId]/control
 *
 * Get session status and control state
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;

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
    const summary = logger.getSessionSummary(sessionId);

    return NextResponse.json({
      sessionId,
      status: session.status,
      isPaused: logger.isSessionPaused(sessionId),
      pendingCorrection: logger.getPendingCorrection(sessionId),
      summary,
      ticket: {
        id: session.ticketId,
        title: session.context.ticket.title,
      },
      agent: {
        id: session.agentId,
        name: session.context.agent.name,
        role: session.context.agent.role,
      },
      startedAt: session.startedAt,
      activityCount: session.activities.length,
    });
  } catch (error) {
    console.error('Error getting session status:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get session status',
      },
      { status: 500 },
    );
  }
}
