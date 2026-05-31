'use client';

import { RunControlButton } from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import {
  Activity,
  Box,
  Calendar,
  Circle,
  GitBranch,
  Globe,
  Monitor,
  Package,
  Server,
} from 'lucide-react';

import { ProjectSummary } from '../components/project-summary';

type RuntimeProject = {
  name: string;
  description: string;
  path?: string;
  hasConfig?: boolean;
  apps?: any[];
};

interface OverviewTabProps {
  project: RuntimeProject;
}

export function OverviewTab({ project }: OverviewTabProps) {
  const normalizeAppType = (type: string | undefined) => {
    if (!type) return undefined;
    switch (type) {
      case 'web':
        return 'web-app';
      case 'desktop':
        return 'desktop-app';
      case 'marketing':
        return 'marketing-site';
      default:
        return type;
    }
  };

  const normalizedApps =
    project.apps?.map(app => ({
      ...app,
      type: normalizeAppType(app.type),
    })) || [];

  // Count apps by type
  const webApps = normalizedApps.filter(app => app.type === 'web-app');
  const desktopApps = normalizedApps.filter(app => app.type === 'desktop-app');
  const apiApps = normalizedApps.filter(app => app.type === 'api');
  const marketingApps = normalizedApps.filter(
    app => app.type === 'marketing-site',
  );
  const totalApps = normalizedApps.length;

  // TODO: Get real running status
  const runningApps = 0;

  return (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-medium text-sm">Total Apps</h3>
          </div>
          <p className="text-2xl font-semibold">{totalApps}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {webApps.length} web, {apiApps.length} APIs, {desktopApps.length}{' '}
            desktop, {marketingApps.length} marketing
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-green-500/10">
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-medium text-sm">Running</h3>
          </div>
          <p className="text-2xl font-semibold">{runningApps}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalApps - runningApps} stopped
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-purple-500/10">
              <GitBranch className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="font-medium text-sm">Git Branch</h3>
          </div>
          <p className="text-lg font-semibold">main</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last commit: 2h ago
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-amber-500/10">
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-medium text-sm">Last Updated</h3>
          </div>
          <p className="text-lg font-semibold">Today</p>
          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
        </div>
      </div>

      {/* AI-Generated Project Summary */}
      <ProjectSummary projectName={project.name} />

      {/* All Applications Overview */}
      {totalApps > 0 && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Applications</h2>
            <div className="flex items-center gap-2">
              <RunControlButton
                state="stopped"
                size="sm"
                startLabel="Start All"
                aria-label="Start all apps"
              />
              <RunControlButton
                state="running"
                size="sm"
                stopLabel="Stop All"
                aria-label="Stop all apps"
              />
            </div>
          </div>

          <div className="space-y-3">
            {normalizedApps.map(app => {
              const isRunning = false; // TODO: Get real status
              const devPort = getAppDevPort(app);
              const getIcon = () => {
                switch (app.type) {
                  case 'web-app':
                    return <Globe className="w-5 h-5 text-blue-500" />;
                  case 'desktop-app':
                    return <Monitor className="w-5 h-5 text-purple-500" />;
                  case 'api':
                    return <Server className="w-5 h-5 text-green-500" />;
                  case 'marketing-site':
                    return <Globe className="w-5 h-5 text-pink-500" />;
                  default:
                    return <Box className="w-5 h-5 text-gray-500" />;
                }
              };

              const getIconBg = () => {
                switch (app.type) {
                  case 'web-app':
                    return 'bg-blue-500/10';
                  case 'desktop-app':
                    return 'bg-purple-500/10';
                  case 'api':
                    return 'bg-green-500/10';
                  case 'marketing-site':
                    return 'bg-pink-500/10';
                  default:
                    return 'bg-gray-500/10';
                }
              };

              return (
                <div
                  key={app.name}
                  className="flex items-center justify-between p-3 rounded-md bg-secondary/30"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-md ${getIconBg()}`}>
                      {getIcon()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{app.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                          <span className="text-xs text-muted-foreground">
                            Stopped
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">
                          {app.type}
                        </span>
                        {devPort && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              :{devPort}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <RunControlButton
                    state={isRunning ? 'running' : 'stopped'}
                    size="sm"
                    startLabel="Start"
                    stopLabel="Stop"
                    aria-label={isRunning ? 'Stop app' : 'Start app'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Information */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Project Information</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
              Path:
            </span>
            <span className="text-sm font-mono">{project.path}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
              Package Manager:
            </span>
            <span className="text-sm">Bun</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
              Node Version:
            </span>
            <span className="text-sm">v20.11.0</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
              SummonIQ Config:
            </span>
            <span className="text-sm text-green-500">✓ Configured</span>
          </div>
        </div>
      </div>

      {/* Consolidated Logs from All Apps */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Consolidated Logs</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-secondary transition-colors">
              Clear Logs
            </button>
            <button className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-secondary transition-colors">
              Export Logs
            </button>
          </div>
        </div>
        <div className="bg-black/90 rounded-md p-4 font-mono text-sm text-green-400 min-h-[300px] max-h-[500px] overflow-auto">
          <p className="text-gray-500">
            No applications running. Start an app to see logs...
          </p>
          {/* TODO: Real-time logs from all running apps will appear here */}
          {/* Example log entries when apps are running: */}
          {/* <div className="space-y-1">
            <p className="text-blue-400">[web-app] <span className="text-gray-500">12:34:56</span> <span className="text-white">Starting development server...</span></p>
            <p className="text-green-400">[api] <span className="text-gray-500">12:34:57</span> <span className="text-white">Server listening on port 3001</span></p>
            <p className="text-purple-400">[desktop-app] <span className="text-gray-500">12:34:58</span> <span className="text-white">Electron app initialized</span></p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
