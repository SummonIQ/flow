'use client';

import { RunControlButton } from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import { Button } from '@summoniq/applab-ui';
import {
  Activity,
  Circle,
  Monitor,
  Plus,
  Settings,
  Terminal,
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

interface DesktopAppsTabProps {
  project: RuntimeProject;
  apps: any[];
}

export function DesktopAppsTab({ project, apps }: DesktopAppsTabProps) {
  const router = useRouter();
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);

  const handleCreateApp = async (appData: any) => {
    const isEditing = !!editingApp;
    const action = isEditing ? 'Updating' : 'Creating';
    console.log(`[DesktopAppsTab] ${action} app:`, appData);

    toast.loading(`${action} ${appData.name}...`, {
      id: `save-app-${appData.name}`,
    });

    try {
      let response;
      if (isEditing) {
        // Update existing app
        response = await fetch(
          `/api/projects/${encodeURIComponent(project.name)}/apps/${encodeURIComponent(editingApp.name)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData),
          },
        );
      } else {
        // Create new app
        response = await fetch(
          `/api/projects/${encodeURIComponent(project.name)}/apps`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData),
          },
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `[DesktopAppsTab] Failed to ${action.toLowerCase()} app:`,
          errorData,
        );
        toast.error(
          errorData.error || `Failed to ${action.toLowerCase()} application`,
          { id: `save-app-${appData.name}` },
        );
        throw new Error(
          errorData.error || `Failed to ${action.toLowerCase()} application`,
        );
      }

      const result = await response.json();
      console.log(
        `[DesktopAppsTab] App ${isEditing ? 'updated' : 'created'} successfully:`,
        result,
      );

      toast.success(
        `${appData.name} ${isEditing ? 'updated' : 'created'} successfully!`,
        { id: `save-app-${appData.name}` },
      );
      window.location.reload();
      setEditingApp(null);
    } catch (err) {
      console.error(`[DesktopAppsTab] Error ${action.toLowerCase()} app:`, err);
      if (
        !(
          err instanceof Error &&
          err.message.includes(`Failed to ${action.toLowerCase()}`)
        )
      ) {
        toast.error(
          err instanceof Error
            ? err.message
            : `Failed to ${action.toLowerCase()} application`,
          { id: `save-app-${appData.name}` },
        );
      }
    }
  };

  const handleEditApp = (app: any) => {
    setEditingApp(app);
    setShowAppModal(true);
  };

  const handleLaunchApp = async (app: {
    name: string;
    type?: string;
    description?: string;
    path?: string;
    devPort?: number;
  }) => {
    if (project?.path && window.electron) {
      console.log('Launching desktop app:', {
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
        console.log('Desktop app launched successfully:', app.name);
        toast.success(result.message || `${app.name} started successfully`, {
          id: `launch-${app.name}`,
          description: result.pid ? `Process ID: ${result.pid}` : undefined,
        });
      } else {
        console.error('Failed to launch desktop app:', result.error);
        toast.error(result.error || `Failed to launch ${app.name}`, {
          id: `launch-${app.name}`,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Desktop Apps List */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Desktop Applications</h2>
          <Button
            onClick={() => {
              setEditingApp(null);
              setShowAppModal(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Desktop App
          </Button>
        </div>

        <div className="space-y-3">
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
                className="flex items-center justify-between p-4 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
              >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-md bg-purple-500/10">
                  <Monitor className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{app.name}</h3>
                    {/* TODO: Get real status */}
                    <div className="flex items-center gap-1.5">
                      <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                      <span className="text-xs text-muted-foreground">
                        Stopped
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Activity className="w-3 h-3" />
                      <span className="text-muted-foreground">Electron</span>
                    </div>
                    {devPort && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground">
                          Port: {devPort}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => e.stopPropagation()}
                  className="p-2 rounded-md hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title="View logs"
                >
                  <Terminal className="w-4 h-4" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleEditApp(app);
                  }}
                  className="p-2 rounded-md hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title="Configure desktop app"
                >
                  <Settings className="w-4 h-4" />
                </button>
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
            </div>
          );
          })}
        </div>
      </div>

      {/* Real-time Logs Section - Placeholder for future implementation */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Real-time Logs</h2>
        <div className="bg-black/90 rounded-md p-4 font-mono text-sm text-green-400 min-h-[200px]">
          <p className="text-gray-500">
            No applications running. Launch an app to see logs...
          </p>
        </div>
      </div>

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
