'use client';

import { useBuilderStore } from '@/lib/studio/store';
import { ProjectType } from '@/types/studio/builder';
import { motion } from 'framer-motion';
import { Bot, FolderTree, Layers, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { toast } from 'sonner';
import { AIPanelContent } from './ai-panel';
import { AppHeader } from './app-header';
import { AppMenubar } from './app-menubar';
import { Canvas } from './canvas';
import { CodeEditor } from './code-editor';
import {
  DockableLayoutProvider,
  DockedPanelContainer,
  useDockableLayout,
} from './dockable-layout';
import { DockablePanel } from './dockable-panel';
import { FileBrowserContent } from './file-browser';
import { PropertiesPanelContent } from './properties-panel';
import { StatusBar } from './status-bar';
import { ToolboxContent } from './toolbox';
import { WelcomePage } from './welcome-page';

function DockableBuilderPanel({ panelId }: { panelId: string }) {
  // TODO: Add a dedicated Pages Browser panel (search/sort/filter) instead of relying on the file tree alone.
  // TODO: Add a Layouts Browser panel that visualizes shared layouts across pages and lets you open them for editing.
  // TODO: Add a real project file browser (routes/assets) to bridge orchestrator files with designer pages.
  if (panelId === 'files') {
    return (
      <DockablePanel
        id="files"
        title="Files"
        icon={<FolderTree size={14} />}
        defaultWidth={280}
        defaultHeight={280}
      >
        <FileBrowserContent />
      </DockablePanel>
    );
  }

  if (panelId === 'toolbox') {
    return (
      <DockablePanel
        id="toolbox"
        title="Toolbox"
        icon={<Layers size={12} />}
        defaultWidth={280}
        defaultHeight={520}
      >
        <ToolboxContent />
      </DockablePanel>
    );
  }

  if (panelId === 'properties') {
    return (
      <DockablePanel
        id="properties"
        title="Properties"
        icon={<Settings size={14} />}
        defaultWidth={320}
        defaultHeight={640}
      >
        <PropertiesPanelContent />
      </DockablePanel>
    );
  }

  if (panelId === 'ai') {
    return (
      <DockablePanel
        id="ai"
        title="AI"
        icon={<Bot size={14} />}
        defaultWidth={360}
        defaultHeight={560}
      >
        <AIPanelContent />
      </DockablePanel>
    );
  }

  return null;
}

function FloatingDockablePanels() {
  const { panels } = useDockableLayout();

  return (
    <>
      {Object.values(panels)
        .filter(p => p.side === 'floating')
        .map(p => (
          <DockableBuilderPanel key={p.id} panelId={p.id} />
        ))}
    </>
  );
}

export function Builder() {
  const {
    project,
    createProject,
    loadProject,
    migrateCurrentPageToPageRoot,
    canvasViewMode,
  } = useBuilderStore();
  const [mounted, setMounted] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [zoom, setZoom] = useState(85);
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);

  // Prevent hydration error from persisted store and platform detection
  useEffect(() => {
    setMounted(true);
    setIsMacOS(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  useEffect(() => {
    if (canvasViewMode !== 'design') {
      setShowCode(false);
    }
  }, [canvasViewMode]);

  // Run migration to wrap existing roots in Page component
  useEffect(() => {
    if (mounted && project) {
      migrateCurrentPageToPageRoot();
    }
  }, [mounted, project, migrateCurrentPageToPageRoot]);

  const handleCreateProject = (
    name: string,
    type: ProjectType,
    description?: string,
  ) => {
    createProject(name, type, description);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // If focus is inside an editable field, let the browser handle
      // clipboard/undo/redo shortcuts so text copy/paste works normally.
      const target = e.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const key = e.key.toLowerCase();
      if (isEditable && isMod && ['c', 'x', 'v', 'z'].includes(key)) {
        return;
      }

      // File operations
      if (isMod && e.key === 's') {
        e.preventDefault();
        if (!project) {
          toast.error('No project to save');
          return;
        }

        const { canvasViewMode, codeFile, saveCodeForRoute, saveProject } =
          useBuilderStore.getState();

        if (canvasViewMode === 'code' && codeFile.route) {
          saveCodeForRoute()
            .then(result => {
              if (result.success) {
                toast.success('Page saved successfully!');
                return;
              }
              toast.error(result.error || 'Failed to save page');
            })
            .catch(err => {
              toast.error(
                err instanceof Error ? err.message : 'Failed to save page',
              );
            });
          return;
        }

        saveProject();
        toast.success('Project saved successfully!');
      } else if (isMod && e.key === 'o') {
        e.preventDefault();
        handleOpenProject();
      } else if (isMod && e.key === 'n') {
        e.preventDefault();
        handleNewProject();
      }
      // Clipboard operations
      else if (isMod && e.key === 'c' && !e.shiftKey) {
        e.preventDefault();
        const { selectedId, copyComponent } = useBuilderStore.getState();
        if (selectedId) {
          copyComponent();
          toast.success('Component copied!');
        }
      } else if (isMod && e.key === 'x') {
        e.preventDefault();
        const { selectedId, cutComponent } = useBuilderStore.getState();
        if (selectedId) {
          cutComponent();
          toast.success('Component cut!');
        }
      } else if (isMod && e.key === 'v') {
        e.preventDefault();
        const { clipboard, pasteComponent } = useBuilderStore.getState();
        if (clipboard) {
          pasteComponent();
          toast.success('Component pasted!');
        }
      }
      // Undo/Redo operations
      else if (isMod && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        const { canRedo, redo } = useBuilderStore.getState();
        if (canRedo()) {
          redo();
          toast.success('Redone!');
        }
      } else if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const { canUndo, undo } = useBuilderStore.getState();
        if (canUndo()) {
          undo();
          toast.success('Undone!');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project]);

  // Menu IPC listeners (SummonIQ shell)
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).electron) return;

    const handleMenuSaveProject = () => {
      if (!project) {
        toast.error('No project to save');
        return;
      }

      const { canvasViewMode, codeFile, saveCodeForRoute, saveProject } =
        useBuilderStore.getState();

      if (canvasViewMode === 'code' && codeFile.route) {
        saveCodeForRoute()
          .then(result => {
            if (result.success) {
              toast.success('Page saved successfully!');
              return;
            }
            toast.error(result.error || 'Failed to save page');
          })
          .catch(err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save page',
            );
          });
        return;
      }

      saveProject();
      toast.success('Project saved successfully!');
    };

    const electronApi = (window as any).electron;

    if (electronApi?.menu?.onAction) {
      const unsubscribe = electronApi.menu.onAction((action: string) => {
        if (action === 'new-project') {
          handleNewProject();
        }
        if (action === 'open-project') {
          handleOpenProject();
        }
        if (action === 'save-project') {
          handleMenuSaveProject();
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }

    if (electronApi?.on) {
      const handleMenuNewProject = () => handleNewProject();
      const handleMenuOpenProject = () => handleOpenProject();

      electronApi.on('menu-new-project', handleMenuNewProject);
      electronApi.on('menu-open-project', handleMenuOpenProject);
      electronApi.on('menu-save-project', handleMenuSaveProject);

      return () => {
        if (electronApi?.removeListener) {
          electronApi.removeListener('menu-new-project', handleMenuNewProject);
          electronApi.removeListener(
            'menu-open-project',
            handleMenuOpenProject,
          );
          electronApi.removeListener(
            'menu-save-project',
            handleMenuSaveProject,
          );
        }
      };
    }
  }, [project]);

  const handleNewProject = () => {
    // Close the current project to show welcome page
    const { closeProject } = useBuilderStore.getState();
    closeProject();
  };

  const handleOpenProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.applab.project';
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const projectData = JSON.parse(text);

        // Validate the project data
        if (
          !projectData.id ||
          !projectData.name ||
          !projectData.type ||
          !projectData.pages
        ) {
          toast.error('Invalid project file');
          return;
        }

        loadProject(projectData);
        toast.success(`Project "${projectData.name}" loaded successfully!`);
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Failed to load project file');
      }
    };
    input.click();
  };

  return (
    <DockableLayoutProvider>
      <div className="flex flex-col h-screen">
        <AppHeader />

        {/* Menu Bar - Hidden on macOS since we use native menu */}
        {!isMacOS && (
          <div className="border-t border-muted/50 border-b border-b-muted/25 bg-background">
            <AppMenubar
              onToggleCode={() => setShowCode(!showCode)}
              showCode={showCode}
              onNewProject={handleNewProject}
              onOpenProject={handleOpenProject}
            />
          </div>
        )}

        {!mounted ? (
          // Render nothing during SSR to match initial client state
          <div className="flex-1" />
        ) : !project ? (
          <div className="flex-1 overflow-auto">
            <WelcomePage
              onCreateProject={(name, description) =>
                handleCreateProject(name, 'react', description)
              }
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col flex-1"
          >
            <div className="flex-1 overflow-hidden flex flex-col">
              {canvasViewMode === 'design' && (
                <DockedPanelContainer side="top" defaultSize={240}>
                  {panelId => <DockableBuilderPanel panelId={panelId} />}
                </DockedPanelContainer>
              )}

              <div className="flex-1 overflow-hidden flex">
                {canvasViewMode === 'design' && (
                  <DockedPanelContainer side="left">
                    {panelId => <DockableBuilderPanel panelId={panelId} />}
                  </DockedPanelContainer>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="flex-1 overflow-hidden"
                >
                  <PanelGroup
                    direction="horizontal"
                    autoSaveId="studio-builder-main-layout"
                  >
                    {/* Canvas Area */}
                    <Panel
                      defaultSize={
                        showCode && canvasViewMode === 'design' ? 60 : 100
                      }
                      minSize={30}
                    >
                      <Canvas
                        zoom={zoom}
                        onZoomChange={setZoom}
                        isDraggingComponent={isDraggingComponent}
                        onDraggingChange={setIsDraggingComponent}
                      />
                    </Panel>

                    {showCode && canvasViewMode === 'design' && (
                      <>
                        <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />

                        {/* Code Editor */}
                        <Panel defaultSize={40} minSize={20}>
                          <CodeEditor />
                        </Panel>
                      </>
                    )}
                  </PanelGroup>
                </motion.div>

                {canvasViewMode === 'design' && (
                  <DockedPanelContainer side="right" defaultSize={360}>
                    {panelId => <DockableBuilderPanel panelId={panelId} />}
                  </DockedPanelContainer>
                )}
              </div>

              {canvasViewMode === 'design' && (
                <DockedPanelContainer side="bottom" defaultSize={260}>
                  {panelId => <DockableBuilderPanel panelId={panelId} />}
                </DockedPanelContainer>
              )}

              {canvasViewMode === 'design' && <FloatingDockablePanels />}
            </div>
          </motion.div>
        )}

        {/* Status Bar - Always visible */}
        <StatusBar zoom={zoom} onZoomChange={setZoom} />
      </div>
    </DockableLayoutProvider>
  );
}
