/**
 * AgentActivityLogger
 *
 * Comprehensive logging system for all agent activities, decisions,
 * thinking processes, and meta-decisions. Supports real-time streaming
 * and persistent storage.
 */

import { prisma } from '@/lib/db/prisma';
import type {
  ActivityContext,
  ActivityLogQuery,
  ActivityLogResult,
  ActivityType,
  AgentActivity,
  AgentRole,
  AgentStreamEvent,
  Alternative,
  DecisionCategory,
  DecisionImpact,
  DecisionRecord,
  MentoringGuidance,
  MentoringSession,
  SessionSummary,
  ThinkingPhase,
} from '@/types/agent-activity';

// In-memory store for active sessions (for real-time access)
const activeSessions = new Map<string, SessionState>();
const activityBuffer = new Map<string, AgentActivity[]>();
const decisionLog = new Map<string, DecisionRecord[]>();
const mentoringLog = new Map<string, MentoringSession[]>();

// Event listeners for real-time streaming
type ActivityListener = (event: AgentStreamEvent) => void;
const listeners = new Map<string, Set<ActivityListener>>();

interface SessionState {
  sessionId: string;
  ticketId: string;
  projectId: string;
  agentId: string;
  agentName: string;
  agentRole: AgentRole;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'STOPPED';
  startedAt: Date;
  completedAt?: Date;
  currentActivity?: AgentActivity;
  isPaused: boolean;
  pauseReason?: string;
  correctionPending?: {
    what: string;
    how: string;
    newDirection?: string;
  };
}

export class AgentActivityLogger {
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Start a new logging session for an agent working on a ticket
   */
  async startSession(
    sessionId: string,
    ticketId: string,
    agentId: string,
    agentName: string,
    agentRole: AgentRole,
  ): Promise<void> {
    const state: SessionState = {
      sessionId,
      ticketId,
      projectId: this.projectId,
      agentId,
      agentName,
      agentRole,
      status: 'ACTIVE',
      startedAt: new Date(),
      isPaused: false,
    };

    activeSessions.set(sessionId, state);
    activityBuffer.set(sessionId, []);
    decisionLog.set(sessionId, []);
    mentoringLog.set(sessionId, []);

    // Emit session start event
    this.emit(sessionId, {
      event: 'state_change',
      data: {
        id: `state-${Date.now()}`,
        sessionId,
        ticketId,
        projectId: this.projectId,
        agentId,
        agentName,
        agentRole,
        type: 'THINKING',
        title: 'Session Started',
        description: `${agentName} started working on ticket`,
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  }

  /**
   * End a logging session
   */
  async endSession(
    sessionId: string,
    status: 'COMPLETED' | 'FAILED' | 'STOPPED',
    result?: any,
  ): Promise<void> {
    const state = activeSessions.get(sessionId);
    if (!state) return;

    state.status = status;
    state.completedAt = new Date();

    // Persist all activities to database
    await this.persistSession(sessionId);

    // Emit session end event
    this.emit(sessionId, {
      event: 'state_change',
      data: {
        id: `state-${Date.now()}`,
        sessionId,
        ticketId: state.ticketId,
        projectId: this.projectId,
        agentId: state.agentId,
        agentName: state.agentName,
        agentRole: state.agentRole,
        type: 'COMPLETED',
        title: 'Session Ended',
        description: `Session ${status.toLowerCase()}`,
        metadata: { result },
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });

    // Cleanup after a delay (keep for late listeners)
    setTimeout(() => {
      activeSessions.delete(sessionId);
      activityBuffer.delete(sessionId);
      decisionLog.delete(sessionId);
      mentoringLog.delete(sessionId);
      listeners.delete(sessionId);
    }, 60000);
  }

  // ============================================================================
  // Activity Logging
  // ============================================================================

  /**
   * Log an activity with full details
   */
  async logActivity(
    sessionId: string,
    activity: Omit<
      AgentActivity,
      'id' | 'sessionId' | 'projectId' | 'timestamp'
    >,
  ): Promise<AgentActivity> {
    const state = activeSessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Check if paused
    if (state.isPaused) {
      // Still log but mark as during pause
      activity.metadata = {
        ...activity.metadata,
        duringPause: true,
      };
    }

    const fullActivity: AgentActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      projectId: this.projectId,
      timestamp: new Date(),
      ...activity,
    };

    // Add to buffer
    const buffer = activityBuffer.get(sessionId) || [];
    buffer.push(fullActivity);
    activityBuffer.set(sessionId, buffer);

    // Update current activity
    state.currentActivity = fullActivity;

    // Emit activity event
    this.emit(sessionId, {
      event: 'activity_start',
      data: fullActivity,
      timestamp: new Date(),
    });

    // Also broadcast via Pusher for real-time UI
    await this.broadcastActivity(sessionId, fullActivity);

    return fullActivity;
  }

  /**
   * Log thinking/reasoning process
   */
  async logThinking(
    sessionId: string,
    agentId: string,
    agentName: string,
    agentRole: AgentRole,
    ticketId: string,
    phase: ThinkingPhase,
    title: string,
    content: string,
    context?: ActivityContext,
  ): Promise<AgentActivity> {
    return this.logActivity(sessionId, {
      agentId,
      agentName,
      agentRole,
      ticketId,
      type: 'THINKING',
      phase,
      title,
      description: title,
      content,
      context,
    });
  }

  /**
   * Log an action being taken
   */
  async logAction(
    sessionId: string,
    agentId: string,
    agentName: string,
    agentRole: AgentRole,
    ticketId: string,
    type: ActivityType,
    title: string,
    description: string,
    context?: ActivityContext,
  ): Promise<AgentActivity> {
    return this.logActivity(sessionId, {
      agentId,
      agentName,
      agentRole,
      ticketId,
      type,
      title,
      description,
      context,
    });
  }

  /**
   * Stream activity content chunk by chunk
   */
  async streamActivityChunk(
    sessionId: string,
    activityId: string,
    chunk: string,
  ): Promise<void> {
    const buffer = activityBuffer.get(sessionId);
    const activity = buffer?.find(a => a.id === activityId);

    if (activity) {
      activity.contentChunks = activity.contentChunks || [];
      activity.contentChunks.push(chunk);
      activity.content = (activity.content || '') + chunk;
      activity.isStreaming = true;

      this.emit(sessionId, {
        event: 'activity_chunk',
        data: activity,
        timestamp: new Date(),
      });

      // Broadcast chunk
      await this.broadcastStreamChunk(sessionId, activityId, chunk);
    }
  }

  /**
   * Complete a streaming activity
   */
  async completeActivity(
    sessionId: string,
    activityId: string,
    finalContent?: string,
  ): Promise<void> {
    const buffer = activityBuffer.get(sessionId);
    const activity = buffer?.find(a => a.id === activityId);

    if (activity) {
      activity.isStreaming = false;
      activity.completedAt = new Date();
      if (finalContent) {
        activity.content = finalContent;
      }
      activity.duration =
        activity.completedAt.getTime() - activity.timestamp.getTime();

      this.emit(sessionId, {
        event: 'activity_complete',
        data: activity,
        timestamp: new Date(),
      });
    }
  }

  // ============================================================================
  // Decision Logging
  // ============================================================================

  /**
   * Log a decision made by an agent
   */
  async logDecision(
    sessionId: string,
    decision: Omit<
      DecisionRecord,
      'id' | 'sessionId' | 'projectId' | 'timestamp'
    >,
  ): Promise<DecisionRecord> {
    const fullDecision: DecisionRecord = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      projectId: this.projectId,
      timestamp: new Date(),
      ...decision,
    };

    // Add to decision log
    const decisions = decisionLog.get(sessionId) || [];
    decisions.push(fullDecision);
    decisionLog.set(sessionId, decisions);

    // Emit decision event
    this.emit(sessionId, {
      event: 'decision_made',
      data: fullDecision,
      timestamp: new Date(),
    });

    // Broadcast via Pusher
    await this.broadcastDecision(sessionId, fullDecision);

    // Also log as activity for unified timeline
    await this.logActivity(sessionId, {
      agentId: decision.agentId,
      agentName: decision.agentName,
      agentRole: decision.agentRole,
      ticketId: decision.ticketId,
      type: 'DECISION',
      title: `Decision: ${decision.title}`,
      description: decision.description,
      content: decision.reasoning,
      context: {
        alternatives: decision.alternatives,
        selectedOption: decision.selectedOption,
        reasoning: decision.reasoning,
      },
    });

    return fullDecision;
  }

  /**
   * Helper to create a decision with alternatives
   */
  async makeDecision(
    sessionId: string,
    agentId: string,
    agentName: string,
    agentRole: AgentRole,
    ticketId: string,
    category: DecisionCategory,
    title: string,
    description: string,
    context: string,
    alternatives: Array<{
      title: string;
      description: string;
      pros?: string[];
      cons?: string[];
    }>,
    selectedIndex: number,
    reasoning: string,
    impact: DecisionImpact,
  ): Promise<DecisionRecord> {
    const alts: Alternative[] = alternatives.map((alt, i) => ({
      id: `alt-${i}`,
      title: alt.title,
      description: alt.description,
      pros: alt.pros,
      cons: alt.cons,
      selected: i === selectedIndex,
    }));

    return this.logDecision(sessionId, {
      agentId,
      agentName,
      agentRole,
      ticketId,
      category,
      title,
      description,
      context,
      alternatives: alts,
      selectedOption: `alt-${selectedIndex}`,
      reasoning,
      impact,
    });
  }

  // ============================================================================
  // Mentoring Logging
  // ============================================================================

  /**
   * Start a mentoring session
   */
  async startMentoringSession(
    sessionId: string,
    mentorId: string,
    mentorName: string,
    mentorRole: AgentRole,
    menteeId: string,
    menteeName: string,
    menteeRole: AgentRole,
    topic: string,
    context: string,
    ticketId?: string,
  ): Promise<MentoringSession> {
    const mentoringSession: MentoringSession = {
      id: `mentoring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: this.projectId,
      ticketId,
      mentorId,
      mentorName,
      mentorRole,
      menteeId,
      menteeName,
      menteeRole,
      topic,
      context,
      guidance: [],
      keyTakeaways: [],
      status: 'ACTIVE',
      startedAt: new Date(),
    };

    // Add to mentoring log
    const sessions = mentoringLog.get(sessionId) || [];
    sessions.push(mentoringSession);
    mentoringLog.set(sessionId, sessions);

    // Emit event
    this.emit(sessionId, {
      event: 'mentoring_start',
      data: mentoringSession,
      timestamp: new Date(),
    });

    // Broadcast
    await this.broadcastMentoringStart(sessionId, mentoringSession);

    return mentoringSession;
  }

  /**
   * Add guidance to a mentoring session
   */
  async addMentoringGuidance(
    sessionId: string,
    mentoringSessionId: string,
    guidance: Omit<MentoringGuidance, 'id' | 'timestamp'>,
  ): Promise<MentoringGuidance> {
    const sessions = mentoringLog.get(sessionId);
    const session = sessions?.find(s => s.id === mentoringSessionId);

    if (!session) {
      throw new Error(`Mentoring session ${mentoringSessionId} not found`);
    }

    const fullGuidance: MentoringGuidance = {
      id: `guidance-${Date.now()}`,
      timestamp: new Date(),
      ...guidance,
    };

    session.guidance.push(fullGuidance);

    // Emit event
    this.emit(sessionId, {
      event: 'mentoring_guidance',
      data: session,
      timestamp: new Date(),
    });

    // Broadcast
    await this.broadcastMentoringGuidance(
      sessionId,
      mentoringSessionId,
      fullGuidance,
    );

    return fullGuidance;
  }

  /**
   * Complete a mentoring session with key takeaways
   */
  async completeMentoringSession(
    sessionId: string,
    mentoringSessionId: string,
    keyTakeaways: string[],
    codePatterns?: MentoringSession['codePatterns'],
  ): Promise<MentoringSession> {
    const sessions = mentoringLog.get(sessionId);
    const session = sessions?.find(s => s.id === mentoringSessionId);

    if (!session) {
      throw new Error(`Mentoring session ${mentoringSessionId} not found`);
    }

    session.status = 'COMPLETED';
    session.completedAt = new Date();
    session.keyTakeaways = keyTakeaways;
    if (codePatterns) {
      session.codePatterns = codePatterns;
    }

    // Emit event
    this.emit(sessionId, {
      event: 'mentoring_complete',
      data: session,
      timestamp: new Date(),
    });

    // Store takeaways in context store for persistence
    await this.persistMentoringContext(session);

    return session;
  }

  // ============================================================================
  // Session Control
  // ============================================================================

  /**
   * Pause a session
   */
  async pauseSession(sessionId: string, reason?: string): Promise<void> {
    const state = activeSessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    state.isPaused = true;
    state.pauseReason = reason;
    state.status = 'PAUSED';

    // Log the pause as an activity
    await this.logActivity(sessionId, {
      agentId: state.agentId,
      agentName: state.agentName,
      agentRole: state.agentRole,
      ticketId: state.ticketId,
      type: 'WAITING',
      title: 'Session Paused',
      description: reason || 'Session paused by user',
      metadata: { pauseReason: reason },
    });

    this.emit(sessionId, {
      event: 'control_received',
      data: {
        success: true,
        sessionId,
        action: 'PAUSE',
        previousState: 'ACTIVE',
        newState: 'PAUSED',
        message: reason || 'Session paused',
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  }

  /**
   * Resume a paused session
   */
  async resumeSession(sessionId: string): Promise<void> {
    const state = activeSessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    state.isPaused = false;
    state.pauseReason = undefined;
    state.status = 'ACTIVE';

    // Log the resume
    await this.logActivity(sessionId, {
      agentId: state.agentId,
      agentName: state.agentName,
      agentRole: state.agentRole,
      ticketId: state.ticketId,
      type: 'STATUS_UPDATE',
      title: 'Session Resumed',
      description: 'Session resumed by user',
    });

    this.emit(sessionId, {
      event: 'control_received',
      data: {
        success: true,
        sessionId,
        action: 'RESUME',
        previousState: 'PAUSED',
        newState: 'ACTIVE',
        message: 'Session resumed',
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  }

  /**
   * Add a correction to the session
   */
  async addCorrection(
    sessionId: string,
    what: string,
    how: string,
    newDirection?: string,
  ): Promise<void> {
    const state = activeSessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    state.correctionPending = { what, how, newDirection };

    // Log the correction
    await this.logActivity(sessionId, {
      agentId: state.agentId,
      agentName: state.agentName,
      agentRole: state.agentRole,
      ticketId: state.ticketId,
      type: 'COMMUNICATION',
      title: 'Correction Received',
      description: `User correction: ${what}`,
      content: `What: ${what}\nHow: ${how}${newDirection ? `\nNew Direction: ${newDirection}` : ''}`,
      metadata: { correction: { what, how, newDirection } },
    });

    this.emit(sessionId, {
      event: 'control_received',
      data: {
        success: true,
        sessionId,
        action: 'CORRECT',
        previousState: state.status,
        newState: state.status,
        message: `Correction added: ${what}`,
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  }

  /**
   * Get any pending correction for a session
   */
  getPendingCorrection(sessionId: string): SessionState['correctionPending'] {
    const state = activeSessions.get(sessionId);
    return state?.correctionPending;
  }

  /**
   * Clear pending correction after it's been addressed
   */
  clearPendingCorrection(sessionId: string): void {
    const state = activeSessions.get(sessionId);
    if (state) {
      state.correctionPending = undefined;
    }
  }

  /**
   * Check if session is paused
   */
  isSessionPaused(sessionId: string): boolean {
    const state = activeSessions.get(sessionId);
    return state?.isPaused ?? false;
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  /**
   * Get session summary
   */
  getSessionSummary(sessionId: string): SessionSummary | null {
    const state = activeSessions.get(sessionId);
    if (!state) return null;

    const activities = activityBuffer.get(sessionId) || [];
    const decisions = decisionLog.get(sessionId) || [];
    const mentoring = mentoringLog.get(sessionId) || [];

    return {
      sessionId,
      ticketId: state.ticketId,
      projectId: state.projectId,
      agentId: state.agentId,
      agentName: state.agentName,
      agentRole: state.agentRole,
      status: state.status,
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      duration: state.completedAt
        ? state.completedAt.getTime() - state.startedAt.getTime()
        : Date.now() - state.startedAt.getTime(),
      activityCount: activities.length,
      decisionCount: decisions.length,
      errorCount: activities.filter(a => a.type === 'ERROR').length,
      currentActivity: state.currentActivity,
      recentActivities: activities.slice(-10),
      keyDecisions: decisions,
      mentoringSessions: mentoring,
    };
  }

  /**
   * Get activities for a session
   */
  getSessionActivities(sessionId: string): AgentActivity[] {
    return activityBuffer.get(sessionId) || [];
  }

  /**
   * Get decisions for a session
   */
  getSessionDecisions(sessionId: string): DecisionRecord[] {
    return decisionLog.get(sessionId) || [];
  }

  /**
   * Query activities across sessions
   */
  async queryActivities(query: ActivityLogQuery): Promise<ActivityLogResult> {
    // For now, query from in-memory buffers
    // In production, this would query from database
    let activities: AgentActivity[] = [];

    for (const [sessionId, buffer] of activityBuffer) {
      activities.push(...buffer);
    }

    // Apply filters
    if (query.projectId) {
      activities = activities.filter(a => a.projectId === query.projectId);
    }
    if (query.ticketId) {
      activities = activities.filter(a => a.ticketId === query.ticketId);
    }
    if (query.sessionId) {
      activities = activities.filter(a => a.sessionId === query.sessionId);
    }
    if (query.agentId) {
      activities = activities.filter(a => a.agentId === query.agentId);
    }
    if (query.agentRole) {
      activities = activities.filter(a => a.agentRole === query.agentRole);
    }
    if (query.types?.length) {
      activities = activities.filter(a => query.types!.includes(a.type));
    }
    if (query.phases?.length) {
      activities = activities.filter(
        a => a.phase && query.phases!.includes(a.phase),
      );
    }
    if (query.from) {
      activities = activities.filter(a => a.timestamp >= query.from!);
    }
    if (query.to) {
      activities = activities.filter(a => a.timestamp <= query.to!);
    }

    // Sort
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    activities.sort((a, b) => {
      if (query.sortBy === 'duration') {
        return ((a.duration || 0) - (b.duration || 0)) * sortOrder;
      }
      return (a.timestamp.getTime() - b.timestamp.getTime()) * sortOrder;
    });

    const total = activities.length;
    const offset = query.offset || 0;
    const limit = query.limit || 50;

    return {
      activities: activities.slice(offset, offset + limit),
      total,
      hasMore: offset + limit < total,
    };
  }

  // ============================================================================
  // Event Subscription
  // ============================================================================

  /**
   * Subscribe to session events
   */
  subscribe(sessionId: string, listener: ActivityListener): () => void {
    let sessionListeners = listeners.get(sessionId);
    if (!sessionListeners) {
      sessionListeners = new Set();
      listeners.set(sessionId, sessionListeners);
    }
    sessionListeners.add(listener);

    // Return unsubscribe function
    return () => {
      sessionListeners?.delete(listener);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(sessionId: string, event: AgentStreamEvent): void {
    const sessionListeners = listeners.get(sessionId);
    sessionListeners?.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in activity listener:', e);
      }
    });
  }

  // ============================================================================
  // Persistence
  // ============================================================================

  /**
   * Persist session data to database
   */
  private async persistSession(sessionId: string): Promise<void> {
    const state = activeSessions.get(sessionId);
    const activities = activityBuffer.get(sessionId) || [];
    const decisions = decisionLog.get(sessionId) || [];
    const mentoring = mentoringLog.get(sessionId) || [];

    if (!state) return;

    // Store as JSON in a new table or as ticket comments
    // For now, store key activities as ticket comments
    try {
      const keyActivities = activities.filter(a =>
        ['DECISION', 'ERROR', 'COMPLETED', 'MENTORING'].includes(a.type),
      );

      for (const activity of keyActivities) {
        await prisma.ticketComment.create({
          data: {
            ticketId: state.ticketId,
            authorId: state.agentId,
            authorType: 'agent',
            authorName: state.agentName,
            content: `[${activity.type}] ${activity.title}\n\n${activity.description}${activity.content ? '\n\n' + activity.content : ''}`,
            isInternal: true,
          },
        });
      }

      // Store decisions summary
      if (decisions.length > 0) {
        const decisionSummary = decisions
          .map(d => `- **${d.title}**: ${d.reasoning}`)
          .join('\n');

        await prisma.ticketComment.create({
          data: {
            ticketId: state.ticketId,
            authorId: state.agentId,
            authorType: 'agent',
            authorName: state.agentName,
            content: `## Key Decisions Made\n\n${decisionSummary}`,
            isInternal: true,
          },
        });
      }
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  }

  /**
   * Persist mentoring context for future reference
   */
  private async persistMentoringContext(
    session: MentoringSession,
  ): Promise<void> {
    // This will be handled by the AgentContextStore
    // For now, create a ticket comment
    try {
      if (session.ticketId) {
        const takeaways = session.keyTakeaways.map(t => `- ${t}`).join('\n');
        const patterns =
          session.codePatterns
            ?.map(
              p =>
                `### ${p.name}\n${p.description}\n\`\`\`\n${p.pattern}\n\`\`\``,
            )
            .join('\n\n') || '';

        await prisma.ticketComment.create({
          data: {
            ticketId: session.ticketId,
            authorId: session.mentorId,
            authorType: 'agent',
            authorName: session.mentorName,
            content: `## Mentoring Session: ${session.topic}\n\n**Mentee:** ${session.menteeName}\n\n### Key Takeaways\n${takeaways}${patterns ? '\n\n### Code Patterns\n' + patterns : ''}`,
            isInternal: false,
          },
        });
      }
    } catch (error) {
      console.error('Failed to persist mentoring context:', error);
    }
  }

  // ============================================================================
  // Pusher Broadcasting
  // ============================================================================

  private async broadcastActivity(
    sessionId: string,
    activity: AgentActivity,
  ): Promise<void> {
    try {
      const project = await prisma.project.findFirst({
        where: { id: this.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-activity',
            {
              sessionId,
              activity: {
                id: activity.id,
                type: activity.type,
                phase: activity.phase,
                title: activity.title,
                description: activity.description,
                agentId: activity.agentId,
                agentName: activity.agentName,
                agentRole: activity.agentRole,
                ticketId: activity.ticketId,
                timestamp: activity.timestamp.toISOString(),
              },
            },
          );
        }
      }
    } catch (error) {
      console.error('[Pusher] Failed to broadcast activity:', error);
    }
  }

  private async broadcastStreamChunk(
    sessionId: string,
    activityId: string,
    chunk: string,
  ): Promise<void> {
    try {
      const project = await prisma.project.findFirst({
        where: { id: this.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-activity-chunk',
            {
              sessionId,
              activityId,
              chunk,
              timestamp: new Date().toISOString(),
            },
          );
        }
      }
    } catch (error) {
      console.error('[Pusher] Failed to broadcast chunk:', error);
    }
  }

  private async broadcastDecision(
    sessionId: string,
    decision: DecisionRecord,
  ): Promise<void> {
    try {
      const project = await prisma.project.findFirst({
        where: { id: this.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-decision',
            {
              sessionId,
              decision: {
                id: decision.id,
                category: decision.category,
                title: decision.title,
                description: decision.description,
                reasoning: decision.reasoning,
                impact: decision.impact,
                agentName: decision.agentName,
                agentRole: decision.agentRole,
                timestamp: decision.timestamp.toISOString(),
              },
            },
          );
        }
      }
    } catch (error) {
      console.error('[Pusher] Failed to broadcast decision:', error);
    }
  }

  private async broadcastMentoringStart(
    sessionId: string,
    session: MentoringSession,
  ): Promise<void> {
    try {
      const project = await prisma.project.findFirst({
        where: { id: this.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-mentoring-start',
            {
              sessionId,
              mentoring: {
                id: session.id,
                topic: session.topic,
                mentorName: session.mentorName,
                menteeName: session.menteeName,
                startedAt: session.startedAt.toISOString(),
              },
            },
          );
        }
      }
    } catch (error) {
      console.error('[Pusher] Failed to broadcast mentoring start:', error);
    }
  }

  private async broadcastMentoringGuidance(
    sessionId: string,
    mentoringSessionId: string,
    guidance: MentoringGuidance,
  ): Promise<void> {
    try {
      const project = await prisma.project.findFirst({
        where: { id: this.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-mentoring-guidance',
            {
              sessionId,
              mentoringSessionId,
              guidance: {
                id: guidance.id,
                type: guidance.type,
                title: guidance.title,
                content: guidance.content,
                timestamp: guidance.timestamp.toISOString(),
              },
            },
          );
        }
      }
    } catch (error) {
      console.error('[Pusher] Failed to broadcast mentoring guidance:', error);
    }
  }
}

// Export singleton factory
const loggerInstances = new Map<string, AgentActivityLogger>();

export function getActivityLogger(projectId: string): AgentActivityLogger {
  let logger = loggerInstances.get(projectId);
  if (!logger) {
    logger = new AgentActivityLogger(projectId);
    loggerInstances.set(projectId, logger);
  }
  return logger;
}
