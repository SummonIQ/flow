import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';
import { z } from 'zod';

// Schema for updating a ticket
const updateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'QA', 'BLOCKED', 'DONE', 'DESIGN', 'UNREFINED', 'READY']).optional(),
  labels: z.array(z.string()).optional(),
  assignedToId: z.string().nullable().optional(),
  teamId: z.string().nullable().optional(),
  position: z.number().optional(),
  acceptanceCriteria: z.any().optional(),
  businessRequirements: z.string().optional(),
  checklistItems: z.any().optional(),
  estimatedValue: z.string().optional(),
  isFrontend: z.boolean().optional(),
});

// GET /api/tickets/[id] - Get a single ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
            description: true,
          }
        },
        team: {
          include: {
            members: {
              include: {
                agent: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                  }
                }
              }
            }
          }
        },
        comments: {
          include: {
            authorAgent: {
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
        },
        knowledgeDocs: true,
        _count: {
          select: {
            comments: true,
            knowledgeDocs: true,
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('[API] Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// PUT /api/tickets/[id] - Update a ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = updateTicketSchema.parse(body);
    
    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        status: true,
        assignedToId: true,
      }
    });
    
    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Track status changes for comments
    const statusChanged = validatedData.status && validatedData.status !== existingTicket.status;
    const assigneeChanged = validatedData.assignedToId !== undefined && validatedData.assignedToId !== existingTicket.assignedToId;
    
    // Update the ticket
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
        completedAt: validatedData.status === 'DONE' ? new Date() : undefined,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
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
    
    // Create system comments for important changes
    const systemComments = [];
    
    if (statusChanged) {
      systemComments.push({
        ticketId: id,
        authorType: 'system',
        authorName: 'System',
        content: `Status changed from ${existingTicket.status} to ${validatedData.status}`,
        isInternal: true,
      });
    }
    
    if (assigneeChanged) {
      const newAssigneeName = ticket.assignedTo?.name || 'Unassigned';
      systemComments.push({
        ticketId: id,
        authorType: 'system',
        authorName: 'System',
        content: `Ticket reassigned to ${newAssigneeName}`,
        isInternal: true,
      });
    }
    
    if (systemComments.length > 0) {
      await prisma.ticketComment.createMany({
        data: systemComments,
      });
    }

    // Mark embedding as stale if content fields changed
    const changedFields = ragEmbeddingService.detectChangedContentFields(
      'Ticket',
      validatedData as Record<string, unknown>
    );
    if (changedFields.length > 0) {
      await ragEmbeddingService.onUpdated('Ticket', id, changedFields);
    }

    console.log(`[API] Updated ticket: ${id}`);

    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.flatten() },
        { status: 400 }
      );
    }
    
    console.error('[API] Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/[id] - Partially update a ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Delegate to PUT for now (both do partial updates)
  return PUT(request, { params });
}

// DELETE /api/tickets/[id] - Delete a ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        title: true,
        comments: {
          select: { id: true }
        },
        knowledgeDocs: {
          select: { id: true }
        }
      }
    });
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Delete embeddings first
    await ragEmbeddingService.onDeleted('Ticket', id);

    // Delete the ticket (cascading delete will handle related records)
    await prisma.ticket.delete({
      where: { id },
    });

    console.log(`[API] Deleted ticket: ${id} - ${ticket.title}`);
    
    return NextResponse.json({
      success: true,
      message: `Ticket "${ticket.title}" deleted successfully`,
    });
  } catch (error) {
    console.error('[API] Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
