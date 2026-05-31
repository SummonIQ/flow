#!/usr/bin/env bun
type Options = {
  baseUrl: string;
  projectName?: string;
  ticketId?: string;
  agentId?: string;
  keepData: boolean;
};

type SmokeStep = {
  step: string;
  status: string;
  timestamp: string;
};

type SmokeResponse = {
  success: boolean;
  sessionId: string;
  ticketId: string;
  projectId: string;
  steps: SmokeStep[];
  keptData: boolean;
};

const DEFAULT_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:30140';

function printUsage(): void {
  console.log(`Usage:
  bun run scripts/smoke-session-workflow.ts [options]

Options:
  --base-url <url>      Base URL for the orchestrator (default: ${DEFAULT_BASE_URL})
  --project-name <name> Existing project name to use
  --ticket-id <id>      Existing ticket ID to use
  --agent-id <id>       Existing agent ID to use
  --keep-data           Keep generated ticket/project data
  --help                Show this help
`);
}

function parseArgs(args: string[]): Options {
  const options: Options = {
    baseUrl: DEFAULT_BASE_URL,
    keepData: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--base-url': {
        const value = args[i + 1];
        if (!value) {
          throw new Error('Missing value for --base-url');
        }
        options.baseUrl = value;
        i += 1;
        break;
      }
      case '--project-name': {
        const value = args[i + 1];
        if (!value) {
          throw new Error('Missing value for --project-name');
        }
        options.projectName = value;
        i += 1;
        break;
      }
      case '--ticket-id': {
        const value = args[i + 1];
        if (!value) {
          throw new Error('Missing value for --ticket-id');
        }
        options.ticketId = value;
        i += 1;
        break;
      }
      case '--agent-id': {
        const value = args[i + 1];
        if (!value) {
          throw new Error('Missing value for --agent-id');
        }
        options.agentId = value;
        i += 1;
        break;
      }
      case '--keep-data':
        options.keepData = true;
        break;
      case '--help':
        printUsage();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const details =
      payload && typeof payload === 'object'
        ? JSON.stringify(payload)
        : text || response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${details}`);
  }

  return payload as T;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  const payload = {
    projectName: options.projectName,
    ticketId: options.ticketId,
    agentId: options.agentId,
    keepData: options.keepData,
  };

  const result = await requestJson<SmokeResponse>(
    `${options.baseUrl}/api/work-sessions/smoke`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  console.log(`Session: ${result.sessionId}`);
  console.log(`Ticket: ${result.ticketId}`);
  console.log(`Project: ${result.projectId}`);
  console.log(
    `Steps: ${result.steps
      .map(step => `${step.step}:${step.status}`)
      .join(' · ')}`,
  );
}

main().catch(error => {
  console.error('Smoke workflow failed:', error);
  process.exitCode = 1;
});
