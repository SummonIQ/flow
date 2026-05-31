/**
 * ProjectOrchestrator
 *
 * Core orchestration engine that manages AI agent teams and ticket routing.
 * Implements the hybrid model:
 * - Core team (80% of work): Builds persistent context
 * - Specialist pool (20% of work): Expert consultation
 * - Tech lead routing: Intelligent ticket analysis and assignment
 */

import { prisma } from '@/lib/db/prisma';
import type {
  AgentAssignment,
  AgentWithMetrics,
  OrchestrationConfig,
  ProjectOrchestration,
  RoutingDecision,
  TeamWithContext,
  TicketAnalysis,
  TicketProcessingRequest,
  TicketProcessingResult,
  TicketWithAnalysis,
} from '@/types/orchestration';
import { AgentPool } from './agent-pool';
import { ContextManager } from './context-manager';
import { TechLeadRouter } from './tech-lead-router';

export class ProjectOrchestrator {
  private projectId: string;
  private orchestration: ProjectOrchestration | null = null;
  private coreTeam: TeamWithContext | null = null;
  private techLead: AgentWithMetrics | null = null;
  private agentPool: AgentPool;
  private router: TechLeadRouter;
  private contextManager: ContextManager;
  private config: OrchestrationConfig;

  constructor(projectId: string, config?: Partial<OrchestrationConfig>) {
    this.projectId = projectId;
    this.agentPool = new AgentPool();
    this.router = new TechLeadRouter();
    this.contextManager = new ContextManager(projectId);

    // Merge with default config
    this.config = {
      ...this.getDefaultConfig(),
      ...config,
    };
  }

  /**
   * Initialize the orchestrator with project data
   */
  async initialize(): Promise<void> {
    // Load orchestration configuration
    this.orchestration = await this.loadOrchestration();

    if (!this.orchestration) {
      throw new Error(
        `No orchestration configured for project ${this.projectId}`,
      );
    }

    // Load core team with context
    this.coreTeam = await this.loadCoreTeam(this.orchestration.coreTeamId);

    if (!this.coreTeam) {
      throw new Error(`Core team not found: ${this.orchestration.coreTeamId}`);
    }

    // Load tech lead
    this.techLead = await this.loadTechLead(this.orchestration.techLeadId);

    if (!this.techLead) {
      throw new Error(
        `Tech lead agent not found: ${this.orchestration.techLeadId}`,
      );
    }

    // Initialize agent pool if enabled
    if (this.orchestration.specialistPoolEnabled) {
      await this.agentPool.initialize();
    }

    // Load project context
    const context = await this.contextManager.loadContext();

    // Initialize router with context
    this.router.initialize(this.techLead, this.coreTeam, context, this.config);
  }

  /**
   * Process a ticket through the orchestration system
   */
  async processTicket(
    request: TicketProcessingRequest,
  ): Promise<TicketProcessingResult> {
    try {
      // 1. Load ticket with full details
      const ticket = await this.loadTicket(request.ticketId);

      if (!ticket) {
        return {
          success: false,
          ticketId: request.ticketId,
          message: 'Ticket not found',
        } as TicketProcessingResult;
      }

      // 2. Analyze ticket complexity and requirements
      const analysis = await this.router.analyzeTicket(ticket);

      // 3. Make routing decision
      const routing = await this.makeRoutingDecision(
        ticket,
        analysis,
        request.preferredAgent,
      );

      // 4. Execute assignment
      const assignment = await this.executeAssignment(ticket, routing);

      // 5. Update ticket in database
      await this.updateTicketAssignment(
        ticket.id,
        assignment,
        analysis,
        routing,
      );

      // 6. Update metrics
      await this.updateMetrics(routing);

      // 7. Plan knowledge transfer if specialist involved
      if (
        routing.decision === 'PULL_SPECIALIST' ||
        routing.decision === 'CO_PILOT'
      ) {
        await this.planKnowledgeTransfer(ticket, assignment);
      }

      return {
        success: true,
        ticketId: ticket.id,
        analysis,
        routing,
        assignment,
        message: this.getAssignmentMessage(routing, assignment),
      };
    } catch (error) {
      console.error('Error processing ticket:', error);
      return {
        success: false,
        ticketId: request.ticketId,
        message: error instanceof Error ? error.message : 'Unknown error',
      } as TicketProcessingResult;
    }
  }

  /**
   * Make routing decision based on analysis
   */
  private async makeRoutingDecision(
    ticket: TicketWithAnalysis,
    analysis: TicketAnalysis,
    preferredAgent?: string,
  ): Promise<RoutingDecision> {
    const decision = await this.router.route(ticket, analysis, {
      preferredAgentId: preferredAgent,
      coreTeamUtilization: await this.calculateCoreTeamUtilization(),
      specialistPoolEnabled: this.orchestration!.specialistPoolEnabled,
    });

    return decision;
  }

  /**
   * Execute the assignment decision
   */
  private async executeAssignment(
    ticket: TicketWithAnalysis,
    routing: RoutingDecision,
  ): Promise<AgentAssignment> {
    switch (routing.decision) {
      case 'ASSIGN_TO_CORE':
        return this.assignToCoreTeam(ticket, routing);

      case 'PULL_SPECIALIST':
        return this.assignToSpecialist(ticket, routing);

      case 'CO_PILOT':
        return this.assignToPair(ticket, routing);

      case 'ESCALATE_TO_TECH_LEAD':
        return this.assignToTechLead(ticket);

      case 'NEEDS_MORE_INFO':
        throw new Error('Cannot assign ticket that needs more information');

      default:
        throw new Error(`Unknown routing decision: ${routing.decision}`);
    }
  }

  /**
   * Assign ticket to core team member
   */
  private async assignToCoreTeam(
    ticket: TicketWithAnalysis,
    routing: RoutingDecision,
  ): Promise<AgentAssignment> {
    const suggestedAgentId = routing.analysis.suggestedAgent;

    if (!suggestedAgentId) {
      throw new Error('No agent suggested for core team assignment');
    }

    // Verify agent is part of core team
    const isCoreTeamMember = this.coreTeam?.members.some(
      m => m.agent.id === suggestedAgentId,
    );

    if (!isCoreTeamMember) {
      throw new Error('Suggested agent is not part of core team');
    }

    return {
      primaryAgentId: suggestedAgentId,
      isPairing: false,
      role: 'PRIMARY',
      estimatedCompletion: this.calculateEstimatedCompletion(
        routing.analysis.estimatedEffort,
      ),
    };
  }

  /**
   * Assign ticket to specialist from pool
   */
  private async assignToSpecialist(
    ticket: TicketWithAnalysis,
    routing: RoutingDecision,
  ): Promise<AgentAssignment> {
    const specializations = routing.analysis.requiredSpecializations;

    if (specializations.length === 0) {
      throw new Error(
        'No specializations identified for specialist assignment',
      );
    }

    // Request specialist from pool
    const specialist = await this.agentPool.requestSpecialist(
      specializations[0], // Primary specialization
      {
        preferredAgentId: routing.analysis.suggestedAgent || undefined,
        requiresAvailability: true,
        maxCurrentLoad: 80,
      },
    );

    if (!specialist) {
      throw new Error(`No available specialist for ${specializations[0]}`);
    }

    return {
      primaryAgentId: specialist.id,
      isPairing: false,
      role: 'PRIMARY',
      estimatedCompletion: this.calculateEstimatedCompletion(
        routing.analysis.estimatedEffort,
      ),
    };
  }

  /**
   * Assign ticket to core team member + specialist pair
   */
  private async assignToPair(
    ticket: TicketWithAnalysis,
    routing: RoutingDecision,
  ): Promise<AgentAssignment> {
    // Get core team member
    const coreAssignment = await this.assignToCoreTeam(ticket, routing);

    // Get specialist
    const specializations = routing.analysis.requiredSpecializations;
    const specialist = await this.agentPool.requestSpecialist(
      specializations[0],
      {
        requiresAvailability: true,
        maxCurrentLoad: 60,
      },
    );

    if (!specialist) {
      // Fallback to core team only
      console.warn('No specialist available for pairing, using core team only');
      return coreAssignment;
    }

    return {
      primaryAgentId: coreAssignment.primaryAgentId,
      secondaryAgentId: specialist.id,
      isPairing: true,
      role: 'PAIR',
      estimatedCompletion: this.calculateEstimatedCompletion(
        routing.analysis.estimatedEffort * 0.7, // Pairing reduces time
      ),
    };
  }

  /**
   * Assign ticket directly to tech lead
   */
  private async assignToTechLead(
    ticket: TicketWithAnalysis,
  ): Promise<AgentAssignment> {
    if (!this.techLead) {
      throw new Error('No tech lead configured');
    }

    return {
      primaryAgentId: this.techLead.id,
      isPairing: false,
      role: 'PRIMARY',
      estimatedCompletion: this.calculateEstimatedCompletion(8), // Tech lead handles complex work
    };
  }

  /**
   * Calculate core team utilization percentage
   */
  private async calculateCoreTeamUtilization(): Promise<number> {
    if (!this.coreTeam) return 0;

    const memberIds = this.coreTeam.members.map(m => m.agent.id);

    const activeTickets = await prisma.ticket.count({
      where: {
        assignedToId: { in: memberIds },
        status: { in: ['IN_PROGRESS', 'IN_REVIEW', 'QA'] },
      },
    });

    const totalCapacity = this.coreTeam.members.reduce(
      (sum, m) => sum + m.agent.maxConcurrentTasks,
      0,
    );

    return totalCapacity > 0 ? (activeTickets / totalCapacity) * 100 : 0;
  }

  /**
   * Calculate estimated completion date
   */
  private calculateEstimatedCompletion(estimatedHours: number): Date {
    const hoursPerDay = 6; // Assume 6 productive hours per day
    const days = Math.ceil(estimatedHours / hoursPerDay);
    const completion = new Date();
    completion.setDate(completion.getDate() + days);
    return completion;
  }

  /**
   * Update ticket with assignment details
   */
  private async updateTicketAssignment(
    ticketId: string,
    assignment: AgentAssignment,
    analysis: TicketAnalysis,
    routing: RoutingDecision,
  ): Promise<void> {
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    const existingTags = Array.isArray(existingTicket?.tags)
      ? existingTicket.tags
      : [];

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId: assignment.primaryAgentId,
        status: 'TODO', // Move to TODO if in BACKLOG
        tags: {
          push: JSON.stringify({
            analysis: {
              complexity: analysis.complexity,
              estimatedEffort: analysis.estimatedEffort,
              domain: analysis.domain,
              routingDecision: routing.decision,
              analyzedAt: analysis.analyzedAt.toISOString(),
            },
          }),
        },
      },
    });

    // Add assignment comment
    await prisma.ticketComment.create({
      data: {
        ticketId,
        authorId: this.techLead?.id,
        authorType: 'AGENT',
        authorName: this.techLead?.name || 'System',
        content: this.getAssignmentMessage(routing, assignment),
        isInternal: false,
      },
    });
  }

  /**
   * Plan knowledge transfer session
   */
  private async planKnowledgeTransfer(
    ticket: TicketWithAnalysis,
    assignment: AgentAssignment,
  ): Promise<void> {
    if (!this.config.knowledgeTransferRequired) return;
    if (!assignment.secondaryAgentId) return;

    // This would create a knowledge transfer session
    // Implementation depends on your knowledge transfer system
    console.log('Planning knowledge transfer:', {
      ticket: ticket.id,
      specialist: assignment.secondaryAgentId,
      coreTeamMember: assignment.primaryAgentId,
    });
  }

  /**
   * Update orchestration metrics
   */
  private async updateMetrics(routing: RoutingDecision): Promise<void> {
    // Update metrics based on routing decision
    // Implementation depends on your metrics system
    console.log('Updating metrics:', routing.decision);
  }

  /**
   * Get human-readable assignment message
   */
  private getAssignmentMessage(
    routing: RoutingDecision,
    assignment: AgentAssignment,
  ): string {
    const primaryAgent = this.getAgentById(assignment.primaryAgentId);
    const secondaryAgent = assignment.secondaryAgentId
      ? this.getAgentById(assignment.secondaryAgentId)
      : null;

    const messages = {
      ASSIGN_TO_CORE: `Assigned to ${primaryAgent?.name} from core team. ${routing.analysis.reasoning}`,
      PULL_SPECIALIST: `Assigned to specialist ${primaryAgent?.name}. Specialization required: ${routing.analysis.requiredSpecializations.join(', ')}`,
      CO_PILOT: `Pairing assignment: ${primaryAgent?.name} (core) with ${secondaryAgent?.name} (specialist)`,
      ESCALATE_TO_TECH_LEAD: `Escalated to Tech Lead ${primaryAgent?.name} due to complexity`,
      NEEDS_MORE_INFO: 'Ticket needs more information before assignment',
    };

    return messages[routing.decision] || 'Assigned';
  }

  /**
   * Get agent by ID from core team or tech lead
   */
  private getAgentById(agentId: string): AgentWithMetrics | null {
    if (this.techLead?.id === agentId) return this.techLead;
    return (
      this.coreTeam?.members.find(m => m.agent.id === agentId)?.agent || null
    );
  }

  /**
   * Load orchestration configuration from database
   */
  private async loadOrchestration(): Promise<ProjectOrchestration | null> {
    // This would load from a ProjectOrchestration table
    // For now, return a mock configuration
    const team = await prisma.team.findFirst({
      where: { projectId: this.projectId, isActive: true },
    });

    if (!team) return null;

    const techLead = await prisma.agent.findFirst({
      where: { role: 'TECH_LEAD', isActive: true },
    });

    return {
      id: 'orch-1',
      projectId: this.projectId,
      coreTeamId: team.id,
      techLeadId: techLead?.id || '',
      workflowId: team.workflowId || '',
      specialistPoolEnabled: true,
      routingStrategy: this.config.routingStrategy,
      contextRetention: this.config.contextRetention,
      metrics: {
        totalTickets: 0,
        routedToCoreTeam: 0,
        routedToSpecialists: 0,
        pairingAssignments: 0,
        avgRoutingTime: 0,
        routingAccuracy: 0,
        coreTeamUtilization: 0,
        specialistUtilization: 0,
        knowledgeTransferEvents: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Load core team with full context
   */
  private async loadCoreTeam(teamId: string): Promise<TeamWithContext | null> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { agent: true },
          orderBy: { order: 'asc' },
        },
        workflow: true,
      },
    });

    if (!team) return null;

    // Load context
    const context = await this.contextManager.loadContext();

    // Calculate metrics for each agent
    const membersWithMetrics = await Promise.all(
      team.members.map(async member => {
        const metrics = await this.calculateAgentMetrics(member.agent.id);
        const availability = await this.calculateAgentAvailability(
          member.agent.id,
        );

        return {
          agent: { ...member.agent, metrics, availability },
          workflowRole: member.workflowRole || '',
          order: member.order,
          canAssign: member.canAssign,
          canReview: member.canReview,
        };
      }),
    );

    return {
      ...team,
      members: membersWithMetrics,
      workflow: team.workflow || undefined,
      context,
      orchestration: this.orchestration!,
    };
  }

  /**
   * Load tech lead agent
   */
  private async loadTechLead(
    techLeadId: string,
  ): Promise<AgentWithMetrics | null> {
    const agent = await prisma.agent.findUnique({
      where: { id: techLeadId },
    });

    if (!agent) return null;

    const metrics = await this.calculateAgentMetrics(agent.id);
    const availability = await this.calculateAgentAvailability(agent.id);

    return { ...agent, metrics, availability };
  }

  /**
   * Load ticket with full details
   */
  private async loadTicket(
    ticketId: string,
  ): Promise<TicketWithAnalysis | null> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        assignedTo: true,
        team: {
          include: {
            members: { include: { agent: true } },
            workflow: true,
          },
        },
      },
    });

    return ticket as TicketWithAnalysis | null;
  }

  /**
   * Calculate metrics for an agent
   */
  private async calculateAgentMetrics(agentId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { assignedToId: agentId },
    });

    const completed = tickets.filter(t => t.status === 'DONE');
    const avgTime =
      completed.length > 0
        ? completed.reduce((sum, t) => {
            if (t.completedAt && t.createdAt) {
              return sum + (t.completedAt.getTime() - t.createdAt.getTime());
            }
            return sum;
          }, 0) /
          completed.length /
          (1000 * 60 * 60) // Convert to hours
        : 0;

    const active = tickets.filter(t =>
      ['IN_PROGRESS', 'IN_REVIEW', 'QA'].includes(t.status),
    ).length;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { maxConcurrentTasks: true },
    });

    return {
      completedTickets: completed.length,
      avgCompletionTime: avgTime,
      successRate: (completed.length / Math.max(tickets.length, 1)) * 100,
      currentLoad: (active / (agent?.maxConcurrentTasks || 3)) * 100,
    };
  }

  /**
   * Calculate agent availability
   */
  private async calculateAgentAvailability(agentId: string) {
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
    const isAvailable = activeTickets < maxConcurrent;

    return {
      agentId,
      currentLoad: (activeTickets / maxConcurrent) * 100,
      maxConcurrent,
      activeTickets,
      estimatedAvailable: isAvailable
        ? null
        : new Date(Date.now() + 24 * 60 * 60 * 1000),
      isAvailable,
    };
  }

  /**
   * Get default orchestration configuration
   */
  private getDefaultConfig(): OrchestrationConfig {
    return {
      routingStrategy: 'HYBRID_AUTO',
      coreTeamUtilizationThreshold: 80,
      specialistCostMultiplier: 1.5,
      knowledgeTransferRequired: true,
      autoApproveRoutineTickets: true,
      maxSpecialistUsagePercent: 30,
      contextRetention: {
        enabled: true,
        retentionPeriod: 90,
        maxContextSize: 1024,
        includeCodePatterns: true,
        includeDecisions: true,
        includeArchitecture: true,
      },
    };
  }
}
