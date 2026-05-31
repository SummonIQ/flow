import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Schema for creating a comment
const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  authorId: z.string().optional(),
  authorType: z.string().default('user'),
  authorName: z.string(),
  isInternal: z.boolean().default(false),
  requestsAction: z.boolean().default(false),
  actionType: z.string().optional(),
});

// GET /api/tickets/[id]/comments - Get comments for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    // Check if ticket exists
    const ticketExists = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true }
    });
    
    if (!ticketExists) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Fetch comments
    const comments = await prisma.ticketComment.findMany({
      where: { ticketId },
      include: {
        authorAgent: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('[API] Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/tickets/[id]/comments - Add a comment to a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = createCommentSchema.parse(body);
    
    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        title: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
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
    
    // Create the comment
    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        ...validatedData,
      },
      include: {
        authorAgent: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
          }
        }
      }
    });
    
    console.log(`[API] Created comment on ticket ${ticketId}`);
    
    // If comment requests action and there's an assigned agent, we could trigger a notification here
    if (validatedData.requestsAction && ticket.assignedTo) {
      console.log(`[API] Action requested from ${ticket.assignedTo.name} on ticket: ${ticket.title}`);
      // TODO: Implement notification system
    }
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.flatten() },
        { status: 400 }
      );
    }
    
    console.error('[API] Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
