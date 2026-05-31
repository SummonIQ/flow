'use client';

import { Card } from '@summoniq/applab-ui';
import { Activity, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ActiveSession {
  id: string;
  ticketId: string;
  agentId: string;
  status: string;
  startedAt: string;
  agent: {
    name: string;
  };
  ticket: {
    title: string;
  };
}

interface ActiveSessionsWidgetProps {
  projectName: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ActiveSessionsWidget({
  projectName,
  autoRefresh = true,
  refreshInterval = 5000,
}: ActiveSessionsWidgetProps) {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();

    if (autoRefresh) {
      const interval = setInterval(loadSessions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [projectName, autoRefresh, refreshInterval]);

  async function loadSessions() {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/tickets?status=IN_PROGRESS`,
      );

      if (response.ok) {
        const data = await response.json();
        const tickets = data.tickets || data || [];

        // Transform tickets to sessions format
        // Only show tickets updated in the last hour as "active work"
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const activeSessions: ActiveSession[] = tickets
          .filter((ticket: any) => {
            if (!ticket.assignedTo) return false;
            const updatedAt = new Date(ticket.updatedAt).getTime();
            return updatedAt > oneHourAgo;
          })
          .map((ticket: any) => ({
            id: `session-${ticket.id}`,
            ticketId: ticket.id,
            agentId: ticket.assignedTo.id,
            status: ticket.status,
            startedAt: ticket.updatedAt,
            agent: {
              name: ticket.assignedTo.name,
            },
            ticket: {
              title: ticket.title,
            },
          }));

        setSessions(activeSessions);
      }
    } catch (error) {
      console.error('Failed to load active work:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading active work...</span>
        </div>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
        <h3 className="text-sm font-medium">Active Work ({sessions.length})</h3>
      </div>

      <div className="space-y-2">
        {sessions.map(session => {
          const duration = Date.now() - new Date(session.startedAt).getTime();
          const formatDuration = (ms: number) => {
            const minutes = Math.floor(ms / 60000);
            if (minutes < 60) return `${minutes}m`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ${minutes % 60}m`;
            const days = Math.floor(hours / 24);
            if (days < 7) return `${days}d ${hours % 24}h`;
            const weeks = Math.floor(days / 7);
            return `${weeks}w ${days % 7}d`;
          };

          return (
            <Link
              key={session.id}
              href={`/projects/${projectName}?session=${session.id}`}
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.agent.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.ticket.title}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDuration(duration)}
                </span>
              </div>

              <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 animate-pulse"
                  style={{ width: '60%' }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
