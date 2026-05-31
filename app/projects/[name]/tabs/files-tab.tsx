'use client';

import { Button, Card } from '@summoniq/applab-ui';
import { Editor } from '@monaco-editor/react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  File,
  FileCode,
  FileImage,
  FileJson,
  FilePlus,
  Folder,
  FolderPlus,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { toast } from 'sonner';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FilesTabProps {
  project: {
    name: string;
    path?: string;
  };
}

// Binary file extensions that cannot be edited
const BINARY_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'ico',
  'webp',
  'svg',
  'mp3',
  'mp4',
  'wav',
  'ogg',
  'webm',
  'avi',
  'mov',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'zip',
  'tar',
  'gz',
  'rar',
  '7z',
  'exe',
  'dll',
  'so',
  'dylib',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'otf',
];

export function FilesTab({ project }: FilesTabProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [projectPath, setProjectPath] = useState<string | null>(
    project.path || null,
  );

  // File operation modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'directory'>('file');
  const [createParentPath, setCreateParentPath] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');
  const [targetNode, setTargetNode] = useState<FileNode | null>(null);
  const [contextMenuNode, setContextMenuNode] = useState<FileNode | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const hasChanges = fileContent !== originalContent;

  // Load project path from database if not provided
  useEffect(() => {
    async function loadProjectPath() {
      if (projectPath) return;

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(project.name)}/manage`,
        );
        if (response.ok) {
          const data = await response.json();
          if (typeof data.path === 'string' && data.path) {
            setProjectPath(data.path);
          }
        }
      } catch (error) {
        console.error('Failed to load project path:', error);
      }
    }

    loadProjectPath();
  }, [project.name, projectPath]);

  useEffect(() => {
    if (projectPath) {
      loadFileTree();
    } else {
      setLoading(false);
    }
  }, [project.name, projectPath]);

  const loadFileTree = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/files`,
      );

      if (response.ok) {
        const data = await response.json();
        setFileTree(data.files || []);
      }
    } catch (error) {
      console.error('Failed to load file tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBinaryFile = useCallback((filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    return ext ? BINARY_EXTENSIONS.includes(ext) : false;
  }, []);

  const loadFileContent = async (filePath: string) => {
    // Check for binary files
    if (isBinaryFile(filePath)) {
      setSelectedFile(filePath);
      setFileContent('');
      setOriginalContent('');
      toast.info('Binary files cannot be edited');
      return;
    }

    setLoadingFile(true);
    setSelectedFile(filePath);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/files/content?path=${encodeURIComponent(filePath)}`,
      );

      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content || '');
        setOriginalContent(data.content || '');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to load file');
        setFileContent('');
        setOriginalContent('');
      }
    } catch (error) {
      console.error('Failed to load file:', error);
      setFileContent('');
      setOriginalContent('');
      toast.error('Failed to load file content');
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !hasChanges) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/files/operations`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: selectedFile, content: fileContent }),
        },
      );

      if (response.ok) {
        setOriginalContent(fileContent);
        toast.success('File saved');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save file');
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      toast.error('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newItemName.trim()) {
      toast.error('Name is required');
      return;
    }

    const path = createParentPath
      ? `${createParentPath}/${newItemName.trim()}`
      : newItemName.trim();

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/files/operations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, type: createType }),
        },
      );

      if (response.ok) {
        toast.success(`${createType === 'file' ? 'File' : 'Folder'} created`);
        setShowCreateModal(false);
        setNewItemName('');
        loadFileTree();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create');
      }
    } catch (error) {
      console.error('Failed to create:', error);
      toast.error('Failed to create');
    }
  };

  const handleRename = async () => {
    if (!targetNode || !newItemName.trim()) {
      toast.error('Name is required');
      return;
    }

    const parentPath = targetNode.path.split('/').slice(0, -1).join('/');
    const newPath = parentPath
      ? `${parentPath}/${newItemName.trim()}`
      : newItemName.trim();

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/files/operations`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: targetNode.path, newPath }),
        },
      );

      if (response.ok) {
        toast.success('Renamed successfully');
        setShowRenameModal(false);
        setNewItemName('');
        setTargetNode(null);
        if (selectedFile === targetNode.path) {
          setSelectedFile(newPath);
        }
        loadFileTree();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to rename');
      }
    } catch (error) {
      console.error('Failed to rename:', error);
      toast.error('Failed to rename');
    }
  };

  const handleDelete = async () => {
    if (!targetNode) return;

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/files/operations?path=${encodeURIComponent(targetNode.path)}`,
        { method: 'DELETE' },
      );

      if (response.ok) {
        toast.success('Deleted successfully');
        setShowDeleteModal(false);
        setTargetNode(null);
        if (selectedFile === targetNode.path) {
          setSelectedFile(null);
          setFileContent('');
          setOriginalContent('');
        }
        loadFileTree();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete');
    }
  };

  const openCreateModal = (type: 'file' | 'directory', parentPath = '') => {
    setCreateType(type);
    setCreateParentPath(parentPath);
    setNewItemName('');
    setShowCreateModal(true);
    setContextMenuPos(null);
  };

  const openRenameModal = (node: FileNode) => {
    setTargetNode(node);
    setNewItemName(node.name);
    setShowRenameModal(true);
    setContextMenuPos(null);
  };

  const openDeleteModal = (node: FileNode) => {
    setTargetNode(node);
    setShowDeleteModal(true);
    setContextMenuPos(null);
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuNode(node);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenuPos(null);
    if (contextMenuPos) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenuPos]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'json':
        return <FileJson className="w-3.5 h-3.5 text-yellow-500" />;
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return <FileCode className="w-3.5 h-3.5 text-blue-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FileImage className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <File className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getLanguage = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      md: 'markdown',
      css: 'css',
      scss: 'scss',
      html: 'html',
      py: 'python',
      rs: 'rust',
      go: 'go',
      yaml: 'yaml',
      yml: 'yaml',
      sh: 'shell',
      bash: 'shell',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFile === node.path;

      return (
        <div key={node.path}>
          <div
            onClick={() => {
              if (node.type === 'directory') {
                toggleFolder(node.path);
              } else {
                loadFileContent(node.path);
              }
            }}
            onContextMenu={e => handleContextMenu(e, node)}
            className={`
              flex items-center gap-1.5 py-1 px-1.5 cursor-pointer hover:bg-accent/50 rounded text-xs group
              ${isSelected ? 'bg-accent' : ''}
            `}
            style={{ paddingLeft: `${level * 12 + 4}px` }}
          >
            {node.type === 'directory' ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                )}
                <Folder className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              </>
            ) : (
              <>
                <span className="w-3" />
                <span className="flex-shrink-0">{getFileIcon(node.name)}</span>
              </>
            )}
            <span className="truncate flex-1">{node.name}</span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
              <button
                onClick={e => {
                  e.stopPropagation();
                  openRenameModal(node);
                }}
                className="p-0.5 hover:bg-accent rounded"
                title="Rename"
              >
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  openDeleteModal(node);
                }}
                className="p-0.5 hover:bg-destructive/20 rounded"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          </div>

          {node.type === 'directory' && isExpanded && node.children && (
            <div>{renderFileTree(node.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  // Show loading while fetching project path
  if (loading && !projectPath) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Loading project files...</p>
      </Card>
    );
  }

  // Show error if no path found
  if (!projectPath) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Project path not found. Please ensure the project is managed in the
          database.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <PanelGroup
        direction="horizontal"
        className="flex-1"
        autoSaveId="project-files-tab-layout"
      >
        {/* File Tree Panel */}
        <Panel defaultSize={25} minSize={15} maxSize={40}>
          <Card className="h-full overflow-y-auto p-0">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  Files
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openCreateModal('file')}
                    className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                    title="New File"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openCreateModal('directory')}
                    className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                    title="New Folder"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {project.name}
              </p>
            </div>

            <div className="p-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : fileTree.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No files found
                </p>
              ) : (
                <div className="space-y-0.5">{renderFileTree(fileTree)}</div>
              )}
            </div>
          </Card>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-1 bg-border/20 hover:bg-border/50 transition-colors cursor-col-resize flex items-center justify-center group">
          <div className="w-0.5 h-12 bg-border/40 rounded-full group-hover:bg-border/70 transition-colors" />
        </PanelResizeHandle>

        {/* Editor Panel */}
        <Panel defaultSize={75} minSize={50}>
          <Card className="h-full overflow-hidden flex flex-col p-0">
            {loadingFile ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedFile ? (
              <div className="flex-1 flex flex-col">
                <div className="border-b px-3 py-2 bg-muted/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {getFileIcon(selectedFile.split('/').pop() || '')}
                      <span className="text-xs font-medium truncate">
                        {selectedFile.split('/').pop()}
                      </span>
                      {hasChanges && (
                        <span className="text-xs text-amber-500">●</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {selectedFile}
                    </p>
                  </div>
                  {hasChanges && !isBinaryFile(selectedFile) && (
                    <Button
                      size="sm"
                      onClick={handleSaveFile}
                      disabled={saving}
                      className="h-7 text-xs gap-1"
                    >
                      {saving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Save
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  {isBinaryFile(selectedFile) ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <FileImage className="w-10 h-10 mb-3 opacity-50" />
                      <p className="text-xs">Binary files cannot be edited</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {selectedFile.split('.').pop()?.toUpperCase()} file
                      </p>
                    </div>
                  ) : (
                    <Editor
                      height="100%"
                      language={getLanguage(selectedFile)}
                      value={fileContent}
                      onChange={value => setFileContent(value || '')}
                      theme="vs-dark"
                      options={{
                        readOnly: false,
                        minimap: { enabled: true },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 8, bottom: 8 },
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                <FileCode className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-xs">Select a file to view its contents</p>
              </div>
            )}
          </Card>
        </Panel>
      </PanelGroup>

      {/* Context Menu */}
      {contextMenuPos && contextMenuNode && (
        <div
          className="fixed bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[140px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          {contextMenuNode.type === 'directory' && (
            <>
              <button
                onClick={() => openCreateModal('file', contextMenuNode.path)}
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-accent flex items-center gap-2"
              >
                <FilePlus className="w-3 h-3" />
                New File
              </button>
              <button
                onClick={() =>
                  openCreateModal('directory', contextMenuNode.path)
                }
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-accent flex items-center gap-2"
              >
                <FolderPlus className="w-3 h-3" />
                New Folder
              </button>
              <div className="border-t border-border my-1" />
            </>
          )}
          <button
            onClick={() => openRenameModal(contextMenuNode)}
            className="w-full px-3 py-1.5 text-xs text-left hover:bg-accent flex items-center gap-2"
          >
            <Pencil className="w-3 h-3" />
            Rename
          </button>
          <button
            onClick={() => openDeleteModal(contextMenuNode)}
            className="w-full px-3 py-1.5 text-xs text-left hover:bg-accent flex items-center gap-2 text-destructive"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold">
                New {createType === 'file' ? 'File' : 'Folder'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {createParentPath && (
                <p className="text-xs text-muted-foreground mb-2">
                  In: {createParentPath}/
                </p>
              )}
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder={
                  createType === 'file' ? 'filename.ts' : 'folder-name'
                }
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && targetNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold">Rename</h3>
              <button
                onClick={() => setShowRenameModal(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-2">
                Current: {targetNode.name}
              </p>
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="New name"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleRename()}
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRenameModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleRename}>
                Rename
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && targetNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Confirm Delete
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm">
                Are you sure you want to delete{' '}
                <span className="font-medium">{targetNode.name}</span>?
              </p>
              {targetNode.type === 'directory' && (
                <p className="text-xs text-muted-foreground mt-2">
                  This will delete the folder and all its contents.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
