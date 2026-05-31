/**
 * AI Agent Orchestration Types
 * 
 * Defines the hybrid model for AI agent team management with:
 * - Project-level core teams with persistent context
 * - Tech lead orchestration and routing logic
 * - Dynamic specialist pool for edge cases
 * - Intelligent ticket routing based on complexity and requirements
 */

import type { Agent, Team, Ticket, Workflow } from '@prisma/client';

// ============================================================================
// Core Orchestration Types
// ============================================================================

export interface ProjectOrchestration {
  id: string;
  projectId: string;
  coreTeamId: string;
  techLeadId: string;
  workflowId: string;
  specialistPoolEnabled: boolean;
  routingStrategy: RoutingStrategy;
  contextRetention: ContextRetentionConfig;
  metrics: OrchestrationMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export type RoutingStrategy = 
  | 'CORE_TEAM_ONLY'          // All tickets to core team
  | 'TECH_LEAD_ROUTING'       // Tech lead analyzes and routes
  | 'HYBRID_AUTO'             // 80% core, 20% specialists (auto)
  | 'HYBRID_MANUAL';          // Tech lead decides on each ticket

// ============================================================================
// Agent Pool Management
// ============================================================================

export interface AgentPool {
  id: string;
  name: string;
  description: string;
  agentIds: string[];
  specializations: AgentPoolSpecialization[];
  availability: AgentAvailability;
  metrics: PoolMetrics;
}

export interface AgentPoolSpecialization {
  type: SpecializationType;
  agentIds: string[];
  priority: number;
}

export type SpecializationType =
  | 'PERFORMANCE_OPTIMIZATION'
  | 'SECURITY_AUDIT'
  | 'ML_PIPELINE'
  | 'DATABASE_OPTIMIZATION'
  | 'CLOUD_ARCHITECTURE'
  | 'ACCESSIBILITY_AUDIT'
  | 'CODE_REVIEW'
  | 'ARCHITECTURE_DESIGN'
  | 'API_DESIGN'
  | 'TESTING_STRATEGY';

export interface AgentAvailability {
  agentId: string;
  currentLoad: number;        // 0-100%
  maxConcurrent: number;
  activeTickets: number;
  estimatedAvailable: Date | null;
  isAvailable: boolean;
}

export interface PoolMetrics {
  totalAgents: number;
  availableAgents: number;
  utilizationRate: number;    // 0-100%
  avgResponseTime: number;    // milliseconds
  successRate: number;        // 0-100%
}

// ============================================================================
// Tech Lead Routing Logic
// ============================================================================

export interface TicketAnalysis {
  ticketId: string;
  analyzedAt: Date;
  analyzedBy: string;         // Tech lead agent ID
  complexity: TicketComplexity;
  domain: string[];           // Frontend, Backend, DevOps, etc.
  estimatedEffort: number;    // hours
  requiredSpecializations: SpecializationType[];
  isRoutine: boolean;
  requiresSpecialist: boolean;
  suggestedAgent: string | null;
  confidence: number;         // 0-100%
  reasoning: string;
}

export type TicketComplexity = 
  | 'TRIVIAL'      // < 1 hour, simple changes
  | 'SIMPLE'       // 1-4 hours, well-defined
  | 'MODERATE'     // 4-8 hours, some complexity
  | 'COMPLEX'      // 8-24 hours, multiple components
  | 'VERY_COMPLEX' // > 24 hours, architectural changes
  | 'UNKNOWN';     // Needs more analysis

export interface RoutingDecision {
  ticketId: string;
  analysis: TicketAnalysis;
  decision: RoutingDecisionType;
  assignedTo: AgentAssignment;
  requiresApproval: boolean;
  executedAt: Date;
  executedBy: string;
}

export type RoutingDecisionType =
  | 'ASSIGN_TO_CORE'           // Assign to core team member
  | 'PULL_SPECIALIST'          // Pull from specialist pool
  | 'CO_PILOT'                 // Core + specialist pairing
  | 'ESCALATE_TO_TECH_LEAD'    // Tech lead handles personally
  | 'NEEDS_MORE_INFO';         // Cannot route yet

export interface AgentAssignment {
  primaryAgentId: string;
  secondaryAgentId?: string;  // For pairing
  isPairing: boolean;
  role: AssignmentRole;
  estimatedCompletion: Date;
}

export type AssignmentRole = 
  | 'PRIMARY'      // Main responsible agent
  | 'REVIEWER'     // Reviews work
  | 'CONSULTANT'   // Provides expertise
  | 'PAIR';        // Equal pairing

// ============================================================================
// Context Retention
// ============================================================================

export interface ContextRetentionConfig {
  enabled: boolean;
  retentionPeriod: number;    // days
  maxContextSize: number;     // KB
  includeCodePatterns: boolean;
  includeDecisions: boolean;
  includeArchitecture: boolean;
}

export interface ProjectContext {
  projectId: string;
  teamId: string;
  techStack: string[];
  codePatterns: CodePattern[];
  architecturalDecisions: ArchitecturalDecision[];
  commonIssues: CommonIssue[];
  teamKnowledge: TeamKnowledge[];
  lastUpdated: Date;
}

export interface CodePattern {
  id: string;
  name: string;
  description: string;
  pattern: string;           // Code example
  usageCount: number;
  confidence: number;
  learnedFrom: string[];     // Ticket IDs
  createdAt: Date;
}

export interface ArchitecturalDecision {
  id: string;
  title: string;
  decision: string;
  reasoning: string;
  alternatives: string[];
  impact: string;
  decidedBy: string;         // Agent ID
  decidedAt: Date;
  relatedTickets: string[];
}

export interface CommonIssue {
  id: string;
  title: string;
  description: string;
  solution: string;
  occurrences: number;
  lastSeen: Date;
  relatedTickets: string[];
}

export interface TeamKnowledge {
  id: string;
  topic: string;
  content: string;
  learnedBy: string[];       // Agent IDs
  sourceTickets: string[];
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Orchestration Metrics
// ============================================================================

export interface OrchestrationMetrics {
  totalTickets: number;
  routedToCoreTeam: number;
  routedToSpecialists: number;
  pairingAssignments: number;
  avgRoutingTime: number;     // milliseconds
  routingAccuracy: number;    // 0-100% (based on reassignments)
  coreTeamUtilization: number; // 0-100%
  specialistUtilization: number; // 0-100%
  knowledgeTransferEvents: number;
}

// ============================================================================
// Ticket Processing
// ============================================================================

export interface TicketProcessingRequest {
  ticketId: string;
  projectId: string;
  forceAnalysis?: boolean;    // Re-analyze even if already analyzed
  preferredAgent?: string;    // User preference
  deadline?: Date;
}

export interface TicketProcessingResult {
  success: boolean;
  ticketId: string;
  analysis: TicketAnalysis;
  routing: RoutingDecision;
  assignment: AgentAssignment;
  message: string;
  warnings?: string[];
}

// ============================================================================
// Agent Selection Criteria
// ============================================================================

export interface AgentSelectionCriteria {
  requiredRole?: string;
  requiredSpecializations?: SpecializationType[];
  preferredAgentId?: string;
  excludeAgentIds?: string[];
  maxCurrentLoad?: number;
  requiresAvailability?: boolean;
  domainExpertise?: string[];
  minConfidenceScore?: number;
}

export interface AgentScore {
  agentId: string;
  score: number;              // 0-100
  factors: ScoreFactor[];
  isAvailable: boolean;
  estimatedAvailable?: Date;
}

export interface ScoreFactor {
  name: string;
  weight: number;             // 0-1
  value: number;              // 0-100
  reason: string;
}

// ============================================================================
// Knowledge Transfer
// ============================================================================

export interface KnowledgeTransferSession {
  id: string;
  ticketId: string;
  specialistId: string;
  coreTeamMemberIds: string[];
  topic: string;
  knowledgePoints: KnowledgePoint[];
  startedAt: Date;
  completedAt?: Date;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface KnowledgePoint {
  title: string;
  description: string;
  codeExample?: string;
  documentation?: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  understoodBy: string[];     // Agent IDs who confirmed understanding
}

// ============================================================================
// Workflow Integration
// ============================================================================

export interface OrchestrationWorkflow {
  id: string;
  name: string;
  stages: WorkflowStage[];
  defaultAssignments: DefaultStageAssignment[];
  escalationRules: EscalationRule[];
  automationRules: AutomationRule[];
}

export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  requiredRoles: string[];
  estimatedDuration: number;  // hours
  canBeSkipped: boolean;
  requiresReview: boolean;
}

export interface DefaultStageAssignment {
  stageId: string;
  defaultAgentId: string;
  alternateAgentIds: string[];
}

export interface EscalationRule {
  id: string;
  condition: string;          // e.g., "ticket.estimatedHours > 40"
  action: 'ESCALATE_TO_TECH_LEAD' | 'REQUIRE_APPROVAL' | 'PULL_SPECIALIST';
  targetAgentId?: string;
  notifyTeam: boolean;
}

export interface AutomationRule {
  id: string;
  trigger: string;            // e.g., "ticket.status === 'IN_REVIEW'"
  condition?: string;
  action: AutomationAction;
}

export type AutomationAction =
  | { type: 'ASSIGN'; agentId: string }
  | { type: 'NOTIFY'; agentIds: string[] }
  | { type: 'COMMENT'; message: string }
  | { type: 'UPDATE_STATUS'; status: string }
  | { type: 'ADD_LABEL'; label: string };

// ============================================================================
// Extended Types with Relationships
// ============================================================================

export type AgentWithMetrics = Agent & {
  metrics: {
    completedTickets: number;
    avgCompletionTime: number;
    successRate: number;
    currentLoad: number;
  };
  availability: AgentAvailability;
};

export type TeamWithContext = Team & {
  members: Array<{
    agent: AgentWithMetrics;
    workflowRole: string;
    order: number;
    canAssign: boolean;
    canReview: boolean;
  }>;
  workflow?: Workflow;
  context: ProjectContext;
  orchestration: ProjectOrchestration;
};

export type TicketWithAnalysis = Ticket & {
  analysis?: TicketAnalysis;
  routing?: RoutingDecision;
  assignment?: AgentAssignment;
  assignedTo?: AgentWithMetrics;
  team?: TeamWithContext;
};

// ============================================================================
// Configuration
// ============================================================================

export interface OrchestrationConfig {
  routingStrategy: RoutingStrategy;
  coreTeamUtilizationThreshold: number;  // 0-100%
  specialistCostMultiplier: number;       // e.g., 1.5x
  knowledgeTransferRequired: boolean;
  autoApproveRoutineTickets: boolean;
  maxSpecialistUsagePercent: number;      // 0-100%
  contextRetention: ContextRetentionConfig;
}

export const DEFAULT_ORCHESTRATION_CONFIG: OrchestrationConfig = {
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
