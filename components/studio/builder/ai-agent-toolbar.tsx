"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Plus, Ban, GripVertical, X } from "lucide-react";
import { AIChatModal } from "./ai-chat-modal";
import { useBuilderStore } from "@/lib/studio/store";
import { motion, AnimatePresence } from "framer-motion";

interface AiAgentToolbarProps {
  /** Places the trigger inside the header and uses an icon-only button */
  mode?: "floating" | "header";
}

export function AiAgentToolbar({ mode = "floating" }: AiAgentToolbarProps) {
  const [listOpen, setListOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { aiComponents, removeAiComponent, loadAiComponents } =
    useBuilderStore();
  const isHeaderMode = mode === "header";
  const containerRef = useRef<HTMLDivElement>(null);

  // Load AI components on mount
  useEffect(() => {
    loadAiComponents();
  }, [loadAiComponents]);

  // Close list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setListOpen(false);
      }
    };

    if (listOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [listOpen]);

  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.stopPropagation();
    // Use "copy" to indicate we're copying from the template
    e.dataTransfer.effectAllowed = "copy";

    // We can pass the type or the full component data
    // Passing just type might be handled by canvas as "create new"
    // But we want to paste THIS specific component structure.
    // The canvas handleDrop needs to handle "aiComponentData".
    e.dataTransfer.setData("componentType", component.type);
    e.dataTransfer.setData("aiComponentData", JSON.stringify(component));
  };

  const triggerButton = (
    <button
      onClick={() => setListOpen(!listOpen)}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium transition-all",
        isHeaderMode
          ? "h-9 w-9 justify-center px-0 py-0 rounded-md hover:bg-accent"
          : "rounded-full border border-border bg-background/95 shadow-lg shadow-black/10 hover:shadow-xl px-3 py-2",
        listOpen && !isHeaderMode && "ring-2 ring-primary/20 border-primary"
      )}
      aria-label="Open AI Builder"
    >
      <Sparkles size={16} className="text-primary" />
      {!isHeaderMode && (
        <>
          <span>AI Builder</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            beta
          </span>
        </>
      )}
    </button>
  );

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          isHeaderMode
            ? "relative z-[100]"
            : "fixed top-3 right-3 z-[100] pointer-events-auto"
        )}
        style={
          isHeaderMode ? ({ WebkitAppRegion: "no-drag" } as any) : undefined
        }
      >
        {triggerButton}

        <AnimatePresence>
          {listOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden origin-top-right",
                isHeaderMode ? "top-full" : "top-full"
              )}
            >
              <div className="flex flex-col max-h-[500px]">
                <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    AI Components
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full border border-border">
                      {aiComponents.length}
                    </span>
                    <button
                      onClick={() => setListOpen(false)}
                      className="p-1 hover:bg-muted rounded-md text-muted-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-2 overflow-y-auto flex-1 min-h-[100px] max-h-[300px] space-y-2 bg-background/50">
                  {aiComponents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No components yet
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Generate your first component to get started
                      </p>
                    </div>
                  ) : (
                    aiComponents.map((comp) => (
                      <div
                        key={comp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp)}
                        className="group relative flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing select-none"
                      >
                        <div className="text-muted-foreground cursor-grab">
                          <GripVertical size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {comp.name || comp.type}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {comp.type} • {comp.children.length} children
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAiComponent(comp.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                          title="Remove"
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-border bg-muted/30">
                  <button
                    onClick={() => {
                      setListOpen(false);
                      setModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md text-sm font-medium transition-colors shadow-sm"
                  >
                    <Plus size={16} />
                    Generate New
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AIChatModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
