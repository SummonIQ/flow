'use client';

import { Switch } from '@/components/ui/switch';
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from '@summoniq/applab-ui';
import {
  Clock,
  Database,
  FolderOpen,
  Gauge,
  GitBranch,
  Globe,
  Plug,
  Plus,
  Save,
  Settings2,
  Shield,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DatabaseManager } from './database-manager';

interface ProjectConfigFormProps {
  project: any;
  onSave?: (data: any) => Promise<void>;
}

export function ProjectConfigForm({ project, onSave }: ProjectConfigFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    author: '',
    license: 'MIT',
    repository: {
      type: 'git',
      url: '',
    },
    settings: {
      autoInstall: true,
      autoFormat: true,
      strictMode: false,
      defaultPort: 3000,
    },
    build: {
      outputDir: 'dist',
      publicDir: 'public',
      cacheDir: '.cache',
    },
    env: {
      development: {} as Record<string, string>,
      production: {} as Record<string, string>,
      staging: {} as Record<string, string>,
    },
    integrations: [] as string[],
    team: [] as { name: string; role: string; email: string }[],
    scripts: {
      dev: 'bun dev',
      build: 'bun build',
      test: 'bun test',
      lint: 'bun lint',
    } as Record<string, string>,
    mcpServers: {
      fetch: {
        enabled: true,
        description: 'Make HTTP requests to external APIs',
      },
      playwright: {
        enabled: true,
        description: 'Browser automation and frontend validation',
      },
      prisma: {
        enabled: true,
        description: 'Database schema and migration management',
      },
      figma: {
        enabled: true,
        description: 'Design file creation and management (Designer agents)',
      },
      filesystem: { enabled: true, description: 'File system operations' },
      git: { enabled: false, description: 'Git repository operations' },
      memory: {
        enabled: false,
        description: 'Persistent memory and knowledge graph',
      },
      sequentialThinking: {
        enabled: false,
        description: 'Advanced reasoning and problem-solving',
      },
    } as Record<string, { enabled: boolean; description: string }>,
    rateLimitConfig: {
      enabled: false,
      storage: 'memory' as 'kv' | 'database' | 'memory',
      presets: {} as Record<
        string,
        { limit: number; window: number; key: string }
      >,
    },
  });

  const [saving, setSaving] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [selectedEnvTarget, setSelectedEnvTarget] = useState<
    'development' | 'production' | 'staging'
  >('development');
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    email: '',
  });
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [newIntegration, setNewIntegration] = useState('');
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptCommand, setNewScriptCommand] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        version: project.version || '1.0.0',
        author: project.author || '',
        license: project.license || 'MIT',
        repository: project.repository || { type: 'git', url: '' },
        settings: project.settings || {
          autoInstall: true,
          autoFormat: true,
          strictMode: false,
          defaultPort: 3000,
        },
        build: project.build || {
          outputDir: 'dist',
          publicDir: 'public',
          cacheDir: '.cache',
        },
        env: project.env || {
          development: {},
          production: {},
          staging: {},
        },
        integrations: project.integrations || [],
        team: project.team || [],
        scripts: project.scripts || {
          dev: 'bun dev',
          build: 'bun build',
          test: 'bun test',
          lint: 'bun lint',
        },
        mcpServers: project.mcpServers || {
          fetch: {
            enabled: true,
            description: 'Make HTTP requests to external APIs',
          },
          playwright: {
            enabled: true,
            description: 'Browser automation and frontend validation',
          },
          prisma: {
            enabled: true,
            description: 'Database schema and migration management',
          },
          figma: {
            enabled: true,
            description:
              'Design file creation and management (Designer agents)',
          },
          filesystem: { enabled: true, description: 'File system operations' },
          git: { enabled: false, description: 'Git repository operations' },
          memory: {
            enabled: false,
            description: 'Persistent memory and knowledge graph',
          },
          sequentialThinking: {
            enabled: false,
            description: 'Advanced reasoning and problem-solving',
          },
        },
        rateLimitConfig: project.rateLimitConfig || {
          enabled: false,
          storage: 'memory',
          presets: {},
        },
      });
    }
  }, [project]);

  const persistMcpServers = async (
    nextMcpServers: typeof formData.mcpServers,
  ) => {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/mcp-servers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            states: Object.fromEntries(
              Object.entries(nextMcpServers).map(([id, cfg]) => [
                id,
                !!cfg.enabled,
              ]),
            ),
          }),
        },
      );

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save MCP configuration');
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save MCP configuration',
      );
      throw error;
    }
  };

  // Load available teams
  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await fetch('/api/teams');
        if (response.ok) {
          const teams = await response.json();
          setAvailableTeams(Array.isArray(teams) ? teams : []);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
      }
    }
    loadTeams();
  }, []);

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Project name is required');
      return;
    }

    setSaving(true);
    try {
      await onSave?.(formData);
      toast.success('Project configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save project configuration');
    } finally {
      setSaving(false);
    }
  };

  const addEnvVariable = () => {
    if (newEnvKey && newEnvValue) {
      setFormData({
        ...formData,
        env: {
          ...formData.env,
          [selectedEnvTarget]: {
            ...formData.env[selectedEnvTarget],
            [newEnvKey]: newEnvValue,
          },
        },
      });
      setNewEnvKey('');
      setNewEnvValue('');
      toast.success(`Added ${newEnvKey} to ${selectedEnvTarget} environment`);
    }
  };

  const removeEnvVariable = (env: keyof typeof formData.env, key: string) => {
    const newEnv = { ...formData.env[env] };
    delete newEnv[key];
    setFormData({
      ...formData,
      env: {
        ...formData.env,
        [env]: newEnv,
      },
    });
  };

  const assignTeam = async () => {
    if (!selectedTeamId) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeamId}`);
      if (!response.ok) throw new Error('Failed to load team');

      const team = await response.json();

      // Convert team members to project team format
      const teamMembers = team.members.map((member: any) => ({
        name: member.agent.name,
        role: member.agent.role || 'Agent',
        email:
          member.agent.description ||
          `${member.agent.name.toLowerCase()}@ai-team.local`,
      }));

      setFormData({
        ...formData,
        team: teamMembers,
      });

      toast.success(`Assigned ${team.name} (${teamMembers.length} members)`);
      setSelectedTeamId('');
    } catch (error) {
      console.error('Failed to assign team:', error);
      toast.error('Failed to assign team');
    }
  };

  const addTeamMember = () => {
    if (newTeamMember.name && newTeamMember.email) {
      setFormData({
        ...formData,
        team: [...formData.team, newTeamMember],
      });
      setNewTeamMember({ name: '', role: '', email: '' });
      toast.success(`Added ${newTeamMember.name} to team`);
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      team: formData.team.filter((_, i) => i !== index),
    });
  };

  const addIntegration = () => {
    if (newIntegration && !formData.integrations.includes(newIntegration)) {
      setFormData({
        ...formData,
        integrations: [...formData.integrations, newIntegration],
      });
      setNewIntegration('');
      toast.success(`Added ${newIntegration} integration`);
    }
  };

  const removeIntegration = (integration: string) => {
    setFormData({
      ...formData,
      integrations: formData.integrations.filter(i => i !== integration),
    });
  };

  const addScript = () => {
    if (newScriptName && newScriptCommand) {
      setFormData({
        ...formData,
        scripts: {
          ...formData.scripts,
          [newScriptName]: newScriptCommand,
        },
      });
      setNewScriptName('');
      setNewScriptCommand('');
      toast.success(`Added script: ${newScriptName}`);
    }
  };

  const removeScript = (name: string) => {
    const newScripts = { ...formData.scripts };
    delete newScripts[name];
    setFormData({ ...formData, scripts: newScripts });
  };

  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', name: 'General', icon: Settings2 },
    { id: 'environment', name: 'Environment', icon: Globe },
    { id: 'build', name: 'Build & Deploy', icon: FolderOpen },
    { id: 'team', name: 'Team', icon: Shield },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'rateLimit', name: 'Rate Limiting', icon: Gauge },
    { id: 'mcp', name: 'MCP Servers', icon: Plug },
    { id: 'integrations', name: 'Integrations', icon: GitBranch },
    { id: 'scripts', name: 'Scripts', icon: Settings2 },
  ];

  return (
    <div className="flex gap-6">
      {/* Vertical Navigation */}
      <div className="w-[200px] flex-shrink-0">
        <nav className="space-y-1 sticky top-6">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
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
        {activeSection === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="my-project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={e =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your project..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={e =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License</Label>
                <Select
                  value={formData.license}
                  onValueChange={value =>
                    setFormData({ ...formData, license: value })
                  }
                >
                  <SelectTrigger id="license">
                    <SelectValue placeholder="Select license" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIT">MIT</SelectItem>
                    <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                    <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                    <SelectItem value="BSD-3-Clause">BSD 3-Clause</SelectItem>
                    <SelectItem value="ISC">ISC</SelectItem>
                    <SelectItem value="UNLICENSED">Proprietary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Repository</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="repo-type"
                    className="text-sm text-muted-foreground"
                  >
                    Type
                  </Label>
                  <Select
                    value={formData.repository.type}
                    onValueChange={value =>
                      setFormData({
                        ...formData,
                        repository: { ...formData.repository, type: value },
                      })
                    }
                  >
                    <SelectTrigger id="repo-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="git">Git</SelectItem>
                      <SelectItem value="svn">SVN</SelectItem>
                      <SelectItem value="mercurial">Mercurial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="repo-url"
                    className="text-sm text-muted-foreground"
                  >
                    URL
                  </Label>
                  <Input
                    id="repo-url"
                    value={formData.repository.url}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        repository: {
                          ...formData.repository,
                          url: e.target.value,
                        },
                      })
                    }
                    placeholder="https://github.com/user/repo"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Project Settings</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="auto-install"
                      className="text-sm font-normal"
                    >
                      Auto Install
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically install dependencies
                    </p>
                  </div>
                  <Switch
                    id="auto-install"
                    checked={formData.settings.autoInstall}
                    onCheckedChange={checked =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          autoInstall: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="auto-format"
                      className="text-sm font-normal"
                    >
                      Auto Format
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Format code on save
                    </p>
                  </div>
                  <Switch
                    id="auto-format"
                    checked={formData.settings.autoFormat}
                    onCheckedChange={checked =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, autoFormat: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="strict-mode"
                      className="text-sm font-normal"
                    >
                      Strict Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable strict type checking
                    </p>
                  </div>
                  <Switch
                    id="strict-mode"
                    checked={formData.settings.strictMode}
                    onCheckedChange={checked =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, strictMode: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'environment' && (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Environment Variables</Label>
                <Select
                  value={selectedEnvTarget}
                  onValueChange={(value: any) => setSelectedEnvTarget(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 p-4 border rounded-lg bg-secondary/20">
                <div className="text-sm font-medium mb-2 capitalize">
                  {selectedEnvTarget} Environment
                </div>
                {Object.entries(formData.env[selectedEnvTarget]).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 p-2 bg-background rounded"
                    >
                      <code className="flex-1 text-sm font-mono">
                        {key}={value}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          removeEnvVariable(selectedEnvTarget, key)
                        }
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ),
                )}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="KEY"
                    value={newEnvKey}
                    onChange={e => setNewEnvKey(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="VALUE"
                    value={newEnvValue}
                    onChange={e => setNewEnvValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addEnvVariable} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'build' && (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="output-dir">Output Directory</Label>
                  <Input
                    id="output-dir"
                    value={formData.build.outputDir}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        build: { ...formData.build, outputDir: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="public-dir">Public Directory</Label>
                  <Input
                    id="public-dir"
                    value={formData.build.publicDir}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        build: { ...formData.build, publicDir: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cache-dir">Cache Directory</Label>
                  <Input
                    id="cache-dir"
                    value={formData.build.cacheDir}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        build: { ...formData.build, cacheDir: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-port">Default Port</Label>
                <Input
                  id="default-port"
                  type="number"
                  value={formData.settings.defaultPort}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        defaultPort: parseInt(e.target.value) || 3000,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'team' && (
          <div className="space-y-4">
            <div className="space-y-4">
              {/* Assign Entire Team */}
              <div className="space-y-2 p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
                <Label className="text-sm font-medium">
                  Assign AI Agent Team
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Quickly assign an entire pre-configured team to this project
                </p>
                <div className="flex gap-2">
                  <Select
                    value={selectedTeamId}
                    onValueChange={setSelectedTeamId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} ({team.members?.length || 0} members)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={assignTeam}
                    disabled={!selectedTeamId}
                    className="min-w-[140px]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Team
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Individual Team Members */}
              <Label>Team Members</Label>
              <div className="space-y-2">
                {formData.team.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-secondary/30 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.role} • {member.email}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTeamMember(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Name"
                    value={newTeamMember.name}
                    onChange={e =>
                      setNewTeamMember({
                        ...newTeamMember,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Role"
                    value={newTeamMember.role}
                    onChange={e =>
                      setNewTeamMember({
                        ...newTeamMember,
                        role: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email"
                      value={newTeamMember.email}
                      onChange={e =>
                        setNewTeamMember({
                          ...newTeamMember,
                          email: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <Button onClick={addTeamMember} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'database' && (
          <div className="space-y-4">
            <DatabaseManager projectName={formData.name} />
          </div>
        )}

        {activeSection === 'rateLimit' && (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">
                    Rate Limiting Configuration
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Configure rate limits for API endpoints, server actions, and
                    external API calls
                  </p>
                </div>
              </div>

              {/* Global Settings */}
              <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="rate-limit-enabled"
                      className="text-sm font-medium"
                    >
                      Enable Rate Limiting
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Turn on rate limiting for this project
                    </p>
                  </div>
                  <Switch
                    id="rate-limit-enabled"
                    checked={formData.rateLimitConfig.enabled}
                    onCheckedChange={checked =>
                      setFormData({
                        ...formData,
                        rateLimitConfig: {
                          ...formData.rateLimitConfig,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-limit-storage">Storage Backend</Label>
                  <Select
                    value={formData.rateLimitConfig.storage}
                    onValueChange={(value: 'kv' | 'database' | 'memory') =>
                      setFormData({
                        ...formData,
                        rateLimitConfig: {
                          ...formData.rateLimitConfig,
                          storage: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="rate-limit-storage">
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
                  <p className="text-xs text-muted-foreground">
                    {formData.rateLimitConfig.storage === 'memory' &&
                      'Rate limits stored in memory (resets on restart)'}
                    {formData.rateLimitConfig.storage === 'database' &&
                      'Rate limits stored in database (persistent)'}
                    {formData.rateLimitConfig.storage === 'kv' &&
                      'Rate limits stored in Vercel KV (recommended for production)'}
                  </p>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Rate Limit Presets</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const presetName = prompt(
                        'Enter preset name (e.g., apiGeneral, aiAnalysis):',
                      );
                      if (
                        presetName &&
                        !formData.rateLimitConfig.presets[presetName]
                      ) {
                        setFormData({
                          ...formData,
                          rateLimitConfig: {
                            ...formData.rateLimitConfig,
                            presets: {
                              ...formData.rateLimitConfig.presets,
                              [presetName]: {
                                limit: 100,
                                window: 60,
                                key: `custom:${presetName}`,
                              },
                            },
                          },
                        });
                        toast.success(`Added preset: ${presetName}`);
                      } else if (presetName) {
                        toast.error('Preset name already exists');
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Preset
                  </Button>
                </div>

                {Object.keys(formData.rateLimitConfig.presets).length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    <Gauge className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No rate limit presets configured</p>
                    <p className="text-xs mt-1">
                      Click "Add Preset" to create your first rate limit
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(formData.rateLimitConfig.presets).map(
                      ([name, preset]) => (
                        <div
                          key={name}
                          className="p-4 rounded-lg border bg-secondary/20"
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Delete preset "${name}"?`)) {
                                  const newPresets = {
                                    ...formData.rateLimitConfig.presets,
                                  };
                                  delete newPresets[name];
                                  setFormData({
                                    ...formData,
                                    rateLimitConfig: {
                                      ...formData.rateLimitConfig,
                                      presets: newPresets,
                                    },
                                  });
                                  toast.success(`Deleted preset: ${name}`);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`preset-${name}-limit`}
                                className="text-xs"
                              >
                                Limit (requests)
                              </Label>
                              <Input
                                id={`preset-${name}-limit`}
                                type="number"
                                min="1"
                                value={preset.limit}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    rateLimitConfig: {
                                      ...formData.rateLimitConfig,
                                      presets: {
                                        ...formData.rateLimitConfig.presets,
                                        [name]: {
                                          ...preset,
                                          limit: parseInt(e.target.value) || 1,
                                        },
                                      },
                                    },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`preset-${name}-window`}
                                className="text-xs flex items-center gap-1"
                              >
                                <Clock className="w-3 h-3" />
                                Window (seconds)
                              </Label>
                              <Input
                                id={`preset-${name}-window`}
                                type="number"
                                min="1"
                                value={preset.window}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    rateLimitConfig: {
                                      ...formData.rateLimitConfig,
                                      presets: {
                                        ...formData.rateLimitConfig.presets,
                                        [name]: {
                                          ...preset,
                                          window: parseInt(e.target.value) || 1,
                                        },
                                      },
                                    },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`preset-${name}-key`}
                                className="text-xs"
                              >
                                Key Prefix
                              </Label>
                              <Input
                                id={`preset-${name}-key`}
                                type="text"
                                value={preset.key}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    rateLimitConfig: {
                                      ...formData.rateLimitConfig,
                                      presets: {
                                        ...formData.rateLimitConfig.presets,
                                        [name]: {
                                          ...preset,
                                          key: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                                className="font-mono text-sm"
                                placeholder="api:endpoint"
                              />
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t">
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
          </div>
        )}

        {activeSection === 'mcp' && (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Plug className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">
                    MCP (Model Context Protocol)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Configure MCP tools for the internal Flow AI agent.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-secondary/20">
                <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      AI Agent MCP Tools
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      These toggles control what the built-in Flow AI agent
                      can use for this project.
                    </div>
                  </div>
                  <Switch
                    checked={Object.values(formData.mcpServers).some(
                      s => s.enabled,
                    )}
                    onCheckedChange={async checked => {
                      const previous = formData.mcpServers;
                      const next = Object.fromEntries(
                        Object.entries(formData.mcpServers).map(([id, cfg]) => [
                          id,
                          { ...cfg, enabled: checked },
                        ]),
                      ) as typeof formData.mcpServers;

                      setFormData({ ...formData, mcpServers: next });
                      try {
                        await persistMcpServers(next);
                      } catch {
                        setFormData({ ...formData, mcpServers: previous });
                      }
                    }}
                  />
                </div>

                <div className="grid gap-3 px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(formData.mcpServers).map(
                    ([serverName, config]) => (
                      <div
                        key={serverName}
                        className="rounded-lg border border-border bg-background/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Label
                              htmlFor={`mcp-${serverName}`}
                              className="text-sm font-medium capitalize cursor-pointer"
                            >
                              {serverName}
                            </Label>
                            <div className="text-xs text-muted-foreground mt-1">
                              {config.description}
                            </div>
                          </div>

                          <Switch
                            id={`mcp-${serverName}`}
                            checked={config.enabled}
                            onCheckedChange={async checked => {
                              const previous = formData.mcpServers;
                              const next = {
                                ...formData.mcpServers,
                                [serverName]: { ...config, enabled: checked },
                              };

                              setFormData({
                                ...formData,
                                mcpServers: next,
                              });

                              try {
                                await persistMcpServers(next);
                              } catch {
                                setFormData({
                                  ...formData,
                                  mcpServers: previous,
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'integrations' && (
          <div className="space-y-4">
            <div className="space-y-4">
              <Label>Connected Integrations</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.integrations.map(integration => (
                    <Badge
                      key={integration}
                      variant="secondary"
                      className="gap-1 px-3 py-1"
                    >
                      {integration === 'github' && (
                        <GitBranch className="w-3 h-3" />
                      )}
                      {integration === 'vercel' && (
                        <Globe className="w-3 h-3" />
                      )}
                      {integration === 'sentry' && (
                        <Shield className="w-3 h-3" />
                      )}
                      {integration === 'database' && (
                        <Database className="w-3 h-3" />
                      )}
                      {!['github', 'vercel', 'sentry', 'database'].includes(
                        integration,
                      ) && <Settings2 className="w-3 h-3" />}
                      {integration}
                      <button
                        onClick={() => removeIntegration(integration)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select
                    value={newIntegration}
                    onValueChange={setNewIntegration}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select integration..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="gitlab">GitLab</SelectItem>
                      <SelectItem value="bitbucket">Bitbucket</SelectItem>
                      <SelectItem value="vercel">Vercel</SelectItem>
                      <SelectItem value="netlify">Netlify</SelectItem>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="gcp">Google Cloud</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                      <SelectItem value="sentry">Sentry</SelectItem>
                      <SelectItem value="datadog">Datadog</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="redis">Redis</SelectItem>
                      <SelectItem value="elasticsearch">
                        Elasticsearch
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addIntegration} disabled={!newIntegration}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'scripts' && (
          <div className="space-y-4">
            <div className="space-y-4">
              <Label>Project Scripts</Label>
              <div className="space-y-2">
                {Object.entries(formData.scripts).map(([name, command]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 p-3 bg-secondary/30 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm font-mono">
                        {name}
                      </div>
                      <code className="text-xs text-muted-foreground">
                        {command}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeScript(name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Script name"
                    value={newScriptName}
                    onChange={e => setNewScriptName(e.target.value)}
                    className="w-1/3"
                  />
                  <Input
                    placeholder="Command"
                    value={newScriptCommand}
                    onChange={e => setNewScriptCommand(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addScript} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
}
