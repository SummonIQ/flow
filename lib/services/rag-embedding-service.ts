/**
 * RAG Embedding Service
 *
 * Provides a centralized service for wiring embedding hooks into CRUD flows.
 * Respects RAG_ENABLED and RAG_AUTO_INDEX environment variables.
 */

import { prisma } from '@/lib/db/prisma';
import { embeddingHooks, type EmbeddingHooksOptions } from '@/lib/rag/embedding-hooks';

/**
 * Check if RAG features are enabled
 */
export function isRagEnabled(): boolean {
  return process.env.RAG_ENABLED === 'true';
}

/**
 * Check if auto-indexing is enabled
 */
export function isAutoIndexEnabled(): boolean {
  return process.env.RAG_AUTO_INDEX === 'true';
}

/**
 * Embeddable model types
 */
export type EmbeddableModel =
  | 'ProjectMemory'
  | 'KnowledgeDocument'
  | 'AgentMemory'
  | 'BestPractice'
  | 'Component'
  | 'ConfigTemplate'
  | 'Ticket';

/**
 * RAG Embedding Service - wraps embedding hooks with config checks
 */
export const ragEmbeddingService = {
  /**
   * Queue embedding for a newly created item
   * No-op if RAG is disabled or auto-indexing is off
   */
  async onCreated(
    model: EmbeddableModel,
    id: string,
    options?: Partial<EmbeddingHooksOptions>,
  ): Promise<void> {
    if (!isRagEnabled() || !isAutoIndexEnabled()) {
      return;
    }

    try {
      await embeddingHooks.onCreated(prisma, model, id, {
        autoIndex: true,
        ...options,
      });
    } catch (error) {
      // Log but don't throw - embedding failures shouldn't break CRUD
      console.error(
        `[RAG] Failed to queue embedding for ${model}:${id}`,
        error,
      );
    }
  },

  /**
   * Mark content as stale when updated (will be re-embedded)
   * No-op if RAG is disabled or auto-indexing is off
   */
  async onUpdated(
    model: EmbeddableModel,
    id: string,
    changedFields: string[],
    options?: Partial<EmbeddingHooksOptions>,
  ): Promise<void> {
    if (!isRagEnabled() || !isAutoIndexEnabled()) {
      return;
    }

    try {
      await embeddingHooks.onUpdated(prisma, model, id, changedFields, {
        markStaleOnUpdate: true,
        ...options,
      });
    } catch (error) {
      console.error(`[RAG] Failed to mark stale for ${model}:${id}`, error);
    }
  },

  /**
   * Delete embeddings when source content is deleted
   * Runs even if auto-indexing is off (cleanup is always safe)
   */
  async onDeleted(
    model: EmbeddableModel,
    id: string,
    options?: Partial<EmbeddingHooksOptions>,
  ): Promise<void> {
    if (!isRagEnabled()) {
      return;
    }

    try {
      await embeddingHooks.onDeleted(prisma, model, id, {
        deleteOnSourceDelete: true,
        ...options,
      });
    } catch (error) {
      console.error(
        `[RAG] Failed to delete embeddings for ${model}:${id}`,
        error,
      );
    }
  },

  /**
   * Get the list of fields that trigger re-embedding for each model
   */
  getContentFields(model: EmbeddableModel): string[] {
    const fields: Record<EmbeddableModel, string[]> = {
      ProjectMemory: ['content', 'category', 'tags', 'title'],
      KnowledgeDocument: ['title', 'content', 'category', 'tags'],
      AgentMemory: ['key', 'value', 'context', 'type', 'scope', 'scopeId'],
      BestPractice: ['title', 'description', 'content', 'examples', 'tags'],
      Component: ['name', 'description', 'code', 'usage', 'props', 'category'],
      ConfigTemplate: ['name', 'description', 'content', 'rawContent'],
      Ticket: ['title', 'description'],
    };
    return fields[model];
  },

  /**
   * Helper to detect which content fields changed in an update
   */
  detectChangedContentFields(
    model: EmbeddableModel,
    updateData: Record<string, unknown>,
  ): string[] {
    const contentFields = this.getContentFields(model);
    return Object.keys(updateData).filter(key => contentFields.includes(key));
  },
};

export default ragEmbeddingService;
