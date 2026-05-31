'use client';

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/app/components/modal';
import { Button, Checkbox } from '@summoniq/applab-ui';
import { useEffect, useState } from 'react';

interface DeleteProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: {
    name: string;
    path?: string;
    filesystemExists?: boolean;
  } | null;
  onConfirm: (options: { deleteFiles: boolean }) => void;
  isDeleting?: boolean;
}

export function DeleteProjectModal({
  open,
  onOpenChange,
  project,
  onConfirm,
  isDeleting = false,
}: DeleteProjectModalProps) {
  const [deleteFiles, setDeleteFiles] = useState(false);
  const filesystemAvailable = project?.filesystemExists !== false;

  useEffect(() => {
    if (open) {
      setDeleteFiles(false);
    }
  }, [open, project?.name]);

  const handleConfirm = () => {
    onConfirm({ deleteFiles: deleteFiles && filesystemAvailable });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg w-full">
        <ModalHeader>
          <ModalTitle>Delete Project</ModalTitle>
          <ModalDescription>
            Remove this project from SummonIQ. You can optionally delete the
            project files from disk.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              {project?.name || 'this project'}
            </span>
            ?
          </p>

          {project?.path && (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground break-all">
              Project folder: {project.path}
            </div>
          )}

          <div className="space-y-2">
            <Checkbox
              ariaLabel="Delete project files from disk"
              checked={deleteFiles}
              className={`items-start ${
                filesystemAvailable ? '' : 'pointer-events-none opacity-60'
              }`}
              label="Also delete project files from disk"
              onCheckedChange={setDeleteFiles}
            />
            <p className="text-xs text-muted-foreground">
              This permanently deletes the project folder and cannot be undone.
            </p>
            {!filesystemAvailable && (
              <p className="text-xs text-muted-foreground">
                Project files were not found on disk.
              </p>
            )}
          </div>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
