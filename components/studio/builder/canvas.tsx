'use client';

import { getPageRoute } from '@/lib/studio/codegen';
import { useBuilderStore } from '@/lib/studio/store';
import { cn } from '@/lib/utils';
import { ComponentType } from '@/types/studio/builder';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Code,
  Eye,
  Maximize2,
  Minimize2,
  Moon,
  Palette,
  Play,
  RotateCcw,
  RotateCw,
  Sun,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CodeEditor } from './code-editor';
import { HTMLViewer } from './html-viewer';
import { RenderComponent } from './render-component';

interface CanvasProps {
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  isDraggingComponent?: boolean;
  onDraggingChange?: (isDragging: boolean) => void;
}

export function Canvas({
  zoom = 85,
  onZoomChange,
  isDraggingComponent = false,
  onDraggingChange,
}: CanvasProps) {
  // TODO: Add a layout stack overlay that visualizes shared layouts wrapping the current page and lets you click to edit them.
  const {
    getComponents,
    getRootId,
    getCurrentPage,
    addComponent,
    insertComponentWithData,
    selectComponent,
    selectedId,
    removeComponent,
    project,
    canvasViewMode,
    setCanvasViewMode,
    canUndo,
    canRedo,
    undo,
    redo,
    isDragging: storeIsDragging,
    setIsDragging: setStoreIsDragging,
    draggedComponentType,
    setDraggedComponentType,
  } = useBuilderStore();
  const codeFile = useBuilderStore(state => state.codeFile);
  const components = getComponents();
  const rootId = getRootId();
  const currentPage = getCurrentPage();
  const isReactProject = project?.type === 'react';
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const viewMode = canvasViewMode;
  const [canvasTheme, setCanvasTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('applab-canvas-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });
  const [browserPosition, setBrowserPosition] = useState({ x: 100, y: 100 });
  const [browserSize, setBrowserSize] = useState({ width: 1000, height: 700 });
  const [isDraggingBrowser, setIsDraggingBrowser] = useState(false);
  const [browserDragStart, setBrowserDragStart] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  // Use store's isDragging state (set by toolbox) combined with prop
  const isDragging = storeIsDragging || isDraggingComponent;
  const setIsDragging = (value: boolean) => {
    setStoreIsDragging(value);
    if (onDraggingChange) {
      onDraggingChange(value);
    }
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRootRef = useRef<HTMLDivElement>(null);

  // Reset pan when project or page changes - offset to visually center in viewport
  useEffect(() => {
    // Offset to account for properties panel on right and center vertically
    // Use large negative values to move canvas left and up
    setPan({ x: -500, y: -400 }); // Move left 500px and up 400px for better visual centering
  }, [project?.id, project?.currentPageId]);

  // Fallback: Handle mouseup to complete drag when native drop fails (Electron issue)
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Read directly from store to get latest values
      const state = useBuilderStore.getState();
      const currentIsDragging = state.isDragging;
      const currentDraggedType = state.draggedComponentType;
      const currentDraggedAiData = state.draggedAiComponentData;
      const currentRootId = state.getRootId();

      // Only handle if we're actually dragging a component
      if (!currentIsDragging || !currentRootId) {
        return;
      }

      // Need either a toolbox component type OR AI component data
      if (!currentDraggedType && !currentDraggedAiData) {
        return;
      }

      // Check if mouse is over the canvas area
      const canvasEl = document.getElementById('canvas-root');
      if (canvasEl) {
        const rect = canvasEl.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          if (currentDraggedAiData) {
            // Handle AI component drop
            state.insertComponentWithData(
              currentDraggedAiData,
              currentRootId,
              'inside',
            );
          } else if (currentDraggedType) {
            // Handle toolbox component drop
            state.addComponent(currentDraggedType, currentRootId);
          }
          // Get the newly selected component ID for ripple animation
          const newState = useBuilderStore.getState();
          if (newState.selectedId) {
            state.setDroppedComponentId(newState.selectedId);
          }
        }
      }
      // Always clear the drag state after mouseup
      state.setIsDragging(false);
      state.setDraggedComponentType(null);
      state.setDraggedAiComponentData(null);
    };

    document.addEventListener('mouseup', handleMouseUp, true); // Use capture phase
    return () => document.removeEventListener('mouseup', handleMouseUp, true);
  }, []);

  // Constrain pan to keep canvas visible - very permissive constraints
  const constrainPan = useCallback(
    (newPan: { x: number; y: number }) => {
      if (!containerRef.current) return newPan;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      // Canvas dimensions (scaled by zoom). Prefer real DOM measurements when available.
      const rawCanvasWidth = canvasRootRef.current?.offsetWidth ?? 1200;
      const rawCanvasHeight = canvasRootRef.current?.offsetHeight ?? 800;
      const canvasWidth = rawCanvasWidth * (zoom / 100);
      const canvasHeight = rawCanvasHeight * (zoom / 100);

      // Very permissive constraints - allow 80% of canvas to go off-screen
      const maxPanX = containerWidth * 0.5 + canvasWidth * 0.8;
      const minPanX = -(canvasWidth * 0.8 + containerWidth * 0.5);
      const maxPanY = containerHeight * 0.5 + canvasHeight * 0.8;
      const minPanY = -(canvasHeight * 0.8 + containerHeight * 0.5);

      return {
        x: Math.max(minPanX, Math.min(maxPanX, newPan.x)),
        y: Math.max(minPanY, Math.min(maxPanY, newPan.y)),
      };
    },
    [zoom],
  );

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;

    if (!over) return;

    const componentType = active.data.current?.type as ComponentType;
    const targetId = over.id as string;

    if (componentType) {
      addComponent(
        componentType,
        targetId === 'canvas-root' ? rootId : targetId,
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    console.log('CANVAS handleDrop FIRED');
    e.preventDefault();
    setIsDragging(false);
    const componentType = e.dataTransfer.getData(
      'componentType',
    ) as ComponentType;
    const aiComponentDataString = e.dataTransfer.getData('aiComponentData');

    console.log(
      'Drop event - componentType:',
      componentType,
      'rootId:',
      rootId,
      'project:',
      project,
    );

    if (aiComponentDataString && project && rootId) {
      try {
        const componentData = JSON.parse(aiComponentDataString);
        insertComponentWithData(componentData, rootId, 'inside');
        return;
      } catch (error) {
        console.error('Failed to parse AI component data', error);
      }
    }

    if (componentType && project && rootId) {
      console.log('Canvas drop - adding component to rootId:', rootId);
      addComponent(componentType, rootId);
    } else if (!project) {
      console.warn('No project loaded - cannot add component');
    } else if (!rootId) {
      console.warn('No rootId - cannot add component');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    // Ensure isDragging is set - check both store state and dragged type
    if (!isDragging || draggedComponentType) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Set dragging state when entering canvas
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Check if we're leaving the canvas bounds
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Handle clicks on the canvas
    if (isPanning) return;

    const target = e.target as HTMLElement;

    // Check if clicking directly on the canvas-root div (the white background padding)
    if (target.id === 'canvas-root') {
      // Clicking on canvas padding area - select the Page component (root)
      const rootId = getRootId();
      if (rootId) {
        selectComponent(rootId);
      }
      return;
    }

    // If we didn't click on canvas-root, component clicks are handled by RenderComponent
  };

  const handleWorkspaceClick = (e: React.MouseEvent) => {
    // Deselect when clicking on empty workspace area outside the canvas
    if (e.target === e.currentTarget && !isPanning) {
      selectComponent(null);
    }
  };

  // Wheel handler for both pinch zoom and two-finger pan
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Pinch to zoom (with ctrl/cmd key)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        if (!onZoomChange || !containerRef.current) return;

        const MIN_ZOOM = 25;
        const MAX_ZOOM = 200;

        // Smooth, continuous zoom based on deltaY
        // Scale factor for sensitivity (lower = slower zoom)
        const zoomSpeed = 0.5;
        const delta = -e.deltaY * zoomSpeed;

        let newZoom = zoom + delta;
        if (newZoom < MIN_ZOOM) newZoom = MIN_ZOOM;
        if (newZoom > MAX_ZOOM) newZoom = MAX_ZOOM;

        if (newZoom === zoom) return;

        // Get the canvas element to find its current rendered position
        const canvasEl = document.getElementById('canvas-root');
        if (!canvasEl) return;

        const canvasRect = canvasEl.getBoundingClientRect();
        const oldScale = zoom / 100;
        const newScale = newZoom / 100;

        // Find where the cursor is relative to the canvas center (in screen space)
        const canvasCenterScreenX = canvasRect.left + canvasRect.width / 2;
        const canvasCenterScreenY = canvasRect.top + canvasRect.height / 2;

        // Vector from canvas center to cursor (in screen pixels)
        const cursorFromCenterX = e.clientX - canvasCenterScreenX;
        const cursorFromCenterY = e.clientY - canvasCenterScreenY;

        // The cursor is at cursorFromCenter (screen pixels) from canvas center.
        // In unscaled canvas coordinates, this is cursorFromCenter / oldScale.
        // After zoom, that same point will be at cursorFromCenter / oldScale * newScale from center.
        // To keep it at the same screen position, we need to adjust pan.
        //
        // Screen position of a canvas point P (in unscaled coords):
        //   screenPos = (P + pan) * scale
        //
        // For cursor point: cursorFromCenter = (P + pan) * oldScale
        //   So P = cursorFromCenter / oldScale - pan
        //
        // After zoom, we want: cursorFromCenter = (P + newPan) * newScale
        //   newPan = cursorFromCenter / newScale - P
        //          = cursorFromCenter / newScale - (cursorFromCenter / oldScale - pan)
        //          = cursorFromCenter * (1/newScale - 1/oldScale) + pan
        const newPan = constrainPan({
          x: cursorFromCenterX * (1 / newScale - 1 / oldScale) + pan.x,
          y: cursorFromCenterY * (1 / newScale - 1 / oldScale) + pan.y,
        });

        setPan(newPan);
        onZoomChange(newZoom);
      } else {
        // Two-finger pan (without ctrl/cmd key)
        e.preventDefault();

        const newPan = {
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        };
        setPan(constrainPan(newPan));
      }
    },
    [zoom, pan, onZoomChange, constrainPan],
  );

  // Attach wheel listener with { passive: false } to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Pan with left click or middle mouse button
    // Allow panning on workspace and empty canvas areas
    const target = e.target as HTMLElement;

    // Don't pan if clicking on a component (button, input, img, or elements with pointer cursor)
    const isComponent =
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'IMG' ||
      target.closest('[data-component]');

    if ((e.button === 0 || e.button === 1) && !isComponent) {
      e.preventDefault();
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newPan = {
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      };
      setPan(constrainPan(newPan));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Two-finger touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only handle two-finger touches
    if (e.touches.length === 2) {
      e.preventDefault();
      // Calculate the midpoint between two fingers
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setTouchStart({ x: midX - pan.x, y: midY - pan.y });
      setIsPanning(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStart) {
      e.preventDefault();
      // Calculate the midpoint between two fingers
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const newPan = {
        x: midX - touchStart.x,
        y: midY - touchStart.y,
      };
      setPan(constrainPan(newPan));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Reset when fingers are lifted
    if (e.touches.length < 2) {
      setIsPanning(false);
      setTouchStart(null);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Apply pan constraints when zoom changes (e.g., from status bar)
  useEffect(() => {
    setPan(constrainPan(pan));
  }, [zoom, constrainPan]);

  // Handle delete key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('input') ||
        target.closest('textarea');

      // Only delete component if not typing and a component is selected
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedId &&
        !isTyping
      ) {
        // Prevent default backspace navigation
        if (e.key === 'Backspace') {
          e.preventDefault();
        }
        removeComponent(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, removeComponent]);

  const rootComponent = rootId ? components[rootId] : null;

  const routePath = currentPage ? getPageRoute(currentPage) : '/';
  const codeFileName = isReactProject
    ? routePath === '/'
      ? 'app/page.tsx'
      : `app${routePath}/page.tsx`
    : 'index.html';

  const handleBrowserMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.browser-header')) {
      setIsDraggingBrowser(true);
      setBrowserDragStart({
        x: e.clientX - browserPosition.x,
        y: e.clientY - browserPosition.y,
      });
    }
  };

  const handleBrowserMouseMove = (e: React.MouseEvent) => {
    if (isDraggingBrowser && !isMaximized) {
      setBrowserPosition({
        x: e.clientX - browserDragStart.x,
        y: e.clientY - browserDragStart.y,
      });
    }
  };

  const handleBrowserMouseUp = () => {
    setIsDraggingBrowser(false);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const closeBrowser = () => {
    setCanvasViewMode('design');
  };

  return (
    <div className="h-full flex flex-col" data-canvas-theme={canvasTheme}>
      {/* View Mode Tabs + Undo/Redo */}
      <div className="relative flex items-center justify-center border-b shadow-md border-black/50 bg-muted/40 select-none">
        {/* Undo/Redo + Canvas Theme Toggle on far left */}
        <div className="absolute left-3 inset-y-0 flex items-center gap-1">
          <button
            type="button"
            onClick={() => canUndo() && undo()}
            disabled={!canUndo()}
            className={cn(
              'group inline-flex items-center justify-center rounded-md p-1.5 text-xs text-muted-foreground hover:bg-muted/80 transition-all duration-150 overflow-hidden',
              !canUndo() && 'opacity-40 cursor-default hover:bg-transparent',
            )}
            title="Undo (Cmd/Ctrl+Z)"
          >
            <RotateCcw size={14} />
            <span className="ml-1 whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[60px] group-hover:ml-1 transition-all duration-150">
              Undo
            </span>
          </button>
          <button
            type="button"
            onClick={() => canRedo() && redo()}
            disabled={!canRedo()}
            className={cn(
              'group inline-flex items-center justify-center rounded-md p-1.5 text-xs text-muted-foreground hover:bg-muted/80 transition-all duration-150 overflow-hidden',
              !canRedo() && 'opacity-40 cursor-default hover:bg-transparent',
            )}
            title="Redo (Shift+Cmd/Ctrl+Z)"
          >
            <RotateCw size={14} />
            <span className="ml-1 whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[70px] group-hover:ml-1 transition-all duration-150">
              Redo
            </span>
          </button>
          {/* Separator */}
          <div className="h-5 w-px bg-border mx-1" />
          {/* Canvas Theme Toggle */}
          <button
            type="button"
            aria-label="Toggle canvas theme"
            onClick={() => {
              setCanvasTheme(prev => {
                const next = prev === 'dark' ? 'light' : 'dark';
                localStorage.setItem('applab-canvas-theme', next);
                return next;
              });
            }}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted/80 transition-colors"
            title={`Canvas theme: ${canvasTheme === 'dark' ? 'Dark' : 'Light'}`}
          >
            {canvasTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>

        {/* Centered view mode tabs */}
        <div className="flex items-center">
          <button
            onClick={() => setCanvasViewMode('design')}
            className={cn(
              'px-4 py-2 text-sm flex items-center gap-2 border-b-2 transition-colors',
              viewMode === 'design'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Eye size={16} />
            Design
          </button>
          {project && (
            <button
              onClick={() => setCanvasViewMode('code')}
              className={cn(
                'px-4 py-2 text-sm flex items-center gap-2 border-b-2 transition-colors',
                viewMode === 'code'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Code size={16} />
              Code
            </button>
          )}
          <button
            onClick={() => setCanvasViewMode('run')}
            className={cn(
              'px-4 py-2 text-sm flex items-center gap-2 border-b-2 transition-colors',
              viewMode === 'run'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Play size={16} />
            Run
          </button>
        </div>
      </div>

      {/* VS Code-like file tabs (Code view only) */}
      {viewMode === 'code' && (
        <div className="flex items-center gap-1 border-b border-border bg-background/70 px-2 select-none">
          <div className="flex items-center gap-2 px-3 py-2 text-xs border-r border-border bg-muted/40">
            <span className="font-medium text-foreground">{codeFileName}</span>
          </div>
        </div>
      )}

      {/* View Content */}
      {viewMode === 'run' ? (
        <div
          className="flex-1 bg-muted/50 dark:bg-muted/30 overflow-hidden relative"
          onMouseMove={handleBrowserMouseMove}
          onMouseUp={handleBrowserMouseUp}
        >
          {/* Draggable Browser Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bg-background overflow-hidden"
            style={{
              left: isMaximized ? 0 : browserPosition.x,
              top: isMaximized ? 0 : browserPosition.y,
              width: isMaximized ? '100%' : browserSize.width,
              height: isMaximized ? '100%' : browserSize.height,
              cursor: isDraggingBrowser ? 'grabbing' : 'default',
            }}
            onMouseDown={handleBrowserMouseDown}
          >
            {/* Browser Header */}
            <div className="browser-header bg-muted/60 border-b border-border px-4 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none">
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={closeBrowser}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                    title="Close"
                  />
                  <button
                    onClick={toggleMaximize}
                    className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                    title={isMaximized ? 'Minimize' : 'Maximize'}
                  />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-4 text-sm font-medium text-muted-foreground">
                  App Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMaximize}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </button>
                <button
                  onClick={closeBrowser}
                  className="p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Browser Content - scrolls like a real browser */}
            <div
              className="h-[calc(100%-48px)] overflow-auto bg-background dark:bg-background p-0"
              data-canvas-content
              style={{ overscrollBehavior: 'contain' }}
            >
              <div className="min-h-full">
                {rootComponent ? (
                  <RenderComponent
                    component={rootComponent!}
                    isDragging={false}
                    interactive={false}
                    runtime
                    canvasZoom={zoom}
                  />
                ) : (
                  <div className="h-full min-h-[400px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Play size={64} className="mx-auto mb-4 opacity-50" />
                      <p>No components to display</p>
                      <p className="text-sm">Add components in Design mode</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : viewMode === 'code' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-hidden bg-background"
        >
          {codeFile.route ? (
            <CodeEditor showHeader={false} enableMinimap />
          ) : isReactProject ? (
            <CodeEditor showHeader={false} enableMinimap />
          ) : (
            <HTMLViewer component={rootComponent} />
          )}
        </motion.div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Workspace Container */}
          <div
            ref={containerRef}
            className="flex-1 bg-muted/50 dark:bg-muted/30 overflow-hidden relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleWorkspaceClick}
            style={{
              cursor: isPanning || isDragging ? 'grabbing' : 'grab',
              pointerEvents: 'auto',
              touchAction: 'none',
            }}
          >
            {/* Canvas - Typical website dimensions (1200px x 800px) */}
            <div
              ref={canvasRootRef}
              className={cn(
                'bg-background rounded-md shadow-xl transition-all duration-150',
                isDragging
                  ? 'ring-4 ring-primary ring-offset-4 bg-primary/10'
                  : '',
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onClick={handleCanvasClick}
              id="canvas-root"
              data-canvas-content
              style={{
                cursor: isPanning ? 'grabbing' : 'grab',
                width: '1200px',
                height: '800px',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${
                  pan.y
                }px)) scale(${zoom / 100})`,
                transformOrigin: 'center',
                transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                ...(isDragging && {
                  border: '3px dashed var(--color-primary)',
                  boxShadow:
                    '0 0 0 6px rgba(59, 130, 246, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 30px rgba(59, 130, 246, 0.1)',
                }),
              }}
            >
              <AnimatePresence mode="sync">
                {rootComponent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    <RenderComponent
                      component={rootComponent!}
                      isDragging={isDragging}
                      canvasZoom={zoom}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`h-full min-h-[700px] flex items-center justify-center rounded-lg border-2 border-dotted transition-colors ${
                      isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="text-center text-muted-foreground max-w-md">
                      <div className="flex justify-center mb-4">
                        <Palette
                          size={64}
                          className={`transition-colors ${
                            isDragging
                              ? 'text-primary'
                              : 'text-muted-foreground/50'
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-lg font-semibold mb-2 transition-colors ${
                          isDragging ? 'text-primary' : ''
                        }`}
                      >
                        {isDragging
                          ? 'Drop here to add component'
                          : project
                            ? 'Start Building'
                            : 'Create a Project'}
                      </h3>
                      <p className="text-sm">
                        {project
                          ? 'Drag components from the toolbox or click them to add to your canvas'
                          : 'Create a new project from File  New Project to start building'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DndContext>
      )}
    </div>
  );
}
