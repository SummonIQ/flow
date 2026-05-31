'use client';

import { cn } from '@/lib/utils';
import { motion, PanInfo, useDragControls } from 'framer-motion';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { DockSide, PanelConfig, useDockableLayout } from './dockable-layout';

interface DockablePanelProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  collapsible?: boolean;
  badge?: ReactNode;
}

const DOCK_THRESHOLD = 80;

export function DockablePanel({
  id,
  title,
  icon,
  children,
  defaultWidth = 280,
  defaultHeight = 400,
  minWidth = 200,
  minHeight = 200,
  collapsible = true,
  badge,
}: DockablePanelProps) {
  const {
    panels,
    floatPanel,
    dockPanel,
    isDraggingPanel,
    setIsDraggingPanel,
    setDraggedPanelId,
    dropHandledByZone,
    setDropHandledByZone,
  } = useDockableLayout();

  const panel = panels[id];
  const isFloating = panel?.side === 'floating';
  const isDocked = !isFloating;

  const [isMinimized, setIsMinimized] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState(() => {
    if (panel?.floatingPosition) return panel.floatingPosition;
    // Calculate default position based on panel id
    if (typeof window !== 'undefined') {
      if (id === 'toolbox') return { x: 20, y: 80 };
      if (id === 'properties')
        return { x: window.innerWidth - defaultWidth - 20, y: 80 };
      if (id === 'ai')
        return { x: window.innerWidth - defaultWidth - 40, y: 120 };
    }
    return { x: 100, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [nearDockZone, setNearDockZone] = useState<DockSide | null>(null);
  const dragControls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);

  // Update floating position when panel config changes
  useEffect(() => {
    if (panel?.floatingPosition) {
      setFloatingPosition(panel.floatingPosition);
    }
  }, [panel?.floatingPosition]);

  const detectDockZone = useCallback(
    (x: number, y: number): DockSide | null => {
      if (typeof window === 'undefined') return null;

      const { innerWidth, innerHeight } = window;
      const statusBarHeight = 32;

      // Only allow docking to left, right, or bottom (not top)
      if (x < DOCK_THRESHOLD) return 'left';
      if (x > innerWidth - DOCK_THRESHOLD) return 'right';
      if (y > innerHeight - statusBarHeight - DOCK_THRESHOLD) return 'bottom';

      return null;
    },
    [],
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setIsDraggingPanel(true);
    setDraggedPanelId(id);
  }, [id, setIsDraggingPanel, setDraggedPanelId]);

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const zone = detectDockZone(info.point.x, info.point.y);
      setNearDockZone(zone);
    },
    [detectDockZone],
  );

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      setIsDraggingPanel(false);
      setDraggedPanelId(null);

      // If a stacking zone already handled the drop, don't do anything
      if (dropHandledByZone) {
        setDropHandledByZone(false);
        setNearDockZone(null);
        return;
      }

      const zone = detectDockZone(info.point.x, info.point.y);

      if (zone && zone !== 'floating') {
        // Determine insert index based on cursor position relative to existing panels
        const panelsOnSide = Object.values(panels).filter(
          p => p.id !== id && p.side === zone,
        );

        if (panelsOnSide.length > 0) {
          const isVertical = zone === 'left' || zone === 'right';
          const position = isVertical ? info.point.y : info.point.x;
          const midpoint = isVertical
            ? window.innerHeight / 2
            : window.innerWidth / 2;
          const insertIndex = position < midpoint ? 0 : panelsOnSide.length;
          dockPanel(id, zone, insertIndex);
        } else {
          dockPanel(id, zone);
        }
      } else {
        // Float at current position
        const newX = info.point.x - defaultWidth / 2;
        const newY = info.point.y - 20;
        floatPanel(id, newX, newY);
        setFloatingPosition({ x: newX, y: newY });
      }

      setNearDockZone(null);
    },
    [
      id,
      panels,
      detectDockZone,
      dockPanel,
      floatPanel,
      defaultWidth,
      dropHandledByZone,
      setDropHandledByZone,
    ],
  );

  const handleUndock = useCallback(() => {
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      floatPanel(id, rect.left, rect.top);
      setFloatingPosition({ x: rect.left, y: rect.top });
    }
  }, [id, floatPanel]);

  // If not registered yet, don't render
  if (!panel) return null;

  // Render docked panel (simplified, rendered by DockedPanelContainer)
  if (isDocked) {
    return (
      <div
        ref={panelRef}
        className="h-full flex flex-col bg-card border-border"
      >
        {/* Header - draggable to undock */}
        <div
          className={cn(
            'border-b border-border bg-background shrink-0 select-none cursor-grab active:cursor-grabbing',
          )}
          onPointerDown={e => {
            if ((e.target as HTMLElement).closest('button')) return;
            // Start tracking for potential undock drag
            const startY = e.clientY;
            const startX = e.clientX;

            const handleMove = (moveEvent: PointerEvent) => {
              const deltaX = Math.abs(moveEvent.clientX - startX);
              const deltaY = Math.abs(moveEvent.clientY - startY);
              if (deltaX > 30 || deltaY > 30) {
                // Undock and start floating
                document.removeEventListener('pointermove', handleMove);
                document.removeEventListener('pointerup', handleUp);
                handleUndock();
              }
            };

            const handleUp = () => {
              document.removeEventListener('pointermove', handleMove);
              document.removeEventListener('pointerup', handleUp);
            };

            document.addEventListener('pointermove', handleMove);
            document.addEventListener('pointerup', handleUp);
          }}
        >
          <div className="px-3 py-2 flex items-center justify-between group/header">
            <div className="flex items-center">
              <div className="w-0 group-hover/header:w-5 transition-all duration-300 ease-out overflow-hidden flex items-center">
                <GripVertical
                  size={14}
                  className="text-muted-foreground opacity-0 scale-75 group-hover/header:opacity-100 group-hover/header:scale-100 transition-all duration-300 ease-out"
                />
              </div>
              <span className="text-xs font-semibold transition-transform duration-300 ease-out">
                {title}
              </span>
              {badge}
            </div>
            <div className="flex items-center gap-1">
              {collapsible && (
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isMinimized ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronUp size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div
            className="flex-1 overflow-auto"
            style={{ touchAction: 'pan-y' }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  // Render floating panel
  return (
    <>
      {/* Dock zone indicators while dragging - only show for sides without panels */}
      {isDragging && (
        <>
          <DockZoneIndicator
            side="left"
            active={nearDockZone === 'left'}
            panels={panels}
            currentId={id}
          />
          <DockZoneIndicator
            side="right"
            active={nearDockZone === 'right'}
            panels={panels}
            currentId={id}
          />
          <DockZoneIndicator
            side="bottom"
            active={nearDockZone === 'bottom'}
            panels={panels}
            currentId={id}
          />
        </>
      )}

      <motion.div
        ref={panelRef}
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragListener={false}
        initial={false}
        animate={{
          x: floatingPosition.x,
          y: floatingPosition.y,
        }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={cn(
          'fixed z-50 bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-2xl',
          isDragging && 'opacity-80',
          nearDockZone && 'ring-2 ring-primary',
        )}
        style={{
          width: defaultWidth,
          maxHeight: `calc(100vh - 120px)`,
          touchAction: 'none',
        }}
      >
        {/* Drag Handle / Header */}
        <div
          onPointerDown={e => {
            if ((e.target as HTMLElement).closest('button')) return;
            dragControls.start(e);
          }}
          className={cn(
            'border-b border-border shrink-0',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
        >
          <div className="bg-background px-3 py-2 flex items-center justify-between select-none group/header">
            <div className="flex items-center">
              <div className="w-0 group-hover/header:w-5 transition-all duration-300 ease-out overflow-hidden flex items-center">
                <GripVertical
                  size={14}
                  className="text-muted-foreground opacity-0 scale-75 group-hover/header:opacity-100 group-hover/header:scale-100 transition-all duration-300 ease-out"
                />
              </div>
              <span className="text-xs font-semibold transition-transform duration-300 ease-out">
                {title}
              </span>
              {badge}
            </div>
            <div className="flex items-center gap-1">
              {collapsible && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isMinimized ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronUp size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div
            className="flex-1 overflow-auto"
            style={{ maxHeight: defaultHeight }}
          >
            {children}
          </div>
        )}
      </motion.div>
    </>
  );
}

// Visual indicator for dock zones during drag
function DockZoneIndicator({
  side,
  active,
  panels,
  currentId,
}: {
  side: DockSide;
  active: boolean;
  panels: Record<string, PanelConfig>;
  currentId: string;
}) {
  if (side === 'floating') return null;

  // Don't show edge indicator if there are already panels on this side (except the one being dragged)
  const panelsOnSide = Object.values(panels).filter(
    p => p.id !== currentId && p.side === side,
  );
  if (panelsOnSide.length > 0) return null;

  const positionClasses = {
    left: 'left-0 top-[88px] bottom-[32px] w-20',
    right: 'right-0 top-[88px] bottom-[32px] w-20',
    top: 'top-[88px] left-0 right-0 h-16',
    bottom: 'bottom-[32px] left-0 right-0 h-16',
  }[side];

  return (
    <div
      className={cn(
        'fixed z-100 pointer-events-none transition-all duration-200',
        positionClasses,
        active
          ? 'bg-primary/30 border-2 border-primary border-dashed'
          : 'bg-primary/10 border-2 border-primary/30 border-dashed opacity-60',
      )}
    />
  );
}
