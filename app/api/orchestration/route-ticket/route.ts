/**
 * POST /api/orchestration/route-ticket
 * 
 * Routes a ticket through the orchestration system
 */

import { NextResponse } from 'next/server';
import { ProjectOrchestrator } from '@/lib/orchestration';
import type { TicketProcessingRequest } from '@/types/orchestration';

export async function POST(request: Request) {
  try {
    const body = await request.json() as TicketProcessingRequest;

    const { ticketId, projectId, forceAnalysis, preferredAgent, deadline } = body;

    if (!ticketId || !projectId) {
      return NextResponse.json(
        { error: 'ticketId and projectId are required' },
        { status: 400 }
      );
    }

    // Initialize orchestrator for the project
    const orchestrator = new ProjectOrchestrator(projectId);
    await orchestrator.initialize();

    // Process the ticket
    const result = await orchestrator.processTicket({
      ticketId,
      projectId,
      forceAnalysis,
      preferredAgent,
      deadline,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error routing ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
