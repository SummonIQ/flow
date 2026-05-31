"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/studio/ui/menubar";
import { FileIcon, Edit, Eye, Settings, HelpCircle } from "lucide-react";
import { useBuilderStore } from "@/lib/studio/store";
import { toast } from "sonner";

interface AppMenubarProps {
  onToggleCode?: () => void;
  showCode?: boolean;
  onNewProject?: () => void;
  onOpenProject?: () => void;
}

export function AppMenubar({
  onToggleCode,
  showCode,
  onNewProject,
  onOpenProject,
}: AppMenubarProps) {
  const {
    project,
    saveProject,
    publishCurrentPage,
    publishAllPages,
    exportProject,
    selectedId,
    clipboard,
    copyComponent,
    cutComponent,
    pasteComponent,
    canUndo,
    canRedo,
    undo,
    redo,
    studioContext,
  } = useBuilderStore();
  const canPublish = Boolean(project?.type === "react" && studioContext?.projectPath);

  const handleSave = () => {
    if (!project) {
      toast.error("No project to save");
      return;
    }
    saveProject();
    toast.success("Project saved!");
  };

  const handleExport = () => {
    if (!project) {
      toast.error("No project to export");
      return;
    }
    const code = exportProject();
    const blob = new Blob([code], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name
      .replace(/\s+/g, "-")
      .toLowerCase()}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Project exported!");
  };

  const handlePublish = async () => {
    if (!project) {
      toast.error("No project to publish");
      return;
    }

    const result = await publishCurrentPage();
    if (result.success) {
      toast.success("Page published to app");
      return;
    }

    toast.error(result.error || "Failed to publish page");
  };

  const handlePublishAll = async () => {
    if (!project) {
      toast.error("No project to publish");
      return;
    }

    const result = await publishAllPages();
    if (result.success) {
      toast.success(`Published ${result.published} page(s)`);
      return;
    }

    toast.error(
      `Published ${result.published} page(s), ${result.failed} failed`
    );
  };

  const handleCopy = () => {
    if (!selectedId) {
      toast.error("No component selected");
      return;
    }
    copyComponent();
    toast.success("Component copied!");
  };

  const handleCut = () => {
    if (!selectedId) {
      toast.error("No component selected");
      return;
    }
    cutComponent();
    toast.success("Component cut!");
  };

  const handlePaste = () => {
    if (!clipboard) {
      toast.error("Nothing to paste");
      return;
    }
    pasteComponent();
    toast.success("Component pasted!");
  };

  const handleUndo = () => {
    if (!canUndo()) {
      toast.error("Nothing to undo");
      return;
    }
    undo();
    toast.success("Undone!");
  };

  const handleRedo = () => {
    if (!canRedo()) {
      toast.error("Nothing to redo");
      return;
    }
    redo();
    toast.success("Redone!");
  };

  return (
    <Menubar className="border-0 bg-card shadow-sm rounded-none px-2 py-2.5">
      <MenubarMenu>
        <MenubarTrigger className="flex items-center gap-2 py-1.5">
          <FileIcon size={14} />
          File
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNewProject}>
            New Project <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={onOpenProject}>
            Open... <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={handleSave} disabled={!project}>
            Save <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={handleSave} disabled={!project}>
            Save As... <MenubarShortcut>⇧⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={handleExport} disabled={!project}>
            Export <MenubarShortcut>⌘E</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            onClick={handlePublish}
            disabled={!canPublish}
          >
            Publish to App <MenubarShortcut>⇧⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            onClick={handlePublishAll}
            disabled={!canPublish}
          >
            Publish All Pages <MenubarShortcut>⇧⌘A</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="flex items-center gap-2">
          <Edit size={14} />
          Edit
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled={!canUndo()} onClick={handleUndo}>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!canRedo()} onClick={handleRedo}>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled={!selectedId} onClick={handleCut}>
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!selectedId} onClick={handleCopy}>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!clipboard} onClick={handlePaste}>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="flex items-center gap-2">
          <Eye size={14} />
          View
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled={!project} onClick={onToggleCode}>
            {showCode ? "Hide" : "Show"} Code{" "}
            <MenubarShortcut>⌘K</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Toggle Fullscreen <MenubarShortcut>F11</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled={!project}>
            Zoom In <MenubarShortcut>⌘+</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!project}>
            Zoom Out <MenubarShortcut>⌘-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!project}>
            Reset Zoom <MenubarShortcut>⌘0</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="flex items-center gap-2">
          <Settings size={14} />
          Settings
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Preferences</MenubarItem>
          <MenubarItem>Keyboard Shortcuts</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Theme</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="flex items-center gap-2">
          <HelpCircle size={14} />
          Help
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem>Keyboard Shortcuts</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>About</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
