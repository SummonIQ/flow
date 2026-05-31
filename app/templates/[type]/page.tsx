'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@summoniq/applab-ui';
import {
  FilePlus,
  FileText,
  FolderPlus,
  Plus,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TemplateEditor } from './components/template-editor';
import { TemplateFileTree } from './components/template-file-tree';

interface TemplateFile {
  id: string;
  path: string;
  content: string;
  isDirectory: boolean;
}

interface Template {
  id: string;
  name: string;
  type: string;
  description: string | null;
  framework: string;
  version: string;
  files: TemplateFile[];
}

export default function TemplateEditorPage() {
  const params = useParams();
  const type = params.type as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedFile, setSelectedFile] = useState<TemplateFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    file: TemplateFile | null;
  }>({ open: false, file: null });
  const [deleting, setDeleting] = useState(false);
  const [addFileModal, setAddFileModal] = useState<{
    open: boolean;
    isDirectory: boolean;
  }>({ open: false, isDirectory: false });
  const [newFilePath, setNewFilePath] = useState('');
  const [addingFile, setAddingFile] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [type]);

  async function loadTemplate() {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/by-type/${type}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
        // Don't auto-select a file - let user choose
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveFile(content: string) {
    if (!selectedFile || !template) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/templates/${template.id}/files/${selectedFile.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        },
      );

      if (response.ok) {
        // Update local state
        setTemplate({
          ...template,
          files: template.files.map(f =>
            f.id === selectedFile.id ? { ...f, content } : f,
          ),
        });
        setSelectedFile({ ...selectedFile, content });
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setSaving(false);
    }
  }

  async function promptDeleteFile(file: TemplateFile) {
    setDeleteConfirm({ open: true, file });
  }

  async function confirmDelete() {
    if (!template || !deleteConfirm.file) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/templates/${template.id}/files/${deleteConfirm.file.id}`,
        {
          method: 'DELETE',
        },
      );

      if (response.ok) {
        // Update local state - remove the file
        const updatedFiles = template.files.filter(
          f => f.id !== deleteConfirm.file!.id,
        );
        setTemplate({
          ...template,
          files: updatedFiles,
        });

        // If the deleted file was selected, clear selection
        if (selectedFile?.id === deleteConfirm.file.id) {
          setSelectedFile(null);
        }

        toast.success(
          `Deleted ${deleteConfirm.file.isDirectory ? 'folder' : 'file'}: ${deleteConfirm.file.path}`,
        );
        setDeleteConfirm({ open: false, file: null });
      } else {
        toast.error('Failed to delete. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('An error occurred while deleting.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddFile() {
    if (!template || !newFilePath.trim()) return;

    setAddingFile(true);
    try {
      const response = await fetch(`/api/templates/${template.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: newFilePath.trim(),
          content: addFileModal.isDirectory ? '' : '// New file\n',
          isDirectory: addFileModal.isDirectory,
        }),
      });

      if (response.ok) {
        const newFile = await response.json();
        setTemplate({
          ...template,
          files: [...template.files, newFile],
        });
        toast.success(
          `Created ${addFileModal.isDirectory ? 'folder' : 'file'}: ${newFilePath}`,
        );
        setAddFileModal({ open: false, isDirectory: false });
        setNewFilePath('');

        // Auto-select the new file if it's not a directory
        if (!addFileModal.isDirectory) {
          setSelectedFile(newFile);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create file');
      }
    } catch (error) {
      console.error('Failed to add file:', error);
      toast.error('An error occurred while creating the file.');
    } finally {
      setAddingFile(false);
    }
  }

  const typeNames: Record<string, string> = {
    'web-app': 'Web Application',
    'mobile-app': 'Mobile App',
    'desktop-app': 'Desktop App',
    api: 'API Service',
    'marketing-site': 'Marketing Site',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">No template found</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create a template for {typeNames[type] || type}
          </p>
          <Button
            onClick={() => {
              /* TODO: Create template */
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Page className="h-full">
      {/* Header */}
      <PageHeader
        title={template.name}
        description={
          <>
            {typeNames[type]} Template • {template.framework} • v
            {template.version}
          </>
        }
        actions={
          <>
            <Button
              onClick={() =>
                setAddFileModal({ open: true, isDirectory: false })
              }
              variant="outline"
              size="sm"
            >
              <FilePlus className="w-4 h-4 mr-2" />
              Add File
            </Button>
            <Button
              onClick={() => setAddFileModal({ open: true, isDirectory: true })}
              variant="outline"
              size="sm"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Add Folder
            </Button>
            <Button onClick={loadTemplate} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() =>
                selectedFile && handleSaveFile(selectedFile.content)
              }
              disabled={saving}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File tree */}
        <div className="w-64 border-r border-border bg-muted/30 overflow-auto">
          <TemplateFileTree
            files={template.files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            onDelete={promptDeleteFile}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {selectedFile ? (
            <TemplateEditor
              file={selectedFile}
              onSave={handleSaveFile}
              saving={saving}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center text-center max-w-md px-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No File Selected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a file from the file tree to view and edit its contents
                </p>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-mono">⌘</span>
                    </div>
                    <span>Click any file in the tree to open</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px]">⇧</span>
                    </div>
                    <span>Right-click to delete files or folders</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirm.open}
        onOpenChange={open =>
          !deleting && setDeleteConfirm({ open, file: deleteConfirm.file })
        }
      >
        <ModalContent variant="default" showOverlay>
          <ModalHeader>
            <ModalTitle>
              Delete {deleteConfirm.file?.isDirectory ? 'Folder' : 'File'}
            </ModalTitle>
            <ModalDescription>
              Are you sure you want to delete{' '}
              <span className="font-mono">{deleteConfirm.file?.path}</span>?
              {deleteConfirm.file?.isDirectory
                ? ' This will delete the folder and all its contents.'
                : ''}{' '}
              This action cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, file: null })}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add File/Folder Modal */}
      <Modal
        open={addFileModal.open}
        onOpenChange={open => {
          if (!addingFile) {
            setAddFileModal({ ...addFileModal, open });
            if (!open) setNewFilePath('');
          }
        }}
      >
        <ModalContent variant="default">
          <ModalHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {addFileModal.isDirectory ? (
                  <FolderPlus className="w-5 h-5 text-primary" />
                ) : (
                  <FilePlus className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <ModalTitle>
                  Add {addFileModal.isDirectory ? 'Folder' : 'File'}
                </ModalTitle>
                <ModalDescription>
                  Enter the path for the new{' '}
                  {addFileModal.isDirectory ? 'folder' : 'file'}
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="px-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="file-path">Path</Label>
                <Input
                  id="file-path"
                  placeholder={
                    addFileModal.isDirectory
                      ? 'e.g., components/ui'
                      : 'e.g., package.json'
                  }
                  value={newFilePath}
                  onChange={e => setNewFilePath(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newFilePath.trim()) {
                      handleAddFile();
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Use forward slashes for nested paths (e.g.,
                  app/components/Button.tsx)
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddFileModal({ open: false, isDirectory: false });
                setNewFilePath('');
              }}
              disabled={addingFile}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFile}
              disabled={addingFile || !newFilePath.trim()}
            >
              {addingFile ? 'Creating...' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Page>
  );
}
