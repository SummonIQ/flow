'use client';

import { ChevronRight, ChevronDown, FileIcon, FolderIcon, Trash2, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@summoniq/applab-ui';

interface TemplateFile {
  id: string;
  path: string;
  content: string;
  isDirectory: boolean;
}

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  file?: TemplateFile;
}

interface TemplateFileTreeProps {
  files: TemplateFile[];
  selectedFile: TemplateFile | null;
  onSelectFile: (file: TemplateFile) => void;
  onDelete?: (file: TemplateFile) => Promise<void>;
}

export function TemplateFileTree({ files, selectedFile, onSelectFile, onDelete }: TemplateFileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [deleting, setDeleting] = useState<string | null>(null);

  // Build tree structure from flat file list
  const buildTree = (files: TemplateFile[]): FileNode[] => {
    const root: FileNode[] = [];
    const map = new Map<string, FileNode>();

    // Filter out .env files and sort by path
    const sortedFiles = [...files]
      .filter(file => {
        const fileName = file.path.split('/').pop() || '';
        return !fileName.startsWith('.env');
      })
      .sort((a, b) => a.path.localeCompare(b.path));

    // Helper to ensure all parent directories exist
    const ensureParents = (path: string): FileNode | null => {
      const parts = path.split('/');
      
      // Root level
      if (parts.length === 1) {
        return null;
      }
      
      const parentPath = parts.slice(0, -1).join('/');
      let parent = map.get(parentPath);
      
      if (!parent) {
        // Create parent directory
        parent = {
          name: parts[parts.length - 2],
          path: parentPath,
          isDirectory: true,
          children: [],
        };
        map.set(parentPath, parent);
        
        // Recursively ensure grandparents exist
        const grandparent = ensureParents(parentPath);
        if (grandparent && grandparent.children) {
          grandparent.children.push(parent);
        } else {
          root.push(parent);
        }
      }
      
      return parent;
    };

    sortedFiles.forEach(file => {
      const parts = file.path.split('/');
      const fileName = parts[parts.length - 1];
      
      const node: FileNode = {
        name: fileName || file.path,
        path: file.path,
        isDirectory: file.isDirectory,
        children: file.isDirectory ? [] : undefined,
        file,
      };

      const parent = ensureParents(file.path);
      if (parent && parent.children) {
        parent.children.push(node);
      } else {
        root.push(node);
      }
      
      map.set(file.path, node);
    });

    return root;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDelete = async (node: FileNode) => {
    if (!node.file || !onDelete) return;
    
    setDeleting(node.path);
    try {
      await onDelete(node.file);
    } finally {
      setDeleting(null);
    }
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile?.path === node.path;
    const isDeleting = deleting === node.path;

    const nodeContent = (
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent/50 transition-colors',
          isSelected && 'bg-accent',
          isDeleting && 'opacity-50 pointer-events-none'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (isDeleting) return;
          if (node.isDirectory) {
            toggleFolder(node.path);
          } else if (node.file) {
            onSelectFile(node.file);
          }
        }}
      >
        {node.isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <FolderIcon className="w-4 h-4 text-blue-500" />
          </>
        ) : (
          <>
            <div className="w-4" /> {/* Spacer */}
            <FileIcon className="w-4 h-4 text-muted-foreground" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>
    );

    return (
      <div key={node.path}>
        {onDelete ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              {nodeContent}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              {!node.isDirectory && (
                <>
                  <ContextMenuItem
                    onClick={() => {
                      if (node.file) {
                        onSelectFile(node.file);
                      }
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Open File
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuItem
                onClick={() => handleDelete(node)}
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : `Delete ${node.isDirectory ? 'Folder' : 'File'}`}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          nodeContent
        )}
        
        {node.isDirectory && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(files);

  return (
    <div className="py-2">
      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
        Files
      </div>
      {tree.map(node => renderNode(node))}
    </div>
  );
}
