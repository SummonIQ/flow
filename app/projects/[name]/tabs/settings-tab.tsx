'use client';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import {
  Box,
  Clock,
  Code,
  Database,
  ExternalLink,
  FileCode2,
  FolderOpen,
  Gauge,
  Key,
  Plus,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type RuntimeProject = {
  name: string;
  description: string;
  path?: string;
  hasConfig?: boolean;
  apps?: any[];
  mcpServers?: Record<string, { enabled?: boolean; description?: string }>;
};

interface SettingsTabProps {
  project: RuntimeProject;
}

const settingsSections = [
  { id: 'general', name: 'General', icon: SettingsIcon },
  { id: 'build', name: 'Build & Development', icon: Code },
  { id: 'features', name: 'Project Features', icon: Zap },
  { id: 'env', name: 'Environment Variables', icon: Key },
  { id: 'rateLimit', name: 'Rate Limiting', icon: Gauge },
  { id: 'mcp', name: 'MCP Servers', icon: Box },
  { id: 'danger', name: 'Danger Zone', icon: Shield },
];

// TODO: Add a "Deployments & Integrations" section for GitHub/Vercel auth, repo linking, and auto-deploy settings.

const mcpServers = [
  {
    id: 'fetch',
    name: 'Fetch',
    description: 'Make HTTP requests to external APIs',
    enabled: true,
  },
  {
    id: 'playwright',
    name: 'Playwright',
    description: 'Browser automation and frontend validation',
    enabled: true,
  },
  {
    id: 'prisma',
    name: 'Prisma',
    description: 'Database schema and migration management',
    enabled: true,
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Design file creation and management (Designer agents)',
    enabled: true,
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'File system operations',
    enabled: true,
  },
  {
    id: 'git',
    name: 'Git',
    description: 'Git repository operations',
    enabled: false,
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent memory and knowledge graph',
    enabled: false,
  },
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Advanced reasoning and problem-solving',
    enabled: false,
  },
];

type RateLimitPreset = {
  limit: number;
  window: number;
  key: string;
};

type RateLimitConfig = {
  enabled: boolean;
  storage: 'kv' | 'database' | 'memory';
  presets: Record<string, RateLimitPreset>;
};

export function SettingsTab({ project }: SettingsTabProps) {
  const [activeSection, setActiveSection] = useState('general');
  const [mcpServerStates, setMcpServerStates] = useState<
    Record<string, boolean>
  >(() =>
    mcpServers.reduce(
      (acc, server) => {
        const configured = project.mcpServers?.[server.id]?.enabled;
        return {
          ...acc,
          [server.id]: configured ?? server.enabled,
        };
      },
      {} as Record<string, boolean>,
    ),
  );
  const [rateLimitConfig, setRateLimitConfig] = useState<RateLimitConfig>({
    enabled: false,
    storage: 'memory',
    presets: {},
  });
  const [loadingRateLimit, setLoadingRateLimit] = useState(false);
  const [savingRateLimit, setSavingRateLimit] = useState(false);

  // Load rate limit config
  useEffect(() => {
    const loadRateLimitConfig = async () => {
      setLoadingRateLimit(true);
      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(project.name)}/rate-limit`,
        );
        if (response.ok) {
          const data = await response.json();
          setRateLimitConfig(data.config);
        }
      } catch (error) {
        console.error('Error loading rate limit config:', error);
      } finally {
        setLoadingRateLimit(false);
      }
    };

    loadRateLimitConfig();
  }, [project.name]);

  const handleToggleMcpServer = async (serverId: string, enabled: boolean) => {
    const previous = mcpServerStates[serverId];
    setMcpServerStates(prev => ({ ...prev, [serverId]: enabled }));

    const server = mcpServers.find(s => s.id === serverId);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/mcp-servers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serverId, enabled }),
        },
      );

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save MCP configuration');
      }

      toast.success(`${server?.name} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      setMcpServerStates(prev => ({ ...prev, [serverId]: previous }));
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const handleSaveRateLimitConfig = async () => {
    setSavingRateLimit(true);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/rate-limit`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: rateLimitConfig }),
        },
      );

      if (response.ok) {
        toast.success('Rate limit configuration saved');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving rate limit config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSavingRateLimit(false);
    }
  };

  const handleAddPreset = () => {
    const presetName = prompt(
      'Enter preset name (e.g., apiGeneral, aiAnalysis):',
    );
    if (presetName && !rateLimitConfig.presets[presetName]) {
      setRateLimitConfig(prev => ({
        ...prev,
        presets: {
          ...prev.presets,
          [presetName]: {
            limit: 100,
            window: 60,
            key: `custom:${presetName}`,
          },
        },
      }));
    } else if (presetName) {
      toast.error('Preset name already exists');
    }
  };

  const handleDeletePreset = (presetName: string) => {
    setRateLimitConfig(prev => {
      const newPresets = { ...prev.presets };
      delete newPresets[presetName];
      return { ...prev, presets: newPresets };
    });
  };

  const handleUpdatePreset = (
    presetName: string,
    field: keyof RateLimitPreset,
    value: string | number,
  ) => {
    setRateLimitConfig(prev => ({
      ...prev,
      presets: {
        ...prev.presets,
        [presetName]: {
          ...prev.presets[presetName],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="flex gap-6">
      {/* Vertical Navigation */}
      <div className="w-[200px] flex-shrink-0">
        <nav className="space-y-1 sticky top-0">
          {settingsSections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors',
                  activeSection === section.id
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
                {section.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-6">
        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Project Name
                </label>
                <input
                  type="text"
                  defaultValue={project.name}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Description
                </label>
                <textarea
                  defaultValue={project.description}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Project Path
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={project.path}
                    disabled
                    className="flex-1 px-3 py-2 rounded-md border border-border bg-muted text-muted-foreground"
                  />
                  <button className="px-4 py-2 rounded-md border border-border hover:bg-secondary transition-colors">
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Agent Work Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  defaultValue={30}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Maximum time an AI agent can work on a single ticket before
                  it's automatically marked as failed. Default: 30 minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Build & Development */}
        {activeSection === 'build' && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Build & Development</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Package Manager
                </label>
                <select className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="bun">Bun</option>
                  <option value="npm">npm</option>
                  <option value="yarn">Yarn</option>
                  <option value="pnpm">pnpm</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Node Version
                </label>
                <select className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="20">Node 20 LTS</option>
                  <option value="21">Node 21</option>
                  <option value="22">Node 22</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-install"
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="auto-install" className="text-sm">
                  Auto-install dependencies on project open
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="strict-mode"
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="strict-mode" className="text-sm">
                  Enable TypeScript strict mode
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Project Features */}
        {activeSection === 'features' && (
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Project Features</h2>
              <button
                onClick={async () => {
                  if (
                    typeof window !== 'undefined' &&
                    window.electron &&
                    project.path
                  ) {
                    const result =
                      await window.electron.applications.openInWindsurf(
                        `${project.path}/applab.config.ts`,
                      );
                    if (!result.success) {
                      console.error(
                        'Failed to open config file:',
                        result.error,
                      );
                    }
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                title="Open applab.config.ts in Windsurf"
              >
                <FileCode2 className="w-4 h-4" />
                View Config File
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="p-2 rounded-md bg-primary/10 mt-0.5">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Database</h3>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    PostgreSQL with Prisma ORM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="p-2 rounded-md bg-primary/10 mt-0.5">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Authentication</h3>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Better Auth integration
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="p-2 rounded-md bg-primary/10 mt-0.5">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Real-time</h3>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Socket.io for live updates
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="p-2 rounded-md bg-primary/10 mt-0.5">
                  <Code className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">TypeScript</h3>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Full TypeScript support
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environment Variables */}
        {activeSection === 'env' && (
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Environment Variables</h2>
              <button className="text-sm text-primary hover:underline">
                Edit in .env
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/30">
                <div className="flex-1">
                  <p className="text-sm font-medium font-mono">DATABASE_URL</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    PostgreSQL connection string
                  </p>
                </div>
                <span className="text-xs text-green-500">Set</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/30">
                <div className="flex-1">
                  <p className="text-sm font-medium font-mono">
                    NEXTAUTH_SECRET
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Authentication secret key
                  </p>
                </div>
                <span className="text-xs text-green-500">Set</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/30">
                <div className="flex-1">
                  <p className="text-sm font-medium font-mono">API_URL</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Backend API endpoint
                  </p>
                </div>
                <span className="text-xs text-amber-500">Missing</span>
              </div>
            </div>
          </div>
        )}

        {/* Rate Limiting */}
        {activeSection === 'rateLimit' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Rate Limiting</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure rate limits for API endpoints, server actions, and
                    external API calls
                  </p>
                </div>
                <Button
                  onClick={handleSaveRateLimitConfig}
                  disabled={savingRateLimit}
                  className="gap-2"
                >
                  {savingRateLimit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>

              {/* Global Settings */}
              <div className="space-y-4 pb-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Enable Rate Limiting
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Turn on rate limiting for this project
                    </p>
                  </div>
                  <Switch
                    checked={rateLimitConfig.enabled}
                    onCheckedChange={checked =>
                      setRateLimitConfig(prev => ({
                        ...prev,
                        enabled: checked,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Storage Backend
                  </label>
                  <Select
                    value={rateLimitConfig.storage}
                    onValueChange={(value: 'kv' | 'database' | 'memory') =>
                      setRateLimitConfig(prev => ({ ...prev, storage: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="memory">
                        Memory (Development)
                      </SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="kv">KV Store (Vercel KV)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {rateLimitConfig.storage === 'memory' &&
                      'Rate limits stored in memory (resets on restart)'}
                    {rateLimitConfig.storage === 'database' &&
                      'Rate limits stored in database (persistent)'}
                    {rateLimitConfig.storage === 'kv' &&
                      'Rate limits stored in Vercel KV (recommended for production)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold mb-1">
                    Rate Limit Presets
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Custom rate limits for specific endpoints and operations
                  </p>
                </div>
                <Button
                  onClick={handleAddPreset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Preset
                </Button>
              </div>

              {loadingRateLimit ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : Object.keys(rateLimitConfig.presets).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gauge className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No rate limit presets configured</p>
                  <p className="text-xs mt-1">
                    Click "Add Preset" to create your first rate limit
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(rateLimitConfig.presets).map(
                    ([name, preset]) => (
                      <div
                        key={name}
                        className="p-4 rounded-md border border-border bg-secondary/20"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm font-mono">
                              {name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Key:{' '}
                              <span className="font-mono">{preset.key}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`Delete preset "${name}"?`)) {
                                handleDeletePreset(name);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-medium mb-1 block">
                              Limit (requests)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={preset.limit}
                              onChange={e =>
                                handleUpdatePreset(
                                  name,
                                  'limit',
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Window (seconds)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={preset.window}
                              onChange={e =>
                                handleUpdatePreset(
                                  name,
                                  'window',
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium mb-1 block">
                              Key Prefix
                            </label>
                            <input
                              type="text"
                              value={preset.key}
                              onChange={e =>
                                handleUpdatePreset(name, 'key', e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm font-mono"
                              placeholder="api:endpoint"
                            />
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong>{preset.limit}</strong> requests per{' '}
                            <strong>{preset.window}</strong> seconds
                            {preset.window >= 60 &&
                              ` (${Math.round(preset.window / 60)} min)`}
                            {preset.window >= 3600 &&
                              ` (${Math.round(preset.window / 3600)} hr)`}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MCP Servers */}
        {activeSection === 'mcp' && (
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-1">MCP Servers</h2>
              <p className="text-sm text-muted-foreground">
                Configure which Model Context Protocol tools are available to AI
                agents
              </p>
            </div>

            <div className="space-y-2">
              {mcpServers.map(server => (
                <div
                  key={server.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-md ${mcpServerStates[server.id] ? 'bg-green-500/10' : 'bg-gray-500/10'}`}
                    >
                      <Box
                        className={`w-5 h-5 ${mcpServerStates[server.id] ? 'text-green-500' : 'text-gray-400'}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{server.name}</h3>
                        {mcpServerStates[server.id] && (
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {server.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={mcpServerStates[server.id]}
                    onCheckedChange={checked =>
                      handleToggleMcpServer(server.id, checked)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex gap-2 text-sm">
                <div className="text-blue-600 dark:text-blue-400 font-medium">
                  ℹ️ Info:
                </div>
                <div className="text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">Default configuration:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>
                      <strong>fetch</strong> - For API integrations (all agents)
                    </li>
                    <li>
                      <strong>playwright</strong> - For frontend validation
                      (Alex, Luna)
                    </li>
                    <li>
                      <strong>prisma</strong> - For database operations (Morgan,
                      fullstack work)
                    </li>
                    <li>
                      <strong>figma</strong> - For design work (Luna only)
                    </li>
                    <li>
                      <strong>filesystem</strong> - For file operations (all
                      agents)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {activeSection === 'danger' && (
          <div className="bg-card border border-destructive/50 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-destructive mb-4">
              Danger Zone
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-destructive/5 border border-destructive/20">
                <div>
                  <h3 className="font-medium text-sm">Reset Configuration</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reset all project settings to defaults
                  </p>
                </div>
                <button className="px-3 py-1.5 text-sm rounded-md border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors">
                  Reset
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-destructive/5 border border-destructive/20">
                <div>
                  <h3 className="font-medium text-sm">Remove Project</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Remove this project from SummonIQ (files will not be deleted)
                  </p>
                </div>
                <button className="px-3 py-1.5 text-sm rounded-md bg-destructive text-white hover:bg-destructive/90 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-secondary transition-colors">
            <RefreshCw className="w-4 h-4" />
            Reset Changes
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
