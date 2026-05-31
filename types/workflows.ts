export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';
export type AgentStepType = 'trigger' | 'agent' | 'condition' | 'delay' | 'manual' | 'api_call' | 'transform';

export type TriggerType = 'manual' | 'scheduled' | 'webhook' | 'event' | 'api';

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  metrics?: WorkflowMetrics;
  tags?: string[];
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  order: number;
  type: AgentStepType;
  name: string;
  agentId?: string;
  agentName?: string;
  triggerType?: TriggerType;
  triggerConfig?: TriggerConfig;
  config?: Record<string, any>;
  content: string;
  delay?: StepDelay;
  conditions?: StepCondition[];
  isEnabled: boolean;
  metrics?: StepMetrics;
}

export interface TriggerConfig {
  manual?: {
    requiresApproval?: boolean;
  };
  scheduled?: {
    cron: string;
    timezone?: string;
  };
  webhook?: {
    url: string;
    secret?: string;
  };
  event?: {
    eventType: string;
    filters?: Record<string, any>;
  };
  api?: {
    endpoint: string;
    method: string;
  };
}

export interface StepDelay {
  value: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface StepCondition {
  type: 'success' | 'failure' | 'timeout' | 'custom';
  action: 'continue' | 'stop' | 'retry' | 'branch';
  expression?: string;
}

export interface StepMetrics {
  executions: number;
  successes: number;
  failures: number;
  avgDuration: number;
}

export interface WorkflowMetrics {
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  lastRun?: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  context: Record<string, any>;
}
