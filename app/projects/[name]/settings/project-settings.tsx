'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@summoniq/applab-ui';
import { toast } from 'sonner';
import { ProjectConfigForm } from '../components/project-config-form';

interface ProjectSettingsProps {
  projectName: string;
}

export function ProjectSettings({ projectName }: ProjectSettingsProps) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        if (typeof window !== 'undefined' && window.electron) {
          // Get all projects
          const projects = await window.electron.projects.getAll();
          const foundProject = projects.find((p: any) => p.name === projectName);
          
          if (!foundProject) {
            setError('Project not found');
            return;
          }
          
          setProject(foundProject);
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

  const handleSaveConfiguration = async (configData: any) => {
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save configuration');
      }

      const result = await response.json();
      toast.success('Project configuration saved successfully');
      
      // If name changed, navigate to new URL
      if (configData.name !== projectName) {
        router.push(`/projects/${encodeURIComponent(configData.name)}/settings`);
      } else {
        // Reload to get updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error saving project configuration:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading project settings...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">
            {error || 'Project not found'}
          </p>
          <button
            onClick={() => router.back()}
            className="text-sm text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <h2 className="text-xl font-semibold mb-6">Settings</h2>
        <ProjectConfigForm
          project={project}
          onSave={handleSaveConfiguration}
        />
      </div>
    </div>
  );
}
