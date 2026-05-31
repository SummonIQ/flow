import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  migrateKnowledgeProjectId,
  resolveProjectIdentity,
} from '@/lib/knowledge/project-identity';
import {
  KNOWLEDGE_STATUS_VALUES,
  migrateKnowledgeStatuses,
  normalizeKnowledgeStatus,
} from '@/lib/knowledge/status';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';

const statusSchema = z
  .preprocess(
    value => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.enum(KNOWLEDGE_STATUS_VALUES),
  )
  .optional();

const createKnowledgeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  ticketId: z.string().optional(),
  createdById: z.string().optional(),
  status: statusSchema,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectParam = searchParams.get('projectId')?.trim() || undefined;
    const statusParam = searchParams.get('status');
    const status = normalizeKnowledgeStatus(statusParam);
    const category = searchParams.get('category')?.trim();
    const type = searchParams.get('type')?.trim();

    const where: Prisma.KnowledgeDocumentWhereInput = {};

    if (statusParam && !status) {
      return NextResponse.json(
        { error: 'Invalid status filter' },
        { status: 400 },
      );
    }

    if (projectParam) {
      const project = await resolveProjectIdentity(projectParam);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 },
        );
      }

      await migrateKnowledgeProjectId(project);
      await migrateKnowledgeStatuses(project.id);
      where.projectId = project.id;
    } else {
      await migrateKnowledgeStatuses();
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    const documents = await prisma.knowledgeDocument.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching knowledge documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createKnowledgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const projectParam = parsed.data.projectId?.trim();
    const project = await resolveProjectIdentity(projectParam);
    if (projectParam && !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    if (project) {
      await migrateKnowledgeProjectId(project);
      await migrateKnowledgeStatuses(project.id);
    }

    const document = await prisma.knowledgeDocument.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        type: parsed.data.type || 'article',
        category: parsed.data.category,
        tags: parsed.data.tags || [],
        projectId: project?.id,
        ticketId: parsed.data.ticketId,
        createdById: parsed.data.createdById,
        status: parsed.data.status || 'draft',
      },
    });

    // Queue embedding for the new document
    await ragEmbeddingService.onCreated('KnowledgeDocument', document.id);

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error creating knowledge document:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge document' },
      { status: 500 }
    );
  }
}
