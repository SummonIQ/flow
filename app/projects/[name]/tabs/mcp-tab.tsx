'use client';

import { RunControlButton } from '@/components/runtime/run-control-button';
import {
  CheckCircle,
  Clock,
  Plus,
  Server,
  Settings,
  Shield,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Wrench,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

type RuntimeProject = {
  name: string;
  description: string;
  path?: string;
  hasConfig?: boolean;
  mcp?: {
    servers?: Array<{
      name: string;
      command: string;
      args?: string[];
      env?: Record<string, string>;
      description?: string;
    }>;
  };
};

interface MCPTabProps {
  project: RuntimeProject;
}

export function MCPTab({ project }: MCPTabProps) {
  const [runningServers, setRunningServers] = useState<Set<string>>(new Set());
  const [enabledTools, setEnabledTools] = useState<Set<string>>(
    new Set(['read_file', 'write_file', 'search', 'terminal']),
  );

  // Sample tool inventory - in production this would come from MCP server discovery
  const tools = [
    {
      name: 'read_file',
      description: 'Read file contents',
      lastUsed: '2 min ago',
      category: 'filesystem',
    },
    {
      name: 'write_file',
      description: 'Write/create files',
      lastUsed: '5 min ago',
      category: 'filesystem',
    },
    {
      name: 'search',
      description: 'Search codebase',
      lastUsed: '10 min ago',
      category: 'search',
    },
    {
      name: 'terminal',
      description: 'Run shell commands',
      lastUsed: '1 hour ago',
      category: 'system',
    },
    {
      name: 'browser',
      description: 'Web browsing',
      lastUsed: 'Never',
      category: 'external',
    },
    {
      name: 'database',
      description: 'Database queries',
      lastUsed: 'Never',
      category: 'data',
    },
  ];

  const toggleTool = (toolName: string) => {
    setEnabledTools(prev => {
      const next = new Set(prev);
      if (next.has(toolName)) {
        next.delete(toolName);
      } else {
        next.add(toolName);
      }
      return next;
    });
  };

  const handleStartServer = (serverName: string) => {
    // TODO: Implement actual server start via IPC
    console.log('Starting MCP server:', serverName);
    setRunningServers(prev => new Set(prev).add(serverName));
  };

  const handleStopServer = (serverName: string) => {
    // TODO: Implement actual server stop via IPC
    console.log('Stopping MCP server:', serverName);
    setRunningServers(prev => {
      const next = new Set(prev);
      next.delete(serverName);
      return next;
    });
  };

  const mcpServers = project.mcp?.servers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">MCP Servers</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Model Context Protocol servers for AI integrations
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Server
          </button>
        </div>
      </div>

      {/* MCP Servers List */}
      {mcpServers.length > 0 ? (
        <div className="space-y-3">
          {mcpServers.map(server => {
            const isRunning = runningServers.has(server.name);
            return (
              <div
                key={server.name}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-md ${isRunning ? 'bg-green-500/10' : 'bg-secondary'}`}
                    >
                      <Server
                        className={`w-5 h-5 ${isRunning ? 'text-green-500' : 'text-muted-foreground'}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{server.name}</h3>
                        {isRunning ? (
                          <span className="flex items-center gap-1 text-xs text-green-500">
                            <CheckCircle className="w-3 h-3" />
                            Running
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="w-3 h-3" />
                            Stopped
                          </span>
                        )}
                      </div>
                      {server.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {server.description}
                        </p>
                      )}
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-muted-foreground font-mono">
                          <span className="text-foreground/70">Command:</span>{' '}
                          {server.command}
                        </div>
                        {server.args && server.args.length > 0 && (
                          <div className="text-xs text-muted-foreground font-mono">
                            <span className="text-foreground/70">Args:</span>{' '}
                            {server.args.join(' ')}
                          </div>
                        )}
                        {server.env && Object.keys(server.env).length > 0 && (
                          <div className="text-xs text-muted-foreground font-mono">
                            <span className="text-foreground/70">Env:</span>{' '}
                            {Object.keys(server.env).length} variable(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded-md hover:bg-secondary transition-colors"
                      title="Configure server"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-md hover:bg-secondary transition-colors"
                      title="Delete server"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                    <RunControlButton
                      state={isRunning ? 'running' : 'stopped'}
                      size="md"
                      startLabel="Start"
                      stopLabel="Stop"
                      onClick={() =>
                        isRunning
                          ? handleStopServer(server.name)
                          : handleStartServer(server.name)
                      }
                      aria-label={
                        isRunning ? 'Stop MCP server' : 'Start MCP server'
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-10">
          <div className="text-center text-muted-foreground">
            <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No MCP servers configured</p>
            <p className="text-xs mt-1">
              Add MCP servers to integrate with AI tools and services
            </p>
          </div>
        </div>
      )}

      {/* Tool Inventory */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Tool Inventory
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Available tools and their permissions
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {enabledTools.size} of {tools.length} enabled
          </div>
        </div>

        <div className="space-y-2">
          {tools.map(tool => {
            const isEnabled = enabledTools.has(tool.name);
            return (
              <div
                key={tool.name}
                className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTool(tool.name)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono text-sm">
                        {tool.name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tool.lastUsed}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {isEnabled ? 'Allowed' : 'Blocked'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
