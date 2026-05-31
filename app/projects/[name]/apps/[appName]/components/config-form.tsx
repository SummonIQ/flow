'use client';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@summoniq/applab-ui';
import { Check, Copy, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ConfigFormProps {
  projectName: string;
  app: any;
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export function ConfigForm({
  projectName,
  app,
  onSave,
  onCancel,
}: ConfigFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'web-app',
    path: '',
    dev: {
      port: 3000,
      command: 'bun dev',
      env: {} as Record<string, string>,
    },
    build: {
      command: 'bun build',
      outputDir: 'dist',
      env: {} as Record<string, string>,
    },
    deploy: {
      provider: '',
      url: '',
      branch: 'main',
    },
    scripts: {} as Record<string, string>,
    dependencies: [] as string[],
    features: [] as string[],
  });

  const [saving, setSaving] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptCommand, setNewScriptCommand] = useState('');
  const [newDependency, setNewDependency] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (app) {
      setFormData({
        name: app.name || '',
        description: app.description || '',
        type: app.type || 'web-app',
        path: app.path || '',
        dev: {
          port: app.dev?.port || app.devPort || 3000,
          command: app.dev?.command || app.devCommand || 'bun dev',
          env: app.dev?.env || {},
        },
        build: {
          command: app.build?.command || app.buildCommand || 'bun build',
          outputDir: app.build?.outputDir || 'dist',
          env: app.build?.env || {},
        },
        deploy: {
          provider: app.deploy?.provider || '',
          url: app.deploy?.url || '',
          branch: app.deploy?.branch || 'main',
        },
        scripts: app.scripts || {},
        dependencies: app.dependencies || [],
        features: app.features || [],
      });
    }
  }, [app]);

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('App name is required');
      return;
    }

    setSaving(true);
    try {
      await onSave?.(formData);
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addEnvVariable = (target: 'dev' | 'build') => {
    if (newEnvKey && newEnvValue) {
      setFormData({
        ...formData,
        [target]: {
          ...formData[target],
          env: {
            ...formData[target].env,
            [newEnvKey]: newEnvValue,
          },
        },
      });
      setNewEnvKey('');
      setNewEnvValue('');
      toast.success(`Added ${newEnvKey} to ${target} environment`);
    }
  };

  const removeEnvVariable = (target: 'dev' | 'build', key: string) => {
    const newEnv = { ...formData[target].env };
    delete newEnv[key];
    setFormData({
      ...formData,
      [target]: {
        ...formData[target],
        env: newEnv,
      },
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

  const addDependency = () => {
    if (newDependency && !formData.dependencies.includes(newDependency)) {
      setFormData({
        ...formData,
        dependencies: [...formData.dependencies, newDependency],
      });
      setNewDependency('');
      toast.success(`Added dependency: ${newDependency}`);
    }
  };

  const removeDependency = (dep: string) => {
    setFormData({
      ...formData,
      dependencies: formData.dependencies.filter(d => d !== dep),
    });
  };

  const addFeature = () => {
    if (newFeature && !formData.features.includes(newFeature)) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature],
      });
      setNewFeature('');
      toast.success(`Added feature: ${newFeature}`);
    }
  };

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== feature),
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Configuration</CardTitle>
          <CardDescription>
            Edit all configuration settings for{' '}
            {formData.name || 'this application'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="build">Build</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Application Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="my-app"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Application Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-app">Web Application</SelectItem>
                      <SelectItem value="desktop-app">
                        Desktop Application
                      </SelectItem>
                      <SelectItem value="mobile-app">
                        Mobile Application
                      </SelectItem>
                      <SelectItem value="api">API / Backend</SelectItem>
                      <SelectItem value="marketing-site">
                        Marketing Site
                      </SelectItem>
                      <SelectItem value="library">Library / Package</SelectItem>
                      <SelectItem value="docs">Documentation</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
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
                  placeholder="Describe your application..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="path">Application Path</Label>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={e =>
                    setFormData({ ...formData, path: e.target.value })
                  }
                  placeholder="apps/my-app"
                />
                <p className="text-xs text-muted-foreground">
                  Relative path from project root. Leave empty for root.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="development" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dev-port">Development Port</Label>
                  <Input
                    id="dev-port"
                    type="number"
                    value={formData.dev.port}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        dev: {
                          ...formData.dev,
                          port: parseInt(e.target.value) || 3000,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dev-command">Development Command</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dev-command"
                      value={formData.dev.command}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          dev: { ...formData.dev, command: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(formData.dev.command, 'dev-command')
                      }
                    >
                      {copiedField === 'dev-command' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Development Environment Variables</Label>
                <div className="space-y-2">
                  {Object.entries(formData.dev.env).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 p-2 bg-secondary/30 rounded"
                    >
                      <code className="flex-1 text-sm">
                        {key}={value}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeEnvVariable('dev', key)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
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
                    <Button onClick={() => addEnvVariable('dev')} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="build" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="build-command">Build Command</Label>
                  <div className="flex gap-2">
                    <Input
                      id="build-command"
                      value={formData.build.command}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          build: { ...formData.build, command: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(formData.build.command, 'build-command')
                      }
                    >
                      {copiedField === 'build-command' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
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
              </div>

              <div className="space-y-2">
                <Label>Build Environment Variables</Label>
                <div className="space-y-2">
                  {Object.entries(formData.build.env).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 p-2 bg-secondary/30 rounded"
                    >
                      <code className="flex-1 text-sm">
                        {key}={value}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeEnvVariable('build', key)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
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
                    <Button onClick={() => addEnvVariable('build')} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deployment" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Deployment Provider</Label>
                  <Select
                    value={formData.deploy.provider}
                    onValueChange={value =>
                      setFormData({
                        ...formData,
                        deploy: { ...formData.deploy, provider: value },
                      })
                    }
                  >
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="vercel">Vercel</SelectItem>
                      <SelectItem value="netlify">Netlify</SelectItem>
                      <SelectItem value="cloudflare">
                        Cloudflare Pages
                      </SelectItem>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="gcp">Google Cloud</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Deployment Branch</Label>
                  <Input
                    id="branch"
                    value={formData.deploy.branch}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        deploy: { ...formData.deploy, branch: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deploy-url">Deployment URL</Label>
                <Input
                  id="deploy-url"
                  value={formData.deploy.url}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      deploy: { ...formData.deploy, url: e.target.value },
                    })
                  }
                  placeholder="https://my-app.vercel.app"
                />
              </div>
            </TabsContent>

            <TabsContent value="scripts" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Custom Scripts</Label>
                <div className="space-y-2">
                  {Object.entries(formData.scripts).map(([name, command]) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 p-3 bg-secondary/30 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{name}</div>
                        <code className="text-xs text-muted-foreground">
                          {command}
                        </code>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(command, `script-${name}`)
                        }
                      >
                        {copiedField === `script-${name}` ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
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
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Dependencies</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.dependencies.map(dep => (
                      <Badge key={dep} variant="secondary" className="gap-1">
                        {dep}
                        <button
                          onClick={() => removeDependency(dep)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Package name (e.g., react@18.2.0)"
                      value={newDependency}
                      onChange={e => setNewDependency(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addDependency} size="sm">
                      <Plus className="w-4 h-4" />
                      Add Dependency
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features & Capabilities</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map(feature => (
                      <Badge key={feature} variant="outline" className="gap-1">
                        {feature}
                        <button
                          onClick={() => removeFeature(feature)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Feature name (e.g., authentication, payments)"
                      value={newFeature}
                      onChange={e => setNewFeature(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addFeature} size="sm">
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Raw Configuration (JSON)</Label>
                <Textarea
                  value={JSON.stringify(formData, null, 2)}
                  onChange={e => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(parsed);
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="font-mono text-xs"
                  rows={10}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
