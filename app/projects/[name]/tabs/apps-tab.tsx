'use client';

import { RunControlButton } from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import { Report, type ReportColumnDefinition } from '@summoniq/applab-ui';
import {
  Box,
  FileText,
  Globe,
  Monitor,
  Package,
  Plus,
  Server,
  Settings,
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type RuntimeProject = {
  name: string;
  description: string;
  path?: string;
  hasConfig?: boolean;
  apps?: any[];
};

interface AppsTabProps {
  project: RuntimeProject;
}

const typeIcons: Record<string, any> = {
  'web-app': Globe,
  'desktop-app': Monitor,
  'mobile-app': Smartphone,
  api: Server,
  'marketing-site': FileText,
  library: Package,
  monorepo: Box,
};

export function AppsTab({ project }: AppsTabProps) {
  const router = useRouter();

  const apps = useMemo(() => project.apps || [], [project.apps]);
  const analyticsTargetApp = useMemo(
    () => apps.find(app => app.type === 'web-app') ?? apps[0] ?? null,
    [apps],
  );
  const [launchingByName, setLaunchingByName] = useState<
    Record<string, boolean>
  >({});
  const [runningByName, setRunningByName] = useState<Record<string, boolean>>(
    {},
  );
  // Track apps started by Flow vs detected externally
  const [startedByFlow, setStartedByFlow] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (!window.electron?.applications?.checkPort) return;
    if (!Array.isArray(apps) || apps.length === 0) return;

    let canceled = false;

    async function syncFromPorts() {
      const updates: Array<{ name: string; listening: boolean }> = [];
      await Promise.all(
        apps.map(async (app: any) => {
          const port = getAppDevPort(app);
          if (typeof port !== 'number') return;
          try {
            const portStatus =
              await window.electron.applications.checkPort(port);
            updates.push({
              name: String(app.name),
              listening: Boolean(portStatus?.listening),
            });
          } catch {
            // ignore
          }
        }),
      );

      if (canceled) return;
      if (updates.length === 0) return;
      setRunningByName(prev => {
        const next = { ...prev };
        for (const u of updates) next[u.name] = u.listening;
        return next;
      });
      // Detect externally-started apps
      setStartedByFlow(prev => {
        const next = { ...prev };
        for (const u of updates) {
          if (u.listening && prev[u.name] === undefined) {
            next[u.name] = false; // External
          }
        }
        return next;
      });
    }

    syncFromPorts();
    const interval = setInterval(syncFromPorts, 5000);
    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, [apps]);

  // Define columns for the Report component
  const appColumns: ReportColumnDefinition<any>[] = [
    {
      key: 'launch',
      header: '',
      width: '140px',
      cellFn: app => {
        const name = String(app?.name || '');
        const isRunning = Boolean(runningByName[name]);
        const isLaunching = Boolean(launchingByName[name]);
        const isStopping = isLaunching && isRunning;
        const state = isStopping
          ? 'stopping'
          : isLaunching
            ? 'starting'
            : isRunning
              ? 'running'
              : 'stopped';

        return (
          <div className="flex items-center" onClick={e => e.stopPropagation()}>
            <RunControlButton
              onClick={e => {
                e.stopPropagation();
                if (!name) return;

                if (isRunning) {
                  void handleStopApp(app);
                  return;
                }
                void handleLaunchApp(app);
              }}
              state={state}
              size="sm"
              loading={isLaunching}
              aria-label={isRunning ? 'Stop app' : 'Start app'}
              startingLabel="Starting..."
              stoppingLabel="Stopping..."
            />
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cellFn: app => {
        const name = String(app?.name || '');
        const isRunning = Boolean(runningByName[name]);
        const isExternal = isRunning && startedByFlow[name] === false;
        return (
          <span className="font-medium truncate flex items-center gap-1.5">
            {app.displayName || app.friendlyName || app.name}
            {isExternal && (
              <span
                title="Started outside of Flow"
                className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium"
              >
                External
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      cellFn: app => (
        <span className="text-muted-foreground">{app.description || '—'}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      cellFn: app => {
        const AppIcon = typeIcons[app.type] || Box;
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs font-medium capitalize">
            <AppIcon className="size-3.5" />
            {app.type?.replace('-', ' ') || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'devPort',
      header: 'Port',
      align: 'center',
      sortable: true,
      cellFn: app =>
        getAppDevPort(app) ? (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-mono">
            {getAppDevPort(app)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: 'Actions',
      align: 'right',
      cellFn: app => (
        <div
          className="flex items-center justify-end gap-2"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="p-2 rounded-md hover:bg-secondary transition-colors"
            title="Configure app"
            onClick={e => {
              e.stopPropagation();
              // Handle settings
            }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleRowClick = (app: any) => {
    const encodedProjectName = encodeURIComponent(String(project?.name || ''));
    const encodedAppName = encodeURIComponent(String(app?.name || ''));
    router.push(`/projects/${encodedProjectName}/apps/${encodedAppName}`);
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
      const appNameValue = String(app.name);
      setLaunchingByName(prev => ({ ...prev, [appNameValue]: true }));
      console.log('Launching app:', {
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
        console.log('App launched successfully:', app.name);
        toast.success(result.message || `${app.name} started successfully`, {
          id: `launch-${app.name}`,
          description: result.pid ? `Process ID: ${result.pid}` : undefined,
        });
        setRunningByName(prev => ({ ...prev, [appNameValue]: true }));
        // Mark as started by Flow (not external)
        setStartedByFlow(prev => ({ ...prev, [appNameValue]: true }));
      } else {
        console.error('Failed to launch app:', result.error);
        toast.error(result.error || `Failed to launch ${app.name}`, {
          id: `launch-${app.name}`,
        });
      }

      setLaunchingByName(prev => ({ ...prev, [appNameValue]: false }));
    }
  };

  const handleStopApp = async (app: {
    name: string;
    path?: string;
    devPort?: number;
  }) => {
    if (!project?.path || !window.electron?.applications?.stop) return;
    const appNameValue = String(app.name);

    setLaunchingByName(prev => ({ ...prev, [appNameValue]: true }));
    try {
      const result = await window.electron.applications.stop(
        project.path,
        app.name,
        app.path || null,
        getAppDevPort(app),
      );

      if (result?.success) {
        toast.success(`${app.name} stopped`, { id: `stop-${app.name}` });
        setRunningByName(prev => ({ ...prev, [appNameValue]: false }));
      } else {
        toast.error(result?.error || `Failed to stop ${app.name}`, {
          id: `stop-${app.name}`,
        });
      }
    } finally {
      setLaunchingByName(prev => ({ ...prev, [appNameValue]: false }));
    }
  };

  const handleSetupAnalytics = useCallback(() => {
    if (!analyticsTargetApp) return;
    const encodedProject = encodeURIComponent(project.name);
    const encodedApp = encodeURIComponent(analyticsTargetApp.name);
    router.push(`/projects/${encodedProject}/apps/${encodedApp}?tab=metrics`);
  }, [analyticsTargetApp, project.name, router]);

  const handleViewAnalytics = useCallback(() => {
    router.push('/analytics');
  }, [router]);

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Analytics & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Analytics</h2>
            <button
              className="text-xs text-primary hover:underline"
              onClick={handleViewAnalytics}
            >
              View
            </button>
          </div>
          <div className="h-[128px] flex items-center justify-center border border-dashed border-border rounded-md">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                No analytics data yet
              </p>
              <button
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSetupAnalytics}
                disabled={!analyticsTargetApp}
              >
                Setup Analytics
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Quick Stats</h2>
            <span className="text-[10px] text-muted-foreground">Today</span>
          </div>
          <div className="divide-y divide-border rounded-md border border-border">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Active Users
              </span>
              <span className="text-sm font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">Events</span>
              <span className="text-sm font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">Errors</span>
              <span className="text-sm font-semibold text-emerald-500">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Report */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Applications Report</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {project.apps?.length || 0} application
              {project.apps?.length !== 1 ? 's' : ''} configured
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add App
          </button>
        </div>

        <Report
          data={apps}
          definition={{
            columns: appColumns,
            activeFilters: [],
            filters: [],
            sortBy: 'name',
            view: 'table' as any,
            data: apps,
          }}
          onRowClick={handleRowClick}
          emptyState={{
            title: 'No applications configured yet',
            description: 'Add your first app to get started',
            illustration: <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />,
            actions: (
              <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Add App
              </button>
            ),
          }}
          className="h-auto"
          contentClassName=""
        />
      </div>
    </div>
  );
}
