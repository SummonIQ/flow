"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/studio/ui/modal";

interface DeletePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageName: string;
  onDelete: () => void;
}

export function DeletePageModal({
  open,
  onOpenChange,
  pageName,
  onDelete,
}: DeletePageModalProps) {
  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Delete Page</ModalTitle>
          <ModalDescription>
            This removes the page and its components from the project.
          </ModalDescription>
        </ModalHeader>

        <ModalBody>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{pageName}</span>?
          </p>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
