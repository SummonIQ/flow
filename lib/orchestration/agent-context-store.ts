/**
 * AgentContextStore
 *
 * Persistent storage for agent context including:
 * - Mentoring notes and guidance
 * - Decisions and their reasoning
 * - Code patterns learned
 * - Team knowledge
 *
 * Uses file-based storage for simplicity and debuggability.
 */

import type {
  AgentContextEntry,
  AgentContextQuery,
  AgentRole,
  CodePattern,
  DecisionRecord,
  MentoringSession,
} from '@/types/agent-activity';
import fs from 'fs/promises';
import path from 'path';

// Base directory for context files
const CONTEXT_BASE_DIR = process.env.AGENT_CONTEXT_DIR || '.agent-context';

interface ContextFile {
  version: string;
  projectId: string;
  entries: AgentContextEntry[];
  decisions: DecisionRecord[];
  mentoring: MentoringSession[];
  patterns: CodePattern[];
  lastUpdated: string;
}

export class AgentContextStore {
  private projectId: string;
  private contextDir: string;
  private cache: ContextFile | null = null;
  private cacheLoaded: boolean = false;

  constructor(projectId: string, baseDir?: string) {
    this.projectId = projectId;
    this.contextDir = path.join(baseDir || CONTEXT_BASE_DIR, projectId);
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the context store
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.contextDir, { recursive: true });
      await this.loadCache();
    } catch (error) {
      console.error('Failed to initialize context store:', error);
    }
  }

  /**
   * Load context from file into memory cache
   */
  private async loadCache(): Promise<void> {
    if (this.cacheLoaded) return;

    const filePath = this.getContextFilePath();
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.cache = JSON.parse(content);
      this.cacheLoaded = true;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create new context
        this.cache = this.createEmptyContext();
        await this.saveCache();
        this.cacheLoaded = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * Save cache to file
   */
  private async saveCache(): Promise<void> {
    if (!this.cache) return;

    const filePath = this.getContextFilePath();
    this.cache.lastUpdated = new Date().toISOString();
    await fs.writeFile(filePath, JSON.stringify(this.cache, null, 2), 'utf-8');
  }

  /**
   * Get path to context file
   */
  private getContextFilePath(): string {
    return path.join(this.contextDir, 'context.json');
  }

  /**
   * Create empty context structure
   */
  private createEmptyContext(): ContextFile {
    return {
      version: '1.0.0',
      projectId: this.projectId,
      entries: [],
      decisions: [],
      mentoring: [],
      patterns: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  // ============================================================================
  // Context Entry Management
  // ============================================================================

  /**
   * Add a new context entry
   */
  async addEntry(
    entry: Omit<
      AgentContextEntry,
      'id' | 'projectId' | 'createdAt' | 'accessCount'
    >,
  ): Promise<AgentContextEntry> {
    await this.loadCache();

    const fullEntry: AgentContextEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: this.projectId,
      createdAt: new Date(),
      accessCount: 0,
      ...entry,
    };

    this.cache!.entries.push(fullEntry);
    await this.saveCache();

    // Also save to separate file for easy access
    await this.saveEntryToFile(fullEntry);

    return fullEntry;
  }

  /**
   * Save individual entry to its own file for easy reading
   */
  private async saveEntryToFile(entry: AgentContextEntry): Promise<void> {
    const typeDir = path.join(this.contextDir, entry.type.toLowerCase());
    await fs.mkdir(typeDir, { recursive: true });

    const fileName = `${entry.id}.md`;
    const filePath = path.join(typeDir, fileName);

    const content = this.formatEntryAsMarkdown(entry);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Format entry as readable markdown
   */
  private formatEntryAsMarkdown(entry: AgentContextEntry): string {
    let content = `# ${entry.title}\n\n`;
    content += `**Type:** ${entry.type}\n`;
    content += `**Created:** ${entry.createdAt.toISOString()}\n`;

    if (entry.sourceTicketId) {
      content += `**Source Ticket:** ${entry.sourceTicketId}\n`;
    }

    if (entry.visibility !== 'ALL') {
      content += `**Visibility:** ${entry.visibility}\n`;
      if (entry.targetRoles?.length) {
        content += `**Target Roles:** ${entry.targetRoles.join(', ')}\n`;
      }
    }

    content += `\n---\n\n`;
    content += entry.content;

    if (entry.data) {
      content += `\n\n---\n\n## Additional Data\n\n`;
      content += '```json\n';
      content += JSON.stringify(entry.data, null, 2);
      content += '\n```\n';
    }

    return content;
  }

  /**
   * Query context entries
   */
  async queryEntries(query: AgentContextQuery): Promise<AgentContextEntry[]> {
    await this.loadCache();

    let entries = [...this.cache!.entries];

    // Filter by types
    if (query.types?.length) {
      entries = entries.filter(e => query.types!.includes(e.type));
    }

    // Filter by agent
    if (query.agentId) {
      entries = entries.filter(
        e =>
          e.visibility === 'ALL' ||
          (e.visibility === 'AGENT' &&
            e.targetAgentIds?.includes(query.agentId!)),
      );
    }

    // Filter by role
    if (query.agentRole) {
      entries = entries.filter(
        e =>
          e.visibility === 'ALL' ||
          (e.visibility === 'ROLE' &&
            e.targetRoles?.includes(query.agentRole!)),
      );
    }

    // Filter expired unless included
    if (!query.includeExpired) {
      const now = new Date();
      entries = entries.filter(
        e => !e.expiresAt || new Date(e.expiresAt) > now,
      );
    }

    // Sort by creation date (newest first)
    entries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Apply limit
    if (query.limit) {
      entries = entries.slice(0, query.limit);
    }

    // Update access counts
    for (const entry of entries) {
      entry.accessCount++;
      entry.lastAccessedAt = new Date();
    }
    await this.saveCache();

    return entries;
  }

  /**
   * Get context relevant to an agent
   */
  async getContextForAgent(
    agentId: string,
    agentRole: AgentRole,
    limit: number = 20,
  ): Promise<AgentContextEntry[]> {
    return this.queryEntries({
      projectId: this.projectId,
      agentId,
      agentRole,
      limit,
    });
  }

  // ============================================================================
  // Decision Storage
  // ============================================================================

  /**
   * Store a decision for future reference
   */
  async storeDecision(decision: DecisionRecord): Promise<void> {
    await this.loadCache();

    this.cache!.decisions.push(decision);
    await this.saveCache();

    // Also save as readable file
    await this.saveDecisionToFile(decision);

    // Create context entry for significant decisions
    if (decision.impact.scope !== 'LOCAL') {
      await this.addEntry({
        type: 'DECISION',
        title: decision.title,
        content: `## ${decision.title}\n\n${decision.description}\n\n### Reasoning\n${decision.reasoning}`,
        visibility: 'ALL',
        sourceSessionId: decision.sessionId,
        sourceTicketId: decision.ticketId,
        data: {
          category: decision.category,
          impact: decision.impact,
          alternatives: decision.alternatives,
          selectedOption: decision.selectedOption,
        },
      });
    }
  }

  /**
   * Save decision to file
   */
  private async saveDecisionToFile(decision: DecisionRecord): Promise<void> {
    const decisionDir = path.join(this.contextDir, 'decisions');
    await fs.mkdir(decisionDir, { recursive: true });

    const fileName = `${decision.id}.md`;
    const filePath = path.join(decisionDir, fileName);

    let content = `# Decision: ${decision.title}\n\n`;
    content += `**Category:** ${decision.category}\n`;
    content += `**Made By:** ${decision.agentName} (${decision.agentRole})\n`;
    content += `**Date:** ${decision.timestamp.toISOString()}\n`;
    content += `**Impact:** ${decision.impact.scope} scope, ${decision.impact.riskLevel} risk\n`;
    content += `\n---\n\n`;
    content += `## Context\n\n${decision.context}\n\n`;
    content += `## Description\n\n${decision.description}\n\n`;
    content += `## Alternatives Considered\n\n`;

    for (const alt of decision.alternatives) {
      content += `### ${alt.selected ? '✓ ' : ''}${alt.title}\n`;
      content += `${alt.description}\n`;
      if (alt.pros?.length) {
        content += `\n**Pros:**\n${alt.pros.map(p => `- ${p}`).join('\n')}\n`;
      }
      if (alt.cons?.length) {
        content += `\n**Cons:**\n${alt.cons.map(c => `- ${c}`).join('\n')}\n`;
      }
      content += '\n';
    }

    content += `## Reasoning\n\n${decision.reasoning}\n`;

    if (decision.mentoringTarget) {
      content += `\n## Mentoring Note\n\n`;
      content += `**For:** ${decision.mentoringTarget.agentName}\n`;
      content += `**Topic:** ${decision.mentoringTarget.topic}\n\n`;
      content += decision.mentoringTarget.guidance;
    }

    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Get decisions for the project
   */
  async getDecisions(
    category?: DecisionRecord['category'],
    limit: number = 50,
  ): Promise<DecisionRecord[]> {
    await this.loadCache();

    let decisions = [...this.cache!.decisions];

    if (category) {
      decisions = decisions.filter(d => d.category === category);
    }

    // Sort by date (newest first)
    decisions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return decisions.slice(0, limit);
  }

  /**
   * Get decisions relevant to a ticket
   */
  async getDecisionsForTicket(ticketId: string): Promise<DecisionRecord[]> {
    await this.loadCache();

    return this.cache!.decisions.filter(
      d => d.ticketId === ticketId || d.relatedDecisionIds?.includes(ticketId),
    );
  }

  // ============================================================================
  // Mentoring Storage
  // ============================================================================

  /**
   * Store a mentoring session
   */
  async storeMentoringSession(session: MentoringSession): Promise<void> {
    await this.loadCache();

    this.cache!.mentoring.push(session);
    await this.saveCache();

    // Save as readable file
    await this.saveMentoringToFile(session);

    // Create context entries for key takeaways
    for (const takeaway of session.keyTakeaways) {
      await this.addEntry({
        type: 'MENTORING',
        title: `Mentoring: ${session.topic}`,
        content: takeaway,
        visibility: 'AGENT',
        targetAgentIds: [session.menteeId],
        sourceSessionId: session.id,
        sourceTicketId: session.ticketId,
        data: {
          mentorId: session.mentorId,
          mentorName: session.mentorName,
          topic: session.topic,
        },
      });
    }

    // Store code patterns
    if (session.codePatterns?.length) {
      for (const pattern of session.codePatterns) {
        await this.storePattern(pattern, session.menteeId);
      }
    }
  }

  /**
   * Save mentoring session to file
   */
  private async saveMentoringToFile(session: MentoringSession): Promise<void> {
    const mentoringDir = path.join(this.contextDir, 'mentoring');
    await fs.mkdir(mentoringDir, { recursive: true });

    const fileName = `${session.id}.md`;
    const filePath = path.join(mentoringDir, fileName);

    let content = `# Mentoring Session: ${session.topic}\n\n`;
    content += `**Mentor:** ${session.mentorName} (${session.mentorRole})\n`;
    content += `**Mentee:** ${session.menteeName} (${session.menteeRole})\n`;
    content += `**Date:** ${session.startedAt.toISOString()}\n`;
    content += `**Status:** ${session.status}\n`;
    content += `\n---\n\n`;
    content += `## Context\n\n${session.context}\n\n`;

    if (session.guidance.length) {
      content += `## Guidance Provided\n\n`;
      for (const g of session.guidance) {
        content += `### ${g.title} (${g.type})\n\n`;
        content += `${g.content}\n\n`;
        if (g.codeExample) {
          content += '```' + (g.codeExample.language || '') + '\n';
          content += g.codeExample.content;
          content += '\n```\n\n';
        }
      }
    }

    if (session.keyTakeaways.length) {
      content += `## Key Takeaways\n\n`;
      for (const t of session.keyTakeaways) {
        content += `- ${t}\n`;
      }
      content += '\n';
    }

    if (session.codePatterns?.length) {
      content += `## Code Patterns\n\n`;
      for (const p of session.codePatterns) {
        content += `### ${p.name}\n\n`;
        content += `${p.description}\n\n`;
        content += `**Usage:** ${p.usage}\n\n`;
        content += '```\n' + p.pattern + '\n```\n\n';
        if (p.antiPattern) {
          content += `**Anti-pattern to avoid:**\n\n`;
          content += '```\n' + p.antiPattern + '\n```\n\n';
        }
      }
    }

    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Get mentoring sessions for an agent (as mentee)
   */
  async getMentoringForAgent(agentId: string): Promise<MentoringSession[]> {
    await this.loadCache();

    return this.cache!.mentoring.filter(m => m.menteeId === agentId);
  }

  /**
   * Get mentoring sessions by a mentor
   */
  async getMentoringByMentor(mentorId: string): Promise<MentoringSession[]> {
    await this.loadCache();

    return this.cache!.mentoring.filter(m => m.mentorId === mentorId);
  }

  // ============================================================================
  // Pattern Storage
  // ============================================================================

  /**
   * Store a code pattern
   */
  async storePattern(pattern: CodePattern, learnedBy?: string): Promise<void> {
    await this.loadCache();

    this.cache!.patterns.push(pattern);
    await this.saveCache();

    // Save as file
    await this.savePatternToFile(pattern);

    // Create context entry
    await this.addEntry({
      type: 'PATTERN',
      title: pattern.name,
      content: `${pattern.description}\n\n**Usage:** ${pattern.usage}\n\n\`\`\`\n${pattern.pattern}\n\`\`\``,
      visibility: learnedBy ? 'AGENT' : 'ALL',
      targetAgentIds: learnedBy ? [learnedBy] : undefined,
      data: {
        patternId: pattern.id,
        antiPattern: pattern.antiPattern,
      },
    });
  }

  /**
   * Save pattern to file
   */
  private async savePatternToFile(pattern: CodePattern): Promise<void> {
    const patternDir = path.join(this.contextDir, 'patterns');
    await fs.mkdir(patternDir, { recursive: true });

    const fileName = `${pattern.id}.md`;
    const filePath = path.join(patternDir, fileName);

    let content = `# Pattern: ${pattern.name}\n\n`;
    content += pattern.description + '\n\n';
    content += `## Usage\n\n${pattern.usage}\n\n`;
    content += `## Pattern\n\n`;
    content += '```\n' + pattern.pattern + '\n```\n';

    if (pattern.antiPattern) {
      content += `\n## Anti-Pattern (Avoid)\n\n`;
      content += '```\n' + pattern.antiPattern + '\n```\n';
    }

    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Get all patterns
   */
  async getPatterns(): Promise<CodePattern[]> {
    await this.loadCache();
    return [...this.cache!.patterns];
  }

  // ============================================================================
  // Knowledge Storage
  // ============================================================================

  /**
   * Store general knowledge
   */
  async storeKnowledge(
    title: string,
    content: string,
    sourceTicketId?: string,
    sourceSessionId?: string,
    targetRoles?: AgentRole[],
  ): Promise<AgentContextEntry> {
    return this.addEntry({
      type: 'KNOWLEDGE',
      title,
      content,
      visibility: targetRoles?.length ? 'ROLE' : 'ALL',
      targetRoles,
      sourceTicketId,
      sourceSessionId,
    });
  }

  /**
   * Store a warning for future reference
   */
  async storeWarning(
    title: string,
    content: string,
    sourceTicketId?: string,
    expiresInDays?: number,
  ): Promise<AgentContextEntry> {
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    return this.addEntry({
      type: 'WARNING',
      title,
      content,
      visibility: 'ALL',
      sourceTicketId,
      expiresAt,
    });
  }

  // ============================================================================
  // Summary and Export
  // ============================================================================

  /**
   * Get a summary of all stored context
   */
  async getSummary(): Promise<{
    totalEntries: number;
    totalDecisions: number;
    totalMentoring: number;
    totalPatterns: number;
    byType: Record<string, number>;
    recentActivity: Date | null;
  }> {
    await this.loadCache();

    const byType: Record<string, number> = {};
    for (const entry of this.cache!.entries) {
      byType[entry.type] = (byType[entry.type] || 0) + 1;
    }

    return {
      totalEntries: this.cache!.entries.length,
      totalDecisions: this.cache!.decisions.length,
      totalMentoring: this.cache!.mentoring.length,
      totalPatterns: this.cache!.patterns.length,
      byType,
      recentActivity: this.cache!.lastUpdated
        ? new Date(this.cache!.lastUpdated)
        : null,
    };
  }

  /**
   * Export all context as a single markdown document
   */
  async exportAsMarkdown(): Promise<string> {
    await this.loadCache();

    let content = `# Agent Context for Project: ${this.projectId}\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `---\n\n`;

    // Decisions
    if (this.cache!.decisions.length) {
      content += `## Decisions (${this.cache!.decisions.length})\n\n`;
      for (const d of this.cache!.decisions.slice(-20)) {
        content += `### ${d.title}\n`;
        content += `*${d.agentName} - ${new Date(d.timestamp).toLocaleDateString()}*\n\n`;
        content += `${d.reasoning}\n\n`;
      }
    }

    // Mentoring
    if (this.cache!.mentoring.length) {
      content += `## Mentoring Sessions (${this.cache!.mentoring.length})\n\n`;
      for (const m of this.cache!.mentoring.slice(-10)) {
        content += `### ${m.topic}\n`;
        content += `*${m.mentorName} → ${m.menteeName}*\n\n`;
        content += `Key takeaways:\n`;
        for (const t of m.keyTakeaways) {
          content += `- ${t}\n`;
        }
        content += '\n';
      }
    }

    // Patterns
    if (this.cache!.patterns.length) {
      content += `## Code Patterns (${this.cache!.patterns.length})\n\n`;
      for (const p of this.cache!.patterns) {
        content += `### ${p.name}\n`;
        content += `${p.description}\n\n`;
        content += '```\n' + p.pattern + '\n```\n\n';
      }
    }

    // Knowledge entries
    const knowledge = this.cache!.entries.filter(e => e.type === 'KNOWLEDGE');
    if (knowledge.length) {
      content += `## Knowledge Base (${knowledge.length})\n\n`;
      for (const k of knowledge.slice(-20)) {
        content += `### ${k.title}\n\n`;
        content += `${k.content}\n\n`;
      }
    }

    return content;
  }

  /**
   * Clear all context (use with caution!)
   */
  async clearAll(): Promise<void> {
    this.cache = this.createEmptyContext();
    await this.saveCache();

    // Remove all files in subdirectories
    const dirs = ['decisions', 'mentoring', 'patterns', 'knowledge', 'warning'];
    for (const dir of dirs) {
      const dirPath = path.join(this.contextDir, dir);
      try {
        await fs.rm(dirPath, { recursive: true, force: true });
      } catch {
        // Ignore errors
      }
    }
  }
}

// Export singleton factory
const storeInstances = new Map<string, AgentContextStore>();

export function getContextStore(projectId: string): AgentContextStore {
  let store = storeInstances.get(projectId);
  if (!store) {
    store = new AgentContextStore(projectId);
    storeInstances.set(projectId, store);
  }
  return store;
}
