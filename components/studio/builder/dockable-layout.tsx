'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type DockSide = 'left' | 'right' | 'top' | 'bottom' | 'floating';

export interface PanelConfig {
  id: string;
  side: DockSide;
  order: number; // Order within the dock area (0, 1, 2, etc.)
  size?: number; // Percentage size within dock area
  floatingPosition?: { x: number; y: number };
}

export interface DockAreaSizes {
  left: number[];
  right: number[];
  top: number[];
  bottom: number[];
}

interface DockableLayoutContextType {
  panels: Record<string, PanelConfig>;
  dockAreaSizes: DockAreaSizes;
  updatePanel: (id: string, config: Partial<PanelConfig>) => void;
  dockPanel: (id: string, side: DockSide, insertAtIndex?: number) => void;
  floatPanel: (id: string, x: number, y: number) => void;
  getPanelsOnSide: (side: DockSide) => PanelConfig[];
  updateDockAreaSizes: (side: DockSide, sizes: number[]) => void;
  isDraggingPanel: boolean;
  setIsDraggingPanel: (dragging: boolean) => void;
  draggedPanelId: string | null;
  setDraggedPanelId: (id: string | null) => void;
  dropHandledByZone: boolean;
  setDropHandledByZone: (handled: boolean) => void;
}

const DockableLayoutContext = createContext<DockableLayoutContextType | null>(
  null,
);

export function useDockableLayout() {
  const context = useContext(DockableLayoutContext);
  if (!context) {
    throw new Error(
      'useDockableLayout must be used within DockableLayoutProvider',
    );
  }
  return context;
}

interface DockableLayoutProviderProps {
  children: ReactNode;
  defaultPanels?: Record<string, PanelConfig>;
}

const DEFAULT_PANELS: Record<string, PanelConfig> = {
  files: {
    id: 'files',
    side: 'left',
    order: 0,
  },
  // TODO: Add default docking slots for a dedicated Pages Browser and Layouts Browser.
  toolbox: {
    id: 'toolbox',
    side: 'left',
    order: 1,
  },
  properties: {
    id: 'properties',
    side: 'right',
    order: 0,
  },
  ai: {
    id: 'ai',
    side: 'right',
    order: 1,
  },
};

const DEFAULT_DOCK_SIZES: DockAreaSizes = {
  left: [],
  right: [],
  top: [],
  bottom: [],
};

export function DockableLayoutProvider({
  children,
  defaultPanels = DEFAULT_PANELS,
}: DockableLayoutProviderProps) {
  const [panels, setPanels] = useState<Record<string, PanelConfig>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('applab-panel-layout-v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultPanels;
        }
      }
    }
    return defaultPanels;
  });

  const [dockAreaSizes, setDockAreaSizes] = useState<DockAreaSizes>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('applab-dock-sizes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_DOCK_SIZES;
        }
      }
    }
    return DEFAULT_DOCK_SIZES;
  });

  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [draggedPanelId, setDraggedPanelId] = useState<string | null>(null);
  const [dropHandledByZone, setDropHandledByZone] = useState(false);

  // Persist panel layout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('applab-panel-layout-v2', JSON.stringify(panels));
    }
  }, [panels]);

  // Persist dock sizes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('applab-dock-sizes', JSON.stringify(dockAreaSizes));
    }
  }, [dockAreaSizes]);

  const updatePanel = useCallback(
    (id: string, config: Partial<PanelConfig>) => {
      setPanels(prev => ({
        ...prev,
        [id]: { ...prev[id], ...config },
      }));
    },
    [],
  );

  const getPanelsOnSide = useCallback(
    (side: DockSide): PanelConfig[] => {
      return Object.values(panels)
        .filter(p => p.side === side)
        .sort((a, b) => a.order - b.order);
    },
    [panels],
  );

  const updateDockAreaSizes = useCallback((side: DockSide, sizes: number[]) => {
    if (side === 'floating') return;
    setDockAreaSizes(prev => ({
      ...prev,
      [side]: sizes,
    }));
  }, []);

  const dockPanel = useCallback(
    (id: string, side: DockSide, insertAtIndex?: number) => {
      setPanels(prev => {
        const newPanels = { ...prev };
        const panel = newPanels[id];
        if (!panel) return prev;

        const oldSide = panel.side;

        // Remove from old side and reorder remaining panels
        if (oldSide !== 'floating' && oldSide !== side) {
          const oldSidePanels = Object.values(newPanels)
            .filter(p => p.id !== id && p.side === oldSide)
            .sort((a, b) => a.order - b.order);
          oldSidePanels.forEach((p, idx) => {
            newPanels[p.id] = { ...p, order: idx };
          });
        }

        if (side === 'floating') {
          // Float the panel
          newPanels[id] = {
            ...panel,
            side: 'floating',
            order: 0,
            floatingPosition: panel.floatingPosition || { x: 100, y: 100 },
          };
        } else {
          // Dock the panel
          const existingPanels = Object.values(newPanels)
            .filter(p => p.id !== id && p.side === side)
            .sort((a, b) => a.order - b.order);

          const targetIndex = insertAtIndex ?? existingPanels.length;

          // Reorder existing panels to make room
          existingPanels.forEach((p, idx) => {
            const newOrder = idx >= targetIndex ? idx + 1 : idx;
            newPanels[p.id] = { ...p, order: newOrder };
          });

          newPanels[id] = {
            ...panel,
            side,
            order: targetIndex,
          };
        }

        return newPanels;
      });

      // Update dock area sizes to redistribute evenly
      if (side !== 'floating') {
        setDockAreaSizes(prev => {
          const panelsOnSide = Object.values(panels).filter(
            p => p.side === side || p.id === id,
          ).length;
          const newCount =
            panels[id]?.side === side ? panelsOnSide : panelsOnSide + 1;
          const evenSize = 100 / newCount;
          return {
            ...prev,
            [side]: Array(newCount).fill(evenSize),
          };
        });
      }
    },
    [panels],
  );

  const floatPanel = useCallback((id: string, x: number, y: number) => {
    setPanels(prev => {
      const newPanels = { ...prev };
      const panel = newPanels[id];
      if (!panel) return prev;

      const oldSide = panel.side;

      // If undocking, reorder remaining panels on that side
      if (oldSide !== 'floating') {
        const oldSidePanels = Object.values(newPanels)
          .filter(p => p.id !== id && p.side === oldSide)
          .sort((a, b) => a.order - b.order);
        oldSidePanels.forEach((p, idx) => {
          newPanels[p.id] = { ...p, order: idx };
        });
      }

      newPanels[id] = {
        ...panel,
        side: 'floating',
        order: 0,
        floatingPosition: { x, y },
      };

      return newPanels;
    });
  }, []);

  return (
    <DockableLayoutContext.Provider
      value={{
        panels,
        dockAreaSizes,
        updatePanel,
        dockPanel,
        floatPanel,
        getPanelsOnSide,
        updateDockAreaSizes,
        isDraggingPanel,
        setIsDraggingPanel,
        draggedPanelId,
        setDraggedPanelId,
        dropHandledByZone,
        setDropHandledByZone,
      }}
    >
      {children}
    </DockableLayoutContext.Provider>
  );
}

// Dock zone indicator shown during drag - edge zones for empty sides
interface DockZoneProps {
  side: DockSide;
}

export function DockZone({ side }: DockZoneProps) {
  const {
    isDraggingPanel,
    draggedPanelId,
    dockPanel,
    panels,
    getPanelsOnSide,
  } = useDockableLayout();
  const [isHovered, setIsHovered] = useState(false);

  const panelsOnSide = getPanelsOnSide(side);
  const hasPanels = panelsOnSide.length > 0;

  const handleDrop = useCallback(() => {
    if (!draggedPanelId) return;
    dockPanel(draggedPanelId, side);
  }, [draggedPanelId, dockPanel, side]);

  if (!isDraggingPanel || side === 'floating') return null;

  // Don't show edge zone if this side already has panels - stacking zones handle that
  if (hasPanels) return null;

  // Don't show if dragging a panel that's already on this side
  if (draggedPanelId && panels[draggedPanelId]?.side === side) {
    return null;
  }

  const isVerticalSide = side === 'left' || side === 'right';

  const positionClasses = isVerticalSide
    ? `${side === 'left' ? 'left-0' : 'right-0'} top-[88px] bottom-[32px] w-24`
    : `${side === 'top' ? 'top-[88px]' : 'bottom-[32px]'} left-0 right-0 h-20`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed z-100 ${positionClasses} pointer-events-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseUp={handleDrop}
      data-dock-zone={side}
    >
      <div
        className={`h-full w-full transition-all duration-150 rounded-lg ${
          isHovered
            ? 'bg-lime-500/30 border border-lime-400/70 shadow-lg shadow-lime-500/20'
            : 'bg-lime-500/10 border border-lime-400/30'
        }`}
      />
    </motion.div>
  );
}

// Stacking zone - shown when dragging over an occupied dock area
interface StackingZoneProps {
  side: DockSide;
  position: 'before' | 'after';
  panelId: string;
  isVertical: boolean;
}

export function StackingZone({
  side,
  position,
  panelId,
  isVertical,
}: StackingZoneProps) {
  const {
    isDraggingPanel,
    draggedPanelId,
    dockPanel,
    getPanelsOnSide,
    setDropHandledByZone,
  } = useDockableLayout();
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = useCallback(() => {
    if (!draggedPanelId) return;
    setDropHandledByZone(true);
    const panelsOnSide = getPanelsOnSide(side);
    const existingIndex = panelsOnSide.findIndex(p => p.id === panelId);
    const insertIndex =
      position === 'before' ? existingIndex : existingIndex + 1;
    dockPanel(draggedPanelId, side, insertIndex);
  }, [
    draggedPanelId,
    dockPanel,
    side,
    position,
    panelId,
    getPanelsOnSide,
    setDropHandledByZone,
  ]);

  if (!isDraggingPanel) return null;

  // Don't show zone for the panel being dragged
  if (draggedPanelId === panelId) return null;

  const positionClasses = isVertical
    ? position === 'before'
      ? 'top-0 left-0 right-0 h-1/3'
      : 'bottom-0 left-0 right-0 h-1/3'
    : position === 'before'
      ? 'left-0 top-0 bottom-0 w-1/3'
      : 'right-0 top-0 bottom-0 w-1/3';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute z-101 ${positionClasses} pointer-events-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseUp={handleDrop}
      data-dock-zone={`${side}-${position}`}
    >
      <div
        className={`h-full w-full transition-all duration-150 rounded ${
          isHovered
            ? 'bg-lime-500/30 border border-lime-400/60 shadow-md shadow-lime-500/20'
            : 'bg-lime-500/10 border border-lime-400/25'
        }`}
      >
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-lime-100 bg-lime-600/80 px-2 py-0.5 rounded">
              {position === 'before'
                ? isVertical
                  ? 'Above'
                  : 'Left'
                : isVertical
                  ? 'Below'
                  : 'Right'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Container for docked panels on a side
interface DockedPanelContainerProps {
  side: DockSide;
  children: (panelId: string) => ReactNode;
  defaultSize?: number;
}

export function DockedPanelContainer({
  side,
  children,
  defaultSize = 280,
}: DockedPanelContainerProps) {
  const { getPanelsOnSide, dockAreaSizes, updateDockAreaSizes } =
    useDockableLayout();
  const panelsOnSide = getPanelsOnSide(side);
  const [containerSize, setContainerSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSize, setExpandedSize] = useState(defaultSize);

  if (panelsOnSide.length === 0 || side === 'floating') return null;

  const isVertical = side === 'left' || side === 'right';
  const direction = isVertical ? 'vertical' : 'horizontal';
  const sizes = dockAreaSizes[side as keyof DockAreaSizes] || [];

  // Calculate default sizes if not set
  const panelSizes =
    sizes.length === panelsOnSide.length
      ? sizes
      : panelsOnSide.map(() => 100 / panelsOnSide.length);

  const handleResize = (newSizes: number[]) => {
    updateDockAreaSizes(side, newSizes);
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      setContainerSize(expandedSize);
    } else {
      setExpandedSize(containerSize);
      setContainerSize(0);
    }
    setIsCollapsed(!isCollapsed);
  };

  const displaySize = isCollapsed ? 0 : containerSize;
  const containerStyle = isVertical
    ? { width: displaySize, height: '100%' }
    : { height: displaySize, width: '100%' };

  // Collapse button icon based on side and state
  const CollapseIcon = {
    left: isCollapsed ? ChevronRight : ChevronLeft,
    right: isCollapsed ? ChevronLeft : ChevronRight,
    top: isCollapsed ? ChevronDown : ChevronUp,
    bottom: isCollapsed ? ChevronUp : ChevronDown,
  }[side];

  const borderClass = {
    left: '',
    right: '',
    top: '',
    bottom: '',
  }[side];

  const { isDraggingPanel, draggedPanelId } = useDockableLayout();

  // Check if we should show stacking zones
  const showStackingZones =
    isDraggingPanel &&
    draggedPanelId &&
    panelsOnSide.every(p => p.id !== draggedPanelId);

  // Handle container edge resize
  const handleEdgeResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startPos = isVertical ? e.clientX : e.clientY;
    const startSize = containerSize;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = isVertical ? moveEvent.clientX : moveEvent.clientY;
      let delta = currentPos - startPos;

      // Invert delta for right/bottom panels
      if (side === 'right' || side === 'bottom') {
        delta = -delta;
      }

      const newSize = Math.max(150, Math.min(600, startSize + delta));
      setContainerSize(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Resize handle position and styling - centered on the border
  const isHorizontalResize = side === 'left' || side === 'right';
  const resizeHandlePosition = {
    left: 'right-0 top-0 bottom-0 translate-x-1/2',
    right: 'left-0 top-0 bottom-0 -translate-x-1/2',
    top: 'bottom-0 left-0 right-0 translate-y-1/2',
    bottom: 'top-0 left-0 right-0 -translate-y-1/2',
  }[side];

  // Collapse button position
  const collapseButtonPosition = {
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full',
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full',
  }[side];

  return (
    <div
      className={`shrink-0 bg-card ${borderClass} relative overflow-visible`}
      style={{
        width: isVertical ? displaySize : '100%',
        height: isVertical ? '100%' : displaySize,
      }}
    >
      {/* Resize handle on the inner edge - matches ResizableHandle exactly */}
      <div
        className={`absolute z-50 ${resizeHandlePosition} ${
          isHorizontalResize
            ? 'w-px cursor-col-resize'
            : 'h-px cursor-row-resize'
        } flex items-center justify-center bg-border/50`}
        onMouseDown={handleEdgeResizeStart}
      >
        <div
          className={`z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border ${
            !isHorizontalResize ? 'rotate-90' : ''
          }`}
        >
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      </div>
      {panelsOnSide.length === 1 ? (
        <div className="h-full w-full overflow-visible relative">
          {children(panelsOnSide[0].id)}
          {showStackingZones && (
            <>
              <StackingZone
                side={side}
                position="before"
                panelId={panelsOnSide[0].id}
                isVertical={isVertical}
              />
              <StackingZone
                side={side}
                position="after"
                panelId={panelsOnSide[0].id}
                isVertical={isVertical}
              />
            </>
          )}
        </div>
      ) : (
        <ResizablePanelGroup
          direction={direction}
          className="h-full w-full"
          autoSaveId={`dockable-layout-${side}`}
          onLayout={handleResize}
        >
          {panelsOnSide.map((panel, index) => (
            <React.Fragment key={panel.id}>
              {index > 0 && (
                <ResizableHandle
                  withHandle
                  className={
                    isVertical
                      ? 'h-2 cursor-row-resize'
                      : 'w-2 cursor-col-resize'
                  }
                />
              )}
              <ResizablePanel
                defaultSize={panelSizes[index]}
                minSize={15}
                className="overflow-hidden relative"
              >
                {children(panel.id)}
                {showStackingZones && (
                  <>
                    {index === 0 && (
                      <StackingZone
                        side={side}
                        position="before"
                        panelId={panel.id}
                        isVertical={isVertical}
                      />
                    )}
                    <StackingZone
                      side={side}
                      position="after"
                      panelId={panel.id}
                      isVertical={isVertical}
                    />
                  </>
                )}
              </ResizablePanel>
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      )}
    </div>
  );
}
