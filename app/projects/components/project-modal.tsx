'use client';

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/app/components/modal';
import { Button, Input, Label, Textarea } from '@summoniq/applab-ui';
import { FolderOpen, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: {
    id?: string;
    name: string;
    description: string;
    path?: string;
  };
  onSave?: (project: any) => void | Promise<void>;
  defaultBasePath?: string;
  defaultDisplayBasePath?: string;
}

const DEFAULT_BASE_PATH = '/Users/steven/Projects';
const DEFAULT_DISPLAY_BASE_PATH = '~/Projects';

const normalizePath = (value?: string) => {
  if (!value) {
    return DEFAULT_BASE_PATH;
  }
  return value.replace(/[\\/]+$/, '') || DEFAULT_BASE_PATH;
};

const buildPath = (base: string, segment?: string) => {
  if (!segment) {
    return base;
  }
  const separator = base.includes('\\') ? '\\' : '/';
  return `${base}${separator}${segment}`;
};

const normalizeDisplayPath = (value?: string) => {
  if (!value) {
    return DEFAULT_DISPLAY_BASE_PATH;
  }
  return value.replace(/[\\/]+$/, '') || DEFAULT_DISPLAY_BASE_PATH;
};

export function ProjectModal({
  open,
  onOpenChange,
  project,
  onSave,
  defaultBasePath,
  defaultDisplayBasePath,
}: ProjectModalProps) {
  const isEdit = !!project?.id;
  const initialBasePath = normalizePath(defaultBasePath);
  const initialDisplayBasePath = normalizeDisplayPath(
    defaultDisplayBasePath,
  );
  const [projectName, setProjectName] = useState(project?.name || '');
  const [projectDescription, setProjectDescription] = useState(
    project?.description || '',
  );
  const [projectPath, setProjectPath] = useState(
    project?.path || initialBasePath,
  );
  const [basePath, setBasePath] = useState(initialBasePath);
  const [displayBasePath, setDisplayBasePath] =
    useState(initialDisplayBasePath);
  const [isPathManuallyEdited, setIsPathManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add GitHub + Vercel connection fields (repo, team, deployment target) with optional auto-setup on create.
  // TODO: Add publish workflow options (create PR, request agent review, auto-merge + deploy) for new projects.
  // Keep base path in sync with provided defaults
  useEffect(() => {
    if (defaultBasePath) {
      setBasePath(normalizePath(defaultBasePath));
    }
  }, [defaultBasePath]);

  useEffect(() => {
    if (defaultDisplayBasePath) {
      setDisplayBasePath(normalizeDisplayPath(defaultDisplayBasePath));
    }
  }, [defaultDisplayBasePath]);

  // Fetch base path from Electron when defaults aren't provided
  useEffect(() => {
    if (defaultBasePath) {
      return;
    }
    if (typeof window === 'undefined' || !window.electron?.projects?.getBasePath) {
      return;
    }

    let isMounted = true;

    window.electron.projects
      .getBasePath()
      .then(result => {
        if (!isMounted || !result?.path) {
          return;
        }
        setBasePath(normalizePath(result.path));
        setDisplayBasePath(
          normalizeDisplayPath(result.display || result.path),
        );
      })
      .catch(() => {
        // Ignore errors and keep defaults
      });

    return () => {
      isMounted = false;
    };
  }, [defaultBasePath]);

  // Reset form when modal opens
  useEffect(() => {
    if (open && !isEdit) {
      setProjectName('');
      setProjectDescription('');
      setProjectPath(basePath);
      setIsPathManuallyEdited(false);
      setError(null);
    } else if (open && isEdit && project) {
      setProjectName(project.name || '');
      setProjectDescription(project.description || '');
      setProjectPath(project.path || basePath);
      setIsPathManuallyEdited(true); // Existing projects are considered manually set
    }
  }, [open, isEdit, project, basePath]);

  // Auto-update path when project name or base path changes (unless manually edited)
  useEffect(() => {
    if (!open || isEdit || isPathManuallyEdited) {
      return;
    }

    if (projectName) {
      setProjectPath(buildPath(basePath, projectName));
    } else {
      setProjectPath(basePath);
    }
  }, [projectName, basePath, open, isEdit, isPathManuallyEdited]);

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (!projectPath.trim()) {
      setError('Project path is required');
      return;
    }

    setSaving(true);
    try {
      if (onSave) {
        await onSave({
          name: projectName,
          description: projectDescription,
          path: projectPath,
        });
      }
      onOpenChange(false);
      // Reset form
      setProjectName('');
      setProjectDescription('');
      setProjectPath(basePath);
      setIsPathManuallyEdited(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl w-full">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            {isEdit ? 'Edit Project' : 'Create New Project'}
          </ModalTitle>
          <ModalDescription>
            {isEdit
              ? 'Update project information'
              : 'Add a new project to your workspace'}
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 p-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="my-awesome-project"
              disabled={isEdit}
            />
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? 'Project name cannot be changed'
                : 'A unique identifier for this project'}
            </p>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={projectDescription}
              onChange={e => setProjectDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={3}
            />
          </div>

          {/* Project Path */}
          <div className="space-y-2">
            <Label htmlFor="project-path">Project Path *</Label>
            <Input
              id="project-path"
              value={projectPath}
              onChange={e => {
                const newValue = e.target.value;
                setProjectPath(newValue);
                // If user clears the field, allow auto-updating again
                if (newValue === '') {
                  setIsPathManuallyEdited(false);
                } else {
                  setIsPathManuallyEdited(true);
                }
              }}
              placeholder={buildPath(displayBasePath, 'my-project')}
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!projectName || !projectPath || saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FolderOpen className="w-4 h-4" />
                {isEdit ? 'Save Changes' : 'Create Project'}
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
