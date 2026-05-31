import type * as React from 'react';

interface ElectronResponse {
  error?: string;
  success: boolean;
  editor?: string;
  pid?: number;
  message?: string;
  needsInstall?: boolean;
  workingDir?: string;
  needsScaffold?: boolean;
  configPath?: string;
}

interface ProjectSaveResponse {
  success: boolean;
  filePath?: string;
  canceled?: boolean;
  error?: string;
}

interface ProjectLoadResponse {
  success: boolean;
  data?: string;
  error?: string;
}

interface ProjectExportResponse {
  success: boolean;
  code?: string;
  error?: string;
}

interface StudioReadResponse {
  success: boolean;
  data?: string | null;
  error?: string;
}

interface StudioWriteResponse {
  success: boolean;
  path?: string;
  error?: string;
}

interface StudioWritePageResponse {
  success: boolean;
  path?: string;
  error?: string;
}

type RuntimeAppConfig = import('./config').AppConfig & {
  path?: string;
};

type RuntimeProjectConfig = import('./config').ProjectConfig & {
  path?: string;
  apps?: RuntimeAppConfig[];
};

export interface ElectronAPI {
  applications: {
    getAll: () => Promise<unknown[]>;
    launch: (
      projectPath: string,
      appKey: string,
      script?: string,
      appPath?: string | null,
      devPort?: number | null,
    ) => Promise<ElectronResponse>;
    stop: (
      projectPath: string,
      appKey: string,
      appPath?: string | null,
      devPort?: number | null,
    ) => Promise<ElectronResponse>;
    checkPort: (port: number) => Promise<{
      listening: boolean;
      pid: number | null;
      command: string | null;
    }>;
    onAppLog?: (
      callback: (data: {
        appId: string;
        text: string;
        type: 'stdout' | 'stderr';
        projectId: string;
      }) => void,
    ) => () => void;
    onCriticalError?: (
      callback: (data: {
        appId: string;
        error: string;
        suggestion: string;
        command: string | null;
        projectPath: string;
      }) => void,
    ) => () => void;
    onStatusChange?: (
      callback: (data: {
        appId: string;
        status: 'crashed' | 'stopped';
        exitCode: number | null;
        signal?: string;
        message?: string;
        projectPath: string;
      }) => void,
    ) => () => void;
    openFolder: (projectPath: string) => Promise<ElectronResponse>;
    openInEditor: (projectPath: string) => Promise<ElectronResponse>;
    openInWindsurf: (filePath: string) => Promise<ElectronResponse>;
    openTerminal: (projectPath: string) => Promise<ElectronResponse>;
    installDeps: (workingDir: string) => Promise<ElectronResponse>;
  };
  projects: {
    getAll: () => Promise<RuntimeProjectConfig[]>;
    getBasePath: () => Promise<{ path: string; display: string }>;
  };
  window: {
    close: () => void;
    minimize: () => void;
    maximize: () => void;
  };
  project: {
    save: (projectData: {
      projectData: string;
      fileName: string;
      isNew?: boolean;
    }) => Promise<ProjectSaveResponse>;
    load: (projectPath: string) => Promise<ProjectLoadResponse>;
    exportCode: (componentTree: unknown) => Promise<ProjectExportResponse>;
  };
  menu: {
    onAction: (callback: (action: string) => void) => () => void;
  };
  studio: {
    readDesign: (payload: {
      projectPath: string;
      appPath?: string | null;
    }) => Promise<StudioReadResponse>;
    readPage: (payload: {
      projectPath: string;
      appPath?: string | null;
      route: string;
    }) => Promise<StudioReadResponse & { path?: string }>;
    writeDesign: (payload: {
      projectPath: string;
      appPath?: string | null;
      data: string;
    }) => Promise<StudioWriteResponse>;
    writePage: (payload: {
      projectPath: string;
      appPath?: string | null;
      route: string;
      code: string;
    }) => Promise<StudioWritePageResponse>;
  };
  webview: {
    getPreloadPath: () => Promise<string | null>;
  };
  upwork: {
    getCredentials: () => Promise<{ username: string; password: string }>;
  };
  send: (channel: string, data?: unknown) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (
    channel: string,
    callback: (...args: unknown[]) => void,
  ) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        partition?: string;
        preload?: string;
        allowpopups?: boolean;
        useragent?: string;
      };
    }
  }

  interface Window {
    electron: ElectronAPI;
  }
}

export {};
