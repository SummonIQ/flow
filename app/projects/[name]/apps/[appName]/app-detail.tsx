'use client';

import {
  RunControlButton,
  type RunControlState,
} from '@/components/runtime/run-control-button';
import { getAppDevPort } from '@/lib/ports';
import { getPageRoute } from '@/lib/studio/codegen';
import { cn } from '@/lib/utils';
import type { Page, Project } from '@/types/studio/builder';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@summoniq/applab-ui';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Copy,
  Eye,
  FileCode,
  Folder,
  Globe,
  Layout,
  Monitor,
  Palette,
  Plus,
  Server,
  Sparkles,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { ConfigForm } from './components/config-form';

interface AppDetailProps {
  projectName: string;
  appName: string;
}

type AppPageSummary = {
  id: string;
  name: string;
  route: string;
  updatedAt: number;
  type: Page['type'];
  source?: 'designer' | 'nextjs';
};

type PreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

type PageFolder = {
  name: string;
  path: string[];
  folders: Map<string, PageFolder>;
  pages: AppPageSummary[];
};

const VALID_TABS = new Set([
  'overview',
  'pages',
  'configuration',
  'logs',
  'metrics',
]);

const countFolderPages = (folder: PageFolder): number => {
  let total = folder.pages.length;
  folder.folders.forEach(child => {
    total += countFolderPages(child);
  });
  return total;
};

export function AppDetail({ projectName, appName }: AppDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [app, setApp] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [designerPages, setDesignerPages] = useState<AppPageSummary[]>([]);
  const [selectedPage, setSelectedPage] = useState<AppPageSummary | null>(null);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);
  const [pagePreviewStatus, setPagePreviewStatus] =
    useState<PreviewStatus>('idle');
  const [pagePreviewError, setPagePreviewError] = useState<string | null>(null);
  const previewRequestRef = useRef<AbortController | null>(null);
  const previewCacheRef = useRef<Map<string, string>>(new Map());
  const [pageNavState, setPageNavState] = useState<{
    path: string[];
    history: string[][];
    index: number;
  }>({ path: [], history: [[]], index: 0 });

  // TODO: Add a dedicated page browser with search/sort/filter that opens the designer with the page route preselected.
  // TODO: Show per-page publish status and diff badges so orchestrator + studio changes stay in sync.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageRoute, setNewPageRoute] = useState('');
  const [creatingPage, setCreatingPage] = useState(false);
  const [launchingApp, setLaunchingApp] = useState(false);
  const [appStatus, setAppStatus] = useState<
    'stopped' | 'starting' | 'running'
  >('stopped');
  const [appLogs, setAppLogs] = useState<
    { text: string; type: 'stdout' | 'stderr' | 'system'; timestamp: Date }[]
  >([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const devPort = useMemo(
    () => getAppDevPort(app),
    [app?.dev?.port, app?.devPort],
  );
  const runControlState: RunControlState =
    appStatus === 'running'
      ? 'running'
      : appStatus === 'starting'
        ? 'starting'
        : 'stopped';

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
          setAppStatus(prev => (prev === 'starting' ? prev : 'running'));
        } else {
          setAppStatus(prev => (prev === 'starting' ? prev : 'stopped'));
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
  }, [devPort]);

  const decodeParam = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const resolvedProjectName = project?.name ?? decodeParam(projectName);
  const resolvedAppName = app?.name ?? decodeParam(appName);
  const defaultTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return tab && VALID_TABS.has(tab) ? tab : 'overview';
  }, [searchParams]);

  const designerLabel = useMemo(() => {
    if (!designerPages.length) {
      return 'No pages detected';
    }
    return `${designerPages.length} page${designerPages.length === 1 ? '' : 's'} available`;
  }, [designerPages.length]);

  const pageTree = useMemo<PageFolder>(() => {
    const root: PageFolder = {
      name: '',
      path: [],
      folders: new Map(),
      pages: [],
    };

    const normalizeRoute = (route: string) => {
      if (!route) return '/';
      const normalized = route.startsWith('/') ? route : `/${route}`;
      if (normalized === '/') return normalized;
      return normalized.replace(/\/+$/, '');
    };

    const getOrCreateFolder = (node: PageFolder, segment: string) => {
      const existing = node.folders.get(segment);
      if (existing) return existing;
      const next: PageFolder = {
        name: segment,
        path: [...node.path, segment],
        folders: new Map(),
        pages: [],
      };
      node.folders.set(segment, next);
      return next;
    };

    designerPages.forEach(page => {
      const route = normalizeRoute(page.route);
      const segments = route.split('/').filter(Boolean);
      const folderSegments = segments.length <= 1 ? [] : segments.slice(0, -1);

      let cursor = root;
      folderSegments.forEach(segment => {
        cursor = getOrCreateFolder(cursor, segment);
      });

      cursor.pages.push(page);
    });

    return root;
  }, [designerPages]);

  const currentFolder = useMemo(() => {
    let cursor = pageTree;
    for (const segment of pageNavState.path) {
      const next = cursor.folders.get(segment);
      if (!next) return pageTree;
      cursor = next;
    }
    return cursor;
  }, [pageNavState.path, pageTree]);

  const currentFolders = useMemo(
    () =>
      Array.from(currentFolder.folders.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [currentFolder],
  );

  const currentPages = useMemo(
    () =>
      [...currentFolder.pages].sort((a, b) => a.route.localeCompare(b.route)),
    [currentFolder.pages],
  );

  const navPathLabel =
    pageNavState.path.length === 0 ? '/' : `/${pageNavState.path.join('/')}`;

  const breadcrumbs = useMemo(() => {
    const crumbs: Array<{ label: string; path: string[] }> = [
      { label: '/', path: [] },
    ];

    for (let i = 0; i < pageNavState.path.length; i += 1) {
      const segment = pageNavState.path[i];
      crumbs.push({ label: segment, path: pageNavState.path.slice(0, i + 1) });
    }

    return crumbs;
  }, [pageNavState.path]);

  const getFolderAtPath = useCallback(
    (path: string[]) => {
      let cursor: PageFolder = pageTree;
      for (const segment of path) {
        const next = cursor.folders.get(segment);
        if (!next) return cursor;
        cursor = next;
      }
      return cursor;
    },
    [pageTree],
  );

  const getSiblingFolders = useCallback(
    (parentPath: string[]) => {
      const folder = getFolderAtPath(parentPath);
      return Array.from(folder.folders.keys()).sort((a, b) =>
        a.localeCompare(b),
      );
    },
    [getFolderAtPath],
  );

  const screenshotEndpoint = useMemo(() => {
    if (!resolvedProjectName || !resolvedAppName) return null;
    return `/api/projects/${encodeURIComponent(
      resolvedProjectName,
    )}/apps/${encodeURIComponent(resolvedAppName)}/pages/screenshot`;
  }, [resolvedProjectName, resolvedAppName]);

  const analyticsEnvSnippet =
    'NEXT_PUBLIC_ANALYTICS_ENDPOINT=http://localhost:20000';
  const analyticsProviderSnippet = useMemo(
    () => `import { AnalyticsProvider } from '@summoniq/signalsplash-client-sdk';

const analyticsConfig = {
  appId: '${resolvedAppName}',
  endpoint: (() => {
    const base = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT ?? '';
    const normalized = base.replace(/\\/$/, '');
    if (!normalized) return '';
    return /\\/api\\/(events|analytics)$/.test(normalized)
      ? normalized
      : normalized + '/api/events';
  })(),
  enabled: Boolean(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider config={analyticsConfig}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
`,
    [resolvedAppName],
  );

  const loadDesignerPages = useCallback(
    async (projectPath?: string, appPath?: string | null) => {
      const allPages: AppPageSummary[] = [];

      // Load designer pages from studio
      if (
        projectPath &&
        typeof window !== 'undefined' &&
        window.electron?.studio?.readDesign
      ) {
        try {
          const designResult = await window.electron.studio.readDesign({
            projectPath,
            appPath: appPath ?? null,
          });

          if (designResult?.success && designResult.data) {
            const parsed = JSON.parse(designResult.data) as Project;
            if (parsed?.pages) {
              const pages = Object.values(parsed.pages)
                .map(page => ({
                  id: page.id,
                  name: page.name,
                  type: page.type,
                  updatedAt: page.updatedAt,
                  route: getPageRoute(page),
                  source: 'designer' as const,
                }))
                .sort((a, b) => b.updatedAt - a.updatedAt);
              allPages.push(...pages);
            }
          }
        } catch (err) {
          console.error('[AppDetail] Failed to load designer pages:', err);
        }
      }

      // Load Next.js pages from file system via API
      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(resolvedProjectName)}/apps/${encodeURIComponent(resolvedAppName)}/pages`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.pages && Array.isArray(data.pages)) {
            const nextjsPages = data.pages
              .filter((p: any) => !allPages.some(dp => dp.route === p.route))
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                type: p.type || 'page',
                updatedAt: Date.now(),
                route: p.route,
                source: 'nextjs' as const,
              }));
            allPages.push(...nextjsPages);
          }
        }
      } catch (err) {
        console.error('[AppDetail] Failed to load Next.js pages:', err);
      }

      setDesignerPages(allPages);
    },
    [resolvedProjectName, resolvedAppName],
  );

  const navigateToFolder = useCallback((nextPath: string[]) => {
    setPageNavState(prev => {
      const nextHistory = prev.history.slice(0, prev.index + 1);
      nextHistory.push(nextPath);
      return {
        path: nextPath,
        history: nextHistory,
        index: nextHistory.length - 1,
      };
    });
  }, []);

  const handleNavBack = useCallback(() => {
    setPageNavState(prev => {
      if (prev.index === 0) return prev;
      const nextIndex = prev.index - 1;
      return {
        ...prev,
        index: nextIndex,
        path: prev.history[nextIndex],
      };
    });
  }, []);

  const handleNavForward = useCallback(() => {
    setPageNavState(prev => {
      if (prev.index >= prev.history.length - 1) return prev;
      const nextIndex = prev.index + 1;
      return {
        ...prev,
        index: nextIndex,
        path: prev.history[nextIndex],
      };
    });
  }, []);

  const handleNavUp = useCallback(() => {
    if (!pageNavState.path.length) return;
    navigateToFolder(pageNavState.path.slice(0, -1));
  }, [navigateToFolder, pageNavState.path]);

  useEffect(() => {
    setPageNavState(prev => {
      let cursor: PageFolder | undefined = pageTree;
      for (const segment of prev.path) {
        cursor = cursor.folders.get(segment);
        if (!cursor) {
          return { path: [], history: [[]], index: 0 };
        }
      }
      return prev;
    });
  }, [pageTree]);

  const requestPagePreview = useCallback(
    async (page: AppPageSummary, forceRefresh: boolean) => {
      if (!screenshotEndpoint) {
        setPagePreviewStatus('error');
        setPagePreviewError('Preview service unavailable.');
        setPagePreviewUrl(null);
        return;
      }

      if (!devPort) {
        setPagePreviewStatus('error');
        setPagePreviewError('Start the app to generate a preview.');
        setPagePreviewUrl(null);
        return;
      }

      const route = page.route || '/';
      if (/\[.+?\]|:[^/]+/.test(route)) {
        setPagePreviewStatus('error');
        setPagePreviewError('Dynamic routes need parameters to preview.');
        setPagePreviewUrl(null);
        return;
      }

      const cacheKey = `${page.id}:${route}:${devPort}`;
      const cached = previewCacheRef.current.get(cacheKey);
      if (cached && !forceRefresh) {
        setPagePreviewUrl(cached);
        setPagePreviewStatus('ready');
        setPagePreviewError(null);
        return;
      }

      previewRequestRef.current?.abort();
      const controller = new AbortController();
      previewRequestRef.current = controller;

      if (!forceRefresh) {
        setPagePreviewUrl(null);
      }
      setPagePreviewStatus('loading');
      setPagePreviewError(null);

      try {
        const params = new URLSearchParams({
          route,
          port: String(devPort),
          width: '960',
          height: '720',
        });
        const response = await fetch(`${screenshotEndpoint}?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
            details?: string;
          } | null;
          const baseMessage =
            typeof payload?.error === 'string'
              ? payload.error
              : 'Failed to capture preview.';
          const details =
            typeof payload?.details === 'string' ? payload.details : null;
          throw new Error(details ? `${baseMessage} ${details}` : baseMessage);
        }

        const blob = await response.blob();
        if (controller.signal.aborted) return;

        const objectUrl = URL.createObjectURL(blob);
        const existing = previewCacheRef.current.get(cacheKey);
        if (existing) {
          URL.revokeObjectURL(existing);
        }
        previewCacheRef.current.set(cacheKey, objectUrl);
        setPagePreviewUrl(objectUrl);
        setPagePreviewStatus('ready');
        setPagePreviewError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setPagePreviewStatus('error');
        setPagePreviewError(
          err instanceof Error ? err.message : 'Failed to capture preview.',
        );
        setPagePreviewUrl(null);
      }
    },
    [devPort, screenshotEndpoint],
  );

  const handleRefreshPreview = useCallback(() => {
    if (!selectedPage) return;
    requestPagePreview(selectedPage, true);
  }, [requestPagePreview, selectedPage]);

  useEffect(() => {
    async function loadProjectAndApp() {
      try {
        if (typeof window !== 'undefined' && window.electron) {
          // Decode the URL parameters
          const decodedProjectName = decodeURIComponent(projectName);
          const decodedAppName = decodeURIComponent(appName);

          console.log(
            '[AppDetail] Loading app:',
            decodedAppName,
            'from project:',
            decodedProjectName,
          );

          // Get all projects
          const projects = await window.electron.projects.getAll();
          const foundProject = projects.find(
            (p: any) => p.name === decodedProjectName,
          );

          if (!foundProject) {
            setError(`Project "${decodedProjectName}" not found`);
            return;
          }

          setProject(foundProject);

          console.log(
            '[AppDetail] Found project, apps:',
            foundProject.apps?.map((a: any) => a.name),
          );

          // Find the app within the project
          const foundApp = foundProject.apps?.find(
            (a: any) => a.name === decodedAppName,
          );

          if (!foundApp) {
            setError(
              `Application "${decodedAppName}" not found in project "${decodedProjectName}"`,
            );
            console.error(
              '[AppDetail] Available apps:',
              foundProject.apps?.map((a: any) => a.name),
            );
            return;
          }

          console.log('[AppDetail] Found app:', foundApp);
          setApp(foundApp);

          await loadDesignerPages(foundProject?.path, foundApp?.path ?? null);
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
  }, [projectName, appName, loadDesignerPages]);

  useEffect(() => {
    return () => {
      previewRequestRef.current?.abort();
      previewCacheRef.current.forEach(url => URL.revokeObjectURL(url));
      previewCacheRef.current.clear();
    };
  }, []);

  // Check if dev server is running by pinging the port
  const checkPortStatus = useCallback(async () => {
    if (!devPort) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      await fetch(`http://localhost:${devPort}`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setAppStatus('running');
    } catch {
      setAppStatus(prev => (prev === 'starting' ? prev : 'stopped'));
    }
  }, [devPort]);

  // Poll for port status and listen to Electron events
  useEffect(() => {
    if (!devPort || !project?.path || !app?.name) return;

    const shouldPoll = !window.electron?.applications?.checkPort;

    let pollInterval: ReturnType<typeof setInterval> | null = null;
    if (shouldPoll) {
      checkPortStatus();
      pollInterval = setInterval(checkPortStatus, 5000);
    }

    // Listen to Electron status events
    if (window.electron) {
      const unsubscribeLog = window.electron.applications.onAppLog?.(
        (data: any) => {
          // Electron sends projectId for logs
          const matchesProject =
            data?.projectId === project.path ||
            data?.projectPath === project.path;
          if (data?.appId === app.name && matchesProject) {
            setAppStatus('running');
            // Only add non-empty log lines
            const text = data.text?.trim();
            if (text) {
              setAppLogs(prev => [
                ...prev.slice(-500), // Keep last 500 logs
                {
                  text,
                  type: data.type || 'stdout',
                  timestamp: new Date(),
                },
              ]);
            }
          }
        },
      );

      const unsubscribeStatus = window.electron.applications.onStatusChange?.(
        (data: any) => {
          // Electron sends projectPath for status
          const matchesProject =
            data?.projectId === project.path ||
            data?.projectPath === project.path;
          if (data?.appId === app.name && matchesProject) {
            const newStatus = data.status === 'crashed' ? 'stopped' : 'stopped';
            setAppStatus(newStatus);
            setAppLogs(prev => [
              ...prev,
              {
                text: `[System] App ${data.status}`,
                type: 'system',
                timestamp: new Date(),
              },
            ]);
          }
        },
      );

      return () => {
        if (pollInterval) clearInterval(pollInterval);
        unsubscribeLog?.();
        unsubscribeStatus?.();
      };
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [devPort, project?.path, app?.name, checkPortStatus]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [appLogs]);

  useEffect(() => {
    if (!selectedPage) {
      previewRequestRef.current?.abort();
      setPagePreviewStatus('idle');
      setPagePreviewError(null);
      setPagePreviewUrl(null);
      return;
    }

    requestPagePreview(selectedPage, false);

    return () => {
      previewRequestRef.current?.abort();
    };
  }, [requestPagePreview, selectedPage]);

  const handleLaunchApp = async () => {
    if (project?.path && window.electron) {
      setLaunchingApp(true);
      setAppStatus('starting');
      setAppLogs(prev => [
        ...prev,
        {
          text: `Starting ${app.name}...`,
          type: 'system',
          timestamp: new Date(),
        },
      ]);
      try {
        const result = await window.electron.applications.launch(
          project.path,
          app.name,
          'dev',
          app.path || null, // Pass app.path for monorepo apps
          devPort,
        );

        if (result.success) {
          toast.success(`Launching ${app.name}...`);
        } else {
          setAppStatus('stopped');
          toast.error(result.error || 'Failed to launch application');
        }
      } finally {
        setLaunchingApp(false);
      }
    }
  };

  const handleStopApp = async () => {
    if (project?.path && window.electron) {
      if (typeof window.electron.applications.stop === 'function') {
        const result = await window.electron.applications.stop(
          project.path,
          app.name,
          app.path || null,
          devPort,
        );

        if (result?.success) {
          setAppStatus('stopped');
          toast.success(`${app.name} stopped`);
        } else {
          toast.error(result?.error || 'Failed to stop');
        }

        if (typeof devPort === 'number') {
          try {
            const portStatus =
              await window.electron.applications.checkPort(devPort);
            if (portStatus?.listening) {
              setAppStatus('running');
            }
          } catch {
            // ignore
          }
        }
      } else {
        toast.info('Close the terminal window to stop the app');
      }
    }
  };

  const handleOpenInEditor = async () => {
    if (project?.path && window.electron) {
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
    if (project?.path && window.electron) {
      const appPath = app.path ? `${project.path}/${app.path}` : project.path;

      const result = await window.electron.applications.openTerminal(appPath);
      if (!result.success) {
        toast.error(result.error || 'Failed to open terminal');
      }
    }
  };

  const handleOpenDesigner = () => {
    router.push(
      `/studio?project=${encodeURIComponent(resolvedProjectName)}&app=${encodeURIComponent(resolvedAppName)}&mode=design`,
    );
  };

  const handleRefreshDesignerPages = useCallback(() => {
    loadDesignerPages(project?.path, app?.path ?? null);
  }, [loadDesignerPages, project?.path, app?.path]);

  const handleOpenDesignerPage = useCallback(
    (page: AppPageSummary) => {
      if (page.source === 'designer') {
        router.push(
          `/studio?project=${encodeURIComponent(resolvedProjectName)}&app=${encodeURIComponent(resolvedAppName)}&page=${encodeURIComponent(page.id)}&mode=design`,
        );
        return;
      }

      const route = page.route || '/';
      router.push(
        `/studio?project=${encodeURIComponent(resolvedProjectName)}&app=${encodeURIComponent(resolvedAppName)}&mode=code&route=${encodeURIComponent(route)}`,
      );
    },
    [router, resolvedProjectName, resolvedAppName],
  );

  const handleOpenPreview = useCallback(
    (route: string) => {
      if (!devPort) {
        toast.error('No dev port configured for this app');
        return;
      }

      const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
      const url = `http://localhost:${devPort}${normalizedRoute}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [devPort],
  );

  const handleOpenSelectedPagePreview = useCallback(() => {
    if (selectedPage) {
      handleOpenPreview(selectedPage.route);
    }
  }, [handleOpenPreview, selectedPage]);

  const handleOpenSelectedPageDesigner = useCallback(() => {
    if (selectedPage) {
      handleOpenDesignerPage(selectedPage);
    }
  }, [handleOpenDesignerPage, selectedPage]);

  const handleOpenSelectedPageCode = useCallback(() => {
    if (!selectedPage) return;
    const pageParam =
      selectedPage.route || selectedPage.name || selectedPage.id;
    router.push(
      `/studio?project=${encodeURIComponent(resolvedProjectName)}&app=${encodeURIComponent(resolvedAppName)}&page=${encodeURIComponent(pageParam)}&mode=code`,
    );
  }, [resolvedAppName, resolvedProjectName, router, selectedPage]);

  const handleCopySnippet = useCallback(
    async (value: string, field: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopiedField(field);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedField(null), 2000);
      } catch (error) {
        toast.error('Failed to copy');
      }
    },
    [],
  );

  const handleCopyEnvSnippet = useCallback(() => {
    handleCopySnippet(analyticsEnvSnippet, 'env');
  }, [analyticsEnvSnippet, handleCopySnippet]);

  const handleCopyProviderSnippet = useCallback(() => {
    handleCopySnippet(analyticsProviderSnippet, 'provider');
  }, [analyticsProviderSnippet, handleCopySnippet]);

  const handleOpenAnalyticsDashboard = useCallback(() => {
    router.push('/analytics');
  }, [router]);

  const handleSaveConfiguration = async (configData: any) => {
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

      const result = await response.json();
      toast.success('Configuration saved successfully');

      // Reload to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save configuration',
      );
      throw error;
    }
  };

  const handleCreatePage = useCallback(async () => {
    if (!newPageName.trim()) {
      toast.error('Page name is required');
      return;
    }

    // Generate route from name if not provided
    const route =
      newPageRoute.trim() ||
      `/${newPageName.trim().toLowerCase().replace(/\s+/g, '-')}`;

    setCreatingPage(true);

    try {
      // Navigate to designer with the new page parameters
      router.push(
        `/studio?project=${encodeURIComponent(resolvedProjectName)}&app=${encodeURIComponent(resolvedAppName)}&newPage=${encodeURIComponent(newPageName.trim())}&route=${encodeURIComponent(route)}`,
      );

      setShowCreatePageModal(false);
      setNewPageName('');
      setNewPageRoute('');
    } catch (error) {
      toast.error('Failed to create page');
    } finally {
      setCreatingPage(false);
    }
  }, [newPageName, newPageRoute, router, resolvedProjectName, resolvedAppName]);

  const openCreatePageModal = useCallback(() => {
    setNewPageName('');
    setNewPageRoute('');
    setShowCreatePageModal(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading application...</div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">
            {error || 'Application not found'}
          </p>
          <button
            onClick={() => router.back()}
            className="text-sm text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const getAppIcon = () => {
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <button
            onClick={() =>
              router.push(
                `/projects/${encodeURIComponent(resolvedProjectName)}`,
              )
            }
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to {resolvedProjectName}
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              {getAppIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {app.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {app.description ||
                  `${app.type} application in ${resolvedProjectName}`}
              </p>
              {devPort && (
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Port: {devPort}</span>
                  {app.dev?.command && <span>Dev: {app.dev.command}</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* <Button
                onClick={handleOpenTerminal}
                variant="outline"
                className="gap-2"
              >
                <Terminal className="w-4 h-4" />
                Terminal
              </Button> */}
              {/* <Button
                onClick={handleOpenDesigner}
                variant="outline"
                className="gap-2"
              >
                <Palette className="w-4 h-4" />
                Designer
              </Button> */}
              {/* <Button
                onClick={handleOpenInEditor}
                variant="outline"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Editor
              </Button> */}
              <div className="flex items-center gap-2">
                <RunControlButton
                  state={runControlState}
                  size="md"
                  iconOnly
                  onClick={
                    appStatus === 'running' ? handleStopApp : handleLaunchApp
                  }
                  disabled={launchingApp || appStatus === 'starting'}
                  aria-label={
                    appStatus === 'running'
                      ? 'Stop dev server'
                      : appStatus === 'starting'
                        ? 'Starting dev server'
                        : 'Start dev server'
                  }
                />

                <div className="flex flex-col leading-tight min-w-[88px]">
                  <span className="text-[11px] font-medium">Dev Server</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        appStatus === 'running'
                          ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                          : appStatus === 'starting'
                            ? 'h-1.5 w-1.5 rounded-full bg-amber-500'
                            : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40'
                      }
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {appStatus === 'running'
                        ? 'Running'
                        : appStatus === 'starting'
                          ? 'Starting…'
                          : 'Stopped'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Tabs defaultValue={defaultTab}>
            <div className="flex items-center mb-4 justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <Button
                className="gap-2"
                variant="outline"
                onClick={openCreatePageModal}
              >
                <Plus className="w-4 h-4" />
                Create Page
              </Button>
            </div>

            <TabsContent value="overview" className="mt-4 space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Application Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Type
                    </label>
                    <p className="font-medium">{app.type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Name
                    </label>
                    <p className="font-medium">{app.name}</p>
                  </div>
                  {app.path && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Path
                      </label>
                      <p className="font-medium">{app.path}</p>
                    </div>
                  )}
                  {devPort && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Dev Port
                      </label>
                      <p className="font-medium">{devPort}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Commands */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Commands</h2>
                <div className="space-y-3">
                  {app.dev?.command && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Development
                      </label>
                      <code className="block mt-1 p-2 bg-muted rounded text-sm">
                        {app.dev.command}
                      </code>
                    </div>
                  )}
                  {app.build?.command && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Build
                      </label>
                      <code className="block mt-1 p-2 bg-muted rounded text-sm">
                        {app.build.command}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pages" className="mt-0 py-0 pt-0">
              <div className="bg-card border border-border rounded-lg">
                {!designerPages.length ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center">
                    <Layout className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No pages created yet
                    </p>
                    <Button onClick={openCreatePageModal} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Page
                    </Button>
                  </div>
                ) : (
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
                          onClick={handleNavBack}
                          disabled={pageNavState.index === 0}
                          aria-label="Go back"
                          title="Back"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
                          onClick={handleNavForward}
                          disabled={
                            pageNavState.index >=
                            pageNavState.history.length - 1
                          }
                          aria-label="Go forward"
                          title="Forward"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
                          onClick={handleNavUp}
                          disabled={pageNavState.path.length === 0}
                          aria-label="Go up"
                          title="Up one level"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      </div>
                      <Breadcrumb
                        aria-label="Folders"
                        className="min-w-0 flex-1"
                      >
                        <BreadcrumbList className="min-w-0 text-xs font-mono text-white/70 gap-1.5 sm:gap-1.5 rounded-md border border-white/10 bg-black/40 px-2 py-1">
                          {breadcrumbs.map((crumb, index) => {
                            const parentPath =
                              crumb.path.length === 0
                                ? ([] as string[])
                                : crumb.path.slice(0, -1);
                            const siblings = getSiblingFolders(parentPath);

                            return (
                              <Fragment key={crumb.path.join('/') || 'root'}>
                                {index > 0 && (
                                  <BreadcrumbSeparator className="text-white/30" />
                                )}
                                <BreadcrumbItem className="min-w-0">
                                  <BreadcrumbLink asChild>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        navigateToFolder(crumb.path)
                                      }
                                      className={cn(
                                        'truncate rounded px-1 py-0.5 hover:bg-white/10 hover:text-white transition-colors',
                                        crumb.path.length ===
                                          pageNavState.path.length &&
                                          crumb.label ===
                                            (pageNavState.path.length === 0
                                              ? '/'
                                              : pageNavState.path[
                                                  pageNavState.path.length - 1
                                                ])
                                          ? 'text-white'
                                          : 'text-white/70',
                                      )}
                                      title={
                                        crumb.label === '/'
                                          ? navPathLabel
                                          : `/${crumb.path.join('/')}`
                                      }
                                    >
                                      {crumb.label}
                                    </button>
                                  </BreadcrumbLink>

                                  {siblings.length > 1 && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          type="button"
                                          className="inline-flex items-center justify-center rounded p-0.5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
                                          aria-label={`Choose ${crumb.label} folder`}
                                        >
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="start"
                                        side="bottom"
                                        className="min-w-[180px]"
                                      >
                                        {siblings.map(name => {
                                          const nextPath =
                                            crumb.path.length === 0
                                              ? [name]
                                              : [...parentPath, name];
                                          return (
                                            <DropdownMenuItem
                                              key={name}
                                              onClick={() =>
                                                navigateToFolder(nextPath)
                                              }
                                              className="font-mono text-xs"
                                            >
                                              {name}
                                            </DropdownMenuItem>
                                          );
                                        })}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </BreadcrumbItem>
                              </Fragment>
                            );
                          })}
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>

                    {currentFolders.length === 0 &&
                    currentPages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-xs text-white/60">
                        This folder is empty.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {currentFolders.map(folder => {
                          const folderCount = countFolderPages(folder);
                          return (
                            <button
                              key={folder.name}
                              onClick={() => navigateToFolder(folder.path)}
                              className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-all"
                            >
                              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/70 to-orange-600/70 shadow-lg flex items-center justify-center group-hover:scale-105 group-hover:shadow-xl transition-all">
                                <Folder className="w-7 h-7 text-white/90" />
                              </div>
                              <div className="text-center w-full">
                                <div className="text-xs font-medium text-white/90 truncate px-1">
                                  {folder.name}
                                </div>
                                <div className="text-[10px] text-white/50 truncate px-1">
                                  {folderCount} page
                                  {folderCount === 1 ? '' : 's'}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        {currentPages.map(page => (
                          <button
                            key={page.id}
                            onClick={() => setSelectedPage(page)}
                            className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-all"
                          >
                            <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/80 to-indigo-600/80 shadow-lg flex items-center justify-center group-hover:scale-105 group-hover:shadow-xl transition-all">
                              <Layout className="w-7 h-7 text-white/90" />
                              {page.source === 'nextjs' && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-white">
                                    N
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-center w-full">
                              <div className="text-xs font-medium text-white/90 truncate px-1">
                                {page.name}
                              </div>
                              <div className="text-[10px] text-white/50 truncate px-1">
                                {page.route}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Page Details Slide Panel */}
                <Modal
                  open={!!selectedPage}
                  onOpenChange={open => !open && setSelectedPage(null)}
                  overlay={false}
                >
                  <ModalContent
                    variant="slide"
                    margin="none"
                    showOverlay={false}
                    className="z-40 top-[calc(2.75rem+0.5rem)]! right-4! bottom-10! h-auto! w-[400px]! rounded-2xl shadow-2xl shadow-black/20"
                  >
                    <ModalHeader
                      title={<ModalTitle>{selectedPage?.name}</ModalTitle>}
                      description={selectedPage?.route}
                      showClose={true}
                    />
                    <ModalBody className="p-6 space-y-6">
                      {/* Page Preview */}
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-border flex items-center justify-center">
                        {pagePreviewUrl ? (
                          <img
                            src={pagePreviewUrl}
                            alt={`Preview of ${selectedPage?.name ?? 'page'}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Layout className="w-12 h-12 text-primary/40" />
                        )}
                        {pagePreviewStatus === 'loading' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-medium text-white">
                            Capturing preview...
                          </div>
                        )}
                        {pagePreviewStatus === 'error' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 px-4 text-center text-xs text-white">
                            <div className="font-medium">
                              Preview unavailable
                            </div>
                            {pagePreviewError && (
                              <div className="text-[11px] text-white/80">
                                {pagePreviewError}
                              </div>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={handleRefreshPreview}
                            >
                              Retry
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Page Info */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Source
                          </label>
                          <p className="text-sm mt-1">
                            {selectedPage?.source === 'nextjs' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black text-white text-xs font-medium">
                                <span className="text-[10px]">▲</span> Next.js
                                File
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                <Palette className="w-3 h-3" /> Designer
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Route
                          </label>
                          <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                            {selectedPage?.route}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Type
                          </label>
                          <p className="text-sm mt-1 capitalize">
                            {selectedPage?.type || 'page'}
                          </p>
                        </div>
                        {selectedPage?.source !== 'nextjs' && (
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Last Updated
                            </label>
                            <p className="text-sm mt-1">
                              {selectedPage?.updatedAt
                                ? new Date(
                                    selectedPage.updatedAt,
                                  ).toLocaleString()
                                : 'Unknown'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-4 border-t">
                        {selectedPage?.source === 'nextjs' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              className="w-full gap-2"
                              onClick={handleOpenSelectedPageDesigner}
                            >
                              <Palette className="w-4 h-4" />
                              Open in Designer
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full gap-2"
                              onClick={handleOpenSelectedPagePreview}
                              disabled={!devPort}
                            >
                              <Eye className="w-4 h-4" />
                              Preview in Browser
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                className="w-full gap-2"
                                onClick={handleOpenSelectedPageDesigner}
                              >
                                <Palette className="w-4 h-4" />
                                Open in Designer
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={handleOpenSelectedPagePreview}
                                disabled={!devPort}
                              >
                                <Eye className="w-4 h-4" />
                                Preview in Browser
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full gap-2"
                              onClick={handleOpenSelectedPageCode}
                            >
                              <FileCode className="w-4 h-4" />
                              View Generated Code
                            </Button>
                          </>
                        )}
                      </div>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </div>
            </TabsContent>

            <TabsContent value="configuration" className="mt-6">
              <ConfigForm
                projectName={projectName}
                app={app}
                onSave={handleSaveConfiguration}
              />
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Application Logs</h2>
                  {appLogs.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAppLogs([])}
                    >
                      Clear Logs
                    </Button>
                  )}
                </div>
                <div className="bg-black/90 rounded-md p-4 font-mono text-xs min-h-[400px] max-h-[600px] overflow-y-auto">
                  {appLogs.length === 0 ? (
                    <p className="text-gray-500">
                      {appStatus === 'running'
                        ? 'Waiting for logs...'
                        : 'No logs available. Start the dev server to see logs.'}
                    </p>
                  ) : (
                    <div className="space-y-0.5">
                      {appLogs.map((log, i) => (
                        <div
                          key={i}
                          className={`whitespace-pre-wrap break-all ${
                            log.type === 'stderr'
                              ? 'text-red-400'
                              : log.type === 'system'
                                ? 'text-blue-400'
                                : 'text-green-400'
                          }`}
                        >
                          <span className="text-gray-500 mr-2">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          {log.text}
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Analytics Setup</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Connect {resolvedAppName} to SummonIQ Analytics to track
                        pageviews, sessions, and events.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleOpenAnalyticsDashboard}
                    >
                      View Analytics
                    </Button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            1. Add the analytics endpoint
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Add this to your app&apos;s `.env.local`.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={handleCopyEnvSnippet}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copiedField === 'env' ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <code className="mt-3 block rounded-md bg-background px-3 py-2 text-xs font-mono text-foreground">
                        {analyticsEnvSnippet}
                      </code>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            2. Wrap your root layout
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use the SummonIQ Analytics provider with this app ID.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={handleCopyProviderSnippet}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copiedField === 'provider' ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-background p-3 text-xs text-foreground">
                        <code>{analyticsProviderSnippet}</code>
                      </pre>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium">
                        3. Start the analytics service
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ensure your analytics service is running at
                        <span className="font-mono text-foreground">
                          {' '}
                          http://localhost:20000
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold">Status</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">App ID</span>
                      <span className="font-mono text-xs">
                        {resolvedAppName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Endpoint</span>
                      <span className="font-mono text-xs">localhost:20000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tracking</span>
                      <span className="text-xs text-muted-foreground">
                        Enable to see metrics
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Page Modal */}
      <Modal open={showCreatePageModal} onOpenChange={setShowCreatePageModal}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Create New Page</ModalTitle>
            <ModalDescription>
              Create a new page for {resolvedAppName} and open it in the
              designer.
            </ModalDescription>
          </ModalHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Name</label>
              <input
                type="text"
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                placeholder="Home, About, Contact..."
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Route (optional)</label>
              <input
                type="text"
                value={newPageRoute}
                onChange={e => setNewPageRoute(e.target.value)}
                placeholder={
                  newPageName
                    ? `/${newPageName.toLowerCase().replace(/\s+/g, '-')}`
                    : '/page-route'
                }
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate from name
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-6 pt-0">
            <Button
              variant="outline"
              onClick={() => setShowCreatePageModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePage}
              disabled={creatingPage || !newPageName.trim()}
              className="gap-2"
            >
              <Palette className="w-4 h-4" />
              Create & Open in Designer
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
