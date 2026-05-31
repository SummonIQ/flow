/**
 * SummonIQ content resolver for Flow.
 */

import type { PrismaClient } from '@prisma/client';
import type { EmbeddingSourceType, EmbeddingStatus, RagContentResolver } from '@summoniq/rag';
import {
  AgentMemoryExtractor,
  BestPracticeExtractor,
  ComponentExtractor,
  ConfigTemplateExtractor,
  KnowledgeDocumentExtractor,
  ProjectMemoryExtractor,
  TicketExtractor,
} from './extractors';

export const SUMMONIQ_SOURCE_TYPES = [
  'PROJECT_MEMORY',
  'KNOWLEDGE_DOCUMENT',
  'AGENT_MEMORY',
  'BEST_PRACTICE',
  'COMPONENT',
  'CONFIG_TEMPLATE',
  'TICKET',
  'CODEBASE_FILE',
] as const;

const SOURCE_LABELS: Record<string, string> = {
  PROJECT_MEMORY: 'Memory',
  KNOWLEDGE_DOCUMENT: 'Document',
  AGENT_MEMORY: 'Agent Note',
  BEST_PRACTICE: 'Best Practice',
  COMPONENT: 'Component',
  CONFIG_TEMPLATE: 'Config',
  TICKET: 'Related Ticket',
  CODEBASE_FILE: 'Code',
};

export function createSummonIqContentResolver(prisma: PrismaClient): RagContentResolver {
  return {
    async getContent(sourceType: EmbeddingSourceType, sourceId: string) {
      switch (sourceType) {
        case 'PROJECT_MEMORY': {
          const item = await prisma.projectMemory.findUnique({ where: { id: sourceId } });
          if (!item) return null;
          return new ProjectMemoryExtractor().extract(item);
        }
        case 'KNOWLEDGE_DOCUMENT': {
          const item = await prisma.knowledgeDocument.findUnique({ where: { id: sourceId } });
          if (!item) return null;
          return new KnowledgeDocumentExtractor().extract(item);
        }
        case 'AGENT_MEMORY': {
          const item = await prisma.agentMemory.findUnique({ where: { id: sourceId } });
          if (!item) return null;
          return new AgentMemoryExtractor().extract(item);
        }
        case 'BEST_PRACTICE': {
          const item = await prisma.bestPractice.findUnique({ where: { id: sourceId } });
          if (!item) return null;
          return new BestPracticeExtractor().extract(item);
        }
        case 'COMPONENT': {
          const item = await prisma.component.findUnique({ where: { id: sourceId } });
          if (!item) return null;
          return new ComponentExtractor().extract(item);
        }
        case 'CONFIG_TEMPLATE': {
          const item = await prisma.configTemplate.findUnique({ where: { id: sourceId } });
          if (!item) return null;
          return new ConfigTemplateExtractor().extract(item);
        }
        case 'TICKET': {
          const item = await prisma.ticket.findUnique({ where: { id: sourceId } });
          if (!item) return null;
          return new TicketExtractor().extract(item);
        }
        default:
          return null;
      }
    },
    async getSourceDocument(sourceType: EmbeddingSourceType, sourceId: string) {
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
          return null;
        default:
          return null;
      }
    },
    async listPendingSourceIds(sourceType: EmbeddingSourceType, limit: number) {
      const where = { embeddingStatus: 'PENDING' as const };
      switch (sourceType) {
        case 'PROJECT_MEMORY':
          return prisma.projectMemory.findMany({ where, select: { id: true }, take: limit });
        case 'KNOWLEDGE_DOCUMENT':
          return prisma.knowledgeDocument.findMany({ where, select: { id: true }, take: limit });
        case 'AGENT_MEMORY':
          return prisma.agentMemory.findMany({ where, select: { id: true }, take: limit });
        case 'BEST_PRACTICE':
          return prisma.bestPractice.findMany({ where, select: { id: true }, take: limit });
        case 'COMPONENT':
          return prisma.component.findMany({ where, select: { id: true }, take: limit });
        case 'CONFIG_TEMPLATE':
          return prisma.configTemplate.findMany({ where, select: { id: true }, take: limit });
        case 'TICKET':
          return prisma.ticket.findMany({ where, select: { id: true }, take: limit });
        default:
          return [];
      }
    },
    async updateSourceStatus(
      sourceType: EmbeddingSourceType,
      sourceId: string,
      status: EmbeddingStatus,
    ) {
      const data = {
        embeddingStatus: status,
        embeddedAt: status === 'COMPLETED' ? new Date() : undefined,
      };

      switch (sourceType) {
        case 'PROJECT_MEMORY':
          await prisma.projectMemory.update({ where: { id: sourceId }, data });
          break;
        case 'KNOWLEDGE_DOCUMENT':
          await prisma.knowledgeDocument.update({ where: { id: sourceId }, data });
          break;
        case 'AGENT_MEMORY':
          await prisma.agentMemory.update({ where: { id: sourceId }, data });
          break;
        case 'BEST_PRACTICE':
          await prisma.bestPractice.update({ where: { id: sourceId }, data });
          break;
        case 'COMPONENT':
          await prisma.component.update({ where: { id: sourceId }, data });
          break;
        case 'CONFIG_TEMPLATE':
          await prisma.configTemplate.update({ where: { id: sourceId }, data });
          break;
        case 'TICKET':
          await prisma.ticket.update({ where: { id: sourceId }, data });
          break;
      }
    },
    getSourceLabel(sourceType: EmbeddingSourceType) {
      return SOURCE_LABELS[sourceType] ?? sourceType;
    },
  };
}
