'use client';

import { RunControlButton } from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import { Button } from '@summoniq/applab-ui';
import {
  Activity,
  Circle,
  Code,
  FolderOpen,
  Globe,
  Package,
  Plus,
  Settings,
  Terminal,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppModal } from '../../components/app-modal';

type RuntimeProject = {
  name: string;
  description: string;
  path?: string;
  hasConfig?: boolean;
  apps?: any[];
};

interface WebAppsTabProps {
  project: RuntimeProject;
  apps: any[];
}

export function WebAppsTab({ project, apps }: WebAppsTabProps) {
  const router = useRouter();
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);

  const handleCreateApp = async (appData: any) => {
    const isEditing = !!editingApp;
    const action = isEditing ? 'Updating' : 'Creating';
    console.log(`[WebAppsTab] ${action} app:`, appData);

    toast.loading(`${action} ${appData.name}...`, {
      id: `save-app-${appData.name}`,
    });

    try {
      if (isEditing) {
        // Update existing app
        const response = await fetch(
          `/api/projects/${encodeURIComponent(project.name)}/apps/${encodeURIComponent(editingApp.name)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update app');
        }

        const result = await response.json();

        toast.success(`${appData.name} updated successfully`, {
          id: `save-app-${appData.name}`,
          description: 'App configuration has been updated',
        });
      } else {
        // Create new app
        const response = await fetch(
          `/api/projects/${encodeURIComponent(project.name)}/apps`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create app');
        }

        const result = await response.json();

        toast.success(`${appData.name} created successfully`, {
          id: `save-app-${appData.name}`,
          description: 'App configuration has been added to the project',
        });
      }

      // Refresh the page to show the changes
      router.refresh();
      setEditingApp(null);
    } catch (error) {
      console.error(`[WebAppsTab] Error ${action.toLowerCase()} app:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${action.toLowerCase()} app`,
        {
          id: `save-app-${appData.name}`,
        },
      );
    }
  };

  const handleEditApp = (app: any) => {
    setEditingApp(app);
    setShowAppModal(true);
  };

  const handleOpenInEditor = async () => {
    if (project?.path && window.electron) {
      const result = await window.electron.applications.openInEditor(
        project.path,
      );
      if (!result.success) {
        console.error('Failed to open in editor:', result.error);
        toast.error(result.error || 'Failed to open in editor');
      } else {
        toast.success(`Opening in ${result.editor || 'editor'}...`);
      }
    }
  };

  const handleOpenFolder = async () => {
    if (project?.path && window.electron) {
      const result = await window.electron.applications.openFolder(
        project.path,
      );
      if (!result.success) {
        console.error('Failed to open folder:', result.error);
      }
    }
  };

  const handleOpenTerminal = async () => {
    if (project?.path && window.electron) {
      const result = await window.electron.applications.openTerminal(
        project.path,
      );
      if (!result.success) {
        console.error('Failed to open terminal:', result.error);
      }
    }
  };

  const handleLaunchApp = async (app: {
    name: string;
    type?: string;
    description?: string;
    path?: string;
    devPort?: number;
  }) => {
    if (project?.path && window.electron) {
      console.log('Launching web app:', {
        app: app.name,
        projectPath: project.path,
        appPath: app.path,
      });

      toast.loading(`Starting ${app.name}...`, { id: `launch-${app.name}` });

      const result = await window.electron.applications.launch(
        project.path,
        app.name,
        'dev',
        app.path || null, // Pass app.path for monorepo apps
        getAppDevPort(app),
      );

      if (result.success) {
        console.log('Web app launched successfully:', app.name);
        toast.success(result.message || `${app.name} started successfully`, {
          id: `launch-${app.name}`,
          description: result.pid ? `Process ID: ${result.pid}` : undefined,
        });
      } else {
        console.error('Failed to launch web app:', result.error);
        toast.error(result.error || `Failed to launch ${app.name}`, {
          id: `launch-${app.name}`,
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Add App Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingApp(null);
            setShowAppModal(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Web App
        </Button>
      </div>

      {apps.map(app => {
        const isRunning = false; // TODO: Get real status
        const devPort = getAppDevPort(app);
        return (
          <div
            key={app.name}
            onClick={() =>
              router.push(
                `/projects/${encodeURIComponent(project.name)}/apps/${encodeURIComponent(app.name)}`,
              )
            }
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all group cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-lg font-semibold">{app.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <Circle
                        className={`w-2 h-2 ${isRunning ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {isRunning ? 'Running' : 'Stopped'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {app.description}
                  </p>

                  {/* Detailed Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Next.js 15
                      </span>
                    </div>
                    {devPort && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          :{devPort}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Bun</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        TypeScript
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Action Button */}
              <RunControlButton
                onClick={e => {
                  e.stopPropagation();
                  handleLaunchApp(app);
                }}
                state={isRunning ? 'running' : 'stopped'}
                size="md"
                startLabel="Launch"
                stopLabel="Stop"
                aria-label={isRunning ? 'Stop app' : 'Launch app'}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleOpenInEditor();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                Open in Editor
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleOpenTerminal();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                Terminal
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleOpenFolder();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Browse
              </button>
              <div className="flex-1" />
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleEditApp(app);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition-colors text-muted-foreground"
                title="Configure"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {/* App Modal */}
      <AppModal
        open={showAppModal}
        onOpenChange={open => {
          setShowAppModal(open);
          if (!open) setEditingApp(null);
        }}
        projectName={project.name}
        app={editingApp}
        onSave={handleCreateApp}
      />
    </div>
  );
}
