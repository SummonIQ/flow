'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import type { EnvVariable, ProjectConfig } from '@/lib/settings-store';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@summoniq/applab-ui';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Info,
  Laptop,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  Save,
  Search,
  Smartphone,
  Trash2,
  Upload,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type PortAllocation = {
  projects: Array<{
    id: string;
    name: string;
    apps: Array<{
      id: string;
      name: string;
      type: string;
      devPort: number | null;
    }>;
    minPort: number | null;
    maxPort: number | null;
    portRange: string;
    portCount: number;
  }>;
  summary: {
    WEB_APP: {
      start: number;
      end: number;
      label: string;
      used: number;
      ports: number[];
    };
    DESKTOP_APP: {
      start: number;
      end: number;
      label: string;
      used: number;
      ports: number[];
    };
    MOBILE_APP: {
      start: number;
      end: number;
      label: string;
      used: number;
      ports: number[];
    };
  };
  totalApps: number;
  totalWithPorts: number;
};

export default function SettingsPage() {
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([]);
  const [projectConfigs, setProjectConfigs] = useState<ProjectConfig[]>([]);
  const [portAllocations, setPortAllocations] = useState<PortAllocation | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState('env');
  const [mcpRuntimeStatus, setMcpRuntimeStatus] = useState<null | {
    running: boolean;
    error?: string;
  }>(null);
  const [checkingMcpRuntimeStatus, setCheckingMcpRuntimeStatus] =
    useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchEnvVariables();
    fetchProjectConfigs();
    fetchPortAllocations();
  }, []);

  useEffect(() => {
    if (activeTab === 'mcp' && mcpRuntimeStatus === null) {
      void checkMcpRuntime();
    }
  }, [activeTab, mcpRuntimeStatus]);

  const checkMcpRuntime = async (opts?: { start?: boolean }) => {
    setCheckingMcpRuntimeStatus(true);
    try {
      const url = opts?.start ? '/api/mcp/status?start=1' : '/api/mcp/status';
      const res = await fetch(url);
      const data = (await res.json().catch(() => ({}))) as {
        running?: boolean;
        error?: string;
      };
      setMcpRuntimeStatus({
        running: !!data.running,
        ...(data.error ? { error: data.error } : {}),
      });
    } catch (error) {
      setMcpRuntimeStatus({
        running: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setCheckingMcpRuntimeStatus(false);
    }
  };

  const fetchEnvVariables = async () => {
    try {
      const res = await fetch('/api/settings/env');
      const data = await res.json();
      setEnvVariables(data);
    } catch (error) {
      console.error('Failed to fetch environment variables:', error);
    }
  };

  const fetchProjectConfigs = async () => {
    try {
      const res = await fetch('/api/settings/config');
      const data = await res.json();
      setProjectConfigs(data);
    } catch (error) {
      console.error('Failed to fetch project configurations:', error);
    }
  };

  const fetchPortAllocations = async () => {
    try {
      const res = await fetch('/api/settings/ports');
      const data = await res.json();
      setPortAllocations(data);
    } catch (error) {
      console.error('Failed to fetch port allocations:', error);
    }
  };

  return (
    <Page className="h-full">
      <PageHeader
        title="Settings"
        description="Manage environment variables and project configurations"
      />

      <div className="flex-1 px-6 pb-6">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="env">Environment Variables</TabsTrigger>
              <TabsTrigger value="config">Project Configuration</TabsTrigger>
              <TabsTrigger value="ports">Port Reservations</TabsTrigger>
              <TabsTrigger value="mcp">MCP</TabsTrigger>
              <TabsTrigger value="rag">RAG</TabsTrigger>
            </TabsList>

            <TabsContent value="env" className="space-y-4 pt-6">
              <div className="text-sm text-muted-foreground">
                These environment variables are global to SummonIQ. Projects can
                reference them or override them at the project/app level.
              </div>
              <EnvVariablesSection
                envVariables={envVariables}
                onRefresh={fetchEnvVariables}
              />
            </TabsContent>

            <TabsContent value="config" className="space-y-4 pt-6">
              <ProjectConfigSection
                projectConfigs={projectConfigs}
                onRefresh={fetchProjectConfigs}
              />
            </TabsContent>

            <TabsContent value="ports" className="space-y-4 pt-6">
              <PortReservationsSection
                portAllocations={portAllocations}
                onRefresh={fetchPortAllocations}
              />
            </TabsContent>

            <TabsContent value="mcp" className="space-y-4 pt-6">
              <MCPSettingsSection />
            </TabsContent>

            <TabsContent value="rag" className="space-y-4 pt-6">
              <RagOpsSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Page>
  );
}

function EnvVariablesSection({
  envVariables,
  onRefresh,
}: {
  envVariables: EnvVariable[];
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    isSecret: false,
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/settings/env';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to save environment variable:', error);
    }
  };

  const handleEdit = (env: EnvVariable) => {
    setEditingId(env.id);
    setFormData({
      key: env.key,
      value: env.value,
      description: env.description || '',
      isSecret: env.isSecret || false,
    });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm('Are you sure you want to delete this environment variable?')
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/settings/env?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete environment variable:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ key: '', value: '', description: '', isSecret: false });
  };

  const handleExport = () => {
    const envString = envVariables
      .map(env => {
        const comment = env.description ? `# ${env.description}\n` : '';
        return `${comment}${env.key}=${env.value}`;
      })
      .join('\n\n');

    const blob = new Blob([envString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.env';
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      // Parse and import (simplified - you might want to enhance this)
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            await fetch('/api/settings/env', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                key: key.trim(),
                value: valueParts.join('=').trim(),
                isSecret: false,
              }),
            });
          }
        }
      }
      onRefresh();
    };
    input.click();
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="w-4 h-4 mr-2" />
          Import .env
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export .env
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId
              ? 'Edit Environment Variable'
              : 'Add Environment Variable'}
          </CardTitle>
          <CardDescription>
            {editingId
              ? 'Update the environment variable details'
              : 'Create a new environment variable for your project'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key *</Label>
                <Input
                  id="key"
                  placeholder="API_KEY"
                  value={formData.key}
                  onChange={e =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  type={formData.isSecret ? 'password' : 'text'}
                  placeholder="your-api-key-here"
                  value={formData.value}
                  onChange={e =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What is this variable used for?"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isSecret"
                checked={formData.isSecret}
                onChange={e =>
                  setFormData({ ...formData, isSecret: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isSecret">Mark as secret</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables ({envVariables.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {envVariables.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No environment variables yet. Create one above to get started.
              </p>
            ) : (
              envVariables.map(env => (
                <div
                  key={env.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-semibold">
                        {env.key}
                      </code>
                      {env.isSecret && (
                        <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">
                          Secret
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-muted-foreground">
                        {env.isSecret && !showSecrets[env.id]
                          ? '••••••••'
                          : env.value}
                      </code>
                      {env.isSecret && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowSecrets({
                              ...showSecrets,
                              [env.id]: !showSecrets[env.id],
                            })
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showSecrets[env.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {env.description && (
                      <p className="text-xs text-muted-foreground">
                        {env.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(env)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(env.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function ProjectConfigSection({
  projectConfigs,
  onRefresh,
}: {
  projectConfigs: ProjectConfig[];
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    settings: '{}',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/settings/config';
      const method = editingId ? 'PUT' : 'POST';

      let parsedSettings = {};
      try {
        parsedSettings = JSON.parse(formData.settings);
      } catch {
        alert('Invalid JSON in settings field');
        return;
      }

      const body = editingId
        ? { id: editingId, ...formData, settings: parsedSettings }
        : { ...formData, settings: parsedSettings };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to save project configuration:', error);
    }
  };

  const handleEdit = (config: ProjectConfig) => {
    setEditingId(config.id);
    setFormData({
      name: config.name,
      description: config.description || '',
      settings: JSON.stringify(config.settings, null, 2),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const res = await fetch(`/api/settings/config?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete project configuration:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', settings: '{}' });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId
              ? 'Edit Project Configuration'
              : 'Add Project Configuration'}
          </CardTitle>
          <CardDescription>
            {editingId
              ? 'Update the project configuration'
              : 'Create a new project configuration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My Project"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What is this configuration for?"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings">Settings (JSON) *</Label>
              <textarea
                id="settings"
                className="w-full min-h-[200px] p-3 font-mono text-sm border rounded-md bg-background"
                placeholder='{\n  "port": 3000,\n  "debug": true\n}'
                value={formData.settings}
                onChange={e =>
                  setFormData({ ...formData, settings: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter valid JSON configuration
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Project Configurations ({projectConfigs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectConfigs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No project configurations yet. Create one above to get started.
              </p>
            ) : (
              projectConfigs.map(config => (
                <div
                  key={config.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold">{config.name}</h3>
                      {config.description && (
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(config)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs font-mono overflow-x-auto">
                      {JSON.stringify(config.settings, null, 2)}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(config.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function PortReservationsSection({
  portAllocations,
  onRefresh,
}: {
  portAllocations: PortAllocation | null;
  onRefresh: () => void;
}) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/settings/ports', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(
          `Sync complete! Created: ${data.created}, Updated: ${data.updated}`,
        );
        onRefresh();
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to sync ports:', error);
      alert('Failed to sync ports');
    } finally {
      setSyncing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WEB_APP':
        return <Globe className="w-4 h-4" />;
      case 'DESKTOP_APP':
        return <Laptop className="w-4 h-4" />;
      case 'MOBILE_APP':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'WEB_APP':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'DESKTOP_APP':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'MOBILE_APP':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  if (!portAllocations) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground text-center">
            Loading port allocations...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get projects with port allocations, sorted by first port
  const projectsWithPorts = portAllocations.projects
    .filter(p => p.minPort !== null && p.maxPort !== null)
    .map(project => ({
      ...project,
      reservedRange: project.portRange,
    }))
    .sort((a, b) => (a.minPort ?? 0) - (b.minPort ?? 0));

  return (
    <>
      {/* Header with Sync Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Port Allocation Report</h3>
          <p className="text-sm text-muted-foreground">
            {portAllocations.totalWithPorts} ports allocated across{' '}
            {projectsWithPorts.length} projects
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          <RefreshCw
            className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`}
          />
          {syncing ? 'Syncing...' : 'Sync Ports'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(portAllocations.summary).map(([type, info]) => (
          <div
            key={type}
            className="flex items-center gap-3 p-3 border rounded-lg bg-card"
          >
            <div className={`p-2 rounded-md ${getTypeBadgeColor(type)}`}>
              {getTypeIcon(type)}
            </div>
            <div>
              <p className="text-2xl font-bold">{info.used}</p>
              <p className="text-xs text-muted-foreground">{info.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Port Allocation Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project Port Reservations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            {/* Table Header */}
            <div className="grid grid-cols-[120px_1fr_1fr] gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div>Port Range</div>
              <div>Project</div>
              <div>Apps</div>
            </div>

            {/* Table Body */}
            <div className="divide-y">
              {projectsWithPorts.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No port allocations found. Click "Sync Ports" to populate.
                </div>
              ) : (
                projectsWithPorts.map(project => (
                  <div
                    key={project.id}
                    className="grid grid-cols-[120px_1fr_1fr] gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="font-mono text-sm font-medium">
                      {project.reservedRange}
                    </div>
                    <div className="text-sm font-medium">{project.name}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.apps
                        .filter(app => app.devPort !== null)
                        .map(app => (
                          <Badge
                            key={app.id}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {app.name}
                            <span className="ml-1 font-mono text-muted-foreground">
                              :{app.devPort}
                            </span>
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Port Range Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Port Range Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {Object.entries(portAllocations.summary).map(([type, info]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-muted-foreground">{info.label}</span>
                <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {info.start} - {info.end}
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// RAG types
type RagStatus = {
  enabled: boolean;
  autoIndex: boolean;
  vectorDbConnected: boolean;
  embeddingProvider: string;
  stats: {
    totalEmbeddings: number;
    pendingJobs: number;
    failedJobs: number;
    embeddingsByType: Record<string, number>;
    jobsByStatus: Record<string, number>;
    staleEmbeddings: number;
  };
};

type ReindexStatus = {
  statusCounts: Record<string, Record<string, number>>;
  jobQueue: Array<{
    status: string;
    sourceType: string;
    count: number;
  }>;
};

type EmbeddingJob = {
  id: string;
  sourceType: string;
  sourceId: string;
  status: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

function RagOpsSection() {
  const [status, setStatus] = useState<RagStatus | null>(null);
  const [reindexStatus, setReindexStatus] = useState<ReindexStatus | null>(
    null,
  );
  const [jobs, setJobs] = useState<EmbeddingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMode, setReindexMode] = useState<'stale' | 'pending' | 'all'>(
    'stale',
  );
  const [reindexSourceType, setReindexSourceType] = useState<string>('');
  const [jobFilter, setJobFilter] = useState<string>('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStatus(), fetchReindexStatus(), fetchJobs()]);
    setLoading(false);
  };

  const fetchStatus = async () => {
    try {
      const [statusRes, reindexRes] = await Promise.all([
        fetch('/api/rag/status'),
        fetch('/api/rag/reindex'),
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();

        // Calculate stale count from reindex endpoint if available
        let staleCount = 0;
        let pendingCount = 0;
        if (reindexRes.ok) {
          const reindexData = await reindexRes.json();
          // Sum up stale and pending counts from statusCounts
          if (reindexData.statusCounts) {
            Object.values(reindexData.statusCounts).forEach((counts: any) => {
              staleCount += counts.stale ?? 0;
              pendingCount += counts.pending ?? 0;
            });
          }
        }

        // Map API response to expected UI format
        setStatus({
          enabled: data.config?.ragEnabled ?? false,
          autoIndex: data.config?.autoIndex ?? false,
          vectorDbConnected: data.pgvector?.available ?? false,
          embeddingProvider: data.config?.embeddingModel || '',
          stats: {
            totalEmbeddings: data.embeddings?.total ?? 0,
            pendingJobs: pendingCount || (data.jobs?.pending ?? 0),
            failedJobs: data.jobs?.failed ?? 0,
            embeddingsByType:
              data.embeddings?.bySourceType?.reduce(
                (
                  acc: Record<string, number>,
                  item: { sourceType: string; count: number },
                ) => {
                  acc[item.sourceType] = item.count;
                  return acc;
                },
                {} as Record<string, number>,
              ) ?? {},
            jobsByStatus: {},
            staleEmbeddings: staleCount,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch RAG status:', error);
    }
  };

  const fetchReindexStatus = async () => {
    try {
      const res = await fetch('/api/rag/reindex');
      if (res.ok) {
        const data = await res.json();
        setReindexStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch reindex status:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const url = jobFilter
        ? `/api/rag/jobs?status=${jobFilter}`
        : '/api/rag/jobs';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const handleProcessJobs = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/rag/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process', limit: 10 }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Processed ${data.processed} jobs`);
        await fetchAll();
      }
    } catch (error) {
      console.error('Failed to process jobs:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryFailed = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/rag/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry-failed' }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Reset ${data.reset} failed jobs`);
        await fetchAll();
      }
    } catch (error) {
      console.error('Failed to retry failed jobs:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const res = await fetch('/api/rag/jobs?status=COMPLETED', {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Cleared ${data.deleted} completed jobs`);
        await fetchAll();
      }
    } catch (error) {
      console.error('Failed to clear completed jobs:', error);
    }
  };

  const handleReindex = async (dryRun = false) => {
    setReindexing(true);
    try {
      const res = await fetch('/api/rag/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: reindexMode,
          sourceType: reindexSourceType || undefined,
          dryRun,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        if (!dryRun) {
          await fetchAll();
        }
      }
    } catch (error) {
      console.error('Failed to trigger reindex:', error);
    } finally {
      setReindexing(false);
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'PROCESSING':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'STALE':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Status Overview Cards */}
      <div className="flex flex-wrap gap-3">
        <Card
          className={`p-3 min-w-[140px] bg-gradient-to-br ${status?.enabled ? 'from-green-500/5 to-green-500/10 border-green-500/20' : 'from-muted/50 to-muted'}`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`p-2 rounded-md ${status?.enabled ? 'bg-green-500/10' : 'bg-muted'}`}
            >
              {status?.enabled ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p
                className={`text-xl font-bold leading-none ${status?.enabled ? 'text-green-500' : 'text-muted-foreground'}`}
              >
                {status?.enabled ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-xs text-muted-foreground">RAG System</p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-3 min-w-[140px] bg-gradient-to-br ${status?.vectorDbConnected ? 'from-violet-500/5 to-violet-500/10 border-violet-500/20' : 'from-muted/50 to-muted'}`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`p-2 rounded-md ${status?.vectorDbConnected ? 'bg-violet-500/10' : 'bg-muted'}`}
            >
              <Database
                className={`w-5 h-5 ${status?.vectorDbConnected ? 'text-violet-500' : 'text-muted-foreground'}`}
              />
            </div>
            <div>
              <p
                className={`text-xl font-bold leading-none ${status?.vectorDbConnected ? 'text-violet-500' : 'text-muted-foreground'}`}
              >
                {status?.vectorDbConnected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs text-muted-foreground">Vector DB</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 min-w-[140px] bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <div className="flex items-start gap-2">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Brain className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none truncate max-w-[120px]">
                {status?.embeddingProvider
                  ? status.embeddingProvider.replace('text-embedding-', '')
                  : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">Provider</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      {status?.stats && (
        <div className="flex flex-wrap gap-3">
          <Card className="p-3 min-w-[120px] bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">
                  {status.stats.totalEmbeddings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Embeddings</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 min-w-[120px] bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-md bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">
                  {status.stats.pendingJobs.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 min-w-[120px] bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-md bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">
                  {status.stats.failedJobs.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 min-w-[120px] bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-md bg-orange-500/10">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">
                  {status.stats.staleEmbeddings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Stale</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Configuration Help */}
      {!status?.enabled && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Info className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base">Enable RAG System</CardTitle>
                <CardDescription>
                  Configure environment variables to enable RAG
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To enable the RAG system, add the following environment variables
              to your{' '}
              <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                .env.local
              </code>{' '}
              file:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 font-mono text-sm">
                <span>RAG_ENABLED=true</span>
                <Badge variant="outline" className="text-xs">
                  Required
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 font-mono text-sm">
                <span>OPENAI_API_KEY=sk-...</span>
                <Badge variant="outline" className="text-xs">
                  For embeddings
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              After setting these variables, restart the application for changes
              to take effect.
            </p>
          </CardContent>
        </Card>
      )}

      {/* RAG Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Search className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <CardTitle>RAG System</CardTitle>
                <CardDescription>
                  Retrieval-Augmented Generation for intelligent search and
                  context
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={status?.enabled ? 'default' : 'secondary'}
              className={
                status?.enabled
                  ? 'bg-green-500/10 text-green-600 border-green-500/20'
                  : ''
              }
            >
              {status?.enabled ? '✓ RAG Enabled' : 'RAG Disabled'}
            </Badge>
            <Badge
              variant={status?.autoIndex ? 'default' : 'secondary'}
              className={
                status?.autoIndex
                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                  : ''
              }
            >
              {status?.autoIndex ? '✓ Auto-Index On' : 'Auto-Index Off'}
            </Badge>
            <Badge
              variant={status?.vectorDbConnected ? 'default' : 'destructive'}
              className={
                status?.vectorDbConnected
                  ? 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                  : ''
              }
            >
              {status?.vectorDbConnected
                ? '✓ Vector DB Connected'
                : 'Vector DB Disconnected'}
            </Badge>
          </div>

          {/* Embeddings by Type */}
          {status?.stats?.embeddingsByType &&
            Object.keys(status.stats.embeddingsByType).length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Embeddings by Source Type
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(status.stats.embeddingsByType).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm">{type}</span>
                        <Badge variant="secondary" className="font-mono">
                          {count.toLocaleString()}
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Combined Status & Controls */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Embedding Status by Model */}
        {reindexStatus && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Content Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {Object.entries(reindexStatus.statusCounts).map(
                  ([model, counts]) => {
                    const total = Object.values(counts).reduce(
                      (a, b) => a + b,
                      0,
                    );
                    if (total === 0) return null;
                    return (
                      <div
                        key={model}
                        className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30 text-xs"
                      >
                        <span className="font-medium">{model}</span>
                        <div className="flex gap-1.5">
                          {counts.completed > 0 && (
                            <span className="flex items-center gap-0.5 text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              {counts.completed}
                            </span>
                          )}
                          {counts.pending > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-600">
                              <Clock className="w-3 h-3" />
                              {counts.pending}
                            </span>
                          )}
                          {counts.stale > 0 && (
                            <span className="flex items-center gap-0.5 text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              {counts.stale}
                            </span>
                          )}
                          {counts.failed > 0 && (
                            <span className="flex items-center gap-0.5 text-red-600">
                              <XCircle className="w-3 h-3" />
                              {counts.failed}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reindex Controls - Compact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Reindex
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={reindexMode}
                onChange={e =>
                  setReindexMode(e.target.value as 'stale' | 'pending' | 'all')
                }
                className="px-2 py-1.5 border border-border rounded-md bg-background text-xs"
              >
                <option value="stale">Stale Only</option>
                <option value="pending">Pending Only</option>
                <option value="all">All</option>
              </select>
              <select
                value={reindexSourceType}
                onChange={e => setReindexSourceType(e.target.value)}
                className="px-2 py-1.5 border border-border rounded-md bg-background text-xs"
              >
                <option value="">All Types</option>
                <option value="Component">Component</option>
                <option value="Ticket">Ticket</option>
                <option value="BestPractice">Best Practice</option>
                <option value="KnowledgeDocument">Knowledge Doc</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReindex(true)}
                disabled={reindexing || !status?.enabled}
                className="flex-1 text-xs h-8"
              >
                {reindexing ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Eye className="w-3 h-3 mr-1" />
                )}
                Dry Run
              </Button>
              <Button
                size="sm"
                onClick={() => handleReindex(false)}
                disabled={reindexing || !status?.enabled}
                className="flex-1 text-xs h-8"
              >
                {reindexing ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3 mr-1" />
                )}
                Reindex
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Queue - Compact */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Job Queue</CardTitle>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleProcessJobs}
                disabled={processing || !status?.enabled}
                className="text-xs h-7 px-2"
              >
                {processing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryFailed}
                disabled={processing}
                className="text-xs h-7 px-2"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCompleted}
                className="text-xs h-7 px-2"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <select
                value={jobFilter}
                onChange={e => {
                  setJobFilter(e.target.value);
                  setTimeout(fetchJobs, 0);
                }}
                className="px-2 py-1 border border-border rounded-md bg-background text-xs h-7"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Done</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {jobs.length > 0 ? (
            <div className="space-y-1.5 max-h-[280px] overflow-auto">
              {jobs.slice(0, 30).map(job => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg border bg-card text-xs"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.sourceType}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                        <span className="font-mono">
                          {job.sourceId.slice(0, 12)}...
                        </span>
                        <span>•</span>
                        <span>{new Date(job.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {job.error && (
                    <div className="text-red-500 text-right max-w-[200px]">
                      <div className="font-medium">Error</div>
                      <div className="truncate">{job.error}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-muted-foreground py-6">
              No jobs in queue
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

const mcpTools = [
  { name: 'list_projects', desc: 'List projects with filters' },
  { name: 'get_project', desc: 'Get project details' },
  { name: 'create_project', desc: 'Create a new project' },
  { name: 'list_tasks', desc: 'List tasks with filters' },
  { name: 'get_task', desc: 'Get task details' },
  { name: 'create_task', desc: 'Create a new task' },
  { name: 'update_task', desc: 'Update task status' },
  { name: 'list_clients', desc: 'List all clients' },
  { name: 'get_client', desc: 'Get client details' },
  { name: 'list_meetings', desc: 'List meetings' },
  { name: 'create_meeting', desc: 'Schedule a meeting' },
  { name: 'list_invoices', desc: 'List invoices' },
  { name: 'get_invoice', desc: 'Get invoice details' },
  { name: 'list_time_entries', desc: 'List time entries' },
  { name: 'create_time_entry', desc: 'Log time worked' },
];

function MCPSettingsSection() {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:30140';
  const sseEndpoint = `${baseUrl}/api/mcp/sse`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const claudeConfig = JSON.stringify(
    { mcpServers: { flow: { transport: 'sse', url: sseEndpoint } } },
    null,
    2,
  );
  const cursorConfig = JSON.stringify(
    { mcpServers: { flow: { transport: 'sse', url: sseEndpoint } } },
    null,
    2,
  );

  return (
    <>
      {/* Status */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-green-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plug className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transport</p>
                <p className="text-sm font-semibold">SSE (HTTP)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Layers className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tools</p>
                <p className="text-sm font-semibold">
                  {mcpTools.length} available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="w-4 h-4" />
            MCP Server Endpoints
          </CardTitle>
          <CardDescription>
            Flow exposes these endpoints when running
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
            <div>
              <p className="text-xs text-muted-foreground">SSE Endpoint</p>
              <code className="text-xs">{sseEndpoint}</code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(sseEndpoint, 'sse')}
            >
              {copied === 'sse' ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
            <div>
              <p className="text-xs text-muted-foreground">Tools API</p>
              <code className="text-xs">{baseUrl}/api/mcp/tools</code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(`${baseUrl}/api/mcp/tools`, 'tools')}
            >
              {copied === 'tools' ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Setup Instructions</CardTitle>
          <CardDescription>Add Flow to your AI assistant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium">Claude Desktop</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(claudeConfig, 'claude')}
              >
                {copied === 'claude' ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Edit{' '}
              <code className="bg-muted px-1 rounded text-[10px]">
                ~/Library/Application Support/Claude/claude_desktop_config.json
              </code>
            </p>
            <pre className="bg-muted/50 border rounded-md p-2 text-[10px] overflow-x-auto">
              <code>{claudeConfig}</code>
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium">Cursor</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(cursorConfig, 'cursor')}
              >
                {copied === 'cursor' ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Edit{' '}
              <code className="bg-muted px-1 rounded text-[10px]">
                ~/.cursor/mcp.json
              </code>
            </p>
            <pre className="bg-muted/50 border rounded-md p-2 text-[10px] overflow-x-auto">
              <code>{cursorConfig}</code>
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Windsurf / Other</h4>
            <p className="text-xs text-muted-foreground">
              Use SSE transport with URL:{' '}
              <code className="bg-muted px-1 rounded text-[10px]">
                {sseEndpoint}
              </code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Available Tools</CardTitle>
          <CardDescription>Tools your AI assistant can use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {mcpTools.map(tool => (
              <div
                key={tool.name}
                className="flex items-center justify-between px-2 py-1 rounded border border-border/40 bg-muted/20"
              >
                <code className="text-[10px] font-medium">{tool.name}</code>
                <span className="text-[9px] text-muted-foreground truncate ml-1">
                  {tool.desc}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>"Show me all in-progress projects"</p>
            <p>"Create a high-priority task for project X"</p>
            <p>"List all VIP clients"</p>
            <p>"Schedule a client call tomorrow at 2pm"</p>
            <p>"Log 3 hours on project ABC"</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
