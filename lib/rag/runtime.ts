/**
 * RAG runtime wiring for Flow.
 */

import { createPrismaRagStore } from '@summoniq/rag';
import { prisma } from '@/lib/db/prisma';
import { createSummonIqContentResolver, SUMMONIQ_SOURCE_TYPES } from './content-resolver';

export async function createRagRuntime() {
  return {
    store: createPrismaRagStore(prisma),
    contentResolver: createSummonIqContentResolver(prisma),
    sourceTypes: [...SUMMONIQ_SOURCE_TYPES],
  };
}
