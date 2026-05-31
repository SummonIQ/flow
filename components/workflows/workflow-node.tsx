'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Bot, Zap, Clock, CheckCircle, Code, Settings, Play } from 'lucide-react';
import type { WorkflowStep } from '@/types/workflows';

const stepTypeIcons = {
  trigger: Play,
  agent: Bot,
  condition: Zap,
  delay: Clock,
  manual: CheckCircle,
  api_call: Code,
  transform: Settings,
};

const stepTypeColors = {
  trigger: 'bg-emerald-500/90 border-emerald-600 text-emerald-950 dark:text-emerald-50',
  agent: 'bg-blue-500/90 border-blue-600 text-blue-950 dark:text-blue-50',
  condition: 'bg-purple-500/90 border-purple-600 text-purple-950 dark:text-purple-50',
  delay: 'bg-gray-500/90 border-gray-600 text-gray-950 dark:text-gray-50',
  manual: 'bg-yellow-500/90 border-yellow-600 text-yellow-950 dark:text-yellow-50',
  api_call: 'bg-green-500/90 border-green-600 text-green-950 dark:text-green-50',
  transform: 'bg-indigo-500/90 border-indigo-600 text-indigo-950 dark:text-indigo-50',
};

export const WorkflowNode = memo(({ data, selected }: NodeProps<WorkflowStep>) => {
  const Icon = stepTypeIcons[data.type];
  
  return (
    <div
      className={`rounded-lg border-2 bg-background p-4 shadow-md transition-all min-w-[280px] ${
        stepTypeColors[data.type]
      } ${selected ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-105' : ''} ${
        !data.isEnabled ? 'opacity-50' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />
      
      <div className="flex items-start gap-3">
        {/* Step Icon */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
            data.type === 'trigger' ? 'bg-emerald-700/30 dark:bg-emerald-300/30' :
            data.type === 'agent' ? 'bg-blue-700/30 dark:bg-blue-300/30' :
            data.type === 'condition' ? 'bg-purple-700/30 dark:bg-purple-300/30' :
            data.type === 'delay' ? 'bg-gray-700/30 dark:bg-gray-300/30' :
            data.type === 'manual' ? 'bg-yellow-700/30 dark:bg-yellow-300/30' :
            data.type === 'api_call' ? 'bg-green-700/30 dark:bg-green-300/30' :
            'bg-indigo-700/30 dark:bg-indigo-300/30'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Step Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide uppercase opacity-70">
              Step {data.order}
            </span>
            {data.delay && (
              <span className="text-xs opacity-60">
                • {data.delay.value} {data.delay.unit}
              </span>
            )}
          </div>
          <h4 className="mb-1 text-sm font-semibold truncate">
            {data.name}
          </h4>
          {data.agentName && (
            <p className="truncate text-xs opacity-70">
              Agent: {data.agentName}
            </p>
          )}
          {data.metrics && (
            <div className="mt-3 flex gap-3 text-xs">
              <div>
                <span className="opacity-60">Runs:</span>{' '}
                <span className="font-semibold">{data.metrics.executions}</span>
              </div>
              {data.metrics.successes > 0 && (
                <div>
                  <span className="opacity-60">Success:</span>{' '}
                  <span className="font-semibold">{data.metrics.successes}</span>
                </div>
              )}
              {data.metrics.failures > 0 && (
                <div className="text-destructive">
                  <span className="opacity-60">Fail:</span>{' '}
                  <span className="font-semibold">{data.metrics.failures}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
