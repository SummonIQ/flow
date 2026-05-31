'use client';

import { useEffect, useState } from 'react';
import { Card } from '@summoniq/applab-ui';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Code,
  FileEdit,
  TestTube,
  MessageSquare,
  Eye
} from 'lucide-react';

interface WorkSession {
  id: string;
  ticketId: string;
  agentId: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  activities: WorkActivity[];
  context: {
    agent: {
      name: string;
      role: string;
    };
    ticket: {
      title: string;
    };
  };
  result?: {
    success: boolean;
    summary: string;
    filesModified: string[];
    testsAdded: number;
    linesChanged: number;
  };
}

interface WorkActivity {
  id: string;
  type: 'ANALYSIS' | 'PLANNING' | 'CODING' | 'TESTING' | 'REVIEW' | 'COMMENT';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface WorkSessionMonitorProps {
  sessionId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const activityIcons = {
  ANALYSIS: Clock,
  PLANNING: FileEdit,
  CODING: Code,
  TESTING: TestTube,
  REVIEW: Eye,
  COMMENT: MessageSquare,
};

const activityColors = {
  ANALYSIS: 'text-blue-500',
  PLANNING: 'text-purple-500',
  CODING: 'text-green-500',
  TESTING: 'text-orange-500',
  REVIEW: 'text-pink-500',
  COMMENT: 'text-gray-500',
};

export function WorkSessionMonitor({
  sessionId,
  autoRefresh = true,
  refreshInterval = 3000,
}: WorkSessionMonitorProps) {
  const [session, setSession] = useState<WorkSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSession();

    if (autoRefresh) {
      const interval = setInterval(loadSession, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [sessionId, autoRefresh, refreshInterval]);

  async function loadSession() {
    try {
      const response = await fetch(`/api/work-sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error('Failed to load session');
      }

      const data = await response.json();
      setSession(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-muted-foreground">Loading session...</span>
        </div>
      </Card>
    );
  }

  if (error || !session) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="w-5 h-5" />
          <span>{error || 'Session not found'}</span>
        </div>
      </Card>
    );
  }

  const duration = session.completedAt
    ? new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()
    : Date.now() - new Date(session.startedAt).getTime();

  const durationMinutes = Math.floor(duration / 60000);
  const durationSeconds = Math.floor((duration % 60000) / 1000);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{session.context.agent.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {session.context.agent.role.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {session.context.ticket.title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {session.status === 'ACTIVE' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Working...</span>
            </div>
          )}
          {session.status === 'COMPLETED' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
          {session.status === 'FAILED' && (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Clock className="w-4 h-4" />
        <span>
          {durationMinutes}m {durationSeconds}s
        </span>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-muted-foreground">Activity</h4>
        <div className="space-y-2">
          {session.activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const color = activityColors[activity.type];

            return (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                <div className="flex-1">
                  <p className="text-foreground">{activity.description}</p>
                  {activity.metadata && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {JSON.stringify(activity.metadata)}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {session.result && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Results</h4>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">{session.result.summary}</p>

            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-blue-500" />
                <span>{session.result.filesModified.length} files modified</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-green-500" />
                <span>{session.result.linesChanged} lines changed</span>
              </div>
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4 text-orange-500" />
                <span>{session.result.testsAdded} tests added</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
