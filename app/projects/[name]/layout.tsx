'use client';

import { Button } from '@summoniq/applab-ui';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Brain,
  FolderX,
  Loader2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AnimatedTabNav } from './components/animated-tab-nav';
import { ProjectHeader } from './components/project-header';

type RuntimeProject = {
  name: string;
  description: string;
  path?: string;
  hasConfig?: boolean;
  starred?: boolean;
  apps?: any[];
  mcp?: {
    servers?: Array<{
      name: string;
      command: string;
      args?: string[];
      env?: Record<string, string>;
      description?: string;
    }>;
  };
};

interface ProjectStatus {
  filesystemExists: boolean;
  hasConfig: boolean;
  isManaged: boolean;
  path: string;
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const params = useParams<{ name: string }>();
  const projectName = params?.name;
  const pathname = usePathname();
  const [project, setProject] = useState<RuntimeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManaged, setIsManaged] = useState<boolean | null>(null);
  const [showManagedAlert, setShowManagedAlert] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(
    null,
  );

  const totalApps = project?.apps?.length || 0;

  useEffect(() => {
    async function loadProject() {
      if (!projectName) {
        setError('Project name is missing');
        setLoading(false);
        return;
      }

      try {
        let foundProject: RuntimeProject | undefined;

        if (typeof window !== 'undefined' && window.electron) {
          const projects = await window.electron.projects.getAll();
          foundProject = projects.find(p => p.name === projectName);

          if (!foundProject) {
            setError('Project not found');
            return;
          }

          if (!foundProject.hasConfig) {
            setError('Project does not have SummonIQ configuration');
            return;
          }
        } else {
          setError('Not running in Electron environment');
          return;
        }

        const statusUrl = foundProject.path
          ? `/api/projects/${encodeURIComponent(projectName)}/manage?path=${encodeURIComponent(foundProject.path)}`
          : `/api/projects/${encodeURIComponent(projectName)}/manage`;

        const statusResponse = await fetch(statusUrl);

        let starredStatus = false;
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setProjectStatus({
            filesystemExists: statusData.filesystemExists,
            hasConfig: statusData.hasConfig,
            isManaged: statusData.isManaged,
            path: statusData.path,
          });
          setIsManaged(statusData.isManaged);
          starredStatus = statusData.project?.starred || false;

          if (!statusData.filesystemExists) {
            setError('filesystem_missing');
            setLoading(false);
            return;
          }

          if (!statusData.hasConfig) {
            setError('config_missing');
            setLoading(false);
            return;
          }

          if (!statusData.isManaged) {
            setShowManagedAlert(true);
          }
        }

        setProject({ ...foundProject, starred: starredStatus });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectName]);

  async function handleAddToDatabase() {
    if (!projectName) return;

    setIsAddingProject(true);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/manage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: projectName,
            path: project?.path,
          }),
        },
      );

      if (response.ok) {
        toast.success('Project added to database');
        setIsManaged(true);
        setShowManagedAlert(false);
      } else {
        toast.error('Failed to add project to database');
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Failed to add project to database');
    } finally {
      setIsAddingProject(false);
    }
  }

  const getTabHref = (tab: string) => `/projects/${projectName}/${tab}`;
  const isActiveTab = (tab: string) => pathname === getTabHref(tab);

  const isAppDetailRoute =
    typeof projectName === 'string' &&
    pathname.startsWith(`/projects/${projectName}/apps/`);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    // Filesystem missing - project directory doesn't exist
    if (error === 'filesystem_missing') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <FolderX className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Project Directory Not Found
            </h2>
            <p className="text-muted-foreground">
              The project directory no longer exists on the filesystem.
            </p>
            {projectStatus?.path && (
              <code className="block text-xs bg-muted px-3 py-2 rounded-lg text-muted-foreground break-all">
                {projectStatus.path}
              </code>
            )}
            <div className="pt-2 space-y-2">
              {projectStatus?.isManaged && (
                <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    This project exists in the database but not on disk
                  </span>
                </div>
              )}
              <Link href="/projects">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Config missing - directory exists but no applab.config.ts
    if (error === 'config_missing') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              SummonIQ Configuration Missing
            </h2>
            <p className="text-muted-foreground">
              The project directory exists but doesn&apos;t have an{' '}
              <code className="px-1.5 py-0.5 bg-muted rounded text-sm">
                applab.config.ts
              </code>{' '}
              file.
            </p>
            {projectStatus?.path && (
              <code className="block text-xs bg-muted px-3 py-2 rounded-lg text-muted-foreground break-all">
                {projectStatus.path}
              </code>
            )}
            <div className="pt-2">
              <Link href="/projects">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Generic error
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Project Not Found
          </h2>
          <p className="text-muted-foreground">
            {error || 'The requested project could not be loaded.'}
          </p>
          <div className="pt-2">
            <Link href="/projects">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAppDetailRoute) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ProjectHeader project={project} />

      {showManagedAlert && (
        <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    This project is not managed in the database
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    Add it to enable features like brand color persistence,
                    configuration history, and team management.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddToDatabase}
                  disabled={isAddingProject}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAddingProject ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to Database'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManagedAlert(false)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatedTabNav
        activeTab={pathname.split('/').pop() || 'overview'}
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            href: getTabHref('overview'),
          },
          { value: 'kanban', label: 'Kanban', href: getTabHref('kanban') },
          {
            value: 'apps',
            label: `Apps (${totalApps})`,
            href: getTabHref('apps'),
            hidden: totalApps === 0,
          },
          { value: 'agents', label: 'Agents', href: getTabHref('agents') },
          { value: 'files', label: 'Files', href: getTabHref('files') },
          { value: 'data', label: 'Data', href: getTabHref('data') },
          {
            value: 'documentation',
            label: 'Documentation',
            href: getTabHref('documentation'),
          },
          {
            value: 'branding',
            label: 'Branding',
            href: getTabHref('branding'),
          },
          {
            value: 'settings',
            label: 'Settings',
            href: getTabHref('settings'),
          },
          {
            value: 'memories',
            label: 'Memories',
            href: getTabHref('memories'),
            rightAligned: true,
            icon: <Brain className="w-4 h-4" />,
          },
        ]}
      />

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 h-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
