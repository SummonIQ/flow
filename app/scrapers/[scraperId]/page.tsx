'use client';

import {
  PageActions,
  PageBody,
  PageDescription,
  Page,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-layout';

import {
  Badge,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  ChevronDown,
  GripHorizontal,
  MoreHorizontal,
  MousePointerClick,
  Pin,
  PinOff,
  Play,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  use,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type PropsWithChildren,
  type ReactElement,
} from 'react';
import ReactFlow, {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  PanOnScrollMode,
  Position,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type OnSelectionChangeParams,
} from 'reactflow';
import { toast } from 'sonner';
import 'reactflow/dist/style.css';

import {
  EmbeddedBrowser,
  type ElectronSender,
} from '@/components/runtime/embedded-browser';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { getPusherClient } from '@/lib/pusher/client';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const PageCard = Card as unknown as (
  props: PropsWithChildren<ComponentProps<'div'>>,
) => ReactElement;
const PageBadge = Badge as unknown as (
  props: PropsWithChildren<
    ComponentProps<'div'> & { variant?: any; className?: string }
  >,
) => ReactElement;
const Tabs = TabsPrimitive.Root;
const TabsListContainer = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      'relative inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground inset-shadow-sm',
      className,
    )}
    {...props}
  />
);
const TabsTrigger = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'relative z-20 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground/80',
      className,
    )}
    {...props}
  />
);
const TabsContentContainer = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn(
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
);

type ScraperStep =
  | {
      id: string;
      name: string;
      type: 'navigate';
      url: string;
      delayMs?: number;
    }
  | {
      id: string;
      name: string;
      type: 'extractHtml';
      delayMs?: number;
    }
  | {
      id: string;
      name: string;
      type: 'query';
      selector: string;
      attribute?: string;
      outputKey: string;
      delayMs?: number;
    }
  | {
      id: string;
      name: string;
      type: 'click';
      selector: string;
      tagName?: string;
      idAttr?: string;
      classes?: string[];
      text?: string;
      href?: string;
      delayMs?: number;
    }
  | {
      id: string;
      name: string;
      type: 'type';
      selector: string;
      value: string;
      pressEnter?: boolean;
      delayMs?: number;
    }
  | {
      id: string;
      name: string;
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
      delayMs?: number;
    };

type ScraperExtractHtmlStep = Extract<ScraperStep, { type: 'extractHtml' }>;
type ScraperNavigateStep = Extract<ScraperStep, { type: 'navigate' }>;
type ScraperQueryStep = Extract<ScraperStep, { type: 'query' }>;
type ScraperClickStep = Extract<ScraperStep, { type: 'click' }>;
type ScraperTypeStep = Extract<ScraperStep, { type: 'type' }>;
type ScraperConditionStep = Extract<ScraperStep, { type: 'condition' }>;
type ScraperStepType = ScraperStep['type'];

const SCRAPER_STEP_TYPE_OPTIONS: Array<{
  value: ScraperStepType;
  label: string;
}> = [
  { value: 'navigate', label: 'Navigate' },
  { value: 'extractHtml', label: 'Extract HTML' },
  { value: 'query', label: 'Query' },
  { value: 'click', label: 'Click' },
  { value: 'type', label: 'Type' },
  { value: 'condition', label: 'Condition' },
];

const SCRAPER_CONDITION_OPERATORS: Array<{
  value: ScraperConditionStep['operator'];
  label: string;
}> = [
  { value: 'exists', label: 'Exists' },
  { value: 'notExists', label: 'Does not exist' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
];

const SCRAPER_CONDITION_ON_FALSE_OPTIONS: Array<{
  value: NonNullable<ScraperConditionStep['onFalse']>;
  label: string;
}> = [
  { value: 'continue', label: 'Continue' },
  { value: 'skipNext', label: 'Skip next step' },
  { value: 'branch', label: 'Branch (true/false paths)' },
  { value: 'fail', label: 'Fail run' },
];

function isScraperStepType(value: string): value is ScraperStepType {
  return SCRAPER_STEP_TYPE_OPTIONS.some(option => option.value === value);
}

type ScraperDefinition = {
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

type ScraperFixture = {
  id: string;
  name: string;
  description?: string;
  sourceScraperId?: string;
  steps: ScraperStep[];
  createdAt: string;
  updatedAt: string;
};

type ScraperRun = {
  id: string;
  scraperId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  error?: string;
  steps: Array<{
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    error?: string;
    output?: unknown;
  }>;
  results?: Record<string, unknown>;
};

type RunEvent = {
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

type Suggestion = {
  name: string;
  type: 'query';
  selector: string;
  attribute?: string;
  outputKey: string;
};

type StepFlowNodeData = {
  step: ScraperStep;
  expanded: boolean;
  canUseElectron: boolean;
  runningStepId: string | null;
  scale: number;
  nodeWidth: number;
  onToggle: (stepId: string, append: boolean) => void;
  onRun: (step: ScraperStep) => void;
  onDelete: (stepId: string) => void;
};

type AddFlowNodeData = {
  scale: number;
  nodeWidth: number;
  onAdd: () => void;
};

type StartFlowNodeData = {
  scale: number;
  nodeWidth: number;
  onAdd: () => void;
};

function stepSummaryText(step: ScraperStep): string {
  if (step.type === 'navigate') return step.url;
  if (step.type === 'query') return step.selector;
  if (step.type === 'click') return step.selector || 'Pick element';
  if (step.type === 'type')
    return `${step.selector} <- ${step.value || '(empty)'}`;
  if (step.type === 'condition') {
    const rule =
      step.operator === 'exists'
        ? 'exists'
        : step.operator === 'notExists'
          ? 'missing'
          : `${step.operator} "${step.value ?? ''}"`;
    const onFalse =
      step.onFalse && step.onFalse !== 'continue'
        ? ` • on false: ${step.onFalse === 'branch' ? 'branch path' : step.onFalse}`
        : '';
    return `${step.sourceKey} ${rule}${onFalse}`;
  }
  return 'HTML snapshot';
}

function stepDetailLines(step: ScraperStep): string[] {
  if (step.type === 'navigate') {
    return [`URL: ${step.url}`];
  }
  if (step.type === 'extractHtml') {
    return ['Captures current page HTML snapshot.'];
  }
  if (step.type === 'query') {
    return [
      `Selector: ${step.selector}`,
      `Output key: ${step.outputKey}`,
      step.attribute
        ? `Attribute: ${step.attribute}`
        : 'Attribute: textContent',
    ];
  }
  if (step.type === 'click') {
    return [`Selector: ${step.selector || '(picked element metadata)'}`];
  }
  if (step.type === 'type') {
    return [
      `Selector: ${step.selector}`,
      `Value: ${step.value || '(empty)'}`,
      `Press Enter: ${step.pressEnter ? 'yes' : 'no'}`,
    ];
  }
  return [
    `Source key: ${step.sourceKey}`,
    `Operator: ${step.operator}`,
    conditionOperatorNeedsValue(step.operator)
      ? `Expected: ${step.value ?? '(empty)'}`
      : 'Expected: n/a',
    `On false: ${step.onFalse ?? 'continue'}`,
  ];
}

function readConditionInputValue(
  step: ScraperConditionStep,
  results: Record<string, unknown>,
): string | undefined {
  const raw = results[step.sourceKey];
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
  if (typeof raw === 'object' && raw !== null && 'value' in raw) {
    const nested = (raw as { value?: unknown }).value;
    if (nested === null || nested === undefined) return undefined;
    if (typeof nested === 'string') return nested;
    if (typeof nested === 'number' || typeof nested === 'boolean') {
      return String(nested);
    }
  }
  return String(raw);
}

function evaluateConditionStep(
  step: ScraperConditionStep,
  results: Record<string, unknown>,
): {
  passed: boolean;
  actual?: string;
} {
  const actual = readConditionInputValue(step, results);
  const expected = step.value ?? '';

  if (step.operator === 'exists') {
    return { passed: Boolean(actual && actual.length), actual };
  }
  if (step.operator === 'notExists') {
    return { passed: !actual || actual.length === 0, actual };
  }
  if (step.operator === 'equals') {
    return { passed: (actual ?? '') === expected, actual };
  }
  if (step.operator === 'notEquals') {
    return { passed: (actual ?? '') !== expected, actual };
  }
  if (step.operator === 'contains') {
    return { passed: (actual ?? '').includes(expected), actual };
  }
  return { passed: !(actual ?? '').includes(expected), actual };
}

function conditionOperatorNeedsValue(
  operator: ScraperConditionStep['operator'],
): boolean {
  return operator !== 'exists' && operator !== 'notExists';
}

function StepFlowNode({ data, selected }: NodeProps<StepFlowNodeData>) {
  const isRunning = data.runningStepId === data.step.id;
  const iconSize = Math.round(28 * data.scale);
  const iconGlyphSize = Math.max(12, Math.round(14 * data.scale));

  return (
    <div
      className={`group/flow-step rounded-xl border bg-background/70 shadow-[0_10px_20px_-18px_rgba(0,0,0,0.7)] transition-colors ${selected ? 'border-teal-400/60' : 'border-border/60 hover:bg-muted/30'}`}
      style={{ width: data.nodeWidth }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-none !bg-muted/40"
      />
      <div
        className="flex items-center justify-between transition-[padding,gap] duration-150"
        style={{
          gap: Math.max(8, Math.round(12 * data.scale)),
          padding: Math.max(10, Math.round(12 * data.scale)),
        }}
      >
        <button
          type="button"
          className="nodrag group flex min-w-0 flex-1 items-center gap-3 text-left"
          onPointerDown={event => event.stopPropagation()}
          onClick={event => {
            event.stopPropagation();
            data.onToggle(data.step.id, event.metaKey || event.ctrlKey);
          }}
        >
          <span
            className="flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30 text-muted-foreground transition-[width,height] duration-150"
            style={{ width: iconSize, height: iconSize }}
          >
            <ChevronDown
              className={`transition-transform ${data.expanded ? 'rotate-180' : ''}`}
              style={{ width: iconGlyphSize, height: iconGlyphSize }}
            />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {data.step.name}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {stepSummaryText(data.step)}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="nodrag h-8 w-8 px-0 opacity-0 pointer-events-none transition-opacity group-hover/flow-step:opacity-100 group-hover/flow-step:pointer-events-auto"
            onClick={() => data.onRun(data.step)}
            disabled={!data.canUseElectron || Boolean(data.runningStepId)}
          >
            <Play className={`h-4 w-4 ${isRunning ? 'animate-pulse' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="nodrag h-8 w-8 px-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => data.onRun(data.step)}
                disabled={!data.canUseElectron || Boolean(data.runningStepId)}
              >
                <Play className="h-4 w-4" />
                Run step
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => data.onDelete(data.step.id)}>
                <Trash2 className="h-4 w-4" />
                Delete step
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {data.expanded ? (
        <div className="border-t border-border/50 px-3 pb-3 pt-2">
          <div className="space-y-1 text-[11px] leading-4 text-muted-foreground">
            {stepDetailLines(data.step).map((line, index) => (
              <div key={`${data.step.id}-detail-${index}`}>{line}</div>
            ))}
          </div>
        </div>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-muted/40"
      />
    </div>
  );
}

function AddFlowNode({ data }: NodeProps<AddFlowNodeData>) {
  return (
    <div
      className="rounded-xl border border-border/50 border-dashed bg-muted/10 transition-[padding,width] duration-150"
      style={{
        width: data.nodeWidth,
        padding: Math.max(10, Math.round(12 * data.scale)),
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-none !bg-muted/30"
      />
      <Button
        size="sm"
        variant="secondary"
        className="nodrag w-full justify-center"
        onClick={data.onAdd}
      >
        <Plus className="h-4 w-4" />
        Add step / conditional
      </Button>
    </div>
  );
}

function StartFlowNode({ data }: NodeProps<StartFlowNodeData>) {
  const iconSize = Math.round(28 * data.scale);
  const iconGlyphSize = Math.max(12, Math.round(14 * data.scale));

  return (
    <div
      className="rounded-xl border border-border/60 bg-background/70 shadow-[0_10px_20px_-18px_rgba(0,0,0,0.7)] transition-[padding,width] duration-150"
      style={{
        width: data.nodeWidth,
        padding: Math.max(10, Math.round(12 * data.scale)),
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30 text-muted-foreground transition-[width,height] duration-150"
            style={{ width: iconSize, height: iconSize }}
          >
            <ChevronDown
              className="rotate-180"
              style={{ width: iconGlyphSize, height: iconGlyphSize }}
            />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              Start workflow
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              Add your first action or condition
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="nodrag h-7"
          onClick={data.onAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-muted/35"
      />
    </div>
  );
}

const flowNodeTypes = {
  step: StepFlowNode,
  start: StartFlowNode,
  add: AddFlowNode,
};

type InsertEdgeData = {
  onInsert?: () => void;
};

function InsertableFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
}: EdgeProps<InsertEdgeData>) {
  const [isHovered, setIsHovered] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {data?.onInsert ? (
        <EdgeLabelRenderer>
          <button
            type="button"
            className={cn(
              'nodrag nopan pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background/40 text-muted-foreground shadow-sm backdrop-blur transition-all',
              isHovered
                ? 'scale-105 bg-background/80 text-foreground'
                : 'opacity-55 hover:opacity-90',
            )}
            style={{
              position: 'absolute',
              left: `${labelX}px`,
              top: `${labelY}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              data.onInsert?.();
            }}
            aria-label="Insert step"
            title="Insert step"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

const flowEdgeTypes = {
  insertable: InsertableFlowEdge,
};

const MOBILE_VIEWPORT = { width: 414, height: 896 };

function uid(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function cloneStepWithFreshId(step: ScraperStep): ScraperStep {
  if (step.type === 'extractHtml') {
    return {
      ...step,
      id: uid(),
    };
  }

  if (step.type === 'query') {
    return {
      ...step,
      id: uid(),
    };
  }

  if (step.type === 'click') {
    return {
      ...step,
      id: uid(),
    };
  }

  return {
    ...step,
    id: uid(),
  };
}

export default function ScraperDetailsPage({
  params,
}: {
  params: Promise<{ scraperId: string }>;
}) {
  const { scraperId } = use(params);

  const [scraper, setScraper] = useState<ScraperDefinition | null>(null);
  const [runs, setRuns] = useState<ScraperRun[]>([]);

  const [electronSend, setElectronSend] = useState<ElectronSender>(null);

  const [queryName, setQueryName] = useState('Query');
  const [querySelector, setQuerySelector] = useState('');
  const [queryAttribute, setQueryAttribute] = useState('');
  const [queryOutputKey, setQueryOutputKey] = useState('value');

  const [lastHtml, setLastHtml] = useState<{
    href: string;
    html: string;
  } | null>(null);

  const [running, setRunning] = useState(false);
  const [activeRun, setActiveRun] = useState<ScraperRun | null>(null);
  const [events, setEvents] = useState<RunEvent[]>([]);

  const [activeTab, setActiveTab] = useState('build');
  const [viewportMode, setViewportMode] = useState<
    'desktop' | 'mobile' | 'custom'
  >('desktop');
  const [customViewportWidth, setCustomViewportWidth] = useState('');
  const [customViewportHeight, setCustomViewportHeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [addStepOpen, setAddStepOpen] = useState(false);
  const [stepsEditorTab, setStepsEditorTab] = useState<'setup' | 'workflow'>(
    'workflow',
  );
  const [newStepType, setNewStepType] = useState<
    'navigate' | 'extractHtml' | 'query' | 'click' | 'type' | 'condition'
  >('extractHtml');
  const [newStepName, setNewStepName] = useState('');
  const [navigateUrl, setNavigateUrl] = useState('https://example.com');
  const [clickSelector, setClickSelector] = useState('');
  const [typeSelector, setTypeSelector] = useState('');
  const [typeValue, setTypeValue] = useState('');
  const [typePressEnter, setTypePressEnter] = useState(false);
  const [conditionSourceKey, setConditionSourceKey] = useState('value');
  const [conditionOperator, setConditionOperator] =
    useState<ScraperConditionStep['operator']>('exists');
  const [conditionValue, setConditionValue] = useState('');
  const [conditionOnFalse, setConditionOnFalse] =
    useState<NonNullable<ScraperConditionStep['onFalse']>>('continue');
  const [pendingInsertIndex, setPendingInsertIndex] = useState<number | null>(
    null,
  );
  const [hoveredConnectorIndex, setHoveredConnectorIndex] = useState<
    number | null
  >(null);
  const [newStepDelayMs, setNewStepDelayMs] = useState('');

  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [fixtures, setFixtures] = useState<ScraperFixture[]>([]);
  const [savingFixture, setSavingFixture] = useState(false);
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>([]);
  const workflowCanvasRef = useRef<HTMLDivElement | null>(null);
  const [workflowCanvasWidth, setWorkflowCanvasWidth] = useState(0);
  const buildSurfaceRef = useRef<HTMLDivElement | null>(null);
  const [browserDocked, setBrowserDocked] = useState(true);
  const [floatingBrowserOpen, setFloatingBrowserOpen] = useState(true);
  const [floatingBrowserRect, setFloatingBrowserRect] = useState({
    x: 24,
    y: 24,
    width: 480,
    height: 520,
  });
  const floatingBrowserInteractionRef = useRef<{
    type: 'drag' | 'resize';
    startPointerX: number;
    startPointerY: number;
    startRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  } | null>(null);

  const stepDelayMs = scraper?.settings?.stepDelayMs ?? 0;
  const cursorJitter = Boolean(scraper?.settings?.cursorJitter);
  const cursorMove = Boolean(scraper?.settings?.cursorMove);
  const scrollNudge = Boolean(scraper?.settings?.scrollNudge);

  const sleep = useCallback(async (ms: number) => {
    if (!ms) return;
    await new Promise(resolve => setTimeout(resolve, ms));
  }, []);

  const clampFloatingBrowserRect = useCallback(
    (next: { x: number; y: number; width: number; height: number }) => {
      const bounds = buildSurfaceRef.current?.getBoundingClientRect();
      if (!bounds) return next;

      const margin = 12;
      const maxWidth = Math.max(360, bounds.width - margin * 2);
      const maxHeight = Math.max(260, bounds.height - margin * 2);
      const width = Math.max(420, Math.min(next.width, maxWidth));
      const height = Math.max(280, Math.min(next.height, maxHeight));
      const x = Math.max(
        margin,
        Math.min(next.x, bounds.width - width - margin),
      );
      const y = Math.max(
        margin,
        Math.min(next.y, bounds.height - height - margin),
      );

      return { x, y, width, height };
    },
    [],
  );

  const startFloatingBrowserDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      floatingBrowserInteractionRef.current = {
        type: 'drag',
        startPointerX: event.clientX,
        startPointerY: event.clientY,
        startRect: floatingBrowserRect,
      };
    },
    [floatingBrowserRect],
  );

  const startFloatingBrowserResize = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      floatingBrowserInteractionRef.current = {
        type: 'resize',
        startPointerX: event.clientX,
        startPointerY: event.clientY,
        startRect: floatingBrowserRect,
      };
    },
    [floatingBrowserRect],
  );

  const htmlWaiter = useRef<
    ((payload: { href: string; html: string }) => void) | null
  >(null);
  const queryWaiters = useRef(
    new Map<string, (payload: { value: string; href: string }) => void>(),
  );
  const clickWaiters = useRef(
    new Map<string, (payload: { clicked: boolean; href: string }) => void>(),
  );
  const typeWaiters = useRef(
    new Map<
      string,
      (payload: { typed: boolean; href: string; value: string }) => void
    >(),
  );

  const [pickerStepId, setPickerStepId] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewLog, setPreviewLog] = useState<string[]>([]);
  const [runningStepId, setRunningStepId] = useState<string | null>(null);

  const canUseElectron = Boolean(electronSend);
  const conditionSourceOptions = useMemo(() => {
    if (!scraper) {
      return ['value'];
    }

    const keys: string[] = ['value'];
    for (const step of scraper.steps) {
      if (step.type === 'query') {
        keys.push(step.outputKey);
      }
      if (step.type === 'type') {
        keys.push(`${step.id}:value`);
      }
    }

    return Array.from(
      new Set(keys.map(key => key.trim()).filter(key => key.length > 0)),
    );
  }, [scraper]);

  const resolveConditionSourceForInsert = useCallback(
    (insertIndex: number | null): string => {
      if (!scraper) return conditionSourceOptions[0] ?? 'value';
      const boundedIndex = Math.max(
        0,
        Math.min(insertIndex ?? scraper.steps.length, scraper.steps.length),
      );
      for (let cursor = boundedIndex - 1; cursor >= 0; cursor -= 1) {
        const candidate = scraper.steps[cursor];
        if (candidate.type === 'query') return candidate.outputKey;
        if (candidate.type === 'type') return `${candidate.id}:value`;
      }
      return conditionSourceOptions[0] ?? 'value';
    },
    [conditionSourceOptions, scraper],
  );

  const openAddStepComposer = useCallback(
    (
      stepType: ScraperStepType,
      insertIndex: number | null,
      branchMode = false,
    ) => {
      setAddStepOpen(true);
      setPendingInsertIndex(insertIndex);
      setHoveredConnectorIndex(null);
      setNewStepType(stepType);
      setNewStepName('');
      setNewStepDelayMs('');
      setNavigateUrl(scraper?.startUrl || 'https://example.com');
      if (stepType === 'condition') {
        setConditionSourceKey(resolveConditionSourceForInsert(insertIndex));
        setConditionOperator('exists');
        setConditionValue('');
        setConditionOnFalse(branchMode ? 'branch' : 'continue');
      }
    },
    [resolveConditionSourceForInsert, scraper?.startUrl],
  );

  const handleElectronSendReady = useCallback((sender: ElectronSender) => {
    setElectronSend((prev: ElectronSender) =>
      prev === sender ? prev : sender,
    );
  }, []);

  const loadScraper = useCallback(async () => {
    const resp = await fetch(`/api/scrapers/${scraperId}`);
    if (!resp.ok) {
      setScraper(null);
      return;
    }
    const json = await resp.json();
    const next = (json?.scraper as ScraperDefinition) ?? null;
    if (!next) {
      setScraper(null);
      return;
    }
    const isUpworkScraper =
      /upwork/i.test(next.name) || /upwork\.com/i.test(next.startUrl);
    const firstStep = next.steps[0];
    const needsUpworkNavigate =
      isUpworkScraper &&
      (firstStep?.type !== 'navigate' ||
        !/upwork\.com/i.test(firstStep?.type === 'navigate' ? firstStep.url : ''));

    if (needsUpworkNavigate) {
      const normalized: ScraperDefinition = {
        ...next,
        steps: [
          {
            id: uid(),
            name: 'Navigate to Upwork',
            type: 'navigate',
            url: 'https://www.upwork.com',
          } as ScraperStep,
          ...next.steps,
        ],
      };
      setScraper(normalized);
      await fetch(`/api/scrapers/${scraperId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: normalized.name,
          startUrl: normalized.startUrl,
          steps: normalized.steps,
          settings: normalized.settings ?? {},
        }),
      }).catch(() => null);
      return;
    }
    setScraper(next);
  }, [scraperId]);

  const loadRuns = useCallback(async () => {
    const resp = await fetch(`/api/scrapers/${scraperId}/runs`);
    if (!resp.ok) return;
    const json = await resp.json();
    const next = Array.isArray(json?.runs) ? (json.runs as ScraperRun[]) : [];
    setRuns(next);
  }, [scraperId]);

  const loadFixtures = useCallback(async () => {
    const resp = await fetch('/api/scrapers/fixtures');
    if (!resp.ok) return;
    const json = await resp.json();
    const next = Array.isArray(json?.fixtures)
      ? (json.fixtures as ScraperFixture[])
      : [];
    setFixtures(next);
  }, []);

  useEffect(() => {
    void loadScraper();
    void loadRuns();
    void loadFixtures();
  }, [loadFixtures, loadRuns, loadScraper]);

  useEffect(() => {
    if (!activeRun?.id) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`scraper-run-${activeRun.id}`);

    const onEvent = (data: any) => {
      const event = data?.event as RunEvent | undefined;
      if (!event?.id) return;
      setEvents(prev =>
        prev.some(e => e.id === event.id) ? prev : [event, ...prev],
      );
    };

    const onRunUpdated = (data: any) => {
      const run = data?.run as ScraperRun | undefined;
      if (!run?.id) return;
      setActiveRun(run);
    };

    channel.bind('scraper-event', onEvent);
    channel.bind('scraper-run-updated', onRunUpdated);

    return () => {
      channel.unbind('scraper-event', onEvent);
      channel.unbind('scraper-run-updated', onRunUpdated);
      pusher.unsubscribe(`scraper-run-${activeRun.id}`);
    };
  }, [activeRun?.id]);

  useEffect(() => {
    if (!activeRun?.id) return;

    let cancelled = false;

    const load = async () => {
      const resp = await fetch(`/api/scrapers/runs/${activeRun.id}/events`);
      if (!resp.ok) return;
      const json = await resp.json();
      const incoming = Array.isArray(json?.events)
        ? (json.events as RunEvent[])
        : [];
      if (cancelled) return;

      setEvents(prev => {
        const seen = new Set(prev.map(e => e.id));
        const merged = [...prev];
        for (const e of incoming) {
          if (e?.id && !seen.has(e.id)) {
            seen.add(e.id);
            merged.push(e);
          }
        }
        merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        return merged;
      });
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [activeRun?.id]);

  const saveScraper = useCallback(async () => {
    if (!scraper) return;
    if (saving) return;

    setSaving(true);

    const resp = await fetch(`/api/scrapers/${scraper.id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: scraper.name,
        startUrl: scraper.startUrl,
        steps: scraper.steps,
        settings: scraper.settings ?? {},
      }),
    });

    if (!resp.ok) {
      toast.error('Save failed.');
      setSaving(false);
      return;
    }
    await loadScraper();
    toast.success('Scraper saved.');
    setSaving(false);
  }, [loadScraper, scraper, saving]);

  const addExtractHtmlStep = useCallback(() => {
    if (!scraper) return;
    const step: ScraperStep = {
      id: uid(),
      name: 'Extract HTML',
      type: 'extractHtml',
    };
    setScraper({
      ...scraper,
      steps: [...scraper.steps, step],
    });
  }, [scraper]);

  const addQueryStep = useCallback(() => {
    if (!scraper) return;

    const selector = querySelector.trim();
    const outputKey = queryOutputKey.trim();
    if (!selector || !outputKey) return;

    const step: ScraperStep = {
      id: uid(),
      name: queryName.trim() || 'Query',
      type: 'query',
      selector,
      attribute: queryAttribute.trim() || undefined,
      outputKey,
    };

    setScraper({
      ...scraper,
      steps: [...scraper.steps, step],
    });
  }, [queryAttribute, queryName, queryOutputKey, querySelector, scraper]);

  const addClickStep = useCallback(() => {
    if (!scraper) return;
    const step: ScraperStep = {
      id: uid(),
      name: 'Click element',
      type: 'click',
      selector: '',
    };
    setScraper({
      ...scraper,
      steps: [...scraper.steps, step],
    });
  }, [scraper]);

  const addStepFromForm = useCallback(() => {
    if (!scraper) return;
    const baseName = newStepName.trim();
    const delayValue = newStepDelayMs.trim();
    const delayMs = delayValue ? Number(delayValue) : undefined;
    const safeDelay = Number.isFinite(delayMs) ? delayMs : undefined;
    const insertAt = Math.max(
      0,
      Math.min(
        pendingInsertIndex ?? scraper.steps.length,
        scraper.steps.length,
      ),
    );
    const commitStep = (step: ScraperStep) => {
      const nextSteps = [...scraper.steps];
      nextSteps.splice(insertAt, 0, step);
      setScraper({ ...scraper, steps: nextSteps });
      setAddStepOpen(false);
      setPendingInsertIndex(null);
      setNewStepName('');
      setNewStepDelayMs('');
      setNavigateUrl(scraper.startUrl || 'https://example.com');
    };

    if (newStepType === 'navigate') {
      const url = navigateUrl.trim();
      if (!url) {
        toast.error('Navigate steps need a URL.');
        return;
      }
      const step: ScraperStep = {
        id: uid(),
        name: baseName || 'Navigate',
        type: 'navigate',
        url,
        delayMs: safeDelay,
      };
      commitStep(step);
      return;
    }

    if (newStepType === 'extractHtml') {
      const step: ScraperStep = {
        id: uid(),
        name: baseName || 'Extract HTML',
        type: 'extractHtml',
        delayMs: safeDelay,
      };
      commitStep(step);
      return;
    }

    if (newStepType === 'query') {
      const selector = querySelector.trim();
      const outputKey = queryOutputKey.trim();
      if (!selector || !outputKey) {
        toast.error('Query steps need a selector and output key.');
        return;
      }
      const step: ScraperStep = {
        id: uid(),
        name: baseName || queryName.trim() || 'Query',
        type: 'query',
        selector,
        attribute: queryAttribute.trim() || undefined,
        outputKey,
        delayMs: safeDelay,
      };
      commitStep(step);
      return;
    }

    if (newStepType === 'type') {
      const selector = typeSelector.trim();
      if (!selector) {
        toast.error('Type steps need a selector.');
        return;
      }
      const step: ScraperStep = {
        id: uid(),
        name: baseName || 'Type into input',
        type: 'type',
        selector,
        value: typeValue,
        pressEnter: typePressEnter || undefined,
        delayMs: safeDelay,
      };
      commitStep(step);
      setTypeSelector('');
      setTypeValue('');
      setTypePressEnter(false);
      return;
    }

    if (newStepType === 'condition') {
      const sourceKey = conditionSourceKey.trim();
      if (!sourceKey) {
        toast.error('Condition steps need an output key.');
        return;
      }
      const step: ScraperStep = {
        id: uid(),
        name: baseName || 'Check condition',
        type: 'condition',
        sourceKey,
        operator: conditionOperator,
        value: conditionOperatorNeedsValue(conditionOperator)
          ? conditionValue.trim()
          : undefined,
        onFalse: conditionOnFalse,
        delayMs: safeDelay,
      };
      commitStep(step);
      setConditionValue('');
      return;
    }

    const step: ScraperStep = {
      id: uid(),
      name: baseName || 'Click element',
      type: 'click',
      selector: clickSelector.trim(),
      delayMs: safeDelay,
    };
    commitStep(step);
    setClickSelector('');
  }, [
    clickSelector,
    conditionOnFalse,
    conditionOperator,
    conditionSourceKey,
    conditionValue,
    navigateUrl,
    newStepName,
    newStepDelayMs,
    newStepType,
    pendingInsertIndex,
    queryAttribute,
    queryName,
    queryOutputKey,
    querySelector,
    scraper,
    typePressEnter,
    typeSelector,
    typeValue,
  ]);

  const removeStep = useCallback(
    (stepId: string) => {
      if (!scraper) return;
      setScraper({
        ...scraper,
        steps: scraper.steps.filter(s => s.id !== stepId),
      });
      setSelectedStepIds(prev => prev.filter(id => id !== stepId));
      setExpandedStepId(prev => (prev === stepId ? null : prev));
    },
    [scraper],
  );

  const patchStep = useCallback(
    (
      stepId: string,
      patch:
        | Partial<ScraperNavigateStep>
        | Partial<ScraperExtractHtmlStep>
        | Partial<ScraperQueryStep>
        | Partial<ScraperClickStep>
        | Partial<ScraperTypeStep>
        | Partial<ScraperConditionStep>,
    ) => {
      if (!scraper) return;
      setScraper({
        ...scraper,
        steps: scraper.steps.map(s => {
          if (s.id !== stepId) return s;

          if (s.type === 'query') {
            return {
              ...s,
              ...(patch as Partial<ScraperQueryStep>),
            };
          }

          if (s.type === 'click') {
            return {
              ...s,
              ...(patch as Partial<ScraperClickStep>),
            };
          }

          if (s.type === 'type') {
            return {
              ...s,
              ...(patch as Partial<ScraperTypeStep>),
            };
          }

          if (s.type === 'condition') {
            return {
              ...s,
              ...(patch as Partial<ScraperConditionStep>),
            };
          }

          if (s.type === 'navigate') {
            return {
              ...s,
              ...(patch as Partial<ScraperNavigateStep>),
            };
          }

          return {
            ...s,
            ...(patch as Partial<ScraperExtractHtmlStep>),
          };
        }),
      });
    },
    [scraper],
  );

  const setStepType = useCallback(
    (stepId: string, nextType: ScraperStepType) => {
      if (!scraper) return;
      setScraper({
        ...scraper,
        steps: scraper.steps.map(step => {
          if (step.id !== stepId || step.type === nextType) {
            return step;
          }

          const base = {
            id: step.id,
            name: step.name,
            delayMs: step.delayMs,
          };

          const selector =
            step.type === 'query' ||
            step.type === 'click' ||
            step.type === 'type'
              ? step.selector
              : '';
          const url =
            step.type === 'navigate' ? step.url : scraper.startUrl || '';

          if (nextType === 'navigate') {
            return {
              ...base,
              type: 'navigate' as const,
              url: url || 'https://example.com',
            };
          }

          if (nextType === 'extractHtml') {
            return {
              ...base,
              type: 'extractHtml' as const,
            };
          }

          if (nextType === 'query') {
            return {
              ...base,
              type: 'query' as const,
              selector,
              attribute:
                step.type === 'query'
                  ? (step.attribute ?? undefined)
                  : undefined,
              outputKey: step.type === 'query' ? step.outputKey : 'value',
            };
          }

          if (nextType === 'click') {
            return {
              ...base,
              type: 'click' as const,
              selector,
            };
          }

          if (nextType === 'condition') {
            return {
              ...base,
              type: 'condition' as const,
              sourceKey:
                step.type === 'query'
                  ? step.outputKey
                  : step.type === 'condition'
                    ? step.sourceKey
                    : 'value',
              operator:
                step.type === 'condition' ? step.operator : ('exists' as const),
              value: step.type === 'condition' ? step.value : undefined,
              onFalse:
                step.type === 'condition'
                  ? (step.onFalse ?? undefined)
                  : ('continue' as const),
            };
          }

          return {
            ...base,
            type: 'type' as const,
            selector,
            value: step.type === 'type' ? step.value : '',
            pressEnter:
              step.type === 'type' ? (step.pressEnter ?? undefined) : undefined,
          };
        }),
      });
    },
    [scraper],
  );

  const saveStepSelectionAsFixture = useCallback(async () => {
    if (!scraper) return;
    if (savingFixture) return;
    if (!selectedStepIds.length) {
      toast.error('Select at least one step first.');
      return;
    }

    const name = window.prompt('Fixture name');
    const trimmedName = name?.trim() ?? '';
    if (!trimmedName) {
      return;
    }

    const selectedSet = new Set(selectedStepIds);
    const selectedSteps = scraper.steps.filter(step =>
      selectedSet.has(step.id),
    );

    if (!selectedSteps.length) {
      toast.error('No valid steps selected.');
      return;
    }

    setSavingFixture(true);
    try {
      const resp = await fetch('/api/scrapers/fixtures', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          sourceScraperId: scraper.id,
          steps: selectedSteps,
        }),
      });
      if (!resp.ok) {
        toast.error('Failed to save fixture.');
        return;
      }

      await loadFixtures();
      toast.success('Fixture created from selected steps.');
    } finally {
      setSavingFixture(false);
    }
  }, [loadFixtures, scraper, savingFixture, selectedStepIds]);

  const applyFixtureSteps = useCallback(
    (fixture: ScraperFixture, mode: 'append' | 'replace') => {
      if (!scraper) return;
      const cloned = fixture.steps.map(cloneStepWithFreshId);
      setScraper({
        ...scraper,
        steps: mode === 'replace' ? cloned : [...scraper.steps, ...cloned],
      });
      toast.success(
        mode === 'replace'
          ? `Replaced steps with fixture "${fixture.name}".`
          : `Added fixture "${fixture.name}" steps.`,
      );
    },
    [scraper],
  );

  const deleteFixtureById = useCallback(async (fixture: ScraperFixture) => {
    const ok = window.confirm(`Delete fixture "${fixture.name}"?`);
    if (!ok) return;

    const resp = await fetch(`/api/scrapers/fixtures/${fixture.id}`, {
      method: 'DELETE',
    });
    if (!resp.ok) {
      toast.error('Failed to delete fixture.');
      return;
    }

    setFixtures(prev => prev.filter(item => item.id !== fixture.id));
    toast.success('Fixture deleted.');
  }, []);

  const toggleStepSelection = useCallback((stepId: string) => {
    setSelectedStepIds(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId],
    );
  }, []);

  const selectOnlyStep = useCallback((stepId: string) => {
    setSelectedStepIds([stepId]);
  }, []);

  const clearStepSelection = useCallback(() => {
    setSelectedStepIds([]);
  }, []);

  const removeSelectedSteps = useCallback(() => {
    if (!scraper || !selectedStepIds.length) return;
    const selected = new Set(selectedStepIds);
    setScraper({
      ...scraper,
      steps: scraper.steps.filter(step => !selected.has(step.id)),
    });
    setSelectedStepIds([]);
    toast.success('Removed selected steps.');
  }, [scraper, selectedStepIds]);

  const handleStepFlowSelection = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selected = nodes
        .map(node => node.id)
        .filter(id => id !== '__add__' && id !== '__start__');
      setSelectedStepIds(selected);
    },
    [],
  );

  const waitForHtml = useCallback(async () => {
    return await new Promise<{ href: string; html: string }>(resolve => {
      htmlWaiter.current = resolve;
    });
  }, []);

  const waitForQuery = useCallback(async (stepId: string) => {
    return await new Promise<{ href: string; value: string }>(resolve => {
      queryWaiters.current.set(stepId, resolve);
    });
  }, []);

  const waitForClick = useCallback(async (stepId: string) => {
    return await new Promise<{ href: string; clicked: boolean }>(resolve => {
      clickWaiters.current.set(stepId, resolve);
    });
  }, []);

  const waitForType = useCallback(async (stepId: string) => {
    return await new Promise<{ href: string; typed: boolean; value: string }>(
      resolve => {
        typeWaiters.current.set(stepId, resolve);
      },
    );
  }, []);

  const startElementPicker = useCallback(
    (stepId: string) => {
      if (!electronSend) {
        toast.error('Electron is not ready yet.');
        return;
      }
      setPickerStepId(stepId);
      electronSend('flow:scraperPickStart', { stepId });
    },
    [electronSend],
  );

  const startAddStepPicker = useCallback(
    (mode: 'query' | 'click' | 'type') => {
      if (!electronSend) {
        toast.error('Electron is not ready yet.');
        return;
      }
      const stepId = `add-step-${mode}`;
      setPickerStepId(stepId);
      electronSend('flow:scraperPickStart', { stepId });
    },
    [electronSend],
  );

  const stopElementPicker = useCallback(() => {
    if (!electronSend) return;
    setPickerStepId(null);
    electronSend('flow:scraperPickStop');
  }, [electronSend]);

  const sendRunEvent = useCallback(
    async (
      runId: string,
      scraperIdValue: string,
      type: RunEvent['type'],
      payload?: unknown,
    ) => {
      await fetch(`/api/scrapers/runs/${runId}/events`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scraperId: scraperIdValue,
          type,
          payload,
        }),
      });
    },
    [],
  );

  const addSuggestionStep = useCallback(
    (suggestion: Suggestion) => {
      if (!scraper) return;

      const step: ScraperStep = {
        id: uid(),
        name: suggestion.name,
        type: 'query',
        selector: suggestion.selector,
        attribute: suggestion.attribute,
        outputKey: suggestion.outputKey,
      };

      setScraper({
        ...scraper,
        steps: [...scraper.steps, step],
      });
    },
    [scraper],
  );

  const handleSuggest = useCallback(async () => {
    if (!scraper) return;
    if (!electronSend) {
      toast.error('Electron is not ready yet.');
      return;
    }
    if (suggesting) return;

    setSuggesting(true);
    setSuggestError(null);
    setSuggestions([]);

    try {
      electronSend('flow:scraperExtractHtml');
      const snap = await waitForHtml();

      const resp = await fetch('/api/scrapers/suggest', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ url: snap.href, html: snap.html }),
      });

      if (!resp.ok) {
        setSuggestError('Suggest request failed');
        return;
      }

      const json = await resp.json();
      const incoming = Array.isArray(json?.suggestions)
        ? (json.suggestions as Suggestion[])
        : [];

      const cleaned = incoming
        .filter(s =>
          Boolean(
            s &&
            typeof s.name === 'string' &&
            typeof s.selector === 'string' &&
            typeof s.outputKey === 'string',
          ),
        )
        .map(s => ({
          name: s.name,
          type: 'query' as const,
          selector: s.selector,
          attribute: typeof s.attribute === 'string' ? s.attribute : undefined,
          outputKey: s.outputKey,
        }));

      setSuggestions(cleaned);
    } catch (error) {
      setSuggestError(String(error));
    } finally {
      setSuggesting(false);
    }
  }, [electronSend, scraper, suggesting, waitForHtml]);

  const handleRun = useCallback(async () => {
    if (!scraper) return;
    if (!electronSend) return;
    if (running) return;

    setRunning(true);
    setEvents([]);
    setActiveRun(null);

    let runId: string | null = null;

    try {
      const runResp = await fetch(`/api/scrapers/${scraper.id}/runs`, {
        method: 'POST',
      });

      if (!runResp.ok) {
        setRunning(false);
        return;
      }

      const runJson = await runResp.json();
      const run = runJson?.run as ScraperRun | undefined;
      if (!run?.id) {
        setRunning(false);
        return;
      }

      runId = run.id;

      setActiveRun(run);
      void loadRuns();

      const results: Record<string, unknown> = {};

      const steps = scraper.steps;
      let skipNextStep = false;
      let branchContext: {
        conditionIndex: number;
        mergeIndex: number;
        path: 'true' | 'false';
      } | null = null;
      for (let idx = 0; idx < steps.length; idx += 1) {
        const step = steps[idx];
        if (skipNextStep) {
          skipNextStep = false;
          await sendRunEvent(run.id, scraper.id, 'step.completed', {
            stepId: step.id,
            output: { skipped: true, reason: 'condition' },
          });
          continue;
        }
        const baseDelay = step.delayMs ?? stepDelayMs;
        const jitter = cursorJitter ? Math.round(80 + Math.random() * 140) : 0;
        const delay = (idx > 0 ? baseDelay : 0) + jitter;
        if (delay > 0) {
          await sleep(delay);
        }
        if (cursorMove) {
          electronSend('flow:scraperCursorMove');
          await sleep(120);
        }
        if (scrollNudge) {
          electronSend('flow:scraperScrollNudge');
          await sleep(120);
        }
        await sendRunEvent(run.id, scraper.id, 'step.started', {
          stepId: step.id,
        });

        if (step.type === 'navigate') {
          electronSend('flow:scraperNavigate', {
            stepId: step.id,
            url: step.url,
          });
          await sleep(850);
          const payload = { href: step.url };
          results[`navigate:${step.id}`] = payload;
          await sendRunEvent(run.id, scraper.id, 'step.completed', {
            stepId: step.id,
            output: payload,
          });
        }

        if (step.type === 'extractHtml') {
          electronSend('flow:scraperExtractHtml');
          const payload = await waitForHtml();
          results[`html:${step.id}`] = payload;
          await sendRunEvent(run.id, scraper.id, 'step.completed', {
            stepId: step.id,
            output: payload,
          });
        }

        if (step.type === 'query') {
          electronSend('flow:scraperQuery', {
            stepId: step.id,
            selector: step.selector,
            attribute: step.attribute,
          });
          const payload = await waitForQuery(step.id);
          results[step.outputKey] = payload.value;
          await sendRunEvent(run.id, scraper.id, 'step.completed', {
            stepId: step.id,
            output: payload,
          });
        }

        if (step.type === 'click') {
          electronSend('flow:scraperClick', {
            stepId: step.id,
            selector: step.selector,
          });
          const payload = await waitForClick(step.id);
          results[`click:${step.id}`] = payload;
          await sendRunEvent(run.id, scraper.id, 'step.completed', {
            stepId: step.id,
            output: payload,
          });
        }

        if (step.type === 'type') {
          electronSend('flow:scraperType', {
            stepId: step.id,
            selector: step.selector,
            value: step.value,
            pressEnter: Boolean(step.pressEnter),
          });
          const payload = await waitForType(step.id);
          results[`type:${step.id}`] = payload;
          await sendRunEvent(run.id, scraper.id, 'step.completed', {
            stepId: step.id,
            output: payload,
          });
        }

        if (step.type === 'condition') {
          const evaluation = evaluateConditionStep(step, results);
          results[`condition:${step.id}`] = evaluation;
          await sendRunEvent(run.id, scraper.id, 'step.completed', {
            stepId: step.id,
            output: evaluation,
          });

          if (!evaluation.passed) {
            const onFalse = step.onFalse ?? 'continue';
            if (onFalse === 'skipNext' && idx < steps.length - 1) {
              skipNextStep = true;
              await sendRunEvent(run.id, scraper.id, 'log', {
                stepId: step.id,
                message: `Condition failed; skipping next step (${steps[idx + 1]?.name}).`,
              });
            }
            if (onFalse === 'branch' && idx + 2 < steps.length) {
              const mergeIndex = idx + 3;
              branchContext = {
                conditionIndex: idx,
                mergeIndex,
                path: 'false',
              };
              idx += 1;
              await sendRunEvent(run.id, scraper.id, 'log', {
                stepId: step.id,
                message: `Condition failed; routing to FALSE branch (${steps[idx + 1]?.name}).`,
              });
            }
            if (onFalse === 'fail') {
              await sendRunEvent(run.id, scraper.id, 'step.failed', {
                stepId: step.id,
                error: `Condition failed for "${step.sourceKey}".`,
              });
              throw new Error(`Condition failed: ${step.sourceKey}`);
            }
          } else if (
            (step.onFalse ?? 'continue') === 'branch' &&
            idx + 2 < steps.length
          ) {
            branchContext = {
              conditionIndex: idx,
              mergeIndex: idx + 3,
              path: 'true',
            };
            await sendRunEvent(run.id, scraper.id, 'log', {
              stepId: step.id,
              message: `Condition passed; routing to TRUE branch (${steps[idx + 1]?.name}).`,
            });
          }
        }

        if (
          branchContext?.path === 'true' &&
          idx === branchContext.conditionIndex + 1
        ) {
          if (branchContext.mergeIndex < steps.length) {
            idx = branchContext.mergeIndex - 1;
          } else {
            idx = steps.length;
          }
          branchContext = null;
          continue;
        }
        if (
          branchContext?.path === 'false' &&
          idx === branchContext.conditionIndex + 2
        ) {
          branchContext = null;
        }
      }

      await sendRunEvent(run.id, scraper.id, 'run.completed', {
        results,
      });

      await loadRuns();
    } catch (error) {
      if (runId) {
        await sendRunEvent(runId, scraper.id, 'run.failed', {
          error: String(error),
        });
      }
    } finally {
      htmlWaiter.current = null;
      queryWaiters.current.clear();
      clickWaiters.current.clear();
      typeWaiters.current.clear();
      setRunning(false);
    }
  }, [
    cursorJitter,
    electronSend,
    loadRuns,
    running,
    scraper,
    sendRunEvent,
    sleep,
    stepDelayMs,
    waitForHtml,
    waitForQuery,
    waitForClick,
    waitForType,
  ]);

  const handlePreview = useCallback(async () => {
    if (!scraper) return;
    if (!electronSend) return;
    if (previewing) return;

    setPreviewing(true);
    setPreviewLog([]);

    try {
      const steps = scraper.steps;
      const results: Record<string, unknown> = {};
      let skipNextStep = false;
      let branchContext: {
        conditionIndex: number;
        mergeIndex: number;
        path: 'true' | 'false';
      } | null = null;
      for (let idx = 0; idx < steps.length; idx += 1) {
        const step = steps[idx];
        if (skipNextStep) {
          skipNextStep = false;
          setPreviewLog(prev => [...prev, `Skip → ${step.name}`]);
          continue;
        }
        const baseDelay = step.delayMs ?? stepDelayMs;
        const jitter = cursorJitter ? Math.round(80 + Math.random() * 140) : 0;
        const delay = (idx > 0 ? baseDelay : 0) + jitter;
        if (delay > 0) {
          await sleep(delay);
        }
        if (cursorMove) {
          electronSend('flow:scraperCursorMove');
          await sleep(120);
        }
        if (scrollNudge) {
          electronSend('flow:scraperScrollNudge');
          await sleep(120);
        }
        if (step.type === 'navigate') {
          setPreviewLog(prev => [...prev, `Navigate → ${step.url}`]);
          electronSend('flow:scraperNavigate', {
            stepId: step.id,
            url: step.url,
          });
          await sleep(850);
        }
        if (step.type === 'extractHtml') {
          setPreviewLog(prev => [...prev, `Extract HTML → ${step.name}`]);
          electronSend('flow:scraperExtractHtml');
          await waitForHtml();
        }

        if (step.type === 'query') {
          setPreviewLog(prev => [...prev, `Query → ${step.name}`]);
          electronSend('flow:scraperQuery', {
            stepId: step.id,
            selector: step.selector,
            attribute: step.attribute,
          });
          const payload = await waitForQuery(step.id);
          results[step.outputKey] = payload.value;
        }

        if (step.type === 'click') {
          setPreviewLog(prev => [...prev, `Click → ${step.name}`]);
          electronSend('flow:scraperClick', {
            stepId: step.id,
            selector: step.selector,
          });
          const payload = await waitForClick(step.id);
          results[`click:${step.id}`] = payload;
        }

        if (step.type === 'type') {
          setPreviewLog(prev => [...prev, `Type → ${step.name}`]);
          electronSend('flow:scraperType', {
            stepId: step.id,
            selector: step.selector,
            value: step.value,
            pressEnter: Boolean(step.pressEnter),
          });
          const payload = await waitForType(step.id);
          results[`type:${step.id}`] = payload;
        }

        if (step.type === 'condition') {
          const evaluation = evaluateConditionStep(step, results);
          setPreviewLog(prev => [
            ...prev,
            `Condition ${evaluation.passed ? 'pass' : 'fail'} → ${step.sourceKey}`,
          ]);
          if (!evaluation.passed) {
            const onFalse = step.onFalse ?? 'continue';
            if (onFalse === 'skipNext' && idx < steps.length - 1) {
              skipNextStep = true;
            }
            if (onFalse === 'branch' && idx + 2 < steps.length) {
              const branchTarget = steps[idx + 2];
              setPreviewLog(prev => [
                ...prev,
                `Branch FALSE → ${branchTarget?.name ?? 'False path step'}`,
              ]);
              branchContext = {
                conditionIndex: idx,
                mergeIndex: idx + 3,
                path: 'false',
              };
              idx += 1;
            }
            if (onFalse === 'fail') {
              throw new Error(`Condition failed: ${step.sourceKey}`);
            }
          } else if (
            (step.onFalse ?? 'continue') === 'branch' &&
            idx + 2 < steps.length
          ) {
            const branchTarget = steps[idx + 1];
            setPreviewLog(prev => [
              ...prev,
              `Branch TRUE → ${branchTarget?.name ?? 'True path step'}`,
            ]);
            branchContext = {
              conditionIndex: idx,
              mergeIndex: idx + 3,
              path: 'true',
            };
          }
        }

        if (
          branchContext?.path === 'true' &&
          idx === branchContext.conditionIndex + 1
        ) {
          if (branchContext.mergeIndex < steps.length) {
            idx = branchContext.mergeIndex - 1;
          } else {
            idx = steps.length;
          }
          branchContext = null;
          continue;
        }
        if (
          branchContext?.path === 'false' &&
          idx === branchContext.conditionIndex + 2
        ) {
          branchContext = null;
        }
      }
      setPreviewLog(prev => [...prev, 'Preview complete.']);
    } catch (error) {
      setPreviewLog(prev => [...prev, `Preview failed: ${String(error)}`]);
    } finally {
      htmlWaiter.current = null;
      queryWaiters.current.clear();
      clickWaiters.current.clear();
      typeWaiters.current.clear();
      setPreviewing(false);
    }
  }, [
    cursorJitter,
    cursorMove,
    electronSend,
    previewing,
    scraper,
    scrollNudge,
    sleep,
    stepDelayMs,
    waitForClick,
    waitForHtml,
    waitForQuery,
    waitForType,
  ]);

  const runSingleStep = useCallback(
    async (step: ScraperStep) => {
      if (!electronSend) {
        toast.error('Electron is not ready yet.');
        return;
      }
      if (runningStepId) return;

      setRunningStepId(step.id);
      try {
        const baseDelay = step.delayMs ?? stepDelayMs;
        const jitter = cursorJitter ? Math.round(80 + Math.random() * 140) : 0;
        const delay = baseDelay + jitter;
        if (delay > 0) {
          await sleep(delay);
        }
        if (cursorMove) {
          electronSend('flow:scraperCursorMove');
          await sleep(120);
        }
        if (scrollNudge) {
          electronSend('flow:scraperScrollNudge');
          await sleep(120);
        }

        if (step.type === 'navigate') {
          electronSend('flow:scraperNavigate', {
            stepId: step.id,
            url: step.url,
          });
          await sleep(850);
          toast.success('Step ran: navigation started.');
          return;
        }

        if (step.type === 'extractHtml') {
          electronSend('flow:scraperExtractHtml');
          await waitForHtml();
          toast.success('Step ran: HTML captured.');
          return;
        }

        if (step.type === 'query') {
          electronSend('flow:scraperQuery', {
            stepId: step.id,
            selector: step.selector,
            attribute: step.attribute,
          });
          const payload = await waitForQuery(step.id);
          toast.success(
            payload.value
              ? `Step ran: ${payload.value.slice(0, 60)}`
              : 'Step ran: empty query result.',
          );
          return;
        }

        if (step.type === 'click') {
          electronSend('flow:scraperClick', {
            stepId: step.id,
            selector: step.selector,
          });
          const payload = await waitForClick(step.id);
          if (payload.clicked) {
            toast.success('Step ran: click executed.');
          } else {
            toast.error('Step failed: no matching element to click.');
          }
          return;
        }

        if (step.type === 'condition') {
          const source =
            (activeRun?.results as Record<string, unknown> | undefined) ?? {};
          const evaluation = evaluateConditionStep(step, source);
          if (evaluation.passed) {
            toast.success('Condition passed.');
          } else {
            toast.error(
              `Condition failed (${step.onFalse ?? 'continue'} on false).`,
            );
          }
          return;
        }

        electronSend('flow:scraperType', {
          stepId: step.id,
          selector: step.selector,
          value: step.value,
          pressEnter: Boolean(step.pressEnter),
        });
        const payload = await waitForType(step.id);
        if (payload.typed) {
          toast.success('Step ran: typing executed.');
        } else {
          toast.error('Step failed: no matching input found.');
        }
      } catch (error) {
        toast.error(`Step failed: ${String(error)}`);
      } finally {
        queryWaiters.current.delete(step.id);
        clickWaiters.current.delete(step.id);
        typeWaiters.current.delete(step.id);
        setRunningStepId(null);
      }
    },
    [
      cursorJitter,
      cursorMove,
      electronSend,
      runningStepId,
      scrollNudge,
      sleep,
      stepDelayMs,
      waitForClick,
      waitForHtml,
      waitForQuery,
      waitForType,
      activeRun?.results,
    ],
  );

  const handleOpenRun = useCallback(async (runId: string) => {
    const resp = await fetch(`/api/scrapers/runs/${runId}`);
    if (!resp.ok) return;
    const json = await resp.json();
    const run = json?.run as ScraperRun | undefined;
    if (!run?.id) return;

    setActiveRun(run);
    setEvents([]);
  }, []);

  const scraperInitialUrl = useMemo(() => {
    if (!scraper) return 'https://example.com';
    const firstStep = scraper.steps[0];
    if (firstStep?.type === 'navigate' && firstStep.url.trim()) {
      return firstStep.url.trim();
    }
    return scraper.startUrl || 'https://example.com';
  }, [scraper]);

  const updateViewport = useCallback(
    (next: { width?: number; height?: number }) => {
      if (!scraper) return;
      setScraper({
        ...scraper,
        settings: {
          ...scraper.settings,
          viewportWidth: next.width,
          viewportHeight: next.height,
        },
      });
    },
    [scraper],
  );

  useEffect(() => {
    if (!scraper) return;
    const width = scraper.settings?.viewportWidth;
    const height = scraper.settings?.viewportHeight;
    if (!width && !height) {
      setViewportMode('desktop');
      setCustomViewportWidth('');
      setCustomViewportHeight('');
      return;
    }
    if (width === MOBILE_VIEWPORT.width && height === MOBILE_VIEWPORT.height) {
      setViewportMode('mobile');
      setCustomViewportWidth(String(width));
      setCustomViewportHeight(String(height));
      return;
    }
    setViewportMode('custom');
    setCustomViewportWidth(width ? String(width) : '');
    setCustomViewportHeight(height ? String(height) : '');
  }, [
    scraper?.settings?.viewportHeight,
    scraper?.settings?.viewportWidth,
    scraper,
  ]);

  const viewportInputValues = useMemo(() => {
    if (viewportMode === 'mobile') {
      return {
        width: String(MOBILE_VIEWPORT.width),
        height: String(MOBILE_VIEWPORT.height),
      };
    }
    return {
      width: customViewportWidth,
      height: customViewportHeight,
    };
  }, [customViewportHeight, customViewportWidth, viewportMode]);

  useEffect(() => {
    if (!scraper) {
      setSelectedStepIds([]);
      return;
    }

    const validStepIds = new Set(scraper.steps.map(step => step.id));
    setSelectedStepIds(prev => prev.filter(id => validStepIds.has(id)));
  }, [scraper]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const interaction = floatingBrowserInteractionRef.current;
      if (!interaction) return;
      event.preventDefault();

      const deltaX = event.clientX - interaction.startPointerX;
      const deltaY = event.clientY - interaction.startPointerY;

      if (interaction.type === 'drag') {
        setFloatingBrowserRect(
          clampFloatingBrowserRect({
            ...interaction.startRect,
            x: interaction.startRect.x + deltaX,
            y: interaction.startRect.y + deltaY,
          }),
        );
        return;
      }

      setFloatingBrowserRect(
        clampFloatingBrowserRect({
          ...interaction.startRect,
          width: interaction.startRect.width + deltaX,
          height: interaction.startRect.height + deltaY,
        }),
      );
    };

    const handlePointerUp = () => {
      floatingBrowserInteractionRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [clampFloatingBrowserRect]);

  useEffect(() => {
    const element = buildSurfaceRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setFloatingBrowserRect(prev => clampFloatingBrowserRect(prev));
    });

    observer.observe(element);
    setFloatingBrowserRect(prev => clampFloatingBrowserRect(prev));
    return () => observer.disconnect();
  }, [clampFloatingBrowserRect]);

  useEffect(() => {
    const element = workflowCanvasRef.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      setWorkflowCanvasWidth(entry.contentRect.width);
    });

    observer.observe(element);
    setWorkflowCanvasWidth(element.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  const workflowNodeWidth = useMemo(() => {
    if (!workflowCanvasWidth) return 300;
    return Math.max(280, Math.min(460, Math.round(workflowCanvasWidth - 60)));
  }, [workflowCanvasWidth]);

  const workflowBranchNodeWidth = useMemo(() => {
    if (!workflowCanvasWidth)
      return Math.max(190, Math.round(workflowNodeWidth * 0.72));
    return Math.max(
      190,
      Math.min(300, Math.round((workflowCanvasWidth - 132) / 2)),
    );
  }, [workflowCanvasWidth, workflowNodeWidth]);

  const workflowNodeScale = useMemo(
    () => Math.max(0.92, Math.min(1.35, workflowNodeWidth / 300)),
    [workflowNodeWidth],
  );

  const workflowCenterX = useMemo(() => {
    if (!workflowCanvasWidth) return 36;
    return Math.max(
      16,
      Math.round((workflowCanvasWidth - workflowNodeWidth) / 2),
    );
  }, [workflowCanvasWidth, workflowNodeWidth]);

  const workflowBranchLaneGap = useMemo(
    () => Math.max(20, Math.round(28 * workflowNodeScale)),
    [workflowNodeScale],
  );

  const workflowBranchLaneX = useMemo(() => {
    const center = workflowCenterX + workflowNodeWidth / 2;
    const rawLeft = Math.round(
      center - workflowBranchLaneGap / 2 - workflowBranchNodeWidth,
    );
    const rawRight = Math.round(center + workflowBranchLaneGap / 2);
    if (!workflowCanvasWidth) {
      return { left: rawLeft, right: rawRight };
    }
    const minX = 12;
    const maxX = Math.max(
      12,
      workflowCanvasWidth - workflowBranchNodeWidth - 12,
    );
    return {
      left: Math.max(minX, Math.min(maxX, rawLeft)),
      right: Math.max(minX, Math.min(maxX, rawRight)),
    };
  }, [
    workflowBranchLaneGap,
    workflowBranchNodeWidth,
    workflowCanvasWidth,
    workflowCenterX,
    workflowNodeWidth,
  ]);

  const handleStepToggle = useCallback(
    (stepId: string, append: boolean) => {
      if (append) {
        toggleStepSelection(stepId);
        return;
      }
      selectOnlyStep(stepId);
      setExpandedStepId(prev => (prev === stepId ? null : stepId));
    },
    [selectOnlyStep, toggleStepSelection],
  );

  const selectedStepIdsSet = useMemo(
    () => new Set(selectedStepIds),
    [selectedStepIds],
  );

  const workflowGraph = useMemo<{ nodes: Node[]; edges: Edge[] }>(() => {
    if (stepsEditorTab !== 'workflow') {
      return { nodes: [], edges: [] };
    }
    if (!scraper) return { nodes: [], edges: [] };
    const rowGap = Math.max(88, Math.round(116 * workflowNodeScale));
    const topOffset = Math.round(16 * workflowNodeScale);
    const steps = scraper.steps;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let cursorY = topOffset;

    const estimateNodeHeight = (step: ScraperStep): number => {
      const headerPadding = Math.max(10, Math.round(12 * workflowNodeScale));
      const iconSize = Math.round(28 * workflowNodeScale);
      const actionButtonSize = Math.round(32 * workflowNodeScale);
      const headerHeight =
        Math.max(iconSize, actionButtonSize) + headerPadding * 2;
      if (expandedStepId !== step.id) {
        return headerHeight;
      }
      const detailLines = stepDetailLines(step).length;
      const detailLineHeight = Math.round(16 * workflowNodeScale);
      const detailBlock =
        Math.round(16 * workflowNodeScale) + detailLines * detailLineHeight;
      return headerHeight + detailBlock;
    };

    const createStepNode = (
      step: ScraperStep,
      x: number,
      y: number,
      nodeWidth: number,
    ) => ({
      id: step.id,
      type: 'step',
      selected: selectedStepIdsSet.has(step.id),
      position: { x, y },
      data: {
        step,
        expanded: expandedStepId === step.id,
        canUseElectron,
        runningStepId,
        scale: workflowNodeScale,
        nodeWidth,
        onToggle: handleStepToggle,
        onRun: (candidate: ScraperStep) => {
          void runSingleStep(candidate);
        },
        onDelete: removeStep,
      } satisfies StepFlowNodeData,
    });

    if (!steps.length) {
      nodes.push({
        id: '__start__',
        type: 'start',
        position: { x: workflowCenterX, y: topOffset },
        selectable: false,
        draggable: false,
        data: {
          scale: workflowNodeScale,
          nodeWidth: workflowNodeWidth,
          onAdd: () => openAddStepComposer('extractHtml', null),
        } satisfies StartFlowNodeData,
      });
      nodes.push({
        id: '__add__',
        type: 'add',
        position: {
          x: workflowCenterX,
          y: topOffset + Math.round(110 * workflowNodeScale),
        },
        selectable: false,
        draggable: false,
        data: {
          scale: workflowNodeScale,
          nodeWidth: workflowNodeWidth,
          onAdd: () => openAddStepComposer('extractHtml', null),
        } satisfies AddFlowNodeData,
      });
      edges.push({
        id: '__start__->__add__',
        source: '__start__',
        target: '__add__',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'rgba(110,110,110,0.28)', strokeWidth: 1.1 },
        animated: true,
      });
      return { nodes, edges };
    }

    for (let index = 0; index < steps.length; index += 1) {
      const current = steps[index];
      const isBranchCondition =
        current.type === 'condition' &&
        (current.onFalse ?? 'continue') === 'branch' &&
        index + 2 < steps.length;

      if (!isBranchCondition) {
        nodes.push(
          createStepNode(current, workflowCenterX, cursorY, workflowNodeWidth),
        );
        cursorY += estimateNodeHeight(current) + rowGap;
        continue;
      }

      nodes.push(
        createStepNode(current, workflowCenterX, cursorY, workflowNodeWidth),
      );
      const conditionHeight = estimateNodeHeight(current);

      const trueStep = steps[index + 1];
      const falseStep = steps[index + 2];
      const branchStepY = cursorY + conditionHeight + rowGap;
      nodes.push(
        createStepNode(
          trueStep,
          workflowBranchLaneX.left,
          branchStepY,
          workflowBranchNodeWidth,
        ),
      );
      nodes.push(
        createStepNode(
          falseStep,
          workflowBranchLaneX.right,
          branchStepY,
          workflowBranchNodeWidth,
        ),
      );
      const branchRowHeight = Math.max(
        estimateNodeHeight(trueStep),
        estimateNodeHeight(falseStep),
      );
      cursorY = branchStepY + branchRowHeight + rowGap;
      index += 2;
    }

    const branchTailSources: string[] = [];
    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index];
      const isBranchCondition =
        step.type === 'condition' &&
        (step.onFalse ?? 'continue') === 'branch' &&
        index + 2 < steps.length;

      if (!isBranchCondition) {
        if (index < steps.length - 1) {
          edges.push({
            id: `${steps[index].id}->${steps[index + 1].id}`,
            source: steps[index].id,
            target: steps[index + 1].id,
            type: 'insertable',
            data: {
              onInsert: () => openAddStepComposer('extractHtml', index + 1),
            },
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'rgba(110,110,110,0.45)', strokeWidth: 1.2 },
          });
        }
        continue;
      }

      const trueStep = steps[index + 1];
      const falseStep = steps[index + 2];
      edges.push({
        id: `${step.id}->${trueStep.id}::true`,
        source: step.id,
        target: trueStep.id,
        label: 'True',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'rgba(20,184,166,0.75)', strokeWidth: 1.3 },
      });
      edges.push({
        id: `${step.id}->${falseStep.id}::false`,
        source: step.id,
        target: falseStep.id,
        label: 'False',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'rgba(248,113,113,0.75)', strokeWidth: 1.3 },
      });

      const mergeIndex = index + 3;
      if (mergeIndex < steps.length) {
        const mergeStep = steps[mergeIndex];
        edges.push({
          id: `${trueStep.id}->${mergeStep.id}::merge`,
          source: trueStep.id,
          target: mergeStep.id,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'rgba(110,110,110,0.45)', strokeWidth: 1.2 },
        });
        edges.push({
          id: `${falseStep.id}->${mergeStep.id}::merge`,
          source: falseStep.id,
          target: mergeStep.id,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'rgba(110,110,110,0.45)', strokeWidth: 1.2 },
        });
      } else {
        branchTailSources.push(trueStep.id, falseStep.id);
      }

      index += 2;
    }

    nodes.push({
      id: '__add__',
      type: 'add',
      position: {
        x: workflowCenterX,
        y: cursorY + Math.round(8 * workflowNodeScale),
      },
      selectable: false,
      draggable: false,
      data: {
        scale: workflowNodeScale,
        nodeWidth: workflowNodeWidth,
        onAdd: () => openAddStepComposer('extractHtml', null),
      } satisfies AddFlowNodeData,
    });

    if (branchTailSources.length) {
      const uniqueSources = Array.from(new Set(branchTailSources));
      for (const sourceId of uniqueSources) {
        edges.push({
          id: `${sourceId}->__add__`,
          source: sourceId,
          target: '__add__',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'rgba(110,110,110,0.28)', strokeWidth: 1.1 },
          animated: true,
        });
      }
    } else {
      const last = steps[steps.length - 1];
      edges.push({
        id: `${last.id}->__add__`,
        source: last.id,
        target: '__add__',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'rgba(110,110,110,0.28)', strokeWidth: 1.1 },
        animated: true,
      });
    }

    return { nodes, edges };
  }, [
    canUseElectron,
    expandedStepId,
    handleStepToggle,
    openAddStepComposer,
    removeStep,
    runSingleStep,
    runningStepId,
    scraper,
    selectedStepIdsSet,
    stepsEditorTab,
    workflowBranchLaneX.left,
    workflowBranchLaneX.right,
    workflowBranchNodeWidth,
    workflowCenterX,
    workflowNodeScale,
    workflowNodeWidth,
  ]);

  const stepFlowNodes = workflowGraph.nodes;
  const stepFlowEdges = workflowGraph.edges;
  const embeddedBrowserIpcHandlers = useMemo<
    ComponentProps<typeof EmbeddedBrowser>['ipcHandlers']
  >(
    () => ({
      'flow:scraperHtml': (payload: any) => {
        const html = safeText(payload?.html);
        const href = safeText(payload?.href);
        if (html && href) {
          setLastHtml({ href, html });
          if (htmlWaiter.current) {
            const resolve = htmlWaiter.current;
            htmlWaiter.current = null;
            resolve({ href, html });
          }
        }
      },
      'flow:scraperQueryResult': (payload: any) => {
        const stepId = safeText(payload?.stepId);
        const value = safeText(payload?.value);
        const href = safeText(payload?.href);
        if (stepId && queryWaiters.current.has(stepId)) {
          const resolve = queryWaiters.current.get(stepId);
          queryWaiters.current.delete(stepId);
          resolve?.({ href, value });
        }
      },
      'flow:scraperPickResult': (payload: any) => {
        const stepId = safeText(payload?.stepId);
        const element = payload?.element as
          | {
              selector?: string;
              tagName?: string;
              id?: string;
              classes?: string[];
              text?: string;
              href?: string;
            }
          | undefined;
        if (stepId.startsWith('add-step-')) {
          if (element?.selector) {
            if (stepId === 'add-step-query') {
              setQuerySelector(element.selector);
            }
            if (stepId === 'add-step-click') {
              setClickSelector(element.selector);
            }
            if (stepId === 'add-step-type') {
              setTypeSelector(element.selector);
            }
          }
          setPickerStepId(null);
          return;
        }
        if (stepId && element?.selector && scraper) {
          const target = scraper.steps.find(step => step.id === stepId);
          if (target?.type === 'click') {
            patchStep(stepId, {
              selector: element.selector,
              tagName: element.tagName,
              idAttr: element.id,
              classes: element.classes,
              text: element.text,
              href: element.href,
            });
          } else {
            patchStep(stepId, {
              selector: element.selector,
            });
          }
        }
        setPickerStepId(null);
      },
      'flow:scraperClickResult': (payload: any) => {
        const stepId = safeText(payload?.stepId);
        const clicked = Boolean(payload?.clicked);
        const href = safeText(payload?.href);
        if (stepId && clickWaiters.current.has(stepId)) {
          const resolve = clickWaiters.current.get(stepId);
          clickWaiters.current.delete(stepId);
          resolve?.({ href, clicked });
        }
      },
      'flow:scraperTypeResult': (payload: any) => {
        const stepId = safeText(payload?.stepId);
        const typed = Boolean(payload?.typed);
        const value = safeText(payload?.value);
        const href = safeText(payload?.href);
        if (stepId && typeWaiters.current.has(stepId)) {
          const resolve = typeWaiters.current.get(stepId);
          typeWaiters.current.delete(stepId);
          resolve?.({ href, typed, value });
        }
      },
    }),
    [patchStep, scraper],
  );

  return (
    <Page className="flex flex-1 flex-col p-0 overflow-hidden">
      <div
        ref={buildSurfaceRef}
        className="relative flex min-w-0 flex-1 flex-col"
      >
        <PageHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <PageTitle>{scraper?.name || 'Scraper'}</PageTitle>
              <PageDescription>
                {scraper ? scraper.startUrl : 'Loading...'}
              </PageDescription>
            </div>
            <PageActions>
              <Button
                size="sm"
                onClick={handlePreview}
                disabled={!scraper || !canUseElectron || previewing}
              >
                <Play className="h-4 w-4" />
                {previewing ? 'Previewing…' : 'Preview'}
              </Button>
            </PageActions>
          </div>
        </PageHeader>

        <PageBody className="gap-3 overflow-hidden">
          <div className="flex min-h-0 flex-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="relative flex min-h-0 flex-1 flex-col"
            >
              <div className="flex items-center justify-between pb-2">
                <TabsListContainer className="h-9 rounded-xl bg-black/25 p-1">
                  <TabsTrigger
                    value="build"
                    className="h-7 px-3.5 text-[13px] transition-all duration-300 data-[state=active]:scale-[1.04] data-[state=active]:shadow-sm"
                  >
                    Build
                  </TabsTrigger>
                  <TabsTrigger
                    value="runs"
                    className="h-7 px-3.5 text-[13px] transition-all duration-300 data-[state=active]:scale-[1.04] data-[state=active]:shadow-sm"
                  >
                    Runs
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="h-7 px-3.5 text-[13px] transition-all duration-300 data-[state=active]:scale-[1.04] data-[state=active]:shadow-sm"
                  >
                    Settings
                  </TabsTrigger>
                </TabsListContainer>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${canUseElectron ? 'bg-emerald-400' : 'bg-muted'}`}
                    />
                    {canUseElectron ? 'Electron ready' : 'Web preview'}
                  </span>
                </div>
              </div>

              <TabsContentContainer
                value="build"
                className="mt-0 flex min-h-0 flex-1 overflow-hidden"
              >
                <ResizablePanelGroup
                  direction="horizontal"
                  className="min-h-0 flex-1"
                  autoSaveId="scraper-builder-layout"
                >
                  <ResizablePanel
                    id="scraper-designer"
                  defaultSize={browserDocked ? '68%' : '100%'}
                  minSize={browserDocked ? '20%' : '100%'}
                  maxSize={browserDocked ? '85%' : '100%'}
                  collapsible={false}
                    className="min-h-0"
                  >
                    <div className="h-full overflow-y-auto pr-1">
                      <div className="flex flex-col gap-3 pb-8">
                        <PageCard className="bg-black/20 p-3">
                          {!scraper ? (
                            <div className="text-sm text-muted-foreground">
                              Loading…
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="space-y-2">
                                {pickerStepId ? (
                                  <div className="mb-3 flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={stopElementPicker}
                                    >
                                      Cancel pick
                                    </Button>
                                  </div>
                                ) : null}

                                {previewLog.length ? (
                                  <div className="mb-3 rounded-md border border-border/60 bg-muted/30 p-2 text-[11px] text-muted-foreground">
                                    <div className="font-medium text-foreground">
                                      Preview log
                                    </div>
                                    <div className="mt-2 space-y-1">
                                      {previewLog
                                        .slice(-6)
                                        .map((entry, idx) => (
                                          <div key={`${entry}-${idx}`}>
                                            {entry}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                ) : null}

                                <div
                                  className={`mb-3 overflow-hidden transition-all duration-200 ${selectedStepIds.length ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                                >
                                  <div className="rounded-lg border border-teal-400/30 bg-teal-500/10 p-2.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <PageBadge
                                        variant="secondary"
                                        className="h-7 rounded-md border border-teal-300/35 bg-teal-500/15 text-[11px] text-teal-200"
                                      >
                                        {selectedStepIds.length} selected
                                      </PageBadge>
                                      <Button
                                        size="sm"
                                        className="h-7"
                                        onClick={() =>
                                          void saveStepSelectionAsFixture()
                                        }
                                        disabled={savingFixture}
                                      >
                                        {savingFixture
                                          ? 'Saving...'
                                          : 'Save selection as fixture'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-7"
                                        onClick={removeSelectedSteps}
                                      >
                                        Remove selected
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7"
                                        onClick={clearStepSelection}
                                      >
                                        Clear
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <Tabs
                                  value={stepsEditorTab}
                                  onValueChange={(value: string) =>
                                    setStepsEditorTab(
                                      value === 'workflow'
                                        ? 'workflow'
                                        : 'setup',
                                    )
                                  }
                                  className="space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <TabsListContainer className="h-8 bg-black/35">
                                      <TabsTrigger
                                        value="setup"
                                        className="h-7 px-3"
                                      >
                                        Setup
                                      </TabsTrigger>
                                      <TabsTrigger
                                        value="workflow"
                                        className="h-7 px-3"
                                      >
                                        Workflow
                                      </TabsTrigger>
                                    </TabsListContainer>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={saveScraper}
                                      disabled={!scraper || saving}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Save className="h-3.5 w-3.5" />
                                      {saving ? 'Saving…' : 'Save'}
                                    </Button>
                                  </div>

                                  <TabsContentContainer
                                    value="setup"
                                    className="mt-0 w-full max-w-[680px] space-y-3"
                                  >
                                    <div className="space-y-2">
                                      <div className="inline-flex h-7 items-center rounded-md border border-border/60 bg-black/35 p-0.5">
                                        <Button
                                          size="sm"
                                          variant={
                                            viewportMode === 'desktop' ? 'default' : 'secondary'
                                          }
                                          className="h-6 rounded px-2 text-[11px]"
                                          onClick={() => {
                                            setViewportMode('desktop');
                                            setCustomViewportWidth('');
                                            setCustomViewportHeight('');
                                            updateViewport({
                                              width: undefined,
                                              height: undefined,
                                            });
                                          }}
                                        >
                                          Desktop
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={
                                            viewportMode === 'mobile' ? 'default' : 'secondary'
                                          }
                                          className="h-6 rounded px-2 text-[11px]"
                                          onClick={() => {
                                            setViewportMode('mobile');
                                            setCustomViewportWidth(String(MOBILE_VIEWPORT.width));
                                            setCustomViewportHeight(String(MOBILE_VIEWPORT.height));
                                            updateViewport({
                                              width: MOBILE_VIEWPORT.width,
                                              height: MOBILE_VIEWPORT.height,
                                            });
                                          }}
                                        >
                                          Mobile
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={
                                            viewportMode === 'custom' ? 'default' : 'secondary'
                                          }
                                          className="h-6 rounded px-2 text-[11px]"
                                          onClick={() => {
                                            setViewportMode('custom');
                                            updateViewport({
                                              width: customViewportWidth
                                                ? Number(customViewportWidth)
                                                : undefined,
                                              height: customViewportHeight
                                                ? Number(customViewportHeight)
                                                : undefined,
                                            });
                                          }}
                                        >
                                          Custom
                                        </Button>
                                      </div>

                                      <div className="grid grid-cols-[minmax(0,1fr)_92px_92px] items-end gap-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-muted-foreground">
                                            Navigate URL
                                          </Label>
                                          <Input
                                            value={scraper.startUrl}
                                            onChange={(
                                              event: ChangeEvent<HTMLInputElement>,
                                            ) => {
                                              const url = event.target.value;
                                              const firstStep = scraper.steps[0];
                                              const updatedSteps = firstStep?.type === 'navigate'
                                                ? [{ ...firstStep, url }, ...scraper.steps.slice(1)]
                                                : [
                                                    {
                                                      id: uid(),
                                                      name: 'Navigate',
                                                      type: 'navigate' as const,
                                                      url,
                                                    },
                                                    ...scraper.steps,
                                                  ];
                                              setScraper({
                                                ...scraper,
                                                startUrl: url,
                                                steps: updatedSteps,
                                              });
                                            }}
                                            placeholder="https://example.com"
                                            className="h-8 border-border/60 bg-black/35 text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs text-muted-foreground">W</Label>
                                          <Input
                                            type="number"
                                            min={1}
                                            max={5000}
                                            value={viewportInputValues.width}
                                            onChange={(
                                              event: ChangeEvent<HTMLInputElement>,
                                            ) => {
                                              setCustomViewportWidth(event.target.value);
                                            }}
                                            onBlur={() =>
                                              updateViewport({
                                                width: customViewportWidth
                                                  ? Number(customViewportWidth)
                                                  : undefined,
                                                height: customViewportHeight
                                                  ? Number(customViewportHeight)
                                                  : undefined,
                                              })
                                            }
                                            disabled={viewportMode !== 'custom'}
                                            placeholder="1280"
                                            className="h-8 w-full border-border/60 bg-black/35 text-sm tabular-nums"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs text-muted-foreground">H</Label>
                                          <Input
                                            type="number"
                                            min={1}
                                            max={5000}
                                            value={viewportInputValues.height}
                                            onChange={(
                                              event: ChangeEvent<HTMLInputElement>,
                                            ) => {
                                              setCustomViewportHeight(event.target.value);
                                            }}
                                            onBlur={() =>
                                              updateViewport({
                                                width: customViewportWidth
                                                  ? Number(customViewportWidth)
                                                  : undefined,
                                                height: customViewportHeight
                                                  ? Number(customViewportHeight)
                                                  : undefined,
                                              })
                                            }
                                            disabled={viewportMode !== 'custom'}
                                            placeholder="720"
                                            className="h-8 w-full border-border/60 bg-black/35 text-sm tabular-nums"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                      The navigate URL is used as the first step in the workflow. Change it here or add navigate steps in the workflow.
                                    </div>
                                  </TabsContentContainer>

                                  <TabsContentContainer
                                    value="workflow"
                                    className="mt-0"
                                  >
                                    {fixtures.length ? (
                                      <div className="mb-2 rounded-lg border border-border/60 bg-background/30 p-2">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                          Fixtures
                                        </div>
                                        <div className="mt-2 space-y-1.5">
                                          {fixtures.map(fixture => (
                                            <div
                                              key={fixture.id}
                                              className="rounded-md border border-border/60 bg-muted/20 p-2"
                                            >
                                              <div className="truncate text-xs font-medium">
                                                {fixture.name}
                                              </div>
                                              <div className="text-[11px] text-muted-foreground">
                                                {fixture.steps.length} step
                                                {fixture.steps.length === 1
                                                  ? ''
                                                  : 's'}
                                              </div>
                                              <div className="mt-1.5 flex flex-wrap gap-1">
                                                <Button
                                                  size="sm"
                                                  variant="secondary"
                                                  className="h-7 px-2 text-[11px]"
                                                  onClick={() =>
                                                    applyFixtureSteps(
                                                      fixture,
                                                      'append',
                                                    )
                                                  }
                                                >
                                                  Append
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="secondary"
                                                  className="h-7 px-2 text-[11px]"
                                                  onClick={() =>
                                                    applyFixtureSteps(
                                                      fixture,
                                                      'replace',
                                                    )
                                                  }
                                                >
                                                  Replace
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-7 px-2 text-[11px]"
                                                  onClick={() =>
                                                    void deleteFixtureById(
                                                      fixture,
                                                    )
                                                  }
                                                >
                                                  Delete
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null}

                                    <div className="space-y-2 rounded-lg border border-border/70 bg-black/25 p-2.5">
                                      {scraper.steps.map((step, stepIndex) => {
                                        const expanded =
                                          expandedStepId === step.id;
                                        const pickerActive =
                                          pickerStepId === step.id;
                                        const selected =
                                          selectedStepIds.includes(step.id);
                                        return (
                                          <div key={step.id}>
                                            <div
                                              className={`group/step rounded-xl border bg-background/40 shadow-[0_10px_20px_-18px_rgba(0,0,0,0.6)] transition-colors hover:bg-muted/30 ${selected ? 'border-teal-400/60' : 'border-border/60'}`}
                                            >
                                              <div className="flex items-center justify-between gap-2.5 p-2.5">
                                                <button
                                                  type="button"
                                                  className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                                                  onClick={event =>
                                                    handleStepToggle(
                                                      step.id,
                                                      event.metaKey ||
                                                        event.ctrlKey,
                                                    )
                                                  }
                                                >
                                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30 text-muted-foreground">
                                                    <ChevronDown
                                                      className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                                                    />
                                                  </span>
                                                  <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-foreground">
                                                      {step.name}
                                                    </div>
                                                    <div className="truncate text-[11px] text-muted-foreground">
                                                      {stepSummaryText(step)}
                                                    </div>
                                                  </div>
                                                </button>
                                                <div className="flex items-center gap-1">
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                      void runSingleStep(step)
                                                    }
                                                    className="h-8 w-8 px-0 opacity-0 pointer-events-none transition-opacity group-hover/step:opacity-100 group-hover/step:pointer-events-auto group-focus-within/step:opacity-100 group-focus-within/step:pointer-events-auto"
                                                    disabled={
                                                      !canUseElectron ||
                                                      Boolean(runningStepId)
                                                    }
                                                  >
                                                    <Play className="h-4 w-4" />
                                                  </Button>
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                      asChild
                                                    >
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 px-0"
                                                      >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                      <DropdownMenuItem
                                                        onClick={() =>
                                                          void runSingleStep(
                                                            step,
                                                          )
                                                        }
                                                        disabled={
                                                          !canUseElectron ||
                                                          Boolean(runningStepId)
                                                        }
                                                      >
                                                        <Play className="h-4 w-4" />
                                                        Run step
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem
                                                        onClick={() =>
                                                          removeStep(step.id)
                                                        }
                                                      >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete step
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                              </div>

                                              {expanded ? (
                                                <div className="border-t border-border/60 px-2.5 pb-2.5">
                                                  <div className="mt-2.5 space-y-2">
                                                    <div className="space-y-1">
                                                      <Label className="text-[11px] text-muted-foreground">
                                                        Step name
                                                      </Label>
                                                      <Input
                                                        value={step.name}
                                                        placeholder="Step name"
                                                        className="h-8"
                                                        onChange={(
                                                          e: ChangeEvent<HTMLInputElement>,
                                                        ) =>
                                                          patchStep(step.id, {
                                                            name: e.target
                                                              .value,
                                                          })
                                                        }
                                                      />
                                                    </div>

                                                    <div className="space-y-1">
                                                      <Label className="text-[11px] text-muted-foreground">
                                                        Delay override (ms)
                                                      </Label>
                                                      <Input
                                                        value={
                                                          step.delayMs ?? ''
                                                        }
                                                        placeholder="Use default"
                                                        className="h-8"
                                                        onChange={(
                                                          e: ChangeEvent<HTMLInputElement>,
                                                        ) =>
                                                          patchStep(step.id, {
                                                            delayMs: e.target
                                                              .value
                                                              ? Number(
                                                                  e.target
                                                                    .value,
                                                                )
                                                              : undefined,
                                                          })
                                                        }
                                                      />
                                                    </div>
                                                    <div className="space-y-1">
                                                      <Label className="text-[11px] text-muted-foreground">
                                                        Step type
                                                      </Label>
                                                      <div className="flex items-center gap-2">
                                                        <Select
                                                          value={step.type}
                                                          onValueChange={(
                                                            value: string,
                                                          ) => {
                                                            if (
                                                              !isScraperStepType(
                                                                value,
                                                              )
                                                            ) {
                                                              return;
                                                            }
                                                            setStepType(
                                                              step.id,
                                                              value,
                                                            );
                                                          }}
                                                        >
                                                          <SelectTrigger className="h-8 flex-1">
                                                            <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            {SCRAPER_STEP_TYPE_OPTIONS.map(
                                                              option => (
                                                                <SelectItem
                                                                  key={
                                                                    option.value
                                                                  }
                                                                  value={
                                                                    option.value
                                                                  }
                                                                >
                                                                  {option.label}
                                                                </SelectItem>
                                                              ),
                                                            )}
                                                          </SelectContent>
                                                        </Select>
                                                        <Button
                                                          size="sm"
                                                          variant="ghost"
                                                          className="h-8"
                                                          onClick={() =>
                                                            void runSingleStep(
                                                              step,
                                                            )
                                                          }
                                                          disabled={
                                                            !canUseElectron ||
                                                            Boolean(
                                                              runningStepId,
                                                            )
                                                          }
                                                        >
                                                          Test
                                                        </Button>
                                                      </div>
                                                    </div>

                                                    {step.type === 'navigate' ? (
                                                      <div className="grid grid-cols-1 gap-2">
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            URL
                                                          </Label>
                                                          <Input
                                                            value={step.url}
                                                            placeholder="https://www.upwork.com"
                                                            className="h-8"
                                                            onChange={(
                                                              e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                              patchStep(step.id, {
                                                                url: e.target.value,
                                                              })
                                                            }
                                                          />
                                                        </div>
                                                      </div>
                                                    ) : null}

                                                    {step.type === 'query' ? (
                                                      <div className="grid grid-cols-1 gap-2">
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            CSS selector
                                                          </Label>
                                                          <div className="flex items-center gap-2">
                                                            <Button
                                                              size="sm"
                                                              variant="secondary"
                                                              className={`h-8 w-8 px-0 transition-colors ${pickerActive ? 'border-teal-400/60 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20' : ''}`}
                                                              aria-label="Pick selector"
                                                              title="Pick selector"
                                                              onClick={() =>
                                                                startElementPicker(
                                                                  step.id,
                                                                )
                                                              }
                                                              disabled={
                                                                !canUseElectron
                                                              }
                                                            >
                                                              <MousePointerClick
                                                                className={`h-4 w-4 ${pickerActive ? 'text-teal-300 animate-pulse' : ''}`}
                                                              />
                                                            </Button>
                                                            <Input
                                                              value={
                                                                step.selector
                                                              }
                                                              placeholder=".card .title"
                                                              className="h-8 flex-1"
                                                              onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                              ) =>
                                                                patchStep(
                                                                  step.id,
                                                                  {
                                                                    selector:
                                                                      e.target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            Attribute (optional)
                                                          </Label>
                                                          <Input
                                                            value={
                                                              step.attribute ??
                                                              ''
                                                            }
                                                            placeholder="href, src, data-id"
                                                            className="h-8"
                                                            onChange={(
                                                              e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                              patchStep(
                                                                step.id,
                                                                {
                                                                  attribute:
                                                                    e.target
                                                                      .value ||
                                                                    undefined,
                                                                },
                                                              )
                                                            }
                                                          />
                                                        </div>
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            Output key
                                                          </Label>
                                                          <Input
                                                            value={
                                                              step.outputKey
                                                            }
                                                            placeholder="title"
                                                            className="h-8"
                                                            onChange={(
                                                              e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                              patchStep(
                                                                step.id,
                                                                {
                                                                  outputKey:
                                                                    e.target
                                                                      .value,
                                                                },
                                                              )
                                                            }
                                                          />
                                                        </div>
                                                      </div>
                                                    ) : null}

                                                    {step.type === 'click' ? (
                                                      <div className="grid grid-cols-1 gap-2">
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            CSS selector
                                                          </Label>
                                                          <div className="flex items-center gap-2">
                                                            <Button
                                                              size="sm"
                                                              variant="secondary"
                                                              className={`h-8 w-8 px-0 transition-colors ${pickerActive ? 'border-teal-400/60 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20' : ''}`}
                                                              aria-label="Pick element"
                                                              title="Pick element"
                                                              onClick={() =>
                                                                startElementPicker(
                                                                  step.id,
                                                                )
                                                              }
                                                              disabled={
                                                                !canUseElectron
                                                              }
                                                            >
                                                              <MousePointerClick
                                                                className={`h-4 w-4 ${pickerActive ? 'text-teal-300 animate-pulse' : ''}`}
                                                              />
                                                            </Button>
                                                            <Input
                                                              value={
                                                                step.selector
                                                              }
                                                              placeholder="button.primary"
                                                              className="h-8 flex-1"
                                                              onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                              ) =>
                                                                patchStep(
                                                                  step.id,
                                                                  {
                                                                    selector:
                                                                      e.target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </div>
                                                        </div>
                                                        {step.text ||
                                                        step.href ? (
                                                          <div className="rounded-md border border-border/60 bg-muted/30 p-2 text-[11px] text-muted-foreground">
                                                            <div className="font-medium text-foreground">
                                                              Picked element
                                                            </div>
                                                            {step.text ? (
                                                              <div className="mt-1 line-clamp-2">
                                                                {step.text}
                                                              </div>
                                                            ) : null}
                                                            {step.href ? (
                                                              <div className="mt-1 truncate">
                                                                {step.href}
                                                              </div>
                                                            ) : null}
                                                          </div>
                                                        ) : null}
                                                      </div>
                                                    ) : null}

                                                    {step.type === 'type' ? (
                                                      <div className="grid grid-cols-1 gap-2">
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            CSS selector
                                                          </Label>
                                                          <div className="flex items-center gap-2">
                                                            <Button
                                                              size="sm"
                                                              variant="secondary"
                                                              className={`h-8 w-8 px-0 transition-colors ${pickerActive ? 'border-teal-400/60 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20' : ''}`}
                                                              aria-label="Pick input"
                                                              title="Pick input"
                                                              onClick={() =>
                                                                startElementPicker(
                                                                  step.id,
                                                                )
                                                              }
                                                              disabled={
                                                                !canUseElectron
                                                              }
                                                            >
                                                              <MousePointerClick
                                                                className={`h-4 w-4 ${pickerActive ? 'text-teal-300 animate-pulse' : ''}`}
                                                              />
                                                            </Button>
                                                            <Input
                                                              value={
                                                                step.selector
                                                              }
                                                              placeholder="input[name=email]"
                                                              className="h-8 flex-1"
                                                              onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                              ) =>
                                                                patchStep(
                                                                  step.id,
                                                                  {
                                                                    selector:
                                                                      e.target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            Value
                                                          </Label>
                                                          <Input
                                                            value={step.value}
                                                            placeholder="Text to type"
                                                            className="h-8"
                                                            onChange={(
                                                              e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                              patchStep(
                                                                step.id,
                                                                {
                                                                  value:
                                                                    e.target
                                                                      .value,
                                                                },
                                                              )
                                                            }
                                                          />
                                                        </div>
                                                        <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-2 py-1.5">
                                                          <div className="text-[11px] text-muted-foreground">
                                                            Press Enter after
                                                            typing
                                                          </div>
                                                          <Switch
                                                            checked={Boolean(
                                                              step.pressEnter,
                                                            )}
                                                            onCheckedChange={checked =>
                                                              patchStep(
                                                                step.id,
                                                                {
                                                                  pressEnter:
                                                                    checked ||
                                                                    undefined,
                                                                },
                                                              )
                                                            }
                                                          />
                                                        </div>
                                                      </div>
                                                    ) : null}

                                                    {step.type ===
                                                    'condition' ? (
                                                      <div className="grid grid-cols-1 gap-2">
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            Output key from
                                                            previous step
                                                          </Label>
                                                          <Input
                                                            value={
                                                              step.sourceKey
                                                            }
                                                            list={`condition-source-options-${step.id}`}
                                                            placeholder="value"
                                                            className="h-8"
                                                            onChange={(
                                                              e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                              patchStep(
                                                                step.id,
                                                                {
                                                                  sourceKey:
                                                                    e.target
                                                                      .value,
                                                                },
                                                              )
                                                            }
                                                          />
                                                          <datalist
                                                            id={`condition-source-options-${step.id}`}
                                                          >
                                                            {conditionSourceOptions.map(
                                                              key => (
                                                                <option
                                                                  key={key}
                                                                  value={key}
                                                                />
                                                              ),
                                                            )}
                                                          </datalist>
                                                        </div>
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            Condition
                                                          </Label>
                                                          <Select
                                                            value={
                                                              step.operator
                                                            }
                                                            onValueChange={(
                                                              value: string,
                                                            ) =>
                                                              patchStep(
                                                                step.id,
                                                                {
                                                                  operator:
                                                                    value as ScraperConditionStep['operator'],
                                                                  value:
                                                                    conditionOperatorNeedsValue(
                                                                      value as ScraperConditionStep['operator'],
                                                                    )
                                                                      ? (step.value ??
                                                                        '')
                                                                      : undefined,
                                                                },
                                                              )
                                                            }
                                                          >
                                                            <SelectTrigger className="h-8">
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {SCRAPER_CONDITION_OPERATORS.map(
                                                                option => (
                                                                  <SelectItem
                                                                    key={
                                                                      option.value
                                                                    }
                                                                    value={
                                                                      option.value
                                                                    }
                                                                  >
                                                                    {
                                                                      option.label
                                                                    }
                                                                  </SelectItem>
                                                                ),
                                                              )}
                                                            </SelectContent>
                                                          </Select>
                                                        </div>
                                                        {conditionOperatorNeedsValue(
                                                          step.operator,
                                                        ) ? (
                                                          <div className="space-y-1">
                                                            <Label className="text-[11px] text-muted-foreground">
                                                              Expected value
                                                            </Label>
                                                            <Input
                                                              value={
                                                                step.value ?? ''
                                                              }
                                                              placeholder="Expected value"
                                                              className="h-8"
                                                              onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                              ) =>
                                                                patchStep(
                                                                  step.id,
                                                                  {
                                                                    value:
                                                                      e.target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </div>
                                                        ) : null}
                                                        <div className="space-y-1">
                                                          <Label className="text-[11px] text-muted-foreground">
                                                            If condition fails
                                                          </Label>
                                                          <Select
                                                            value={
                                                              step.onFalse ??
                                                              'continue'
                                                            }
                                                            onValueChange={(
                                                              value: string,
                                                            ) =>
                                                              patchStep(
                                                                step.id,
                                                                {
                                                                  onFalse:
                                                                    value as NonNullable<
                                                                      ScraperConditionStep['onFalse']
                                                                    >,
                                                                },
                                                              )
                                                            }
                                                          >
                                                            <SelectTrigger className="h-8">
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {SCRAPER_CONDITION_ON_FALSE_OPTIONS.map(
                                                                option => (
                                                                  <SelectItem
                                                                    key={
                                                                      option.value
                                                                    }
                                                                    value={
                                                                      option.value
                                                                    }
                                                                  >
                                                                    {
                                                                      option.label
                                                                    }
                                                                  </SelectItem>
                                                                ),
                                                              )}
                                                            </SelectContent>
                                                          </Select>
                                                        </div>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                </div>
                                              ) : null}
                                            </div>
                                            {stepIndex <
                                            scraper.steps.length - 1 ? (
                                              <div
                                                className="relative flex flex-col items-center py-1.5"
                                                onMouseEnter={() =>
                                                  setHoveredConnectorIndex(
                                                    stepIndex,
                                                  )
                                                }
                                                onMouseLeave={() =>
                                                  setHoveredConnectorIndex(
                                                    prev =>
                                                      prev === stepIndex
                                                        ? null
                                                        : prev,
                                                  )
                                                }
                                              >
                                                <div className="h-2 w-px bg-border/60" />
                                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                                <div className="h-2 w-px bg-border/60" />
                                                {hoveredConnectorIndex ===
                                                stepIndex ? (
                                                  <div className="absolute left-1/2 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-md border border-border/60 bg-background/95 p-1 shadow-lg backdrop-blur">
                                                    <button
                                                      type="button"
                                                      className="block w-full rounded px-2 py-1 text-left text-[11px] text-foreground hover:bg-muted/60"
                                                      onClick={() =>
                                                        openAddStepComposer(
                                                          'extractHtml',
                                                          stepIndex + 1,
                                                        )
                                                      }
                                                    >
                                                      Insert step
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="mt-1 block w-full rounded px-2 py-1 text-left text-[11px] text-foreground hover:bg-muted/60"
                                                      onClick={() =>
                                                        openAddStepComposer(
                                                          'condition',
                                                          stepIndex + 1,
                                                          true,
                                                        )
                                                      }
                                                    >
                                                      Insert conditional
                                                    </button>
                                                  </div>
                                                ) : null}
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                      {scraper.steps.length === 0 ? (
                                        <div className="py-2 text-sm text-muted-foreground">
                                          No steps yet
                                        </div>
                                      ) : null}

                                      <div className="flex flex-wrap gap-2 pt-1">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => {
                                            if (addStepOpen) {
                                              setAddStepOpen(false);
                                              setPendingInsertIndex(null);
                                              setHoveredConnectorIndex(null);
                                              return;
                                            }
                                            openAddStepComposer(
                                              'extractHtml',
                                              null,
                                            );
                                          }}
                                        >
                                          <Plus className="h-4 w-4" />
                                          {addStepOpen
                                            ? 'Close add step'
                                            : 'Add step'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            openAddStepComposer(
                                              'condition',
                                              null,
                                              true,
                                            )
                                          }
                                        >
                                          <Plus className="h-4 w-4" />
                                          Add conditional branch
                                        </Button>
                                      </div>

                                      {addStepOpen ? (
                                        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                                          {pendingInsertIndex !== null ? (
                                            <div className="mb-2 rounded-md border border-teal-400/40 bg-teal-500/10 px-2 py-1 text-[11px] text-teal-200">
                                              Inserting at position{' '}
                                              {pendingInsertIndex + 1}
                                            </div>
                                          ) : null}
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                              size="sm"
                                              variant={
                                                newStepType === 'navigate'
                                                  ? 'default'
                                                  : 'secondary'
                                              }
                                              onClick={() =>
                                                setNewStepType('navigate')
                                              }
                                            >
                                              Navigate
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={
                                                newStepType === 'extractHtml'
                                                  ? 'default'
                                                  : 'secondary'
                                              }
                                              onClick={() =>
                                                setNewStepType('extractHtml')
                                              }
                                            >
                                              Extract HTML
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={
                                                newStepType === 'query'
                                                  ? 'default'
                                                  : 'secondary'
                                              }
                                              onClick={() =>
                                                setNewStepType('query')
                                              }
                                            >
                                              Query
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={
                                                newStepType === 'click'
                                                  ? 'default'
                                                  : 'secondary'
                                              }
                                              onClick={() =>
                                                setNewStepType('click')
                                              }
                                            >
                                              Click
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={
                                                newStepType === 'type'
                                                  ? 'default'
                                                  : 'secondary'
                                              }
                                              onClick={() =>
                                                setNewStepType('type')
                                              }
                                            >
                                              Type
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={
                                                newStepType === 'condition'
                                                  ? 'default'
                                                  : 'secondary'
                                              }
                                              onClick={() => {
                                                setNewStepType('condition');
                                                setConditionSourceKey(
                                                  resolveConditionSourceForInsert(
                                                    pendingInsertIndex,
                                                  ),
                                                );
                                              }}
                                            >
                                              Condition
                                            </Button>
                                          </div>

                                          <div className="mt-2.5 space-y-2">
                                            <div className="space-y-1">
                                              <Label className="text-[11px] text-muted-foreground">
                                                Delay override (ms)
                                              </Label>
                                              <Input
                                                value={newStepDelayMs}
                                                placeholder="Use default"
                                                className="h-8"
                                                onChange={(
                                                  e: ChangeEvent<HTMLInputElement>,
                                                ) =>
                                                  setNewStepDelayMs(
                                                    e.target.value,
                                                  )
                                                }
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-[11px] text-muted-foreground">
                                                Step name
                                              </Label>
                                              <Input
                                                value={newStepName}
                                                placeholder="e.g. Click Sign in"
                                                className="h-8"
                                                onChange={(
                                                  e: ChangeEvent<HTMLInputElement>,
                                                ) =>
                                                  setNewStepName(e.target.value)
                                                }
                                              />
                                            </div>

                                            {newStepType === 'query' ? (
                                              <div className="grid grid-cols-1 gap-2">
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    CSS selector
                                                  </Label>
                                                  <div className="flex items-center gap-2">
                                                    <Button
                                                      size="sm"
                                                      variant="secondary"
                                                      className={`h-8 w-8 px-0 transition-colors ${pickerStepId === 'add-step-query' ? 'border-teal-400/60 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20' : ''}`}
                                                      aria-label="Pick selector"
                                                      title="Pick selector"
                                                      onClick={() =>
                                                        startAddStepPicker(
                                                          'query',
                                                        )
                                                      }
                                                      disabled={!canUseElectron}
                                                    >
                                                      <MousePointerClick
                                                        className={`h-4 w-4 ${pickerStepId === 'add-step-query' ? 'text-teal-300 animate-pulse' : ''}`}
                                                      />
                                                    </Button>
                                                    <Input
                                                      value={querySelector}
                                                      placeholder=".card .title"
                                                      className="h-8 flex-1"
                                                      onChange={(
                                                        e: ChangeEvent<HTMLInputElement>,
                                                      ) =>
                                                        setQuerySelector(
                                                          e.target.value,
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                  <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={handleSuggest}
                                                    disabled={
                                                      !canUseElectron ||
                                                      suggesting
                                                    }
                                                  >
                                                    <Sparkles className="h-4 w-4" />
                                                    {suggesting
                                                      ? 'Suggesting…'
                                                      : 'AI suggest'}
                                                  </Button>
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    Attribute (optional)
                                                  </Label>
                                                  <Input
                                                    value={queryAttribute}
                                                    placeholder="href, src, data-id"
                                                    className="h-8"
                                                    onChange={(
                                                      e: ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                      setQueryAttribute(
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    Output key
                                                  </Label>
                                                  <Input
                                                    value={queryOutputKey}
                                                    placeholder="title"
                                                    className="h-8"
                                                    onChange={(
                                                      e: ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                      setQueryOutputKey(
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                </div>
                                                {suggestError ? (
                                                  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-[11px] text-destructive">
                                                    {suggestError}
                                                  </div>
                                                ) : null}
                                                {suggestions.length ? (
                                                  <div className="rounded-md border border-border/60 bg-background/40 p-2 text-[11px] text-muted-foreground">
                                                    <div className="font-medium text-foreground">
                                                      Suggestions
                                                    </div>
                                                    <div className="mt-2 space-y-2">
                                                      {suggestions.map(
                                                        (s, idx) => (
                                                          <button
                                                            key={`${s.outputKey}-${idx}`}
                                                            type="button"
                                                            className="w-full rounded-md border border-border/60 bg-muted/20 px-2 py-1 text-left"
                                                            onClick={() => {
                                                              setQuerySelector(
                                                                s.selector,
                                                              );
                                                              setQueryOutputKey(
                                                                s.outputKey,
                                                              );
                                                              setQueryName(
                                                                s.name,
                                                              );
                                                            }}
                                                          >
                                                            <div className="truncate font-medium text-foreground">
                                                              {s.name}
                                                            </div>
                                                            <div className="truncate">
                                                              {s.selector}
                                                            </div>
                                                          </button>
                                                        ),
                                                      )}
                                                    </div>
                                                  </div>
                                                ) : null}
                                              </div>
                                            ) : null}

                                            {newStepType === 'navigate' ? (
                                              <div className="grid grid-cols-1 gap-2">
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    URL
                                                  </Label>
                                                  <Input
                                                    value={navigateUrl}
                                                    placeholder="https://www.upwork.com"
                                                    className="h-8"
                                                    onChange={(
                                                      e: ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                      setNavigateUrl(
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            ) : null}

                                            {newStepType === 'click' ? (
                                              <div className="grid grid-cols-1 gap-2">
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    CSS selector (optional)
                                                  </Label>
                                                  <div className="flex items-center gap-2">
                                                    <Button
                                                      size="sm"
                                                      variant="secondary"
                                                      className={`h-8 w-8 px-0 transition-colors ${pickerStepId === 'add-step-click' ? 'border-teal-400/60 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20' : ''}`}
                                                      aria-label="Pick selector"
                                                      title="Pick selector"
                                                      onClick={() =>
                                                        startAddStepPicker(
                                                          'click',
                                                        )
                                                      }
                                                      disabled={!canUseElectron}
                                                    >
                                                      <MousePointerClick
                                                        className={`h-4 w-4 ${pickerStepId === 'add-step-click' ? 'text-teal-300 animate-pulse' : ''}`}
                                                      />
                                                    </Button>
                                                    <Input
                                                      value={clickSelector}
                                                      placeholder="button.primary"
                                                      className="h-8 flex-1"
                                                      onChange={(
                                                        e: ChangeEvent<HTMLInputElement>,
                                                      ) =>
                                                        setClickSelector(
                                                          e.target.value,
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            ) : null}

                                            {newStepType === 'type' ? (
                                              <div className="grid grid-cols-1 gap-2">
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    CSS selector
                                                  </Label>
                                                  <div className="flex items-center gap-2">
                                                    <Button
                                                      size="sm"
                                                      variant="secondary"
                                                      className={`h-8 w-8 px-0 transition-colors ${pickerStepId === 'add-step-type' ? 'border-teal-400/60 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20' : ''}`}
                                                      aria-label="Pick input"
                                                      title="Pick input"
                                                      onClick={() =>
                                                        startAddStepPicker(
                                                          'type',
                                                        )
                                                      }
                                                      disabled={!canUseElectron}
                                                    >
                                                      <MousePointerClick
                                                        className={`h-4 w-4 ${pickerStepId === 'add-step-type' ? 'text-teal-300 animate-pulse' : ''}`}
                                                      />
                                                    </Button>
                                                    <Input
                                                      value={typeSelector}
                                                      placeholder="input[name=email]"
                                                      className="h-8 flex-1"
                                                      onChange={(
                                                        e: ChangeEvent<HTMLInputElement>,
                                                      ) =>
                                                        setTypeSelector(
                                                          e.target.value,
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    Value
                                                  </Label>
                                                  <Input
                                                    value={typeValue}
                                                    placeholder="Text to type"
                                                    className="h-8"
                                                    onChange={(
                                                      e: ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                      setTypeValue(
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-2 py-1.5">
                                                  <div className="text-[11px] text-muted-foreground">
                                                    Press Enter after typing
                                                  </div>
                                                  <Switch
                                                    checked={typePressEnter}
                                                    onCheckedChange={
                                                      setTypePressEnter
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            ) : null}

                                            {newStepType === 'condition' ? (
                                              <div className="grid grid-cols-1 gap-2">
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    Output key from previous
                                                    step
                                                  </Label>
                                                  <Input
                                                    value={conditionSourceKey}
                                                    list="add-step-condition-source-options"
                                                    placeholder="value"
                                                    className="h-8"
                                                    onChange={(
                                                      e: ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                      setConditionSourceKey(
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                  <datalist id="add-step-condition-source-options">
                                                    {conditionSourceOptions.map(
                                                      key => (
                                                        <option
                                                          key={key}
                                                          value={key}
                                                        />
                                                      ),
                                                    )}
                                                  </datalist>
                                                  <p className="text-[11px] text-muted-foreground">
                                                    Uses values captured by
                                                    earlier query/type steps.
                                                  </p>
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    Condition
                                                  </Label>
                                                  <Select
                                                    value={conditionOperator}
                                                    onValueChange={(
                                                      value: string,
                                                    ) =>
                                                      setConditionOperator(
                                                        value as ScraperConditionStep['operator'],
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="h-8">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {SCRAPER_CONDITION_OPERATORS.map(
                                                        option => (
                                                          <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                          >
                                                            {option.label}
                                                          </SelectItem>
                                                        ),
                                                      )}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                {conditionOperatorNeedsValue(
                                                  conditionOperator,
                                                ) ? (
                                                  <div className="space-y-1">
                                                    <Label className="text-[11px] text-muted-foreground">
                                                      Expected value
                                                    </Label>
                                                    <Input
                                                      value={conditionValue}
                                                      placeholder="Expected value"
                                                      className="h-8"
                                                      onChange={(
                                                        e: ChangeEvent<HTMLInputElement>,
                                                      ) =>
                                                        setConditionValue(
                                                          e.target.value,
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                ) : null}
                                                <div className="space-y-1">
                                                  <Label className="text-[11px] text-muted-foreground">
                                                    If condition fails
                                                  </Label>
                                                  <Select
                                                    value={conditionOnFalse}
                                                    onValueChange={(
                                                      value: string,
                                                    ) =>
                                                      setConditionOnFalse(
                                                        value as NonNullable<
                                                          ScraperConditionStep['onFalse']
                                                        >,
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="h-8">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {SCRAPER_CONDITION_ON_FALSE_OPTIONS.map(
                                                        option => (
                                                          <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                          >
                                                            {option.label}
                                                          </SelectItem>
                                                        ),
                                                      )}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>
                                            ) : null}

                                            <div className="mt-3 border-t border-border/60 pt-3">
                                              <div className="flex flex-wrap gap-2">
                                                <Button
                                                  size="sm"
                                                  variant="default"
                                                  onClick={addStepFromForm}
                                                >
                                                  {newStepType === 'condition'
                                                    ? 'Add condition'
                                                    : 'Add step'}
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => {
                                                    setAddStepOpen(false);
                                                    setPendingInsertIndex(null);
                                                    setHoveredConnectorIndex(
                                                      null,
                                                    );
                                                  }}
                                                >
                                                  Cancel
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                    <div
                                      ref={workflowCanvasRef}
                                      className="h-[390px] rounded-lg border border-border/60 bg-black/35"
                                    >
                                      <ReactFlow
                                        nodes={stepFlowNodes}
                                        edges={stepFlowEdges}
                                        nodeTypes={flowNodeTypes}
                                        edgeTypes={flowEdgeTypes}
                                        fitView
                                        fitViewOptions={{
                                          padding: 0.04,
                                          minZoom: 0.65,
                                        }}
                                        minZoom={0.45}
                                        maxZoom={1.6}
                                        panOnDrag
                                        panOnScroll
                                        panOnScrollMode={PanOnScrollMode.Free}
                                        zoomOnScroll={false}
                                        selectionOnDrag
                                        multiSelectionKeyCode={[
                                          'Meta',
                                          'Control',
                                        ]}
                                        onPaneClick={clearStepSelection}
                                        onSelectionChange={
                                          handleStepFlowSelection
                                        }
                                        proOptions={{ hideAttribution: true }}
                                      >
                                        <Background
                                          gap={14}
                                          size={1}
                                          color="rgba(120,120,120,0.18)"
                                        />
                                        <Controls
                                          showInteractive={false}
                                          className="border-border/50!"
                                        />
                                      </ReactFlow>
                                    </div>
                                  </TabsContentContainer>
                                </Tabs>
                              </div>
                            </div>
                          )}
                        </PageCard>
                      </div>
                    </div>
                  </ResizablePanel>
                  {browserDocked ? (
                    <>
                      <ResizableHandle withHandle className="cursor-col-resize" />
                      <ResizablePanel
                        id="scraper-browser"
                        defaultSize="32%"
                        minSize="15%"
                        maxSize="80%"
                        collapsible={false}
                        className="min-h-0"
                      >
                        <PageCard className="flex min-h-0 h-full flex-col overflow-hidden p-2">
                          <div className="flex h-9 items-center justify-between px-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                              <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                              Embedded Browser
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 px-0"
                              onClick={() => {
                                setBrowserDocked(false);
                                setFloatingBrowserOpen(true);
                              }}
                            >
                              <PinOff className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="min-h-0 flex-1">
                            <EmbeddedBrowser
                              initialUrl={scraperInitialUrl}
                              className="h-full min-h-0"
                              urlBarEditable={true}
                              viewportWidth={scraper?.settings?.viewportWidth}
                              viewportHeight={scraper?.settings?.viewportHeight}
                              onViewportChange={({ width, height }) => {
                                if (!scraper) return;
                                setScraper({
                                  ...scraper,
                                  settings: {
                                    ...scraper.settings,
                                    viewportWidth: width,
                                    viewportHeight: height,
                                  },
                                });
                              }}
                              onElectronSendReady={handleElectronSendReady}
                              ipcHandlers={embeddedBrowserIpcHandlers}
                            />
                          </div>
                        </PageCard>
                      </ResizablePanel>
                    </>
                  ) : null}
                </ResizablePanelGroup>
              </TabsContentContainer>

              <TabsContentContainer
                value="runs"
                className="mt-4 flex-1 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Manual run controls and outputs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadRuns}>
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRun}
                      disabled={!scraper || !canUseElectron || running}
                    >
                      <Play className="h-4 w-4" />
                      Run now
                    </Button>
                  </div>
                </div>

                <div className="grid min-h-[260px] grid-cols-2 gap-3">
                  <PageCard className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold">Runs</div>
                      <PageBadge
                        variant={activeRun ? 'default' : 'secondary'}
                        className="h-5 px-2 text-[10px]"
                      >
                        {activeRun ? 'active' : 'idle'}
                      </PageBadge>
                    </div>
                    <div className="space-y-1">
                      {runs.map(run => (
                        <button
                          key={run.id}
                          onClick={() => handleOpenRun(run.id)}
                          className="w-full rounded-md border border-border/60 bg-background/40 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate font-medium">
                              {new Date(run.startedAt).toLocaleString()}
                            </div>
                            <PageBadge
                              variant={
                                run.status === 'running'
                                  ? 'default'
                                  : run.status === 'failed'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                              className="h-5 px-2 text-[10px]"
                            >
                              {run.status}
                            </PageBadge>
                          </div>
                          {run.error ? (
                            <div className="mt-1 truncate text-xs text-destructive">
                              {run.error}
                            </div>
                          ) : null}
                        </button>
                      ))}
                      {runs.length === 0 ? (
                        <div className="py-2 text-sm text-muted-foreground">
                          No runs yet
                        </div>
                      ) : null}
                    </div>
                  </PageCard>

                  <div className="space-y-3">
                    <PageCard className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-semibold">Run events</div>
                        {activeRun ? (
                          <PageBadge
                            variant={
                              activeRun.status === 'running'
                                ? 'default'
                                : activeRun.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {activeRun.status}
                          </PageBadge>
                        ) : (
                          <PageBadge variant="secondary">idle</PageBadge>
                        )}
                      </div>
                      <div className="h-[180px] overflow-auto rounded-md border border-border/60 bg-background/40 p-2">
                        {events.length === 0 ? (
                          <div className="text-xs text-muted-foreground">
                            No events
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {events.map(e => (
                              <div key={e.id} className="text-xs">
                                <span className="font-mono text-muted-foreground">
                                  {new Date(e.createdAt).toLocaleTimeString()}
                                </span>{' '}
                                <span className="font-medium">{e.type}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEvents([]);
                            setActiveRun(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Clear
                        </Button>
                      </div>
                    </PageCard>

                    <PageCard className="p-4">
                      <div className="mb-2 text-sm font-semibold">
                        Run results
                      </div>
                      {!activeRun?.results ? (
                        <div className="text-sm text-muted-foreground">
                          No results yet
                        </div>
                      ) : (
                        <pre className="h-[180px] overflow-auto rounded-md border border-border/60 bg-background/40 p-2 text-[11px] leading-4">
                          {JSON.stringify(activeRun.results, null, 2)}
                        </pre>
                      )}
                    </PageCard>
                  </div>
                </div>

                <PageCard className="p-4">
                  <div className="mb-2 text-sm font-semibold">
                    Last HTML snapshot
                  </div>
                  {lastHtml ? (
                    <div className="space-y-2">
                      <div className="truncate text-xs text-muted-foreground">
                        {lastHtml.href}
                      </div>
                      <pre className="max-h-[200px] overflow-auto rounded-md border border-border/60 bg-background/40 p-2 text-[11px] leading-4">
                        {lastHtml.html.slice(0, 8000)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No HTML captured yet
                    </div>
                  )}
                </PageCard>
              </TabsContentContainer>

              <TabsContentContainer value="settings" className="mt-4">
                <PageCard className="max-w-xl p-4">
                  <div className="mb-3 text-sm font-semibold">Settings</div>
                  {!scraper ? (
                    <div className="text-sm text-muted-foreground">
                      Loading…
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Scraper name
                        </Label>
                        <Input
                          value={scraper.name}
                          placeholder="Scraper name"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setScraper({ ...scraper, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Start URL
                        </Label>
                        <Input
                          value={scraper.startUrl}
                          placeholder="https://example.com"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setScraper({
                              ...scraper,
                              startUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <div className="text-sm font-semibold">Behavior</div>
                        <div className="mt-2 space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Wait time between steps (ms)
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              value={scraper.settings?.stepDelayMs ?? 0}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const value = Number(e.target.value || 0);
                                setScraper({
                                  ...scraper,
                                  settings: {
                                    ...scraper.settings,
                                    stepDelayMs: Number.isNaN(value)
                                      ? 0
                                      : value,
                                  },
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2">
                            <div>
                              <div className="text-xs font-medium">
                                Cursor jitter
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Adds small random pauses between steps for more
                                human-like timing.
                              </div>
                            </div>
                            <Switch
                              checked={Boolean(scraper.settings?.cursorJitter)}
                              onCheckedChange={checked => {
                                setScraper({
                                  ...scraper,
                                  settings: {
                                    ...scraper.settings,
                                    cursorJitter: checked,
                                  },
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2">
                            <div>
                              <div className="text-xs font-medium">
                                Cursor move
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Animates a soft cursor movement between steps.
                              </div>
                            </div>
                            <Switch
                              checked={Boolean(scraper.settings?.cursorMove)}
                              onCheckedChange={checked => {
                                setScraper({
                                  ...scraper,
                                  settings: {
                                    ...scraper.settings,
                                    cursorMove: checked,
                                  },
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2">
                            <div>
                              <div className="text-xs font-medium">
                                Scroll nudge
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Adds a tiny scroll movement between steps.
                              </div>
                            </div>
                            <Switch
                              checked={Boolean(scraper.settings?.scrollNudge)}
                              onCheckedChange={checked => {
                                setScraper({
                                  ...scraper,
                                  settings: {
                                    ...scraper.settings,
                                    scrollNudge: checked,
                                  },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </PageCard>
              </TabsContentContainer>
            </Tabs>
          </div>
        </PageBody>
        {!browserDocked && floatingBrowserOpen && activeTab === 'build' ? (
          <div className="pointer-events-none absolute inset-0 z-20">
            <div
              className="pointer-events-auto absolute overflow-hidden rounded-xl border border-border/70 bg-black/55 shadow-2xl backdrop-blur"
              style={{
                left: floatingBrowserRect.x,
                top: floatingBrowserRect.y,
                width: floatingBrowserRect.width,
                height: floatingBrowserRect.height,
              }}
            >
              <div
                className="flex h-9 cursor-move items-center justify-between bg-black/45 px-2 select-none"
                onPointerDown={startFloatingBrowserDrag}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  Embedded Browser
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 px-0"
                    onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      setBrowserDocked(true);
                    }}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 px-0"
                    onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      setFloatingBrowserOpen(false);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="h-[calc(100%-2.25rem)]">
                <EmbeddedBrowser
                  initialUrl={scraperInitialUrl}
                  className="h-full min-h-0"
                  urlBarEditable={true}
                  viewportWidth={scraper?.settings?.viewportWidth}
                  viewportHeight={scraper?.settings?.viewportHeight}
                  onViewportChange={({ width, height }) => {
                    if (!scraper) return;
                    setScraper({
                      ...scraper,
                      settings: {
                        ...scraper.settings,
                        viewportWidth: width,
                        viewportHeight: height,
                      },
                    });
                  }}
                  onElectronSendReady={handleElectronSendReady}
                  ipcHandlers={embeddedBrowserIpcHandlers}
                />
              </div>
            </div>
            <button
              type="button"
              className="pointer-events-auto absolute bottom-1 right-1 h-4 w-4 cursor-se-resize rounded-sm border border-border/70 bg-background/70"
              aria-label="Resize browser panel"
              onPointerDown={startFloatingBrowserResize}
            />
          </div>
        ) : null}
      </div>
    </Page>
  );
}
