'use client';

import { Badge, Card } from '@summoniq/applab-ui';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useState } from 'react';
import { StartWorkButton } from './start-work-button';
import { StopWorkButton } from './stop-work-button';

export type KanbanTicket = {
  id: string;
  number: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  assignedTo: {
    id: string;
    name: string;
    role: string;
  } | null;
  labels: string[];
  project?: {
    key: string | null;
    name: string;
  };
};

interface KanbanCardProps {
  ticket: KanbanTicket;
  isDragging?: boolean;
  onWorkStarted?: (sessionId: string) => void;
  onWorkStopped?: () => void;
  onClick?: (ticketId: string) => void;
}

export function KanbanCard({
  ticket,
  isDragging = false,
  onWorkStarted,
  onWorkStopped,
  onClick,
}: KanbanCardProps) {
  const [showStartButton, setShowStartButton] = useState(false);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: ticket.id,
  });

  const getTicketNumber = () => {
    const projectKey =
      ticket.project?.key ||
      ticket.project?.name.substring(0, 4).toUpperCase() ||
      'TICK';
    return `${projectKey}-${ticket.number}`;
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'destructive',
      HIGH: 'destructive',
      MEDIUM: 'default',
      LOW: 'secondary',
    };
    return colors[priority] || 'default';
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0) + priority.slice(1).toLowerCase();
  };

  const getAgentInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canStartWork =
    ticket.assignedTo &&
    (ticket.status === 'BACKLOG' || ticket.status === 'TODO');
  const canStopWork = ticket.assignedTo && ticket.status === 'IN_PROGRESS';

  const handleCardClick = (e: React.MouseEvent) => {
    // Skip when dragging
    if (isDraggingLocal || isSortableDragging) return;

    const target = e.target as HTMLElement;

    // Ignore clicks that originate from interactive controls (buttons, the drag handle, links, etc.)
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('[data-drag-handle]') ||
      target.closest('a')
    ) {
      return;
    }

    onClick?.(ticket.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onMouseEnter={() => setShowStartButton(true)}
      onMouseLeave={() => setShowStartButton(false)}
      onMouseDown={() => setIsDraggingLocal(true)}
      onMouseUp={() => setIsDraggingLocal(false)}
    >
      <Card
        className={`p-3 hover:shadow-md transition-shadow ${
          isDragging ? 'shadow-lg ring-2 ring-primary' : ''
        }`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        <div className="flex items-start gap-2">
          <div
            className="pt-1 cursor-grab active:cursor-grabbing"
            data-drag-handle
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4
              className="font-medium text-sm mb-1 line-clamp-2 cursor-pointer select-none"
              onClick={e => {
                e.stopPropagation();
                if (isDraggingLocal || isSortableDragging) return;
                onClick?.(ticket.id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.(ticket.id);
                }
              }}
            >
              {ticket.title}
            </h4>

            {/* Description */}
            {ticket.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {ticket.description}
              </p>
            )}

            {/* Labels */}
            {ticket.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {ticket.labels.map((label, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 cursor-pointer hover:bg-secondary/80 transition-colors font-mono select-none"
                  data-ticket-trigger
                  onClick={e => {
                    e.stopPropagation();
                    if (isDraggingLocal || isSortableDragging) return;
                    onClick?.(ticket.id);
                  }}
                >
                  {getTicketNumber()}
                </Badge>
                <Badge
                  variant={getPriorityColor(ticket.priority) as any}
                  className="text-xs"
                >
                  {formatPriority(ticket.priority)}
                </Badge>
              </div>

              {/* Assignee */}
              {ticket.assignedTo && (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {getAgentInitials(ticket.assignedTo.name)}
                  </div>
                </div>
              )}
            </div>

            {/* Work Control Buttons - Shows on hover */}
            {showStartButton && ticket.assignedTo && (
              <div className="mt-2 pt-2 border-t">
                {canStartWork ? (
                  <StartWorkButton
                    ticketId={ticket.id}
                    agentId={ticket.assignedTo.id}
                    agentName={ticket.assignedTo.name.split(' ')[0]}
                    onWorkStarted={onWorkStarted}
                    variant="outline"
                    size="sm"
                  />
                ) : canStopWork ? (
                  <StopWorkButton
                    ticketId={ticket.id}
                    agentName={ticket.assignedTo.name.split(' ')[0]}
                    onWorkStopped={onWorkStopped}
                    variant="destructive"
                    size="sm"
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
