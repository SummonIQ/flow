import { NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getActivityLogger } from '@/lib/orchestration/agent-activity-logger';
import { getAgentExecutor } from '@/lib/orchestration/agent-executor';

const smokeSchema = z.object({
  projectName: z.string().min(1).optional(),
  ticketId: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  keepData: z.boolean().optional().default(false),
});

type SmokeStep = {
  step: string;
  status: string;
  timestamp: string;
};

export async function POST(request: Request) {
  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = smokeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { projectName, ticketId, agentId, keepData } = parsed.data;

  let resolvedTicketId = ticketId;
  let resolvedAgentId = agentId;
  let resolvedProjectId: string | null = null;
  let createdProjectId: string | null = null;
  let createdTicketId: string | null = null;

  try {
    if (resolvedTicketId) {
      const ticket = await prisma.ticket.findUnique({
        where: { id: resolvedTicketId },
        select: { id: true, projectId: true, assignedToId: true },
      });

      if (!ticket) {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 },
        );
      }

      resolvedProjectId = ticket.projectId;
      if (!resolvedAgentId) {
        resolvedAgentId = ticket.assignedToId ?? undefined;
      }
    }

    if (projectName) {
      const project = await prisma.project.findUnique({
        where: { name: projectName },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 },
        );
      }

      if (resolvedProjectId && resolvedProjectId !== project.id) {
        return NextResponse.json(
          { error: 'Ticket does not belong to project' },
          { status: 400 },
        );
      }

      resolvedProjectId = project.id;
    }

    if (!resolvedAgentId) {
      const agent = await prisma.agent.findFirst({
        select: { id: true },
      });
      if (!agent) {
        return NextResponse.json(
          { error: 'No agents available' },
          { status: 400 },
        );
      }
      resolvedAgentId = agent.id;
    }

    if (!resolvedProjectId) {
      const runId = `smoke-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const project = await prisma.project.create({
        data: {
          name: `Smoke Session ${runId}`,
          path: path.join(os.tmpdir(), `applab-${runId}`),
          description: 'Auto-generated project for session smoke testing',
        },
        select: { id: true },
      });

      resolvedProjectId = project.id;
      createdProjectId = project.id;
    }

    if (!resolvedTicketId) {
      const maxNumber = await prisma.ticket.findFirst({
        where: { projectId: resolvedProjectId },
        orderBy: { number: 'desc' },
        select: { number: true },
      });

      const ticket = await prisma.ticket.create({
        data: {
          projectId: resolvedProjectId,
          title: 'Smoke test: session workflow',
          description: 'End-to-end session smoke workflow',
          status: 'BACKLOG',
          priority: 'LOW',
          number: (maxNumber?.number ?? 0) + 1,
          assignedToId: resolvedAgentId,
        },
        select: { id: true },
      });

      resolvedTicketId = ticket.id;
      createdTicketId = ticket.id;
    }

    if (!resolvedTicketId || !resolvedAgentId || !resolvedProjectId) {
      return NextResponse.json(
        { error: 'Failed to resolve smoke test inputs' },
        { status: 400 },
      );
    }

    const executor = getAgentExecutor();
    const logger = getActivityLogger(resolvedProjectId);

    const session = await executor.startWork(resolvedTicketId, resolvedAgentId, {
      dryRun: true,
      enableTesting: false,
      requiresReview: false,
      enableFileAccess: false,
      enableMcpTools: false,
      enableBrowserValidation: false,
      skipExecution: true,
    });

    const steps: SmokeStep[] = [];
    const recordStep = async (step: string, overrideStatus?: string) => {
      const status =
        overrideStatus ??
        (await executor.getSession(session.id))?.status ??
        'UNKNOWN';
      steps.push({ step, status, timestamp: new Date().toISOString() });
    };

    await recordStep('start');

    await logger.pauseSession(session.id, 'Smoke test pause');
    await executor.pauseSession(session.id);
    await recordStep('pause');

    await logger.resumeSession(session.id);
    await executor.resumeSession(session.id);
    await recordStep('resume');

    await executor.stopSession(session.id, 'Smoke test stop');
    await logger.endSession(session.id, 'STOPPED');
    await recordStep('stop', 'STOPPED');

    if (!keepData) {
      if (createdProjectId) {
        await prisma.project.delete({ where: { id: createdProjectId } });
      } else if (createdTicketId) {
        await prisma.ticket.delete({ where: { id: createdTicketId } });
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      ticketId: resolvedTicketId,
      projectId: resolvedProjectId,
      steps,
      created: {
        projectId: createdProjectId,
        ticketId: createdTicketId,
      },
      keptData: keepData,
    });
  } catch (error) {
    console.error('[Smoke Session] Error:', error);

    if (!keepData) {
      try {
        if (createdProjectId) {
          await prisma.project.delete({ where: { id: createdProjectId } });
        } else if (createdTicketId) {
          await prisma.ticket.delete({ where: { id: createdTicketId } });
        }
      } catch (cleanupError) {
        console.warn('[Smoke Session] Cleanup failed:', cleanupError);
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Smoke workflow failed',
      },
      { status: 500 },
    );
  }
}
