import { prisma } from '@/lib/db/prisma';
import { triggerTicketCreated } from '@/lib/pusher/server';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for creating a ticket
const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z
    .enum([
      'BACKLOG',
      'TODO',
      'IN_PROGRESS',
      'IN_REVIEW',
      'QA',
      'BLOCKED',
      'DONE',
      'DESIGN',
      'UNREFINED',
      'READY',
    ])
    .default('BACKLOG'),
  labels: z.array(z.string()).optional().default([]),
  assignedToId: z.string().nullable().optional(),
  teamId: z.string().nullable().optional(),
  acceptanceCriteria: z.any().nullable().optional(),
  businessRequirements: z.string().nullable().optional(),
  checklistItems: z.any().nullable().optional(),
  estimatedValue: z.string().nullable().optional(),
  isFrontend: z.boolean().default(false),
});

// GET /api/projects/[name]/tickets - List tickets for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;
    const { searchParams } = new URL(request.url);

    // Get query parameters for filtering
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');
    const teamId = searchParams.get('teamId');
    const priority = searchParams.get('priority');
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 50;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : 0;

    // First, find the project by name
    const project = await prisma.project.findFirst({
      where: { name: projectName },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Build the where clause for filtering
    const whereClause: any = {
      projectId: project.id,
    };

    if (status) {
      whereClause.status = status;
    }
    if (assignedToId) {
      whereClause.assignedToId = assignedToId;
    }
    if (teamId) {
      whereClause.teamId = teamId;
    }
    if (priority) {
      whereClause.priority = priority;
    }

    // Fetch tickets with related data
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            key: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            authorName: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3, // Only include latest 3 comments in list view
        },
        _count: {
          select: {
            comments: true,
            knowledgeDocs: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.ticket.count({
      where: whereClause,
    });

    return NextResponse.json({
      tickets,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 },
    );
  }
}

// POST /api/projects/[name]/tickets - Create a new ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = createTicketSchema.parse(body);

    // Find the project
    const project = await prisma.project.findFirst({
      where: { name: projectName },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get the highest position for the given status
    const highestPosition = await prisma.ticket.findFirst({
      where: {
        projectId: project.id,
        status: validatedData.status,
      },
      orderBy: {
        position: 'desc',
      },
      select: {
        position: true,
      },
    });

    const position = (highestPosition?.position || 0) + 1;

    // Auto-assignment logic for Product Owner
    let assignedToId = validatedData.assignedToId;
    let autoTeamId = validatedData.teamId;

    // If no team is provided, try to find the default AI Development Team
    if (!autoTeamId) {
      const defaultTeam = await prisma.team.findFirst({
        where: {
          name: 'AI Development Team',
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (defaultTeam) {
        autoTeamId = defaultTeam.id;
        console.log(`[API] Auto-selected team: ${defaultTeam.name}`);
      }
    }

    // If no assignee is provided, try to auto-assign to Product Owner
    if (!assignedToId) {
      if (autoTeamId) {
        // Find the Product Owner in the team
        const productOwner = await prisma.teamMember.findFirst({
          where: {
            teamId: autoTeamId,
            agent: {
              role: 'PRODUCT_OWNER',
            },
          },
          select: {
            agentId: true,
            agent: {
              select: {
                name: true,
              },
            },
          },
        });

        if (productOwner) {
          assignedToId = productOwner.agentId;
          console.log(
            `[API] Auto-assigned ticket to team Product Owner: ${productOwner.agent.name}`,
          );
        }
      }

      // If still no assignee, try to find any active Product Owner
      if (!assignedToId) {
        const defaultProductOwner = await prisma.agent.findFirst({
          where: {
            role: 'PRODUCT_OWNER',
            isActive: true,
          },
          orderBy: {
            isDefault: 'desc',
          },
          select: {
            id: true,
            name: true,
          },
        });

        if (defaultProductOwner) {
          assignedToId = defaultProductOwner.id;
          console.log(
            `[API] Auto-assigned ticket to Product Owner: ${defaultProductOwner.name}`,
          );
        }
      }
    }

    // Get the next ticket number for this project
    const lastTicket = await prisma.ticket.findFirst({
      where: { projectId: project.id },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    const nextNumber = (lastTicket?.number || 0) + 1;

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        projectId: project.id,
        number: nextNumber,
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        labels: validatedData.labels,
        position,
        assignedToId,
        teamId: autoTeamId || validatedData.teamId,
        acceptanceCriteria: validatedData.acceptanceCriteria,
        businessRequirements: validatedData.businessRequirements,
        checklistItems: validatedData.checklistItems,
        estimatedValue: validatedData.estimatedValue,
        isFrontend: validatedData.isFrontend,
        createdBy: 'user', // TODO: Get from auth context
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await ragEmbeddingService.onCreated('Ticket', ticket.id);

    // If auto-assigned, create a comment
    if (assignedToId && !validatedData.assignedToId) {
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorType: 'system',
          authorName: 'System',
          content: `Ticket automatically assigned to ${ticket.assignedTo?.name} (${ticket.assignedTo?.role})`,
          isInternal: true,
        },
      });
    }

    console.log(`[API] Created ticket: ${ticket.id} - ${ticket.title}`);

    // Trigger real-time update via Pusher
    try {
      await triggerTicketCreated(projectName, ticket);
    } catch (pusherError) {
      console.error(
        '[Pusher] Failed to broadcast ticket creation:',
        pusherError,
      );
      // Continue even if Pusher fails
    }

    // Automatically start agent work if assigned
    if (ticket.assignedToId) {
      console.log(
        `[API] Auto-starting work for agent ${ticket.assignedTo?.name}`,
      );

      // Start work in background (non-blocking)
      const startWorkAsync = async () => {
        try {
          const { getAgentExecutor } = await import(
            '@/lib/orchestration/agent-executor'
          );
          const executor = getAgentExecutor();

          await executor.startWork(ticket.id, ticket.assignedToId!, {
            dryRun: false,
            enableTesting: true,
            requiresReview: true,
            enableFileAccess: true,
            enableMcpTools: true,
            enableBrowserValidation: true,
          });

          console.log(
            `[API] Agent ${ticket.assignedTo?.name} automatically started working on ticket ${ticket.id}`,
          );
        } catch (error) {
          console.error(
            `[API] Failed to auto-start work for ticket ${ticket.id}:`,
            error,
          );
          // Don't fail the ticket creation if auto-start fails
        }
      };

      // Execute in background without blocking response
      startWorkAsync();
    }

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }

    console.error('[API] Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 },
    );
  }
}
