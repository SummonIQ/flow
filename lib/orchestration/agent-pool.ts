/**
 * AgentPool
 * 
 * Manages the shared pool of specialist AI agents.
 * Handles agent availability, specialization matching, and load balancing.
 */

import type {
  AgentPool as AgentPoolType,
  AgentAvailability,
  AgentPoolSpecialization,
  PoolMetrics,
  SpecializationType,
  AgentSelectionCriteria,
  AgentScore,
  AgentWithMetrics,
} from '@/types/orchestration';
import type { Agent, AgentRole, AgentSpecialization } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export class AgentPool {
  private pool: AgentPoolType | null = null;
  private availabilityCache: Map<string, AgentAvailability> = new Map();
  private lastCacheUpdate: Date | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize the agent pool with all available specialist agents
   */
  async initialize(): Promise<void> {
    // Load all active agents that are marked as specialists
    // (not default agents, which are part of core teams)
    const agents = await prisma.agent.findMany({
      where: {
        isActive: true,
        isDefault: false, // Only custom specialist agents
      },
    });

    // Group by specialization
    const specializations = this.groupBySpecialization(agents);

    // Calculate initial metrics
    const metrics = await this.calculatePoolMetrics(agents);

    // Build pool structure
    this.pool = {
      id: 'global-pool',
      name: 'Global Specialist Pool',
      description: 'Shared pool of specialist AI agents for complex tasks',
      agentIds: agents.map(a => a.id),
      specializations,
      availability: await this.calculatePoolAvailability(agents),
      metrics,
    };

    // Initialize availability cache
    await this.refreshAvailabilityCache();
  }

  /**
   * Request a specialist agent from the pool
   */
  async requestSpecialist(
    specialization: SpecializationType,
    criteria?: AgentSelectionCriteria
  ): Promise<AgentWithMetrics | null> {
    if (!this.pool) {
      throw new Error('Agent pool not initialized');
    }

    // Refresh cache if stale
    if (this.isCacheStale()) {
      await this.refreshAvailabilityCache();
    }

    // Find agents with matching specialization
    const candidates = await this.findCandidates(specialization, criteria);

    if (candidates.length === 0) {
      return null;
    }

    // Score each candidate
    const scoredCandidates = await Promise.all(
      candidates.map(agent => this.scoreAgent(agent, criteria))
    );

    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Return best available candidate
    const best = scoredCandidates[0];
    
    if (!best.isAvailable && criteria?.requiresAvailability) {
      return null;
    }

    // Load full agent with metrics
    return this.loadAgentWithMetrics(best.agentId);
  }

  /**
   * Get current pool status
   */
  async getPoolStatus(): Promise<AgentPoolType | null> {
    return this.pool;
  }

  /**
   * Get availability for a specific agent
   */
  async getAgentAvailability(agentId: string): Promise<AgentAvailability | null> {
    if (this.isCacheStale()) {
      await this.refreshAvailabilityCache();
    }

    return this.availabilityCache.get(agentId) || null;
  }

  /**
   * Release an agent back to the pool
   */
  async releaseAgent(agentId: string): Promise<void> {
    // Update availability cache
    const availability = await this.calculateAgentAvailability(agentId);
    this.availabilityCache.set(agentId, availability);
  }

  /**
   * Group agents by their specializations
   */
  private groupBySpecialization(agents: Agent[]): AgentPoolSpecialization[] {
    const specializationMap = new Map<AgentSpecialization, string[]>();

    agents.forEach(agent => {
      if (!specializationMap.has(agent.specialization)) {
        specializationMap.set(agent.specialization, []);
      }
      specializationMap.get(agent.specialization)!.push(agent.id);
    });

    return Array.from(specializationMap.entries()).map(([spec, agentIds], index) => ({
      type: this.mapToSpecializationType(spec),
      agentIds,
      priority: this.getSpecializationPriority(spec),
    }));
  }

  /**
   * Map Prisma AgentSpecialization to SpecializationType
   */
  private mapToSpecializationType(spec: AgentSpecialization): SpecializationType {
    const mapping: Record<AgentSpecialization, SpecializationType> = {
      PERFORMANCE: 'PERFORMANCE_OPTIMIZATION',
      SECURITY: 'SECURITY_AUDIT',
      DATABASE: 'DATABASE_OPTIMIZATION',
      CLOUD_AWS: 'CLOUD_ARCHITECTURE',
      CLOUD_GCP: 'CLOUD_ARCHITECTURE',
      CLOUD_AZURE: 'CLOUD_ARCHITECTURE',
      ACCESSIBILITY: 'ACCESSIBILITY_AUDIT',
      TESTING: 'TESTING_STRATEGY',
      // Default mappings for other types
      GENERALIST: 'CODE_REVIEW',
      REACT: 'CODE_REVIEW',
      VUE: 'CODE_REVIEW',
      ANGULAR: 'CODE_REVIEW',
      NODEJS: 'API_DESIGN',
      PYTHON: 'API_DESIGN',
      GOLANG: 'API_DESIGN',
      RUST: 'API_DESIGN',
      KUBERNETES: 'CLOUD_ARCHITECTURE',
      UI_UX: 'ACCESSIBILITY_AUDIT',
      MOBILE: 'CODE_REVIEW',
      CUSTOM: 'CODE_REVIEW',
    };

    return mapping[spec] || 'CODE_REVIEW';
  }

  /**
   * Get priority for a specialization (higher = more critical)
   */
  private getSpecializationPriority(spec: AgentSpecialization): number {
    const priorities: Partial<Record<AgentSpecialization, number>> = {
      SECURITY: 10,
      PERFORMANCE: 9,
      ACCESSIBILITY: 8,
      DATABASE: 7,
      CLOUD_AWS: 6,
      CLOUD_GCP: 6,
      CLOUD_AZURE: 6,
      TESTING: 5,
      // Others default to 1
    };

    return priorities[spec] || 1;
  }

  /**
   * Find candidate agents matching criteria
   */
  private async findCandidates(
    specialization: SpecializationType,
    criteria?: AgentSelectionCriteria
  ): Promise<Agent[]> {
    // Map back to Prisma specialization
    const prismaSpecs = this.getPrismaSpecializationsForType(specialization);

    const agents = await prisma.agent.findMany({
      where: {
        isActive: true,
        specialization: { in: prismaSpecs },
        ...(criteria?.excludeAgentIds && {
          id: { notIn: criteria.excludeAgentIds },
        }),
        ...(criteria?.requiredRole && {
          role: criteria.requiredRole as AgentRole,
        }),
      },
    });

    return agents;
  }

  /**
   * Get Prisma specializations for a SpecializationType
   */
  private getPrismaSpecializationsForType(type: SpecializationType): AgentSpecialization[] {
    const mapping: Record<SpecializationType, AgentSpecialization[]> = {
      PERFORMANCE_OPTIMIZATION: ['PERFORMANCE'],
      SECURITY_AUDIT: ['SECURITY'],
      ML_PIPELINE: ['PYTHON', 'GENERALIST'],
      DATABASE_OPTIMIZATION: ['DATABASE'],
      CLOUD_ARCHITECTURE: ['CLOUD_AWS', 'CLOUD_GCP', 'CLOUD_AZURE', 'KUBERNETES'],
      ACCESSIBILITY_AUDIT: ['ACCESSIBILITY', 'UI_UX'],
      CODE_REVIEW: ['GENERALIST'],
      ARCHITECTURE_DESIGN: ['GENERALIST'],
      API_DESIGN: ['NODEJS', 'PYTHON', 'GOLANG'],
      TESTING_STRATEGY: ['TESTING'],
    };

    return mapping[type] || ['GENERALIST'];
  }

  /**
   * Score an agent based on selection criteria
   */
  private async scoreAgent(
    agent: Agent,
    criteria?: AgentSelectionCriteria
  ): Promise<AgentScore> {
    const factors: Array<{ name: string; weight: number; value: number; reason: string }> = [];

    // Availability factor (40% weight)
    const availability = this.availabilityCache.get(agent.id);
    if (availability) {
      factors.push({
        name: 'Availability',
        weight: 0.4,
        value: availability.isAvailable ? 100 : Math.max(0, 100 - availability.currentLoad),
        reason: availability.isAvailable
          ? 'Agent is available'
          : `Current load: ${availability.currentLoad.toFixed(0)}%`,
      });
    }

    // Performance history (30% weight)
    const metrics = await this.getAgentMetrics(agent.id);
    factors.push({
      name: 'Success Rate',
      weight: 0.3,
      value: metrics.successRate,
      reason: `${metrics.completedTickets} completed tickets, ${metrics.successRate.toFixed(0)}% success rate`,
    });

    // Specialization match (20% weight)
    const specializationMatch = criteria?.requiredSpecializations
      ? this.calculateSpecializationMatch(agent, criteria.requiredSpecializations)
      : 100;
    factors.push({
      name: 'Specialization Match',
      weight: 0.2,
      value: specializationMatch,
      reason: `Specialization: ${agent.specialization}`,
    });

    // Preference bonus (10% weight)
    const preferenceBonus = criteria?.preferredAgentId === agent.id ? 100 : 50;
    factors.push({
      name: 'Preference',
      weight: 0.1,
      value: preferenceBonus,
      reason: criteria?.preferredAgentId === agent.id ? 'Preferred agent' : 'No preference',
    });

    // Calculate total weighted score
    const totalScore = factors.reduce((sum, factor) => {
      return sum + factor.weight * factor.value;
    }, 0);

    return {
      agentId: agent.id,
      score: totalScore,
      factors,
      isAvailable: availability?.isAvailable || false,
      estimatedAvailable: availability?.estimatedAvailable || undefined,
    };
  }

  /**
   * Calculate how well an agent matches required specializations
   */
  private calculateSpecializationMatch(
    agent: Agent,
    required: SpecializationType[]
  ): number {
    const agentType = this.mapToSpecializationType(agent.specialization);
    return required.includes(agentType) ? 100 : 50; // 50% for partial match
  }

  /**
   * Load agent with full metrics
   */
  private async loadAgentWithMetrics(agentId: string): Promise<AgentWithMetrics> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const metrics = await this.getAgentMetrics(agentId);
    const availability = this.availabilityCache.get(agentId) || await this.calculateAgentAvailability(agentId);

    return {
      ...agent,
      metrics,
      availability,
    };
  }

  /**
   * Get metrics for an agent
   */
  private async getAgentMetrics(agentId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { assignedToId: agentId },
    });

    const completed = tickets.filter(t => t.status === 'DONE');
    const avgTime = completed.length > 0
      ? completed.reduce((sum, t) => {
          if (t.completedAt && t.createdAt) {
            return sum + (t.completedAt.getTime() - t.createdAt.getTime());
          }
          return sum;
        }, 0) / completed.length / (1000 * 60 * 60)
      : 0;

    const active = tickets.filter(t =>
      ['IN_PROGRESS', 'IN_REVIEW', 'QA'].includes(t.status)
    ).length;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { maxConcurrentTasks: true },
    });

    return {
      completedTickets: completed.length,
      avgCompletionTime: avgTime,
      successRate: tickets.length > 0 ? (completed.length / tickets.length) * 100 : 100,
      currentLoad: (active / (agent?.maxConcurrentTasks || 3)) * 100,
    };
  }

  /**
   * Calculate availability for an agent
   */
  private async calculateAgentAvailability(agentId: string): Promise<AgentAvailability> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    const activeTickets = await prisma.ticket.count({
      where: {
        assignedToId: agentId,
        status: { in: ['IN_PROGRESS', 'IN_REVIEW', 'QA'] },
      },
    });

    const maxConcurrent = agent?.maxConcurrentTasks || 3;
    const currentLoad = (activeTickets / maxConcurrent) * 100;
    const isAvailable = activeTickets < maxConcurrent;

    return {
      agentId,
      currentLoad,
      maxConcurrent,
      activeTickets,
      estimatedAvailable: isAvailable ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
      isAvailable,
    };
  }

  /**
   * Calculate pool-wide availability
   */
  private async calculatePoolAvailability(agents: Agent[]): Promise<AgentAvailability> {
    const availabilities = await Promise.all(
      agents.map(a => this.calculateAgentAvailability(a.id))
    );

    const totalLoad = availabilities.reduce((sum, a) => sum + a.currentLoad, 0);
    const avgLoad = agents.length > 0 ? totalLoad / agents.length : 0;
    const totalActive = availabilities.reduce((sum, a) => sum + a.activeTickets, 0);
    const totalMax = availabilities.reduce((sum, a) => sum + a.maxConcurrent, 0);

    return {
      agentId: 'pool',
      currentLoad: avgLoad,
      maxConcurrent: totalMax,
      activeTickets: totalActive,
      estimatedAvailable: null,
      isAvailable: availabilities.some(a => a.isAvailable),
    };
  }

  /**
   * Calculate pool metrics
   */
  private async calculatePoolMetrics(agents: Agent[]): Promise<PoolMetrics> {
    const availabilities = await Promise.all(
      agents.map(a => this.calculateAgentAvailability(a.id))
    );

    const available = availabilities.filter(a => a.isAvailable).length;
    const totalLoad = availabilities.reduce((sum, a) => sum + a.currentLoad, 0);
    const avgLoad = agents.length > 0 ? totalLoad / agents.length : 0;

    // Calculate success rate across all agents
    const metricsArray = await Promise.all(
      agents.map(a => this.getAgentMetrics(a.id))
    );

    const totalSuccess = metricsArray.reduce((sum, m) => sum + m.successRate, 0);
    const avgSuccess = agents.length > 0 ? totalSuccess / agents.length : 100;

    return {
      totalAgents: agents.length,
      availableAgents: available,
      utilizationRate: avgLoad,
      avgResponseTime: 1000, // Placeholder
      successRate: avgSuccess,
    };
  }

  /**
   * Refresh the availability cache
   */
  private async refreshAvailabilityCache(): Promise<void> {
    if (!this.pool) return;

    const agents = await prisma.agent.findMany({
      where: { id: { in: this.pool.agentIds } },
    });

    this.availabilityCache.clear();

    for (const agent of agents) {
      const availability = await this.calculateAgentAvailability(agent.id);
      this.availabilityCache.set(agent.id, availability);
    }

    this.lastCacheUpdate = new Date();
  }

  /**
   * Check if the cache is stale
   */
  private isCacheStale(): boolean {
    if (!this.lastCacheUpdate) return true;
    return Date.now() - this.lastCacheUpdate.getTime() > this.cacheTimeout;
  }
}
