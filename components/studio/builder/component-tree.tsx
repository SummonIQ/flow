"use client";

import { BuilderComponent } from "@/types/studio/builder";
import { useBuilderStore } from "@/lib/studio/store";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ComponentTreeItemProps {
  component: BuilderComponent;
  level: number;
}

function ComponentTreeItem({ component, level }: ComponentTreeItemProps) {
  const {
    selectComponent,
    selectedId,
    getComponents,
    moveComponent,
    setIsDragging,
    setDraggedComponentId,
    draggedComponentId,
  } = useBuilderStore();
  const components = getComponents();
  const [isExpanded, setIsExpanded] = useState(true);

  const isSelected = selectedId === component.id;
  const hasChildren = component.children.length > 0;
  const isDragged = draggedComponentId === component.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(component.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const isDescendant = (parentId: string, childId: string): boolean => {
    const parent = components[parentId];
    if (!parent) return false;
    const stack = [...parent.children];
    while (stack.length) {
      const current = stack.pop()!;
      if (current.id === childId) return true;
      stack.push(...current.children);
    }
    return false;
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData("existingComponentId", component.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    setDraggedComponentId(component.id);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
    setDraggedComponentId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const draggedId = e.dataTransfer.getData("existingComponentId");
    if (!draggedId || draggedId === component.id) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const draggedId = e.dataTransfer.getData("existingComponentId");
    if (!draggedId || draggedId === component.id) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const third = rect.height / 3;

    let position: "before" | "after" | "inside";
    if (offsetY < third) {
      position = "before";
    } else if (offsetY > rect.height - third) {
      position = "after";
    } else {
      position = "inside";
    }

    // Prevent creating cycles when dropping inside one of its own descendants
    if (position === "inside" && isDescendant(draggedId, component.id)) {
      return;
    }

    moveComponent(draggedId, component.id, position);
    setIsDragging(false);
    setDraggedComponentId(null);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/50 rounded transition-colors ${
          isSelected
            ? "ring-2 ring-lime-500/85 bg-lime-500/20 text-foreground font-medium"
            : "text-foreground"
        } ${isDragged ? "ring-1 ring-blue-500/70 bg-blue-500/10" : ""}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-accent rounded"
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="truncate">{component.name}</span>
          {component.type !== "Page" && (
            <span className="text-xs text-muted-foreground opacity-60">
              {component.type}
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {component.children.map((child) => (
            <ComponentTreeItem
              key={child.id}
              component={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ComponentTree() {
  const { getComponents, getRootId } = useBuilderStore();
  const components = getComponents();
  const rootId = getRootId();
  const rootComponent = rootId ? components[rootId] : null;

  if (!rootComponent) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        <p>No components yet</p>
        <p className="text-xs mt-1">
          Drag components from the toolbox to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
          Component Tree
        </div>
        <ComponentTreeItem component={rootComponent} level={0} />
      </div>
    </div>
  );
}
