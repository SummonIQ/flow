'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CloudUpload,
  CreditCard,
  Database,
  ExternalLink,
  FileCode,
  Info,
  Loader2,
  Lock,
  Mail,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { FeatureChangesTab } from './components/feature-changes-tab';
import { FeatureSettingsTab } from './components/feature-settings-tab';

interface FeatureChange {
  file: string;
  action: 'create' | 'modify' | 'append';
  description: string;
  content: string;
}

interface FeatureSettings {
  [key: string]: {
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
    label: string;
    options?: string[];
    default: unknown;
  };
}

interface FeatureProvider {
  name: string;
  description: string;
  docsUrl: string;
}

interface FeatureDefinition {
  id: string;
  feature: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  tags: string[];
  providers: Record<string, FeatureProvider>;
  changes: FeatureChange[];
  settings: FeatureSettings | null;
  dependencies: string[];
  docsUrl: string | null;
  isActive: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lock: Lock,
  database: Database,
  'credit-card': CreditCard,
  mail: Mail,
  'bar-chart': BarChart3,
  'cloud-upload': CloudUpload,
  sparkles: Sparkles,
  zap: Zap,
  'alert-triangle': AlertTriangle,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-950',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-950',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-950',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
};

type TabType = 'overview' | 'changes' | 'settings';

interface PageProps {
  params: Promise<{ feature: string }>;
}

export default function FeatureDetailPage({ params }: PageProps) {
  const { feature: featureParam } = use(params);
  const [featureData, setFeatureData] = useState<FeatureDefinition | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchFeature() {
      try {
        const response = await fetch(`/api/features/${featureParam}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Feature not found');
          }
          throw new Error('Failed to fetch feature');
        }
        const data = await response.json();
        setFeatureData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feature');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeature();
  }, [featureParam]);

  const handleSaveChanges = async (updatedChanges: FeatureChange[]) => {
    if (!featureData) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/features/${featureParam}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: updatedChanges }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const updated = await response.json();
      setFeatureData(updated);
    } catch (err) {
      console.error('Failed to save changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (updatedSettings: FeatureSettings) => {
    if (!featureData) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/features/${featureParam}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updatedSettings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updated = await response.json();
      setFeatureData(updated);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !featureData) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          {error || 'Feature not found'}
        </div>
        <Link
          href="/features"
          className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Features
        </Link>
      </div>
    );
  }

  const IconComponent = iconMap[featureData.icon || 'sparkles'] || Sparkles;
  const colors = colorMap[featureData.color || 'indigo'] || colorMap.indigo;

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'changes', label: 'Changes', icon: FileCode },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <span className={`p-3 rounded-lg ${colors.bg}`}>
              <IconComponent className={`w-8 h-8 ${colors.text}`} />
            </span>
            <span className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight">
                {featureData.name}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                {featureData.description}
              </span>
            </span>
          </span>
        }
        actions={
          featureData.docsUrl ? (
            <a
              href={featureData.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted"
            >
              <ExternalLink className="w-4 h-4" />
              Documentation
            </a>
          ) : null
        }
      >
        <div className="space-y-4">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Features
          </Link>

          <div className="flex flex-wrap gap-2">
            {featureData.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto space-y-6">
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex gap-6">
              {tabs.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Providers */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Available Providers
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(featureData.providers).map(
                      ([key, provider]) => (
                        <div key={key} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{provider.name}</h3>
                            {provider.docsUrl && (
                              <a
                                href={provider.docsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Docs →
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {provider.description}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                {/* Dependencies */}
                {featureData.dependencies.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4">Dependencies</h2>
                    <div className="flex flex-wrap gap-2">
                      {featureData.dependencies.map(dep => (
                        <Link
                          key={dep}
                          href={`/features/${dep.toLowerCase()}`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm border rounded-full hover:bg-muted"
                        >
                          {dep.replace(/_/g, ' ')}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Quick Stats */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Integration Summary
                  </h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold">
                        {featureData.changes.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        File Changes
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold">
                        {Object.keys(featureData.providers).length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Providers
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold">
                        {featureData.settings
                          ? Object.keys(featureData.settings).length
                          : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Settings
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'changes' && (
              <FeatureChangesTab
                changes={featureData.changes}
                onSave={handleSaveChanges}
                isSaving={isSaving}
                color={featureData.color || 'indigo'}
              />
            )}

            {activeTab === 'settings' && (
              <FeatureSettingsTab
                settings={featureData.settings}
                onSave={handleSaveSettings}
                isSaving={isSaving}
              />
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
