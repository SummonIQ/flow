"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/studio/ui/modal";
import { PageType, ProjectType } from "@/types/studio/builder";
import { normalizeRoutePath, toRoutePath } from "@/lib/studio/codegen";
import { FileCode, LayoutTemplate } from "lucide-react";

interface CreatePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePage: (name: string, type: PageType, route?: string) => void;
  projectType: ProjectType;
  existingRoutes?: string[];
}

export function CreatePageModal({
  open,
  onOpenChange,
  onCreatePage,
  projectType,
  existingRoutes = [],
}: CreatePageModalProps) {
  const [pageName, setPageName] = useState("");
  const [pageRoute, setPageRoute] = useState("");
  const [pageType, setPageType] = useState<PageType>(
    projectType === "react" ? "page" : "form"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageName.trim()) {
      const trimmedRoute = pageRoute.trim();
      onCreatePage(pageName.trim(), pageType, trimmedRoute || undefined);
      onOpenChange(false);
      // Reset form
      setPageName("");
      setPageRoute("");
      setPageType(projectType === "react" ? "page" : "form");
    }
  };

  const routePreview = pageRoute.trim()
    ? normalizeRoutePath(pageRoute)
    : toRoutePath(pageName || "page");
  const normalizedRoutes = existingRoutes.map((route) =>
    normalizeRoutePath(route).toLowerCase()
  );
  const shouldValidateRoute = !!pageName.trim() || !!pageRoute.trim();
  const isRouteTaken =
    shouldValidateRoute &&
    normalizedRoutes.includes(routePreview.toLowerCase());
  const canSubmit = !!pageName.trim() && !isRouteTaken;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>
              Create New {projectType === "react" ? "Page" : "Form"}
            </ModalTitle>
            <ModalDescription>
              Add a new {projectType === "react" ? "page" : "form"} to your
              project
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {/* Page Name */}
            <div className="space-y-2">
              <label htmlFor="pageName" className="text-sm font-medium">
                {projectType === "react" ? "Page" : "Form"} Name{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                id="pageName"
                type="text"
                required
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder={projectType === "react" ? "About" : "Form1"}
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
                value={pageRoute}
                onChange={(e) => setPageRoute(e.target.value)}
                placeholder="/dashboard"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Route preview: <span className="font-medium">{routePreview}</span>
              </p>
              {isRouteTaken && (
                <p className="text-xs text-destructive">
                  A page already uses this route. Choose a different path.
                </p>
              )}
            </div>

            {/* Type Selection (for React projects) */}
            {projectType === "react" && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPageType("page")}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      pageType === "page"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <LayoutTemplate
                        size={18}
                        className={
                          pageType === "page"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                      <h4 className="font-medium text-sm">Page</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Full page component
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageType("form")}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      pageType === "form"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileCode
                        size={18}
                        className={
                          pageType === "form"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                      <h4 className="font-medium text-sm">Form</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Form with fields
                    </p>
                  </button>
                </div>
              </div>
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
              Create {projectType === "react" ? "Page" : "Form"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
