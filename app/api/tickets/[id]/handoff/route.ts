import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const handoffSchema = z.object({
  fromAgentId: z.string(),
  toAgentId: z.string(),
  reason: z.string().min(1, 'Reason is required'),
  instructions: z.string().optional(),
  requestedAction: z.enum([
    'REVIEW',
    'IMPLEMENT',
    'TEST',
    'DESIGN',
    'REFINE',
    'APPROVE',
    'FIX',
    'DOCUMENT'
  ]).optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validation = handoffSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fromAgentId, toAgentId, reason, instructions, requestedAction } = validation.data;

    // Get ticket details
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        team: {
          include: {
            members: {
              include: {
                agent: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Verify from agent is current assignee
    if (ticket.assignedToId !== fromAgentId) {
      return NextResponse.json(
        { error: 'Only the current assignee can hand off the ticket' },
        { status: 403 }
      );
    }

    // Get agent details
    const [fromAgent, toAgent] = await Promise.all([
      prisma.agent.findUnique({ where: { id: fromAgentId } }),
      prisma.agent.findUnique({ where: { id: toAgentId } })
    ]);

    if (!fromAgent || !toAgent) {
      return NextResponse.json({ error: 'Invalid agent IDs' }, { status: 400 });
    }

    // Create handoff record
    const handoff = await prisma.ticketHandoff.create({
      data: {
        ticketId: id,
        fromAgentId,
        toAgentId,
        reason,
        instructions,
        requestedAction,
      }
    });

    // Update ticket assignee
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        assignedToId: toAgentId,
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        team: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Create handoff comment
    const handoffComment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        content: `🤝 **Handoff**: ${fromAgent.name} → ${toAgent.name}\n\n**Reason**: ${reason}${
          instructions ? `\n\n**Instructions**: ${instructions}` : ''
        }${
          requestedAction ? `\n\n**Requested Action**: ${requestedAction.replace(/_/g, ' ')}` : ''
        }`,
        authorId: fromAgentId,
        authorType: 'agent',
        authorName: fromAgent.name,
        isInternal: false, // Handoffs should be visible
        requestsAction: !!requestedAction,
        actionType: requestedAction || 'handoff',
      },
      include: {
        authorAgent: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    });

    // Create notification for receiving agent
    const notification = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        content: `📬 You have received a ticket handoff from ${fromAgent.name}. ${
          requestedAction ? `Action required: ${requestedAction.replace(/_/g, ' ')}` : 'Please review and continue.'
        }`,
        authorId: toAgentId,
        authorType: 'system',
        authorName: 'System',
        isInternal: true,
        requestsAction: true,
        actionType: 'notification',
      }
    });

    // Log the handoff
    console.log(`[Handoff] Ticket ${id}: ${fromAgent.name} → ${toAgent.name} (${reason})`);

    return NextResponse.json({
      success: true,
      handoff: {
        id: handoff.id,
        from: fromAgent,
        to: toAgent,
        reason,
        instructions,
        requestedAction,
      },
      ticket: updatedTicket,
      comment: handoffComment,
    });

  } catch (error) {
    console.error('[Handoff] Error:', error);
    return NextResponse.json(
      { error: 'Failed to complete handoff' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve handoff history
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const handoffs = await prisma.ticketHandoff.findMany({
      where: { ticketId: id },
      include: {
        fromAgent: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        toAgent: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(handoffs);

  } catch (error) {
    console.error('[Handoff] Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handoff history' },
      { status: 500 }
    );
  }
}
