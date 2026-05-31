'use client';

/**
 * AgentActivityStream
 *
 * Real-time streaming display of agent activities, decisions, and thinking.
 * Includes controls for pausing, stopping, and correcting agents midstream.
 */

import { getPusherClient } from '@/lib/pusher/client';
import { Badge, Button, Card, Input } from '@summoniq/applab-ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  FileText,
  GitBranch,
  Lightbulb,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  Send,
  Square,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Types
interface AgentActivityEvent {
  id: string;
  sessionId: string;
  type: string;
  phase?: string;
  title: string;
  description: string;
  content?: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  ticketId: string;
  timestamp: string;
}

interface DecisionEvent {
  id: string;
  sessionId: string;
  category: string;
  title: string;
  description: string;
  reasoning: string;
  impact: {
    scope: string;
    riskLevel: string;
  };
  agentName: string;
  agentRole: string;
  timestamp: string;
}

interface MentoringEvent {
  id: string;
  topic: string;
  mentorName: string;
  menteeName: string;
  startedAt: string;
}

interface SessionState {
  sessionId: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'STOPPED';
  isPaused: boolean;
  ticketId: string;
  ticketTitle: string;
  agentName: string;
  agentRole: string;
  startedAt: string;
}

interface Props {
  projectName: string;
  initialSessions?: SessionState[];
}

export function AgentActivityStream({
  projectName,
  initialSessions = [],
}: Props) {
  // State
  const [sessions, setSessions] = useState<SessionState[]>(initialSessions);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [activities, setActivities] = useState<AgentActivityEvent[]>([]);
  const [decisions, setDecisions] = useState<DecisionEvent[]>([]);
  const [mentoring, setMentoring] = useState<MentoringEvent[]>([]);
  const [streamingContent, setStreamingContent] = useState<Map<string, string>>(
    new Map(),
  );
  const [expanded, setExpanded] = useState(true);
  const [showCorrection, setShowCorrection] = useState(false);
  const [correction, setCorrection] = useState({
    what: '',
    how: '',
    newDirection: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const activityRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (activityRef.current) {
      activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }
  }, [activities, streamingContent]);

  // Subscribe to Pusher events
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`project-${projectName}`);

    // Agent work started
    channel.bind('agent-work-started', (data: any) => {
      const session: SessionState = {
        sessionId: data.sessionId,
        status: 'ACTIVE',
        isPaused: false,
        ticketId: data.ticket.id,
        ticketTitle: data.ticket.title,
        agentName: data.agent.name,
        agentRole: data.agent.role,
        startedAt: data.startedAt,
      };

      setSessions(prev => {
        const existing = prev.find(s => s.sessionId === session.sessionId);
        if (existing) {
          return prev.map(s =>
            s.sessionId === session.sessionId ? session : s,
          );
        }
        return [...prev, session];
      });

      // Auto-select if no session selected
      if (!selectedSession) {
        setSelectedSession(data.sessionId);
      }
    });

    // Activity event
    channel.bind('agent-activity', (data: any) => {
      const activity: AgentActivityEvent = {
        id: data.activity.id,
        sessionId: data.sessionId,
        type: data.activity.type,
        phase: data.activity.phase,
        title: data.activity.title,
        description: data.activity.description,
        agentId: data.activity.agentId,
        agentName: data.activity.agentName,
        agentRole: data.activity.agentRole,
        ticketId: data.activity.ticketId,
        timestamp: data.activity.timestamp,
      };

      setActivities(prev => [...prev, activity]);
    });

    // Activity chunk (streaming content)
    channel.bind('agent-activity-chunk', (data: any) => {
      setStreamingContent(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(data.activityId) || '';
        newMap.set(data.activityId, current + data.chunk);
        return newMap;
      });
    });

    // Decision made
    channel.bind('agent-decision', (data: any) => {
      const decision: DecisionEvent = {
        id: data.decision.id,
        sessionId: data.sessionId,
        category: data.decision.category,
        title: data.decision.title,
        description: data.decision.description,
        reasoning: data.decision.reasoning,
        impact: data.decision.impact,
        agentName: data.decision.agentName,
        agentRole: data.decision.agentRole,
        timestamp: data.decision.timestamp,
      };

      setDecisions(prev => [...prev, decision]);
    });

    // Mentoring started
    channel.bind('agent-mentoring-start', (data: any) => {
      const session: MentoringEvent = {
        id: data.mentoring.id,
        topic: data.mentoring.topic,
        mentorName: data.mentoring.mentorName,
        menteeName: data.mentoring.menteeName,
        startedAt: data.mentoring.startedAt,
      };

      setMentoring(prev => [...prev, session]);
    });

    // Work completed/stopped
    channel.bind('agent-work-completed', (data: any) => {
      setSessions(prev =>
        prev.map(s =>
          s.ticketId === data.ticketId ? { ...s, status: 'COMPLETED' } : s,
        ),
      );
    });

    channel.bind('agent-work-stopped', (data: any) => {
      setSessions(prev =>
        prev.map(s =>
          s.ticketId === data.ticketId ? { ...s, status: 'STOPPED' } : s,
        ),
      );
    });

    // Control events
    channel.bind('agent-control', (data: any) => {
      setSessions(prev =>
        prev.map(s =>
          s.sessionId === data.sessionId
            ? {
                ...s,
                status: data.newState,
                isPaused: data.newState === 'PAUSED',
              }
            : s,
        ),
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`project-${projectName}`);
    };
  }, [projectName, selectedSession]);

  // Control handlers
  const handlePause = async (sessionId: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/agent-sessions/${sessionId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PAUSE', reason: 'Paused by user' }),
      });
    } catch (error) {
      console.error('Failed to pause:', error);
    }
    setIsLoading(false);
  };

  const handleResume = async (sessionId: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/agent-sessions/${sessionId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESUME' }),
      });
    } catch (error) {
      console.error('Failed to resume:', error);
    }
    setIsLoading(false);
  };

  const handleStop = async (sessionId: string) => {
    if (
      !confirm(
        'Are you sure you want to stop this agent? All work will be rolled back.',
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      await fetch(`/api/agent-sessions/${sessionId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'STOP', reason: 'Stopped by user' }),
      });
    } catch (error) {
      console.error('Failed to stop:', error);
    }
    setIsLoading(false);
  };

  const handleSendCorrection = async (sessionId: string) => {
    if (!correction.what || !correction.how) {
      return;
    }
    setIsLoading(true);
    try {
      await fetch(`/api/agent-sessions/${sessionId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CORRECT',
          correction,
        }),
      });
      setCorrection({ what: '', how: '', newDirection: '' });
      setShowCorrection(false);
    } catch (error) {
      console.error('Failed to send correction:', error);
    }
    setIsLoading(false);
  };

  // Get icon for activity type
  const getActivityIcon = (type: string, phase?: string) => {
    switch (type) {
      case 'THINKING':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'DECISION':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'ACTION':
      case 'CODING':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'CODE_WRITE':
      case 'FILE_WRITE':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'BLOCKED':
      case 'WAITING':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'ROUTING':
        return <GitBranch className="w-4 h-4 text-cyan-500" />;
      case 'MENTORING':
        return <Users className="w-4 h-4 text-pink-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get color for decision category
  const getDecisionColor = (category: string): string => {
    switch (category) {
      case 'TECHNICAL':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ARCHITECTURE':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'ASSIGNMENT':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'MENTORING':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // Filter activities for selected session
  const sessionActivities = selectedSession
    ? activities.filter(a => a.sessionId === selectedSession)
    : activities;

  const sessionDecisions = selectedSession
    ? decisions.filter(d => d.sessionId === selectedSession)
    : decisions;

  const activeSession = sessions.find(s => s.sessionId === selectedSession);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Agent Activity Stream</h3>
          {sessions.filter(s => s.status === 'ACTIVE').length > 0 && (
            <Badge variant="default" className="animate-pulse">
              {sessions.filter(s => s.status === 'ACTIVE').length} active
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Session tabs */}
            {sessions.length > 0 && (
              <div className="flex gap-2 p-2 border-b overflow-x-auto">
                {sessions.map(session => (
                  <button
                    key={session.sessionId}
                    onClick={() => setSelectedSession(session.sessionId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      selectedSession === session.sessionId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {session.status === 'ACTIVE' && !session.isPaused && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    {session.isPaused && <Pause className="w-3 h-3" />}
                    {session.status === 'COMPLETED' && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {session.status === 'STOPPED' && (
                      <Square className="w-3 h-3" />
                    )}
                    <span>{session.agentName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Controls for active session */}
            {activeSession && activeSession.status === 'ACTIVE' && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
                <span className="text-sm text-muted-foreground">
                  Working on: <strong>{activeSession.ticketTitle}</strong>
                </span>
                <div className="flex-1" />
                <div className="flex gap-2">
                  {activeSession.isPaused ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResume(activeSession.sessionId)}
                      disabled={isLoading}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePause(activeSession.sessionId)}
                      disabled={isLoading}
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCorrection(!showCorrection)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Correct
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStop(activeSession.sessionId)}
                    disabled={isLoading}
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                </div>
              </div>
            )}

            {/* Correction input */}
            <AnimatePresence>
              {showCorrection && activeSession && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b bg-yellow-500/5"
                >
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Send Correction to {activeSession.agentName}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCorrection(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="What needs to be corrected?"
                      value={correction.what}
                      onChange={e =>
                        setCorrection({ ...correction, what: e.target.value })
                      }
                    />
                    <Input
                      placeholder="How should it be fixed?"
                      value={correction.how}
                      onChange={e =>
                        setCorrection({ ...correction, how: e.target.value })
                      }
                    />
                    <Input
                      placeholder="New direction to take (optional)"
                      value={correction.newDirection}
                      onChange={e =>
                        setCorrection({
                          ...correction,
                          newDirection: e.target.value,
                        })
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSendCorrection(activeSession.sessionId)
                      }
                      disabled={
                        !correction.what || !correction.how || isLoading
                      }
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Correction
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Activity stream */}
            <div
              ref={activityRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ maxHeight: '400px' }}
            >
              {sessionActivities.length === 0 && sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No agent activity yet</p>
                  <p className="text-sm">
                    Create a ticket to see agents in action
                  </p>
                </div>
              ) : sessionActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
                  <p className="text-sm">Waiting for activity...</p>
                </div>
              ) : (
                <>
                  {sessionActivities.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-3"
                    >
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {getActivityIcon(activity.type, activity.phase)}
                        </div>
                        {idx < sessionActivities.length - 1 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-medium text-sm">
                              {activity.title}
                            </span>
                            {activity.phase && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {activity.phase}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>

                        {/* Streaming content */}
                        {(activity.content ||
                          streamingContent.get(activity.id)) && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {streamingContent.get(activity.id) ||
                              activity.content}
                            {streamingContent.has(activity.id) && (
                              <span className="animate-pulse">▊</span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            {/* Decisions panel */}
            {sessionDecisions.length > 0 && (
              <div className="border-t p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Key Decisions ({sessionDecisions.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sessionDecisions.map(decision => (
                    <div
                      key={decision.id}
                      className={`p-2 rounded-lg border text-sm ${getDecisionColor(decision.category)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{decision.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {decision.category}
                        </Badge>
                      </div>
                      <p className="text-xs mt-1 opacity-80">
                        {decision.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentoring indicator */}
            {mentoring.length > 0 && (
              <div className="border-t p-4 bg-pink-500/5">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-pink-500" />
                  <span className="font-medium">Mentoring in progress:</span>
                  {mentoring.map(m => (
                    <span key={m.id} className="text-muted-foreground">
                      {m.mentorName} → {m.menteeName}: {m.topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
