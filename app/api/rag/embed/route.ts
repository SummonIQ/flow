/**
 * RAG Embed API Endpoint
 *
 * POST /api/rag/embed
 * Creates embeddings for a source document
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { createEmbeddingVectors } from '@/lib/openai/embeddings';
import type { EmbeddingSourceType } from '@prisma/client';
import crypto from 'crypto';

interface EmbedRequest {
  sourceType: EmbeddingSourceType;
  sourceId: string;
  content: string;
  metadata?: {
    projectId?: string;
    category?: string;
    importance?: number;
    title?: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

// Configuration
const CHUNK_SIZE = parseInt(process.env.RAG_CHUNK_SIZE || '1000', 10);
const CHUNK_OVERLAP = parseInt(process.env.RAG_CHUNK_OVERLAP || '200', 10);
const BATCH_SIZE = parseInt(process.env.RAG_BATCH_SIZE || '100', 10);

function validateRequest(body: unknown): body is EmbedRequest {
  if (!body || typeof body !== 'object') return false;
  const req = body as Record<string, unknown>;
  if (typeof req.sourceType !== 'string') return false;
  if (typeof req.sourceId !== 'string') return false;
  if (typeof req.content !== 'string' || req.content.trim().length === 0) return false;
  return true;
}

// Split content into overlapping chunks
function chunkContent(content: string): string[] {
  const chunks: string[] = [];
  const paragraphs = content.split(/\n\n+/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Keep overlap from end of previous chunk
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(CHUNK_OVERLAP / 5));
      currentChunk = overlapWords.join(' ') + '\n\n' + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [content];
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request. sourceType, sourceId, and content are required.' },
        { status: 400 }
      );
    }

    const { sourceType, sourceId, content, metadata = {} } = body;

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 }
      );
    }

    // Check for existing embeddings with same content hash
    const contentHash = hashContent(content);
    const existing = await prisma.embedding.findFirst({
      where: {
        sourceType,
        sourceId,
        contentHash,
      },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Content already embedded',
        embeddingId: existing.id,
        cached: true,
      });
    }

    // Delete any existing embeddings for this source
    await prisma.embedding.deleteMany({
      where: {
        sourceType,
        sourceId,
      },
    });

    // Chunk the content
    const chunks = chunkContent(content);

    // Generate embeddings in batches
    const embeddingIds: string[] = [];
    const startTime = Date.now();

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);

      let embeddings: number[][];
      try {
        embeddings = await createEmbeddingVectors(batchChunks);
      } catch (error) {
        console.error('OpenAI embedding error:', error);
        return NextResponse.json(
          { error: 'Failed to generate embeddings' },
          { status: 500 }
        );
      }

      // Store embeddings
      for (let j = 0; j < batchChunks.length; j++) {
        const chunkIndex = i + j;
        const vector = embeddings[j];

        // Use raw SQL to insert with vector column
        const result = await prisma.$queryRaw<{ id: string }[]>`
          INSERT INTO embeddings (
            id, "sourceType", "sourceId", "chunkIndex",
            "contentText", "contentHash", embedding,
            "projectId", category, importance, metadata,
            "createdAt", "updatedAt"
          ) VALUES (
            ${crypto.randomUUID()},
            ${sourceType}::"EmbeddingSourceType",
            ${sourceId},
            ${chunkIndex},
            ${batchChunks[j]},
            ${contentHash},
            ${`[${vector.join(',')}]`}::vector,
            ${metadata.projectId || null},
            ${metadata.category || null},
            ${metadata.importance || 5},
            ${JSON.stringify(metadata)}::jsonb,
            NOW(),
            NOW()
          )
          RETURNING id
        `;

        embeddingIds.push(result[0].id);
      }
    }

    const processingTimeMs = Date.now() - startTime;

    return NextResponse.json({
      message: 'Content embedded successfully',
      sourceType,
      sourceId,
      chunkCount: chunks.length,
      embeddingIds,
      processingTimeMs,
    });
  } catch (error) {
    console.error('RAG embed error:', error);
    return NextResponse.json(
      { error: 'Failed to create embeddings' },
      { status: 500 }
    );
  }
}

// DELETE /api/rag/embed - Remove embeddings for a source
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get('sourceType') as EmbeddingSourceType;
    const sourceId = searchParams.get('sourceId');

    if (!sourceType || !sourceId) {
      return NextResponse.json(
        { error: 'sourceType and sourceId are required' },
        { status: 400 }
      );
    }

    const deleted = await prisma.embedding.deleteMany({
      where: {
        sourceType,
        sourceId,
      },
    });

    return NextResponse.json({
      message: 'Embeddings deleted',
      count: deleted.count,
    });
  } catch (error) {
    console.error('RAG delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete embeddings' },
      { status: 500 }
    );
  }
}
