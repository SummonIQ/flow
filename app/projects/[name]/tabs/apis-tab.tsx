'use client';

import { RunControlButton } from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import {
  Activity,
  Circle,
  Database,
  Globe,
  Lock,
  Plus,
  Server,
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

interface ApisTabProps {
  project: RuntimeProject;
  apps: any[];
}

export function ApisTab({ project, apps }: ApisTabProps) {
  const router = useRouter();
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const apiApps = apps;

  const handleCreateApp = async (appData: any) => {
    const isEditing = !!editingApp;
    const action = isEditing ? 'Updating' : 'Creating';
    console.log(`[ApisTab] ${action} app:`, appData);

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
          `[ApisTab] Failed to ${action.toLowerCase()} app:`,
          errorData,
        );
        throw new Error(
          errorData.error || `Failed to ${action.toLowerCase()} application`,
        );
      }

      const result = await response.json();
      console.log(
        `[ApisTab] App ${isEditing ? 'updated' : 'created'} successfully:`,
        result,
      );

      toast.success(
        `${appData.name} ${isEditing ? 'updated' : 'created'} successfully!`,
        { id: `save-app-${appData.name}` },
      );
      window.location.reload();
      setEditingApp(null);
    } catch (err) {
      console.error(`[ApisTab] Error ${action.toLowerCase()} app:`, err);
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to ${action.toLowerCase()} application`,
        { id: `save-app-${appData.name}` },
      );
    }
  };

  const handleLaunchApi = async (app: {
    name: string;
    type?: string;
    description?: string;
    path?: string;
    devPort?: number;
  }) => {
    if (project?.path && window.electron) {
      const result = await window.electron.applications.launch(
        project.path,
        app.name,
        'dev',
        app.path || null, // Pass app.path for monorepo apps
        getAppDevPort(app),
      );

      if (result.success) {
        console.log('API launched successfully:', app.name);
        alert(`Launching ${app.name}...`);
      } else {
        console.error('Failed to launch API:', result.error);
        alert(`Failed to launch ${app.name}: ${result.error}`);
      }
    }
  };

  const handleEditApp = (app: any) => {
    setEditingApp(app);
    setShowAppModal(true);
  };

  return (
    <div className="space-y-6">
      {/* API Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Server className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-medium text-sm">Total APIs</h3>
          </div>
          <p className="text-2xl font-semibold">{apiApps.length}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-green-500/10">
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-medium text-sm">Running</h3>
          </div>
          <p className="text-2xl font-semibold">0</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-amber-500/10">
              <Globe className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-medium text-sm">Endpoints</h3>
          </div>
          <p className="text-2xl font-semibold">-</p>
        </div>
      </div>

      {/* API List */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">API Services</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add API
          </button>
        </div>

        {apiApps.length > 0 ? (
          <div className="space-y-3">
            {apiApps.map(app => {
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
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Server className="w-5 h-5 text-blue-500" />
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
                      {devPort && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Globe className="w-3 h-3" />
                          <span className="text-muted-foreground">
                            localhost:{devPort}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs">
                        <Lock className="w-3 h-3" />
                        <span className="text-muted-foreground">REST</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Database className="w-3 h-3" />
                        <span className="text-muted-foreground">
                          PostgreSQL
                        </span>
                      </div>
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
                    title="Configure API"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <RunControlButton
                    onClick={e => {
                      e.stopPropagation();
                      handleLaunchApi(app);
                    }}
                    state={isRunning ? 'running' : 'stopped'}
                    size="md"
                    startLabel="Start"
                    stopLabel="Stop"
                    aria-label={isRunning ? 'Stop API' : 'Start API'}
                  />
                </div>
              </div>
            );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No API services configured yet</p>
            <p className="text-xs mt-1">Add your first API to get started</p>
          </div>
        )}
      </div>

      {/* API Features */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">API Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
            <div className="p-2 rounded-md bg-primary/10 mt-0.5">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Authentication</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure API authentication and authorization
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
            <div className="p-2 rounded-md bg-primary/10 mt-0.5">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Rate Limiting</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Set up rate limits and throttling rules
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
            <div className="p-2 rounded-md bg-primary/10 mt-0.5">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Database</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Manage database connections and migrations
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
            <div className="p-2 rounded-md bg-primary/10 mt-0.5">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Monitoring</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Track API performance and health metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Logs Section - Placeholder for future implementation */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Real-time Logs</h2>
        <div className="bg-black/90 rounded-md p-4 font-mono text-sm text-green-400 min-h-[200px]">
          <p className="text-gray-500">
            No APIs running. Start an API to see logs...
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
