'use client';

import { RunControlButton, type RunControlState } from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import { Button, Card } from '@summoniq/applab-ui';
import {
  AlertCircle,
  ExternalLink,
  Globe,
  Monitor,
  RefreshCw,
  Server,
  Terminal,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type AppStatus = 'running' | 'stopped' | 'crashed' | 'starting';

interface DevServerCardProps {
  app: {
    name: string;
    type?: string;
    path?: string;
    devPort?: number;
    dev?: {
      port?: number;
      command?: string;
    };
  };
  projectPath: string;
  projectName: string;
  initialStatus?: AppStatus;
  onStatusChange?: (status: AppStatus) => void;
}

export function DevServerCard({
  app,
  projectPath,
  projectName,
  initialStatus = 'stopped',
  onStatusChange,
}: DevServerCardProps) {
  const [status, setStatus] = useState<AppStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  const devPort = getAppDevPort(app);
  const devUrl = devPort ? `http://localhost:${devPort}` : null;
  const runControlState: RunControlState =
    status === 'running'
      ? loading
        ? 'stopping'
        : 'running'
      : status === 'starting'
        ? 'starting'
        : 'stopped';

  // Listen for app status changes from Electron
  useEffect(() => {
    if (!window.electron) return;

    const unsubscribeLog = window.electron.applications.onAppLog?.(
      (data: any) => {
        if (data?.appId === app.name && data?.projectPath === projectPath) {
          setStatus('running');
          onStatusChange?.('running');
        }
      },
    );

    const unsubscribeStatus = window.electron.applications.onStatusChange?.(
      (data: any) => {
        if (data?.appId === app.name && data?.projectPath === projectPath) {
          const newStatus = data.status === 'crashed' ? 'crashed' : 'stopped';
          setStatus(newStatus);
          onStatusChange?.(newStatus);
        }
      },
    );

    return () => {
      unsubscribeLog?.();
      unsubscribeStatus?.();
    };
  }, [app.name, projectPath, onStatusChange]);

  // Sync with initial status changes from parent
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!window.electron?.applications?.checkPort) return;
    if (typeof devPort !== 'number') return;

    const port = devPort;

    let canceled = false;

    async function syncFromPort() {
      try {
        const portStatus = await window.electron.applications.checkPort(port);
        if (canceled) return;
        if (portStatus?.listening) {
          setStatus(prev => (prev === 'starting' ? prev : 'running'));
          onStatusChange?.('running');
        } else {
          setStatus(prev => (prev === 'starting' ? prev : 'stopped'));
          onStatusChange?.('stopped');
        }
      } catch {
        // ignore
      }
    }

    syncFromPort();
    const interval = setInterval(syncFromPort, 4000);
    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, [devPort, onStatusChange]);

  const handleStart = useCallback(async () => {
    if (!window.electron || !projectPath) {
      toast.error('Not running in Electron environment');
      return;
    }

    setLoading(true);
    setStatus('starting');

    try {
      const result = await window.electron.applications.launch(
        projectPath,
        app.name,
        'dev',
        app.path ?? null,
        devPort,
      );

      if (result.success) {
        setStatus('running');
        onStatusChange?.('running');
        toast.success(`${app.name} started`, {
          description: devUrl ? `Running at ${devUrl}` : undefined,
        });
      } else if (result.needsInstall) {
        setStatus('stopped');
        toast.error('Dependencies not installed', {
          description: 'Run npm/bun install first',
        });
      } else {
        setStatus('stopped');
        toast.error(result.error || 'Failed to start');
      }
    } catch (error) {
      setStatus('stopped');
      toast.error('Failed to start app');
    } finally {
      setLoading(false);
    }
  }, [projectPath, app.name, app.path, devPort, devUrl, onStatusChange]);

  const handleStop = useCallback(async () => {
    if (!window.electron || !projectPath) return;

    setLoading(true);

    try {
      // Check if stop method exists
      if (typeof window.electron.applications.stop === 'function') {
        const result = await window.electron.applications.stop(
          projectPath,
          app.name,
          app.path ?? null,
          devPort,
        );

        if (result?.success) {
          setStatus('stopped');
          onStatusChange?.('stopped');
          toast.success(`${app.name} stopped`);
        } else {
          toast.error(result?.error || 'Failed to stop');
        }

        if (typeof devPort === 'number') {
          try {
            const portStatus =
              await window.electron.applications.checkPort(devPort);
            if (portStatus?.listening) {
              setStatus('running');
              onStatusChange?.('running');
            }
          } catch {
            // ignore
          }
        }
      } else {
        // Fallback: notify user that stop isn't implemented yet
        toast.info('Stop functionality requires Electron main process update', {
          description: 'Close the terminal window to stop the app',
        });
      }
    } catch (error) {
      toast.error('Failed to stop app');
    } finally {
      setLoading(false);
    }
  }, [projectPath, app.name, app.path, devPort, onStatusChange]);

  const handleRestart = useCallback(async () => {
    await handleStop();
    setTimeout(() => handleStart(), 500);
  }, [handleStop, handleStart]);

  const handleOpenInBrowser = useCallback(() => {
    if (devUrl) {
      window.open(devUrl, '_blank', 'noopener,noreferrer');
    }
  }, [devUrl]);

  const handleOpenTerminal = useCallback(async () => {
    if (!window.electron || !projectPath) return;

    const appPath = app.path ? `${projectPath}/${app.path}` : projectPath;
    const result = await window.electron.applications.openTerminal(appPath);

    if (!result.success) {
      toast.error(result.error || 'Failed to open terminal');
    }
  }, [projectPath, app.path]);

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'bg-emerald-500';
      case 'crashed':
        return 'bg-destructive';
      case 'starting':
        return 'bg-amber-500 animate-pulse';
      default:
        return 'bg-muted-foreground/50';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'crashed':
        return 'Crashed';
      case 'starting':
        return 'Starting...';
      default:
        return 'Stopped';
    }
  };

  const getAppIcon = () => {
    switch (app.type) {
      case 'web-app':
        return <Globe className="w-5 h-5" />;
      case 'desktop-app':
        return <Monitor className="w-5 h-5" />;
      case 'api':
        return <Server className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            {getAppIcon()}
          </div>
          <div>
            <h3 className="font-semibold">{app.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-xs text-muted-foreground">
                {getStatusLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {status === 'crashed' && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="w-3 h-3" />
            Error
          </div>
        )}
      </div>

      {/* URL Display */}
      {devUrl && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div>
            <p className="text-xs text-muted-foreground">Dev Server URL</p>
            <p className="text-sm font-mono mt-0.5">{devUrl}</p>
          </div>
          {status === 'running' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenInBrowser}
              className="gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </Button>
          )}
        </div>
      )}

      {/* Port Info */}
      {devPort && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Port: <span className="font-mono text-foreground">{devPort}</span>
          </span>
          {app.dev?.command && (
            <span>
              Command:{' '}
              <span className="font-mono text-foreground">
                {app.dev.command}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <div className="flex items-center gap-2 min-w-0">
          <RunControlButton
            state={runControlState}
            size="sm"
            iconOnly
            onClick={status === 'running' ? handleStop : handleStart}
            disabled={loading || status === 'starting'}
            aria-label={
              status === 'running'
                ? 'Stop dev server'
                : status === 'starting'
                  ? 'Starting dev server'
                  : 'Start dev server'
            }
          />

          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] font-medium truncate">{app.name}</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={
                  status === 'running'
                    ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                    : status === 'starting'
                      ? 'h-1.5 w-1.5 rounded-full bg-amber-500'
                      : status === 'crashed'
                        ? 'h-1.5 w-1.5 rounded-full bg-destructive'
                        : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40'
                }
              />
              <span className="text-[10px] text-muted-foreground truncate">
                {status === 'running'
                  ? 'Running'
                  : status === 'starting'
                    ? 'Starting…'
                    : status === 'crashed'
                      ? 'Crashed'
                      : 'Stopped'}
                {devPort ? ` • :${devPort}` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            aria-label="Restart dev server"
            variant="outline"
            size="icon"
            onClick={handleRestart}
            disabled={loading || status === 'starting'}
            className="h-8 w-8 rounded-full border border-border/70 bg-gradient-to-b from-background to-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_14px_rgba(0,0,0,0.10)]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Open terminal"
            variant="outline"
            size="icon"
            onClick={handleOpenTerminal}
            className="h-8 w-8 rounded-full border border-border/70 bg-gradient-to-b from-background to-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_14px_rgba(0,0,0,0.10)]"
          >
            <Terminal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
