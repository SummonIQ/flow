import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define table metadata
const tableMetadata: Record<string, any> = {
  Project: {
    model: prisma.project,
    columns: [
      { name: 'id', type: 'String', nullable: false },
      { name: 'name', type: 'String', nullable: false },
      { name: 'path', type: 'String', nullable: false },
      { name: 'description', type: 'String', nullable: true },
      { name: 'createdAt', type: 'DateTime', nullable: false },
      { name: 'updatedAt', type: 'DateTime', nullable: false },
    ],
  },
  Team: {
    model: prisma.team,
    columns: [
      { name: 'id', type: 'String', nullable: false },
      { name: 'name', type: 'String', nullable: false },
      { name: 'description', type: 'String', nullable: true },
      { name: 'workflowId', type: 'String', nullable: true },
      { name: 'isActive', type: 'Boolean', nullable: false },
      { name: 'createdAt', type: 'DateTime', nullable: false },
      { name: 'updatedAt', type: 'DateTime', nullable: false },
    ],
  },
  TeamMember: {
    model: prisma.teamMember,
    columns: [
      { name: 'id', type: 'String', nullable: false },
      { name: 'teamId', type: 'String', nullable: false },
      { name: 'agentId', type: 'String', nullable: false },
      { name: 'role', type: 'String', nullable: false },
      { name: 'order', type: 'Int', nullable: false },
      { name: 'canReview', type: 'Boolean', nullable: false },
      { name: 'canAssign', type: 'Boolean', nullable: false },
    ],
  },
  Agent: {
    model: prisma.agent,
    columns: [
      { name: 'id', type: 'String', nullable: false },
      { name: 'name', type: 'String', nullable: false },
      { name: 'role', type: 'String', nullable: false },
      { name: 'specialization', type: 'String', nullable: true },
      { name: 'description', type: 'String', nullable: true },
      { name: 'avatar', type: 'String', nullable: true },
      { name: 'isDefault', type: 'Boolean', nullable: false },
      { name: 'createdAt', type: 'DateTime', nullable: false },
      { name: 'updatedAt', type: 'DateTime', nullable: false },
    ],
  },
  Workflow: {
    model: prisma.workflow,
    columns: [
      { name: 'id', type: 'String', nullable: false },
      { name: 'name', type: 'String', nullable: false },
      { name: 'description', type: 'String', nullable: true },
      { name: 'isDefault', type: 'Boolean', nullable: false },
      { name: 'createdAt', type: 'DateTime', nullable: false },
      { name: 'updatedAt', type: 'DateTime', nullable: false },
    ],
  },
  Ticket: {
    model: prisma.ticket,
    columns: [
      { name: 'id', type: 'String', nullable: false },
      { name: 'projectId', type: 'String', nullable: false },
      { name: 'number', type: 'Int', nullable: false },
      { name: 'title', type: 'String', nullable: false },
      { name: 'description', type: 'String', nullable: true },
      { name: 'status', type: 'String', nullable: false },
      { name: 'priority', type: 'String', nullable: false },
      { name: 'teamId', type: 'String', nullable: true },
      { name: 'assignedToId', type: 'String', nullable: true },
      { name: 'createdAt', type: 'DateTime', nullable: false },
      { name: 'updatedAt', type: 'DateTime', nullable: false },
    ],
  },
  KnowledgeDocument: {
    model: prisma.knowledgeDocument,
    columns: [
      { name: 'id', type: 'String', nullable: false },
      { name: 'title', type: 'String', nullable: false },
      { name: 'content', type: 'String', nullable: false },
      { name: 'type', type: 'String', nullable: false },
      { name: 'category', type: 'String', nullable: true },
      { name: 'tags', type: 'String[]', nullable: false },
      { name: 'ticketId', type: 'String', nullable: true },
      { name: 'projectId', type: 'String', nullable: true },
      { name: 'status', type: 'String', nullable: false },
      { name: 'createdAt', type: 'DateTime', nullable: false },
      { name: 'updatedAt', type: 'DateTime', nullable: false },
    ],
  },
};

// GET - Fetch data from a specific table
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const projectName = searchParams.get('projectName');
    const skip = (page - 1) * pageSize;

    const metadata = tableMetadata[table];
    if (!metadata) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Build query filter for project-specific data
    let whereClause: any = {};
    
    if (projectName) {
      // Get project ID from project name
      const project = await prisma.project.findUnique({
        where: { name: projectName },
        select: { id: true },
      });

      if (project) {
        // Filter by projectId for tables that have it
        if (table === 'Ticket' || table === 'KnowledgeDocument') {
          whereClause.projectId = project.id;
        } else if (table === 'Team') {
          // Team has optional projectId
          whereClause.projectId = project.id;
        }
      }
    }

    const [data, total] = await Promise.all([
      metadata.model.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      metadata.model.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      columns: metadata.columns,
      data,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table data' },
      { status: 500 }
    );
  }
}
