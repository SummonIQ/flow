/**
 * TechLeadRouter
 * 
 * Implements intelligent routing logic for ticket assignment.
 * Analyzes tickets and makes routing decisions based on:
 * - Complexity analysis
 * - Domain expertise requirements
 * - Team utilization
 * - Specialization needs
 */

import type {
  TicketAnalysis,
  RoutingDecision,
  TicketComplexity,
  RoutingDecisionType,
  SpecializationType,
  AgentWithMetrics,
  TeamWithContext,
  ProjectContext,
  OrchestrationConfig,
  TicketWithAnalysis,
} from '@/types/orchestration';
import type { Ticket } from '@prisma/client';

interface RoutingContext {
  preferredAgentId?: string;
  coreTeamUtilization: number;
  specialistPoolEnabled: boolean;
}

export class TechLeadRouter {
  private techLead: AgentWithMetrics | null = null;
  private coreTeam: TeamWithContext | null = null;
  private projectContext: ProjectContext | null = null;
  private config: OrchestrationConfig | null = null;

  /**
   * Initialize the router with context
   */
  initialize(
    techLead: AgentWithMetrics,
    coreTeam: TeamWithContext,
    context: ProjectContext,
    config: OrchestrationConfig
  ): void {
    this.techLead = techLead;
    this.coreTeam = coreTeam;
    this.projectContext = context;
    this.config = config;
  }

  /**
   * Analyze a ticket to determine complexity and requirements
   */
  async analyzeTicket(ticket: Ticket | TicketWithAnalysis): Promise<TicketAnalysis> {
    if (!this.techLead || !this.coreTeam || !this.projectContext) {
      throw new Error('Router not initialized');
    }

    // Analyze complexity based on multiple factors
    const complexity = this.determineComplexity(ticket);
    
    // Identify domains (Frontend, Backend, etc.)
    const domain = this.identifyDomains(ticket);
    
    // Estimate effort in hours
    const estimatedEffort = this.estimateEffort(ticket, complexity);
    
    // Check if requires specialization
    const requiredSpecializations = this.identifyRequiredSpecializations(ticket, complexity);
    
    // Determine if this is routine work
    const isRoutine = this.isRoutineWork(complexity, requiredSpecializations);
    
    // Check if specialist needed
    const requiresSpecialist = this.requiresSpecialist(complexity, requiredSpecializations);
    
    // Suggest best agent
    const suggestedAgent = this.suggestAgent(ticket, domain, complexity, requiredSpecializations);
    
    // Calculate confidence in analysis
    const confidence = this.calculateConfidence(ticket);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(complexity, domain, requiredSpecializations);

    return {
      ticketId: ticket.id,
      analyzedAt: new Date(),
      analyzedBy: this.techLead.id,
      complexity,
      domain,
      estimatedEffort,
      requiredSpecializations,
      isRoutine,
      requiresSpecialist,
      suggestedAgent,
      confidence,
      reasoning,
    };
  }

  /**
   * Make routing decision based on analysis
   */
  async route(
    ticket: Ticket | TicketWithAnalysis,
    analysis: TicketAnalysis,
    context: RoutingContext
  ): Promise<RoutingDecision> {
    if (!this.config) {
      throw new Error('Router not initialized');
    }

    let decision: RoutingDecisionType;
    let requiresApproval = false;

    // Strategy-based routing
    switch (this.config.routingStrategy) {
      case 'CORE_TEAM_ONLY':
        decision = 'ASSIGN_TO_CORE';
        break;

      case 'TECH_LEAD_ROUTING':
        decision = this.techLeadDecision(analysis, context);
        requiresApproval = !this.config.autoApproveRoutineTickets || !analysis.isRoutine;
        break;

      case 'HYBRID_AUTO':
        decision = this.hybridAutoDecision(analysis, context);
        requiresApproval = false; // Auto-approve in hybrid auto mode
        break;

      case 'HYBRID_MANUAL':
        decision = this.hybridAutoDecision(analysis, context);
        requiresApproval = true; // Always require approval
        break;

      default:
        decision = 'ASSIGN_TO_CORE';
    }

    // Check if needs more info
    if (analysis.confidence < 50) {
      decision = 'NEEDS_MORE_INFO';
      requiresApproval = true;
    }

    // Very complex tickets escalate to tech lead
    if (analysis.complexity === 'VERY_COMPLEX' && analysis.estimatedEffort > 40) {
      decision = 'ESCALATE_TO_TECH_LEAD';
      requiresApproval = false;
    }

    return {
      ticketId: ticket.id,
      analysis,
      decision,
      assignedTo: {
        primaryAgentId: analysis.suggestedAgent || this.techLead!.id,
        isPairing: false,
        role: 'PRIMARY',
        estimatedCompletion: new Date(Date.now() + analysis.estimatedEffort * 60 * 60 * 1000),
      },
      requiresApproval,
      executedAt: new Date(),
      executedBy: this.techLead!.id,
    };
  }

  /**
   * Tech lead makes decision based on analysis
   */
  private techLeadDecision(
    analysis: TicketAnalysis,
    context: RoutingContext
  ): RoutingDecisionType {
    // If preferred agent specified and is core team member, assign to them
    if (context.preferredAgentId && this.isCoreTeamMember(context.preferredAgentId)) {
      return 'ASSIGN_TO_CORE';
    }

    // Routine work goes to core team
    if (analysis.isRoutine) {
      return 'ASSIGN_TO_CORE';
    }

    // Requires specialist
    if (analysis.requiresSpecialist && context.specialistPoolEnabled) {
      return 'PULL_SPECIALIST';
    }

    // Complex but doesn't require specialist - assign to core
    return 'ASSIGN_TO_CORE';
  }

  /**
   * Hybrid automatic decision (80/20 rule)
   */
  private hybridAutoDecision(
    analysis: TicketAnalysis,
    context: RoutingContext
  ): RoutingDecisionType {
    // Check specialist usage threshold
    if (!context.specialistPoolEnabled) {
      return 'ASSIGN_TO_CORE';
    }

    // Simple/routine work always goes to core team
    if (analysis.isRoutine || analysis.complexity === 'SIMPLE' || analysis.complexity === 'TRIVIAL') {
      return 'ASSIGN_TO_CORE';
    }

    // If core team is under-utilized, try to use them even for complex work
    if (context.coreTeamUtilization < (this.config?.coreTeamUtilizationThreshold || 80)) {
      // Only pull specialist if truly required
      if (analysis.requiresSpecialist && analysis.requiredSpecializations.length > 0) {
        return 'PULL_SPECIALIST';
      }
      return 'ASSIGN_TO_CORE';
    }

    // Core team is highly utilized
    if (analysis.requiresSpecialist) {
      return 'PULL_SPECIALIST';
    }

    // Consider pairing for moderate-to-complex work
    if (analysis.complexity === 'COMPLEX' && analysis.requiredSpecializations.length > 0) {
      return 'CO_PILOT';
    }

    return 'ASSIGN_TO_CORE';
  }

  /**
   * Determine ticket complexity
   */
  private determineComplexity(ticket: Ticket | TicketWithAnalysis): TicketComplexity {
    const description = ticket.description?.toLowerCase() || '';
    const title = ticket.title.toLowerCase();
    
    // Keywords that indicate complexity
    const complexKeywords = [
      'architecture', 'refactor', 'migration', 'infrastructure',
      'security', 'performance', 'optimization', 'redesign'
    ];
    
    const simpleKeywords = [
      'fix typo', 'update text', 'change color', 'add button',
      'remove', 'hide', 'show', 'rename'
    ];

    const hasComplexKeywords = complexKeywords.some(kw => 
      description.includes(kw) || title.includes(kw)
    );
    
    const hasSimpleKeywords = simpleKeywords.some(kw =>
      description.includes(kw) || title.includes(kw)
    );

    // Priority also indicates complexity
    const isHighPriority = ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL';

    // Length heuristic
    const descLength = description.length;

    if (hasComplexKeywords || isHighPriority) {
      if (descLength > 500) return 'VERY_COMPLEX';
      if (descLength > 200) return 'COMPLEX';
      return 'MODERATE';
    }

    if (hasSimpleKeywords && descLength < 100) {
      return 'TRIVIAL';
    }

    if (descLength < 100) return 'SIMPLE';
    if (descLength < 300) return 'MODERATE';
    return 'COMPLEX';
  }

  /**
   * Identify domains from ticket content
   */
  private identifyDomains(ticket: Ticket | TicketWithAnalysis): string[] {
    const text = `${ticket.title} ${ticket.description || ''}`.toLowerCase();
    const domains: string[] = [];

    const domainKeywords = {
      Frontend: ['ui', 'ux', 'frontend', 'react', 'component', 'css', 'styling', 'design'],
      Backend: ['api', 'backend', 'server', 'database', 'endpoint', 'service'],
      DevOps: ['deploy', 'ci/cd', 'docker', 'kubernetes', 'infrastructure', 'aws', 'cloud'],
      Database: ['database', 'query', 'migration', 'schema', 'sql', 'prisma'],
      Testing: ['test', 'testing', 'qa', 'e2e', 'unit test', 'integration'],
      Security: ['security', 'auth', 'authentication', 'authorization', 'vulnerability'],
      Performance: ['performance', 'optimization', 'slow', 'cache', 'speed'],
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        domains.push(domain);
      }
    }

    // Default to Frontend if no domains found and ticket is frontend flagged
    if (domains.length === 0 && 'isFrontend' in ticket && ticket.isFrontend) {
      domains.push('Frontend');
    }

    return domains.length > 0 ? domains : ['General'];
  }

  /**
   * Estimate effort in hours
   */
  private estimateEffort(ticket: Ticket | TicketWithAnalysis, complexity: TicketComplexity): number {
    const baseHours = {
      TRIVIAL: 0.5,
      SIMPLE: 2,
      MODERATE: 6,
      COMPLEX: 16,
      VERY_COMPLEX: 40,
      UNKNOWN: 8,
    };

    let hours = baseHours[complexity];

    // Adjust based on priority
    if (ticket.priority === 'CRITICAL') {
      hours *= 1.2; // Add 20% for careful handling
    }

    return hours;
  }

  /**
   * Identify required specializations
   */
  private identifyRequiredSpecializations(
    ticket: Ticket | TicketWithAnalysis,
    complexity: TicketComplexity
  ): SpecializationType[] {
    const text = `${ticket.title} ${ticket.description || ''}`.toLowerCase();
    const specializations: SpecializationType[] = [];

    // Only complex+ tickets get specialist consideration
    if (complexity === 'TRIVIAL' || complexity === 'SIMPLE') {
      return [];
    }

    const keywords: Record<SpecializationType, string[]> = {
      PERFORMANCE_OPTIMIZATION: ['performance', 'optimization', 'slow', 'speed', 'cache'],
      SECURITY_AUDIT: ['security', 'vulnerability', 'xss', 'csrf', 'auth'],
      ML_PIPELINE: ['ml', 'machine learning', 'ai', 'model', 'training'],
      DATABASE_OPTIMIZATION: ['database optimization', 'query performance', 'index'],
      CLOUD_ARCHITECTURE: ['cloud', 'aws', 'gcp', 'azure', 'infrastructure', 'kubernetes'],
      ACCESSIBILITY_AUDIT: ['accessibility', 'a11y', 'wcag', 'aria', 'screen reader'],
      CODE_REVIEW: [], // Not detected from keywords
      ARCHITECTURE_DESIGN: ['architecture', 'design pattern', 'system design'],
      API_DESIGN: ['api design', 'rest api', 'graphql', 'endpoint design'],
      TESTING_STRATEGY: ['testing strategy', 'test plan', 'qa strategy'],
    };

    for (const [spec, words] of Object.entries(keywords) as [SpecializationType, string[]][]) {
      if (words.some(kw => text.includes(kw))) {
        specializations.push(spec);
      }
    }

    return specializations;
  }

  /**
   * Check if this is routine work
   */
  private isRoutineWork(
    complexity: TicketComplexity,
    specializations: SpecializationType[]
  ): boolean {
    return (
      (complexity === 'TRIVIAL' || complexity === 'SIMPLE') &&
      specializations.length === 0
    );
  }

  /**
   * Check if requires specialist
   */
  private requiresSpecialist(
    complexity: TicketComplexity,
    specializations: SpecializationType[]
  ): boolean {
    return (
      specializations.length > 0 &&
      (complexity === 'COMPLEX' || complexity === 'VERY_COMPLEX')
    );
  }

  /**
   * Suggest best agent for the ticket
   */
  private suggestAgent(
    ticket: Ticket | TicketWithAnalysis,
    domains: string[],
    complexity: TicketComplexity,
    specializations: SpecializationType[]
  ): string | null {
    if (!this.coreTeam) return null;

    // If requires specialist, return null (will be handled by agent pool)
    if (specializations.length > 0 && complexity === 'VERY_COMPLEX') {
      return null;
    }

    // Find best core team member based on domain and availability
    const candidates = this.coreTeam.members.filter(m => {
      // Check if agent has capacity
      if (m.agent.availability.currentLoad > 80) return false;
      
      // Check role match
      const roleDomains = this.getDomainsForRole(m.agent.role);
      return domains.some(d => roleDomains.includes(d));
    });

    if (candidates.length === 0) {
      // Fallback to least loaded agent
      const sorted = [...this.coreTeam.members].sort(
        (a, b) => a.agent.availability.currentLoad - b.agent.availability.currentLoad
      );
      return sorted[0]?.agent.id || null;
    }

    // Return best candidate (lowest load among domain matches)
    candidates.sort((a, b) => 
      a.agent.availability.currentLoad - b.agent.availability.currentLoad
    );

    return candidates[0].agent.id;
  }

  /**
   * Get domains for a given agent role
   */
  private getDomainsForRole(role: string): string[] {
    const roleDomains: Record<string, string[]> = {
      DESIGNER: ['Frontend', 'General'],
      FRONTEND_ENGINEER: ['Frontend', 'General'],
      BACKEND_ENGINEER: ['Backend', 'Database', 'General'],
      FULLSTACK_ENGINEER: ['Frontend', 'Backend', 'Database', 'General'],
      QA_ENGINEER: ['Testing', 'General'],
      DEVOPS_ENGINEER: ['DevOps', 'General'],
      TECH_LEAD: ['Frontend', 'Backend', 'DevOps', 'Database', 'Testing', 'General'],
      PRODUCT_OWNER: ['General'],
      SCRUM_MASTER: ['General'],
      CUSTOM: ['General'],
    };

    return roleDomains[role] || ['General'];
  }

  /**
   * Calculate confidence in analysis
   */
  private calculateConfidence(ticket: Ticket | TicketWithAnalysis): number {
    let confidence = 50; // Base confidence

    // More description = more confidence
    if (ticket.description && ticket.description.length > 100) confidence += 20;
    if (ticket.description && ticket.description.length > 300) confidence += 10;

    // Has acceptance criteria
    if ('acceptanceCriteria' in ticket && ticket.acceptanceCriteria) confidence += 20;

    // Has business requirements
    if ('businessRequirements' in ticket && ticket.businessRequirements) confidence += 10;

    return Math.min(100, confidence);
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    complexity: TicketComplexity,
    domains: string[],
    specializations: SpecializationType[]
  ): string {
    const parts: string[] = [];

    parts.push(`Complexity: ${complexity}`);
    
    if (domains.length > 0) {
      parts.push(`Domains: ${domains.join(', ')}`);
    }

    if (specializations.length > 0) {
      parts.push(`Requires specialization in: ${specializations.join(', ')}`);
    }

    return parts.join('. ');
  }

  /**
   * Check if agent is part of core team
   */
  private isCoreTeamMember(agentId: string): boolean {
    if (!this.coreTeam) return false;
    return this.coreTeam.members.some(m => m.agent.id === agentId);
  }
}
