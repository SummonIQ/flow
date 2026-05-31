import { prisma } from '@/lib/db/prisma';
import { triggerTicketUpdate } from '@/lib/pusher/server';
import { memoryService } from '@/lib/services/memory-service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const transitionSchema = z.object({
  newStatus: z.enum([
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
  ]),
  comment: z.string().optional(),
  reassignToId: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validation = transitionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { newStatus, comment, reassignToId } = validation.data;

    // Get current ticket state
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        assignedTo: true,
        team: {
          include: {
            workflow: true,
            members: {
              include: {
                agent: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const oldStatus = ticket.status;

    // Determine new assignee based on workflow rules
    let newAssigneeId = reassignToId || ticket.assignedToId;

    // Auto-assignment logic based on status transition
    if (!reassignToId && ticket.team?.workflow) {
      const workflow = ticket.team.workflow;

      // Parse workflow stages if stored as JSON
      const stages = workflow.stages as any[];
      const newStage = stages?.find(
        (stage: any) =>
          stage.id === newStatus.toLowerCase() ||
          stage.name?.toLowerCase() === newStatus.toLowerCase(),
      );

      if (newStage?.agentRole) {
        // Find agent in team with matching role
        const teamMember = ticket.team.members.find(
          member => member.agent.role === newStage.agentRole,
        );

        if (teamMember) {
          newAssigneeId = teamMember.agentId;
          console.log(
            `[Transition] Auto-assigning to ${teamMember.agent.name} for ${newStatus} stage`,
          );
        }
      }
    }

    // Special rules for specific transitions
    if (!reassignToId) {
      switch (newStatus) {
        case 'BACKLOG':
        case 'UNREFINED':
          // Assign to Product Owner
          const productOwner = ticket.team?.members.find(
            m => m.agent.role === 'PRODUCT_OWNER',
          );
          if (productOwner) {
            newAssigneeId = productOwner.agentId;
          }
          break;

        case 'DESIGN':
          // Assign to Designer
          const designer = ticket.team?.members.find(
            m => m.agent.role === 'DESIGNER',
          );
          if (designer) {
            newAssigneeId = designer.agentId;
          }
          break;

        case 'IN_PROGRESS':
        case 'TODO':
          // Assign to available developer
          const developer = ticket.team?.members.find(m =>
            [
              'FRONTEND_ENGINEER',
              'BACKEND_ENGINEER',
              'FULLSTACK_ENGINEER',
            ].includes(m.agent.role),
          );
          if (developer) {
            newAssigneeId = developer.agentId;
          }
          break;

        case 'QA':
          // Assign to QA Engineer
          const qaEngineer = ticket.team?.members.find(
            m => m.agent.role === 'QA_ENGINEER',
          );
          if (qaEngineer) {
            newAssigneeId = qaEngineer.agentId;
          }
          break;

        case 'IN_REVIEW':
          // Assign to Tech Lead or Product Owner
          const techLead = ticket.team?.members.find(
            m => m.agent.role === 'TECH_LEAD',
          );
          if (techLead) {
            newAssigneeId = techLead.agentId;
          }
          break;
      }
    }

    // Update ticket with new status and assignee
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: newStatus,
        assignedToId: newAssigneeId,
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Get the new assignee details for the comment
    const newAssignee = newAssigneeId
      ? await prisma.agent.findUnique({
          where: { id: newAssigneeId },
          select: { name: true },
        })
      : null;

    // Create system comment for transition
    const transitionComment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        content: comment || `Status changed from ${oldStatus} to ${newStatus}`,
        isInternal: true, // System comments are internal
        authorId: newAssigneeId,
        authorType: 'agent',
        authorName: newAssignee?.name || 'System',
        actionType: 'status_change',
      },
      include: {
        authorAgent: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Log the transition
    console.log(
      `[Transition] Ticket ${id}: ${oldStatus} → ${newStatus}, assigned to ${updatedTicket.assignedTo?.name}`,
    );

    // Create memories for significant transitions
    try {
      // When ticket is started (moved to IN_PROGRESS)
      if (newStatus === 'IN_PROGRESS' && oldStatus !== 'IN_PROGRESS') {
        await memoryService.onTicketStarted(ticket.projectId, {
          id: ticket.id,
          number: ticket.number,
          title: ticket.title,
          description: ticket.description,
          acceptanceCriteria: ticket.acceptanceCriteria as string | null,
        });
        console.log(
          `[Memory] Created memory for ticket #${ticket.number} started`,
        );
      }

      // When ticket is completed (moved to DONE)
      if (newStatus === 'DONE' && oldStatus !== 'DONE') {
        await memoryService.onTicketCompleted(ticket.projectId, {
          id: ticket.id,
          number: ticket.number,
          title: ticket.title,
          description: ticket.description,
        });
        console.log(
          `[Memory] Created memory for ticket #${ticket.number} completed`,
        );
      }

      // When ticket enters QA
      if (newStatus === 'QA' && oldStatus !== 'QA') {
        await memoryService.create({
          projectId: ticket.projectId,
          title: `QA Review: ${ticket.title}`,
          content: `Ticket #${ticket.number} entered QA review.\n\nDescription: ${ticket.description || 'No description'}\n\nAcceptance Criteria: ${ticket.acceptanceCriteria || 'None specified'}`,
          category: 'WORKFLOW',
          source: `ticket:${ticket.id}`,
          importance: 5,
          tags: ['ticket', 'qa', `ticket-${ticket.number}`],
        });
      }

      // When ticket is blocked
      if (newStatus === 'BLOCKED') {
        await memoryService.create({
          projectId: ticket.projectId,
          title: `Blocked: ${ticket.title}`,
          content: `Ticket #${ticket.number} was blocked.\n\nReason: ${comment || 'No reason provided'}\n\nDescription: ${ticket.description || 'No description'}`,
          category: 'DEBUGGING',
          source: `ticket:${ticket.id}`,
          importance: 8,
          tags: ['ticket', 'blocked', `ticket-${ticket.number}`],
        });
      }
    } catch (memoryError) {
      console.error('[Memory] Failed to create memory:', memoryError);
      // Continue even if memory creation fails
    }

    // Trigger real-time update via Pusher
    try {
      await triggerTicketUpdate(ticket.project.name, updatedTicket);
    } catch (pusherError) {
      console.error('[Pusher] Failed to broadcast ticket update:', pusherError);
      // Continue even if Pusher fails
    }

    return NextResponse.json({
      ticket: updatedTicket,
      transition: {
        from: oldStatus,
        to: newStatus,
        assignee: updatedTicket.assignedTo,
        comment: {
          ...transitionComment,
          author: transitionComment.authorAgent,
        },
      },
    });
  } catch (error) {
    console.error('[Transition] Error:', error);
    return NextResponse.json(
      { error: 'Failed to transition ticket' },
      { status: 500 },
    );
  }
}
