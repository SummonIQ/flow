#!/usr/bin/env bun
/**
 * Index All Content (Flow)
 */

import { EmbeddingWorker, createPrismaRagStore } from '@summoniq/rag';
import { prisma } from '@/lib/db/prisma';
import { createSummonIqContentResolver, SUMMONIQ_SOURCE_TYPES } from '@/lib/rag/content-resolver';

const sourceTypes = SUMMONIQ_SOURCE_TYPES.filter((type) => type !== 'CODEBASE_FILE');

async function main() {
  console.log('Starting full content indexing...\n');

  const store = createPrismaRagStore(prisma);
  const contentResolver = createSummonIqContentResolver(prisma);
  const worker = new EmbeddingWorker(store, contentResolver);

  const summary: Record<string, { processed: number; failed: number }> = {};

  for (const sourceType of sourceTypes) {
    console.log(`\n📦 Indexing ${sourceType}...`);

    const results = await worker.processAllPending(sourceType, {
      batchSize: 50,
      continueOnError: true,
    });

    const processed = results.filter((r) => r.status === 'completed').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    summary[sourceType] = { processed, failed };

    console.log(`   ✅ Processed: ${processed}, ❌ Failed: ${failed}`);
  }

  console.log('\n\n📊 Indexing Summary:');
  console.log('═'.repeat(50));

  let totalProcessed = 0;
  let totalFailed = 0;

  for (const [type, stats] of Object.entries(summary)) {
    console.log(`${type.padEnd(25)} ${stats.processed} processed, ${stats.failed} failed`);
    totalProcessed += stats.processed;
    totalFailed += stats.failed;
  }

  console.log('═'.repeat(50));
  console.log(`TOTAL${' '.repeat(20)} ${totalProcessed} processed, ${totalFailed} failed`);

  const stats = await worker.getStats();
  console.log(`\n📈 Queue Status: ${stats.pending} pending, ${stats.completed} completed, ${stats.failed} failed`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('Indexing failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
