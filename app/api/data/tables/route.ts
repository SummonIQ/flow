import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - List all tables with row counts
export async function GET() {
  try {
    // Get all table names from Prisma schema
    const tables = [
      { name: 'Project', model: prisma.project },
      { name: 'Team', model: prisma.team },
      { name: 'TeamMember', model: prisma.teamMember },
      { name: 'Agent', model: prisma.agent },
      { name: 'Workflow', model: prisma.workflow },
      { name: 'Ticket', model: prisma.ticket },
      { name: 'KnowledgeDocument', model: prisma.knowledgeDocument },
    ];

    const tablesWithCounts = await Promise.all(
      tables.map(async ({ name, model }) => {
        const count = await (model as any).count();
        return { name, count };
      })
    );

    return NextResponse.json(tablesWithCounts);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}
