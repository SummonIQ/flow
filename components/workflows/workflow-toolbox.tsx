'use client';

import { Bot, Zap, Clock, CheckCircle, Code, Settings } from 'lucide-react';

const stepTypes = [
  {
    type: 'agent',
    label: 'AI Agent',
    icon: Bot,
    description: 'Execute an AI agent task',
    color: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: Zap,
    description: 'Branch based on condition',
    color: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400',
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Wait before next step',
    color: 'bg-gray-500/10 border-gray-500/30 text-gray-700 dark:text-gray-400',
  },
  {
    type: 'manual',
    label: 'Manual Task',
    icon: CheckCircle,
    description: 'Requires human action',
    color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400',
  },
  {
    type: 'api_call',
    label: 'API Call',
    icon: Code,
    description: 'Make external API request',
    color: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400',
  },
  {
    type: 'transform',
    label: 'Transform Data',
    icon: Settings,
    description: 'Transform or process data',
    color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400',
  },
];

export function WorkflowToolbox() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Workflow Steps</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Drag steps onto canvas. Every workflow starts with a trigger node.
      </p>
      <div className="space-y-2">
        {stepTypes.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.type}
              draggable
              onDragStart={(e) => onDragStart(e, step.type)}
              className={`
                ${step.color}
                cursor-grab active:cursor-grabbing
                border-2 rounded-lg p-3
                transition-all hover:scale-105 hover:shadow-md
              `}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{step.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{step.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border">
        <h4 className="text-xs font-semibold mb-2">How to use:</h4>
        <ul className="text-xs space-y-1 text-muted-foreground">
          <li>• Drag steps onto canvas</li>
          <li>• Connect steps by dragging from handles</li>
          <li>• Click steps to edit properties</li>
          <li>• Click edges to edit transitions</li>
        </ul>
      </div>
    </div>
  );
}
