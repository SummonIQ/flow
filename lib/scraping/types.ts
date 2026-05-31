export type ScraperStepBase = {
  id: string;
  name: string;
  type: string;
  delayMs?: number;
};

export type ScraperExtractHtmlStep = ScraperStepBase & {
  type: 'extractHtml';
};

export type ScraperNavigateStep = ScraperStepBase & {
  type: 'navigate';
  url: string;
};

export type ScraperQueryStep = ScraperStepBase & {
  type: 'query';
  selector: string;
  attribute?: string;
  outputKey: string;
};

export type ScraperClickStep = ScraperStepBase & {
  type: 'click';
  selector: string;
  tagName?: string;
  idAttr?: string;
  classes?: string[];
  text?: string;
  href?: string;
};

export type ScraperTypeStep = ScraperStepBase & {
  type: 'type';
  selector: string;
  value: string;
  pressEnter?: boolean;
};

export type ScraperConditionStep = ScraperStepBase & {
  type: 'condition';
  sourceKey: string;
  operator:
    | 'exists'
    | 'notExists'
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'notContains';
  value?: string;
  onFalse?: 'continue' | 'skipNext' | 'branch' | 'fail';
};

export type ScraperStep =
  | ScraperNavigateStep
  | ScraperExtractHtmlStep
  | ScraperQueryStep
  | ScraperClickStep
  | ScraperTypeStep
  | ScraperConditionStep;

export type ScraperDefinition = {
  id: string;
  name: string;
  startUrl: string;
  steps: ScraperStep[];
  settings?: {
    stepDelayMs?: number;
    cursorJitter?: boolean;
    cursorMove?: boolean;
    scrollNudge?: boolean;
    viewportWidth?: number;
    viewportHeight?: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type ScraperFixture = {
  id: string;
  name: string;
  description?: string;
  sourceScraperId?: string;
  steps: ScraperStep[];
  createdAt: string;
  updatedAt: string;
};

export type ScraperRunStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export type ScraperRunStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export type ScraperRunStepState = {
  stepId: string;
  status: ScraperRunStepStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  output?: unknown;
};

export type ScraperRun = {
  id: string;
  scraperId: string;
  status: ScraperRunStatus;
  startedAt: string;
  completedAt?: string;
  error?: string;
  steps: ScraperRunStepState[];
  results?: Record<string, unknown>;
};

export type ScraperRunEvent = {
  id: string;
  runId: string;
  scraperId: string;
  type:
    | 'run.started'
    | 'run.completed'
    | 'run.failed'
    | 'step.started'
    | 'step.completed'
    | 'step.failed'
    | 'log';
  createdAt: string;
  payload?: unknown;
};
