'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@summoniq/applab-ui';
import {
  Bot,
  Download,
  FileCode,
  FileText,
  FolderOpen,
  Plus,
  Save,
  Search,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SchemaFormGenerator } from './components/schema-form-generator';
import { configSchemas } from './schemas';

type ConfigType =
  // Tool Configurations
  | 'eslint'
  | 'nextjs'
  | 'typescript'
  | 'tailwind'
  | 'prettier'
  | 'babel'
  | 'expo'
  | 'tsconfig'
  | 'package-json'
  // AI Assistant Configurations
  | 'windsurf-rules'
  | 'agents-md'
  | 'claude-md'
  | 'cursor-rules'
  // IDE & Project Configurations
  | 'vscode'
  | 'applab-config'
  | 'components-json';

type AppType =
  | 'web-app' // Next.js, React, Vue, etc.
  | 'desktop' // Electron, Tauri
  | 'mobile-app' // React Native, Expo
  | 'api' // Express, Fastify, etc.
  | 'marketing-site' // Marketing websites
  | 'library' // NPM packages, component libraries
  | 'monorepo' // Turborepo, Nx
  | 'cli' // Command-line tools
  | 'extension' // Browser extensions, VS Code extensions
  | 'custom';

interface SharedConfig {
  id: string;
  name: string;
  type: ConfigType;
  appType?: AppType;
  description?: string;
  content: string;
  tags: string[];
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const configTypeLabels: Record<
  ConfigType,
  { label: string; icon: any; description: string }
> = {
  // Tool Configurations
  eslint: {
    label: 'ESLint',
    icon: FileCode,
    description: 'Linting rules and code quality standards',
  },
  nextjs: {
    label: 'Next.js Config',
    icon: FileCode,
    description: 'Next.js configuration and settings',
  },
  typescript: {
    label: 'TypeScript',
    icon: FileCode,
    description: 'TypeScript compiler options and settings',
  },
  tailwind: {
    label: 'Tailwind CSS',
    icon: FileCode,
    description: 'Tailwind configuration and custom styles',
  },
  prettier: {
    label: 'Prettier',
    icon: FileCode,
    description: 'Code formatting rules',
  },
  babel: {
    label: 'Babel Config',
    icon: FileCode,
    description:
      'Babel transpiler configuration for React Native and modern JS',
  },
  expo: {
    label: 'Expo Config (app.json)',
    icon: FileCode,
    description: 'Expo app configuration and build settings',
  },
  tsconfig: {
    label: 'tsconfig.json',
    icon: FileCode,
    description: 'TypeScript configuration file',
  },
  'package-json': {
    label: 'package.json',
    icon: FileCode,
    description: 'Package scripts and dependencies',
  },
  // AI Assistant Configurations
  'windsurf-rules': {
    label: 'Windsurf Rules',
    icon: Wand2,
    description: 'IDE rules and coding guidelines for Windsurf',
  },
  'agents-md': {
    label: 'AGENTS.md',
    icon: Bot,
    description: 'Agent configuration and behavior definitions',
  },
  'claude-md': {
    label: 'CLAUDE.md',
    icon: FileText,
    description: 'Claude-specific instructions and context',
  },
  'cursor-rules': {
    label: 'Cursor Rules',
    icon: FileCode,
    description: 'Cursor IDE rules and preferences',
  },
  // IDE & Project Configurations
  vscode: {
    label: 'VS Code Settings',
    icon: FileCode,
    description: 'VS Code workspace and extension settings',
  },
  'applab-config': {
    label: 'SummonIQ Config',
    icon: FileCode,
    description: 'SummonIQ project configuration file',
  },
  'components-json': {
    label: 'components.json',
    icon: FileCode,
    description: 'Component library configuration (shadcn/ui)',
  },
};

// File extension to config type mapping for smart suggestions
const fileExtensionConfigMap: Record<string, ConfigType[]> = {
  // React/JSX files
  tsx: [
    'nextjs',
    'typescript',
    'babel',
    'eslint',
    'prettier',
    'tailwind',
    'tsconfig',
  ],
  jsx: ['nextjs', 'babel', 'eslint', 'prettier', 'tailwind'],
  // TypeScript files
  ts: ['typescript', 'eslint', 'prettier', 'tsconfig', 'nextjs'],
  // JavaScript files
  js: ['babel', 'eslint', 'prettier', 'nextjs'],
  mjs: ['eslint', 'prettier'],
  cjs: ['eslint', 'prettier'],
  // Styles
  css: ['tailwind', 'prettier'],
  scss: ['tailwind', 'prettier'],
  sass: ['tailwind', 'prettier'],
  // Config files
  json: [
    'expo',
    'package-json',
    'tsconfig',
    'components-json',
    'vscode',
    'prettier',
    'eslint',
  ],
  // AI Assistant files
  md: ['agents-md', 'claude-md', 'windsurf-rules', 'cursor-rules'],
};

// Get relevant config types based on file extension
function getRelevantConfigTypes(filename?: string): ConfigType[] {
  if (!filename) return [];

  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return [];

  return fileExtensionConfigMap[ext] || [];
}

// Config types that are relevant for specific app types
const appTypeConfigFilter: Record<AppType, ConfigType[]> = {
  'web-app': [
    'eslint',
    'prettier',
    'typescript',
    'tailwind',
    'nextjs',
    'tsconfig',
    'package-json',
    'vscode',
    'components-json',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  desktop: [
    'eslint',
    'prettier',
    'typescript',
    'tailwind',
    'nextjs',
    'tsconfig',
    'package-json',
    'vscode',
    'components-json',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  'mobile-app': [
    'eslint',
    'prettier',
    'typescript',
    'babel',
    'expo',
    'tsconfig',
    'package-json',
    'vscode',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  api: [
    'eslint',
    'prettier',
    'typescript',
    'tsconfig',
    'package-json',
    'vscode',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  'marketing-site': [
    'eslint',
    'prettier',
    'typescript',
    'tailwind',
    'nextjs',
    'tsconfig',
    'package-json',
    'vscode',
    'components-json',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  library: [
    'eslint',
    'prettier',
    'typescript',
    'tsconfig',
    'package-json',
    'vscode',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  monorepo: [
    'eslint',
    'prettier',
    'typescript',
    'tailwind',
    'nextjs',
    'tsconfig',
    'package-json',
    'vscode',
    'components-json',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  cli: [
    'eslint',
    'prettier',
    'typescript',
    'tsconfig',
    'package-json',
    'vscode',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  extension: [
    'eslint',
    'prettier',
    'typescript',
    'tsconfig',
    'package-json',
    'vscode',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
  custom: [
    'eslint',
    'prettier',
    'typescript',
    'tailwind',
    'nextjs',
    'babel',
    'expo',
    'tsconfig',
    'package-json',
    'vscode',
    'components-json',
    'windsurf-rules',
    'agents-md',
    'claude-md',
    'cursor-rules',
    'applab-config',
  ],
};

// Filter config types by app type
function getConfigTypesForAppType(appType: AppType): ConfigType[] {
  return (
    appTypeConfigFilter[appType] ||
    (Object.keys(configTypeLabels) as ConfigType[])
  );
}

const appTypeOptions: {
  value: AppType;
  label: string;
  description: string;
  disabled?: boolean;
}[] = [
  // Enabled - sorted alphabetically
  {
    value: 'api',
    label: 'API / Backend',
    description: 'Express, Fastify, NestJS, etc.',
  },
  {
    value: 'desktop',
    label: 'Desktop Application',
    description: 'Electron, Tauri',
  },
  {
    value: 'marketing-site',
    label: 'Marketing Site',
    description: 'Landing pages, marketing websites',
  },
  {
    value: 'mobile-app',
    label: 'Mobile Application',
    description: 'React Native, Expo',
  },
  {
    value: 'web-app',
    label: 'Web Application',
    description: 'Next.js, React, Vue, Angular, etc.',
  },
  // Disabled - sorted alphabetically
  {
    value: 'cli',
    label: 'CLI Tool',
    description: 'Command-line applications',
    disabled: true,
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Custom project type',
    disabled: true,
  },
  {
    value: 'extension',
    label: 'Extension',
    description: 'Browser or IDE extensions',
    disabled: true,
  },
  {
    value: 'library',
    label: 'Library / Package',
    description: 'NPM packages, component libraries',
    disabled: true,
  },
  {
    value: 'monorepo',
    label: 'Monorepo',
    description: 'Turborepo, Nx workspaces',
    disabled: true,
  },
];

export default function ConfigurationPage() {
  const [activeAppType, setActiveAppType] = useState<AppType>('mobile-app');
  const [selectedConfigType, setSelectedConfigType] =
    useState<ConfigType>('eslint');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<SharedConfig | null>(
    null,
  );
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProjectPath, setSelectedProjectPath] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [activeFilename, setActiveFilename] = useState<string>('');

  const [configs, setConfigs] = useState<SharedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedColumns, setCollapsedColumns] = useState<{
    appTypes: boolean;
    configTypes: boolean;
    configsList: boolean;
  }>({
    appTypes: false,
    configTypes: false,
    configsList: false,
  });

  // Detect active file for smart suggestions
  useEffect(() => {
    // Try to get active file from Electron context
    const updateActiveFile = () => {
      if (typeof window !== 'undefined' && (window as any).electron) {
        (window as any).electron
          .getActiveFile?.()
          .then((filename: string) => {
            if (filename) {
              setActiveFilename(filename);
            }
          })
          .catch(() => {
            // Fallback: check if we're on a page with file context
            const pathParts = window.location.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart.includes('.')) {
              setActiveFilename(lastPart);
            }
          });
      } else {
        // Fallback for web mode: use URL or default
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart.includes('.')) {
          setActiveFilename(lastPart);
        } else {
          // Default to .tsx for demo purposes
          setActiveFilename('page.tsx');
        }
      }
    };

    updateActiveFile();

    // Listen for active file changes if available
    if (
      typeof window !== 'undefined' &&
      (window as any).electron?.onActiveFileChange
    ) {
      const unsubscribe = (window as any).electron.onActiveFileChange(
        (filename: string) => {
          setActiveFilename(filename);
        },
      );
      return unsubscribe;
    }
  }, []);

  // Fetch configs from API
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shared-configs');
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(
            `Failed to fetch configs: ${response.status} - ${errorText}`,
          );
        }
        const data = await response.json();
        setConfigs(data);
      } catch (error) {
        console.error('Error fetching shared configs:', error);
        // Set empty array to prevent UI errors
        setConfigs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const filteredConfigs = configs.filter(
    config =>
      config.appType === activeAppType &&
      config.type === selectedConfigType &&
      (config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.tags.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )),
  );

  const handleCreateNew = () => {
    const newConfig: SharedConfig = {
      id: `new-${Date.now()}`,
      name: `New ${configTypeLabels[selectedConfigType].label} Configuration`,
      description: '',
      type: selectedConfigType,
      appType: activeAppType,
      content: '{}',
      tags: [],
      isDefault: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedConfig(newConfig);
  };

  const handleSave = async () => {
    if (!selectedConfig) return;

    try {
      const isNew = !configs.find(c => c.id === selectedConfig.id);
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch('/api/shared-configs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const savedConfig = await response.json();

      if (isNew) {
        setConfigs([...configs, savedConfig]);
      } else {
        setConfigs(
          configs.map(c => (c.id === savedConfig.id ? savedConfig : c)),
        );
      }

      setSelectedConfig(savedConfig);
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shared-configs?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      setConfigs(configs.filter(c => c.id !== id));
      if (selectedConfig?.id === id) {
        setSelectedConfig(null);
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      alert('Failed to delete configuration. Please try again.');
    }
  };

  const handleExport = (config: SharedConfig) => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${config.name.replace(/\s+/g, '-').toLowerCase()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleApplyToProject = async () => {
    if (!selectedConfig || !selectedProjectPath) return;

    setIsApplying(true);
    try {
      const response = await fetch('/api/shared-configs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configId: selectedConfig.id,
          projectPath: selectedProjectPath,
          content: selectedConfig.content,
          configType: selectedConfig.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply configuration');
      }

      const result = await response.json();
      alert(`Configuration applied successfully to ${result.targetPath}`);
      setShowApplyModal(false);
      setSelectedProjectPath('');
    } catch (error) {
      console.error('Error applying configuration:', error);
      alert('Failed to apply configuration. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Helper to parse configuration content
  const parseConfigContent = (content: string): Record<string, any> => {
    try {
      return content ? JSON.parse(content) : {};
    } catch {
      return {};
    }
  };

  const currentAppType = appTypeOptions.find(
    opt => opt.value === activeAppType,
  );
  const configTypeInfo = configTypeLabels[selectedConfigType];
  const Icon = configTypeInfo.icon;

  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <FileCode className="w-8 h-8" />
            Shared Configuration
          </span>
        }
        description="Manage reusable configuration templates for different app types and tools"
        actions={
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            New Configuration
          </Button>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* App Types Navigation */}
          <div
            className={`border-r border-border flex flex-col bg-muted/20 transition-all duration-300 ease-in-out ${
              collapsedColumns.appTypes ? 'w-12' : 'w-64'
            }`}
          >
            {collapsedColumns.appTypes ? (
              <button
                onClick={() =>
                  setCollapsedColumns({ ...collapsedColumns, appTypes: false })
                }
                className="h-full flex items-center justify-center hover:bg-accent transition-colors p-2"
                title="Expand Application Types"
              >
                <span
                  className="text-sm font-semibold text-muted-foreground"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  App Types
                </span>
              </button>
            ) : (
              <>
                <div className="p-4 border-b border-border transition-opacity duration-200">
                  <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Application Types
                  </h2>
                </div>
                <nav className="flex-1 overflow-auto p-2 transition-opacity duration-200">
                  {appTypeOptions.map(appType => {
                    const isActive = activeAppType === appType.value;
                    const configsCount = configs.filter(
                      c => c.appType === appType.value,
                    ).length;
                    return (
                      <button
                        key={appType.value}
                        onClick={() => {
                          if (!appType.disabled) {
                            setActiveAppType(appType.value);
                            setSelectedConfig(null);
                          }
                        }}
                        disabled={appType.disabled}
                        className={`w-full flex items-start gap-3 px-3 py-3 rounded-md mb-1 transition-all duration-200 ease-in-out text-left ${
                          appType.disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'transform hover:scale-[1.02]'
                        } ${
                          isActive
                            ? 'bg-accent text-accent-foreground shadow-sm'
                            : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-sm transition-all duration-150 overflow-hidden text-ellipsis whitespace-nowrap ${isActive ? '' : 'text-foreground'}`}
                          >
                            {appType.label}
                            {appType.disabled && (
                              <span className="ml-2 text-xs opacity-50">
                                (Coming Soon)
                              </span>
                            )}
                          </div>
                          <div className="text-xs mt-0.5 opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
                            {appType.description}
                          </div>
                          {configsCount > 0 && !appType.disabled && (
                            <div className="text-xs mt-1 opacity-60 overflow-hidden text-ellipsis whitespace-nowrap">
                              {configsCount} config
                              {configsCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </>
            )}
          </div>

          {/* Configuration Types List */}
          <div
            className={`border-r border-border flex flex-col bg-muted/20 transition-all duration-300 ease-in-out ${
              collapsedColumns.configTypes ? 'w-12' : 'w-64'
            }`}
          >
            {collapsedColumns.configTypes ? (
              <button
                onClick={() =>
                  setCollapsedColumns({
                    ...collapsedColumns,
                    configTypes: false,
                  })
                }
                className="h-full flex items-center justify-center hover:bg-accent transition-colors p-2"
                title="Expand Configuration Types"
              >
                <span
                  className="text-sm font-semibold text-muted-foreground"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  Config Types
                </span>
              </button>
            ) : (
              <>
                <div className="p-4 border-b border-border transition-opacity duration-200">
                  <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Configuration Types
                  </h2>
                </div>
                <nav className="flex-1 overflow-auto p-2 transition-opacity duration-200">
                  {(() => {
                    // Get relevant config types based on active file
                    const relevantTypes =
                      getRelevantConfigTypes(activeFilename);
                    const ext = activeFilename.split('.').pop()?.toLowerCase();

                    // Filter config types by app type
                    const allowedConfigTypes =
                      getConfigTypesForAppType(activeAppType);

                    // Filter and sort entries: only show configs relevant to app type
                    const filteredEntries = Object.entries(
                      configTypeLabels,
                    ).filter(([key]) =>
                      allowedConfigTypes.includes(key as ConfigType),
                    );

                    const sortedEntries = filteredEntries.sort(
                      ([keyA, infoA], [keyB, infoB]) => {
                        const aRelevant = relevantTypes.includes(
                          keyA as ConfigType,
                        );
                        const bRelevant = relevantTypes.includes(
                          keyB as ConfigType,
                        );

                        if (aRelevant && !bRelevant) return -1;
                        if (!aRelevant && bRelevant) return 1;

                        // If both relevant, sort by priority in relevantTypes array
                        if (aRelevant && bRelevant) {
                          return (
                            relevantTypes.indexOf(keyA as ConfigType) -
                            relevantTypes.indexOf(keyB as ConfigType)
                          );
                        }

                        // If both non-relevant, sort alphabetically by label
                        return infoA.label.localeCompare(infoB.label);
                      },
                    );

                    return sortedEntries.map(([key, info]) => {
                      const NavIcon = info.icon;
                      const isActive = selectedConfigType === key;
                      const isSuggested = relevantTypes.includes(
                        key as ConfigType,
                      );
                      const configsCount = configs.filter(
                        c => c.type === key && c.appType === activeAppType,
                      ).length;

                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedConfigType(key as ConfigType);
                            setSelectedConfig(null);
                            setCollapsedColumns({
                              ...collapsedColumns,
                              appTypes: true,
                            });
                          }}
                          className={`w-full flex items-start gap-3 px-3 py-3 rounded-md mb-1 transition-all duration-200 ease-in-out text-left transform hover:scale-[1.02] ${
                            isActive
                              ? 'bg-accent text-accent-foreground shadow-sm'
                              : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                          } ${isSuggested ? 'ring-1 ring-primary/20' : ''}`}
                        >
                          <NavIcon
                            className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? '' : 'opacity-70'}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div
                                className={`font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap ${isActive ? '' : 'text-foreground'}`}
                              >
                                {info.label}
                              </div>
                              {isSuggested && ext && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                                >
                                  .{ext}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs mt-0.5 opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
                              {info.description}
                            </div>
                            {configsCount > 0 && (
                              <div className="text-xs mt-1 opacity-60 overflow-hidden text-ellipsis whitespace-nowrap">
                                {configsCount} config
                                {configsCount !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </nav>
              </>
            )}
          </div>

          {/* Configurations List */}
          <div
            className={`border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
              collapsedColumns.configsList ? 'w-12' : 'w-80'
            }`}
          >
            {collapsedColumns.configsList ? (
              <button
                onClick={() =>
                  setCollapsedColumns({
                    ...collapsedColumns,
                    configsList: false,
                  })
                }
                className="h-full flex items-center justify-center hover:bg-accent transition-colors p-2"
                title="Expand Configurations List"
              >
                <span
                  className="text-sm font-semibold text-muted-foreground"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  Configurations
                </span>
              </button>
            ) : (
              <>
                {/* Search - only show if more than 8 configs */}
                {configs.filter(
                  c =>
                    c.appType === activeAppType &&
                    c.type === selectedConfigType,
                ).length > 8 && (
                  <div className="p-3 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search configurations..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchQuery(e.target.value)
                        }
                        className="pl-8 h-9"
                      />
                    </div>
                  </div>
                )}

                {/* Config List */}
                <div className="flex-1 overflow-auto p-3 space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <p>Loading configurations...</p>
                    </div>
                  ) : filteredConfigs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Icon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No configurations found</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCreateNew}
                        className="mt-2"
                      >
                        Create your first {configTypeInfo.label}
                      </Button>
                    </div>
                  ) : (
                    filteredConfigs.map(config => (
                      <Card
                        key={config.id}
                        className={`cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-accent/50 ${
                          selectedConfig?.id === config.id
                            ? 'bg-accent shadow-md'
                            : ''
                        }`}
                        onClick={() => {
                          setSelectedConfig(config);
                          setCollapsedColumns({
                            appTypes: true,
                            configTypes: true,
                            configsList: false,
                          });
                        }}
                      >
                        <CardHeader className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-semibold truncate">
                                {config.name}
                              </CardTitle>
                              {config.appType && (
                                <Badge
                                  variant="secondary"
                                  className="mt-1 text-xs"
                                >
                                  {
                                    appTypeOptions.find(
                                      opt => opt.value === config.appType,
                                    )?.label
                                  }
                                </Badge>
                              )}
                            </div>
                            {config.isDefault && (
                              <Badge
                                variant="default"
                                className="text-xs shrink-0"
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                          {config.description && (
                            <CardDescription className="text-xs mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                              {config.description}
                            </CardDescription>
                          )}
                          <div className="flex items-center gap-1 mt-2 overflow-hidden">
                            {config.tags.slice(0, 3).map(tag => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Used in {config.usageCount} project
                            {config.usageCount !== 1 ? 's' : ''}
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {selectedConfig ? (
              <>
                {/* Editor Header */}
                <div className="border-b border-border p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="w-5 h-5" />
                      <h2 className="font-semibold text-lg">
                        {selectedConfig.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApplyModal(true)}
                        className="gap-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Apply to Project
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(selectedConfig)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                      <Button size="sm" onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(selectedConfig.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Editor Content - Tabbed Interface */}
                <Tabs defaultValue="configuration">
                  <TabsList className="mx-4 mt-4">
                    <TabsTrigger value="configuration">
                      Configuration
                    </TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="configuration"
                    className="flex-1 overflow-auto p-4 max-w-4xl mx-auto"
                  >
                    {configSchemas[selectedConfig.type] ? (
                      <SchemaFormGenerator
                        fields={configSchemas[selectedConfig.type].fields}
                        values={parseConfigContent(selectedConfig.content)}
                        onChange={values => {
                          setSelectedConfig({
                            ...selectedConfig,
                            content: JSON.stringify(values, null, 2),
                          });
                        }}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No schema available for {configTypeInfo.label}</p>
                          <p className="text-sm mt-2">
                            Use raw JSON editor below
                          </p>
                        </div>
                        <Textarea
                          value={selectedConfig.content}
                          onChange={e =>
                            setSelectedConfig({
                              ...selectedConfig,
                              content: e.target.value,
                            })
                          }
                          className="font-mono text-sm min-h-[400px]"
                          placeholder="Enter configuration as JSON..."
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="metadata"
                    className="flex-1 overflow-auto p-4 max-w-2xl mx-auto"
                  >
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="config-name">
                          Configuration Name *
                        </Label>
                        <Input
                          id="config-name"
                          value={selectedConfig.name}
                          onChange={e =>
                            setSelectedConfig({
                              ...selectedConfig,
                              name: e.target.value,
                            })
                          }
                          placeholder="My ESLint Configuration"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="config-description">Description</Label>
                        <Textarea
                          id="config-description"
                          value={selectedConfig.description || ''}
                          onChange={e =>
                            setSelectedConfig({
                              ...selectedConfig,
                              description: e.target.value,
                            })
                          }
                          placeholder="Brief description of this configuration"
                          className="mt-1 min-h-[100px]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="config-type">
                          Configuration Type *
                        </Label>
                        <Select
                          value={selectedConfig.type}
                          onValueChange={value =>
                            setSelectedConfig({
                              ...selectedConfig,
                              type: value as ConfigType,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(configTypeLabels).map(
                              ([key, info]) => (
                                <SelectItem key={key} value={key}>
                                  {info.label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="config-apptype">Application Type</Label>
                        <Select
                          value={selectedConfig.appType || ''}
                          onValueChange={value =>
                            setSelectedConfig({
                              ...selectedConfig,
                              appType: value as AppType | undefined,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="-- Select Application Type --" />
                          </SelectTrigger>
                          <SelectContent>
                            {appTypeOptions.map(opt => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                disabled={opt.disabled}
                              >
                                {opt.label}
                                {opt.disabled && (
                                  <span className="ml-2 text-xs opacity-50">
                                    (Coming Soon)
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional: Specify which type of application this
                          config is for
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="config-tags">
                          Tags (comma-separated)
                        </Label>
                        <Input
                          id="config-tags"
                          value={selectedConfig.tags.join(', ')}
                          onChange={e =>
                            setSelectedConfig({
                              ...selectedConfig,
                              tags: e.target.value
                                .split(',')
                                .map(t => t.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="nextjs, typescript, api"
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="config-default"
                          checked={selectedConfig.isDefault}
                          onChange={e =>
                            setSelectedConfig({
                              ...selectedConfig,
                              isDefault: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor="config-default"
                          className="cursor-pointer"
                        >
                          Set as default configuration
                        </Label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Usage Info */}
                <div className="border-t border-border p-4 bg-muted/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Used in {selectedConfig.usageCount} projects</span>
                      <span>•</span>
                      <span>
                        Updated{' '}
                        {new Date(
                          selectedConfig.updatedAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 h-auto py-1"
                    >
                      <FolderOpen className="w-3 h-3" />
                      View Projects
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Configuration Selected
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a configuration from the list or create a new one
                  </p>
                  <Button onClick={handleCreateNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New {configTypeInfo.label}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply to Project Modal */}
      <Modal open={showApplyModal} onOpenChange={setShowApplyModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Apply Configuration to Project</ModalTitle>
            <ModalDescription>
              Select the project directory where you want to apply this
              configuration.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-path">Project Path</Label>
              <Input
                id="project-path"
                value={selectedProjectPath}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedProjectPath(e.target.value)
                }
                placeholder="/path/to/your/project"
              />
              <p className="text-xs text-muted-foreground">
                Enter the full path to the project directory
              </p>
            </div>

            {selectedConfig && (
              <div className="space-y-2">
                <Label>Configuration Details</Label>
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedConfig.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {configTypeLabels[selectedConfig.type].label}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApplyModal(false);
                setSelectedProjectPath('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyToProject}
              disabled={!selectedProjectPath || isApplying}
            >
              {isApplying ? 'Applying...' : 'Apply Configuration'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Page>
  );
}
