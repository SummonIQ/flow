/**
 * RAG Reindex API Endpoint
 *
 * POST /api/rag/reindex - Trigger reindexing of content
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { EmbeddingSourceType, EmbeddingStatus } from '@prisma/client';

type EmbeddableModel =
  | 'ProjectMemory'
  | 'KnowledgeDocument'
  | 'AgentMemory'
  | 'BestPractice'
  | 'Component'
  | 'ConfigTemplate'
  | 'Ticket';

const MODEL_TO_SOURCE_TYPE: Record<EmbeddableModel, EmbeddingSourceType> = {
  ProjectMemory: 'PROJECT_MEMORY',
  KnowledgeDocument: 'KNOWLEDGE_DOCUMENT',
  AgentMemory: 'AGENT_MEMORY',
  BestPractice: 'BEST_PRACTICE',
  Component: 'COMPONENT',
  ConfigTemplate: 'CONFIG_TEMPLATE',
  Ticket: 'TICKET',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sourceType,
      projectId,
      mode = 'stale', // 'stale' | 'pending' | 'all'
      dryRun = false,
    } = body;

    // Validate RAG is enabled
    if (process.env.RAG_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'RAG is not enabled. Set RAG_ENABLED=true in environment.' },
        { status: 400 }
      );
    }

    // Build the status filter based on mode
    let statusFilter: EmbeddingStatus[] = [];
    switch (mode) {
      case 'stale':
        statusFilter = ['STALE'];
        break;
      case 'pending':
        statusFilter = ['PENDING'];
        break;
      case 'all':
        statusFilter = ['PENDING', 'STALE', 'FAILED'];
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid mode. Use "stale", "pending", or "all"' },
          { status: 400 }
        );
    }

    const results: {
      sourceType: string;
      count: number;
      items?: { id: string; title?: string }[];
    }[] = [];

    // If sourceType specified, only process that type
    const modelsToProcess = sourceType
      ? [sourceType as EmbeddableModel]
      : (Object.keys(MODEL_TO_SOURCE_TYPE) as EmbeddableModel[]);

    for (const model of modelsToProcess) {
      const sourceTypeEnum = MODEL_TO_SOURCE_TYPE[model];
      if (!sourceTypeEnum) continue;

      const modelLower = model.charAt(0).toLowerCase() + model.slice(1);
      const prismaModel = (prisma as Record<string, any>)[modelLower];

      if (!prismaModel) continue;

      // Build where clause
      const where: Record<string, unknown> = {
        embeddingStatus: { in: statusFilter },
      };

      // Add projectId filter for models that support it
      if (projectId && ['ProjectMemory', 'KnowledgeDocument', 'Ticket'].includes(model)) {
        where.projectId = projectId;
      }

      // Count items to reindex
      const count = await prismaModel.count({ where });

      if (count === 0) {
        results.push({ sourceType: model, count: 0 });
        continue;
      }

      if (dryRun) {
        // Just return counts for dry run
        const items = await prismaModel.findMany({
          where,
          take: 10,
          select: { id: true, title: true, name: true },
        });
        results.push({
          sourceType: model,
          count,
          items: items.map((item: { id: string; title?: string; name?: string }) => ({
            id: item.id,
            title: item.title || item.name,
          })),
        });
        continue;
      }

      // Create embedding jobs for all matching items
      const items = await prismaModel.findMany({
        where,
        select: { id: true },
      });

      // Batch create embedding jobs
      const jobsToCreate = items.map((item: { id: string }) => ({
        sourceType: sourceTypeEnum,
        sourceId: item.id,
        status: 'PENDING' as const,
      }));

      // Use createMany with skipDuplicates to avoid conflicts
      await prisma.embeddingJob.createMany({
        data: jobsToCreate,
        skipDuplicates: true,
      });

      // Mark items as PENDING (will be updated to PROCESSING when job runs)
      await prismaModel.updateMany({
        where: { id: { in: items.map((i: { id: string }) => i.id) } },
        data: { embeddingStatus: 'PENDING' as EmbeddingStatus },
      });

      results.push({ sourceType: model, count });
    }

    const totalCount = results.reduce((sum, r) => sum + r.count, 0);

    return NextResponse.json({
      message: dryRun
        ? `Dry run: Would reindex ${totalCount} items`
        : `Queued ${totalCount} items for reindexing`,
      dryRun,
      mode,
      projectId: projectId || null,
      results,
      totalCount,
    });
  } catch (error) {
    console.error('Failed to trigger reindex:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger reindex',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check reindex status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    // Get counts of items in each embedding status
    const statusCounts: Record<string, Record<string, number>> = {};

    const models: EmbeddableModel[] = [
      'ProjectMemory',
      'KnowledgeDocument',
      'AgentMemory',
      'BestPractice',
      'Component',
      'ConfigTemplate',
      'Ticket',
    ];

    for (const model of models) {
      const modelLower = model.charAt(0).toLowerCase() + model.slice(1);
      const prismaModel = (prisma as Record<string, any>)[modelLower];

      if (!prismaModel) continue;

      const baseWhere: Record<string, unknown> = {};
      if (projectId && ['ProjectMemory', 'KnowledgeDocument', 'Ticket'].includes(model)) {
        baseWhere.projectId = projectId;
      }

      const [pending, processing, completed, failed, stale] = await Promise.all([
        prismaModel.count({ where: { ...baseWhere, embeddingStatus: 'PENDING' } }),
        prismaModel.count({ where: { ...baseWhere, embeddingStatus: 'PROCESSING' } }),
        prismaModel.count({ where: { ...baseWhere, embeddingStatus: 'COMPLETED' } }),
        prismaModel.count({ where: { ...baseWhere, embeddingStatus: 'FAILED' } }),
        prismaModel.count({ where: { ...baseWhere, embeddingStatus: 'STALE' } }),
      ]);

      statusCounts[model] = { pending, processing, completed, failed, stale };
    }

    // Get job queue stats
    const jobStats = await prisma.embeddingJob.groupBy({
      by: ['status', 'sourceType'],
      _count: true,
    });

    return NextResponse.json({
      statusCounts,
      jobQueue: jobStats.map((s) => ({
        status: s.status,
        sourceType: s.sourceType,
        count: s._count,
      })),
      projectId: projectId || null,
    });
  } catch (error) {
    console.error('Failed to get reindex status:', error);
    return NextResponse.json(
      { error: 'Failed to get reindex status' },
      { status: 500 }
    );
  }
}
