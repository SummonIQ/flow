'use client';

import { useEffect, useState } from 'react';
import { AppsTab } from '../tabs/apps-tab';

type RuntimeProject = {
  name: string;
  description: string;
  path?: string;
  hasConfig?: boolean;
  apps?: any[];
};

export default function AppsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const [project, setProject] = useState<RuntimeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');

  // Get project name from params
  useEffect(() => {
    params.then(({ name }) => setProjectName(name));
  }, [params]);

  useEffect(() => {
    if (!projectName) return;

    async function loadProject() {
      try {
        if (typeof window !== 'undefined' && window.electron) {
          const projects = await window.electron.projects.getAll();
          const foundProject = projects.find((p) => p.name === projectName);

          if (!foundProject) {
            setError('Project not found');
          } else if (!foundProject.hasConfig) {
            setError('Project does not have SummonIQ configuration');
          } else {
            setProject(foundProject);
          }
        } else {
          setError('Not running in Electron environment');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectName]);

  if (loading) {
    return <div className="p-6">Loading apps...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  return <AppsTab project={project} />;
}
