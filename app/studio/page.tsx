'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Builder } from '@/components/studio/builder';
import {
  getPageRoute,
  normalizeRoutePath,
  toRoutePath,
} from '@/lib/studio/codegen';
import { useBuilderStore } from '@/lib/studio/store';
import type { Project } from '@/types/studio/builder';

export default function StudioPage() {
  const searchParams = useSearchParams();
  const decodeParam = (value: string | null) => {
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const projectParam = decodeParam(searchParams.get('project'));
  const appParam = decodeParam(searchParams.get('app'));
  const pageParam = decodeParam(searchParams.get('page'));
  const newPageParam = decodeParam(searchParams.get('newPage'));
  const routeParam = decodeParam(searchParams.get('route'));
  const modeParam = decodeParam(searchParams.get('mode'));

  // TODO: If a page is requested but not found, surface a chooser to pick a page or create one (instead of silently falling back).

  const project = useBuilderStore(state => state.project);
  const createProject = useBuilderStore(state => state.createProject);
  const loadProject = useBuilderStore(state => state.loadProject);
  const setCurrentPage = useBuilderStore(state => state.setCurrentPage);
  const setStudioContext = useBuilderStore(state => state.setStudioContext);
  const studioContext = useBuilderStore(state => state.studioContext);
  const createPage = useBuilderStore(state => state.createPage);
  const setCanvasViewMode = useBuilderStore(state => state.setCanvasViewMode);
  const setCodeRoute = useBuilderStore(state => state.setCodeRoute);
  const loadCodeForRoute = useBuilderStore(state => state.loadCodeForRoute);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [pendingNewPage, setPendingNewPage] = useState<{
    name: string;
    route?: string;
  } | null>(null);

  // Store newPage param for creation after project loads
  useEffect(() => {
    if (newPageParam) {
      setPendingNewPage({ name: newPageParam, route: routeParam ?? undefined });
    }
  }, [newPageParam, routeParam]);

  // Create pending page once project is ready
  useEffect(() => {
    if (pendingNewPage && project && !isBootstrapping) {
      createPage(pendingNewPage.name, 'page', pendingNewPage.route);
      setPendingNewPage(null);
    }
  }, [pendingNewPage, project, isBootstrapping, createPage]);

  useEffect(() => {
    if (modeParam === 'design' || modeParam === 'code' || modeParam === 'run') {
      setCanvasViewMode(modeParam);
    }
  }, [modeParam, setCanvasViewMode]);

  useEffect(() => {
    if (modeParam !== 'code') return;
    if (!routeParam) return;

    const normalized = normalizeRoutePath(routeParam);
    setCodeRoute(normalized);

    // Load the file once studio context is available.
    if (studioContext?.projectPath) {
      loadCodeForRoute(normalized).catch(err => {
        console.error('Failed to load code for route:', err);
      });
    }
  }, [
    loadCodeForRoute,
    modeParam,
    routeParam,
    setCodeRoute,
    studioContext?.projectPath,
  ]);

  useEffect(() => {
    const targetName = appParam || projectParam;
    const resolvePageId = (projectData: Project, pageValue: string | null) => {
      if (!pageValue) return null;
      const trimmed = pageValue.trim();
      if (!trimmed) return null;
      const lower = trimmed.toLowerCase();
      const normalizedRoute = normalizeRoutePath(trimmed);
      const fallbackRoute = toRoutePath(trimmed);

      const pages = Object.values(projectData.pages);

      return (
        (
          pages.find(page => page.id === trimmed) ??
          pages.find(page => page.name.toLowerCase() === lower) ??
          pages.find(page => {
            const route = getPageRoute(page).toLowerCase();
            return (
              route === normalizedRoute.toLowerCase() ||
              route === fallbackRoute.toLowerCase() ||
              route.replace(/^\//, '') === lower
            );
          })
        )?.id ?? null
      );
    };

    if (!targetName) return;

    const contextMatches =
      studioContext?.projectName === (projectParam ?? undefined) &&
      studioContext?.appName === (appParam ?? undefined);
    if (project && contextMatches) {
      const pageId = resolvePageId(project, pageParam);
      if (pageId && pageId !== project.currentPageId) {
        setCurrentPage(pageId);
      }
      return;
    }

    const description =
      projectParam && appParam ? `Project: ${projectParam}` : undefined;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      if (typeof window === 'undefined' || !window.electron?.projects?.getAll) {
        createProject(targetName, 'react', description, { persist: false });
        setIsBootstrapping(false);
        return;
      }

      try {
        let resolvedProjectPath: string | undefined;
        if (projectParam) {
          try {
            const response = await fetch(
              `/api/projects/${encodeURIComponent(projectParam)}/manage`,
            );
            if (response.ok) {
              const data = (await response.json()) as { path?: unknown };
              if (typeof data.path === 'string' && data.path.length > 0) {
                resolvedProjectPath = data.path;
              }
            }
          } catch (err) {
            console.error('Failed to resolve project path:', err);
          }
        }

        const projects = await window.electron.projects.getAll();

        const foundProject =
          (resolvedProjectPath
            ? projects.find(
                (candidate: { path?: string }) =>
                  candidate.path === resolvedProjectPath,
              )
            : undefined) ??
          projects.find(
            (candidate: { name?: string }) => candidate.name === projectParam,
          ) ??
          projects.find((candidate: { apps?: { name?: string }[] }) =>
            candidate.apps?.some(app => app.name === appParam),
          );

        const foundApp = foundProject?.apps?.find(
          (candidate: { name?: string }) => candidate.name === appParam,
        );

        const projectPath = resolvedProjectPath ?? foundProject?.path;
        const appPath = foundApp?.path ?? null;

        setStudioContext({
          projectName: foundProject?.name ?? projectParam ?? undefined,
          appName: foundApp?.name ?? appParam ?? undefined,
          projectPath,
          appPath,
        });

        if (projectPath && window.electron?.studio?.readDesign) {
          const result = await window.electron.studio.readDesign({
            projectPath,
            appPath,
          });
          if (result?.success && result.data) {
            try {
              const parsed = JSON.parse(result.data);
              if (parsed?.id && parsed?.name && parsed?.pages) {
                loadProject(parsed);
                const pageId = resolvePageId(parsed, pageParam);
                if (pageId) {
                  setCurrentPage(pageId);
                }
                setIsBootstrapping(false);
                return;
              }
            } catch (err) {
              console.error('Failed to parse studio design:', err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to bootstrap studio context:', err);
      }

      createProject(targetName, 'react', description, { persist: false });
      setIsBootstrapping(false);
    };

    bootstrap();
  }, [
    appParam,
    projectParam,
    pageParam,
    project?.name,
    createProject,
    loadProject,
    setCurrentPage,
    setStudioContext,
    studioContext,
  ]);

  if (isBootstrapping && !project) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading designer...
      </div>
    );
  }

  return <Builder />;
}
