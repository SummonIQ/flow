/**
 * Embedding hooks for Flow RAG models.
 */

import type { PrismaClient } from '@prisma/client';
import type { EmbeddingSourceType, EmbeddingStatus } from '@summoniq/rag';

const EMBEDDABLE_MODELS = [
  'ProjectMemory',
  'KnowledgeDocument',
  'AgentMemory',
  'BestPractice',
  'Component',
  'ConfigTemplate',
  'Ticket',
] as const;

type EmbeddableModel = (typeof EMBEDDABLE_MODELS)[number];

const MODEL_TO_SOURCE_TYPE: Record<EmbeddableModel, EmbeddingSourceType> = {
  ProjectMemory: 'PROJECT_MEMORY',
  KnowledgeDocument: 'KNOWLEDGE_DOCUMENT',
  AgentMemory: 'AGENT_MEMORY',
  BestPractice: 'BEST_PRACTICE',
  Component: 'COMPONENT',
  ConfigTemplate: 'CONFIG_TEMPLATE',
  Ticket: 'TICKET',
};

const CONTENT_FIELDS: Record<EmbeddableModel, string[]> = {
  ProjectMemory: ['title', 'content', 'category', 'tags'],
  KnowledgeDocument: ['title', 'content', 'category', 'tags'],
  AgentMemory: ['key', 'value', 'context', 'type', 'scope', 'scopeId'],
  BestPractice: ['title', 'description', 'content', 'examples', 'tags'],
  Component: ['name', 'description', 'code', 'usage', 'props', 'category'],
  ConfigTemplate: ['name', 'description', 'content', 'rawContent'],
  Ticket: ['title', 'description'],
};

export interface EmbeddingHooksOptions {
  autoIndex?: boolean;
  markStaleOnUpdate?: boolean;
  deleteOnSourceDelete?: boolean;
}

const updateEmbeddingStatus = async (
  prisma: PrismaClient,
  model: EmbeddableModel,
  id: string,
  status: EmbeddingStatus,
): Promise<void> => {
  const data = { embeddingStatus: status };
  switch (model) {
    case 'ProjectMemory':
      await prisma.projectMemory.update({ where: { id }, data });
      break;
    case 'KnowledgeDocument':
      await prisma.knowledgeDocument.update({ where: { id }, data });
      break;
    case 'AgentMemory':
      await prisma.agentMemory.update({ where: { id }, data });
      break;
    case 'BestPractice':
      await prisma.bestPractice.update({ where: { id }, data });
      break;
    case 'Component':
      await prisma.component.update({ where: { id }, data });
      break;
    case 'ConfigTemplate':
      await prisma.configTemplate.update({ where: { id }, data });
      break;
    case 'Ticket':
      await prisma.ticket.update({ where: { id }, data });
      break;
  }
};

export async function onContentCreated(
  prisma: PrismaClient,
  model: EmbeddableModel,
  id: string,
  options: EmbeddingHooksOptions = {},
): Promise<void> {
  const { autoIndex = true } = options;
  if (!autoIndex) return;
  if (!EMBEDDABLE_MODELS.includes(model)) return;

  const sourceType = MODEL_TO_SOURCE_TYPE[model];

  await prisma.embeddingJob.create({
    data: {
      sourceType,
      sourceId: id,
      status: 'PENDING',
    },
  });
}

export async function onContentUpdated(
  prisma: PrismaClient,
  model: EmbeddableModel,
  id: string,
  changedFields: string[],
  options: EmbeddingHooksOptions = {},
): Promise<void> {
  const { markStaleOnUpdate = true } = options;
  if (!markStaleOnUpdate) return;
  if (!EMBEDDABLE_MODELS.includes(model)) return;

  const contentFields = CONTENT_FIELDS[model];
  const hasContentChange = changedFields.some((field) => contentFields.includes(field));
  if (!hasContentChange) return;

  const sourceType = MODEL_TO_SOURCE_TYPE[model];

  await updateEmbeddingStatus(prisma, model, id, 'STALE');
  await prisma.embeddingJob.create({
    data: {
      sourceType,
      sourceId: id,
      status: 'PENDING',
    },
  });
}

export async function onContentDeleted(
  prisma: PrismaClient,
  model: EmbeddableModel,
  id: string,
  options: EmbeddingHooksOptions = {},
): Promise<void> {
  const { deleteOnSourceDelete = true } = options;
  if (!deleteOnSourceDelete) return;
  if (!EMBEDDABLE_MODELS.includes(model)) return;

  const sourceType = MODEL_TO_SOURCE_TYPE[model];

  await prisma.embedding.deleteMany({
    where: {
      sourceType,
      sourceId: id,
    },
  });

  await prisma.embeddingJob.deleteMany({
    where: {
      sourceType,
      sourceId: id,
    },
  });
}

export const embeddingHooks = {
  onCreated: onContentCreated,
  onUpdated: onContentUpdated,
  onDeleted: onContentDeleted,
};
