/**
 * GET /api/orchestration/[projectId]/status
 * 
 * Get orchestration status for a project
 */

import { NextResponse } from 'next/server';
import { ProjectOrchestrator } from '@/lib/orchestration';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;

    // Initialize orchestrator
    const orchestrator = new ProjectOrchestrator(projectId);
    await orchestrator.initialize();

    // Get core team utilization
    const team = await prisma.team.findFirst({
      where: { projectId, isActive: true },
      include: {
        members: {
          include: { agent: true },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'No active team found for project' },
        { status: 404 }
      );
    }

    // Calculate team metrics
    const memberIds = team.members.map(m => m.agent.id);
    
    const activeTickets = await prisma.ticket.count({
      where: {
        assignedToId: { in: memberIds },
        status: { in: ['IN_PROGRESS', 'IN_REVIEW', 'QA'] },
      },
    });

    const totalTickets = await prisma.ticket.count({
      where: {
        assignedToId: { in: memberIds },
      },
    });

    const completedTickets = await prisma.ticket.count({
      where: {
        assignedToId: { in: memberIds },
        status: 'DONE',
      },
    });

    const totalCapacity = team.members.reduce(
      (sum, m) => sum + m.agent.maxConcurrentTasks,
      0
    );

    const utilization = totalCapacity > 0 ? (activeTickets / totalCapacity) * 100 : 0;

    return NextResponse.json({
      projectId,
      team: {
        id: team.id,
        name: team.name,
        memberCount: team.members.length,
        capacity: totalCapacity,
      },
      metrics: {
        activeTickets,
        totalTickets,
        completedTickets,
        utilization: Math.round(utilization),
        completionRate: totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0,
      },
      routing: {
        strategy: 'HYBRID_AUTO', // This should come from config
        specialistPoolEnabled: true,
      },
    });
  } catch (error) {
    console.error('Error getting orchestration status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
