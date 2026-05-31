'use client';

import { useState } from 'react';
import { MoreVertical, MessageSquare, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@summoniq/applab-ui';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignedTo?: {
      id: string;
      name: string;
      role: string;
    };
    labels?: string[];
    _count?: {
      comments: number;
    };
    createdAt: string;
    updatedAt: string;
  };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
  isDragging?: boolean;
}

const statusColors: Record<string, string> = {
  BACKLOG: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  TODO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  IN_REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  QA: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  BLOCKED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  DONE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  DESIGN: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  UNREFINED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  READY: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
};

const priorityIcons: Record<string, React.ReactElement> = {
  CRITICAL: <AlertCircle className="w-4 h-4 text-red-600" />,
  HIGH: <AlertCircle className="w-4 h-4 text-orange-600" />,
  MEDIUM: <AlertCircle className="w-4 h-4 text-yellow-600" />,
  LOW: <CheckCircle className="w-4 h-4 text-gray-600" />,
};

export function TicketCard({
  ticket,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
  isDragging = false,
}: TicketCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div
      className={cn(
        'bg-background border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all',
        isDragging && 'opacity-50 rotate-2 scale-105',
        'relative group'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {priorityIcons[ticket.priority]}
          <h3 className="font-medium text-sm line-clamp-2 flex-1">
            {ticket.title}
          </h3>
        </div>
        <button
          className="p-1 rounded hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-8 bg-background border border-border rounded-md shadow-lg z-10 py-1 min-w-[120px]">
            <button
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
                setShowMenu(false);
              }}
            >
              Edit
            </button>
            <button
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
                setShowMenu(false);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {ticket.description}
        </p>
      )}

      {/* Labels */}
      {ticket.labels && ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ticket.labels.map(label => (
            <Badge
              key={label}
              variant="outline"
              className="text-xs px-1.5 py-0"
            >
              {label}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {/* Assignee */}
          {ticket.assignedTo && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[100px]">
                {ticket.assignedTo.name}
              </span>
            </div>
          )}

          {/* Comments */}
          {ticket._count && ticket._count.comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{ticket._count.comments}</span>
            </div>
          )}
        </div>

        {/* Time */}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{getTimeAgo(ticket.updatedAt)}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3">
        <Badge
          className={cn(
            'text-xs px-2 py-0.5',
            statusColors[ticket.status]
          )}
        >
          {formatStatus(ticket.status)}
        </Badge>
      </div>
    </div>
  );
}
