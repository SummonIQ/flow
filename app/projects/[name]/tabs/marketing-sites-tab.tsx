'use client';

import { RunControlButton } from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import {
  BarChart3,
  Circle,
  ExternalLink,
  FileText,
  Globe,
  Image,
  Palette,
  Plus,
  Search,
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

interface MarketingSitesTabProps {
  project: RuntimeProject;
  apps: any[];
}

export function MarketingSitesTab({ project, apps }: MarketingSitesTabProps) {
  const router = useRouter();
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const marketingApps = apps;

  const handleCreateApp = async (appData: any) => {
    const isEditing = !!editingApp;
    const action = isEditing ? 'Updating' : 'Creating';
    console.log(`[MarketingSitesTab] ${action} app:`, appData);

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
        throw new Error(
          errorData.error || `Failed to ${action.toLowerCase()} application`,
        );
      }

      const result = await response.json();
      toast.success(
        `${appData.name} ${isEditing ? 'updated' : 'created'} successfully!`,
        { id: `save-app-${appData.name}` },
      );
      window.location.reload();
      setEditingApp(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to ${action.toLowerCase()} application`,
        { id: `save-app-${appData.name}` },
      );
    }
  };

  const handleEditApp = (app: any) => {
    setEditingApp(app);
    setShowAppModal(true);
  };

  const handleLaunchSite = async (app: {
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
        console.log('Marketing site launched successfully:', app.name);
        alert(`Launching ${app.name}...`);
      } else {
        console.error('Failed to launch marketing site:', result.error);
        alert(`Failed to launch ${app.name}: ${result.error}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Marketing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-purple-500/10">
              <Globe className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="font-medium text-sm">Web Apps</h3>
          </div>
          <p className="text-2xl font-semibold">{marketingApps.length}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-green-500/10">
              <FileText className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-medium text-sm">Pages</h3>
          </div>
          <p className="text-2xl font-semibold">-</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-blue-500/10">
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-medium text-sm">Analytics</h3>
          </div>
          <p className="text-2xl font-semibold">-</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-amber-500/10">
              <Search className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-medium text-sm">SEO Score</h3>
          </div>
          <p className="text-2xl font-semibold">-</p>
        </div>
      </div>

      {/* Marketing Sites List */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Marketing Sites & Web Apps</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Marketing Site
          </button>
        </div>

        {marketingApps.length > 0 ? (
          <div className="space-y-3">
            {marketingApps.map(app => {
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
                    <Globe className="w-5 h-5 text-purple-500" />
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
                        <FileText className="w-3 h-3" />
                        <span className="text-muted-foreground">Next.js</span>
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
                    onClick={e => e.stopPropagation()}
                    className="p-2 rounded-md hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                    title="View web app"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleEditApp(app);
                    }}
                    className="p-2 rounded-md hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                    title="Configure site"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <RunControlButton
                    onClick={e => {
                      e.stopPropagation();
                      handleLaunchSite(app);
                    }}
                    state={isRunning ? 'running' : 'stopped'}
                    size="md"
                    startLabel="Launch"
                    stopLabel="Stop"
                    aria-label={isRunning ? 'Stop site' : 'Launch site'}
                  />
                </div>
              </div>
            );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              No marketing sites or web apps configured yet
            </p>
            <p className="text-xs mt-1">
              Add your first marketing site or web app to get started
            </p>
          </div>
        )}
      </div>

      {/* Marketing Features */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Marketing Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
            <div className="p-2 rounded-md bg-primary/10 mt-0.5">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">SEO Optimization</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure meta tags, sitemaps, and search optimization
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
            <div className="p-2 rounded-md bg-primary/10 mt-0.5">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Analytics</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Track visitor metrics and conversion rates
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
            <div className="p-2 rounded-md bg-primary/10 mt-0.5">
              <Image className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Media Management</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Optimize and manage images and media assets
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
            <div className="p-2 rounded-md bg-primary/10 mt-0.5">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Design System</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Manage colors, typography, and brand assets
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
            No marketing sites running. Launch a site to see logs...
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
