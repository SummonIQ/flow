'use client';

import { useBuilderStore } from '@/lib/studio/store';
import { Button } from '@summoniq/applab-ui';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ThemeToggle } from '../theme-toggle';
import { WindowControls } from '../window-controls';

export function AppHeader() {
  const router = useRouter();
  const project = useBuilderStore(state => state.project);
  const saveProject = useBuilderStore(state => state.saveProject);
  const canvasViewMode = useBuilderStore(state => state.canvasViewMode);
  const codeFile = useBuilderStore(state => state.codeFile);
  const saveCodeForRoute = useBuilderStore(state => state.saveCodeForRoute);
  const publishCurrentPage = useBuilderStore(state => state.publishCurrentPage);
  const studioContext = useBuilderStore(state => state.studioContext);
  const [isMacOS, setIsMacOS] = useState(false);

  // TODO: Replace the simple back button with a breadcrumb (Project > App > Page) that links back to the orchestrator app detail view.
  // TODO: Add a searchable page selector here to jump between designer pages and keep selection in sync with orchestrator page browsing.

  useEffect(() => {
    setIsMacOS(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleBack = useCallback(() => {
    if (studioContext?.projectName && studioContext?.appName) {
      router.push(
        `/projects/${studioContext.projectName}/apps/${studioContext.appName}`,
      );
    } else if (studioContext?.projectName) {
      router.push(`/projects/${studioContext.projectName}`);
    } else {
      router.push('/projects');
    }
  }, [router, studioContext]);

  const handleSave = useCallback(() => {
    if (!project) {
      toast.error('No project to save');
      return;
    }

    if (canvasViewMode === 'code' && codeFile.route) {
      (async () => {
        const result = await saveCodeForRoute();
        if (result.success) {
          toast.success('Page saved');
          return;
        }
        toast.error(result.error || 'Failed to save page');
      })();
      return;
    }

    saveProject();
    toast.success('Project saved');
  }, [canvasViewMode, codeFile.route, project, saveCodeForRoute, saveProject]);

  const handlePublish = useCallback(async () => {
    if (!project) {
      toast.error('No project to publish');
      return;
    }

    const result = await publishCurrentPage();
    if (result.success) {
      toast.success('Page published to app');
      return;
    }

    toast.error(result.error || 'Failed to publish page');
  }, [project, publishCurrentPage]);

  const handleDoubleClick = () => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      (window as any).electron.send('window-maximize');
    }
  };

  const canPublish = Boolean(
    project?.type === 'react' && studioContext?.projectPath,
  );

  return (
    <div
      className="h-11 border-b border-border bg-background flex items-center select-none relative pr-4"
      style={{ WebkitAppRegion: 'drag' } as any}
      onDoubleClick={handleDoubleClick}
    >
      {/* Back button - absolute left */}
      <button
        onClick={handleBack}
        className={`absolute ${isMacOS ? 'left-20' : 'left-1'} flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors`}
        style={{ WebkitAppRegion: 'no-drag' } as any}
        title="Back to app"
      >
        <ArrowLeft size={14} />
        <span>Back to app</span>
      </button>

      {/* Window controls */}
      <div
        className={`flex items-center ${isMacOS ? 'pl-20' : ''}`}
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <WindowControls />
      </div>

      {/* Title - centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm font-semibold">
          {project?.name ? `${project.name} - SummonIQ Studio` : 'SummonIQ Studio'}
        </div>
      </div>

      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <Button
          variant="outline"
          size="xs"
          onClick={handleSave}
          disabled={!project}
        >
          <Save size={12} />
          Save
        </Button>
        <Button
          variant="default"
          size="xs"
          onClick={handlePublish}
          disabled={!canPublish}
        >
          <UploadCloud size={12} />
          Publish
        </Button>
        <div className="h-5 w-px bg-border mx-1" />
        <ThemeToggle />
      </div>
    </div>
  );
}
