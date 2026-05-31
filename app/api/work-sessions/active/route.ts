import { prisma } from '@/lib/db/prisma';
import { getAgentExecutor } from '@/lib/orchestration/agent-executor';
import { NextResponse } from 'next/server';

// GET /api/work-sessions/active - List all active work sessions
export async function GET(request: Request) {
  try {
    const executor = getAgentExecutor();

    const { searchParams } = new URL(request.url);
    const projectName =
      searchParams.get('projectName') ?? searchParams.get('project') ?? null;

    let projectId: string | null = null;
    if (projectName) {
      const project = await prisma.project.findFirst({
        where: { name: projectName },
        select: { id: true },
      });
      projectId = project?.id ?? null;
    }

    const now = Date.now();

    const sessions = (await executor.listActiveSessions()).filter(session => {
      if (projectId && session.context.ticket.projectId !== projectId) {
        return false;
      }

      const lastActivityAt = session.activities.reduce<Date>((latest, act) => {
        if (act.timestamp instanceof Date && act.timestamp > latest)
          return act.timestamp;
        return latest;
      }, session.startedAt);

      const timeoutMinutes = session.timeoutMinutes ?? 30;
      const staleMs = timeoutMinutes * 60 * 1000;
      return now - lastActivityAt.getTime() <= staleMs;
    });

    return NextResponse.json({
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('[Active Sessions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to list active sessions' },
      { status: 500 },
    );
  }
}
