"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/studio/ui/modal";
import { normalizeRoutePath, toRoutePath } from "@/lib/studio/codegen";

interface RenamePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageName: string;
  pageRoute?: string;
  existingRoutes?: string[];
  onRename: (name: string, route?: string) => void;
}

export function RenamePageModal({
  open,
  onOpenChange,
  pageName,
  pageRoute,
  existingRoutes = [],
  onRename,
}: RenamePageModalProps) {
  const [name, setName] = useState(pageName);
  const [route, setRoute] = useState(pageRoute ?? "");

  useEffect(() => {
    if (open) {
      setName(pageName);
      const nextRoute = pageRoute?.trim() ? pageRoute : toRoutePath(pageName);
      setRoute(nextRoute);
    }
  }, [open, pageName, pageRoute]);

  const routePreview = useMemo(() => {
    if (route.trim()) {
      return normalizeRoutePath(route);
    }
    if (!name.trim()) return "/";
    return toRoutePath(name);
  }, [name, route]);

  const currentRoute = pageRoute?.trim()
    ? normalizeRoutePath(pageRoute)
    : toRoutePath(pageName);
  const normalizedRoutes = existingRoutes.map((value) =>
    normalizeRoutePath(value).toLowerCase()
  );
  const routeConflict =
    normalizedRoutes.includes(routePreview.toLowerCase()) &&
    routePreview.toLowerCase() !== currentRoute.toLowerCase();

  const canSubmit = !!name.trim() && !routeConflict;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedRoute = route.trim();
    if (!trimmedName) return;
    onRename(trimmedName, trimmedRoute || undefined);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Rename Page</ModalTitle>
            <ModalDescription>
              Update the page name. This affects the generated route.
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pageRename" className="text-sm font-medium">
                Page Name
              </label>
              <input
                id="pageRename"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Dashboard"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="pageRoute" className="text-sm font-medium">
                Route
              </label>
              <input
                id="pageRoute"
                type="text"
                value={route}
                onChange={(event) => setRoute(event.target.value)}
                placeholder="/dashboard"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to auto-generate from the page name.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Route preview: <span className="font-medium">{routePreview}</span>
            </div>
            {routeConflict && (
              <p className="text-xs text-destructive">
                Another page already uses this route.
              </p>
            )}
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
