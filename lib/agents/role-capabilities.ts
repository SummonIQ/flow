/**
 * Role-specific capabilities matrix
 * Defines what tools, actions, and outputs each agent role can perform
 */

export type AgentRole =
  | 'PRODUCT_OWNER'
  | 'TECH_LEAD'
  | 'FRONTEND_ENGINEER'
  | 'BACKEND_ENGINEER'
  | 'FULLSTACK_ENGINEER'
  | 'QA_ENGINEER'
  | 'DESIGNER'
  | 'DEVOPS_ENGINEER'
  | 'SCRUM_MASTER';

export type ToolCategory =
  | 'code_edit'
  | 'code_read'
  | 'terminal'
  | 'file_create'
  | 'design_tools'
  | 'testing_tools'
  | 'deployment_tools'
  | 'documentation'
  | 'communication';

export type OutputType =
  | 'code'
  | 'spec'
  | 'design_mockup'
  | 'test_plan'
  | 'deployment_plan'
  | 'documentation'
  | 'review_feedback'
  | 'meeting_notes';

export interface RoleCapability {
  allowedTools: ToolCategory[];
  allowedOutputs: OutputType[];
  requiresApproval: ToolCategory[];
  canApprove: AgentRole[];
  description: string;
}

export const ROLE_CAPABILITIES: Record<AgentRole, RoleCapability> = {
  PRODUCT_OWNER: {
    allowedTools: ['code_read', 'documentation', 'communication'],
    allowedOutputs: ['spec', 'documentation', 'review_feedback'],
    requiresApproval: [],
    canApprove: ['DESIGNER', 'QA_ENGINEER'],
    description:
      'Defines requirements, prioritizes backlog, approves deliverables',
  },

  TECH_LEAD: {
    allowedTools: [
      'code_edit',
      'code_read',
      'terminal',
      'file_create',
      'documentation',
      'communication',
    ],
    allowedOutputs: ['code', 'spec', 'documentation', 'review_feedback'],
    requiresApproval: ['deployment_tools'],
    canApprove: [
      'FRONTEND_ENGINEER',
      'BACKEND_ENGINEER',
      'FULLSTACK_ENGINEER',
      'DEVOPS_ENGINEER',
    ],
    description: 'Reviews code, makes architectural decisions, mentors team',
  },

  FRONTEND_ENGINEER: {
    allowedTools: ['code_edit', 'code_read', 'terminal', 'file_create'],
    allowedOutputs: ['code', 'documentation'],
    requiresApproval: ['deployment_tools'],
    canApprove: [],
    description: 'Implements UI components, handles client-side logic',
  },

  BACKEND_ENGINEER: {
    allowedTools: ['code_edit', 'code_read', 'terminal', 'file_create'],
    allowedOutputs: ['code', 'documentation'],
    requiresApproval: ['deployment_tools'],
    canApprove: [],
    description: 'Implements APIs, database logic, server-side systems',
  },

  FULLSTACK_ENGINEER: {
    allowedTools: ['code_edit', 'code_read', 'terminal', 'file_create'],
    allowedOutputs: ['code', 'documentation'],
    requiresApproval: ['deployment_tools'],
    canApprove: [],
    description: 'Implements full-stack features across client and server',
  },

  QA_ENGINEER: {
    allowedTools: [
      'code_read',
      'testing_tools',
      'documentation',
      'communication',
    ],
    allowedOutputs: ['test_plan', 'documentation', 'review_feedback'],
    requiresApproval: [],
    canApprove: [],
    description: 'Creates test plans, executes tests, reports issues',
  },

  DESIGNER: {
    allowedTools: ['design_tools', 'documentation', 'communication'],
    allowedOutputs: ['design_mockup', 'spec', 'documentation'],
    requiresApproval: [],
    canApprove: [],
    description: 'Creates UI/UX designs, design systems, user flows',
  },

  DEVOPS_ENGINEER: {
    allowedTools: [
      'code_edit',
      'code_read',
      'terminal',
      'file_create',
      'deployment_tools',
    ],
    allowedOutputs: ['code', 'deployment_plan', 'documentation'],
    requiresApproval: ['deployment_tools'],
    canApprove: [],
    description: 'Manages infrastructure, CI/CD, deployments',
  },

  SCRUM_MASTER: {
    allowedTools: ['documentation', 'communication'],
    allowedOutputs: ['meeting_notes', 'documentation'],
    requiresApproval: [],
    canApprove: [],
    description: 'Facilitates ceremonies, removes blockers, tracks progress',
  },
};

/**
 * Check if a role can use a specific tool
 */
export function canUseTool(role: AgentRole, tool: ToolCategory): boolean {
  const capability = ROLE_CAPABILITIES[role];
  return capability?.allowedTools.includes(tool) ?? false;
}

/**
 * Check if a role can produce a specific output type
 */
export function canProduceOutput(role: AgentRole, output: OutputType): boolean {
  const capability = ROLE_CAPABILITIES[role];
  return capability?.allowedOutputs.includes(output) ?? false;
}

/**
 * Check if a tool requires approval for a role
 */
export function requiresApproval(role: AgentRole, tool: ToolCategory): boolean {
  const capability = ROLE_CAPABILITIES[role];
  return capability?.requiresApproval.includes(tool) ?? false;
}

/**
 * Get roles that a given role can approve work from
 */
export function getApprovableRoles(role: AgentRole): AgentRole[] {
  const capability = ROLE_CAPABILITIES[role];
  return capability?.canApprove ?? [];
}

/**
 * Get appropriate output type for a role given a task type
 */
export function getSuggestedOutput(
  role: AgentRole,
  taskType: string,
): OutputType {
  const capability = ROLE_CAPABILITIES[role];

  // Map task types to preferred outputs
  if (
    taskType === 'implementation' &&
    capability.allowedOutputs.includes('code')
  ) {
    return 'code';
  }
  if (
    taskType === 'design' &&
    capability.allowedOutputs.includes('design_mockup')
  ) {
    return 'design_mockup';
  }
  if (
    taskType === 'testing' &&
    capability.allowedOutputs.includes('test_plan')
  ) {
    return 'test_plan';
  }
  if (taskType === 'planning' && capability.allowedOutputs.includes('spec')) {
    return 'spec';
  }

  // Default to first allowed output
  return capability.allowedOutputs[0] ?? 'documentation';
}
