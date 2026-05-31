'use client';

import {
  Page,
  PageContent,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Report,
  type ReportColumnDefinition,
} from '@summoniq/applab-ui';
import {
  EyeOff,
  FolderOpen,
  MoreHorizontal,
  RefreshCw,
  Star,
  Trash2,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteProjectModal } from '@/app/projects/components/delete-project-modal';
import { ProjectCard } from '@/app/projects/components/project-card';
import { ProjectModal } from '@/app/projects/components/project-modal';
import { Switch } from '@/components/ui/switch';
import type { ProjectConfig } from '@summoniq/config';

// Runtime type for projects with orchestrator metadata
type RuntimeProject = Partial<ProjectConfig> & {
  id: string;
  name: string;
  description: string;
  path: string;
  hasConfig?: boolean;
  apps?: any[];
  starred?: boolean;
  filesystemExists?: boolean;
  isManaged?: boolean;
};

const DEFAULT_PROJECTS_BASE_PATH = '/Users/steven/Projects';
const DEFAULT_PROJECTS_BASE_DISPLAY = '~/Projects';

const normalizeProjectsBasePath = (value?: string) => {
  if (!value) {
    return DEFAULT_PROJECTS_BASE_PATH;
  }
  return value.replace(/[\\/]+$/, '') || DEFAULT_PROJECTS_BASE_PATH;
};

const buildProjectsPath = (base: string, name: string) => {
  const separator = base.includes('\\') ? '\\' : '/';
  return `${base}${separator}${name}`;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<RuntimeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNonAppLabProjects, setShowNonAppLabProjects] = useState(false);
  const [projectsBasePath, setProjectsBasePath] = useState(
    DEFAULT_PROJECTS_BASE_PATH,
  );
  const [projectsBaseDisplay, setProjectsBaseDisplay] = useState(
    DEFAULT_PROJECTS_BASE_DISPLAY,
  );
  const normalizedProjectsBasePath =
    normalizeProjectsBasePath(projectsBasePath);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !window.electron?.projects?.getBasePath
    ) {
      return;
    }

    let isMounted = true;

    window.electron.projects
      .getBasePath()
      .then(result => {
        if (!isMounted || !result?.path) {
          return;
        }
        setProjectsBasePath(normalizeProjectsBasePath(result.path));
        setProjectsBaseDisplay(
          result.display
            ? result.display.replace(/[\\/]+$/, '')
            : normalizeProjectsBasePath(result.path),
        );
      })
      .catch(() => {
        // Ignore errors and keep defaults
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RuntimeProject | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  console.log(
    'ProjectsPage render - showNewProjectModal:',
    showNewProjectModal,
  );

  useEffect(() => {
    async function loadProjects() {
      try {
        if (typeof window !== 'undefined' && window.electron) {
          const data = await window.electron.projects.getAll();

          // Fetch status from database for each project
          const projectsWithStatus = await Promise.all(
            data.map(async (project: RuntimeProject) => {
              try {
                const response = await fetch(
                  `/api/projects/${encodeURIComponent(project.name)}/manage?path=${encodeURIComponent(project.path)}`,
                );
                if (response.ok) {
                  const dbData = await response.json();
                  return {
                    ...project,
                    starred: dbData.project?.starred || false,
                    filesystemExists: dbData.filesystemExists ?? true,
                    isManaged: dbData.isManaged ?? false,
                  };
                }
              } catch (err) {
                console.error(
                  `Failed to fetch status for ${project.name}:`,
                  err,
                );
              }
              return {
                ...project,
                starred: false,
                filesystemExists: true,
                isManaged: false,
              };
            }),
          );

          setProjects(projectsWithStatus);

          // Auto-sync configured projects in background
          const configuredProjects = projectsWithStatus.filter(
            (p: RuntimeProject) => p.hasConfig,
          );
          for (const project of configuredProjects) {
            fetch(`/api/projects/${encodeURIComponent(project.name)}/sync`, {
              method: 'POST',
            }).catch(err => {
              console.warn(`[Sync] Failed to sync ${project.name}:`, err);
            });
          }
        } else {
          setError('Not running in Electron environment');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load projects',
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  // Sort projects by updatedAt or createdAt (newest first)
  const sortedProjects = [...projects].sort((a, b) => {
    const aActive = !!a.isManaged || !!a.hasConfig;
    const bActive = !!b.isManaged || !!b.hasConfig;
    if (aActive !== bActive) return aActive ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const configuredProjects = sortedProjects.filter(p => p.hasConfig);
  const starredProjects = configuredProjects.filter(p => p.starred);
  const unconfiguredProjects = sortedProjects.filter(p => !p.hasConfig);

  // Toggle starred status for configured projects
  async function handleToggleStar(project: RuntimeProject) {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/star`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ starred: !project.starred }),
        },
      );

      if (!response.ok) {
        toast.error('Failed to update star status');
        return;
      }

      setProjects(prev =>
        prev.map(p =>
          p.name === project.name
            ? {
                ...p,
                starred: !project.starred,
              }
            : p,
        ),
      );

      toast.success(
        `${project.name} ${project.starred ? 'removed from favorites' : 'added to favorites'}`,
      );
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update star status');
    }
  }

  // Sort all projects alphabetically A-Z
  const allProjectsSorted = [...projects].sort((a, b) => {
    const aActive = !!a.isManaged || !!a.hasConfig;
    const bActive = !!b.isManaged || !!b.hasConfig;
    if (aActive !== bActive) return aActive ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const visibleProjects = showNonAppLabProjects
    ? allProjectsSorted
    : allProjectsSorted.filter(p => p.hasConfig);

  const starredProjectsSorted = [...starredProjects].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  // Unified columns for all projects
  const projectColumns: ReportColumnDefinition<RuntimeProject>[] = [
    {
      header: 'Project',
      key: 'name',
      sortable: true,
      cellFn: project => (
        <div className="flex items-center gap-3 h-10 group/row">
          <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-foreground truncate">
              {project.name}
            </span>
            {project.hasConfig && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleToggleStar(project);
                }}
                className={`shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity ${project.starred ? 'opacity-100' : ''}`}
                aria-label={project.starred ? 'Unstar project' : 'Star project'}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    project.starred
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-muted-foreground hover:text-yellow-400'
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      cellFn: project => (
        <div className="h-10 flex items-center">
          <span className="text-sm whitespace-nowrap">
            {project.filesystemExists === false ? (
              <span className="text-red-500">Missing on disk</span>
            ) : project.hasConfig ? (
              <span className="text-green-500">Configured</span>
            ) : (
              <span className="text-muted-foreground">Not configured</span>
            )}
          </span>
        </div>
      ),
    },
    {
      header: 'Apps',
      key: 'apps',
      cellFn: project => (
        <div className="h-10 flex items-center">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {project.hasConfig ? (project.apps?.length ?? 0) : '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Path',
      key: 'path',
      cellFn: project => (
        <div className="h-10 flex items-center">
          <code className="text-xs text-muted-foreground truncate max-w-[300px]">
            {project.path}
          </code>
        </div>
      ),
    },
    {
      header: 'Actions',
      cellFn: project => (
        <div className="h-10 flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={e => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              {!project.hasConfig && (
                <>
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      handleInitializeProject(project);
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Initialize SummonIQ Project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      handleIgnoreProject(project);
                    }}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ignore
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {project.hasConfig && (
                <>
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      handleReconcileProject(project);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reconcile Config
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteProject(project);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: '80px',
    },
  ];

  const handleCreateProject = async (projectData: any) => {
    console.log('[ProjectsPage] Creating project:', projectData);

    toast.loading(`Creating ${projectData.name}...`, {
      id: `create-${projectData.name}`,
    });

    try {
      // TODO: Auto-init git repo and sync to GitHub (create repo, set origin, push) when enabled.
      // TODO: Optionally provision Vercel project + env vars and trigger initial deployment.
      // Step 1: Create SummonIQ config file (this will also create the directory if needed)
      console.log('[ProjectsPage] Creating config file at:', projectData.path);
      const configResponse = await fetch(
        `/api/projects/${encodeURIComponent(projectData.name)}/initialize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectPath: projectData.path }),
        },
      );

      if (!configResponse.ok) {
        const configError = await configResponse.json();
        console.error('[ProjectsPage] Failed to create config:', configError);
        toast.error('Failed to create SummonIQ config', {
          id: `create-${projectData.name}`,
        });
        return;
      }

      const configResult = await configResponse.json();
      console.log(
        '[ProjectsPage] Config created successfully at:',
        configResult.configPath,
      );

      // Step 2: Add to database
      const dbResponse = await fetch(
        `/api/projects/${encodeURIComponent(projectData.name)}/manage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: projectData.path,
            description: projectData.description || '',
          }),
        },
      );

      if (dbResponse.ok) {
        toast.success(`${projectData.name} created successfully!`, {
          id: `create-${projectData.name}`,
        });

        // Close modal and navigate to project detail page
        setShowNewProjectModal(false);
        router.push(`/projects/${encodeURIComponent(projectData.name)}`);
      } else {
        const dbError = await dbResponse.json();
        console.error('[ProjectsPage] Failed to add to database:', dbError);
        toast.error('Failed to add project to database', {
          id: `create-${projectData.name}`,
        });
      }
    } catch (err) {
      console.error('[ProjectsPage] Error creating project:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to create project',
        { id: `create-${projectData.name}` },
      );
    }
  };

  const handleInitializeProject = async (project: RuntimeProject) => {
    console.log('[ProjectsPage] Initializing project:', project.name);

    toast.loading(`Initializing ${project.name}...`, {
      id: `init-${project.name}`,
    });

    try {
      // TODO: Offer to connect existing projects to GitHub/Vercel during initialization.
      const projectPath =
        project.path ||
        buildProjectsPath(normalizedProjectsBasePath, project.name);

      // Step 1: Create SummonIQ config file
      console.log('[ProjectsPage] Creating config file at:', projectPath);
      const configResponse = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/initialize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectPath }),
        },
      );

      if (!configResponse.ok) {
        const configError = await configResponse.json();
        console.error('[ProjectsPage] Failed to create config:', configError);
        toast.error('Failed to create SummonIQ config', {
          id: `init-${project.name}`,
        });
        return;
      }

      const configResult = await configResponse.json();
      console.log(
        '[ProjectsPage] Config created successfully at:',
        configResult.configPath,
      );

      // Step 2: Add to database
      const dbResponse = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/manage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: projectPath,
            description: project.description || '',
          }),
        },
      );

      if (dbResponse.ok) {
        toast.success(`${project.name} initialized successfully!`, {
          id: `init-${project.name}`,
        });
        // Refresh with delay to allow file system sync
        setTimeout(async () => {
          await refreshProjects();
        }, 2000);
      } else {
        const errorData = await dbResponse.json();
        console.error('[ProjectsPage] Failed to add to DB:', errorData);
        toast.error(errorData.message || 'Failed to add project to database', {
          id: `init-${project.name}`,
        });
      }
    } catch (error) {
      console.error('Error initializing project:', error);
      toast.error('Failed to initialize SummonIQ', {
        id: `init-${project.name}`,
      });
    }
  };

  const handleIgnoreProject = async (project: RuntimeProject) => {
    console.log('[ProjectsPage] Ignoring project:', project.name);
    toast.success(`${project.name} will be ignored`);
    // TODO: Implement project ignore persistence (e.g., save to local storage or database)
  };

  const handleReconcileProject = async (project: RuntimeProject) => {
    console.log('[ProjectsPage] Reconciling project:', project.name);
    toast.loading(`Checking ${project.name}...`, {
      id: `reconcile-${project.name}`,
    });

    try {
      // First check for issues
      const checkResponse = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/reconcile`,
      );

      if (!checkResponse.ok) {
        toast.error('Failed to check project', {
          id: `reconcile-${project.name}`,
        });
        return;
      }

      const checkResult = await checkResponse.json();

      if (!checkResult.hasIssues) {
        toast.success(`${project.name} is already in sync`, {
          id: `reconcile-${project.name}`,
        });
        return;
      }

      // Show issues and ask to fix
      const issueDescriptions = checkResult.issues
        .map((i: { description: string }) => `• ${i.description}`)
        .join('\n');

      const confirmed = window.confirm(
        `Found ${checkResult.issues.length} issue(s) with "${project.name}":\n\n${issueDescriptions}\n\nWould you like to fix these automatically?`,
      );

      if (!confirmed) {
        toast.dismiss(`reconcile-${project.name}`);
        return;
      }

      // Apply fixes
      toast.loading(`Fixing ${project.name}...`, {
        id: `reconcile-${project.name}`,
      });

      const fixResponse = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/reconcile`,
        { method: 'POST' },
      );

      if (fixResponse.ok) {
        const fixResult = await fixResponse.json();
        toast.success(
          `${project.name} reconciled: ${fixResult.fixes.length} fix(es) applied`,
          { id: `reconcile-${project.name}` },
        );
        await refreshProjects();
      } else {
        const error = await fixResponse.json();
        toast.error(error.error || 'Failed to reconcile project', {
          id: `reconcile-${project.name}`,
        });
      }
    } catch (error) {
      console.error('Error reconciling project:', error);
      toast.error('Failed to reconcile project', {
        id: `reconcile-${project.name}`,
      });
    }
  };

  const handleDeleteProject = (project: RuntimeProject) => {
    setDeleteTarget(project);
  };

  const handleConfirmDeleteProject = async (options: {
    deleteFiles: boolean;
  }) => {
    if (!deleteTarget) return;

    setIsDeletingProject(true);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(deleteTarget.name)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deleteFiles: options.deleteFiles,
            path: deleteTarget.path,
          }),
        },
      );

      if (response.ok) {
        toast.success(`${deleteTarget.name} deleted successfully`);
        setDeleteTarget(null);
        await refreshProjects();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeletingProject(false);
    }
  };

  const refreshProjects = async () => {
    console.log('[ProjectsPage] Refreshing projects...');
    if (typeof window !== 'undefined' && window.electron) {
      const data = await window.electron.projects.getAll();
      console.log('[ProjectsPage] Got projects:', data.length, 'projects');
      console.log(
        '[ProjectsPage] Configured:',
        data.filter(p => p.hasConfig).length,
      );
      console.log(
        '[ProjectsPage] Unconfigured:',
        data.filter(p => !p.hasConfig).length,
      );

      // Fetch status from database for each project
      const projectsWithStatus = await Promise.all(
        data.map(async (project: RuntimeProject) => {
          try {
            const response = await fetch(
              `/api/projects/${encodeURIComponent(project.name)}/manage`,
            );
            if (response.ok) {
              const dbData = await response.json();
              return {
                ...project,
                starred: dbData.project?.starred || false,
                filesystemExists: dbData.filesystemExists ?? true,
                isManaged: dbData.isManaged ?? false,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch status for ${project.name}:`, err);
          }
          return {
            ...project,
            starred: false,
            filesystemExists: true,
            isManaged: false,
          };
        }),
      );

      // Log all project names and their config status
      projectsWithStatus.forEach(p => {
        console.log(
          `[ProjectsPage] ${p.name}: hasConfig=${p.hasConfig}, starred=${p.starred}, filesystemExists=${p.filesystemExists}, path=${p.path}`,
        );
      });

      setProjects(projectsWithStatus);
    }
  };

  return (
    <Page>
      <PageHeader
        actions={
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={showNonAppLabProjects}
                onCheckedChange={setShowNonAppLabProjects}
              />
              Show non-AppLab projects
            </label>
            <Button
              variant="default"
              onClick={() => setShowNewProjectModal(true)}
            >
              New Project
            </Button>
          </div>
        }
        title="Projects"
        description={
          <>
            All projects from {projectsBaseDisplay} • {starredProjects.length}{' '}
            starred • {unconfiguredProjects.length}{' '}
            {showNonAppLabProjects ? 'unconfigured' : 'unconfigured hidden'}
          </>
        }
      />

      <PageContent>
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div />
              </div>

              {starredProjectsSorted.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Starred
                  </h3>
                  <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2 pr-2">
                    {starredProjectsSorted.map(project => (
                      <div key={project.id} className="flex-none w-[360px]">
                        <ProjectCard
                          project={project}
                          onStarChange={() => {
                            void refreshProjects();
                          }}
                          onDelete={() => {
                            void refreshProjects();
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {visibleProjects.length > 0 ? (
                <Report<RuntimeProject>
                  className="h-auto"
                  data={visibleProjects}
                  definition={{
                    columns: projectColumns,
                    data: visibleProjects,
                    view: 'table' as any,
                    sortBy: 'name',
                    activeFilters: [],
                    filters: [],
                  }}
                  onRowClick={project => {
                    if (project.hasConfig) {
                      router.push(
                        `/projects/${encodeURIComponent(project.name)}`,
                      );
                    }
                  }}
                  search={true}
                  emptyState={{
                    title: 'No projects found',
                    description: `No projects found in ${projectsBaseDisplay}`,
                  }}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
                  <p className="text-base font-medium text-foreground mb-2">
                    No projects found
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a new project or add folders to {projectsBaseDisplay}{' '}
                    to get started.
                  </p>
                  <Button onClick={() => setShowNewProjectModal(true)}>
                    Create Project
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContent>

      <DeleteProjectModal
        open={!!deleteTarget}
        onOpenChange={open => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        project={deleteTarget}
        onConfirm={handleConfirmDeleteProject}
        isDeleting={isDeletingProject}
      />

      {/* New Project Modal */}
      <ProjectModal
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
        onSave={handleCreateProject}
        defaultBasePath={normalizedProjectsBasePath}
        defaultDisplayBasePath={projectsBaseDisplay}
      />
    </Page>
  );
}
