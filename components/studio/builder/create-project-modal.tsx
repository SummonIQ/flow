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
import { ProjectType } from "@/types/studio/builder";
import { FileCode2 } from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (
    name: string,
    type: ProjectType,
    description?: string
  ) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onCreateProject,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("react");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onCreateProject(
        projectName.trim(),
        projectType,
        description.trim() || undefined
      );
      onOpenChange(false);
      // Reset form
      setProjectName("");
      setProjectType("react");
      setDescription("");
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Create New Project</ModalTitle>
            <ModalDescription>
              Choose your project type and give it a name to get started
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-6">
            {/* Project Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Project Type</label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setProjectType("react")}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    projectType === "react"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileCode2
                      size={24}
                      className={
                        projectType === "react"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    />
                    <h3 className="font-semibold">React / TypeScript</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Modern web application with React components
                  </p>
                </button>
              </div>
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <label htmlFor="projectName" className="text-sm font-medium">
                Project Name <span className="text-destructive">*</span>
              </label>
              <input
                id="projectName"
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome App"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
              />
            </div>
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
              disabled={!projectName.trim()}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Project
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
