import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { existsSync } from 'node:fs';
import path from 'node:path';

interface MCPRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export class MCPClient extends EventEmitter {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    { resolve: Function; reject: Function }
  >();
  private buffer = '';

  isRunning(): boolean {
    return this.process !== null;
  }

  private resolveMcpServerPath(): string {
    const candidates: string[] = [];
    const configured = process.env.MCP_SERVER_PATH;

    // Prefer Flow's built-in MCP server first (keeps MCP tools aligned with this app).
    candidates.push(path.resolve(process.cwd(), 'lib/mcp/server.ts'));

    if (typeof configured === 'string' && configured.length > 0) {
      candidates.push(configured);

      if (!path.isAbsolute(configured)) {
        candidates.push(path.resolve(process.cwd(), configured));
      }
    }

    for (const candidate of candidates) {
      if (
        typeof candidate === 'string' &&
        candidate.length > 0 &&
        existsSync(candidate)
      ) {
        return candidate;
      }
    }

    throw new Error(
      'MCP_SERVER_PATH environment variable is not set (or does not resolve to a valid file). Please set it to the path of the MCP server.',
    );
  }

  async connect() {
    if (this.process) return;

    const mcpServerPath = this.resolveMcpServerPath();

    const isTypeScriptEntrypoint = mcpServerPath.endsWith('.ts');
    const runner = isTypeScriptEntrypoint ? 'bun' : 'node';
    const args = isTypeScriptEntrypoint
      ? ['run', mcpServerPath]
      : [mcpServerPath];

    this.process = spawn(runner, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });

    this.process.stdout?.on('data', data => {
      this.buffer += data.toString();
      this.processBuffer();
    });

    this.process.stderr?.on('data', data => {
      console.error('[MCP Server]', data.toString());
    });

    this.process.on('error', error => {
      console.error('[MCP Client] Process error:', error);
      this.emit('error', error);
    });

    this.process.on('exit', code => {
      console.log('[MCP Client] Process exited with code:', code);
      this.process = null;
    });

    // Initialize connection
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'summonapp',
        version: '1.0.0',
      },
    });
  }

  private processBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const response: MCPResponse = JSON.parse(line);
        const pending = this.pendingRequests.get(response.id);

        if (pending) {
          this.pendingRequests.delete(response.id);

          if (response.error) {
            pending.reject(new Error(response.error.message));
          } else {
            pending.resolve(response.result);
          }
        }
      } catch (error) {
        console.error('[MCP Client] Failed to parse response:', line, error);
      }
    }
  }

  private async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.process) {
      throw new Error('MCP client not connected');
    }

    const id = ++this.requestId;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      this.process!.stdin?.write(JSON.stringify(request) + '\n');

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async listTools() {
    return this.sendRequest('tools/list');
  }

  async callTool(name: string, args: any) {
    return this.sendRequest('tools/call', {
      name,
      arguments: args,
    });
  }

  async disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.pendingRequests.clear();
  }
}

// Singleton instance
let mcpClient: MCPClient | null = null;

export async function getMCPClient(): Promise<MCPClient> {
  if (!mcpClient) {
    mcpClient = new MCPClient();
    await mcpClient.connect();
  }
  return mcpClient;
}

export function getRunningMCPClient(): MCPClient | null {
  if (!mcpClient) return null;
  return mcpClient.isRunning() ? mcpClient : null;
}
