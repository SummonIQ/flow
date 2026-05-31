'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/studio/ui/context-menu';
import { getPageRoute } from '@/lib/studio/codegen';
import { useBuilderStore } from '@/lib/studio/store';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  Component,
  File,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  LayoutTemplate,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CreatePageModal } from './create-page-modal';
import { DeletePageModal } from './delete-page-modal';
import { RenamePageModal } from './rename-page-modal';

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'page' | 'component' | 'asset';
  children?: TreeNode[];
  pageId?: string;
  componentId?: string;
  route?: string;
}

export function FileBrowserContent() {
  const {
    project,
    setCurrentPage,
    selectComponent,
    getCurrentPage,
    deletePage,
    renamePage,
    createPage,
  } = useBuilderStore();
  const currentPage = getCurrentPage();

  // TODO: Expand this into a true file browser that shows app routes/layouts/assets from the orchestrator project.
  // TODO: Add a dedicated pages browser view (search, sort, layout grouping) separate from the file tree.

  // TODO: Show publish status + last published time from the orchestrator app to make page handoff clearer.
  // TODO: Add a quick-filter/search bar to act as a page browser when launched from the orchestrator.
  const pages = useMemo(() => {
    if (!project) return [];
    return Object.values(project.pages);
  }, [project]);

  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showRenamePage, setShowRenamePage] = useState(false);
  const [showDeletePage, setShowDeletePage] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const selectedPage = useMemo(() => {
    if (!project || !selectedPageId) return null;
    return project.pages[selectedPageId] ?? null;
  }, [project, selectedPageId]);

  const existingRoutes = useMemo(() => {
    if (!project) return [];
    return Object.values(project.pages).map(page => getPageRoute(page));
  }, [project]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('file-browser-expanded');
      return saved
        ? new Set(JSON.parse(saved))
        : new Set(['pages', 'components']);
    }
    return new Set(['pages', 'components']);
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'file-browser-expanded',
        JSON.stringify(Array.from(expandedFolders)),
      );
    }
  }, [expandedFolders]);

  const fileTree = useMemo<TreeNode[]>(() => {
    if (!project) return [];

    const pages = Object.values(project.pages);

    const pagesFolder: TreeNode = {
      id: 'pages',
      name: 'Pages',
      type: 'folder',
      children: pages.map(page => ({
        id: `page-${page.id}`,
        name: page.name,
        type: 'page' as const,
        pageId: page.id,
      })),
    };

    const componentsFolder: TreeNode = {
      id: 'components',
      name: 'Components',
      type: 'folder',
      children: currentPage
        ? Object.values(currentPage.components)
            .filter(
              comp =>
                comp.parentId === currentPage.rootId &&
                comp.id !== currentPage.rootId,
            )
            .map(comp => ({
              id: `comp-${comp.id}`,
              name: comp.name || comp.type,
              type: 'component' as const,
              componentId: comp.id,
            }))
        : [],
    };

    const assetsFolder: TreeNode = {
      id: 'assets',
      name: 'Assets',
      type: 'folder',
      children: [],
    };

    return [pagesFolder, componentsFolder, assetsFolder];
  }, [project, currentPage]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleItemClick = (node: TreeNode) => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
    } else if (node.type === 'page' && node.pageId) {
      setCurrentPage(node.pageId);
    } else if (node.type === 'component' && node.componentId) {
      selectComponent(node.componentId);
    }
  };

  const getIcon = (node: TreeNode, isExpanded: boolean) => {
    switch (node.type) {
      case 'folder':
        return isExpanded ? (
          <FolderOpen size={14} className="text-amber-500" />
        ) : (
          <Folder size={14} className="text-amber-500" />
        );
      case 'page':
        return <LayoutTemplate size={14} className="text-blue-500" />;
      case 'component':
        return <Component size={14} className="text-purple-500" />;
      case 'asset':
        return <ImageIcon size={14} className="text-green-500" />;
      default:
        return <File size={14} className="text-muted-foreground" />;
    }
  };

  const handleOpenDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      toast.error('Keep at least one page in the project');
      return;
    }
    setSelectedPageId(pageId);
    setShowDeletePage(true);
  };

  const handleOpenRenamePage = (pageId: string) => {
    setSelectedPageId(pageId);
    setShowRenamePage(true);
  };

  const handleRenamePage = (name: string, route?: string) => {
    if (!selectedPageId) return;
    renamePage(selectedPageId, name, route);
    toast.success('Page renamed');
    setShowRenamePage(false);
    setSelectedPageId(null);
  };

  const handleDeletePage = () => {
    if (!selectedPageId) return;
    deletePage(selectedPageId);
    toast.success('Page deleted');
    setShowDeletePage(false);
    setSelectedPageId(null);
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isFolder = node.type === 'folder';
    const hasChildren = isFolder && node.children && node.children.length > 0;
    const isCurrentPage =
      node.type === 'page' && node.pageId === project?.currentPageId;

    const nodeContent = (
      <button
        onClick={() => handleItemClick(node)}
        className={cn(
          'flex items-center gap-1.5 w-full px-2 py-1 text-xs hover:bg-accent rounded-sm transition-colors text-left group',
          isCurrentPage && 'bg-primary/10 text-primary font-medium',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0"
          >
            <ChevronRight
              size={12}
              className={cn(
                'text-muted-foreground/50',
                hasChildren && 'text-muted-foreground',
              )}
            />
          </motion.div>
        ) : (
          <span className="w-3" />
        )}
        {getIcon(node, isExpanded)}
        <span className="truncate">{node.name}</span>
        {node.type === 'page' && node.pageId === project?.currentPageId && (
          <span className="ml-auto text-[10px] text-primary/70 font-normal">
            active
          </span>
        )}
      </button>
    );

    return (
      <div key={node.id}>
        {node.type === 'page' && node.pageId ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>{nodeContent}</ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => handleOpenRenamePage(node.pageId!)}
                className="text-xs"
              >
                <Pencil size={12} className="mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleOpenDeletePage(node.pageId!)}
                className="text-xs text-destructive focus:text-destructive"
                disabled={pages.length <= 1}
              >
                <Trash2 size={12} className="mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          nodeContent
        )}

        <AnimatePresence initial={false}>
          {isFolder && isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {node.children.length > 0 ? (
                node.children.map(child => renderNode(child, depth + 1))
              ) : (
                <div
                  className="text-[10px] text-muted-foreground/50 italic py-1"
                  style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}
                >
                  Empty
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-xs text-muted-foreground text-center">
          Open a project to browse files
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="px-2 py-1 border-b border-border bg-muted/25 flex items-center justify-between select-none">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {project.name}
          </p>
          <button
            onClick={() => setShowCreatePage(true)}
            className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="New Page"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          {fileTree.map(node => renderNode(node))}
        </div>
      </div>

      <CreatePageModal
        open={showCreatePage}
        onOpenChange={setShowCreatePage}
        onCreatePage={createPage}
        projectType={project.type}
        existingRoutes={existingRoutes}
      />

      {selectedPage && (
        <>
          <RenamePageModal
            open={showRenamePage}
            onOpenChange={setShowRenamePage}
            pageName={selectedPage.name}
            pageRoute={selectedPage.route}
            existingRoutes={existingRoutes}
            onRename={handleRenamePage}
          />
          <DeletePageModal
            open={showDeletePage}
            onOpenChange={setShowDeletePage}
            pageName={selectedPage.name}
            onDelete={handleDeletePage}
          />
        </>
      )}
    </>
  );
}
