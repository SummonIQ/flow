'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@summoniq/applab-ui';
import {
  ArrowLeft,
  Code,
  Edit,
  ExternalLink,
  FolderOpen,
  MoreHorizontal,
  SquarePlus,
  Star,
  Terminal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppModal } from '../../components/app-modal';
import { ProjectModal } from '../../components/project-modal';

interface ProjectHeaderProps {
  project: {
    name: string;
    description: string;
    path?: string;
    apps?: any[];
    starred?: boolean;
  };
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();
  const [showAppModal, setShowAppModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isStarred, setIsStarred] = useState(project.starred || false);

  // Sync starred state when project prop changes
  useEffect(() => {
    setIsStarred(project.starred || false);
  }, [project.starred]);

  const handleCreateApp = async (appData: any) => {
    console.log('[ProjectHeader] Creating app:', appData);

    toast.loading(`Creating ${appData.name}...`, {
      id: `create-app-${appData.name}`,
    });

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/apps`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ProjectHeader] Failed to create app:', errorData);
        toast.error(errorData.error || 'Failed to create application', {
          id: `create-app-${appData.name}`,
        });
        throw new Error(errorData.error || 'Failed to create application');
      }

      const result = await response.json();
      console.log('[ProjectHeader] App created successfully:', result);

      toast.success(`${appData.name} created successfully!`, {
        id: `create-app-${appData.name}`,
      });
      window.location.reload();
    } catch (err) {
      console.error('[ProjectHeader] Error creating app:', err);
      if (!(err instanceof Error && err.message.includes('Failed to create'))) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to create application',
          { id: `create-app-${appData.name}` },
        );
      }
      throw err;
    }
  };

  const handleOpenInEditor = async () => {
    if (project?.path && window.electron) {
      const result = await window.electron.applications.openInEditor(
        project.path,
      );
      if (!result.success) {
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
        toast.error(result.error || 'Failed to open folder');
      }
    }
  };

  const handleOpenTerminal = async () => {
    if (project?.path && window.electron) {
      const result = await window.electron.applications.openTerminal(
        project.path,
      );
      if (!result.success) {
        toast.error(result.error || 'Failed to open terminal');
      }
    }
  };

  const handleUpdateProject = async (projectData: any) => {
    console.log('[ProjectHeader] Updating project:', projectData);

    toast.loading(`Updating ${projectData.name}...`, { id: `update-project` });

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      const result = await response.json();
      console.log('[ProjectHeader] Project updated:', result);

      toast.success('Project updated successfully!', { id: `update-project` });

      // If name changed, navigate to new URL
      if (projectData.name !== project.name) {
        router.push(`/projects/${encodeURIComponent(projectData.name)}`);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('[ProjectHeader] Error updating project:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to update project',
        { id: `update-project` },
      );
    }
  };

  const handleToggleStar = async () => {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/star`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ starred: !isStarred }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ProjectHeader] Failed to toggle star:', errorData);
        toast.error(errorData.error || 'Failed to update star status');
        return;
      }

      setIsStarred(!isStarred);
      toast.success(
        isStarred ? 'Removed from favorites' : 'Added to favorites',
      );
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update star status');
    }
  };

  return (
    <div className="bg-card">
      <div className="px-6 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Projects
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
            <FolderOpen className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {project.name}
              </h1>
              <button
                onClick={handleToggleStar}
                className="shrink-0 transition-colors"
                aria-label={isStarred ? 'Unstar project' : 'Star project'}
              >
                <Star
                  className={`h-5 w-5 ${
                    isStarred
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-muted-foreground hover:text-yellow-400'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenInEditor}>
                  <Code className="w-4 h-4 mr-2" />
                  Open in Editor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenFolder}>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Open Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenTerminal}>
                  <Terminal className="w-4 h-4 mr-2" />
                  Open Terminal
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Docs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => setShowProjectModal(true)}
              variant="outline"
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button onClick={() => setShowAppModal(true)} className="gap-2">
              <SquarePlus className="w-4 h-4" />
              Add App
            </Button>
          </div>
        </div>
      </div>

      {/* App Modal */}
      <AppModal
        open={showAppModal}
        onOpenChange={setShowAppModal}
        projectName={project.name}
        onSave={handleCreateApp}
      />

      {/* Project Modal */}
      <ProjectModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        project={project}
        onSave={handleUpdateProject}
      />
    </div>
  );
}
