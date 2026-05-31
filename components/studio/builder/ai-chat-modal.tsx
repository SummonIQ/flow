"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useBuilderStore } from "@/lib/studio/store";
import { BuilderComponent } from "@/types/studio/builder";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replaceMode, setReplaceMode] = useState(false);
  const {
    getRootId,
    getComponents,
    updateComponent,
    addAiComponent,
    insertComponentWithData,
  } = useBuilderStore();

  // Simulate progress while generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          // Fast at first, then slow down as it approaches 90%
          if (prev < 30) return prev + 10;
          if (prev < 60) return prev + 5;
          if (prev < 80) return prev + 2;
          if (prev < 95) return prev + 0.5;
          return prev;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate");
      }

      const { component } = await response.json();

      console.log("Received component from API:", component);

      // Helper to derive a better root name from the prompt
      const makeRootNameFromPrompt = (description: string): string => {
        const cleaned = description
          .replace(/[^a-zA-Z0-9\s]/g, " ")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 4);

        if (cleaned.length === 0) return "GeneratedLayout";

        return cleaned
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("");
      };

      const genericRootNames = new Set([
        "MainContainer",
        "Root",
        "Wrapper",
        "Container",
        "Layout",
      ]);

      // Convert the generated component to our builder format recursively
      const convertComponent = (
        originalComp: any,
        parentId: string | null
      ): BuilderComponent => {
        const id = generateId();

        // Work with a mutable copy so we can coerce certain shapes
        let comp = { ...originalComp };

        // Recursively convert children
        const childComponents: BuilderComponent[] = [];
        if (comp.children && Array.isArray(comp.children)) {
          comp.children.forEach((child: any) => {
            const converted = convertComponent(child, id);
            childComponents.push(converted);
          });
        }

        const isFirstLevelUnderPageRoot = parentId === rootId;

        // Heuristic: convert certain Text nodes that look like input
        // placeholders (e.g. "Enter your email") into actual Input
        // components so login forms have real fields.
        if (
          comp.type === "Text" &&
          comp.props &&
          typeof comp.props.text === "string"
        ) {
          const rawText = comp.props.text as string;
          const text = rawText.toLowerCase().trim();
          const looksLikePlaceholder =
            text.startsWith("enter ") ||
            text.startsWith("type ") ||
            text.startsWith("your ");
          const mentionsField =
            text.includes("email") ||
            text.includes("password") ||
            text.includes("username") ||
            text.includes("name");

          if (looksLikePlaceholder && mentionsField) {
            const isPassword = text.includes("password");
            comp = {
              ...comp,
              type: "Input",
              props: {
                placeholder: rawText,
                type: isPassword ? "password" : "text",
              },
            };
          }
        }

        let name: string = comp.name || comp.type;

        // If the model used a generic name for the main layout,
        // replace it with something derived from the user's prompt.
        if (isFirstLevelUnderPageRoot) {
          const normalized = name.replace(/\d+$/g, "");
          if (genericRootNames.has(normalized)) {
            name = makeRootNameFromPrompt(prompt);
          }
        }

        const props = comp.props || {};
        const styles = comp.styles || {};
        let className = comp.className || "";

        // Apply TailwindCSS v4 class defaults for common components
        if (comp.type === "Input" && !className) {
          className =
            "w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground";
        } else if (comp.type === "Button" && !className) {
          const text = (props.text || "").toString().toLowerCase();
          if (text.includes("google")) {
            className =
              "px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-600 border border-border";
          } else if (text.includes("facebook")) {
            className =
              "px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white";
          } else {
            className =
              "px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground";
          }
        }

        return {
          id,
          type: comp.type,
          name,
          parentId,
          props,
          styles,
          className,
          children: childComponents,
          events: comp.events || {},
        };
      };

      const rootId = getRootId();
      if (!rootId) {
        toast.error("No page found. Please create a page first.");
        return;
      }

      console.log("Root ID:", rootId);
      const components = getComponents();
      const pageComponent = components[rootId];
      console.log("Page component:", pageComponent);

      // Backup and clear existing children if in replace mode
      if (replaceMode && pageComponent) {
        // Save backup to localStorage
        const backup = {
          timestamp: Date.now(),
          components: pageComponent.children,
        };
        localStorage.setItem("ai-generator-backup", JSON.stringify(backup));

        // Clear all children from the Page component
        updateComponent(rootId, {
          children: [],
        });

        toast.info("Previous components backed up");
      }

      const newComponent = convertComponent(component, rootId);

      function countComponents(comp: BuilderComponent): number {
        return (
          1 +
          comp.children.reduce((sum, child) => sum + countComponents(child), 0)
        );
      }

      const componentCount = countComponents(newComponent);

      console.log("Converted component tree:", newComponent);
      console.log("Total components to add:", componentCount);

      // Auto-add the generated component tree to the current page
      insertComponentWithData(newComponent, rootId, "inside");

      // Save to AI components library for reuse
      addAiComponent(newComponent);

      console.log("Successfully added", componentCount, "components");

      toast.success(`Generated ${componentCount} components successfully!`);
      setPrompt("");
      onClose();
    } catch (error: any) {
      console.error("Generate error:", error);
      toast.error(error.message || "Failed to generate component");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-2xl"
          >
            <div className="bg-background border border-border rounded-lg shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    AI Component Generator
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Describe what you want to build
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="E.g., 'Create a modern login form with email and password fields' or 'Build a pricing card with three tiers'"
                  className="w-full h-32 px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  disabled={isGenerating}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceMode}
                      onChange={(e) => setReplaceMode(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-muted-foreground">
                      Replace existing components{" "}
                      <span className="text-xs">(backed up)</span>
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">
                      ⌘
                    </kbd>{" "}
                    +{" "}
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">
                      Enter
                    </kbd>
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="px-6 pb-4">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2 animate-pulse">
                    Generating component structure...
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const backup = localStorage.getItem(
                        "ai-generator-backup"
                      );
                      if (backup) {
                        // Show info about backup
                        const data = JSON.parse(backup);
                        const date = new Date(data.timestamp);
                        toast.success(
                          `Backup from ${date.toLocaleString()} is available`
                        );
                      } else {
                        toast.info("No backup available");
                      }
                    }}
                    className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    disabled={isGenerating}
                  >
                    View Backup
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm hover:bg-muted rounded transition-colors"
                    disabled={isGenerating}
                  >
                    Cancel
                  </button>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
