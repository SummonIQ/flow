/**
 * RAG Jobs API Endpoint
 *
 * GET /api/rag/jobs - List embedding jobs with filtering
 * POST /api/rag/jobs - Trigger processing of pending jobs
 * DELETE /api/rag/jobs - Clear failed jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { EmbeddingSourceType, EmbeddingJobStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as EmbeddingJobStatus | null;
    const sourceType = searchParams.get('sourceType') as EmbeddingSourceType | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: {
      status?: EmbeddingJobStatus;
      sourceType?: EmbeddingSourceType;
    } = {};

    if (status) {
      where.status = status;
    }

    if (sourceType) {
      where.sourceType = sourceType;
    }

    const [jobs, total] = await Promise.all([
      prisma.embeddingJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.embeddingJob.count({ where }),
    ]);

    // Get summary stats
    const stats = await prisma.embeddingJob.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + jobs.length < total,
      },
      stats: stats.reduce(
        (acc, s) => ({ ...acc, [s.status.toLowerCase()]: s._count }),
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    console.error('Failed to list embedding jobs:', error);
    return NextResponse.json(
      { error: 'Failed to list embedding jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sourceType, limit = 10 } = body;

    if (action === 'process') {
      // Get pending jobs to process
      const where: { status: EmbeddingJobStatus; sourceType?: EmbeddingSourceType } = {
        status: 'PENDING',
      };

      if (sourceType) {
        where.sourceType = sourceType;
      }

      const pendingJobs = await prisma.embeddingJob.findMany({
        where,
        take: Math.min(limit, 50), // Cap at 50 to prevent overload
        orderBy: { createdAt: 'asc' },
      });

      if (pendingJobs.length === 0) {
        return NextResponse.json({
          message: 'No pending jobs to process',
          processed: 0,
        });
      }

      // Mark jobs as processing
      await prisma.embeddingJob.updateMany({
        where: {
          id: { in: pendingJobs.map((j) => j.id) },
        },
        data: {
          status: 'PROCESSING',
        },
      });

      // Note: Actual embedding processing would happen in a background worker
      // For now, we just mark them as processing and return
      return NextResponse.json({
        message: `Queued ${pendingJobs.length} jobs for processing`,
        processed: pendingJobs.length,
        jobs: pendingJobs.map((j) => ({
          id: j.id,
          sourceType: j.sourceType,
          sourceId: j.sourceId,
        })),
      });
    }

    if (action === 'retry-failed') {
      // Reset failed jobs to pending
      const where: { status: EmbeddingJobStatus; sourceType?: EmbeddingSourceType } = {
        status: 'FAILED',
      };

      if (sourceType) {
        where.sourceType = sourceType;
      }

      const result = await prisma.embeddingJob.updateMany({
        where,
        data: {
          status: 'PENDING',
          errorMessage: null,
          retryCount: 0,
        },
      });

      return NextResponse.json({
        message: `Reset ${result.count} failed jobs to pending`,
        count: result.count,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "process" or "retry-failed"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to process embedding jobs:', error);
    return NextResponse.json(
      { error: 'Failed to process embedding jobs' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as EmbeddingJobStatus | null;
    const sourceType = searchParams.get('sourceType') as EmbeddingSourceType | null;

    const where: {
      status?: EmbeddingJobStatus;
      sourceType?: EmbeddingSourceType;
    } = {};

    // Only allow deleting failed or completed jobs
    if (status && (status === 'FAILED' || status === 'COMPLETED')) {
      where.status = status;
    } else {
      where.status = 'FAILED'; // Default to failed only
    }

    if (sourceType) {
      where.sourceType = sourceType;
    }

    const result = await prisma.embeddingJob.deleteMany({ where });

    return NextResponse.json({
      message: `Deleted ${result.count} jobs`,
      count: result.count,
    });
  } catch (error) {
    console.error('Failed to delete embedding jobs:', error);
    return NextResponse.json(
      { error: 'Failed to delete embedding jobs' },
      { status: 500 }
    );
  }
}
