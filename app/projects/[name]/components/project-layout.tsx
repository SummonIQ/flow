'use client';

import { Button } from '@summoniq/applab-ui';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AnimatedTabNav } from './animated-tab-nav';
import { ProjectHeader } from './project-header';

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

interface ProjectLayoutProps {
  projectName: string;
  children: React.ReactNode;
}

export function ProjectLayout({ projectName, children }: ProjectLayoutProps) {
  const pathname = usePathname();
  const [project, setProject] = useState<RuntimeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManaged, setIsManaged] = useState<boolean | null>(null);
  const [showManagedAlert, setShowManagedAlert] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Get total app count for tab badge
  const totalApps = project?.apps?.length || 0;

  useEffect(() => {
    async function loadProject() {
      try {
        if (typeof window !== 'undefined' && window.electron) {
          const projects = await window.electron.projects.getAll();
          const foundProject = projects.find(p => p.name === projectName);

          if (!foundProject) {
            setError('Project not found');
          } else if (!foundProject.hasConfig) {
            setError('Project does not have SummonIQ configuration');
          } else {
            setProject(foundProject);
          }
        } else {
          setError('Not running in Electron environment');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectName]);

  // Check if project is managed in database
  useEffect(() => {
    async function checkManaged() {
      try {
        const manageUrl = project?.path
          ? `/api/projects/${encodeURIComponent(projectName)}/manage?path=${encodeURIComponent(project.path)}`
          : `/api/projects/${encodeURIComponent(projectName)}/manage`;

        const response = await fetch(manageUrl);
        if (response.ok) {
          const data = await response.json();
          setIsManaged(data.isManaged);
          if (!data.isManaged) {
            setShowManagedAlert(true);
          }
          // Update project with starred status from database (only if it changed)
          if (
            project &&
            data.project?.starred !== undefined &&
            project.starred !== data.project.starred
          ) {
            setProject({ ...project, starred: data.project.starred });
          }
        }
      } catch (err) {
        console.error('Failed to check project management status:', err);
      }
    }

    if (project) {
      checkManaged();
    }
  }, [project, projectName]);

  async function handleAddToDatabase() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">
            {error || 'Project not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader project={project} />

      {/* Alert Banner for Unmanaged Project */}
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

      {/* Tab Navigation */}
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
          { value: 'team', label: 'Team', href: getTabHref('team') },
          { value: 'files', label: 'Files', href: getTabHref('files') },
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
        ]}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-0 min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
