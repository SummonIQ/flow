/**
 * RAG Context API Endpoint
 *
 * POST /api/rag/context
 * Retrieves relevant context for a task or query
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { createEmbeddingVector } from '@/lib/openai/embeddings';
import type { EmbeddingSourceType } from '@prisma/client';

interface ContextRequest {
  taskDescription: string;
  projectId?: string;
  maxTokens?: number;
  sourceTypes?: EmbeddingSourceType[];
}

interface ContextResult {
  content: string;
  sources: Array<{
    id: string;
    sourceType: EmbeddingSourceType;
    sourceId: string;
    title?: string;
    score: number;
  }>;
  tokenEstimate: number;
}

// Rough token estimation (4 chars per token average)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function validateRequest(body: unknown): body is ContextRequest {
  if (!body || typeof body !== 'object') return false;
  const req = body as Record<string, unknown>;
  if (typeof req.taskDescription !== 'string' || req.taskDescription.trim().length === 0) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request. taskDescription is required.' },
        { status: 400 }
      );
    }

    const {
      taskDescription,
      projectId,
      maxTokens = 4000,
      sourceTypes,
    } = body;

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 }
      );
    }

    // Generate embedding for the task description
    let queryVector: number[];
    try {
      queryVector = await createEmbeddingVector(taskDescription);
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      return NextResponse.json(
        { error: 'Failed to generate query embedding' },
        { status: 500 }
      );
    }

    // Build filter conditions
    const filterConditions: string[] = [];
    const filterParams: unknown[] = [];
    let paramIndex = 2;

    if (projectId) {
      filterConditions.push(`"projectId" = $${paramIndex}`);
      filterParams.push(projectId);
      paramIndex++;
    }

    if (sourceTypes && sourceTypes.length > 0) {
      filterConditions.push(`"sourceType"::text = ANY($${paramIndex})`);
      filterParams.push(sourceTypes);
      paramIndex++;
    }

    const whereClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

    // Fetch more results than needed to account for deduplication
    const results = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        sourceType: EmbeddingSourceType;
        sourceId: string;
        contentText: string;
        score: number;
        metadata: Record<string, unknown>;
      }>
    >(
      `
      SELECT
        id,
        "sourceType",
        "sourceId",
        "contentText",
        1 - (embedding <=> $1::vector) as score,
        metadata
      FROM embeddings
      ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT 50
      `,
      `[${queryVector.join(',')}]`,
      ...filterParams
    );

    // Build context within token limit
    const contextParts: string[] = [];
    const sources: ContextResult['sources'] = [];
    const seenSources = new Set<string>();
    let currentTokens = 0;

    for (const result of results) {
      const sourceKey = `${result.sourceType}:${result.sourceId}`;
      if (seenSources.has(sourceKey)) continue;

      const textTokens = estimateTokens(result.contentText);
      if (currentTokens + textTokens > maxTokens) break;

      seenSources.add(sourceKey);
      currentTokens += textTokens;

      const title = result.metadata?.title as string | undefined;
      const sourceLabel = `[${result.sourceType}${title ? `: ${title}` : ''}]`;

      contextParts.push(`${sourceLabel}\n${result.contentText}`);
      sources.push({
        id: result.id,
        sourceType: result.sourceType,
        sourceId: result.sourceId,
        title,
        score: result.score,
      });
    }

    const contextContent = contextParts.join('\n\n---\n\n');

    return NextResponse.json({
      content: contextContent,
      sources,
      tokenEstimate: currentTokens,
      totalSourcesFound: results.length,
      sourcesIncluded: sources.length,
    });
  } catch (error) {
    console.error('RAG context error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve context' },
      { status: 500 }
    );
  }
}
