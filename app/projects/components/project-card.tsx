'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@summoniq/applab-ui';
import {
  FolderOpen,
  Loader2,
  MoreHorizontal,
  Server,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteProjectModal } from '@/app/projects/components/delete-project-modal';

interface ProjectCardProps {
  project: {
    name: string;
    description: string;
    path?: string;
    hasConfig?: boolean;
    apps?: any[];
    starred?: boolean;
    filesystemExists?: boolean;
  };
  onInitialize?: () => void;
  onStarChange?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({
  project,
  onInitialize,
  onStarChange,
  onDelete,
}: ProjectCardProps) {
  const { name, description, hasConfig = true, starred = false } = project;
  const Icon = FolderOpen;
  const [isInitializing, setIsInitializing] = useState(false);
  const [portRange, setPortRange] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(starred);
  const [isTogglingstar, setIsTogglingstar] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isDisabled = !hasConfig;

  // Sync starred state when prop changes
  useEffect(() => {
    setIsStarred(starred);
  }, [starred]);

  // Fetch port range for configured projects
  useEffect(() => {
    if (hasConfig) {
      fetch(`/api/projects/${encodeURIComponent(name)}/port-range`)
        .then(res => res.json())
        .then(data => {
          if (data.portRange && data.portRange !== 'No ports assigned') {
            setPortRange(data.portRange);
          }
        })
        .catch(err => {
          console.error('Failed to fetch port range:', err);
        });
    }
  }, [name, hasConfig]);

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsTogglingstar(true);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(name)}/star`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ starred: !isStarred }),
        },
      );

      if (response.ok) {
        setIsStarred(!isStarred);
        if (onStarChange) {
          onStarChange();
        }
      } else {
        toast.error('Failed to update star status');
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update star status');
    } finally {
      setIsTogglingstar(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (options: { deleteFiles: boolean }) => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(name)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deleteFiles: options.deleteFiles,
            path: project.path,
          }),
        },
      );

      if (response.ok) {
        toast.success(`${name} deleted successfully`);
        setShowDeleteModal(false);
        if (onDelete) {
          onDelete();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInitialize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsInitializing(true);
    try {
      const projectPath = project.path || `/Users/steven/Projects/${name}`;

      // Step 1: Create SummonIQ config file
      console.log('[ProjectCard] Creating config file at:', projectPath);
      const configResponse = await fetch(
        `/api/projects/${encodeURIComponent(name)}/initialize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectPath }),
        },
      );

      if (!configResponse.ok) {
        const configError = await configResponse.json();
        console.error('[ProjectCard] Failed to create config:', configError);
        toast.error('Failed to create SummonIQ config');
        return;
      }

      const configResult = await configResponse.json();
      console.log(
        '[ProjectCard] Config created successfully at:',
        configResult.configPath,
      );
      console.log('[ProjectCard] Adding to database...');

      // Step 2: Add to database
      const dbResponse = await fetch(
        `/api/projects/${encodeURIComponent(name)}/manage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: projectPath,
            description: description || '',
          }),
        },
      );

      if (dbResponse.ok) {
        toast.success(`${name} initialized successfully!`);
        console.log(
          '[ProjectCard] Project initialized, refreshing list in 3s...',
        );
        // Call refresh callback with longer delay to allow file system to fully sync
        if (onInitialize) {
          setTimeout(async () => {
            console.log('[ProjectCard] Calling refresh...');
            await onInitialize();
          }, 3000);
        } else {
          setTimeout(() => window.location.reload(), 3000);
        }
      } else {
        const errorData = await dbResponse.json();
        console.error('[ProjectCard] Failed to add to DB:', errorData);
        toast.error('Failed to add project to database');
      }
    } catch (error) {
      console.error('Error initializing project:', error);
      toast.error('Failed to initialize SummonIQ');
    } finally {
      setIsInitializing(false);
    }
  };

  const cardContent = (
    <>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`p-2 rounded-md ${isDisabled ? 'bg-muted' : 'bg-primary/10'}`}
        >
          <Icon
            className={`w-5 h-5 ${isDisabled ? 'text-muted-foreground' : 'text-primary'}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base truncate">
            {name}
          </h3>
          {!isDisabled && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {project.apps?.length || 0} app
                {project.apps?.length !== 1 ? 's' : ''}
              </span>
              {portRange && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    <span>{portRange}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isDisabled && (
            <button
              onClick={handleToggleStar}
              disabled={isTogglingstar}
              className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              title={isStarred ? 'Unstar project' : 'Star project'}
            >
              <Star
                className={`w-4 h-4 ${
                  isStarred
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={e => e.preventDefault()}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isDisabled && (
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded ml-1">
            No Config
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>
    </>
  );

  if (isDisabled) {
    return (
      <>
        <div className="group relative bg-card border border-border rounded-lg p-5 opacity-60 hover:opacity-100 transition-all">
          {cardContent}

          {/* Initialize Button Overlay */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={handleInitialize}
              disabled={isInitializing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Initialize SummonIQ
                </>
              )}
            </button>
          </div>
        </div>
        <DeleteProjectModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          project={project}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  return (
    <>
      <Link
        className="block group relative bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
        href={`/projects/${name}`}
      >
        {cardContent}
      </Link>
      <DeleteProjectModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        project={project}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
