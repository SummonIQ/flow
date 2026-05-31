import {
  generateReactPageCode,
  getPageRoute,
  normalizeRoutePath,
  toRoutePath,
} from '@/lib/studio/codegen';
import { generateId } from '@/lib/utils';
import {
  BuilderComponent,
  BuilderState,
  ComponentType,
  Page,
  PageType,
  Project,
  ProjectType,
} from '@/types/studio/builder';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentProject {
  id: string;
  name: string;
  type: ProjectType;
  description?: string;
  lastOpened: number;
  openCount: number;
  starred: boolean;
  filePath?: string;
}

interface StudioContext {
  projectName?: string;
  appName?: string;
  projectPath?: string;
  appPath?: string | null;
  // TODO: Persist lastOpenedPageId per app so the orchestrator can reopen the same page in the studio.
}

interface PublishResult {
  success: boolean;
  path?: string;
  error?: string;
}

interface PublishAllResult {
  success: boolean;
  published: number;
  failed: number;
  errors?: { route: string; error: string }[];
}

interface CodeFileState {
  route: string | null;
  code: string;
  path?: string;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
}

interface StudioWritePageResult {
  success: boolean;
  path?: string;
  error?: string;
}

interface BuilderStore extends BuilderState {
  recentProjects: RecentProject[];
  studioContext: StudioContext | null;
  setStudioContext: (context: StudioContext | null) => void;

  codeRoute: string | null;
  setCodeRoute: (route: string | null) => void;
  codeFile: CodeFileState;
  loadCodeForRoute: (
    route: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updateCodeContent: (code: string) => void;
  saveCodeForRoute: () => Promise<StudioWritePageResult>;

  // Project management
  createProject: (
    name: string,
    type: ProjectType,
    description?: string,
    options?: { persist?: boolean },
  ) => void;
  updateProject: (
    updates: Partial<Omit<Project, 'id' | 'pages' | 'createdAt'>>,
  ) => void;
  saveProject: () => void;
  publishCurrentPage: () => Promise<PublishResult>;
  publishAllPages: () => Promise<PublishAllResult>;
  loadProject: (projectData: Project) => void;
  closeProject: () => void;
  exportProject: () => string;
  migrateCurrentPageToPageRoot: () => void;
  addToRecentProjects: (project: Project) => void;
  getStarredProjects: () => RecentProject[];
  toggleStarProject: (projectId: string) => void;

  // Page management
  createPage: (name: string, type: PageType, route?: string) => void;
  deletePage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;
  renamePage: (pageId: string, name: string, route?: string) => void;

  // Component management (operates on current page)
  addComponent: (type: ComponentType, parentId?: string | null) => void;
  insertComponent: (
    type: ComponentType,
    targetId: string,
    position: 'before' | 'after' | 'inside',
  ) => void;
  insertComponentWithData: (
    componentData: BuilderComponent,
    targetId: string,
    position: 'before' | 'after' | 'inside',
  ) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<BuilderComponent>) => void;
  selectComponent: (id: string | null) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  hoverComponent: (id: string | null) => void;
  moveComponent: (
    draggedId: string,
    targetId: string | null,
    position: 'before' | 'after' | 'inside',
  ) => void;
  clearCanvas: () => void;
  toggleOutlineMode: () => void;

  canvasViewMode: 'design' | 'code' | 'run';
  setCanvasViewMode: (mode: 'design' | 'code' | 'run') => void;

  // Clipboard operations
  clipboard: BuilderComponent | null;
  copyComponent: () => void;
  cutComponent: () => void;
  pasteComponent: (parentId?: string | null) => void;

  // History operations
  history: Page[];
  historyIndex: number;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;

  // AI Components
  aiComponents: BuilderComponent[];
  addAiComponent: (component: BuilderComponent) => void;
  removeAiComponent: (id: string) => void;
  clearAiComponents: () => void;
  loadAiComponents: () => Promise<void>;

  // Helper getters
  getCurrentPage: () => Page | null;
  getComponents: () => Record<string, BuilderComponent>;
  getRootId: () => string | null;

  // Drag and drop state
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  activeDropZoneId: string | null;
  setActiveDropZoneId: (id: string | null) => void;
  activeDropContainerId: string | null;
  setActiveDropContainerId: (id: string | null) => void;
  draggedComponentId: string | null;
  setDraggedComponentId: (id: string | null) => void;
  draggedComponentType: ComponentType | null;
  setDraggedComponentType: (type: ComponentType | null) => void;
  draggedAiComponentData: BuilderComponent | null;
  setDraggedAiComponentData: (data: BuilderComponent | null) => void;

  // Dropped component for ripple animation
  droppedComponentId: string | null;
  setDroppedComponentId: (id: string | null) => void;
}

// Helper function to recursively sync component references in the tree
const syncComponentTree = (
  components: Record<string, BuilderComponent>,
  rootId: string | null,
): Record<string, BuilderComponent> => {
  if (!rootId || !components[rootId]) return components;

  const syncedComponents: Record<string, BuilderComponent> = {};

  // Recursively build the synced tree
  const syncComponent = (id: string): BuilderComponent => {
    const comp = components[id];
    if (!comp) return comp;

    // Sync children recursively
    const syncedChildren = comp.children
      .map(child => syncComponent(child.id))
      .filter(c => c !== undefined);

    const syncedComp = {
      ...comp,
      children: syncedChildren,
    };

    syncedComponents[id] = syncedComp;
    return syncedComp;
  };

  syncComponent(rootId);
  return syncedComponents;
};

const ensurePageRoute = (page: Page): Page => {
  const resolvedRoute = page.route?.trim()
    ? normalizeRoutePath(page.route)
    : toRoutePath(page.name);

  if (page.route === resolvedRoute) return page;
  return { ...page, route: resolvedRoute };
};

const ensureProjectRoutes = (project: Project): Project => {
  let updated = false;
  const nextPages: Record<string, Page> = {};

  Object.entries(project.pages).forEach(([id, page]) => {
    const nextPage = ensurePageRoute(page);
    if (nextPage !== page) {
      updated = true;
    }
    nextPages[id] = nextPage;
  });

  if (!updated) return project;
  return { ...project, pages: nextPages };
};

const createDefaultComponent = (
  type: ComponentType,
  parentId: string | null = null,
  existingComponents: Record<string, BuilderComponent> = {},
): BuilderComponent => {
  const id = generateId();

  // Count existing components of this type
  const count =
    Object.values(existingComponents).filter(c => c.type === type).length + 1;

  const baseComponent: BuilderComponent = {
    id,
    type,
    name: `${type}${count}`,
    props: {},
    styles: {
      // Don't set width: 100% by default - let parent's alignItems control width
      // Components that need full width can set it explicitly
      padding: '1rem',
    },
    events: {},
    children: [],
    parentId,
  };

  switch (type) {
    case 'Container':
      return {
        ...baseComponent,
        styles: {
          ...baseComponent.styles,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: 'var(--color-card)',
          border: '1.5px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '0.5rem',
          color: 'var(--color-card-foreground)',
        },
      };
    case 'Button':
      return {
        ...baseComponent,
        props: { text: 'Button', type: 'button' },
        styles: {
          width: 'auto',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--color-canvas-primary)',
          color: 'var(--color-canvas-primary-foreground)',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500',
        },
      };
    case 'Text':
      return {
        ...baseComponent,
        props: { text: 'Text content' },
        styles: {
          width: 'auto',
          padding: '0',
          fontSize: '1rem',
          color: 'var(--color-foreground)',
        },
      };
    case 'Input':
      return {
        ...baseComponent,
        props: { placeholder: 'Enter text...', type: 'text' },
        styles: {
          width: '100%',
          padding: '0.5rem',
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)',
        },
      };
    case 'Card':
      return {
        ...baseComponent,
        styles: {
          ...baseComponent.styles,
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: 'var(--color-card-foreground)',
        },
      };
    case 'Flex':
      return {
        ...baseComponent,
        styles: {
          ...baseComponent.styles,
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          alignItems: 'center',
        },
      };
    case 'Grid':
      return {
        ...baseComponent,
        styles: {
          ...baseComponent.styles,
          display: 'grid',
          gap: '1rem',
        },
      };
    case 'Stack':
      return {
        ...baseComponent,
        styles: {
          ...baseComponent.styles,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        },
      };
    case 'Divider':
      return {
        ...baseComponent,
        styles: {
          width: '100%',
          height: '1px',
          backgroundColor: 'var(--color-border)',
          margin: '1rem 0',
        },
      };
    case 'Textarea':
      return {
        ...baseComponent,
        props: { placeholder: 'Enter text...', text: '' },
        styles: {
          width: '100%',
          padding: '0.5rem',
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          minHeight: '80px',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)',
        },
      };
    case 'Select':
      return {
        ...baseComponent,
        props: { placeholder: 'Select option...' },
        styles: {
          width: '100%',
          padding: '0.5rem',
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)',
        },
      };
    case 'Checkbox':
      return {
        ...baseComponent,
        props: { checked: false, text: 'Checkbox label' },
        styles: { width: 'auto', padding: '0' },
      };
    case 'Radio':
      return {
        ...baseComponent,
        props: { checked: false, text: 'Radio option' },
        styles: { width: 'auto', padding: '0' },
      };
    case 'Switch':
      return {
        ...baseComponent,
        props: { checked: false },
        styles: { width: 'auto', padding: '0' },
      };
    case 'Label':
      return {
        ...baseComponent,
        props: { text: 'Label' },
        styles: {
          width: 'auto',
          padding: '0',
          fontSize: '0.875rem',
          fontWeight: '500',
        },
      };
    case 'Form':
      return {
        ...baseComponent,
        styles: {
          ...baseComponent.styles,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        },
      };
    case 'Heading':
      return {
        ...baseComponent,
        props: { text: 'Heading', level: 2 },
        styles: {
          width: 'auto',
          padding: '0',
          fontSize: '1.5rem',
          fontWeight: '700',
        },
      };
    case 'Image':
      return {
        ...baseComponent,
        props: { src: 'https://placehold.co/400x300', alt: 'Image' },
        styles: {
          width: '100%',
          maxWidth: '480px',
          height: '240px',
          borderRadius: '0.5rem',
        },
      };
    case 'Badge':
      return {
        ...baseComponent,
        props: { text: 'Badge', badgeVariant: 'default' },
        styles: {
          width: 'auto',
          padding: '0.25rem 0.75rem',
          fontSize: '0.75rem',
        },
      };
    case 'Avatar':
      return {
        ...baseComponent,
        props: { src: '', alt: 'Avatar' },
        styles: { width: '40px', height: '40px', borderRadius: '50%' },
      };
    case 'Icon':
      return {
        ...baseComponent,
        props: { text: '★' },
        styles: { width: 'auto', padding: '0', fontSize: '1.5rem' },
      };
    case 'Alert':
      return {
        ...baseComponent,
        props: {
          title: 'Alert',
          description: 'This is an alert message',
          alertVariant: 'default',
        },
        styles: {
          ...baseComponent.styles,
          border: '1px solid var(--color-border)',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--color-card)',
          color: 'var(--color-card-foreground)',
        },
      };
    case 'Dialog':
      return {
        ...baseComponent,
        props: { title: 'Dialog', description: 'Dialog content' },
        styles: { ...baseComponent.styles },
      };
    case 'Toast':
      return {
        ...baseComponent,
        props: { title: 'Toast', description: 'Notification message' },
        styles: { ...baseComponent.styles },
      };
    case 'Progress':
      return {
        ...baseComponent,
        props: { progressValue: 50 },
        styles: { width: '100%', height: '0.5rem' },
      };
    case 'Spinner':
      return {
        ...baseComponent,
        styles: { width: '24px', height: '24px' },
      };
    case 'Skeleton':
      return {
        ...baseComponent,
        styles: {
          width: '100%',
          height: '1rem',
          backgroundColor: 'var(--color-muted)',
          borderRadius: '0.25rem',
        },
      };
    case 'Tabs':
      return {
        ...baseComponent,
        styles: { ...baseComponent.styles },
      };
    case 'Breadcrumb':
      return {
        ...baseComponent,
        styles: { width: 'auto', padding: '0' },
      };
    case 'Pagination':
      return {
        ...baseComponent,
        styles: { width: 'auto', padding: '0' },
      };
    case 'Menu':
      return {
        ...baseComponent,
        styles: { ...baseComponent.styles },
      };
    case 'Table':
      return {
        ...baseComponent,
        styles: {
          width: '100%',
          border: '1px solid var(--color-border)',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--color-card)',
          color: 'var(--color-card-foreground)',
        },
      };
    case 'List':
      return {
        ...baseComponent,
        styles: {
          ...baseComponent.styles,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        },
      };
    case 'DataGrid':
      return {
        ...baseComponent,
        styles: {
          width: '100%',
          display: 'grid',
          gap: '1rem',
        },
      };
    case 'Page':
      return {
        ...baseComponent,
        styles: {
          width: '100%',
          height: '100%',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '0.5rem',
          paddingTop: '1rem',
          paddingRight: '1rem',
          paddingBottom: '1rem',
          paddingLeft: '1rem',
        },
      };
    default:
      return baseComponent;
  }
};

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      project: null,
      selectedId: null,
      selectedIds: [],
      hoveredId: null,
      outlineMode: false,
      clipboard: null,
      history: [],
      historyIndex: -1,
      recentProjects: [],
      studioContext: null,
      setStudioContext: context => set({ studioContext: context }),
      codeRoute: null,
      setCodeRoute: route =>
        set(state => {
          const nextRoute = route?.trim() ? normalizeRoutePath(route) : null;
          if (state.codeRoute === nextRoute) return state;
          return {
            codeRoute: nextRoute,
            codeFile: {
              route: nextRoute,
              code: '',
              path: undefined,
              isDirty: false,
              isLoading: false,
              error: null,
            },
          };
        }),
      codeFile: {
        route: null,
        code: '',
        path: undefined,
        isDirty: false,
        isLoading: false,
        error: null,
      },
      loadCodeForRoute: async route => {
        const state = get();
        const normalized = route?.trim() ? normalizeRoutePath(route) : '/';

        if (
          typeof window === 'undefined' ||
          !window.electron?.studio?.readPage
        ) {
          set({
            codeRoute: normalized,
            codeFile: {
              route: normalized,
              code: '',
              path: undefined,
              isDirty: false,
              isLoading: false,
              error: 'Studio read API is unavailable',
            },
          });
          return { success: false, error: 'Studio read API is unavailable' };
        }

        if (!state.studioContext?.projectPath) {
          set({
            codeRoute: normalized,
            codeFile: {
              route: normalized,
              code: '',
              path: undefined,
              isDirty: false,
              isLoading: false,
              error: 'Studio context is missing',
            },
          });
          return { success: false, error: 'Studio context is missing' };
        }

        set({
          codeRoute: normalized,
          codeFile: {
            route: normalized,
            code: '',
            path: undefined,
            isDirty: false,
            isLoading: true,
            error: null,
          },
        });

        try {
          const result = await window.electron.studio.readPage({
            projectPath: state.studioContext.projectPath,
            appPath: state.studioContext.appPath ?? null,
            route: normalized,
          });

          if (result?.success) {
            const nextCode = typeof result.data === 'string' ? result.data : '';
            set({
              codeFile: {
                route: normalized,
                code: nextCode,
                path: result.path,
                isDirty: false,
                isLoading: false,
                error: null,
              },
            });
            return { success: true };
          }

          const error = result?.error || 'Failed to read page';
          set({
            codeFile: {
              route: normalized,
              code: '',
              path: result?.path,
              isDirty: false,
              isLoading: false,
              error,
            },
          });
          return { success: false, error };
        } catch (err) {
          const error =
            err instanceof Error ? err.message : 'Failed to read page';
          set({
            codeFile: {
              route: normalized,
              code: '',
              path: undefined,
              isDirty: false,
              isLoading: false,
              error,
            },
          });
          return { success: false, error };
        }
      },
      updateCodeContent: code =>
        set(state => {
          if (!state.codeFile.route) return state;
          return {
            codeFile: {
              ...state.codeFile,
              code,
              isDirty: true,
            },
          };
        }),
      saveCodeForRoute: async () => {
        const state = get();
        const route = state.codeFile.route ?? state.codeRoute;

        if (!route) {
          return { success: false, error: 'No route selected' };
        }

        if (
          typeof window === 'undefined' ||
          !window.electron?.studio?.writePage ||
          !window.electron?.studio?.readPage
        ) {
          return { success: false, error: 'Studio write API is unavailable' };
        }

        if (!state.studioContext?.projectPath) {
          return { success: false, error: 'Studio context is missing' };
        }

        try {
          const result = await window.electron.studio.writePage({
            projectPath: state.studioContext.projectPath,
            appPath: state.studioContext.appPath ?? null,
            route,
            code: state.codeFile.code,
          });

          if (result?.success) {
            set(prev => ({
              codeFile: {
                ...prev.codeFile,
                route,
                path: result.path ?? prev.codeFile.path,
                isDirty: false,
                isLoading: false,
                error: null,
              },
            }));
            return result;
          }

          return result ?? { success: false, error: 'Failed to write page' };
        } catch (err) {
          return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to write page',
          };
        }
      },
      isDragging: false,
      setIsDragging: isDragging => set({ isDragging }),
      activeDropZoneId: null,
      setActiveDropZoneId: id => set({ activeDropZoneId: id }),
      activeDropContainerId: null,
      setActiveDropContainerId: id => set({ activeDropContainerId: id }),
      draggedComponentId: null,
      setDraggedComponentId: id => set({ draggedComponentId: id }),
      draggedComponentType: null,
      setDraggedComponentType: type => set({ draggedComponentType: type }),
      draggedAiComponentData: null,
      setDraggedAiComponentData: data => set({ draggedAiComponentData: data }),

      // Track newly dropped components for ripple animation
      droppedComponentId: null,
      setDroppedComponentId: id => set({ droppedComponentId: id }),

      canvasViewMode: 'design',
      setCanvasViewMode: mode => set({ canvasViewMode: mode }),

      // AI Components
      aiComponents: [],
      addAiComponent: component => {
        set(state => ({ aiComponents: [component, ...state.aiComponents] }));
        // Backup to file system
        fetch('/api/studio/ai-components', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(component),
        }).catch(err => console.error('Failed to backup AI component', err));
      },
      removeAiComponent: id => {
        set(state => ({
          aiComponents: state.aiComponents.filter(c => c.id !== id),
        }));
        // Remove from file system
        fetch(`/api/studio/ai-components?id=${id}`, {
          method: 'DELETE',
        }).catch(err =>
          console.error('Failed to delete AI component backup', err),
        );
      },
      clearAiComponents: () => set({ aiComponents: [] }),
      loadAiComponents: async () => {
        try {
          const res = await fetch('/api/studio/ai-components');
          if (res.ok) {
            const data = await res.json();
            if (data.components && Array.isArray(data.components)) {
              set({ aiComponents: data.components });
            }
          }
        } catch (err) {
          console.error('Failed to load AI components', err);
        }
      },

      // Helper getters
      getCurrentPage: () => {
        const state = get();
        if (!state.project || !state.project.currentPageId) return null;
        return state.project.pages[state.project.currentPageId] || null;
      },

      getComponents: () => {
        const page = get().getCurrentPage();
        return page?.components || {};
      },

      getRootId: () => {
        const page = get().getCurrentPage();
        return page?.rootId || null;
      },

      // Project management
      createProject: (
        name: string,
        type: ProjectType,
        description?: string,
        options?: { persist?: boolean },
      ) => {
        const shouldPersist = options?.persist ?? true;
        const projectId = generateId();
        const pageId = generateId();
        const rootComponentId = generateId();
        const now = Date.now();

        // Create a root Page component that fills the canvas
        const rootComponent: BuilderComponent = {
          id: rootComponentId,
          type: 'Page',
          name: 'Page',
          children: [],
          styles: {
            width: '100%',
            height: 'auto',
            minHeight: '100%',
            paddingTop: '1rem',
            paddingRight: '1rem',
            paddingBottom: '1rem',
            paddingLeft: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          },
          props: {},
          events: {},
          parentId: null,
        };

        const initialPage: Page = {
          id: pageId,
          name: 'Page',
          type: type === 'react' ? 'page' : 'form',
          route: toRoutePath('Page'),
          components: { [rootComponentId]: rootComponent },
          rootId: rootComponentId,
          createdAt: now,
          updatedAt: now,
        };

        const project: Project = {
          id: projectId,
          name,
          type,
          description,
          pages: { [pageId]: initialPage },
          currentPageId: pageId,
          createdAt: now,
          updatedAt: now,
        };

        set({ project, selectedId: null, selectedIds: [], hoveredId: null });

        // Add to recent projects
        get().addToRecentProjects(project);

        if (shouldPersist) {
          // Auto-save the project
          const projectFileName = name.toLowerCase().replace(/\s+/g, '-');
          const projectData = JSON.stringify(project, null, 2);

          // Check if running in Electron
          if (
            typeof window !== 'undefined' &&
            (window as any).electron?.project?.save
          ) {
            // Use Electron's native save dialog (defaults to ~/Projects/applab-projects)
            (async () => {
              try {
                await (window as any).electron.project.save({
                  projectData,
                  fileName: `${projectFileName}.applab.project`,
                  isNew: true,
                });
              } catch (err) {
                console.error('Failed to save project:', err);
              }
            })();
          } else if ('showSaveFilePicker' in window) {
            // Use File System Access API if available (Chrome/Edge)
            (async () => {
              try {
                const fileHandle = await (window as any).showSaveFilePicker({
                  suggestedName: `${projectFileName}.applab.project`,
                  startIn: 'documents',
                  types: [
                    {
                      description: 'SummonIQ Project files',
                      accept: { 'application/json': ['.applab.project'] },
                    },
                  ],
                });
                const writable = await fileHandle.createWritable();
                await writable.write(projectData);
                await writable.close();
              } catch (err) {
                // User cancelled - do nothing
              }
            })();
          } else {
            // Fallback for browsers without File System Access API
            const blob = new Blob([projectData], {
              type: 'application/octet-stream',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectFileName}.applab.project`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }
      },

      updateProject: updates => {
        set(state => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              ...updates,
              updatedAt: Date.now(),
            },
          };
        });
      },

      saveProject: () => {
        const state = get();
        if (!state.project) return;

        const projectData = JSON.stringify(state.project, null, 2);
        if (
          state.studioContext?.projectPath &&
          typeof window !== 'undefined' &&
          (window as any).electron?.studio?.writeDesign
        ) {
          (async () => {
            try {
              await (window as any).electron.studio.writeDesign({
                projectPath: state.studioContext?.projectPath,
                appPath: state.studioContext?.appPath ?? null,
                data: projectData,
              });
            } catch (err) {
              console.error('Failed to save studio design:', err);
            }
          })();
          return;
        }

        const blob = new Blob([projectData], {
          type: 'application/octet-stream',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.project.name
          .replace(/\s+/g, '-')
          .toLowerCase()}.applab.project`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      publishCurrentPage: async () => {
        const state = get();
        if (!state.project || !state.project.currentPageId) {
          return { success: false, error: 'No active project' };
        }

        if (state.project.type !== 'react') {
          return {
            success: false,
            error: 'Publish is only supported for React projects',
          };
        }

        if (
          typeof window === 'undefined' ||
          !(window as any).electron?.studio?.writePage
        ) {
          return { success: false, error: 'Studio write API is unavailable' };
        }

        if (!state.studioContext?.projectPath) {
          return { success: false, error: 'Studio context is missing' };
        }

        get().saveProject();

        const page = state.project.pages[state.project.currentPageId];
        const rootComponent = page.rootId ? page.components[page.rootId] : null;
        const code = generateReactPageCode(page, rootComponent);
        const route = getPageRoute(page);

        try {
          // TODO: On publish, open a PR with the generated page changes and request agent review before auto-merge/deploy.
          const result = await (window as any).electron.studio.writePage({
            projectPath: state.studioContext.projectPath,
            appPath: state.studioContext.appPath ?? null,
            route,
            code,
          });

          return result ?? { success: false, error: 'Failed to write page' };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : 'Failed to write page',
          };
        }
      },

      publishAllPages: async () => {
        const state = get();
        if (!state.project) {
          return {
            success: false,
            published: 0,
            failed: 0,
            errors: [{ route: '/', error: 'No active project' }],
          };
        }

        if (state.project.type !== 'react') {
          return {
            success: false,
            published: 0,
            failed: 0,
            errors: [
              {
                route: '/',
                error: 'Publish is only supported for React projects',
              },
            ],
          };
        }

        if (
          typeof window === 'undefined' ||
          !(window as any).electron?.studio?.writePage
        ) {
          return {
            success: false,
            published: 0,
            failed: 0,
            errors: [{ route: '/', error: 'Studio write API is unavailable' }],
          };
        }

        if (!state.studioContext?.projectPath) {
          return {
            success: false,
            published: 0,
            failed: 0,
            errors: [{ route: '/', error: 'Studio context is missing' }],
          };
        }

        get().saveProject();

        const pages = Object.values(state.project.pages);
        const seenRoutes = new Set<string>();
        const errors: { route: string; error: string }[] = [];
        let published = 0;
        let failed = 0;

        for (const page of pages) {
          const route = getPageRoute(page);
          const normalizedRoute = route.toLowerCase();

          if (seenRoutes.has(normalizedRoute)) {
            failed += 1;
            errors.push({ route, error: 'Duplicate route detected' });
            continue;
          }

          seenRoutes.add(normalizedRoute);
          const rootComponent = page.rootId
            ? page.components[page.rootId]
            : null;
          const code = generateReactPageCode(page, rootComponent);

          try {
            // TODO: Batch publish should also open a PR or sync branch for review before deployment.
            const result = await (window as any).electron.studio.writePage({
              projectPath: state.studioContext.projectPath,
              appPath: state.studioContext.appPath ?? null,
              route,
              code,
            });

            if (result?.success) {
              published += 1;
            } else {
              failed += 1;
              errors.push({
                route,
                error: result?.error || 'Failed to write page',
              });
            }
          } catch (error) {
            failed += 1;
            errors.push({
              route,
              error:
                error instanceof Error ? error.message : 'Failed to write page',
            });
          }
        }

        return {
          success: failed === 0,
          published,
          failed,
          errors: errors.length > 0 ? errors : undefined,
        };
      },

      insertComponent: (
        type: ComponentType,
        targetId: string,
        position: 'before' | 'after' | 'inside',
      ) => {
        set(state => {
          if (!state.project || !state.project.currentPageId) return state;

          const currentPage = state.project.pages[state.project.currentPageId];
          const components = { ...currentPage.components };
          const target = components[targetId];

          if (!target) return state;

          if (position === 'inside') {
            const containerId = target.id;
            const newComponent = createDefaultComponent(
              type,
              containerId,
              components,
            );

            // Apply flex stretch to children of root or Container/Page components
            const isRootContainer = containerId === currentPage.rootId;
            const containerType = components[containerId]?.type;
            const isContainerComponent =
              containerType === 'Container' || containerType === 'Page';

            const isContainerLikeChild =
              newComponent.type === 'Container' ||
              newComponent.type === 'Flex' ||
              newComponent.type === 'Grid' ||
              newComponent.type === 'Card' ||
              newComponent.type === 'Stack' ||
              newComponent.type === 'Form' ||
              newComponent.type === 'List' ||
              newComponent.type === 'Table' ||
              newComponent.type === 'DataGrid';

            const hasExplicitFlexSizing =
              newComponent.styles.flex !== undefined ||
              newComponent.styles.flexGrow !== undefined ||
              newComponent.styles.flexShrink !== undefined ||
              newComponent.styles.flexBasis !== undefined;

            if (
              (isRootContainer || isContainerComponent) &&
              isContainerLikeChild &&
              !hasExplicitFlexSizing
            ) {
              newComponent.styles = {
                ...newComponent.styles,
                flex: '1',
              };
            }

            components[newComponent.id] = newComponent;

            if (components[containerId]) {
              components[containerId] = {
                ...components[containerId],
                children: [...components[containerId].children, newComponent],
              };
            }

            const rootId =
              currentPage.rootId || currentPage.rootId === containerId
                ? currentPage.rootId
                : currentPage.rootId;

            // Sync tree after inserting inside
            const syncedComponents = syncComponentTree(components, rootId);
            Object.keys(components).forEach(compId => {
              if (syncedComponents[compId]) {
                components[compId] = syncedComponents[compId];
              }
            });

            return {
              project: {
                ...state.project,
                pages: {
                  ...state.project.pages,
                  [currentPage.id]: {
                    ...currentPage,
                    components,
                    rootId,
                    updatedAt: Date.now(),
                  },
                },
                updatedAt: Date.now(),
              },
              selectedId: newComponent.id,
              selectedIds: [newComponent.id],
            };
          }

          const parentId = target.parentId;

          if (!parentId || !components[parentId]) {
            const newComponent = createDefaultComponent(type, null, components);
            components[newComponent.id] = newComponent;

            const rootId =
              currentPage.rootId ||
              (!currentPage.rootId ? newComponent.id : currentPage.rootId);

            // Sync tree after inserting at root level
            const syncedComponents = syncComponentTree(components, rootId);
            Object.keys(components).forEach(compId => {
              if (syncedComponents[compId]) {
                components[compId] = syncedComponents[compId];
              }
            });

            return {
              project: {
                ...state.project,
                pages: {
                  ...state.project.pages,
                  [currentPage.id]: {
                    ...currentPage,
                    components,
                    rootId,
                    updatedAt: Date.now(),
                  },
                },
                updatedAt: Date.now(),
              },
              selectedId: newComponent.id,
              selectedIds: [newComponent.id],
            };
          }

          const parent = components[parentId];
          const newComponent = createDefaultComponent(
            type,
            parentId,
            components,
          );

          // Apply flex stretch to children of root or Container/Page components
          const isRootContainer = parentId === currentPage.rootId;
          const isContainerComponent =
            parent?.type === 'Container' || parent?.type === 'Page';

          const isContainerLikeChild =
            newComponent.type === 'Container' ||
            newComponent.type === 'Flex' ||
            newComponent.type === 'Grid' ||
            newComponent.type === 'Card' ||
            newComponent.type === 'Stack' ||
            newComponent.type === 'Form' ||
            newComponent.type === 'List' ||
            newComponent.type === 'Table' ||
            newComponent.type === 'DataGrid';

          const hasExplicitFlexSizing =
            newComponent.styles.flex !== undefined ||
            newComponent.styles.flexGrow !== undefined ||
            newComponent.styles.flexShrink !== undefined ||
            newComponent.styles.flexBasis !== undefined;

          if (
            (isRootContainer || isContainerComponent) &&
            isContainerLikeChild &&
            !hasExplicitFlexSizing
          ) {
            newComponent.styles = {
              ...newComponent.styles,
              flex: '1',
            };
          }

          components[newComponent.id] = newComponent;

          const children = [...parent.children];
          const targetIndex = children.findIndex(
            (c: BuilderComponent) => c.id === targetId,
          );

          if (targetIndex === -1) {
            children.push(newComponent);
          } else {
            const insertIndex =
              position === 'before' ? targetIndex : targetIndex + 1;
            children.splice(insertIndex, 0, newComponent);
          }

          components[parentId] = {
            ...parent,
            children,
          };

          // Sync tree after inserting before/after
          const syncedComponents = syncComponentTree(
            components,
            currentPage.rootId,
          );
          Object.keys(components).forEach(compId => {
            if (syncedComponents[compId]) {
              components[compId] = syncedComponents[compId];
            }
          });

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [currentPage.id]: {
                  ...currentPage,
                  components,
                  rootId: currentPage.rootId,
                  updatedAt: Date.now(),
                },
              },
              updatedAt: Date.now(),
            },
            selectedId: newComponent.id,
            selectedIds: [newComponent.id],
          };
        });
      },

      insertComponentWithData: (
        componentData: BuilderComponent,
        targetId: string,
        position: 'before' | 'after' | 'inside',
      ) => {
        set(state => {
          if (!state.project || !state.project.currentPageId) return state;

          const currentPage = state.project.pages[state.project.currentPageId];
          const components = { ...currentPage.components };
          const target = components[targetId];

          if (!target) return state;

          // Helper to recursively clone with new IDs
          const cloneComponentWithNewIds = (
            comp: BuilderComponent,
            newParentId: string | null = null,
          ): BuilderComponent => {
            const newId = generateId();
            const clonedChildren = comp.children.map(child =>
              cloneComponentWithNewIds(child, newId),
            );

            const newComponent: BuilderComponent = {
              ...comp,
              id: newId,
              parentId: newParentId,
              children: clonedChildren,
            };

            components[newId] = newComponent;
            return newComponent;
          };

          // 1. Clone the component tree
          // We don't know the parent ID yet, will assign below
          const newComponent = cloneComponentWithNewIds(componentData, null);

          // Helper to push a history snapshot for this page change
          const pushHistory = (updatedPage: Page) => {
            const prevPageSnapshot: Page = JSON.parse(
              JSON.stringify(currentPage),
            );
            const baseHistory =
              state.historyIndex >= 0
                ? state.history.slice(0, state.historyIndex + 1)
                : [prevPageSnapshot];
            const newHistory = [
              ...baseHistory,
              JSON.parse(JSON.stringify(updatedPage)),
            ];
            const newHistoryIndex = newHistory.length - 1;
            return { history: newHistory, historyIndex: newHistoryIndex };
          };

          // 2. Insert it based on position
          if (position === 'inside') {
            const containerId = target.id;
            newComponent.parentId = containerId;

            // Apply flex stretch to children of root or Container/Page components
            const isRootContainer = containerId === currentPage.rootId;
            const containerType = components[containerId]?.type;
            const isContainerComponent =
              containerType === 'Container' || containerType === 'Page';

            if (isRootContainer || isContainerComponent) {
              newComponent.styles = {
                ...newComponent.styles,
                flex: '1',
              };
            }

            if (components[containerId]) {
              components[containerId] = {
                ...components[containerId],
                children: [...components[containerId].children, newComponent],
              };
            }

            const rootId =
              currentPage.rootId || currentPage.rootId === containerId
                ? currentPage.rootId
                : currentPage.rootId;

            const syncedComponents = syncComponentTree(components, rootId);
            Object.keys(components).forEach(compId => {
              if (syncedComponents[compId]) {
                components[compId] = syncedComponents[compId];
              }
            });

            const newPage: Page = {
              ...currentPage,
              components,
              rootId,
              updatedAt: Date.now(),
            };

            const historyUpdate = pushHistory(newPage);

            return {
              project: {
                ...state.project,
                pages: {
                  ...state.project.pages,
                  [currentPage.id]: newPage,
                },
                updatedAt: Date.now(),
              },
              selectedId: newComponent.id,
              selectedIds: [newComponent.id],
              ...historyUpdate,
            };
          }

          const parentId = target.parentId;

          if (!parentId || !components[parentId]) {
            // Insert at root level logic (similar to insertComponent)
            newComponent.parentId = null;

            const rootId =
              currentPage.rootId ||
              (!currentPage.rootId ? newComponent.id : currentPage.rootId);

            const syncedComponents = syncComponentTree(components, rootId);
            Object.keys(components).forEach(compId => {
              if (syncedComponents[compId]) {
                components[compId] = syncedComponents[compId];
              }
            });

            const newPage: Page = {
              ...currentPage,
              components,
              rootId,
              updatedAt: Date.now(),
            };

            const historyUpdate = pushHistory(newPage);

            return {
              project: {
                ...state.project,
                pages: {
                  ...state.project.pages,
                  [currentPage.id]: newPage,
                },
                updatedAt: Date.now(),
              },
              selectedId: newComponent.id,
              selectedIds: [newComponent.id],
              ...historyUpdate,
            };
          }

          // Insert before/after
          const parent = components[parentId];
          newComponent.parentId = parentId;

          // Apply flex stretch
          const isRootContainer = parentId === currentPage.rootId;
          const isContainerComponent = parent?.type === 'Container';

          const isContainerLikeChild =
            newComponent.type === 'Container' ||
            newComponent.type === 'Flex' ||
            newComponent.type === 'Grid' ||
            newComponent.type === 'Card' ||
            newComponent.type === 'Stack' ||
            newComponent.type === 'Form' ||
            newComponent.type === 'List' ||
            newComponent.type === 'Table' ||
            newComponent.type === 'DataGrid';

          const hasExplicitFlexSizing =
            newComponent.styles.flex !== undefined ||
            newComponent.styles.flexGrow !== undefined ||
            newComponent.styles.flexShrink !== undefined ||
            newComponent.styles.flexBasis !== undefined;

          if (
            (isRootContainer || isContainerComponent) &&
            isContainerLikeChild &&
            !hasExplicitFlexSizing
          ) {
            newComponent.styles = {
              ...newComponent.styles,
              flex: '1',
            };
          }

          const children = [...parent.children];
          const targetIndex = children.findIndex(
            (c: BuilderComponent) => c.id === targetId,
          );

          if (targetIndex === -1) {
            children.push(newComponent);
          } else {
            const insertIndex =
              position === 'before' ? targetIndex : targetIndex + 1;
            children.splice(insertIndex, 0, newComponent);
          }

          components[parentId] = {
            ...parent,
            children,
          };

          const syncedComponents = syncComponentTree(
            components,
            currentPage.rootId,
          );
          Object.keys(components).forEach(compId => {
            if (syncedComponents[compId]) {
              components[compId] = syncedComponents[compId];
            }
          });

          const newPage: Page = {
            ...currentPage,
            components,
            rootId: currentPage.rootId,
            updatedAt: Date.now(),
          };

          const historyUpdate = pushHistory(newPage);

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [currentPage.id]: newPage,
              },
              updatedAt: Date.now(),
            },
            selectedId: newComponent.id,
            selectedIds: [newComponent.id],
            ...historyUpdate,
          };
        });
      },

      loadProject: (projectData: Project) => {
        const normalizedProject = ensureProjectRoutes(projectData);
        set({
          project: normalizedProject,
          selectedId: null,
          selectedIds: [],
          hoveredId: null,
        });

        // Add to recent projects
        get().addToRecentProjects(normalizedProject);
      },

      closeProject: () => {
        set({
          project: null,
          selectedId: null,
          selectedIds: [],
          hoveredId: null,
        });
      },

      exportProject: () => {
        const state = get();
        if (!state.project) return '';
        return JSON.stringify(state.project, null, 2);
      },

      migrateCurrentPageToPageRoot: () => {
        set(state => {
          if (!state.project || !state.project.currentPageId) return state;

          const pageId = state.project.currentPageId;
          const page = state.project.pages[pageId];

          if (!page || !page.rootId) return state;

          const rootComponent = page.components[page.rootId];

          // If root is already a Page component, fix its height if needed
          if (rootComponent && rootComponent.type === 'Page') {
            let needsUpdate = false;
            const updatedComponents = { ...page.components };

            // Check if Page has wrong height and fix it
            if (
              rootComponent.styles.minHeight === '100vh' ||
              rootComponent.styles.minHeight === '100%' ||
              rootComponent.styles.height !== '100%' ||
              rootComponent.styles.flex === '1'
            ) {
              updatedComponents[rootComponent.id] = {
                ...rootComponent,
                styles: {
                  ...rootComponent.styles,
                  height: '100%',
                  minHeight: undefined,
                  flex: undefined, // Clear flex since Page is root
                },
              };
              needsUpdate = true;
            }

            // Fix first child (Container1) to fill height with flex: 1
            // BUT only if it doesn't have a specific height set by the user
            if (rootComponent.children.length > 0) {
              const firstChild = rootComponent.children[0];
              const firstChildComp = page.components[firstChild.id];
              // Only set flex: 1 if it doesn't already have it AND doesn't have a user-set height
              const hasUserSetHeight =
                firstChildComp?.styles?.height &&
                firstChildComp.styles.height !== '100%' &&
                firstChildComp.styles.height !== 'auto';
              if (
                firstChildComp &&
                firstChildComp.styles.flex !== '1' &&
                !hasUserSetHeight
              ) {
                updatedComponents[firstChild.id] = {
                  ...firstChildComp,
                  styles: {
                    ...firstChildComp.styles,
                    flex: '1',
                    height: undefined, // Clear any height value
                  },
                };
                needsUpdate = true;
              }
            }

            if (needsUpdate) {
              return {
                project: {
                  ...state.project,
                  pages: {
                    ...state.project.pages,
                    [pageId]: {
                      ...page,
                      components: updatedComponents,
                      updatedAt: Date.now(),
                    },
                  },
                  updatedAt: Date.now(),
                },
              };
            }
            return state;
          }

          // Check if already migrated (root is a Page component)
          if (!rootComponent || rootComponent.type === 'Page') return state;

          // Create Page component
          const pageComponentId = generateId();
          const pageComponent: BuilderComponent = {
            id: pageComponentId,
            type: 'Page',
            name: 'Page',
            parentId: null,
            props: {},
            styles: {
              width: '100%',
              height: '100%',
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '0.5rem',
              paddingTop: '1rem',
              paddingRight: '1rem',
              paddingBottom: '1rem',
              paddingLeft: '1rem',
            },
            children: [rootComponent],
            events: {},
          };

          // Update old root's parent
          const updatedOldRoot = {
            ...rootComponent,
            parentId: pageComponentId,
          };

          const updatedPage = {
            ...page,
            components: {
              ...page.components,
              [pageComponentId]: pageComponent,
              [rootComponent.id]: updatedOldRoot,
            },
            rootId: pageComponentId,
            updatedAt: Date.now(),
          };

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [pageId]: updatedPage,
              },
              updatedAt: Date.now(),
            },
          };
        });
      },

      // Page management
      createPage: (name: string, type: PageType, route?: string) => {
        set(state => {
          if (!state.project) return state;

          const pageId = generateId();
          const canvasId = generateId();
          const now = Date.now();

          // Create a Page component as the root
          const canvasComponent: BuilderComponent = {
            id: canvasId,
            type: 'Page',
            name: 'Page',
            parentId: null,
            props: {},
            styles: {
              width: '100%',
              height: '100%',
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '0.5rem',
              paddingTop: '1rem',
              paddingRight: '1rem',
              paddingBottom: '1rem',
              paddingLeft: '1rem',
            },
            children: [],
            events: {},
          };

          const newPage: Page = {
            id: pageId,
            name,
            type,
            route: route?.trim()
              ? normalizeRoutePath(route)
              : toRoutePath(name),
            components: {
              [canvasId]: canvasComponent,
            },
            rootId: canvasId,
            createdAt: now,
            updatedAt: now,
          };

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [pageId]: newPage,
              },
              currentPageId: pageId,
              updatedAt: now,
            },
            selectedId: null,
            selectedIds: [],
          };
        });
      },

      deletePage: (pageId: string) => {
        set(state => {
          if (!state.project) return state;

          const pages = { ...state.project.pages };
          delete pages[pageId];

          const pageIds = Object.keys(pages);
          const newCurrentPageId = pageIds.length > 0 ? pageIds[0] : null;

          return {
            project: {
              ...state.project,
              pages,
              currentPageId: newCurrentPageId,
              updatedAt: Date.now(),
            },
            selectedId: null,
            selectedIds: [],
          };
        });
      },

      setCurrentPage: (pageId: string) => {
        set(state => {
          if (!state.project || !state.project.pages[pageId]) return state;

          const page = state.project.pages[pageId];

          // Migration: Wrap existing root in a Page component if needed
          if (page.rootId && page.components[page.rootId]?.type !== 'Page') {
            const oldRoot = page.components[page.rootId];
            const pageComponentId = generateId();

            // Create Page component
            const pageComponent: BuilderComponent = {
              id: pageComponentId,
              type: 'Page',
              name: 'Page',
              parentId: null,
              props: {},
              styles: {
                width: '100%',
                height: 'auto',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                paddingTop: '1rem',
                paddingRight: '1rem',
                paddingBottom: '1rem',
                paddingLeft: '1rem',
              },
              children: [oldRoot],
              events: {},
            };

            // Update old root's parent
            const updatedOldRoot = {
              ...oldRoot,
              parentId: pageComponentId,
            };

            const updatedPage = {
              ...page,
              components: {
                ...page.components,
                [pageComponentId]: pageComponent,
                [oldRoot.id]: updatedOldRoot,
              },
              rootId: pageComponentId,
            };

            return {
              project: {
                ...state.project,
                currentPageId: pageId,
                pages: {
                  ...state.project.pages,
                  [pageId]: updatedPage,
                },
              },
              selectedId: null,
              selectedIds: [],
            };
          }

          return {
            project: {
              ...state.project,
              currentPageId: pageId,
            },
            selectedId: null,
          };
        });
      },

      renamePage: (pageId: string, name: string, route?: string) => {
        set(state => {
          if (!state.project || !state.project.pages[pageId]) return state;

          const existing = state.project.pages[pageId];
          const nextRoute = route?.trim()
            ? normalizeRoutePath(route)
            : (existing.route ?? toRoutePath(name));

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [pageId]: {
                  ...existing,
                  name,
                  route: nextRoute,
                  updatedAt: Date.now(),
                },
              },
              updatedAt: Date.now(),
            },
          };
        });
      },

      // Component management
      addComponent: (type: ComponentType, parentId: string | null = null) => {
        console.log('addComponent called:', { type, parentId });
        set(state => {
          if (!state.project || !state.project.currentPageId) {
            console.log('addComponent: no project or currentPageId');
            return state;
          }

          const currentPage = state.project.pages[state.project.currentPageId];
          const newComponent = createDefaultComponent(
            type,
            parentId,
            currentPage.components,
          );

          // Don't auto-apply flex: 1 - let parent's justifyContent control distribution
          // Users can manually set flex: 1 on children if they want them to grow

          const components = { ...currentPage.components };
          components[newComponent.id] = newComponent;

          // If adding to a parent, update parent's children
          if (parentId && components[parentId]) {
            components[parentId] = {
              ...components[parentId],
              children: [...components[parentId].children, newComponent],
            };
          }

          // If no root exists and no parent specified, make this the root
          const rootId =
            currentPage.rootId ||
            (!parentId ? newComponent.id : currentPage.rootId);

          // Sync the tree to ensure all references are properly connected
          const syncedComponents = syncComponentTree(components, rootId);
          Object.keys(components).forEach(compId => {
            if (syncedComponents[compId]) {
              components[compId] = syncedComponents[compId];
            }
          });

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [currentPage.id]: {
                  ...currentPage,
                  components,
                  rootId,
                  updatedAt: Date.now(),
                },
              },
              updatedAt: Date.now(),
            },
            selectedId: newComponent.id,
            selectedIds: [newComponent.id],
          };
        });
      },

      removeComponent: (id: string) => {
        set(state => {
          if (!state.project || !state.project.currentPageId) return state;

          const currentPage = state.project.pages[state.project.currentPageId];
          const components = { ...currentPage.components };
          const component = components[id];

          if (!component) return state;

          // Remove from parent's children
          if (component.parentId && components[component.parentId]) {
            components[component.parentId] = {
              ...components[component.parentId],
              children: components[component.parentId].children.filter(
                (c: BuilderComponent) => c.id !== id,
              ),
            };
          }

          // Recursively remove all children
          const removeRecursive = (compId: string) => {
            const comp = components[compId];
            if (comp) {
              comp.children.forEach((child: BuilderComponent) =>
                removeRecursive(child.id),
              );
              delete components[compId];
            }
          };

          removeRecursive(id);

          // Sync the tree after removal if root still exists
          const newRootId =
            currentPage.rootId === id ? null : currentPage.rootId;
          if (newRootId) {
            const syncedComponents = syncComponentTree(components, newRootId);
            Object.keys(components).forEach(compId => {
              if (syncedComponents[compId]) {
                components[compId] = syncedComponents[compId];
              }
            });
          }

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [currentPage.id]: {
                  ...currentPage,
                  components,
                  rootId: newRootId,
                  updatedAt: Date.now(),
                },
              },
              updatedAt: Date.now(),
            },
            selectedId: state.selectedId === id ? null : state.selectedId,
            selectedIds: state.selectedIds.filter(i => i !== id),
          };
        });
      },

      updateComponent: (id: string, updates: Partial<BuilderComponent>) => {
        set(state => {
          if (!state.project || !state.project.currentPageId) return state;

          const currentPage = state.project.pages[state.project.currentPageId];
          const components = { ...currentPage.components };

          if (!components[id]) {
            return state;
          }

          const updatedComponent: BuilderComponent = {
            ...components[id],
            ...updates,
          };
          components[id] = updatedComponent;

          // Recursively sync the entire tree to ensure all nested references are updated
          const syncedComponents = syncComponentTree(
            components,
            currentPage.rootId,
          );

          // Merge synced components back with any non-tree components
          Object.keys(components).forEach(compId => {
            if (syncedComponents[compId]) {
              components[compId] = syncedComponents[compId];
            }
          });

          const newPage: Page = {
            ...currentPage,
            components,
            updatedAt: Date.now(),
          };

          // Update history so undo/redo can revert this change
          const prevPageSnapshot: Page = JSON.parse(
            JSON.stringify(currentPage),
          );
          const baseHistory =
            state.historyIndex >= 0
              ? state.history.slice(0, state.historyIndex + 1)
              : [prevPageSnapshot];
          const newHistory = [
            ...baseHistory,
            JSON.parse(JSON.stringify(newPage)),
          ];
          const newHistoryIndex = newHistory.length - 1;

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [currentPage.id]: newPage,
              },
              updatedAt: Date.now(),
            },
            history: newHistory,
            historyIndex: newHistoryIndex,
          };
        });
      },

      selectComponent: (id: string | null) => {
        set({
          selectedId: id,
          selectedIds: id ? [id] : [],
        });
      },

      toggleSelection: (id: string) => {
        set(state => {
          const isSelected = state.selectedIds.includes(id);
          let newSelectedIds: string[];

          if (isSelected) {
            newSelectedIds = state.selectedIds.filter(i => i !== id);
          } else {
            newSelectedIds = [...state.selectedIds, id];
          }

          // Determine new primary selection (usually the last one added)
          const newSelectedId =
            newSelectedIds.length > 0
              ? newSelectedIds[newSelectedIds.length - 1]
              : null;

          return {
            selectedIds: newSelectedIds,
            selectedId: newSelectedId,
          };
        });
      },

      clearSelection: () => {
        set({
          selectedIds: [],
          selectedId: null,
        });
      },

      hoverComponent: (id: string | null) => {
        set({ hoveredId: id });
      },

      moveComponent: (
        draggedId: string,
        targetId: string | null,
        position: 'before' | 'after' | 'inside',
      ) => {
        set(state => {
          if (!state.project || !state.project.currentPageId) return state;

          const currentPage = state.project.pages[state.project.currentPageId];
          const components = { ...currentPage.components };

          const dragged = components[draggedId];
          if (!dragged) return state;

          // Don't allow moving the root component for now
          if (currentPage.rootId === draggedId) {
            return state;
          }

          // Remove from existing parent children
          if (dragged.parentId && components[dragged.parentId]) {
            const oldParent = components[dragged.parentId];
            components[dragged.parentId] = {
              ...oldParent,
              children: oldParent.children.filter(
                (c: BuilderComponent) => c.id !== draggedId,
              ),
            };

            // Remove flex stretch if moving out of root or Container/Page
            const wasInRootContainer = dragged.parentId === currentPage.rootId;
            const wasInContainerComponent =
              oldParent?.type === 'Container' || oldParent?.type === 'Page';

            if (wasInRootContainer || wasInContainerComponent) {
              const updatedStyles = { ...dragged.styles };
              delete updatedStyles.flex;
              dragged.styles = updatedStyles;
              components[draggedId] = { ...dragged, styles: updatedStyles };
            }
          }

          if (!targetId) {
            // Sync tree after removing from parent
            const syncedComponents = syncComponentTree(
              components,
              currentPage.rootId,
            );
            Object.keys(components).forEach(compId => {
              if (syncedComponents[compId]) {
                components[compId] = syncedComponents[compId];
              }
            });

            return {
              project: {
                ...state.project,
                pages: {
                  ...state.project.pages,
                  [currentPage.id]: {
                    ...currentPage,
                    components,
                    updatedAt: Date.now(),
                  },
                },
                updatedAt: Date.now(),
              },
              selectedId: draggedId,
              selectedIds: [draggedId],
            };
          }

          const target = components[targetId];
          if (!target) return state;

          if (position === 'inside') {
            // Move into target as a child (append at end)
            const containerId = target.id;
            const updatedDragged: BuilderComponent = {
              ...dragged,
              parentId: containerId,
            };

            // Apply flex stretch to children of root or Container/Page components
            const isRootContainer = containerId === currentPage.rootId;
            const containerType = components[containerId]?.type;
            const isContainerComponent =
              containerType === 'Container' || containerType === 'Page';

            if (isRootContainer || isContainerComponent) {
              updatedDragged.styles = {
                ...updatedDragged.styles,
                flex: '1',
              };
            }

            components[draggedId] = updatedDragged;

            const container = components[containerId];
            components[containerId] = {
              ...container,
              children: [...container.children, updatedDragged],
            };

            // Sync tree after moving inside
            const syncedComponents = syncComponentTree(
              components,
              currentPage.rootId,
            );
            Object.keys(components).forEach(compId => {
              if (syncedComponents[compId]) {
                components[compId] = syncedComponents[compId];
              }
            });

            return {
              project: {
                ...state.project,
                pages: {
                  ...state.project.pages,
                  [currentPage.id]: {
                    ...currentPage,
                    components,
                    updatedAt: Date.now(),
                  },
                },
                updatedAt: Date.now(),
              },
              selectedId: draggedId,
              selectedIds: [draggedId],
            };
          }

          // before/after: insert into target's parent children array
          const parentId = target.parentId;
          if (!parentId || !components[parentId]) {
            // No valid parent to reorder within
            return state;
          }

          const parent = components[parentId];
          const updatedDragged: BuilderComponent = {
            ...dragged,
            parentId,
          };

          // Apply flex stretch to children of root or Container/Page components
          const isRootContainer = parentId === currentPage.rootId;
          const isContainerComponent =
            parent?.type === 'Container' || parent?.type === 'Page';

          if (isRootContainer || isContainerComponent) {
            updatedDragged.styles = {
              ...updatedDragged.styles,
              flex: '1',
            };
          }

          components[draggedId] = updatedDragged;

          // Start from parent children without the dragged component
          const siblings = parent.children.filter(
            (c: BuilderComponent) => c.id !== draggedId,
          );

          const targetIndex = siblings.findIndex(
            (c: BuilderComponent) => c.id === targetId,
          );
          if (targetIndex === -1) {
            siblings.push(updatedDragged);
          } else {
            const insertIndex =
              position === 'before' ? targetIndex : targetIndex + 1;
            siblings.splice(insertIndex, 0, updatedDragged);
          }

          components[parentId] = {
            ...parent,
            children: siblings,
          };

          // Sync tree after reordering
          const syncedComponents = syncComponentTree(
            components,
            currentPage.rootId,
          );
          Object.keys(components).forEach(compId => {
            if (syncedComponents[compId]) {
              components[compId] = syncedComponents[compId];
            }
          });

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [currentPage.id]: {
                  ...currentPage,
                  components,
                  updatedAt: Date.now(),
                },
              },
              updatedAt: Date.now(),
            },
            selectedId: draggedId,
          };
        });
      },

      clearCanvas: () => {
        set(state => {
          if (!state.project || !state.project.currentPageId) return state;

          const currentPage = state.project.pages[state.project.currentPageId];

          return {
            project: {
              ...state.project,
              pages: {
                ...state.project.pages,
                [currentPage.id]: {
                  ...currentPage,
                  components: {},
                  rootId: null,
                  updatedAt: Date.now(),
                },
              },
              updatedAt: Date.now(),
            },
            selectedId: null,
            selectedIds: [],
            hoveredId: null,
          };
        });
      },

      toggleOutlineMode: () => {
        set(state => ({ outlineMode: !state.outlineMode }));
      },

      // Clipboard operations
      copyComponent: () => {
        const state = get();
        if (!state.selectedId) return;

        const components = state.getComponents();
        const component = components[state.selectedId];

        if (component) {
          // Deep clone the component
          set({ clipboard: JSON.parse(JSON.stringify(component)) });
        }
      },

      cutComponent: () => {
        const state = get();
        if (!state.selectedId) return;

        const components = state.getComponents();
        const component = components[state.selectedId];

        if (component) {
          // Copy to clipboard
          set({ clipboard: JSON.parse(JSON.stringify(component)) });
          // Remove the component
          state.removeComponent(state.selectedId);
        }
      },

      pasteComponent: (parentId: string | null = null) => {
        const state = get();
        if (!state.clipboard || !state.project || !state.project.currentPageId)
          return;

        const currentPage = state.project.pages[state.project.currentPageId];
        const components = { ...currentPage.components };

        // Deep clone the clipboard component and assign new IDs
        const cloneComponentWithNewIds = (
          comp: BuilderComponent,
          newParentId: string | null = null,
        ): BuilderComponent => {
          const newId = generateId();
          const clonedChildren = comp.children.map(child =>
            cloneComponentWithNewIds(child, newId),
          );

          const newComponent: BuilderComponent = {
            ...comp,
            id: newId,
            parentId: newParentId,
            children: clonedChildren,
          };

          components[newId] = newComponent;
          return newComponent;
        };

        const newComponent = cloneComponentWithNewIds(
          state.clipboard,
          parentId,
        );

        // Apply flex stretch to children of root or Container components
        if (parentId) {
          const parent = components[parentId];
          const isRootContainer = parentId === currentPage.rootId;
          const isContainerComponent = parent?.type === 'Container';

          if (isRootContainer || isContainerComponent) {
            newComponent.styles = {
              ...newComponent.styles,
              flex: '1',
            };
            components[newComponent.id] = newComponent;
          }
        }

        // If adding to a parent, update parent's children
        if (parentId && components[parentId]) {
          components[parentId] = {
            ...components[parentId],
            children: [...components[parentId].children, newComponent],
          };
        }

        // If no parent specified and no root exists, make this the root
        const rootId =
          currentPage.rootId ||
          (!parentId ? newComponent.id : currentPage.rootId);

        // Sync tree after pasting
        const syncedComponents = syncComponentTree(components, rootId);
        Object.keys(components).forEach(compId => {
          if (syncedComponents[compId]) {
            components[compId] = syncedComponents[compId];
          }
        });

        set({
          project: {
            ...state.project,
            pages: {
              ...state.project.pages,
              [currentPage.id]: {
                ...currentPage,
                components,
                rootId,
                updatedAt: Date.now(),
              },
            },
            updatedAt: Date.now(),
          },
          selectedId: newComponent.id,
        });
      },

      // History operations
      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      undo: () => {
        const state = get();
        if (!state.canUndo() || !state.project || !state.project.currentPageId)
          return;

        const newIndex = state.historyIndex - 1;
        const previousPage = state.history[newIndex];

        set({
          project: {
            ...state.project,
            pages: {
              ...state.project.pages,
              [state.project.currentPageId]: previousPage,
            },
          },
          historyIndex: newIndex,
          selectedId: null,
          selectedIds: [],
        });
      },

      redo: () => {
        const state = get();
        if (!state.canRedo() || !state.project || !state.project.currentPageId)
          return;

        const newIndex = state.historyIndex + 1;
        const nextPage = state.history[newIndex];

        set({
          project: {
            ...state.project,
            pages: {
              ...state.project.pages,
              [state.project.currentPageId]: nextPage,
            },
          },
          historyIndex: newIndex,
          selectedId: null,
          selectedIds: [],
        });
      },

      addToRecentProjects: (project: Project) => {
        set(state => {
          const existing = state.recentProjects.find(p => p.id === project.id);

          let updatedRecents: RecentProject[];
          if (existing) {
            // Update existing project
            updatedRecents = state.recentProjects.map(p =>
              p.id === project.id
                ? {
                    ...p,
                    name: project.name,
                    type: project.type,
                    description: project.description,
                    lastOpened: Date.now(),
                    openCount: p.openCount + 1,
                  }
                : p,
            );
          } else {
            // Add new project
            updatedRecents = [
              ...state.recentProjects,
              {
                id: project.id,
                name: project.name,
                type: project.type,
                description: project.description,
                lastOpened: Date.now(),
                openCount: 1,
                starred: false,
              },
            ];
          }

          // Keep only last 10 projects, sorted by last opened
          updatedRecents = updatedRecents
            .sort((a, b) => b.lastOpened - a.lastOpened)
            .slice(0, 10);

          return { recentProjects: updatedRecents };
        });
      },

      getStarredProjects: () => {
        const state = get();
        // Return only starred projects, sorted by last opened
        return [...state.recentProjects]
          .filter(p => p.starred)
          .sort((a, b) => b.lastOpened - a.lastOpened);
      },

      toggleStarProject: (projectId: string) => {
        set(state => {
          const updatedRecents = state.recentProjects.map(p =>
            p.id === projectId ? { ...p, starred: !p.starred } : p,
          );
          return { recentProjects: updatedRecents };
        });
      },
    }),
    {
      name: 'applab-project-storage',
      partialize: state => ({
        project: state.project,
        recentProjects: state.recentProjects,
      }),
    },
  ),
);
