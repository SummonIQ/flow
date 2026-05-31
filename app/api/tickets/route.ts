import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    console.log('[Tickets API] Fetching tickets for projectId:', projectId);

    if (!projectId) {
      console.error('[Tickets API] Missing projectId parameter');
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log('[Tickets API] Database connected successfully');
    } catch (dbError) {
      console.error('[Tickets API] Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed', details: String(dbError) }, { status: 500 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { projectId },
      include: {
        assignedTo: true,
        team: {
          include: {
            members: {
              include: {
                agent: true,
              },
            },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
    });

    console.log('[Tickets API] Found tickets:', tickets.length);
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('[Tickets API] Error fetching tickets:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tickets', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get the max position for the status
    const maxPosition = await prisma.ticket.findFirst({
      where: {
        projectId: body.projectId,
        status: body.status || 'BACKLOG',
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const ticket = await prisma.ticket.create({
      data: {
        ...body,
        position: (maxPosition?.position || 0) + 1,
      },
      include: {
        assignedTo: true,
        team: true,
      },
    });

    // Queue embedding for the new ticket
    await ragEmbeddingService.onCreated('Ticket', ticket.id);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketIds, updates } = body;

    // Bulk update for reordering
    if (ticketIds && Array.isArray(ticketIds)) {
      await Promise.all(
        ticketIds.map((id: string, index: number) =>
          prisma.ticket.update({
            where: { id },
            data: { position: index, ...updates },
          })
        )
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating tickets:', error);
    return NextResponse.json({ error: 'Failed to update tickets' }, { status: 500 });
  }
}
