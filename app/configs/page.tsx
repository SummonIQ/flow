'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@summoniq/applab-ui';
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type ConfigType =
  | 'eslint'
  | 'typescript'
  | 'prettier'
  | 'tailwind'
  | 'package'
  | 'vite'
  | 'next'
  | 'custom';

type DependencyScope = 'dependencies' | 'devDependencies' | 'peerDependencies';
type DependencyType = 'npm' | 'yarn' | 'pnpm' | 'bun';

interface ConfigTemplate {
  id: string;
  name: string;
  type: ConfigType;
  description?: string;
  content: any;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Config {
  id: string;
  templateId: string;
  projectId?: string;
  appId?: string;
  content: any;
  isActive: boolean;
  syncStatus: string;
  createdAt: string;
  updatedAt: string;
  template?: ConfigTemplate;
}

interface Dependency {
  id: string;
  packageName: string;
  version: string;
  scope: DependencyScope;
  type: DependencyType;
  appType?: string;
  projectId?: string;
  appId?: string;
  description?: string;
  isRequired: boolean;
  syncStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function ConfigsPage() {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Settings2 className="w-8 h-8" />
            Configuration Management
          </span>
        }
        description="Manage ESLint, TypeScript, dependencies, and other config files across all your projects"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="configs">Active Configs</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4 mt-6">
              <TemplatesSection />
            </TabsContent>

            <TabsContent value="configs" className="space-y-4 mt-6">
              <ConfigsSection />
            </TabsContent>

            <TabsContent value="dependencies" className="space-y-4 mt-6">
              <DependenciesSection />
            </TabsContent>

            <TabsContent value="environment" className="space-y-4 mt-6">
              <EnvironmentSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Page>
  );
}

function TemplatesSection() {
  const [templates, setTemplates] = useState<ConfigTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'eslint' as ConfigType,
    description: '',
    content: '{}',
    isDefault: false,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/configs/templates');
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let parsedContent;
      try {
        parsedContent = JSON.parse(formData.content);
      } catch {
        alert('Invalid JSON in content field');
        return;
      }

      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, ...formData, content: parsedContent }
        : { ...formData, content: parsedContent };

      const res = await fetch('/api/configs/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleEdit = (template: ConfigTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      type: template.type,
      description: template.description || '',
      content: JSON.stringify(template.content, null, 2),
      isDefault: template.isDefault,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/configs/templates?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleDuplicate = (template: ConfigTemplate) => {
    setEditingId(null);
    setFormData({
      name: `${template.name} (Copy)`,
      type: template.type,
      description: template.description || '',
      content: JSON.stringify(template.content, null, 2),
      isDefault: false,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'eslint',
      description: '',
      content: '{}',
      isDefault: false,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? 'Edit Template' : 'Create Template'}
          </CardTitle>
          <CardDescription>
            Templates are reusable configuration patterns that can be applied to
            projects and apps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Default ESLint Config"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={value =>
                    setFormData({ ...formData, type: value as ConfigType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eslint">ESLint</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="prettier">Prettier</SelectItem>
                    <SelectItem value="tailwind">Tailwind</SelectItem>
                    <SelectItem value="package">Package.json</SelectItem>
                    <SelectItem value="vite">Vite</SelectItem>
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What is this template for?"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (JSON) *</Label>
              <textarea
                id="content"
                className="w-full min-h-[300px] p-3 font-mono text-sm border rounded-md bg-background"
                placeholder="Paste your config file content as JSON"
                value={formData.content}
                onChange={e =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter valid JSON configuration (will be converted to proper
                format on sync)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={e =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isDefault">Set as default template</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'} Template
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates ({templates.length})</CardTitle>
          <CardDescription>
            All available configuration templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No templates yet. Create one above to get started.
              </p>
            ) : (
              templates.map(template => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {template.type}
                        </span>
                        {template.isDefault && (
                          <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Default
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(template)}
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View content
                    </summary>
                    <div className="bg-muted p-3 rounded-md mt-2">
                      <pre className="text-xs font-mono overflow-x-auto">
                        {JSON.stringify(template.content, null, 2)}
                      </pre>
                    </div>
                  </details>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(template.createdAt).toLocaleString()}
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

function ConfigsSection() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [templates, setTemplates] = useState<ConfigTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
    fetchTemplates();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/configs');
      const data = await res.json();
      setConfigs(data);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/configs/templates');
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading configs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Configurations ({configs.length})</CardTitle>
        <CardDescription>
          Configurations applied to specific projects and apps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {configs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground mb-4">
                No active configurations yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create templates first, then apply them to projects via the
                Projects page.
              </p>
            </div>
          ) : (
            configs.map(config => (
              <div
                key={config.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {config.template?.name || 'Unknown Template'}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          config.isActive
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-gray-500/10 text-gray-600'
                        }`}
                      >
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          config.syncStatus === 'SYNCED'
                            ? 'bg-blue-500/10 text-blue-600'
                            : config.syncStatus === 'PENDING'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {config.syncStatus}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {config.projectId && `Project: ${config.projectId}`}
                      {config.appId && ` • App: ${config.appId}`}
                    </p>
                  </div>
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View configuration
                  </summary>
                  <div className="bg-muted p-3 rounded-md mt-2">
                    <pre className="text-xs font-mono overflow-x-auto">
                      {JSON.stringify(config.content, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DependenciesSection() {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    packageName: '',
    version: '',
    scope: 'dependencies' as DependencyScope,
    type: 'npm' as DependencyType,
    description: '',
    isRequired: true,
  });

  useEffect(() => {
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await fetch('/api/configs/dependencies');
      if (!res.ok) {
        throw new Error('Failed to fetch dependencies');
      }
      const data = await res.json();
      // Ensure data is an array (API might return error object)
      if (Array.isArray(data)) {
        setDependencies(data);
      } else if (data?.error) {
        console.error('API error:', data.error);
        setDependencies([]);
      } else {
        setDependencies([]);
      }
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
      // Set empty array on error
      setDependencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/configs/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        resetForm();
        fetchDependencies();
      }
    } catch (error) {
      console.error('Failed to save dependency:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dependency?')) return;

    try {
      const res = await fetch(`/api/configs/dependencies?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchDependencies();
      }
    } catch (error) {
      console.error('Failed to delete dependency:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      packageName: '',
      version: '',
      scope: 'dependencies',
      type: 'npm',
      description: '',
      isRequired: true,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading dependencies...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Dependency
          </CardTitle>
          <CardDescription>
            Add npm packages that will be synced to package.json files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageName">Package Name *</Label>
                <Input
                  id="packageName"
                  placeholder="@summoniq/applab-ui"
                  value={formData.packageName}
                  onChange={e =>
                    setFormData({ ...formData, packageName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="^1.0.0"
                  value={formData.version}
                  onChange={e =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      scope: value as DependencyScope,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dependencies">dependencies</SelectItem>
                    <SelectItem value="devDependencies">
                      devDependencies
                    </SelectItem>
                    <SelectItem value="peerDependencies">
                      peerDependencies
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What is this package used for?"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRequired"
                checked={formData.isRequired}
                onChange={e =>
                  setFormData({ ...formData, isRequired: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isRequired">Required dependency</Label>
            </div>

            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Add Dependency
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dependencies ({dependencies.length})</CardTitle>
          <CardDescription>
            All managed npm package dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dependencies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No dependencies yet. Add one above to get started.
              </p>
            ) : (
              dependencies.map(dep => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-semibold">
                        {dep.packageName}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        @{dep.version}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {dep.scope}
                      </span>
                      {dep.isRequired && (
                        <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          dep.syncStatus === 'SYNCED'
                            ? 'bg-green-500/10 text-green-600'
                            : dep.syncStatus === 'PENDING'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {dep.syncStatus}
                      </span>
                    </div>
                    {dep.description && (
                      <p className="text-xs text-muted-foreground">
                        {dep.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(dep.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function EnvironmentSection() {
  const [level, setLevel] = useState<'global' | 'project'>('global');
  const [envVariables, setEnvVariables] = useState<
    Array<{
      id: string;
      key: string;
      value: string;
      description?: string;
      isSecret: boolean;
      level: 'global' | 'project';
      projectId?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    isSecret: false,
    projectId: '',
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchEnvVariables();
  }, [level]);

  const fetchEnvVariables = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/env?level=${level}`);
      const data = await res.json();
      setEnvVariables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch environment variables:', error);
      setEnvVariables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, ...formData, level }
        : { ...formData, level };

      const res = await fetch('/api/settings/env', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        fetchEnvVariables();
      }
    } catch (error) {
      console.error('Failed to save environment variable:', error);
    }
  };

  const handleEdit = (env: (typeof envVariables)[0]) => {
    setEditingId(env.id);
    setFormData({
      key: env.key,
      value: env.value,
      description: env.description || '',
      isSecret: env.isSecret,
      projectId: env.projectId || '',
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
        fetchEnvVariables();
      }
    } catch (error) {
      console.error('Failed to delete environment variable:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      key: '',
      value: '',
      description: '',
      isSecret: false,
      projectId: '',
    });
  };

  const handleExport = () => {
    const filteredVars = envVariables.filter(env => env.level === level);
    const envString = filteredVars
      .map(env => {
        const comment = env.description ? `# ${env.description}\n` : '';
        return `${comment}${env.key}=${env.value}`;
      })
      .join('\n\n');

    const blob = new Blob([envString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = level === 'global' ? '.env.global' : '.env.local';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredVariables = envVariables.filter(env => env.level === level);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Label>Scope:</Label>
          <div className="flex gap-2">
            <Button
              variant={level === 'global' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLevel('global')}
            >
              Global
            </Button>
            <Button
              variant={level === 'project' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLevel('project')}
            >
              Project
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={filteredVariables.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export .env
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? 'Edit' : 'Add'}{' '}
            {level === 'global' ? 'Global' : 'Project'} Variable
          </CardTitle>
          <CardDescription>
            {level === 'global'
              ? 'Global variables are shared across all projects'
              : 'Project variables are specific to individual projects'}
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
                  placeholder="your-value-here"
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

            {level === 'project' && (
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  placeholder="my-project"
                  value={formData.projectId}
                  onChange={e =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                />
              </div>
            )}

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
                  <X className="w-4 h-4 mr-2" />
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
            {level === 'global' ? 'Global' : 'Project'} Variables (
            {filteredVariables.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : filteredVariables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {level} variables yet. Create one above to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVariables.map(env => (
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
                      {env.projectId && (
                        <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                          {env.projectId}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
