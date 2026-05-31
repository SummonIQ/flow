/**
 * Agent Activity Types
 *
 * Comprehensive types for tracking agent activities, decisions,
 * thinking processes, and meta-decisions across all roles.
 */

// ============================================================================
// Activity Types
// ============================================================================

export type AgentRole =
  | 'TECH_LEAD'
  | 'FRONTEND_ENGINEER'
  | 'BACKEND_ENGINEER'
  | 'FULLSTACK_ENGINEER'
  | 'QA_ENGINEER'
  | 'DEVOPS_ENGINEER'
  | 'DESIGNER'
  | 'PRODUCT_OWNER'
  | 'SCRUM_MASTER'
  | 'SPECIALIST';

export type ActivityType =
  // Common activities
  | 'THINKING' // Agent reasoning/deliberation
  | 'DECISION' // Agent made a decision
  | 'ACTION' // Agent took an action
  | 'TOOL_CALL' // Agent called an external tool
  | 'CODE_WRITE' // Agent wrote code
  | 'CODE_REVIEW' // Agent reviewed code
  | 'FILE_READ' // Agent read a file
  | 'FILE_WRITE' // Agent wrote a file
  | 'SEARCH' // Agent searched codebase
  | 'TEST_RUN' // Agent ran tests
  | 'ERROR' // An error occurred
  | 'BLOCKED' // Agent is blocked
  | 'WAITING' // Agent waiting for something
  | 'COMPLETED' // Task completed
  // Tech Lead specific
  | 'ROUTING' // Tech lead routing a ticket
  | 'MENTORING' // Tech lead mentoring a developer
  | 'ESCALATION' // Tech lead escalating an issue
  | 'ARCHITECTURE' // Making architecture decisions
  | 'DELEGATION' // Delegating work
  // QA specific
  | 'TEST_DESIGN' // Designing tests
  | 'BUG_REPORT' // Reporting a bug
  | 'VALIDATION' // Validating implementation
  // DevOps specific
  | 'DEPLOYMENT' // Deployment activity
  | 'INFRASTRUCTURE' // Infrastructure changes
  | 'MONITORING' // Setting up monitoring
  // Designer specific
  | 'DESIGN_REVIEW' // Reviewing design
  | 'UX_ANALYSIS' // Analyzing UX
  // General
  | 'COMMUNICATION' // Inter-agent communication
  | 'HANDOFF' // Handing off work
  | 'STATUS_UPDATE'; // Status update

export type DecisionCategory =
  | 'TECHNICAL' // Technical implementation decision
  | 'ARCHITECTURE' // Architectural decision
  | 'ASSIGNMENT' // Work assignment decision
  | 'PRIORITY' // Priority decision
  | 'APPROACH' // Approach/strategy decision
  | 'RESOURCE' // Resource allocation decision
  | 'PROCESS' // Process decision
  | 'QUALITY' // Quality-related decision
  | 'RISK' // Risk assessment decision
  | 'MENTORING'; // Mentoring/guidance decision

export type ThinkingPhase =
  | 'UNDERSTANDING' // Understanding the problem
  | 'ANALYSIS' // Analyzing the situation
  | 'PLANNING' // Planning approach
  | 'EVALUATION' // Evaluating options
  | 'SYNTHESIS' // Synthesizing solution
  | 'REFLECTION' // Reflecting on progress
  | 'RECONSIDERATION'; // Reconsidering approach

// ============================================================================
// Core Activity Interface
// ============================================================================

export interface AgentActivity {
  id: string;
  sessionId: string;
  ticketId: string;
  projectId: string;

  // Agent info
  agentId: string;
  agentName: string;
  agentRole: AgentRole;

  // Activity details
  type: ActivityType;
  phase?: ThinkingPhase;
  title: string;
  description: string;

  // Detailed content (for streaming)
  content?: string;
  contentChunks?: string[]; // For streaming content
  isStreaming?: boolean;

  // Context
  context?: ActivityContext;

  // Metadata
  metadata?: Record<string, any>;
  duration?: number; // milliseconds
  tokenCount?: number;

  // Timestamps
  timestamp: Date;
  completedAt?: Date;
}

export interface ActivityContext {
  // What files/code is involved
  files?: string[];
  codeSnippets?: CodeSnippet[];

  // Related entities
  relatedTicketIds?: string[];
  relatedAgentIds?: string[];

  // For decisions
  alternatives?: Alternative[];
  selectedOption?: string;
  reasoning?: string;

  // For errors
  error?: ErrorInfo;

  // For tool calls
  toolCall?: ToolCallInfo;
}

export interface CodeSnippet {
  file: string;
  startLine?: number;
  endLine?: number;
  content: string;
  language?: string;
}

export interface Alternative {
  id: string;
  title: string;
  description: string;
  pros?: string[];
  cons?: string[];
  selected: boolean;
}

export interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string;
  recoverable: boolean;
}

export interface ToolCallInfo {
  tool: string;
  parameters: Record<string, any>;
  result?: any;
  duration?: number;
  success: boolean;
}

// ============================================================================
// Decision Record
// ============================================================================

export interface DecisionRecord {
  id: string;
  sessionId: string;
  ticketId: string;
  projectId: string;

  // Who made the decision
  agentId: string;
  agentName: string;
  agentRole: AgentRole;

  // Decision details
  category: DecisionCategory;
  title: string;
  description: string;

  // The decision process
  context: string; // What prompted this decision
  alternatives: Alternative[]; // Options considered
  selectedOption: string; // ID of selected alternative
  reasoning: string; // Why this option was chosen

  // Impact assessment
  impact: DecisionImpact;

  // For mentoring decisions
  mentoringTarget?: {
    agentId: string;
    agentName: string;
    topic: string;
    guidance: string;
  };

  // Timestamps and metadata
  timestamp: Date;
  relatedDecisionIds?: string[];
  tags?: string[];
}

export interface DecisionImpact {
  scope: 'LOCAL' | 'MODULE' | 'SYSTEM' | 'PROJECT';
  reversible: boolean;
  affectedFiles?: string[];
  affectedAgents?: string[];
  estimatedEffort?: number; // hours
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ============================================================================
// Mentoring Session
// ============================================================================

export interface MentoringSession {
  id: string;
  projectId: string;
  ticketId?: string;

  // Mentor (usually tech lead)
  mentorId: string;
  mentorName: string;
  mentorRole: AgentRole;

  // Mentee
  menteeId: string;
  menteeName: string;
  menteeRole: AgentRole;

  // Session details
  topic: string;
  context: string;

  // Guidance provided
  guidance: MentoringGuidance[];

  // Key takeaways (for persistent context)
  keyTakeaways: string[];
  codePatterns?: CodePattern[];

  // Status
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';

  // Timestamps
  startedAt: Date;
  completedAt?: Date;
}

export interface MentoringGuidance {
  id: string;
  type: 'EXPLANATION' | 'EXAMPLE' | 'WARNING' | 'BEST_PRACTICE' | 'SUGGESTION';
  title: string;
  content: string;
  codeExample?: CodeSnippet;
  timestamp: Date;
}

export interface CodePattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  usage: string;
  antiPattern?: string;
}

// ============================================================================
// Agent Control
// ============================================================================

export type AgentControlAction =
  | 'PAUSE' // Pause current work
  | 'RESUME' // Resume paused work
  | 'STOP' // Stop and cancel work
  | 'CORRECT' // Provide correction
  | 'REDIRECT' // Redirect approach
  | 'APPROVE' // Approve pending action
  | 'REJECT'; // Reject pending action

export interface AgentControlRequest {
  sessionId: string;
  action: AgentControlAction;
  reason?: string;

  // For corrections/redirections
  correction?: {
    what: string; // What to correct
    how: string; // How to correct it
    newDirection?: string; // New direction to take
  };

  // For approval/rejection
  approval?: {
    pendingActionId: string;
    approved: boolean;
    feedback?: string;
  };
}

export interface AgentControlResponse {
  success: boolean;
  sessionId: string;
  action: AgentControlAction;
  previousState: string;
  newState: string;
  message: string;
  timestamp: Date;
}

// ============================================================================
// Real-time Streaming
// ============================================================================

export interface StreamingActivity {
  id: string;
  sessionId: string;
  agentId: string;
  agentName: string;
  ticketId: string;

  type: 'THINKING' | 'ACTION' | 'DECISION' | 'OUTPUT';
  phase?: ThinkingPhase;

  // Streaming content
  content: string;
  isComplete: boolean;

  // For display
  displayType: 'TEXT' | 'CODE' | 'DIFF' | 'JSON' | 'MARKDOWN';
  language?: string;

  timestamp: Date;
}

export interface AgentStreamEvent {
  event:
    | 'activity_start'
    | 'activity_chunk'
    | 'activity_complete'
    | 'decision_made'
    | 'mentoring_start'
    | 'mentoring_guidance'
    | 'mentoring_complete'
    | 'control_received'
    | 'state_change'
    | 'error';

  data:
    | AgentActivity
    | DecisionRecord
    | MentoringSession
    | AgentControlResponse
    | ErrorInfo;
  timestamp: Date;
}

// ============================================================================
// Context Store Types
// ============================================================================

export interface AgentContextEntry {
  id: string;
  projectId: string;
  agentId?: string; // If agent-specific

  type: 'MENTORING' | 'DECISION' | 'PATTERN' | 'KNOWLEDGE' | 'WARNING';
  title: string;
  content: string;

  // Structured data
  data?: Record<string, any>;

  // Who should have access
  visibility: 'ALL' | 'ROLE' | 'AGENT';
  targetRoles?: AgentRole[];
  targetAgentIds?: string[];

  // Source
  sourceSessionId?: string;
  sourceTicketId?: string;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date;

  // Usage tracking
  accessCount: number;
  lastAccessedAt?: Date;
}

export interface AgentContextQuery {
  projectId: string;
  agentId?: string;
  agentRole?: AgentRole;
  types?: AgentContextEntry['type'][];
  limit?: number;
  includeExpired?: boolean;
}

// ============================================================================
// Activity Log Query
// ============================================================================

export interface ActivityLogQuery {
  projectId?: string;
  ticketId?: string;
  sessionId?: string;
  agentId?: string;
  agentRole?: AgentRole;
  types?: ActivityType[];
  phases?: ThinkingPhase[];

  // Time range
  from?: Date;
  to?: Date;

  // Pagination
  limit?: number;
  offset?: number;

  // Sorting
  sortBy?: 'timestamp' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityLogResult {
  activities: AgentActivity[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Session Summary
// ============================================================================

export interface SessionSummary {
  sessionId: string;
  ticketId: string;
  projectId: string;

  // Agent info
  agentId: string;
  agentName: string;
  agentRole: AgentRole;

  // Status
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'STOPPED';

  // Timestamps
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds

  // Activity summary
  activityCount: number;
  decisionCount: number;
  errorCount: number;

  // Key activities
  currentActivity?: AgentActivity;
  recentActivities: AgentActivity[];
  keyDecisions: DecisionRecord[];

  // If mentoring occurred
  mentoringSessions?: MentoringSession[];

  // Result
  result?: {
    success: boolean;
    summary: string;
    filesModified: string[];
    testsAdded: number;
    linesChanged: number;
  };
}
