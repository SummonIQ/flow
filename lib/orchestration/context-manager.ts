/**
 * ContextManager
 *
 * Manages project context for AI agent teams.
 * Tracks:
 * - Code patterns and conventions
 * - Architectural decisions
 * - Common issues and solutions
 * - Team knowledge base
 */

import { prisma } from '@/lib/db/prisma';
import { migrateKnowledgeProjectId } from '@/lib/knowledge/project-identity';
import { migrateKnowledgeStatuses } from '@/lib/knowledge/status';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';
import type {
  ArchitecturalDecision,
  CodePattern,
  CommonIssue,
  ProjectContext,
  TeamKnowledge,
} from '@/types/orchestration';

export class ContextManager {
  private projectId: string;
  private context: ProjectContext | null = null;
  private lastUpdate: Date | null = null;
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  /**
   * Load project context from database
   */
  async loadContext(): Promise<ProjectContext> {
    // Check if cached context is still valid
    if (this.context && !this.isCacheStale()) {
      return this.context;
    }

    // Load fresh context
    this.context = await this.buildContext();
    this.lastUpdate = new Date();

    return this.context;
  }

  /**
   * Add a code pattern learned from ticket completion
   */
  async addCodePattern(
    pattern: Omit<CodePattern, 'id' | 'createdAt'>,
  ): Promise<void> {
    // Store in agent memory system
    const memory = await prisma.agentMemory.create({
      data: {
        agentId: pattern.learnedFrom[0] || '', // Primary agent who learned it
        key: `code_pattern_${pattern.name}`,
        value: JSON.stringify({
          pattern: pattern.pattern,
          description: pattern.description,
          usageCount: pattern.usageCount,
        }),
        context: pattern.description,
        type: 'code_pattern',
        scope: 'project',
        scopeId: this.projectId,
        confidence: pattern.confidence,
        priority: Math.floor(pattern.confidence / 10),
      },
    });

    await ragEmbeddingService.onCreated('AgentMemory', memory.id);

    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Add an architectural decision
   */
  async addArchitecturalDecision(
    decision: Omit<ArchitecturalDecision, 'id' | 'decidedAt'>,
  ): Promise<void> {
    // Create knowledge document for the decision
    const doc = await prisma.knowledgeDocument.create({
      data: {
        title: decision.title,
        content: JSON.stringify({
          decision: decision.decision,
          reasoning: decision.reasoning,
          alternatives: decision.alternatives,
          impact: decision.impact,
        }),
        type: 'architecture',
        category: 'Architecture Decision Record',
        tags: ['architecture', 'decision'],
        projectId: this.projectId,
        createdById: decision.decidedBy,
        status: 'published',
        publishedAt: new Date(),
      },
    });

    await ragEmbeddingService.onCreated('KnowledgeDocument', doc.id);

    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Record a common issue and its solution
   */
  async recordCommonIssue(issue: Omit<CommonIssue, 'id'>): Promise<void> {
    // Store as agent memory
    const key = `common_issue_${issue.title.toLowerCase().replace(/\s+/g, '_')}`;

    const existing = await prisma.agentMemory.findUnique({
      where: {
        agentId_key_scope_scopeId: {
          agentId: 'system',
          key,
          scope: 'project',
          scopeId: this.projectId,
        },
      },
      select: { id: true },
    });

    const memory = await prisma.agentMemory.upsert({
      where: {
        agentId_key_scope_scopeId: {
          agentId: 'system', // System-level memory
          key,
          scope: 'project',
          scopeId: this.projectId,
        },
      },
      update: {
        value: JSON.stringify({
          description: issue.description,
          solution: issue.solution,
          occurrences: issue.occurrences,
          lastSeen: issue.lastSeen,
          relatedTickets: issue.relatedTickets,
        }),
        accessCount: { increment: 1 },
        lastAccessed: new Date(),
      },
      create: {
        agentId: 'system',
        key,
        value: JSON.stringify({
          description: issue.description,
          solution: issue.solution,
          occurrences: issue.occurrences,
          lastSeen: issue.lastSeen,
          relatedTickets: issue.relatedTickets,
        }),
        context: issue.description,
        type: 'common_issue',
        scope: 'project',
        scopeId: this.projectId,
        priority: Math.min(10, issue.occurrences),
      },
    });

    if (!existing) {
      await ragEmbeddingService.onCreated('AgentMemory', memory.id);
    } else {
      await ragEmbeddingService.onUpdated('AgentMemory', memory.id, [
        'value',
        'context',
        'type',
        'scope',
        'scopeId',
        'key',
      ]);
    }

    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Add team knowledge entry
   */
  async addTeamKnowledge(
    knowledge: Omit<TeamKnowledge, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    // Create knowledge document
    const doc = await prisma.knowledgeDocument.create({
      data: {
        title: knowledge.topic,
        content: knowledge.content,
        type: 'knowledge',
        category: 'Team Knowledge',
        tags: ['team-knowledge'],
        projectId: this.projectId,
        createdById: knowledge.learnedBy[0],
        status: 'published',
        publishedAt: new Date(),
      },
    });

    await ragEmbeddingService.onCreated('KnowledgeDocument', doc.id);

    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Get relevant context for a specific ticket
   */
  async getRelevantContext(ticketId: string): Promise<{
    codePatterns: CodePattern[];
    decisions: ArchitecturalDecision[];
    issues: CommonIssue[];
    knowledge: TeamKnowledge[];
  }> {
    const context = await this.loadContext();

    // For now, return all context
    // In a production system, you'd filter based on ticket content, domain, etc.
    return {
      codePatterns: context.codePatterns,
      decisions: context.architecturalDecisions,
      issues: context.commonIssues,
      knowledge: context.teamKnowledge,
    };
  }

  /**
   * Build context from database
   */
  private async buildContext(): Promise<ProjectContext> {
    const project = await prisma.project.findUnique({
      where: { id: this.projectId },
      include: { apps: true },
    });

    if (!project) {
      throw new Error(`Project ${this.projectId} not found`);
    }

    await migrateKnowledgeProjectId({ id: project.id, name: project.name });
    await migrateKnowledgeStatuses(project.id);

    // Get team for the project
    const team = await prisma.team.findFirst({
      where: { projectId: this.projectId, isActive: true },
    });

    const teamId = team?.id || 'default';

    // Extract tech stack from apps
    const techStack = project.apps.map(app => app.type);

    // Load code patterns from agent memories
    const codePatterns = await this.loadCodePatterns();

    // Load architectural decisions from knowledge documents
    const architecturalDecisions = await this.loadArchitecturalDecisions();

    // Load common issues
    const commonIssues = await this.loadCommonIssues();

    // Load team knowledge
    const teamKnowledge = await this.loadTeamKnowledge();

    return {
      projectId: this.projectId,
      teamId,
      techStack,
      codePatterns,
      architecturalDecisions,
      commonIssues,
      teamKnowledge,
      lastUpdated: new Date(),
    };
  }

  /**
   * Load code patterns from agent memory
   */
  private async loadCodePatterns(): Promise<CodePattern[]> {
    const memories = await prisma.agentMemory.findMany({
      where: {
        type: 'code_pattern',
        scope: 'project',
        scopeId: this.projectId,
      },
      orderBy: { priority: 'desc' },
      take: 50, // Limit to top 50 patterns
    });

    return memories.map(mem => {
      const data = JSON.parse(mem.value);
      return {
        id: mem.id,
        name: mem.key.replace('code_pattern_', ''),
        description: mem.context || '',
        pattern: data.pattern || '',
        usageCount: data.usageCount || mem.accessCount,
        confidence: mem.confidence,
        learnedFrom: [mem.agentId],
        createdAt: mem.createdAt,
      };
    });
  }

  /**
   * Load architectural decisions
   */
  private async loadArchitecturalDecisions(): Promise<ArchitecturalDecision[]> {
    const docs = await prisma.knowledgeDocument.findMany({
      where: {
        projectId: this.projectId,
        type: 'architecture',
        status: 'published',
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Recent 20 decisions
    });

    return docs.map(doc => {
      const content = JSON.parse(doc.content);
      return {
        id: doc.id,
        title: doc.title,
        decision: content.decision || '',
        reasoning: content.reasoning || '',
        alternatives: content.alternatives || [],
        impact: content.impact || '',
        decidedBy: doc.createdById || 'unknown',
        decidedAt: doc.publishedAt || doc.createdAt,
        relatedTickets: content.relatedTickets || [],
      };
    });
  }

  /**
   * Load common issues
   */
  private async loadCommonIssues(): Promise<CommonIssue[]> {
    const memories = await prisma.agentMemory.findMany({
      where: {
        type: 'common_issue',
        scope: 'project',
        scopeId: this.projectId,
      },
      orderBy: { priority: 'desc' },
      take: 30,
    });

    return memories.map(mem => {
      const data = JSON.parse(mem.value);
      return {
        id: mem.id,
        title: mem.key.replace('common_issue_', '').replace(/_/g, ' '),
        description: data.description || mem.context || '',
        solution: data.solution || '',
        occurrences: data.occurrences || mem.accessCount,
        lastSeen: data.lastSeen
          ? new Date(data.lastSeen)
          : mem.lastAccessed || mem.updatedAt,
        relatedTickets: data.relatedTickets || [],
      };
    });
  }

  /**
   * Load team knowledge
   */
  private async loadTeamKnowledge(): Promise<TeamKnowledge[]> {
    const docs = await prisma.knowledgeDocument.findMany({
      where: {
        projectId: this.projectId,
        type: 'knowledge',
        status: 'published',
      },
      orderBy: { updatedAt: 'desc' },
      take: 40,
    });

    return docs.map(doc => ({
      id: doc.id,
      topic: doc.title,
      content: doc.content,
      learnedBy: doc.createdById ? [doc.createdById] : [],
      sourceTickets: [], // Would need to track this separately
      confidence: 0.8, // Default confidence
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  /**
   * Check if cache is stale
   */
  private isCacheStale(): boolean {
    if (!this.lastUpdate) return true;
    return Date.now() - this.lastUpdate.getTime() > this.cacheTimeout;
  }

  /**
   * Invalidate the cache
   */
  private invalidateCache(): void {
    this.context = null;
    this.lastUpdate = null;
  }

  /**
   * Clear all context for the project
   */
  async clearContext(): Promise<void> {
    await prisma.agentMemory.deleteMany({
      where: {
        scope: 'project',
        scopeId: this.projectId,
      },
    });

    await prisma.knowledgeDocument.deleteMany({
      where: {
        projectId: this.projectId,
        type: { in: ['architecture', 'knowledge'] },
      },
    });

    this.invalidateCache();
  }

  /**
   * Get context statistics
   */
  async getStats(): Promise<{
    totalPatterns: number;
    totalDecisions: number;
    totalIssues: number;
    totalKnowledge: number;
    lastUpdated: Date | null;
  }> {
    const context = await this.loadContext();

    return {
      totalPatterns: context.codePatterns.length,
      totalDecisions: context.architecturalDecisions.length,
      totalIssues: context.commonIssues.length,
      totalKnowledge: context.teamKnowledge.length,
      lastUpdated: context.lastUpdated,
    };
  }
}
