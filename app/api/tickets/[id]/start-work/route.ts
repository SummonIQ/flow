import { getAgentExecutor } from '@/lib/orchestration/agent-executor';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const startWorkSchema = z.object({
  agentId: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
  enableTesting: z.boolean().optional().default(true),
  requiresReview: z.boolean().optional().default(true),
  enableFileAccess: z.boolean().optional().default(true),
  enableMcpTools: z.boolean().optional().default(true), // MCP tools enabled
  enableBrowserValidation: z.boolean().optional().default(true), // Playwright validation
});

// POST /api/tickets/[id]/start-work - Start agent work on ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: ticketId } = await params;
    const body = await request.json();

    // Validate input
    const validation = startWorkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      agentId,
      dryRun,
      enableTesting,
      requiresReview,
      enableFileAccess,
      enableMcpTools,
      enableBrowserValidation,
    } = validation.data;

    // Initialize executor
    const executor = getAgentExecutor();

    // Determine agent (use assigned agent if not specified)
    let workingAgentId = agentId;
    if (!workingAgentId) {
      const { prisma } = await import('@/lib/db/prisma');
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { assignedToId: true },
      });

      if (!ticket?.assignedToId) {
        return NextResponse.json(
          { error: 'No agent assigned to ticket' },
          { status: 400 },
        );
      }

      workingAgentId = ticket.assignedToId;
    }

    // Start work session
    const session = await executor.startWork(ticketId, workingAgentId, {
      dryRun,
      enableTesting,
      requiresReview,
      enableFileAccess,
      enableMcpTools,
      enableBrowserValidation,
    });

    console.log(
      `[Start Work] Session ${session.id} started for ticket ${ticketId}`,
    );

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        ticketId: session.ticketId,
        agentId: session.agentId,
        status: session.status,
        startedAt: session.startedAt,
      },
      message: `${session.context.agent.name} started working on the ticket`,
    });
  } catch (error) {
    console.error('[Start Work] Error:', error);
    console.error(
      '[Start Work] Stack:',
      error instanceof Error ? error.stack : 'No stack',
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to start work',
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    );
  }
}
