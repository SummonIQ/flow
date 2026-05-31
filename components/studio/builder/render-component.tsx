'use client';

import { useBuilderStore } from '@/lib/studio/store';
import { cn } from '@/lib/utils';
import { BuilderComponent, ComponentType } from '@/types/studio/builder';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import { motion } from 'framer-motion';
import { ImageIcon, Trash2 } from 'lucide-react';
import {
  createElement,
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

function DropZone({
  targetId,
  position,
  orientation,
  interactive = true,
}: {
  targetId: string;
  position: 'before' | 'after' | 'inside';
  orientation: 'vertical' | 'horizontal';
  interactive?: boolean;
}) {
  const {
    isDragging,
    insertComponent,
    insertComponentWithData,
    moveComponent,
    setIsDragging,
    activeDropZoneId,
    setActiveDropZoneId,
    draggedComponentType,
    setDraggedComponentType,
    draggedAiComponentData,
    setDraggedAiComponentData,
  } = useBuilderStore();

  const zoneId = `drop-zone-${targetId}-${position}`;
  const isActive = activeDropZoneId === zoneId;
  const isInside = position === 'inside';
  const effectiveOrientation = isInside ? 'vertical' : orientation;
  const isHorizontal = effectiveOrientation === 'horizontal';

  // Reset when drag ends globally or when interaction is disabled
  useEffect(() => {
    if (!isDragging || !interactive) {
      setActiveDropZoneId(null);
    }
  }, [isDragging, interactive, setActiveDropZoneId]);

  if (!isDragging || !interactive) return null;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropZoneId(zoneId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const existingId = e.dataTransfer.getData('existingComponentId');
    const componentType = e.dataTransfer.getData('componentType');

    // Set appropriate cursor hint
    if (existingId) {
      e.dataTransfer.dropEffect = 'move';
    } else if (componentType) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }

    // Just highlight this zone; actual move/insert happens on drop
    if (activeDropZoneId !== zoneId) {
      setActiveDropZoneId(zoneId);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropZoneId(null);
    setIsDragging(false);

    // Try dataTransfer first, fall back to store
    const componentType = (e.dataTransfer.getData('componentType') ||
      draggedComponentType) as ComponentType | null;
    const existingId = e.dataTransfer.getData('existingComponentId');
    const aiComponentDataString = e.dataTransfer.getData('aiComponentData');

    console.log('DropZone handleDrop:', {
      componentType,
      existingId,
      draggedComponentType,
      draggedAiComponentData: !!draggedAiComponentData,
    });

    // Clear the dragged type from store
    setDraggedComponentType(null);
    setDraggedAiComponentData(null);

    // Handle AI component - try dataTransfer first, then fall back to store
    if (aiComponentDataString) {
      try {
        const componentData = JSON.parse(aiComponentDataString);
        insertComponentWithData(componentData, targetId, position);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Fallback: check store for AI component data (Electron workaround)
    if (draggedAiComponentData) {
      insertComponentWithData(draggedAiComponentData, targetId, position);
      return;
    }

    if (existingId) {
      moveComponent(existingId, targetId, position);
      return;
    }

    if (componentType) {
      insertComponent(componentType, targetId, position);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`transition-all duration-150 flex items-center justify-center ${
        isInside
          ? 'w-full h-full min-h-[100px]'
          : isHorizontal
            ? isActive
              ? 'w-6 mx-2 h-full shrink-0'
              : 'w-1 mx-1 h-full shrink-0'
            : isActive
              ? 'h-4 my-2 w-full shrink-0'
              : 'h-1 w-full shrink-0'
      }`}
      data-drop-zone-id={zoneId}
    >
      {isActive &&
        (isInside ? (
          // Overlay when dropping inside a container
          <div className="pointer-events-none w-[96%] h-[90%] rounded-md border border-blue-600 bg-blue-500/10 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        ) : (
          // Thin line when dropping before/between/after siblings
          <div
            className={`pointer-events-none bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)] rounded-full ${
              isHorizontal ? 'h-[70%] w-1.5' : 'w-[96%] h-1.5'
            }`}
          />
        ))}
    </div>
  );
}

interface RenderComponentProps {
  component: BuilderComponent;
  isDragging?: boolean;
  depth?: number;
  interactive?: boolean;
  runtime?: boolean;
  canvasZoom?: number;
}

// Color palette for root elements and their children
const ROOT_COLORS = [
  { base: '#3b82f6', shades: ['#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'] }, // Blue
  { base: '#10b981', shades: ['#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'] }, // Green
  { base: '#f59e0b', shades: ['#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'] }, // Amber
  { base: '#8b5cf6', shades: ['#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'] }, // Purple
  { base: '#ef4444', shades: ['#f87171', '#fca5a5', '#fecaca', '#fee2e2'] }, // Red
  { base: '#06b6d4', shades: ['#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'] }, // Cyan
];

const getOutlineColor = (
  component: BuilderComponent,
  components: Record<string, BuilderComponent>,
  depth: number,
): string => {
  // Find the root ancestor
  let rootAncestor = component;
  while (rootAncestor.parentId && components[rootAncestor.parentId]) {
    rootAncestor = components[rootAncestor.parentId];
  }

  // Use component ID hash to determine root color
  const colorIndex =
    parseInt(rootAncestor.id.slice(-6), 36) % ROOT_COLORS.length;
  const colorScheme = ROOT_COLORS[colorIndex];

  // Root element gets base color
  if (depth === 0) {
    return colorScheme.base;
  }

  // Children get progressively lighter shades
  const shadeIndex = Math.min(depth - 1, colorScheme.shades.length - 1);
  return colorScheme.shades[shadeIndex];
};

export function RenderComponent({
  component,
  isDragging = false,
  depth = 0,
  interactive = true,
  runtime = false,
  canvasZoom = 100,
}: RenderComponentProps) {
  const {
    selectComponent,
    selectedId,
    selectedIds,
    toggleSelection,
    hoveredId,
    hoverComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    insertComponent,
    insertComponentWithData,
    getComponents,
    outlineMode,
    setIsDragging,
    isDragging: isGlobalDragging,
    activeDropContainerId,
    setActiveDropContainerId,
    setDraggedComponentId,
    draggedComponentType,
    setDraggedComponentType,
    draggedAiComponentData,
    setDraggedAiComponentData,
    project,
    updateProject,
    droppedComponentId,
    setDroppedComponentId,
  } = useBuilderStore();
  const components = getComponents();
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const resizeRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    left: number;
    top: number;
    scale: number;
    moved: boolean;
    dx: number;
    dy: number;
    prevTransform: string;
    prevWillChange: string;
  } | null>(null);
  const isRoot = !component.parentId;
  const isNewlyDropped = droppedComponentId === component.id;

  // Handle ripple animation for newly dropped components
  useEffect(() => {
    if (isNewlyDropped) {
      setContentVisible(false);
      setShowRipple(true);

      // After ripple animation, show content and clear dropped state
      const timer = setTimeout(() => {
        setShowRipple(false);
        setContentVisible(true);
        setDroppedComponentId(null);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isNewlyDropped, setDroppedComponentId]);

  const isSelected = selectedIds.includes(component.id);
  const isHovered = hoveredId === component.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive) return;
    if (e.metaKey || e.ctrlKey) {
      toggleSelection(component.id);
    } else {
      selectComponent(component.id);
    }
  };

  const handleMouseEnter = () => {
    if (!interactive) return;
    hoverComponent(component.id);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    hoverComponent(null);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(component.id);
  };

  const parsePx = (value: any): number | null => {
    if (typeof value !== 'string') return null;
    const m = value.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (!m) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : null;
  };

  const handleMoveMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    if (runtime) return;
    if (isRoot) return;
    if (isResizing) return;

    // Only drag when the component is already selected to avoid interfering with normal clicks.
    if (!isSelected) return;

    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, select')) return;
    if (target?.closest('button')) return;

    if (e.button !== 0) return;

    const el = resizeRef.current;
    if (!el) return;

    const scale = (canvasZoom || 100) / 100;

    const currentLeft = parsePx(component.styles.left) ?? 0;
    const currentTop = parsePx(component.styles.top) ?? 0;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      left: currentLeft,
      top: currentTop,
      scale,
      moved: false,
      dx: 0,
      dy: 0,
      prevTransform: el.style.transform,
      prevWillChange: el.style.willChange,
    };

    const handleMove = (moveEvent: MouseEvent) => {
      const start = dragStartRef.current;
      if (!start) return;

      const dx = (moveEvent.clientX - start.mouseX) / start.scale;
      const dy = (moveEvent.clientY - start.mouseY) / start.scale;
      start.dx = dx;
      start.dy = dy;

      // Don't start a drag until we've moved a bit (prevents click from mutating layout)
      const DRAG_THRESHOLD = 3;
      if (!start.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
          return;
        }
        start.moved = true;
        setIsDraggingLocal(true);
        setDraggedComponentId(component.id);
        // Prevent text selection / odd native drag behavior once we're actually dragging
        moveEvent.preventDefault();
        el.style.willChange = 'transform';
      }

      // Fast path: move visually with transform (no store updates)
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
    };

    const handleUp = () => {
      const start = dragStartRef.current;
      dragStartRef.current = null;

      // Restore element styles
      el.style.transform = start?.prevTransform ?? '';
      el.style.willChange = start?.prevWillChange ?? '';

      setIsDraggingLocal(false);
      setDraggedComponentId(null);

      // Only commit if we actually dragged
      if (start?.moved) {
        const state = useBuilderStore.getState();
        const latest = state.getComponents()[component.id];
        const latestStyles = latest?.styles ?? component.styles;

        const nextLeft = (parsePx(latestStyles.left) ?? start.left) + start.dx;
        const nextTop = (parsePx(latestStyles.top) ?? start.top) + start.dy;

        updateComponent(component.id, {
          styles: {
            ...latestStyles,
            position:
              typeof latestStyles.position === 'string' && latestStyles.position
                ? (latestStyles.position as any)
                : 'relative',
            left: `${nextLeft}px`,
            top: `${nextTop}px`,
          },
        });
      }

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!interactive) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = resizeRef.current?.offsetWidth || 0;
    const startHeight = resizeRef.current?.offsetHeight || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) newWidth = startWidth + deltaX;
      if (direction.includes('w')) newWidth = startWidth - deltaX;
      if (direction.includes('s')) newHeight = startHeight + deltaY;
      if (direction.includes('n')) newHeight = startHeight - deltaY;

      if (newWidth > 20) {
        updateComponent(component.id, {
          styles: { ...component.styles, width: `${newWidth}px` },
        });

        // Grow parent if needed
        if (component.parentId && components[component.parentId]) {
          const parent = components[component.parentId];
          const parentEl = document.querySelector(
            `[data-component-id="${parent.id}"]`,
          ) as HTMLElement;
          if (parentEl) {
            const parentWidth = parentEl.offsetWidth;
            const parentPadding =
              parseInt(getComputedStyle(parentEl).paddingLeft || '0') +
              parseInt(getComputedStyle(parentEl).paddingRight || '0');
            const requiredWidth = newWidth + parentPadding + 32; // Add some margin

            if (requiredWidth > parentWidth) {
              updateComponent(parent.id, {
                styles: { ...parent.styles, minWidth: `${requiredWidth}px` },
              });
            }
          }
        }
      }
      if (newHeight > 20) {
        updateComponent(component.id, {
          styles: { ...component.styles, height: `${newHeight}px` },
        });

        // Grow parent if needed
        if (component.parentId && components[component.parentId]) {
          const parent = components[component.parentId];
          const parentEl = document.querySelector(
            `[data-component-id="${parent.id}"]`,
          ) as HTMLElement;
          if (parentEl) {
            const parentHeight = parentEl.offsetHeight;
            const parentPadding =
              parseInt(getComputedStyle(parentEl).paddingTop || '0') +
              parseInt(getComputedStyle(parentEl).paddingBottom || '0');
            const requiredHeight = newHeight + parentPadding + 32; // Add some margin

            if (requiredHeight > parentHeight) {
              updateComponent(parent.id, {
                styles: { ...parent.styles, minHeight: `${requiredHeight}px` },
              });
            }
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const containerTypes = [
    'Page',
    'Container',
    'Flex',
    'Grid',
    'Card',
    'Stack',
    'Form',
    'List',
  ];
  const isContainer = containerTypes.includes(component.type);

  const runEventAction = (eventKey: string, domEvent: any) => {
    const action = component.events?.[eventKey];
    if (!action) return;

    try {
      if (action.type === 'setVariable') {
        if (!project) return;
        const variables = project.variables || [];
        const targetId = action.variableId;
        const targetName = action.variableName;
        const nextVariables = variables.map(v => {
          if (targetId && v.id === targetId) {
            return { ...v, value: action.variableValue };
          }
          if (!targetId && targetName && v.name === targetName) {
            return { ...v, value: action.variableValue };
          }
          return v;
        });
        updateProject({ variables: nextVariables });
      } else if (
        (action.type === 'code' || action.type === 'aiCode') &&
        action.code
      ) {
        const fn = new Function('event', action.code);
        fn(domEvent);
      }
    } catch (err) {
      console.error('Error executing event handler', err);
    }
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    if (!isContainer || !interactive) return;
    e.preventDefault();
    e.stopPropagation();

    const existingId = e.dataTransfer.getData('existingComponentId');
    const componentType = e.dataTransfer.getData('componentType');

    if (existingId) {
      e.dataTransfer.dropEffect = 'move';
    } else if (componentType) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }

    if (activeDropContainerId !== component.id) {
      setActiveDropContainerId(component.id);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    if (!isContainer || !interactive) return;
    e.preventDefault();
    e.stopPropagation();

    setActiveDropContainerId(null);
    setIsDragging(false);

    // Try dataTransfer first, fall back to store
    const componentType = (e.dataTransfer.getData('componentType') ||
      draggedComponentType) as ComponentType | null;
    const existingId = e.dataTransfer.getData('existingComponentId');
    const aiComponentDataString = e.dataTransfer.getData('aiComponentData');

    // Clear the dragged type from store
    setDraggedComponentType(null);
    setDraggedAiComponentData(null);

    if (aiComponentDataString) {
      try {
        const componentData = JSON.parse(aiComponentDataString);
        insertComponentWithData(componentData, component.id, 'inside');
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Fallback: check store for AI component data (Electron workaround)
    if (draggedAiComponentData) {
      insertComponentWithData(draggedAiComponentData, component.id, 'inside');
      return;
    }

    if (existingId) {
      moveComponent(existingId, component.id, 'inside');
      return;
    }

    if (componentType) {
      insertComponent(componentType, component.id, 'inside');
    }
  };

  useEffect(() => {
    if (!isGlobalDragging) {
      setActiveDropContainerId(null);
    }
  }, [isGlobalDragging, setActiveDropContainerId]);

  // Separate styles into wrapper (layout) and inner (visual/content)
  const {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
    justifySelf,
    position,
    top,
    left,
    right,
    bottom,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    zIndex,
    ...visualStyles
  } = component.styles;

  const normalizeDimension = (value: any) => {
    if (value === '100vw' || value === '100vh') return '100%';
    return value;
  };

  const parentComponent = component.parentId
    ? components[component.parentId]
    : undefined;

  const isFlexLikeType = (type: string | undefined) =>
    type === 'Container' ||
    type === 'Flex' ||
    type === 'Stack' ||
    type === 'Form' ||
    type === 'Page';

  const isFlexDisplay = (displayValue: any) =>
    typeof displayValue === 'string' && displayValue.toLowerCase() === 'flex';

  const mapFlexAlignment = (value: any) => {
    if (value === 'start') return 'flex-start';
    if (value === 'end') return 'flex-end';
    return value;
  };

  const parentIsFlex =
    isFlexDisplay(parentComponent?.styles?.display) ||
    isFlexLikeType(parentComponent?.type);

  // Separate width/height for Framer Motion animation (non-root only)
  const animatedWidth = isRoot ? '100%' : normalizeDimension(width);
  const animatedHeight = isRoot ? undefined : normalizeDimension(height);

  const wrapperStyle: CSSProperties = {
    minWidth: isRoot ? '100%' : normalizeDimension(minWidth),
    minHeight: isRoot ? '100%' : normalizeDimension(minHeight),
    maxWidth,
    maxHeight,
    // Avoid mixing shorthand flex with longhand properties to prevent React errors
    ...(flex ? { flex } : { flexGrow, flexShrink, flexBasis }),
    alignSelf:
      alignSelf === 'auto'
        ? 'auto'
        : parentIsFlex
          ? (mapFlexAlignment(alignSelf) as any)
          : (alignSelf as any),
    justifySelf: justifySelf === 'auto' ? 'auto' : (justifySelf as any),
    position: position as any,
    top,
    left,
    right,
    bottom,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    zIndex: (isHovered ? 30 : isSelected ? 20 : zIndex) as number | undefined,
  };

  const isContainerType =
    component.type === 'Page' ||
    component.type === 'Container' ||
    component.type === 'Flex' ||
    component.type === 'Grid' ||
    component.type === 'Card' ||
    component.type === 'Stack' ||
    component.type === 'Form' ||
    component.type === 'List' ||
    component.type === 'Table' ||
    component.type === 'DataGrid';

  const classNameStr =
    typeof component.className === 'string' ? component.className : '';
  const classHasGrid = /(^|\s)grid(\s|$)/.test(classNameStr);
  const classHasFlex = /(^|\s)(flex|inline-flex)(\s|$)/.test(classNameStr);
  const classFlexDirection = /(^|\s)flex-col(\s|$)/.test(classNameStr)
    ? 'column'
    : /(^|\s)flex-row(\s|$)/.test(classNameStr)
      ? 'row'
      : undefined;

  const resolvedDisplay =
    (component.styles as any).display ||
    (classHasGrid
      ? 'grid'
      : classHasFlex
        ? 'flex'
        : component.type === 'Grid'
          ? 'grid'
          : isFlexLikeType(component.type)
            ? 'flex'
            : undefined);

  const resolvedFlexDirection =
    (component.styles as any).flexDirection ||
    classFlexDirection ||
    (component.type === 'Flex'
      ? 'row'
      : component.type === 'Stack' ||
          component.type === 'Container' ||
          component.type === 'Form' ||
          component.type === 'Page'
        ? 'column'
        : undefined);

  const isThisFlex = isFlexDisplay(resolvedDisplay);

  const shouldFillContainerVisuals =
    isContainerType &&
    (isRoot ||
      !!height ||
      !!minHeight ||
      !!maxHeight ||
      !!flex ||
      !!flexGrow ||
      !!flexBasis);

  const effectiveVisualStyles: CSSProperties = (() => {
    const styles = { ...visualStyles } as CSSProperties;

    if (component.type === 'Button') {
      // Strip only the default canvas button visual styles so shadcn variants can show.
      // If the user has customized these values, we keep them.
      if (component.styles.padding === '0.5rem 1rem') delete styles.padding;
      if (component.styles.backgroundColor === 'var(--color-canvas-primary)') {
        delete styles.backgroundColor;
      }
      if (component.styles.color === 'var(--color-canvas-primary-foreground)') {
        delete styles.color;
      }
      if (component.styles.border === 'none') delete styles.border;
      if (component.styles.borderRadius === '0.375rem')
        delete styles.borderRadius;
      if (component.styles.fontSize === '0.875rem') delete styles.fontSize;
      if (component.styles.fontWeight === '500') delete styles.fontWeight;
    }

    return styles;
  })();

  const innerStyle: CSSProperties = {
    ...effectiveVisualStyles,
    ...(resolvedDisplay ? { display: resolvedDisplay } : {}),
    ...(resolvedFlexDirection ? { flexDirection: resolvedFlexDirection } : {}),
    ...((isThisFlex && (component.styles as any).alignItems
      ? { alignItems: mapFlexAlignment((component.styles as any).alignItems) }
      : {}) as any),
    ...((isThisFlex && (component.styles as any).justifyContent
      ? {
          justifyContent: mapFlexAlignment(
            (component.styles as any).justifyContent,
          ),
        }
      : {}) as any),
    boxSizing: 'border-box',
    margin: 0,
    // Smooth transitions for visual properties
    transition:
      'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, border-radius 0.2s ease, padding 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
    ...(isContainerType ? { width: '100%' } : {}),
    ...(!isRoot && shouldFillContainerVisuals ? { height: '100%' } : {}),
    ...(isRoot
      ? {
          width: '100%',
          minWidth: '100%',
          minHeight: '100%',
          height: '100%',
        }
      : {}),
  };

  const effectiveOutlineMode = interactive && outlineMode;
  const outlineColor = effectiveOutlineMode
    ? getOutlineColor(component, components, depth)
    : undefined;

  const isActiveContainerDrop =
    isGlobalDragging && activeDropContainerId === component.id;

  const children: ReactNode[] = [];
  const isRow = component.styles.flexDirection === 'row';

  if (component.children.length === 0) {
    children.push(
      <DropZone
        key={`drop-empty-${component.id}`}
        targetId={component.id}
        position="inside"
        orientation={isRow ? 'horizontal' : 'vertical'}
        interactive={interactive}
      />,
    );
  } else {
    component.children.forEach((child, index) => {
      // Only add "before" zone for the very first element
      if (index === 0) {
        children.push(
          <DropZone
            key={`drop-before-${child.id}`}
            targetId={child.id}
            position="before"
            orientation={isRow ? 'horizontal' : 'vertical'}
            interactive={interactive}
          />,
        );
      }

      children.push(
        <RenderComponent
          key={child.id}
          component={child}
          isDragging={isGlobalDragging}
          depth={depth + 1}
          interactive={interactive}
          runtime={runtime}
          canvasZoom={canvasZoom}
        />,
      );

      // Add "after" zone for every element
      children.push(
        <DropZone
          key={`drop-after-${child.id}`}
          targetId={child.id}
          position="after"
          orientation={isRow ? 'horizontal' : 'vertical'}
          interactive={interactive}
        />,
      );
    });
  }

  const content = (() => {
    switch (component.type) {
      case 'Button': {
        const rawClassName =
          typeof component.className === 'string' ? component.className : '';
        const buttonClassName = cn(
          rawClassName
            .split(/\s+/)
            .filter(Boolean)
            .filter(token => {
              return !/^(bg-|text-|border-|ring-|shadow-)/.test(token);
            })
            .filter(token => {
              return !/^(hover:|focus:|focus-visible:|active:)/.test(token);
            })
            .join(' '),
        );

        // Only allow safe variants for UI buttons; fall back to default
        const rawVariant = component.props.variant;
        const safeVariant =
          rawVariant === 'outline' ||
          rawVariant === 'secondary' ||
          rawVariant === 'ghost' ||
          rawVariant === 'destructive' ||
          rawVariant === 'link' ||
          rawVariant === 'default'
            ? rawVariant
            : 'default';

        const size =
          component.props.size === 'sm' ||
          component.props.size === 'lg' ||
          component.props.size === 'icon'
            ? component.props.size
            : 'default';

        if (runtime) {
          return (
            <Button
              style={innerStyle as any}
              className={buttonClassName}
              variant={safeVariant}
              size={size}
              onClick={e => runEventAction('onClick', e)}
            >
              {component.props.text || 'Button'}
            </Button>
          );
        }

        return (
          <Button
            style={innerStyle as any}
            className={buttonClassName}
            variant={safeVariant}
            size={size}
            onClick={handleClick}
          >
            {component.props.text || 'Button'}
          </Button>
        );
      }
      case 'Text':
        return (
          <div
            style={innerStyle}
            className={cn(component.className)}
            onClick={handleClick}
          >
            {component.props.text || 'Text'}
          </div>
        );
      case 'Heading':
        return createElement(
          `h${component.props.level || 2}`,
          {
            style: innerStyle,
            className: cn(component.className),
            onClick: handleClick,
          },
          component.props.text || 'Heading',
        );
      case 'Input':
        return (
          <input
            type={component.props.type || 'text'}
            placeholder={component.props.placeholder}
            style={innerStyle}
            className={cn(component.className)}
            onClick={handleClick}
          />
        );
      case 'Textarea':
        return (
          <textarea
            placeholder={component.props.placeholder}
            style={innerStyle}
            className={cn(component.className)}
            onClick={handleClick}
            rows={4}
          />
        );
      case 'Select':
        return (
          <Select
            value="__placeholder__"
            onValueChange={() => {
              // No-op in builder preview
            }}
          >
            <SelectTrigger
              className={cn('w-full', component.className)}
              style={innerStyle}
              onClick={handleClick}
            >
              <SelectValue
                placeholder={component.props.placeholder || 'Select an option'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__placeholder__">
                {component.props.placeholder || 'Select an option'}
              </SelectItem>
            </SelectContent>
          </Select>
        );
      case 'Label':
        return (
          <label
            style={innerStyle}
            className={cn(component.className)}
            onClick={handleClick}
          >
            {component.props.text || 'Label'}
          </label>
        );
      case 'Badge':
        return (
          <span
            style={innerStyle}
            className={cn(component.className)}
            onClick={handleClick}
          >
            {component.props.text || 'Badge'}
          </span>
        );
      case 'Checkbox':
        return (
          <div
            style={innerStyle}
            onClick={handleClick}
            className={cn('flex items-center gap-2', component.className)}
          >
            <input
              type="checkbox"
              checked={component.props.checked || false}
              readOnly
            />
            {component.props.text && <span>{component.props.text}</span>}
          </div>
        );
      case 'Radio':
        return (
          <div
            style={innerStyle}
            onClick={handleClick}
            className={cn('flex items-center gap-2', component.className)}
          >
            <input
              type="radio"
              checked={component.props.checked || false}
              readOnly
            />
            {component.props.text && <span>{component.props.text}</span>}
          </div>
        );
      case 'Switch':
        return (
          <div
            style={innerStyle}
            onClick={handleClick}
            className={cn('flex items-center gap-2', component.className)}
          >
            <input
              type="checkbox"
              checked={component.props.checked || false}
              readOnly
              className="switch"
            />
          </div>
        );
      case 'Avatar':
        return (
          <div
            style={{
              ...innerStyle,
              borderRadius: '50%',
              overflow: 'hidden',
              width: width || '40px', // Keep fixed width for avatar if set
              height: height || '40px',
            }}
            className={cn(component.className)}
            onClick={handleClick}
          >
            {component.props.src ? (
              <img
                src={component.props.src}
                alt={component.props.alt || 'Avatar'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ?
              </div>
            )}
          </div>
        );
      case 'Image':
        if (!component.props.src) {
          return (
            <div
              style={{
                ...innerStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed hsl(var(--border))',
                borderRadius: '0.5rem',
                backgroundColor: 'hsl(var(--muted))',
              }}
              className={cn(component.className)}
              onClick={handleClick}
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon size={48} strokeWidth={1.5} />
                <div className="text-sm font-medium">No image selected</div>
                <div className="text-xs">Add URL in properties</div>
              </div>
            </div>
          );
        }
        return (
          <img
            src={component.props.src}
            alt={component.props.alt || 'Image'}
            style={{
              ...innerStyle,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            className={cn(component.className)}
            onClick={handleClick}
          />
        );
      case 'Page':
      case 'Container':
      case 'Flex':
      case 'Grid':
      case 'Card':
      case 'Stack':
      case 'Form':
      case 'List':
        // TODO: Show a clear "{children}" slot overlay for layout-like components so nested content placement is explicit.
        return (
          <div
            style={{
              ...innerStyle,
              minHeight:
                component.children.length === 0
                  ? '100px'
                  : innerStyle.minHeight,
            }}
            onClick={handleClick}
            onDragOver={handleContainerDragOver}
            onDrop={handleContainerDrop}
            className={cn('transition-all duration-150', component.className)}
          >
            {children}
          </div>
        );
    }
  })();

  return (
    <motion.div
      ref={resizeRef}
      layout={isDraggingLocal || isResizing ? false : 'position'}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        width: animatedWidth,
        ...(animatedHeight ? { height: animatedHeight } : {}),
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: isDraggingLocal || isResizing ? 0 : 0.15,
        layout:
          isDraggingLocal || isResizing
            ? { duration: 0 }
            : { type: 'spring', stiffness: 300, damping: 35 },
        width:
          isDraggingLocal || isResizing
            ? { duration: 0 }
            : { type: 'spring', stiffness: 300, damping: 30 },
        height:
          isDraggingLocal || isResizing
            ? { duration: 0 }
            : { type: 'spring', stiffness: 300, damping: 30 },
      }}
      className={isRoot ? 'relative w-full' : 'relative'}
      data-component="true"
      data-component-id={component.id}
      data-canvas-content={!component.parentId ? 'true' : undefined}
      draggable={false}
      onMouseDown={handleMoveMouseDown}
      onDragOver={isContainer ? handleContainerDragOver : undefined}
      onDrop={isContainer ? handleContainerDrop : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...wrapperStyle,
        outline:
          effectiveOutlineMode && outlineColor
            ? `2px solid ${outlineColor}`
            : undefined,
        outlineOffset: effectiveOutlineMode ? '-2px' : undefined,
      }}
    >
      {/* Selection/Hover Outline */}
      {interactive && (isSelected || isHovered) && (
        <div
          className={`absolute pointer-events-none border-2 ${
            isSelected ? 'border-lime-500/85' : 'border-lime-500/10'
          }`}
          style={{
            zIndex: 10,
            inset: '-8px',
            borderRadius: component.styles.borderRadius || '0.125rem',
            boxShadow: isSelected
              ? 'inset 0 0 0 8px rgba(132, 204, 22, 0.5)'
              : 'inset 0 0 0 8px rgba(132, 204, 22, 0.1)',
          }}
        />
      )}

      {/* Component Label & Delete Button */}
      {interactive && (isSelected || isHovered) && (
        <div
          className={`absolute -top-7 left-0 flex items-center gap-1 px-2 py-0.5 text-xs rounded-t font-medium pointer-events-auto ${
            isSelected
              ? 'bg-lime-500/85 text-black'
              : 'bg-lime-500/10 text-black'
          }`}
          style={{ zIndex: 11 }}
          draggable={false}
          onDragStart={e => e.preventDefault()}
        >
          <span>{component.name}</span>
          {isSelected && (
            <button
              onClick={handleDelete}
              onMouseDown={e => e.stopPropagation()}
              className="ml-1 hover:bg-primary-foreground/20 rounded p-0.5"
              title="Delete component"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}

      {/* Resize Handles */}
      {interactive && isSelected && (
        <>
          {/* Corner handles */}
          <div
            onMouseDown={e => handleResizeStart(e, 'se')}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-lime-500 border-2 border-background rounded-sm cursor-se-resize z-20"
            title="Resize"
          />
          <div
            onMouseDown={e => handleResizeStart(e, 'sw')}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-lime-500 border-2 border-background rounded-sm cursor-sw-resize z-20"
            title="Resize"
          />
          <div
            onMouseDown={e => handleResizeStart(e, 'ne')}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            className="absolute -top-1 -right-1 w-3 h-3 bg-lime-500 border-2 border-background rounded-sm cursor-ne-resize z-20"
            title="Resize"
          />
          <div
            onMouseDown={e => handleResizeStart(e, 'nw')}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            className="absolute -top-1 -left-1 w-3 h-3 bg-lime-500 border-2 border-background rounded-sm cursor-nw-resize z-20"
            title="Resize"
          />

          {/* Edge handles */}
          <div
            onMouseDown={e => handleResizeStart(e, 'e')}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-6 bg-lime-500 border-2 border-background rounded-sm cursor-e-resize z-20"
            title="Resize"
          />
          <div
            onMouseDown={e => handleResizeStart(e, 'w')}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-6 bg-lime-500 border-2 border-background rounded-sm cursor-w-resize z-20"
            title="Resize"
          />
          <div
            onMouseDown={e => handleResizeStart(e, 's')}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-lime-500 border-2 border-background rounded-sm cursor-s-resize z-20"
            title="Resize"
          />
          <div
            onMouseDown={e => handleResizeStart(e, 'n')}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-lime-500 border-2 border-background rounded-sm cursor-n-resize z-20"
            title="Resize"
          />
        </>
      )}

      {/* Ripple animation for newly dropped components */}
      {showRipple && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden z-30"
          style={{ borderRadius: component.styles.borderRadius || '0.125rem' }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bg-lime-400"
            style={{
              width: '100%',
              height: '100%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
            }}
          />
        </motion.div>
      )}

      {/* Content with fade transition */}
      <motion.div
        initial={false}
        animate={{ opacity: contentVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="w-full h-full"
      >
        {content}
      </motion.div>
    </motion.div>
  );
}
