import { getMCPClient } from '@/lib/mcp-client';
import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_ASSISTANT_MODEL_DEFAULT } from '@/lib/openai/config';
import { NextRequest, NextResponse } from 'next/server';
import type OpenAI from 'openai';
import { z } from 'zod';

// Increase timeout for this route (in seconds)
export const maxDuration = 60;

type AssistantAction =
  | {
      type: 'navigate';
      label: string;
      href: string;
    }
  | {
      type: 'launch_app';
      label: string;
      projectName: string;
      appName: string;
    };

type QuickReply = {
  label: string;
  value: string;
};

// Convert MCP tools to OpenAI function format
async function getMCPTools() {
  const mcpClient = await getMCPClient();
  const toolsResult = await mcpClient.listTools();

  // Convert MCP tool definitions to OpenAI function format
  return toolsResult.tools.map((tool: any) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

const AppFactorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  projectPath: z.string().min(1),
  apps: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.string().optional(),
        description: z.string().optional(),
        path: z.string().optional(),
        devPort: z.number().int().optional(),
        devCommand: z.string().optional(),
        buildCommand: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  tickets: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        labels: z.array(z.string()).optional(),
        acceptanceCriteria: z.string().optional(),
        businessRequirements: z.string().optional(),
        checklistItems: z.array(z.string()).optional(),
        estimatedValue: z.number().optional(),
        isFrontend: z.boolean().optional(),
      }),
    )
    .optional()
    .default([]),
  autoLaunchAppName: z.string().optional(),
});

function getLocalTools(): OpenAI.Chat.ChatCompletionTool[] {
  return [
    {
      type: 'function',
      function: {
        name: 'applab_create_project_factory',
        description:
          'Create an SummonIQ project on disk, add it to the database, scaffold apps, and create initial tickets (which will auto-start agent work when assigned).',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Project name (slug recommended)',
            },
            description: { type: 'string', description: 'Project description' },
            projectPath: {
              type: 'string',
              description:
                'Absolute filesystem path where the project should be created (directory will be created if missing)',
            },
            apps: {
              type: 'array',
              description: 'Apps to add to the project config and scaffold',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: {
                    type: 'string',
                    description:
                      'web-app | api | desktop-app | marketing-site | etc',
                  },
                  description: { type: 'string' },
                  path: {
                    type: 'string',
                    description:
                      'Relative path inside the project (defaults to apps/<name>)',
                  },
                  devPort: { type: 'number' },
                  devCommand: { type: 'string' },
                  buildCommand: { type: 'string' },
                },
                required: ['name'],
              },
            },
            tickets: {
              type: 'array',
              description:
                'Initial tickets to create in the project (agents may start automatically).',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  labels: { type: 'array', items: { type: 'string' } },
                  acceptanceCriteria: { type: 'string' },
                  businessRequirements: { type: 'string' },
                  checklistItems: { type: 'array', items: { type: 'string' } },
                  estimatedValue: { type: 'number' },
                  isFrontend: { type: 'boolean' },
                },
                required: ['title'],
              },
            },
            autoLaunchAppName: {
              type: 'string',
              description:
                'Optional: which app to suggest launching after creation (the client will handle launch)',
            },
          },
          required: ['name', 'projectPath'],
        },
      },
    },
  ];
}

async function callInternalApi(
  request: NextRequest,
  pathName: string,
  init: RequestInit,
): Promise<any> {
  const url = new URL(pathName, request.nextUrl.origin);
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();
  if (!res.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data?.error || data?.message || 'Internal API request failed';
    throw new Error(message);
  }
  return data;
}

async function runLocalTool(
  toolName: string,
  rawArgs: unknown,
  request: NextRequest,
): Promise<{ content: unknown; actions?: AssistantAction[] }> {
  if (toolName !== 'applab_create_project_factory') {
    throw new Error(`Unknown local tool: ${toolName}`);
  }

  const args = AppFactorySchema.parse(rawArgs);
  const encoded = encodeURIComponent(args.name);

  const initResult = await callInternalApi(
    request,
    `/api/projects/${encoded}/initialize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath: args.projectPath }),
    },
  );

  const manageResult = await callInternalApi(
    request,
    `/api/projects/${encoded}/manage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: args.projectPath,
        description: args.description || '',
      }),
    },
  );

  const appsCreated: any[] = [];
  for (const app of args.apps) {
    const created = await callInternalApi(
      request,
      `/api/projects/${encoded}/apps`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(app),
      },
    );
    appsCreated.push(created?.app ?? created);
  }

  const ticketsCreated: any[] = [];
  for (const ticket of args.tickets) {
    const created = await callInternalApi(
      request,
      `/api/projects/${encoded}/tickets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      },
    );
    ticketsCreated.push(created);
  }

  const actions: AssistantAction[] = [
    {
      type: 'navigate',
      label: 'Open project',
      href: `/projects/${encoded}`,
    },
  ];

  if (args.autoLaunchAppName) {
    actions.push({
      type: 'launch_app',
      label: `Launch ${args.autoLaunchAppName}`,
      projectName: args.name,
      appName: args.autoLaunchAppName,
    });
  }

  return {
    content: {
      project: manageResult?.project ?? manageResult,
      initialize: initResult,
      appsCreated,
      ticketsCreated,
    },
    actions,
  };
}

function getErrorSuggestion(errorMessage: string): string | undefined {
  const lower = errorMessage.toLowerCase();

  if (lower.includes("project '") && lower.includes("' not found")) {
    return 'Project not found in the database. Run list_projects to see available projects, or create_project (or import/register the project) before adding pages/files.';
  }
  if (lower.includes('permission denied') || lower.includes('eacces')) {
    return 'Check file/folder permissions. You may need to run with elevated privileges or change ownership.';
  }
  if (lower.includes('already exists') || lower.includes('eexist')) {
    return 'The file or folder already exists. Choose a different name or delete the existing one first.';
  }
  if (lower.includes('not found') || lower.includes('enoent')) {
    return 'The specified path or resource does not exist. Verify the path is correct.';
  }
  if (lower.includes('no space') || lower.includes('enospc')) {
    return 'Disk is full. Free up space and try again.';
  }
  if (lower.includes('read-only') || lower.includes('erofs')) {
    return 'The filesystem is read-only. Check if the drive is mounted correctly.';
  }
  if (lower.includes('project not found')) {
    return 'Project not found in the database. Run list_projects to see available projects, or create_project (or import/register the project) before adding pages/files.';
  }
  if (lower.includes('invalid') && lower.includes('path')) {
    return 'The path contains invalid characters or is outside the allowed directory.';
  }

  return undefined;
}

function tryParseAssistantJson(content: string | null): {
  message: string;
  actions?: AssistantAction[];
  quickReplies?: QuickReply[];
} {
  if (!content) return { message: 'No response generated' };
  try {
    const parsed = JSON.parse(content);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.message === 'string'
    ) {
      return {
        message: parsed.message,
        actions: Array.isArray(parsed.actions) ? parsed.actions : undefined,
        quickReplies: Array.isArray(parsed.quickReplies)
          ? (parsed.quickReplies as unknown[]).filter(
              (r): r is QuickReply =>
                !!r &&
                typeof r === 'object' &&
                'label' in r &&
                'value' in r &&
                typeof (r as any).label === 'string' &&
                typeof (r as any).value === 'string',
            )
          : undefined,
      };
    }
  } catch {
    // ignore
  }
  return { message: content };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      messages?: OpenAI.Chat.ChatCompletionMessageParam[];
      context?: unknown;
    };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context;

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    const openai = getOpenAIClient();
    // Get MCP tools
    const mcpTools = await getMCPTools();
    const localTools = getLocalTools();
    const tools = [...mcpTools, ...localTools];
    const mcpClient = await getMCPClient();

    const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
      role: 'system',
      content: `You are the SummonIQ assistant. Use tools when you need to create/manage real resources.

When using applab_create_project_factory: create the project directory, add apps, and draft initial tickets.

IMPORTANT - Error Handling:
- If a tool returns an error, you MUST include the EXACT error message in your response
- Be specific about what failed: which operation, which file/path, what the actual error was
- Suggest concrete fixes when possible (e.g., "Permission denied on /path/to/dir - check folder permissions" or "File already exists at /path - choose a different name")
- Never use vague language like "various reasons" or "technical limitations" - always state the actual error

Response Format:
- After creating resources, respond with JSON: {"message": string, "actions"?: [{"type":"navigate", "label": string, "href": string} | {"type":"launch_app", "label": string, "projectName": string, "appName": string}]}
- For errors, respond with JSON: {"message": string, "error": string} where "error" contains the technical details
- For normal questions, you may respond with plain text.`,
    };

    const contextMessage: OpenAI.Chat.ChatCompletionMessageParam = {
      role: 'system',
      content: `UI Context (may be undefined). Use this to avoid asking the user redundant questions.

- If context.projectName is provided, assume the user is working in that project unless they explicitly say otherwise.
- If context.projectApps is provided, use it to pick the most likely target app (default to the first WEB app if you need to choose).
- If you cannot determine the target project/app/page with high confidence, ask a clarifying question and include quickReplies.

Quick Replies Format (when you need confirmation): respond with JSON {"message": string, "quickReplies": [{"label": string, "value": string}]}

Context JSON:
${JSON.stringify(context ?? null)}`,
    };

    // Call OpenAI with tools
    let response = await openai.chat.completions.create({
      model: OPENAI_ASSISTANT_MODEL_DEFAULT,
      messages: [systemMessage, contextMessage, ...messages],
      tools,
      tool_choice: 'auto',
    });

    let assistantMessage = response.choices[0].message;

    const accumulatedActions: AssistantAction[] = [];

    // Handle tool calls (with max iterations to prevent infinite loops)
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (
      assistantMessage.tool_calls &&
      assistantMessage.tool_calls.length > 0
    ) {
      iterations++;
      if (iterations > MAX_ITERATIONS) {
        console.warn('[AI Assistant] Max tool call iterations reached');
        break;
      }
      const toolMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      // Execute all tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        if (!('function' in toolCall)) {
          continue;
        }

        console.log('[AI Assistant] Using MCP tool:', toolCall.function.name);

        try {
          const args = JSON.parse(toolCall.function.arguments);
          const isLocalTool = toolCall.function.name.startsWith('applab_');
          const result = isLocalTool
            ? await runLocalTool(toolCall.function.name, args, request)
            : await mcpClient.callTool(toolCall.function.name, args);

          if (
            isLocalTool &&
            (result as any).actions &&
            Array.isArray((result as any).actions)
          ) {
            accumulatedActions.push(
              ...((result as any).actions as AssistantAction[]),
            );
          }

          toolMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify((result as any).content ?? result),
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Tool execution failed';
          console.error(
            '[AI Assistant] Tool error:',
            toolCall.function.name,
            errorMessage,
          );
          toolMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: errorMessage,
              tool: toolCall.function.name,
              args: toolCall.function.arguments,
              suggestion: getErrorSuggestion(errorMessage),
            }),
          });
        }
      }

      // Continue conversation with tool results
      response = await openai.chat.completions.create({
        model: OPENAI_ASSISTANT_MODEL_DEFAULT,
        messages: [
          systemMessage,
          contextMessage,
          ...messages,
          assistantMessage,
          ...toolMessages,
        ],
        tools,
        tool_choice: 'auto',
      });

      assistantMessage = response.choices[0].message;
    }

    const parsed = tryParseAssistantJson(assistantMessage.content);
    const actions = parsed.actions?.length
      ? parsed.actions
      : accumulatedActions;

    return NextResponse.json({
      message: parsed.message,
      actions: actions.length ? actions : undefined,
      quickReplies:
        parsed.quickReplies && parsed.quickReplies.length
          ? parsed.quickReplies
          : undefined,
      usage: response.usage,
    });
  } catch (error) {
    console.error('[AI Assistant] Error:', error);

    // Check if it's a timeout error
    if (error instanceof Error) {
      if (
        error.message.includes('timeout') ||
        error.message.includes('ETIMEDOUT')
      ) {
        return NextResponse.json(
          {
            error:
              'Request timeout - The AI assistant took too long to respond. Try simplifying your request or try again.',
          },
          { status: 504 },
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process request',
      },
      { status: 500 },
    );
  }
}
