import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';

export const KNOWLEDGE_STATUS_VALUES = ['draft', 'published'] as const;

export type KnowledgeStatus = (typeof KNOWLEDGE_STATUS_VALUES)[number];

export function normalizeKnowledgeStatus(
  value?: string | null,
): KnowledgeStatus | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'draft' || normalized === 'published') {
    return normalized;
  }
  return null;
}

export async function migrateKnowledgeStatuses(
  projectId?: string,
): Promise<number> {
  const where = {
    ...(projectId ? { projectId } : {}),
    status: { in: ['PUBLISHED', 'DRAFT', 'Published', 'Draft'] },
  };

  const candidates = await prisma.knowledgeDocument.findMany({
    where,
    select: { id: true, status: true },
  });

  if (candidates.length === 0) {
    return 0;
  }

  await Promise.all(
    candidates.map(async doc => {
      const normalized = normalizeKnowledgeStatus(doc.status) || 'draft';
      await prisma.knowledgeDocument.update({
        where: { id: doc.id },
        data: { status: normalized },
      });
      await ragEmbeddingService.onUpdated('KnowledgeDocument', doc.id, [
        'status',
      ]);
    }),
  );

  return candidates.length;
}
