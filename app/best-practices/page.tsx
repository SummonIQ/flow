'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  markdownToPlate,
  plateToMarkdown } from '@/lib/markdown-converter';
import { Badge,
  Button,
} from '@summoniq/applab-ui';
import {
  AlertCircle,
  CheckCircle2,
  Code,
  FileText,
  Lightbulb,
  Save,
  Search,
  Shield,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Value } from 'platejs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SimplePlateEditor = dynamic(
  () => import('@/components/editor').then(mod => mod.SimplePlateEditor),
  { ssr: false },
);

type AppType =
  | 'web-app'
  | 'desktop'
  | 'mobile-app'
  | 'api'
  | 'marketing-site'
  | 'library'
  | 'monorepo'
  | 'cli'
  | 'extension'
  | 'custom';

interface BestPractice {
  id: string;
  name: string;
  topic: string;
  appType: AppType;
  content: string;
  description?: string;
  tags: string[];
  priority: number;
  isDefault: boolean;
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
    description: 'Express, Fastify, NestJS',
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
  { value: 'web-app', label: 'Web Application', description: 'Next.js, React' },
  // Disabled - sorted alphabetically
  {
    value: 'cli',
    label: 'CLI Tool',
    description: 'Command-line applications',
    disabled: true,
  },
  {
    value: 'custom',
    label: 'Custom Project',
    description: 'Other project types',
    disabled: true,
  },
  {
    value: 'extension',
    label: 'Extension',
    description: 'Browser/VS Code extensions',
    disabled: true,
  },
  {
    value: 'library',
    label: 'Library / Package',
    description: 'NPM packages, libraries',
    disabled: true,
  },
  {
    value: 'monorepo',
    label: 'Monorepo',
    description: 'Turborepo, Nx workspaces',
    disabled: true,
  },
];

const topicIcons: Record<string, any> = {
  'Code Style': Code,
  Security: Shield,
  Performance: Zap,
  Testing: CheckCircle2,
  Architecture: FileText,
  'Best Practices': Lightbulb,
  'Error Handling': AlertCircle,
};

export default function BestPracticesPage() {
  const [activeAppType, setActiveAppType] = useState<AppType>('web-app');
  const [selectedTopic, setSelectedTopic] = useState<string>('Code Style');
  const [searchQuery, setSearchQuery] = useState('');
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<BestPractice | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorValue, setEditorValue] = useState<Value>([
    { type: 'p', children: [{ text: '' }] },
  ]);

  const [collapsedColumns, setCollapsedColumns] = useState({
    appTypes: false,
    topics: false,
    practices: false,
  });

  useEffect(() => {
    loadPractices();
  }, []);

  useEffect(() => {
    if (selectedPractice) {
      // Convert markdown content to Plate value
      const plateValue = markdownToPlate(selectedPractice.content);
      setEditorValue(plateValue);
    }
  }, [selectedPractice]);

  async function loadPractices() {
    try {
      setLoading(true);
      const response = await fetch('/api/best-practices');
      if (response.ok) {
        const data = await response.json();
        setPractices(data);
      }
    } catch (error) {
      console.error('Failed to load best practices:', error);
      toast.error('Failed to load best practices');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedPractice) return;

    setSaving(true);
    try {
      // Convert Plate value to markdown before saving
      const markdownContent = plateToMarkdown(editorValue);

      const response = await fetch(
        `/api/best-practices/${selectedPractice.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: markdownContent }),
        },
      );

      if (response.ok) {
        const updated = await response.json();
        setPractices(practices.map(p => (p.id === updated.id ? updated : p)));
        setSelectedPractice(updated);
        toast.success('Best practice saved successfully');
      } else {
        toast.error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  }

  const filteredPractices = practices.filter(
    p => p.appType === activeAppType && p.topic === selectedTopic,
  );

  const topics = Array.from(
    new Set(
      practices.filter(p => p.appType === activeAppType).map(p => p.topic),
    ),
  ).sort();

  const getTopicIcon = (topic: string) => {
    return topicIcons[topic] || FileText;
  };

  return (
    <Page className="h-full bg-background">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Best Practices &amp; Patterns
          </span>
        }
        description="Define coding standards, patterns, and guidelines for your projects"
        actions={
          <Button
            onClick={handleSave}
            disabled={!selectedPractice || saving}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* App Types Column */}
        <div
          className={`border-r border-border flex flex-col bg-muted/20 transition-all duration-300 ${
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
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                App Types
              </span>
            </button>
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Application Type
                </h2>
              </div>
              <nav className="flex-1 overflow-auto p-2">
                {appTypeOptions.map(option => {
                  const isActive = activeAppType === option.value;
                  const count = practices.filter(
                    p => p.appType === option.value,
                  ).length;

                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (!option.disabled) {
                          setActiveAppType(option.value);
                          setCollapsedColumns({
                            ...collapsedColumns,
                            topics: false,
                          });
                        }
                      }}
                      disabled={option.disabled}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-md mb-1 transition-all text-left ${
                        option.disabled ? 'opacity-40 cursor-not-allowed' : ''
                      } ${
                        isActive
                          ? 'bg-accent text-accent-foreground shadow-sm'
                          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap ${isActive ? '' : 'text-foreground'}`}
                        >
                          {option.label}
                          {option.disabled && (
                            <span className="ml-2 text-xs opacity-50">
                              (Coming Soon)
                            </span>
                          )}
                        </div>
                        <div className="text-xs mt-0.5 opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
                          {option.description}
                        </div>
                        {count > 0 && !option.disabled && (
                          <div className="text-xs mt-1 opacity-60 overflow-hidden text-ellipsis whitespace-nowrap">
                            {count} practices
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

        {/* Topics Column */}
        <div
          className={`border-r border-border flex flex-col bg-muted/20 transition-all duration-300 ${
            collapsedColumns.topics ? 'w-12' : 'w-64'
          }`}
        >
          {collapsedColumns.topics ? (
            <button
              onClick={() =>
                setCollapsedColumns({ ...collapsedColumns, topics: false })
              }
              className="h-full flex items-center justify-center hover:bg-accent transition-colors p-2"
              title="Expand Topics"
            >
              <span
                className="text-sm font-semibold text-muted-foreground"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                Topics
              </span>
            </button>
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Topics & Patterns
                </h2>
              </div>
              <nav className="flex-1 overflow-auto p-2">
                {topics.map(topic => {
                  const TopicIcon = getTopicIcon(topic);
                  const isActive = selectedTopic === topic;
                  const count = practices.filter(
                    p => p.appType === activeAppType && p.topic === topic,
                  ).length;

                  return (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedTopic(topic);
                        setCollapsedColumns({
                          ...collapsedColumns,
                          appTypes: true,
                        });
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-all text-left ${
                        isActive
                          ? 'bg-accent text-accent-foreground shadow-sm'
                          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <TopicIcon className="w-4 h-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                          {topic}
                        </div>
                        {count > 0 && (
                          <div className="text-xs opacity-60 overflow-hidden text-ellipsis whitespace-nowrap">
                            {count} items
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

        {/* Practices List */}
        <div className="w-80 border-r border-border flex flex-col bg-muted/10">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search practices..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {filteredPractices.map(practice => {
              const isActive = selectedPractice?.id === practice.id;

              return (
                <button
                  key={practice.id}
                  onClick={() => {
                    setSelectedPractice(practice);
                    setCollapsedColumns({
                      appTypes: true,
                      topics: true,
                      practices: false,
                    });
                  }}
                  className={`w-full px-3 py-3 rounded-md mb-2 text-left transition-all ${
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="font-medium text-sm mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {practice.name}
                  </div>
                  {practice.description && (
                    <div className="text-xs text-muted-foreground mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      {practice.description}
                    </div>
                  )}
                  {practice.tags.length > 0 && (
                    <div className="flex gap-1 overflow-hidden">
                      {practice.tags.slice(0, 3).map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs px-1.5 py-0 shrink-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
            {filteredPractices.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  No practices found for this combination
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {selectedPractice ? (
            <>
              <div className="border-b border-border p-4">
                <h2 className="text-lg font-semibold">
                  {selectedPractice.name}
                </h2>
                {selectedPractice.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPractice.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedPractice.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <SimplePlateEditor
                  key={selectedPractice.id}
                  value={editorValue}
                  onChange={setEditorValue}
                  placeholder="Write your best practices, patterns, and guidelines here..."
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-4">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No Practice Selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select a best practice from the list to view and edit its
                  content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
