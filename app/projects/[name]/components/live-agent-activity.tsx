'use client';

import { getPusherClient } from '@/lib/pusher/client';
import { Button, Card } from '@summoniq/applab-ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  TestTube,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AgentActivity {
  agentId: string;
  agentName: string;
  agentRole: string;
  ticketId: string;
  ticketTitle: string;
  status: string;
  startedAt: Date;
  currentStep?: string;
  notes: string[];
  progress?: number;
}

interface LiveAgentActivityProps {
  projectName: string;
}

interface SmokeStep {
  step: string;
  status: string;
  timestamp: string;
}

interface SmokeResult {
  sessionId: string;
  steps: SmokeStep[];
}

export function LiveAgentActivity({ projectName }: LiveAgentActivityProps) {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<string[]>([]);
  const [smokeRunning, setSmokeRunning] = useState(false);
  const [smokeResult, setSmokeResult] = useState<SmokeResult | null>(null);
  const [smokeError, setSmokeError] = useState<string | null>(null);

  useEffect(() => {
    // Load active work sessions
    loadActiveSessions();

    // Set up Pusher for real-time updates
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`project-${projectName}`);

    // Agent started work
    channel.bind('agent-work-started', (data: any) => {
      console.log('[Pusher] Agent work started:', data);

      const activity: AgentActivity = {
        agentId: data.agent.id,
        agentName: data.agent.name,
        agentRole: data.agent.role,
        ticketId: data.ticket.id,
        ticketTitle: data.ticket.title,
        status: 'ANALYZING',
        startedAt: new Date(data.startedAt),
        currentStep: 'Analyzing requirements',
        notes: [`Started working on: ${data.ticket.title}`],
        progress: 5,
      };

      setActivities(prev => {
        const existing = prev.find(a => a.ticketId === activity.ticketId);
        if (existing) {
          return prev.map(a =>
            a.ticketId === activity.ticketId ? activity : a,
          );
        }
        return [...prev, activity];
      });

      addRecentUpdate(
        `${data.agent.name} started working on "${data.ticket.title}"`,
      );
    });

    // Agent progress update
    channel.bind('agent-progress', (data: any) => {
      console.log('[Pusher] Agent progress:', data);

      setActivities(prev =>
        prev.map(activity => {
          if (activity.ticketId === data.ticketId) {
            return {
              ...activity,
              currentStep: data.step,
              progress: data.progress,
              notes: [...activity.notes, data.message],
            };
          }
          return activity;
        }),
      );

      addRecentUpdate(`${data.agentName}: ${data.message}`);
    });

    // Agent completed work
    channel.bind('agent-work-completed', (data: any) => {
      console.log('[Pusher] Agent work completed:', data);

      setActivities(prev =>
        prev.filter(activity => activity.ticketId !== data.ticketId),
      );

      addRecentUpdate(
        `${data.agentName} completed work on "${data.ticketTitle}"`,
      );
    });

    // Ticket status changed
    channel.bind('ticket-updated', (data: any) => {
      console.log('[Pusher] Ticket updated:', data.ticket);

      setActivities(prev =>
        prev.map(activity => {
          if (activity.ticketId === data.ticket.id) {
            return {
              ...activity,
              status: data.ticket.status,
            };
          }
          return activity;
        }),
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`project-${projectName}`);
    };
  }, [projectName]);

  const loadActiveSessions = async () => {
    try {
      const response = await fetch(
        `/api/work-sessions/active?projectName=${encodeURIComponent(projectName)}`,
      );
      if (response.ok) {
        const data = await response.json();

        const sessions = data.sessions || [];

        const activeActivities: AgentActivity[] = (
          Array.isArray(sessions) ? sessions : []
        )
          .filter(
            (session: any) =>
              session?.context?.agent && session?.context?.ticket,
          )
          .map((session: any) => {
            const rawActivities: any[] = Array.isArray(session.activities)
              ? session.activities
              : [];
            const normalizedActivities = rawActivities
              .map(a => ({
                ...a,
                timestamp: new Date(a.timestamp),
              }))
              .filter(a => !Number.isNaN(a.timestamp.getTime()));

            const latestActivity = normalizedActivities
              .slice()
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

            const progress = Math.min(normalizedActivities.length * 15, 95);

            return {
              agentId: session.context.agent.id,
              agentName: session.context.agent.name,
              agentRole: session.context.agent.role,
              ticketId: session.context.ticket.id,
              ticketTitle: session.context.ticket.title,
              status: session.status || 'ACTIVE',
              startedAt: new Date(session.startedAt),
              currentStep: latestActivity?.description || 'Working on ticket',
              notes: normalizedActivities
                .slice(-3)
                .map(a => `[${a.type}] ${a.description}`),
              progress,
            } satisfies AgentActivity;
          });

        setActivities(activeActivities);
      }
    } catch (error) {
      console.error('Failed to load active work:', error);
    }
  };

  const addRecentUpdate = (update: string) => {
    setRecentUpdates(prev => [update, ...prev].slice(0, 10));

    // Remove after 10 seconds
    setTimeout(() => {
      setRecentUpdates(prev => prev.filter(u => u !== update));
    }, 10000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'ANALYZING':
        return <Activity className="w-4 h-4 text-purple-500 animate-pulse" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'BLOCKED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const handleSmokeRun = useCallback(async () => {
    setSmokeRunning(true);
    setSmokeError(null);

    try {
      const response = await fetch('/api/work-sessions/smoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to run smoke workflow');
      }

      setSmokeResult(data);
      const summary = Array.isArray(data?.steps)
        ? data.steps.map((step: SmokeStep) => `${step.step}:${step.status}`).join(' · ')
        : '';
      toast.success('Session smoke workflow complete', {
        description: summary || undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Smoke workflow failed';
      setSmokeError(message);
      toast.error(message);
    } finally {
      setSmokeRunning(false);
    }
  }, [projectName]);

  return (
    <div className="flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Live Agent Activity
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {activities.length} {activities.length === 1 ? 'agent' : 'agents'}{' '}
              currently working
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleSmokeRun}
            disabled={smokeRunning}
            className="gap-1.5"
          >
            {smokeRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <TestTube className="w-3.5 h-3.5" />
            )}
            {smokeRunning ? 'Running' : 'Run Smoke'}
          </Button>
        </div>
        {smokeError && (
          <p className="text-xs text-destructive">Smoke failed: {smokeError}</p>
        )}
        {!smokeError && smokeResult && (
          <p className="text-xs text-muted-foreground">
            Last smoke:{' '}
            {smokeResult.steps
              .map(step => `${step.step}:${step.status}`)
              .join(' · ')}
          </p>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Recent Updates Banner */}
        <AnimatePresence>
          {recentUpdates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                <div className="flex-1 text-sm space-y-1">
                  {recentUpdates.slice(0, 3).map((update, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      {update}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Work Sessions */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Active Agents ({activities.length})
          </h3>

          {activities.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No agents currently working</p>
              <p className="text-xs mt-1">
                Create a ticket to see agents in action!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => (
                <motion.div
                  key={activity.ticketId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-4">
                    {/* Agent Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {activity.agentName
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {activity.agentName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.agentRole.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(activity.startedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">
                        {activity.ticketTitle}
                      </div>
                      {activity.currentStep && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {activity.currentStep}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {activity.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {activity.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${activity.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Recent Notes */}
                    {activity.notes.length > 0 && (
                      <div className="space-y-1">
                        {activity.notes.slice(-3).map((note, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-muted-foreground pl-3 border-l-2 border-muted"
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
