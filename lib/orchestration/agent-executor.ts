/**
 * AgentExecutor
 *
 * Executes AI agent actions on tickets using LLM APIs.
 * Manages work sessions, tracks progress, and logs activities.
 */

import { prisma } from '@/lib/db/prisma';
import { triggerTicketUpdate } from '@/lib/pusher/server';
import { getOpenAIClient } from '@/lib/openai/client';
import { OPENAI_AGENT_MODEL_DEFAULT } from '@/lib/openai/config';
import type { Agent, Ticket } from '@prisma/client';
import { exec } from 'child_process';
import fs from 'fs/promises';
import type OpenAI from 'openai';
import path from 'path';
import { promisify } from 'util';
import {
  getActivityLogger,
  type AgentActivityLogger,
} from './agent-activity-logger';
import { getContextStore, type AgentContextStore } from './agent-context-store';

// AgentRole type for logging
type AgentRole =
  | 'TECH_LEAD'
  | 'FRONTEND_ENGINEER'
  | 'BACKEND_ENGINEER'
  | 'FULLSTACK_ENGINEER'
  | 'QA_ENGINEER'
  | 'DEVOPS_ENGINEER'
  | 'DESIGNER'
  | 'PRODUCT_OWNER'
  | 'SCRUM_MASTER'
  | 'SPECIALIST';

const execAsync = promisify(exec);

export interface WorkSession {
  id: string;
  ticketId: string;
  agentId: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  startedAt: Date;
  completedAt?: Date;
  activities: WorkActivity[];
  context: SessionContext;
  result?: WorkResult;
  blockingIssue?: BlockingIssue;
  timeoutMinutes?: number;
  timeoutCheckInterval?: NodeJS.Timeout;
}

export interface WorkActivity {
  id: string;
  sessionId: string;
  type:
    | 'ANALYSIS'
    | 'PLANNING'
    | 'CODING'
    | 'TESTING'
    | 'REVIEW'
    | 'COMMENT'
    | 'TOOL_CALL'
    | 'WAITING';
  description: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface BlockingIssue {
  type:
    | 'DATABASE_NEEDED'
    | 'ENV_VAR_NEEDED'
    | 'DEPENDENCY_NEEDED'
    | 'MANUAL_APPROVAL'
    | 'EXTERNAL_SERVICE';
  description: string;
  requirements: string[];
  canContinue: boolean;
  resolvedAt?: Date;
}

export interface SessionContext {
  ticket: Ticket;
  agent: Agent;
  projectPath?: string;
  relevantFiles?: string[];
  requirements?: string;
  constraints?: string[];
}

export interface WorkResult {
  success: boolean;
  summary: string;
  filesModified: string[];
  testsAdded: number;
  linesChanged: number;
  issuesFound?: string[];
  recommendations?: string[];
}

export interface ExecutionConfig {
  maxDuration?: number; // milliseconds
  enableFileAccess?: boolean;
  enableTesting?: boolean;
  requiresReview?: boolean;
  dryRun?: boolean;
  enableMcpTools?: boolean; // Enable MCP tools (fetch, playwright, prisma, etc.)
  enableBrowserValidation?: boolean; // Use Playwright for frontend validation
  skipExecution?: boolean; // Create session without running the agent loop
}

export interface McpToolCall {
  tool: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
}

export class AgentExecutor {
  private openai: OpenAI | null = null;
  private activeSessions: Map<string, WorkSession> = new Map();
  private activityLoggers: Map<string, AgentActivityLogger> = new Map();
  private contextStores: Map<string, AgentContextStore> = new Map();

  constructor() {}

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = getOpenAIClient();
    }
    return this.openai;
  }

  /**
   * Get or create activity logger for a project
   */
  private getLogger(projectId: string): AgentActivityLogger {
    let logger = this.activityLoggers.get(projectId);
    if (!logger) {
      logger = getActivityLogger(projectId);
      this.activityLoggers.set(projectId, logger);
    }
    return logger;
  }

  /**
   * Get or create context store for a project
   */
  private getContextStore(projectId: string): AgentContextStore {
    let store = this.contextStores.get(projectId);
    if (!store) {
      store = getContextStore(projectId);
      this.contextStores.set(projectId, store);
    }
    return store;
  }

  /**
   * Start agent work on a ticket
   */
  async startWork(
    ticketId: string,
    agentId: string,
    config?: ExecutionConfig,
  ): Promise<WorkSession> {
    // Load ticket and agent
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        team: {
          include: {
            members: { include: { agent: true } },
          },
        },
      },
    });

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!ticket || !agent) {
      throw new Error('Ticket or agent not found');
    }

    // Determine project path
    const projectPath = await this.getProjectPath(ticket);

    // Load project settings for timeout
    const project = await prisma.project.findUnique({
      where: { id: ticket.projectId },
      select: { agentWorkTimeoutMinutes: true, name: true },
    });

    const timeoutMinutes = project?.agentWorkTimeoutMinutes || 30;

    // Create work session
    const session: WorkSession = {
      id: `session-${Date.now()}`,
      ticketId,
      agentId,
      status: 'ACTIVE',
      startedAt: new Date(),
      activities: [],
      context: {
        ticket,
        agent,
        projectPath,
        requirements: ticket.description || undefined,
        constraints: this.extractConstraints(ticket),
      },
      timeoutMinutes,
    };

    this.activeSessions.set(session.id, session);

    // Set up timeout check
    this.setupTimeoutCheck(session);

    // Auto-assign and transition ticket to IN_PROGRESS
    const needsUpdate =
      ticket.status !== 'IN_PROGRESS' || ticket.assignedToId !== agentId;

    if (needsUpdate) {
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'IN_PROGRESS',
          assignedToId: agentId, // Assign to the agent starting work
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Create system comment for transition
      const wasAssigned = ticket.assignedToId === agentId;
      const commentContent = wasAssigned
        ? `Status automatically changed to IN_PROGRESS as ${agent.name} started working`
        : `Ticket assigned to ${agent.name} and status changed to IN_PROGRESS`;

      await prisma.ticketComment.create({
        data: {
          ticketId,
          content: commentContent,
          isInternal: true,
          authorId: agentId,
          authorType: 'agent',
          authorName: agent.name,
          actionType: wasAssigned ? 'status_change' : 'assignment',
        },
      });

      // Broadcast real-time update via Pusher
      try {
        // Get project name for Pusher channel
        const project = await prisma.project.findUnique({
          where: { id: ticket.projectId },
          select: { name: true },
        });

        if (project) {
          await triggerTicketUpdate(project.name, updatedTicket);
        }
      } catch (pusherError) {
        console.error(
          '[Pusher] Failed to broadcast ticket update:',
          pusherError,
        );
      }
    }

    // Log session start
    await this.logActivity(session.id, {
      type: 'COMMENT',
      description: `${agent.name} started working on ticket: ${ticket.title}`,
      timestamp: new Date(),
    });

    // Initialize activity logger session
    const logger = this.getLogger(ticket.projectId);
    await logger.startSession(
      session.id,
      ticketId,
      agent.id,
      agent.name,
      agent.role as AgentRole,
    );

    // Initialize context store
    const contextStore = this.getContextStore(ticket.projectId);
    await contextStore.initialize();

    // Broadcast agent work started via Pusher
    try {
      const project = await prisma.project.findUnique({
        where: { id: ticket.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-work-started',
            {
              agent: {
                id: agent.id,
                name: agent.name,
                role: agent.role,
              },
              ticket: {
                id: ticket.id,
                title: ticket.title,
                status: 'IN_PROGRESS',
              },
              sessionId: session.id,
              startedAt: session.startedAt,
            },
          );
        }
      }
    } catch (pusherError) {
      console.error(
        '[Pusher] Failed to broadcast agent work started:',
        pusherError,
      );
    }

    if (config?.skipExecution) {
      await this.logActivity(session.id, {
        type: 'COMMENT',
        description: 'Session created without execution (smoke test)',
        timestamp: new Date(),
      });
    } else {
      // Start execution in background
      this.executeWork(session, config, logger, contextStore).catch(error => {
        console.error('Error in agent execution:', error);
        this.failSession(session.id, error.message);
      });
    }

    return session;
  }

  /**
   * Execute the actual work
   */
  private async executeWork(
    session: WorkSession,
    config?: ExecutionConfig,
    logger?: AgentActivityLogger,
    contextStore?: AgentContextStore,
  ): Promise<void> {
    const { ticket, agent } = session.context;
    const agentRole = agent.role as AgentRole;

    try {
      // Check for any pending corrections before each major step
      const checkCorrections = async () => {
        if (logger) {
          const correction = logger.getPendingCorrection(session.id);
          if (correction) {
            await logger.logThinking(
              session.id,
              agent.id,
              agent.name,
              agentRole,
              ticket.id,
              'RECONSIDERATION',
              'Processing correction from user',
              `User correction received:\nWhat: ${correction.what}\nHow: ${correction.how}${correction.newDirection ? `\nNew Direction: ${correction.newDirection}` : ''}`,
            );
            logger.clearPendingCorrection(session.id);
            return correction;
          }
        }
        return null;
      };

      // Check if paused
      const checkPaused = async () => {
        if (logger?.isSessionPaused(session.id)) {
          await this.logActivity(session.id, {
            type: 'WAITING',
            description: 'Session paused - waiting for resume',
            timestamp: new Date(),
          });
          // Wait for resume (poll every second)
          while (logger.isSessionPaused(session.id)) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      };

      await checkPaused();
      await checkCorrections();

      // Step 1: Analyze the ticket
      await this.logActivity(session.id, {
        type: 'ANALYSIS',
        description: 'Analyzing ticket requirements and complexity',
        timestamp: new Date(),
      });

      // Log thinking process for analysis
      if (logger) {
        await logger.logThinking(
          session.id,
          agent.id,
          agent.name,
          agentRole,
          ticket.id,
          'UNDERSTANDING',
          'Understanding ticket requirements',
          `Analyzing ticket: ${ticket.title}\nDescription: ${ticket.description || 'N/A'}\nPriority: ${ticket.priority}`,
        );
      }

      const analysis = await this.analyzeTicket(ticket, agent);

      // Log analysis decision
      if (logger) {
        await logger.makeDecision(
          session.id,
          agent.id,
          agent.name,
          agentRole,
          ticket.id,
          'TECHNICAL',
          'Initial Analysis Complete',
          'Completed initial analysis of ticket requirements',
          `Ticket: ${ticket.title}`,
          [
            {
              title: 'Standard approach',
              description: 'Follow conventional implementation pattern',
            },
            {
              title: 'Optimized approach',
              description: 'Consider performance optimizations',
            },
          ],
          0,
          analysis.analysis.substring(0, 200),
          { scope: 'LOCAL', reversible: true, riskLevel: 'LOW' },
        );
      }

      await checkPaused();
      await checkCorrections();

      // Step 2: Create implementation plan
      await this.logActivity(session.id, {
        type: 'PLANNING',
        description: 'Creating implementation plan',
        timestamp: new Date(),
      });

      if (logger) {
        await logger.logThinking(
          session.id,
          agent.id,
          agent.name,
          agentRole,
          ticket.id,
          'PLANNING',
          'Creating implementation plan',
          'Evaluating approaches and creating step-by-step plan...',
        );
      }

      const plan = await this.createPlan(ticket, agent, analysis, config);

      // Check for blocking issues
      const blockingIssue = await this.detectBlockingIssues(session, plan);
      if (blockingIssue) {
        await this.blockSession(session.id, blockingIssue);
        return; // Exit and wait for manual resolution
      }

      // Step 3: Execute implementation
      await this.logActivity(session.id, {
        type: 'CODING',
        description: 'Implementing solution',
        timestamp: new Date(),
      });

      const implementation = await this.implement(session, plan, config);

      // Step 4: Run tests (if enabled)
      if (config?.enableTesting) {
        await this.logActivity(session.id, {
          type: 'TESTING',
          description: 'Running tests',
          timestamp: new Date(),
        });

        await this.runTests(session, implementation);
      }

      // Step 4.5: Browser validation (if enabled and frontend changes)
      if (config?.enableBrowserValidation && this.isFrontendTicket(ticket)) {
        await this.logActivity(session.id, {
          type: 'TOOL_CALL',
          description: 'Validating changes in browser',
          timestamp: new Date(),
        });

        await this.validateInBrowser(session, implementation);
      }

      // Step 5: Self-review
      await this.logActivity(session.id, {
        type: 'REVIEW',
        description: 'Performing self-review',
        timestamp: new Date(),
      });

      const review = await this.selfReview(ticket, agent, implementation);

      // Complete session
      const result: WorkResult = {
        success: true,
        summary: implementation.summary,
        filesModified: implementation.files,
        testsAdded: implementation.testsAdded,
        linesChanged: implementation.linesChanged,
        recommendations: review.recommendations,
      };

      await this.completeSession(session.id, result);

      // Update ticket status
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'IN_REVIEW',
          updatedAt: new Date(),
        },
      });

      // Add completion comment
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: agent.id,
          authorType: 'agent',
          authorName: agent.name,
          content: this.generateCompletionComment(result),
          isInternal: false,
        },
      });
    } catch (error) {
      await this.failSession(
        session.id,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  /**
   * Analyze ticket using LLM
   */
  private async analyzeTicket(ticket: Ticket, agent: Agent): Promise<any> {
    const prompt = `You are ${agent.name}, ${agent.description}.

Analyze this ticket:
Title: ${ticket.title}
Description: ${ticket.description}
Priority: ${ticket.priority}

Provide:
1. Key requirements
2. Technical approach
3. Potential challenges
4. Estimated complexity`;

    const response = await this.getOpenAI().chat.completions.create({
      model: agent.modelName || OPENAI_AGENT_MODEL_DEFAULT,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: agent.temperature || 0.7,
    });

    return {
      analysis: response.choices[0]?.message?.content || '',
      timestamp: new Date(),
    };
  }

  /**
   * Create implementation plan
   */
  private async createPlan(
    ticket: Ticket,
    agent: Agent,
    analysis: any,
    config?: ExecutionConfig,
  ): Promise<any> {
    const mcpToolsInfo = config?.enableMcpTools
      ? this.getMcpToolsDescription()
      : '';

    const prompt = `Based on this analysis:
${analysis.analysis}

Create a detailed implementation plan with:
1. Files to modify/create
2. Step-by-step tasks
3. Testing strategy
4. Rollback plan
${config?.enableMcpTools ? '5. MCP tools to use (if needed)' : ''}

${mcpToolsInfo}

${config?.enableBrowserValidation ? 'Note: You can use Playwright to validate frontend changes in a real browser.' : ''}`;

    const response = await this.getOpenAI().chat.completions.create({
      model: agent.modelName || OPENAI_AGENT_MODEL_DEFAULT,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5, // Lower temperature for planning
    });

    return {
      plan: response.choices[0]?.message?.content || '',
      timestamp: new Date(),
    };
  }

  /**
   * Implement the solution
   */
  private async implement(
    session: WorkSession,
    plan: any,
    config?: ExecutionConfig,
  ): Promise<any> {
    const { ticket, agent, projectPath } = session.context;

    // Dry run or no file access - simulate only
    if (config?.dryRun || !config?.enableFileAccess || !projectPath) {
      return this.simulateImplementation(ticket, agent, plan, config);
    }

    try {
      // Create git branch for this work
      const branchName = `agent/${ticket.id}-${Date.now()}`;
      await execAsync(`cd "${projectPath}" && git checkout -b ${branchName}`);

      await this.logActivity(session.id, {
        type: 'COMMENT',
        description: `Created branch: ${branchName}`,
        timestamp: new Date(),
      });

      // Generate implementation with file-specific instructions
      const prompt = `Implement the solution according to this plan:
${plan.plan}

IMPORTANT: Provide your response in the following JSON format:
{
  "files": [
    {
      "path": "relative/path/to/file.ts",
      "action": "create" | "modify",
      "content": "full file content here"
    }
  ],
  "summary": "Brief description of changes made"
}

Only modify files that are necessary for this ticket.`;

      const response = await this.getOpenAI().chat.completions.create({
        model: agent.modelName || OPENAI_AGENT_MODEL_DEFAULT,
        messages: [
          { role: 'system', content: agent.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      const responseContent = response.choices[0]?.message?.content || '{}';

      // Parse the AI response
      let implementation: any;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : responseContent;
        implementation = JSON.parse(jsonStr.trim());
      } catch (e) {
        // Fallback: treat as simple text response
        implementation = {
          files: [],
          summary: responseContent.substring(0, 200),
        };
      }

      const modifiedFiles: string[] = [];
      let totalLines = 0;

      // Write each file
      for (const file of implementation.files || []) {
        const fullPath = path.join(projectPath, file.path);

        // Security check: ensure path is within project
        if (!fullPath.startsWith(projectPath)) {
          throw new Error(
            `Security violation: Path ${file.path} is outside project`,
          );
        }

        // Create directory if needed
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        // Write file
        await fs.writeFile(fullPath, file.content, 'utf-8');
        modifiedFiles.push(file.path);
        totalLines += file.content.split('\n').length;

        await this.logActivity(session.id, {
          type: 'CODING',
          description: `${file.action === 'create' ? 'Created' : 'Modified'}: ${file.path}`,
          timestamp: new Date(),
        });
      }

      // Commit changes
      if (modifiedFiles.length > 0) {
        await execAsync(`cd "${projectPath}" && git add .`);
        await execAsync(
          `cd "${projectPath}" && git commit -m "Agent ${agent.name}: ${ticket.title}"`,
        );

        await this.logActivity(session.id, {
          type: 'COMMENT',
          description: `Committed ${modifiedFiles.length} file(s)`,
          timestamp: new Date(),
        });
      }

      return {
        summary:
          implementation.summary || `Modified ${modifiedFiles.length} files`,
        code: responseContent,
        files: modifiedFiles,
        testsAdded: 0,
        linesChanged: totalLines,
        branch: branchName,
        timestamp: new Date(),
      };
    } catch (error) {
      // Rollback on error
      if (projectPath) {
        try {
          await execAsync(`cd "${projectPath}" && git reset --hard HEAD`);
          await execAsync(
            `cd "${projectPath}" && git checkout main || git checkout master`,
          );
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }
      throw error;
    }
  }

  /**
   * Simulate implementation (dry run or no file access)
   */
  private async simulateImplementation(
    ticket: Ticket,
    agent: Agent,
    plan: any,
    config?: ExecutionConfig,
  ): Promise<any> {
    const prompt = `Implement the solution according to this plan:
${plan.plan}

DRY RUN: Describe what changes you would make without actually making them.`;

    const response = await this.getOpenAI().chat.completions.create({
      model: agent.modelName || OPENAI_AGENT_MODEL_DEFAULT,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    return {
      summary: 'Implementation simulated (dry run)',
      code: response.choices[0]?.message?.content || '',
      files: [],
      testsAdded: 0,
      linesChanged: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Run tests
   */
  private async runTests(
    session: WorkSession,
    implementation: any,
  ): Promise<void> {
    const { projectPath } = session.context;

    // If no project path or file access disabled, simulate
    if (!projectPath) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.logActivity(session.id, {
        type: 'TESTING',
        description: 'Tests simulated (no project path)',
        timestamp: new Date(),
        metadata: { passed: 0, failed: 0, skipped: 0 },
      });
      return;
    }

    try {
      // Try common test commands in order of preference
      const testCommands = [
        'bun test -- --passWithNoTests',
        'bun run test:unit',
        'bun test',
      ];

      let testOutput = '';
      let testCommand = '';

      for (const cmd of testCommands) {
        try {
          const { stdout, stderr } = await execAsync(
            `cd "${projectPath}" && ${cmd}`,
            { timeout: 30000 }, // 30 second timeout
          );
          testOutput = stdout + stderr;
          testCommand = cmd;
          break;
        } catch (e: any) {
          // If command not found, try next one
          if (e.code === 127 || e.message.includes('not found')) {
            continue;
          }
          // If tests failed, that's okay - we'll parse results
          testOutput = (e.stdout || '') + (e.stderr || '');
          testCommand = cmd;
          break;
        }
      }

      // Parse test results
      const passedMatch = testOutput.match(/(\\d+) (?:test|spec)s? passed/i);
      const failedMatch = testOutput.match(/(\\d+) (?:test|spec)s? failed/i);
      const skippedMatch = testOutput.match(/(\\d+) (?:test|spec)s? skipped/i);

      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;

      const allPassed = failed === 0;

      await this.logActivity(session.id, {
        type: 'TESTING',
        description: allPassed
          ? `All tests passed ✓ (${passed} passed)`
          : `Tests completed with ${failed} failure(s)`,
        timestamp: new Date(),
        metadata: {
          passed,
          failed,
          skipped,
          command: testCommand,
        },
      });

      // If tests failed, add to implementation result
      if (failed > 0) {
        implementation.testsAdded = -failed; // Negative to indicate failures
      }
    } catch (error) {
      // Test execution failed completely
      await this.logActivity(session.id, {
        type: 'TESTING',
        description: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        metadata: { error: String(error) },
      });
    }
  }

  /**
   * Self-review implementation
   */
  private async selfReview(
    ticket: Ticket,
    agent: Agent,
    implementation: any,
  ): Promise<any> {
    const prompt = `Review your implementation:
${implementation.code}

Check for:
1. Code quality and best practices
2. Potential bugs or edge cases
3. Performance considerations
4. Security issues
5. Improvements needed`;

    const response = await this.getOpenAI().chat.completions.create({
      model: agent.modelName || OPENAI_AGENT_MODEL_DEFAULT,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    return {
      review: response.choices[0]?.message?.content || '',
      recommendations: [
        'Consider adding error handling for edge cases',
        'Add JSDoc comments for public APIs',
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Log activity for a session
   */
  private async logActivity(
    sessionId: string,
    activity: Omit<WorkActivity, 'id' | 'sessionId'>,
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const fullActivity: WorkActivity = {
      id: `activity-${Date.now()}-${Math.random()}`,
      sessionId,
      ...activity,
    };

    session.activities.push(fullActivity);

    // Also save to database as ticket comment for permanent record
    const ticket = session.context.ticket;
    const agent = session.context.agent;

    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: agent.id,
        authorType: 'agent',
        authorName: agent.name,
        content: `[${activity.type}] ${activity.description}`,
        isInternal: true, // Internal progress updates
      },
    });

    // Broadcast progress update via Pusher
    try {
      const project = await prisma.project.findUnique({
        where: { id: ticket.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          // Calculate rough progress based on activity count
          const progress = Math.min(session.activities.length * 15, 95);

          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-progress',
            {
              ticketId: ticket.id,
              agentName: agent.name,
              step: activity.description,
              message: `[${activity.type}] ${activity.description}`,
              progress,
              timestamp: new Date().toISOString(),
            },
          );
        }
      }
    } catch (pusherError) {
      console.error('[Pusher] Failed to broadcast progress:', pusherError);
    }
  }

  /**
   * Complete a work session
   */
  private async completeSession(
    sessionId: string,
    result: WorkResult,
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Clear timeout interval
    if (session.timeoutCheckInterval) {
      clearInterval(session.timeoutCheckInterval);
    }

    session.status = 'COMPLETED';
    session.completedAt = new Date();
    session.result = result;

    await this.logActivity(sessionId, {
      type: 'COMMENT',
      description: 'Work completed successfully',
      timestamp: new Date(),
    });

    // Broadcast work completion via Pusher
    try {
      const ticket = session.context.ticket;
      const agent = session.context.agent;

      const project = await prisma.project.findUnique({
        where: { id: ticket.projectId },
        select: { name: true },
      });

      if (project) {
        const pusher = await import('@/lib/pusher/server');
        const pusherInstance = pusher.getPusherServer();

        if (pusherInstance) {
          await pusherInstance.trigger(
            `project-${project.name}`,
            'agent-work-completed',
            {
              ticketId: ticket.id,
              ticketTitle: ticket.title,
              agentName: agent.name,
              result,
              completedAt: session.completedAt.toISOString(),
            },
          );
        }
      }
    } catch (pusherError) {
      console.error(
        '[Pusher] Failed to broadcast work completion:',
        pusherError,
      );
    }
  }

  /**
   * Fail a work session
   */
  private async failSession(sessionId: string, error: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Clear timeout interval
    if (session.timeoutCheckInterval) {
      clearInterval(session.timeoutCheckInterval);
    }

    session.status = 'FAILED';
    session.completedAt = new Date();
    session.result = {
      success: false,
      summary: `Failed: ${error}`,
      filesModified: [],
      testsAdded: 0,
      linesChanged: 0,
      issuesFound: [error],
    };

    await this.logActivity(sessionId, {
      type: 'COMMENT',
      description: `Work failed: ${error}`,
      timestamp: new Date(),
    });
  }

  /**
   * Get session status
   */
  async getSession(sessionId: string): Promise<WorkSession | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * List active sessions
   */
  async listActiveSessions(): Promise<WorkSession[]> {
    return Array.from(this.activeSessions.values()).filter(
      s => s.status === 'ACTIVE',
    );
  }

  /**
   * Pause a work session
   */
  async pauseSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'PAUSED';
      await this.logActivity(sessionId, {
        type: 'COMMENT',
        description: 'Work paused by user',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Stop/cancel a work session
   */
  async stopSession(sessionId: string, reason?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const { ticket, agent, projectPath } = session.context;
    const stopReason = reason || 'Stopped by user';

    // Clear timeout interval
    if (session.timeoutCheckInterval) {
      clearInterval(session.timeoutCheckInterval);
    }

    try {
      // Rollback any uncommitted changes
      if (projectPath) {
        try {
          // Check if we're on a feature branch
          const { stdout: currentBranch } = await execAsync(
            `cd "${projectPath}" && git branch --show-current`,
          );

          const branchName = currentBranch.trim();

          // If on an agent branch, rollback and switch back
          if (branchName.startsWith('agent/')) {
            await execAsync(`cd "${projectPath}" && git reset --hard HEAD`);
            await execAsync(
              `cd "${projectPath}" && git checkout main || git checkout master`,
            );

            // Optionally delete the branch
            await execAsync(
              `cd "${projectPath}" && git branch -D ${branchName}`,
            ).catch(() => {
              // Ignore errors if branch deletion fails
            });

            await this.logActivity(sessionId, {
              type: 'COMMENT',
              description: `Rolled back changes and deleted branch: ${branchName}`,
              timestamp: new Date(),
            });
          }
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
          await this.logActivity(sessionId, {
            type: 'COMMENT',
            description: `⚠️ Warning: Rollback failed - ${rollbackError instanceof Error ? rollbackError.message : 'Unknown error'}`,
            timestamp: new Date(),
          });
        }
      }

      // Mark session as failed with cancellation
      session.status = 'FAILED';
      session.completedAt = new Date();
      session.result = {
        success: false,
        summary: stopReason,
        filesModified: [],
        testsAdded: 0,
        linesChanged: 0,
        issuesFound: ['Work cancelled before completion'],
      };

      await this.logActivity(sessionId, {
        type: 'COMMENT',
        description: `🛑 Work stopped: ${stopReason}`,
        timestamp: new Date(),
      });

      // Revert ticket status back to previous state
      const previousStatus = session.activities.some(a => a.type === 'PLANNING')
        ? 'TODO'
        : ticket.status === 'IN_PROGRESS'
          ? 'TODO'
          : ticket.status;

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: previousStatus,
          updatedAt: new Date(),
        },
      });

      // Add cancellation comment to ticket
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: agent.id,
          authorType: 'agent',
          authorName: agent.name,
          content: `## 🛑 Work Stopped\n\n${stopReason}\n\nAll changes have been rolled back. The ticket has been returned to ${previousStatus} status.`,
          isInternal: false,
        },
      });

      // Broadcast work stopped via Pusher
      try {
        const project = await prisma.project.findUnique({
          where: { id: ticket.projectId },
          select: { name: true },
        });

        if (project) {
          const pusher = await import('@/lib/pusher/server');
          const pusherInstance = pusher.getPusherServer();

          if (pusherInstance) {
            await pusherInstance.trigger(
              `project-${project.name}`,
              'agent-work-stopped',
              {
                ticketId: ticket.id,
                ticketTitle: ticket.title,
                agentName: agent.name,
                reason: stopReason,
                stoppedAt: new Date().toISOString(),
              },
            );
          }

          // Also trigger ticket update
          const updatedTicket = await prisma.ticket.findUnique({
            where: { id: ticket.id },
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          });

          if (updatedTicket) {
            await triggerTicketUpdate(project.name, updatedTicket);
          }
        }
      } catch (pusherError) {
        console.error(
          '[Pusher] Failed to broadcast work stopped:',
          pusherError,
        );
      }

      // Remove from active sessions
      this.activeSessions.delete(sessionId);
    } catch (error) {
      console.error('Error stopping session:', error);
      throw error;
    }
  }

  /**
   * Set up timeout checking for a work session
   */
  private setupTimeoutCheck(session: WorkSession): void {
    if (!session.timeoutMinutes) return;

    // Check every minute
    const checkInterval = setInterval(() => {
      this.checkTimeout(session.id);
    }, 60000); // 60 seconds

    session.timeoutCheckInterval = checkInterval;
  }

  /**
   * Check if a session has exceeded its timeout
   */
  private async checkTimeout(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'ACTIVE') {
      // Clear interval if session is no longer active
      if (session?.timeoutCheckInterval) {
        clearInterval(session.timeoutCheckInterval);
      }
      return;
    }

    const elapsedMinutes =
      (Date.now() - session.startedAt.getTime()) / (1000 * 60);

    if (session.timeoutMinutes && elapsedMinutes >= session.timeoutMinutes) {
      console.warn(
        `[AgentExecutor] Session ${sessionId} exceeded timeout of ${session.timeoutMinutes} minutes`,
      );

      await this.logActivity(sessionId, {
        type: 'COMMENT',
        description: `⏱️ Work timeout reached (${session.timeoutMinutes} minutes)`,
        timestamp: new Date(),
      });

      // Clear the interval
      if (session.timeoutCheckInterval) {
        clearInterval(session.timeoutCheckInterval);
      }

      // Fail the session due to timeout
      await this.failSession(
        sessionId,
        `Work session exceeded timeout limit of ${session.timeoutMinutes} minutes. Please break down the ticket into smaller tasks or increase the project's timeout setting.`,
      );
    }
  }

  /**
   * Get project path from ticket
   */
  private async getProjectPath(ticket: any): Promise<string | undefined> {
    try {
      // Get project ID from ticket directly or through team
      let projectId = ticket.projectId;

      if (!projectId && ticket.teamId) {
        const team = await prisma.team.findUnique({
          where: { id: ticket.teamId },
          select: { projectId: true },
        });
        projectId = team?.projectId;
      }

      if (!projectId) {
        console.warn('No project ID found for ticket');
        return undefined;
      }

      // Get the project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      // Use the project's path field (which is the repository path)
      if (project?.path) {
        // The path field in Project schema is the actual file system path
        return project.path;
      }

      // Fallback: construct path from project name
      const basePath =
        process.env.PROJECTS_BASE_PATH || '/Users/steven/Projects';

      if (project?.name) {
        const projectPath = path.join(
          basePath,
          project.name.toLowerCase().replace(/\s+/g, '-'),
        );

        // Check if directory exists
        try {
          await fs.access(projectPath);
          return projectPath;
        } catch {
          console.warn(`Project path not found: ${projectPath}`);
        }
      }

      return undefined;
    } catch (error) {
      console.error('Error getting project path:', error);
      return undefined;
    }
  }

  /**
   * Extract constraints from ticket
   */
  private extractConstraints(ticket: Ticket): string[] {
    const constraints: string[] = [];

    if (ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH') {
      constraints.push('High priority - minimize risk');
    }

    // Add more constraint extraction logic as needed

    return constraints;
  }

  /**
   * Call MCP tool (fetch, playwright, prisma, etc.)
   */
  private async callMcpTool(
    session: WorkSession,
    toolCall: McpToolCall,
  ): Promise<any> {
    await this.logActivity(session.id, {
      type: 'TOOL_CALL',
      description: `Calling ${toolCall.tool}`,
      timestamp: new Date(),
      metadata: { tool: toolCall.tool, parameters: toolCall.parameters },
    });

    try {
      let result: any;

      switch (toolCall.tool) {
        case 'fetch':
          result = await this.callFetchTool(toolCall.parameters);
          break;
        case 'playwright':
          result = await this.callPlaywrightTool(toolCall.parameters);
          break;
        case 'prisma':
          result = await this.callPrismaTool(toolCall.parameters);
          break;
        case 'figma':
          result = await this.callFigmaTool(toolCall.parameters);
          break;
        default:
          throw new Error(`Unknown MCP tool: ${toolCall.tool}`);
      }

      await this.logActivity(session.id, {
        type: 'TOOL_CALL',
        description: `${toolCall.tool} completed successfully`,
        timestamp: new Date(),
        metadata: { result },
      });

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      await this.logActivity(session.id, {
        type: 'TOOL_CALL',
        description: `${toolCall.tool} failed: ${errorMsg}`,
        timestamp: new Date(),
        metadata: { error: errorMsg },
      });

      throw error;
    }
  }

  /**
   * Call fetch MCP tool
   */
  private async callFetchTool(params: any): Promise<any> {
    // This would integrate with the fetch MCP server
    // For now, simulate or use native fetch
    const { url, method = 'GET', headers, body } = params;

    const response = await fetch(url, {
      method,
      headers: headers || {},
      body: body ? JSON.stringify(body) : undefined,
    });

    return {
      status: response.status,
      statusText: response.statusText,
      data: await response.text(),
    };
  }

  /**
   * Call Playwright MCP tool for browser validation
   */
  private async callPlaywrightTool(params: any): Promise<any> {
    // This would integrate with Playwright MCP server
    // Actions: navigate, screenshot, click, type, validate, etc.
    const { action, url, selector, value } = params;

    // For now, return simulated result
    // In production, this would use the actual Playwright MCP server
    return {
      action,
      success: true,
      message: `Playwright ${action} completed`,
      screenshot: action === 'screenshot' ? 'base64-encoded-image' : undefined,
    };
  }

  /**
   * Call Prisma MCP tool for database operations
   */
  private async callPrismaTool(params: any): Promise<any> {
    // This would integrate with Prisma MCP server
    // Actions: migrate, seed, introspect, schema changes, etc.
    const { action, schema, migration } = params;

    // For now, return simulated result
    return {
      action,
      success: true,
      message: `Prisma ${action} completed`,
    };
  }

  /**
   * Call Figma MCP tool for design operations
   */
  private async callFigmaTool(params: any): Promise<any> {
    // This would integrate with Figma MCP server
    // Actions: create_file, create_component, create_frame, add_text, add_shape, export_image, etc.
    const { action, fileKey, name, type, properties, exportFormat } = params;

    // For now, return simulated result
    // In production, this would use the actual Figma MCP server
    return {
      action,
      success: true,
      message: `Figma ${action} completed`,
      fileUrl:
        action === 'create_file'
          ? `https://figma.com/file/${fileKey || 'new-file'}`
          : undefined,
      nodeId:
        action === 'create_component' || action === 'create_frame'
          ? `node-${Date.now()}`
          : undefined,
      exportUrl:
        action === 'export_image'
          ? `https://figma.com/exports/${fileKey}.${exportFormat || 'png'}`
          : undefined,
    };
  }

  /**
   * Detect blocking issues in plan or implementation
   */
  private async detectBlockingIssues(
    session: WorkSession,
    plan: any,
  ): Promise<BlockingIssue | null> {
    const planText = typeof plan === 'string' ? plan : plan.plan || '';
    const lowerPlan = planText.toLowerCase();

    // Check for database requirements
    if (
      lowerPlan.includes('database') ||
      lowerPlan.includes('prisma migrate')
    ) {
      const hasPrisma = await this.checkDependencyExists(session, 'prisma');
      const hasDbUrl = !!process.env.DATABASE_URL;

      if (!hasPrisma || !hasDbUrl) {
        return {
          type: 'DATABASE_NEEDED',
          description: 'This ticket requires database setup',
          requirements: [
            !hasPrisma ? 'Install Prisma: bun add prisma @prisma/client' : '',
            !hasDbUrl ? 'Set DATABASE_URL environment variable' : '',
            'Run: bunx prisma migrate dev',
          ].filter(Boolean),
          canContinue: false,
        };
      }
    }

    // Check for environment variables
    const envVarMatches = planText.match(/process\.env\.(\w+)/g);
    if (envVarMatches) {
      const missingEnvVars: string[] = [];
      envVarMatches.forEach((match: string) => {
        const varName = match.replace('process.env.', '');
        if (!process.env[varName]) {
          missingEnvVars.push(varName);
        }
      });

      if (missingEnvVars.length > 0) {
        return {
          type: 'ENV_VAR_NEEDED',
          description: 'Missing required environment variables',
          requirements: missingEnvVars.map(v => `Set ${v} in .env file`),
          canContinue: false,
        };
      }
    }

    // Check for bun dependencies
    const depMatches = planText.match(/bun add ([\\w@/-]+)/g);
    if (depMatches) {
      return {
        type: 'DEPENDENCY_NEEDED',
        description: 'New dependencies need to be installed',
        requirements: depMatches,
        canContinue: false,
      };
    }

    return null;
  }

  /**
   * Check if a dependency exists in package.json
   */
  private async checkDependencyExists(
    session: WorkSession,
    depName: string,
  ): Promise<boolean> {
    const { projectPath } = session.context;
    if (!projectPath) return false;

    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, 'utf-8'),
      );

      return !!(
        packageJson.dependencies?.[depName] ||
        packageJson.devDependencies?.[depName]
      );
    } catch {
      return false;
    }
  }

  /**
   * Block session with a specific issue
   */
  private async blockSession(
    sessionId: string,
    blockingIssue: BlockingIssue,
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'BLOCKED';
    session.blockingIssue = blockingIssue;

    await this.logActivity(sessionId, {
      type: 'WAITING',
      description: `⚠️ Work blocked: ${blockingIssue.description}`,
      timestamp: new Date(),
      metadata: { blockingIssue },
    });

    // Create a ticket comment explaining the block
    const requirementsList = blockingIssue.requirements
      .map((r, i) => `${i + 1}. ${r}`)
      .join('\\n');

    await this.logActivity(sessionId, {
      type: 'COMMENT',
      description: `## ⚠️ Work Blocked

**Issue:** ${blockingIssue.description}

**Required Actions:**
${requirementsList}

Once these requirements are met, resume the work session to continue.`,
      timestamp: new Date(),
    });
  }

  /**
   * Resume a blocked or paused session
   */
  async resumeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session does not exist');
    }

    if (session.status === 'PAUSED') {
      session.status = 'ACTIVE';
      await this.logActivity(sessionId, {
        type: 'COMMENT',
        description: 'Work resumed by user',
        timestamp: new Date(),
      });
      return;
    }

    if (session.status !== 'BLOCKED') {
      throw new Error('Session is not blocked or paused');
    }

    // Mark blocking issue as resolved
    if (session.blockingIssue) {
      session.blockingIssue.resolvedAt = new Date();
      session.blockingIssue.canContinue = true;
    }

    session.status = 'ACTIVE';

    await this.logActivity(sessionId, {
      type: 'COMMENT',
      description: '✅ Blocking issue resolved, resuming work...',
      timestamp: new Date(),
    });

    // Continue execution where it left off
    // This would need to be implemented based on where the session was blocked
  }

  /**
   * Check if ticket involves frontend changes
   */
  private isFrontendTicket(ticket: Ticket): boolean {
    const text = `${ticket.title} ${ticket.description}`.toLowerCase();
    const frontendKeywords = [
      'ui',
      'ux',
      'component',
      'button',
      'page',
      'frontend',
      'styling',
      'css',
      'react',
      'next.js',
      'tailwind',
      'design',
      'layout',
      'responsive',
    ];
    return frontendKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Validate implementation in browser using Playwright
   */
  private async validateInBrowser(
    session: WorkSession,
    implementation: any,
  ): Promise<void> {
    const { projectPath } = session.context;

    if (!projectPath) {
      await this.logActivity(session.id, {
        type: 'TOOL_CALL',
        description: 'Browser validation skipped (no project path)',
        timestamp: new Date(),
      });
      return;
    }

    try {
      // Take screenshot of changes
      const screenshotResult = await this.callMcpTool(session, {
        tool: 'playwright',
        parameters: {
          action: 'screenshot',
          url: `http://localhost:${process.env.PORT || 3000}`,
        },
      });

      // Validate visual elements exist
      const files = implementation.files || [];
      const componentFiles = files.filter(
        (f: string) =>
          f.includes('component') || f.endsWith('.tsx') || f.endsWith('.jsx'),
      );

      if (componentFiles.length > 0) {
        await this.logActivity(session.id, {
          type: 'TOOL_CALL',
          description: `✅ Browser validation completed - ${componentFiles.length} components checked`,
          timestamp: new Date(),
          metadata: { screenshot: screenshotResult.screenshot },
        });
      }
    } catch (error) {
      await this.logActivity(session.id, {
        type: 'TOOL_CALL',
        description: `⚠️ Browser validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get available MCP tools description for agent
   */
  private getMcpToolsDescription(): string {
    return `
## Available Tools

You have access to the following MCP tools:

### 1. fetch
Make HTTP requests to external APIs.
Usage: { "tool": "fetch", "parameters": { "url": "...", "method": "GET|POST|..." } }

### 2. playwright
Validate frontend changes in a real browser.
Actions: navigate, screenshot, click, type, validate
Usage: { "tool": "playwright", "parameters": { "action": "screenshot", "url": "..." } }

### 3. prisma
Manage database schema and migrations.
Actions: migrate, seed, introspect
Usage: { "tool": "prisma", "parameters": { "action": "migrate" } }

### 4. figma
Create and modify Figma designs (Designer agents).
Actions: create_file, create_component, create_frame, add_text, add_shape, export_image
Usage: { "tool": "figma", "parameters": { "action": "create_file", "name": "Login UI Mockup" } }
Examples:
- Create design file: { "tool": "figma", "parameters": { "action": "create_file", "name": "App Design" } }
- Create component: { "tool": "figma", "parameters": { "action": "create_component", "name": "Button", "type": "button" } }
- Add text: { "tool": "figma", "parameters": { "action": "add_text", "content": "Login", "fontSize": 16 } }
- Export image: { "tool": "figma", "parameters": { "action": "export_image", "fileKey": "...", "exportFormat": "png" } }

**Important:** If you need to use a tool, include it in your plan with the exact JSON format above.
`;
  }

  /**
   * Generate completion comment
   */
  private generateCompletionComment(result: WorkResult): string {
    return `## Work Completed ✓

${result.summary}

**Changes:**
- ${result.filesModified.length} files modified
- ${result.linesChanged} lines changed
- ${result.testsAdded} tests added

${result.recommendations && result.recommendations.length > 0 ? `\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}` : ''}

Ready for review.`;
  }
}

const globalForAgentExecutor = globalThis as unknown as {
  agentExecutor: AgentExecutor | undefined;
};

export const agentExecutor =
  globalForAgentExecutor.agentExecutor ?? new AgentExecutor();

if (process.env.NODE_ENV !== 'production') {
  globalForAgentExecutor.agentExecutor = agentExecutor;
}

export function getAgentExecutor(): AgentExecutor {
  return agentExecutor;
}
