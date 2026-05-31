'use client';

import { RunControlButton, type RunControlState } from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/app/components/modal';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@summoniq/applab-ui';
import {
  Code2,
  Copy,
  ExternalLink,
  FolderOpen,
  Globe,
  Monitor,
  Server,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ConfigForm } from '../apps/[appName]/components/config-form';

interface AppDetailModalProps {
  projectName: string;
  appName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppDetailModal({
  projectName,
  appName,
  open,
  onOpenChange,
}: AppDetailModalProps) {
  const [app, setApp] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('console');
  const [logs, setLogs] = useState<
    { text: string; type: 'stdout' | 'stderr' | 'system'; timestamp: Date }[]
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const devPort = getAppDevPort(app);
  const runControlState: RunControlState = isRunning ? 'running' : 'stopped';
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (window.electron && appName) {
      // Clear logs when switching apps
      setLogs([]);

      const unsubscribe = window.electron.applications.onAppLog?.(
        (data: { appId: string; text: string; type: 'stdout' | 'stderr' }) => {
          if (data.appId === appName) {
            setLogs(prev => [
              ...prev,
              { text: data.text, type: data.type, timestamp: new Date() },
            ]);
            setIsRunning(true);
          }
        },
      );

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [appName]);

  useEffect(() => {
    async function loadProjectAndApp() {
      if (!appName || !open) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setActiveTab('console'); // Reset to console on open

      try {
        if (typeof window !== 'undefined' && window.electron) {
          // Get all projects
          const projects = await window.electron.projects.getAll();
          const foundProject = projects.find(
            (p: any) => p.name === projectName,
          );

          if (!foundProject) {
            setError(`Project "${projectName}" not found`);
            return;
          }

          setProject(foundProject);

          // Find the app within the project
          const foundApp = foundProject.apps?.find(
            (a: any) => a.name === appName,
          );

          if (!foundApp) {
            setError(
              `Application "${appName}" not found in project "${projectName}"`,
            );
            return;
          }

          setApp(foundApp);
        } else {
          setError('Not running in Electron environment');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load application',
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjectAndApp();
  }, [projectName, appName, open]);

  const handleLaunchApp = async (overridePath?: string | null) => {
    if (project?.path && window.electron && app) {
      let effectiveDevPort: number | null = getAppDevPort(app);

      try {
        const appsForEnsure = Array.isArray(project?.apps)
          ? project.apps
              .filter((a: any) => typeof a?.name === 'string')
              .map((a: any) => {
                const normalizedPort = getAppDevPort(a);
                return {
                  name: a.name,
                  type: a.type,
                  path: a.path,
                  description: a.description,
                  devPort: normalizedPort ?? undefined,
                };
              })
          : [];

        const ensureResponse = await fetch(
          `/api/projects/${encodeURIComponent(projectName)}/port-range`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              path: project.path,
              description: project.description,
              apps: appsForEnsure,
            }),
          },
        );

        const ensured = (await ensureResponse.json().catch(() => null)) as {
          apps?: unknown;
        } | null;

        const appsFromApi = Array.isArray(ensured?.apps)
          ? (ensured?.apps as Array<Record<string, unknown>>)
          : [];

        const match = appsFromApi.find(a => a?.name === app.name);
        const ensuredDevPort = match?.devPort;
        if (typeof ensuredDevPort === 'number') {
          effectiveDevPort = ensuredDevPort;
          setApp((prev: any) =>
            prev ? { ...prev, devPort: ensuredDevPort } : prev,
          );
        }
      } catch {
        // ignore
      }

      // Add system log
      const effectivePath = overridePath ?? app.path ?? null;
      const appPath = effectivePath
        ? `${project.path}/${effectivePath}`
        : project.path;
      setLogs(prev => [
        ...prev,
        {
          text: `$ bun run dev\n`,
          type: 'system',
          timestamp: new Date(),
        },
        {
          text: `Starting ${app.name} in ${appPath}...\n`,
          type: 'system',
          timestamp: new Date(),
        },
      ]);

      const result = await window.electron.applications.launch(
        project.path,
        app.name,
        'dev',
        overridePath ?? app.path ?? null, // Pass app.path for monorepo apps
        effectiveDevPort,
      );

      if (result.success) {
        setIsRunning(true);
        setLogs(prev => [
          ...prev,
          {
            text: `Process started (PID: ${result.pid})\n`,
            type: 'system',
            timestamp: new Date(),
          },
        ]);
        toast.success(`Launching ${app.name}...`);
      } else if (result.needsInstall && result.workingDir) {
        setLogs(prev => [
          ...prev,
          {
            text: `Dependencies not installed in ${result.workingDir}. Click Install or run: bun install\n`,
            type: 'stderr',
            timestamp: new Date(),
          },
        ]);

        toast.error(`Dependencies not installed for ${app.name}`, {
          description: 'Click Install to run bun install in the app directory.',
          duration: 15000,
          action: {
            label: 'Install',
            onClick: async () => {
              const installResult =
                await window.electron.applications.installDeps(
                  result.workingDir!,
                );
              if (installResult.success) {
                toast.success(`Dependencies installed for ${app.name}`);
              } else {
                toast.error(
                  installResult.error || 'Failed to install dependencies',
                );
              }
            },
          },
        });
      } else if (result.needsScaffold) {
        setLogs(prev => [
          ...prev,
          {
            text: `App files missing (package.json).\n`,
            type: 'stderr',
            timestamp: new Date(),
          },
        ]);

        toast.error(result.error || `App not scaffolded for ${app.name}`, {
          duration: 20000,
          action: {
            label: 'Fix & Start',
            onClick: async () => {
              const projectNameEncoded = encodeURIComponent(project.name);
              const appNameEncoded = encodeURIComponent(app.name);

              const scaffoldResponse = await fetch(
                `/api/projects/${projectNameEncoded}/apps/${appNameEncoded}/scaffold`,
                {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    projectPath: project.path,
                    type: app.type,
                    description: app.description,
                    path: app.path,
                    devPort: app.devPort,
                  }),
                },
              );

              const scaffoldJson = await scaffoldResponse
                .json()
                .catch(() => ({}));

              if (!scaffoldResponse.ok || !scaffoldJson.success) {
                toast.error(scaffoldJson.error || 'Failed to scaffold app');
                return;
              }

              const resolvedAppPath = scaffoldJson.appPath || app.path;
              const workingDir = resolvedAppPath
                ? `${project.path}/${resolvedAppPath}`
                : project.path;

              const installResult =
                await window.electron.applications.installDeps(workingDir);
              if (!installResult.success) {
                toast.error(
                  installResult.error || 'Failed to install dependencies',
                );
                return;
              }

              toast.success('App scaffolded and dependencies installed');
              handleLaunchApp(resolvedAppPath || null);
            },
          },
        });
      } else {
        setLogs(prev => [
          ...prev,
          {
            text: `Error: ${result.error}\n`,
            type: 'stderr',
            timestamp: new Date(),
          },
        ]);
        toast.error(result.error || 'Failed to launch application');
      }
    }
  };

  const handleStopApp = async () => {
    if (!project?.path || !window.electron || !app) return;

    if (typeof window.electron.applications.stop !== 'function') {
      toast.info('Stop functionality requires Electron main process update', {
        description: 'Close the terminal window to stop the app',
      });
      return;
    }

    setLogs(prev => [
      ...prev,
      {
        text: `Stopping ${app.name}...\n`,
        type: 'system',
        timestamp: new Date(),
      },
    ]);

    const result = await window.electron.applications.stop(
      project.path,
      app.name,
      app.path ?? null,
      devPort,
    );

    if (result?.success) {
      setIsRunning(false);
      toast.success(`${app.name} stopped`);
    } else {
      toast.error(result?.error || 'Failed to stop');
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleCopyLogs = () => {
    const logText = logs.map(l => l.text).join('');
    navigator.clipboard.writeText(logText);
    toast.success('Logs copied to clipboard');
  };

  const handleOpenInEditor = async () => {
    if (project?.path && window.electron && app) {
      const appPath = app.path ? `${project.path}/${app.path}` : project.path;

      const result = await window.electron.applications.openInEditor(appPath);
      if (!result.success) {
        toast.error(result.error || 'Failed to open in editor');
      } else {
        toast.success(`Opening in ${result.editor || 'editor'}...`);
      }
    }
  };

  const handleOpenTerminal = async () => {
    if (project?.path && window.electron && app) {
      const appPath = app.path ? `${project.path}/${app.path}` : project.path;

      const result = await window.electron.applications.openTerminal(appPath);
      if (!result.success) {
        toast.error(result.error || 'Failed to open terminal');
      }
    }
  };

  const handleSaveConfiguration = async (configData: any) => {
    if (!appName) return;

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/apps/${encodeURIComponent(appName)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save configuration');
      }

      toast.success('Configuration saved successfully');

      // Reload app data
      const projects = await window.electron.projects.getAll();
      const foundProject = projects.find((p: any) => p.name === projectName);
      if (foundProject) {
        const foundApp = foundProject.apps?.find(
          (a: any) => a.name === appName,
        );
        if (foundApp) {
          setApp(foundApp);
        }
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save configuration',
      );
      throw error;
    }
  };

  const getAppIcon = () => {
    if (!app) return <Globe className="w-7 h-7 text-primary" />;

    switch (app.type) {
      case 'web-app':
        return <Globe className="w-7 h-7 text-primary" />;
      case 'desktop-app':
        return <Monitor className="w-7 h-7 text-primary" />;
      case 'api':
        return <Server className="w-7 h-7 text-primary" />;
      case 'marketing-site':
        return <Sparkles className="w-7 h-7 text-primary" />;
      default:
        return <Globe className="w-7 h-7 text-primary" />;
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[1100px] max-w-[95vw] max-h-[90vh] overflow-hidden">
        <ModalHeader>
          <ModalTitle>
            {loading ? 'Loading...' : error || !app ? 'Error' : app.name}
          </ModalTitle>
          <ModalDescription>
            {loading
              ? 'Loading application...'
              : error || !app
                ? error || 'Application not found'
                : app.description ||
                  `${app.type} application in ${projectName}`}
          </ModalDescription>
        </ModalHeader>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Loading application...</div>
          </div>
        ) : error || !app ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive font-medium mb-2">
                {error || 'Application not found'}
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="text-sm text-primary hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Console-style header bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}
                  />
                  <span className="text-sm font-medium text-zinc-300">
                    {isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
                <div className="h-4 w-px bg-zinc-700" />
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="font-mono">{app.type}</span>
                  {devPort && (
                    <>
                      <span>•</span>
                      <span className="font-mono">:{devPort}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenTerminal}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <Terminal className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleOpenInEditor}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <Code2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    if (project?.path && window.electron) {
                      const appPath = app.path
                        ? `${project.path}/${app.path}`
                        : project.path;
                      window.electron.applications.openFolder(appPath);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
                <div className="h-4 w-px bg-zinc-700 mx-1" />
                <RunControlButton
                  state={runControlState}
                  size="sm"
                  onClick={() => {
                    if (isRunning) {
                      handleStopApp();
                    } else {
                      handleLaunchApp();
                    }
                  }}
                  aria-label={isRunning ? 'Stop app' : 'Start app'}
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-4 bg-zinc-900/50 border-b border-zinc-800">
                <TabsList className="h-10 bg-transparent p-0 gap-0">
                  <TabsTrigger
                    value="console"
                    className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 text-zinc-500 hover:text-zinc-300"
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    Console
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 text-zinc-500 hover:text-zinc-300"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="configuration"
                    className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 text-zinc-500 hover:text-zinc-300"
                  >
                    Config
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Console Tab */}
              <TabsContent
                value="console"
                className="flex-1 flex flex-col m-0 overflow-hidden"
              >
                {/* Console toolbar */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{logs.length} lines</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={handleCopyLogs}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                      disabled={logs.length === 0}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleClearLogs}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                      disabled={logs.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Console output */}
                <div className="flex-1 overflow-auto bg-zinc-950 p-4 font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                      <Terminal className="w-12 h-12 mb-4 opacity-30" />
                      <p className="text-sm">No output yet</p>
                      <p className="text-xs mt-1">
                        Click Start to run the application
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {logs.map((log, i) => (
                        <div
                          key={i}
                          className={`leading-relaxed whitespace-pre-wrap break-all ${
                            log.type === 'stderr'
                              ? 'text-red-400'
                              : log.type === 'system'
                                ? 'text-zinc-500'
                                : 'text-emerald-400'
                          }`}
                        >
                          {log.text}
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent
                value="details"
                className="flex-1 overflow-auto m-0 p-4 bg-zinc-950/50"
              >
                <div className="space-y-6 max-w-2xl">
                  {/* App Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Application
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                        <label className="text-xs text-zinc-500">Name</label>
                        <p className="text-sm font-medium text-zinc-200 mt-0.5">
                          {app.name}
                        </p>
                      </div>
                      <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                        <label className="text-xs text-zinc-500">Type</label>
                        <p className="text-sm font-medium text-zinc-200 mt-0.5 capitalize">
                          {app.type?.replace('-', ' ')}
                        </p>
                      </div>
                      {app.path && (
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 col-span-2">
                          <label className="text-xs text-zinc-500">Path</label>
                          <p className="text-sm font-mono text-zinc-200 mt-0.5">
                            {app.path}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dev Server */}
                  {app.dev && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Development Server
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {devPort && (
                          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                            <label className="text-xs text-zinc-500">
                              Port
                            </label>
                            <p className="text-sm font-mono text-emerald-400 mt-0.5">
                              {devPort}
                            </p>
                          </div>
                        )}
                        {app.dev.command && (
                          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                            <label className="text-xs text-zinc-500">
                              Command
                            </label>
                            <p className="text-sm font-mono text-zinc-200 mt-0.5">
                              {app.dev.command}
                            </p>
                          </div>
                        )}
                      </div>
                      {isRunning && devPort && (
                        <a
                          href={`http://localhost:${devPort}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open http://localhost:{devPort}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Build */}
                  {app.build?.command && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Build
                      </h3>
                      <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                        <label className="text-xs text-zinc-500">Command</label>
                        <p className="text-sm font-mono text-zinc-200 mt-0.5">
                          {app.build.command}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent
                value="configuration"
                className="flex-1 overflow-auto m-0 p-4 bg-zinc-950/50"
              >
                <ConfigForm
                  projectName={projectName}
                  app={app}
                  onSave={handleSaveConfiguration}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
