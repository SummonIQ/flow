import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';

type MemoryCategory =
  | 'GENERAL'
  | 'ARCHITECTURE'
  | 'CODEBASE'
  | 'DEPENDENCIES'
  | 'CONFIGURATION'
  | 'DEBUGGING'
  | 'PREFERENCES'
  | 'WORKFLOW'
  | 'API'
  | 'DATABASE';

interface CreateMemoryInput {
  projectId: string;
  title: string;
  content: string;
  category?: MemoryCategory;
  source?: string;
  importance?: number;
  tags?: string[];
}

/**
 * Memory Service - Handles automatic creation and management of project memories
 */
export const memoryService = {
  /**
   * Create a new memory for a project
   */
  async create(input: CreateMemoryInput) {
    const memory = await prisma.projectMemory.create({
      data: {
        projectId: input.projectId,
        title: input.title,
        content: input.content,
        category: input.category || 'GENERAL',
        source: input.source,
        importance: input.importance || 5,
        tags: input.tags || [],
      },
    });

    // Queue embedding for the new memory
    await ragEmbeddingService.onCreated('ProjectMemory', memory.id);

    return memory;
  },

  /**
   * Create memory when a ticket is started (moved to IN_PROGRESS)
   */
  async onTicketStarted(
    projectId: string,
    ticket: {
      id: string;
      number: number;
      title: string;
      description?: string | null;
      acceptanceCriteria?: string | null;
    },
  ) {
    return this.create({
      projectId,
      title: `Started: ${ticket.title}`,
      content: `Ticket #${ticket.number} was started.\n\nDescription: ${ticket.description || 'No description'}\n\nAcceptance Criteria: ${ticket.acceptanceCriteria || 'None specified'}`,
      category: 'WORKFLOW',
      source: `ticket:${ticket.id}`,
      importance: 6,
      tags: ['ticket', 'in-progress', `ticket-${ticket.number}`],
    });
  },

  /**
   * Create memory when a ticket is completed (moved to DONE)
   */
  async onTicketCompleted(
    projectId: string,
    ticket: {
      id: string;
      number: number;
      title: string;
      description?: string | null;
    },
  ) {
    return this.create({
      projectId,
      title: `Completed: ${ticket.title}`,
      content: `Ticket #${ticket.number} was completed.\n\nDescription: ${ticket.description || 'No description'}`,
      category: 'WORKFLOW',
      source: `ticket:${ticket.id}`,
      importance: 7,
      tags: ['ticket', 'completed', `ticket-${ticket.number}`],
    });
  },

  /**
   * Create memory for architecture decisions
   */
  async recordArchitectureDecision(
    projectId: string,
    decision: {
      title: string;
      context: string;
      decision: string;
      consequences?: string;
      source?: string;
    },
  ) {
    return this.create({
      projectId,
      title: `Architecture: ${decision.title}`,
      content: `Context: ${decision.context}\n\nDecision: ${decision.decision}${decision.consequences ? `\n\nConsequences: ${decision.consequences}` : ''}`,
      category: 'ARCHITECTURE',
      source: decision.source,
      importance: 8,
      tags: ['architecture', 'decision'],
    });
  },

  /**
   * Create memory for discovered code patterns
   */
  async recordCodePattern(
    projectId: string,
    pattern: {
      name: string;
      description: string;
      example?: string;
      files?: string[];
    },
  ) {
    return this.create({
      projectId,
      title: `Pattern: ${pattern.name}`,
      content: `${pattern.description}${pattern.example ? `\n\nExample:\n${pattern.example}` : ''}${pattern.files?.length ? `\n\nFound in: ${pattern.files.join(', ')}` : ''}`,
      category: 'CODEBASE',
      source: pattern.files?.[0],
      importance: 6,
      tags: ['pattern', 'code'],
    });
  },

  /**
   * Create memory for configuration discoveries
   */
  async recordConfiguration(
    projectId: string,
    config: {
      name: string;
      description: string;
      file: string;
      key?: string;
    },
  ) {
    return this.create({
      projectId,
      title: `Config: ${config.name}`,
      content: config.description,
      category: 'CONFIGURATION',
      source: config.file,
      importance: 5,
      tags: ['config', config.key || config.name.toLowerCase()],
    });
  },

  /**
   * Create memory for debugging insights
   */
  async recordDebuggingInsight(
    projectId: string,
    insight: {
      issue: string;
      solution: string;
      context?: string;
      source?: string;
    },
  ) {
    return this.create({
      projectId,
      title: `Debug: ${insight.issue}`,
      content: `Issue: ${insight.issue}\n\nSolution: ${insight.solution}${insight.context ? `\n\nContext: ${insight.context}` : ''}`,
      category: 'DEBUGGING',
      source: insight.source,
      importance: 7,
      tags: ['debugging', 'solution'],
    });
  },

  /**
   * Create memory for API discoveries
   */
  async recordAPIEndpoint(
    projectId: string,
    endpoint: {
      method: string;
      path: string;
      description: string;
      file?: string;
    },
  ) {
    return this.create({
      projectId,
      title: `API: ${endpoint.method} ${endpoint.path}`,
      content: endpoint.description,
      category: 'API',
      source: endpoint.file,
      importance: 5,
      tags: ['api', endpoint.method.toLowerCase()],
    });
  },

  /**
   * Create memory for dependency information
   */
  async recordDependency(
    projectId: string,
    dep: {
      name: string;
      version: string;
      purpose: string;
      notes?: string;
    },
  ) {
    return this.create({
      projectId,
      title: `Dependency: ${dep.name}`,
      content: `Version: ${dep.version}\n\nPurpose: ${dep.purpose}${dep.notes ? `\n\nNotes: ${dep.notes}` : ''}`,
      category: 'DEPENDENCIES',
      source: 'package.json',
      importance: 4,
      tags: ['dependency', dep.name],
    });
  },

  /**
   * Get all active memories for a project
   */
  async getActiveMemories(projectId: string) {
    return prisma.projectMemory.findMany({
      where: { projectId, isActive: true },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    });
  },

  /**
   * Search memories by content
   */
  async searchMemories(projectId: string, query: string) {
    return prisma.projectMemory.findMany({
      where: {
        projectId,
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      orderBy: { importance: 'desc' },
    });
  },
};
