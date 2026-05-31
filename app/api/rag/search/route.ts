/**
 * RAG Search API Endpoint
 *
 * POST /api/rag/search
 * Performs semantic search across embedded content
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { createEmbeddingVector } from '@/lib/openai/embeddings';
import type { EmbeddingSourceType } from '@prisma/client';

interface SearchRequest {
  query: string;
  filters?: {
    sourceTypes?: EmbeddingSourceType[];
    projectId?: string;
    category?: string;
    minImportance?: number;
  };
  limit?: number;
  includeContent?: boolean;
}

interface SearchResult {
  id: string;
  sourceType: EmbeddingSourceType;
  sourceId: string;
  chunkIndex: number;
  contentText: string;
  score: number;
  metadata: Record<string, unknown>;
}

// Validate request body
function validateRequest(body: unknown): body is SearchRequest {
  if (!body || typeof body !== 'object') return false;
  const req = body as Record<string, unknown>;
  if (typeof req.query !== 'string' || req.query.trim().length === 0) return false;
  if (req.limit !== undefined && (typeof req.limit !== 'number' || req.limit < 1 || req.limit > 100)) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request. Query is required and limit must be 1-100.' },
        { status: 400 }
      );
    }

    const { query, filters = {}, limit = 10, includeContent = false } = body;

    // Check if OpenAI API key is configured
    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 }
      );
    }

    // Generate embedding for the search query
    let queryVector: number[];
    try {
      queryVector = await createEmbeddingVector(query);
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
    let paramIndex = 2; // $1 is the query vector

    if (filters.sourceTypes && filters.sourceTypes.length > 0) {
      filterConditions.push(`"sourceType"::text = ANY($${paramIndex})`);
      filterParams.push(filters.sourceTypes);
      paramIndex++;
    }

    if (filters.projectId) {
      filterConditions.push(`"projectId" = $${paramIndex}`);
      filterParams.push(filters.projectId);
      paramIndex++;
    }

    if (filters.category) {
      filterConditions.push(`"category" = $${paramIndex}`);
      filterParams.push(filters.category);
      paramIndex++;
    }

    if (filters.minImportance !== undefined) {
      filterConditions.push(`"importance" >= $${paramIndex}`);
      filterParams.push(filters.minImportance);
      paramIndex++;
    }

    const whereClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

    // Perform vector similarity search using cosine distance
    const results = await prisma.$queryRawUnsafe<SearchResult[]>(
      `
      SELECT
        id,
        "sourceType",
        "sourceId",
        "chunkIndex",
        "contentText",
        1 - (embedding <=> $1::vector) as score,
        metadata
      FROM embeddings
      ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT ${limit}
      `,
      `[${queryVector.join(',')}]`,
      ...filterParams
    );

    // Optionally fetch full source documents
    let enrichedResults = results;
    if (includeContent && results.length > 0) {
      enrichedResults = await Promise.all(
        results.map(async (result) => {
          const source = await fetchSourceDocument(result.sourceType, result.sourceId);
          return { ...result, source };
        })
      );
    }

    return NextResponse.json({
      results: enrichedResults,
      query,
      count: results.length,
    });
  } catch (error) {
    console.error('RAG search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform semantic search' },
      { status: 500 }
    );
  }
}

// Helper to fetch source documents based on type
async function fetchSourceDocument(
  sourceType: EmbeddingSourceType,
  sourceId: string
): Promise<unknown> {
  switch (sourceType) {
    case 'PROJECT_MEMORY':
      return prisma.projectMemory.findUnique({ where: { id: sourceId } });
    case 'KNOWLEDGE_DOCUMENT':
      return prisma.knowledgeDocument.findUnique({ where: { id: sourceId } });
    case 'AGENT_MEMORY':
      return prisma.agentMemory.findUnique({ where: { id: sourceId } });
    case 'BEST_PRACTICE':
      return prisma.bestPractice.findUnique({ where: { id: sourceId } });
    case 'COMPONENT':
      return prisma.component.findUnique({ where: { id: sourceId } });
    case 'CONFIG_TEMPLATE':
      return prisma.configTemplate.findUnique({ where: { id: sourceId } });
    case 'TICKET':
      return prisma.ticket.findUnique({ where: { id: sourceId } });
    case 'CODEBASE_FILE':
      // Codebase files are stored as metadata, not in a separate table
      return null;
    default:
      return null;
  }
}
