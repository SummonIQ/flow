import { prisma } from '@/lib/db/prisma';
import { TicketStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const positionSchema = z.object({
  position: z.number().int().min(0),
  status: z.nativeEnum(TicketStatus).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const validation = positionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { position, status } = validation.data;

    // Get current ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { projectId: true, status: true, position: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const targetStatus = status || ticket.status;

    // Get all tickets in the same column that need position updates
    const ticketsInColumn = await prisma.ticket.findMany({
      where: {
        projectId: ticket.projectId,
        status: targetStatus,
        id: { not: id },
      },
      orderBy: { position: 'asc' },
      select: { id: true, position: true },
    });

    // Reorder tickets: shift positions to make room for the moved ticket
    const updates: Promise<any>[] = [];

    ticketsInColumn.forEach((t, index) => {
      const newPosition = index >= position ? index + 1 : index;
      if (t.position !== newPosition) {
        updates.push(
          prisma.ticket.update({
            where: { id: t.id },
            data: { position: newPosition },
          }),
        );
      }
    });

    // Update the dragged ticket's position
    updates.push(
      prisma.ticket.update({
        where: { id },
        data: { position },
      }),
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true, position });
  } catch (error) {
    console.error('[Position] Error updating ticket position:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket position' },
      { status: 500 },
    );
  }
}
