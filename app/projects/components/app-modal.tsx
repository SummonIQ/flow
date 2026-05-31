'use client';
import {
  Button,
  Input,
  Label,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@summoniq/applab-ui';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  app?: {
    id?: string;
    name: string;
    description: string;
    type: string;
    devPort?: number;
    buildCommand?: string;
    devCommand?: string;
    path?: string;
  };
  onSave?: (app: any) => void | Promise<void>;
}

const appTypes = [
  {
    value: 'web-app',
    label: 'Web Application',
    description: 'Next.js, React, Vue, etc.',
  },
  {
    value: 'desktop-app',
    label: 'Desktop Application',
    description: 'Electron, Tauri',
  },
  {
    value: 'mobile-app',
    label: 'Mobile Application',
    description: 'React Native, Expo',
  },
  {
    value: 'api',
    label: 'API / Backend',
    description: 'Express, Fastify, NestJS',
  },
  {
    value: 'marketing-site',
    label: 'Marketing Site',
    description: 'Static or SSG sites',
  },
  { value: 'library', label: 'Library / Package', description: 'NPM packages' },
  {
    value: 'docs',
    label: 'Documentation',
    description: 'Docusaurus, VitePress',
  },
  { value: 'custom', label: 'Custom', description: 'Other application type' },
];

export function AppModal({
  open,
  onOpenChange,
  projectName,
  app,
  onSave,
}: AppModalProps) {
  const isEdit = !!app;
  const [formData, setFormData] = useState({
    name: app?.name || '',
    description: app?.description || '',
    type: app?.type || 'web-app',
    devPort: app?.devPort?.toString() || '',
    buildCommand: app?.buildCommand || '',
    devCommand: app?.devCommand || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPort, setSuggestedPort] = useState<number | null>(null);
  const [fetchingPort, setFetchingPort] = useState(false);

  // Fetch next available port for app type
  useEffect(() => {
    async function fetchNextPort() {
      if (!open || isEdit) return;

      setFetchingPort(true);
      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectName)}/next-port?type=${formData.type}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestedPort(data.port);
          setFormData(prev => ({
            ...prev,
            devPort: data.port?.toString() || '',
          }));
        }
      } catch (err) {
        console.error('Failed to fetch next port:', err);
      } finally {
        setFetchingPort(false);
      }
    }

    fetchNextPort();
  }, [open, formData.type, isEdit, projectName]);

  // Update form when app prop changes
  useEffect(() => {
    if (app) {
      // Handle both flat devPort and nested dev.port structures
      const port = app.devPort || (app as any).dev?.port;
      setFormData({
        name: app.name || '',
        description: app.description || '',
        type: app.type || 'web-app',
        devPort: port?.toString() || '',
        buildCommand: app.buildCommand || (app as any).build?.command || '',
        devCommand: app.devCommand || (app as any).dev?.command || '',
      });
    } else {
      // Reset form for new app
      setFormData({
        name: '',
        description: '',
        type: 'web-app',
        devPort: '',
        buildCommand: '',
        devCommand: '',
      });
    }
  }, [app, open]);

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Application name is required');
      return;
    }

    if (!formData.type) {
      setError('Application type is required');
      return;
    }

    setSaving(true);
    try {
      const appData: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        devPort: formData.devPort ? parseInt(formData.devPort) : undefined,
        buildCommand: formData.buildCommand || undefined,
        devCommand: formData.devCommand || undefined,
      };

      if (onSave) {
        await onSave(appData);
      }
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'web-app',
        devPort: '',
        buildCommand: '',
        devCommand: '',
      });
      setSuggestedPort(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save application',
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedType = appTypes.find(t => t.value === formData.type);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent variant="slide" margin="md" slideWidth="md">
        <ModalHeader
          showClose
          title={
            <ModalTitle>
              {isEdit ? 'Edit Application' : 'Add Application'}
            </ModalTitle>
          }
          description={
            isEdit
              ? `Update configuration for this app`
              : `Configure a new app for ${projectName}`
          }
        />
        <div className="bg-background flex flex-1 flex-col p-6 py-6">
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="app-name">Application Name *</Label>
              <Input
                id="app-name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="web-app"
                disabled={isEdit}
              />
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? 'Application name cannot be changed'
                  : 'A unique identifier for this app'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-description">Description</Label>
              <Textarea
                id="app-description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="A brief description of this application"
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-type">Application Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="app-type">
                  <SelectValue placeholder="Select application type" />
                </SelectTrigger>
                <SelectContent>
                  {appTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <p className="text-xs text-muted-foreground">
                  {selectedType.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dev-port">Development Port</Label>
              <Input
                id="dev-port"
                type="number"
                value={formData.devPort}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, devPort: e.target.value })
                }
                placeholder="3000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dev-command">Development Command</Label>
              <Input
                id="dev-command"
                value={formData.devCommand}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, devCommand: e.target.value })
                }
                placeholder="bun dev"
              />
              <p className="text-xs text-muted-foreground">
                Command to start the development server
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="build-command">Build Command</Label>
              <Input
                id="build-command"
                value={formData.buildCommand}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, buildCommand: e.target.value })
                }
                placeholder="bun build"
              />
              <p className="text-xs text-muted-foreground">
                Command to build the application for production
              </p>
            </div>
          </div>
        </div>
        <ModalFooter className="flex-row justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Application'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
