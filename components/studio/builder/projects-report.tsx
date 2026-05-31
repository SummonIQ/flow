"use client";

import { Report, type ReportColumnDefinition } from "@summoniq/applab-ui";
import { motion } from "framer-motion";
import * as React from "react";

interface RecentProject {
  id: string;
  name: string;
  type: string;
  description?: string;
  lastOpened: number;
  openCount: number;
  starred: boolean;
}

interface ProjectsReportProps {
  projects: RecentProject[];
  onProjectClick?: (projectId: string) => void;
  onToggleStar?: (projectId: string) => void;
}

export function ProjectsReport({
  projects,
  onProjectClick,
  onToggleStar,
}: ProjectsReportProps) {
  const columns = React.useMemo<ReportColumnDefinition<RecentProject>[]>(
    () => [
      {
        key: "starred",
        header: "",
        width: "56px",
        cellFn: project => (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onToggleStar?.(project.id);
            }}
            className={`transition-colors ${
              project.starred
                ? "text-yellow-500 hover:text-yellow-400"
                : "text-gray-400 hover:text-yellow-500"
            }`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill={project.starred ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </button>
        ),
      },
      {
        key: "name",
        header: "Project Name",
        cellFn: project => (
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">
              {project.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {project.description || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        width: "140px",
        cellFn: project => (
          <span className="uppercase text-xs font-medium text-muted-foreground">
            {project.type}
          </span>
        ),
      },
      {
        key: "openCount",
        header: "Opens",
        width: "100px",
        cellFn: project => (
          <span className="text-sm font-medium">{project.openCount}</span>
        ),
      },
      {
        key: "lastOpened",
        header: "Last Opened",
        width: "180px",
        cellFn: project => (
          <span className="text-sm text-muted-foreground">
            {new Date(project.lastOpened).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [onToggleStar],
  );

  if (projects.length === 0) {
    return (
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-8 text-center">
        <p className="text-muted-foreground">
          No projects yet. Create your first project above!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="border-b border-border/50 px-6 py-4">
        <h2 className="text-lg font-semibold">All Projects</h2>
        <p className="text-sm text-muted-foreground">
          Total: {projects.length}
        </p>
      </div>
      <div className="overflow-x-auto">
        <Report<RecentProject>
          className="h-auto border-0 bg-transparent shadow-none"
          data={projects}
          definition={{
            columns,
            data: projects,
            view: "table" as any,
            sortBy: "lastOpened",
            activeFilters: [],
            filters: [],
          }}
          onRowClick={project => onProjectClick?.(project.id)}
          search={false}
        />
      </div>
    </motion.div>
  );
}
