/**
 * RAG Status API Endpoint
 *
 * GET /api/rag/status
 * Returns the status of the RAG system
 * NOTE: Flow doesn't have RAG models - this returns a disabled status
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Flow doesn't have RAG models - return disabled status
  return NextResponse.json({
    status: 'disabled',
    message: 'RAG is not available in Flow',
    pgvector: { available: false },
    config: { ragEnabled: false },
    embeddings: { total: 0, bySourceType: [] },
    jobs: { pending: 0, processing: 0, failed: 0 },
    pendingItems: { total: 0 },
    cache: { entries: 0 },
  });
}
