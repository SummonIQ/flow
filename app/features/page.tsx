'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import { Button } from '@summoniq/applab-ui';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Clock,
  CloudUpload,
  Code2,
  CreditCard,
  Database,
  FileText,
  Flag,
  Globe,
  HardDrive,
  Languages,
  Loader2,
  Lock,
  Mail,
  PlusCircle,
  Search,
  Shield,
  Sparkles,
  TestTube,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { FeatureFormModal } from './components/feature-form-modal';

interface FeatureDefinition {
  id: string;
  feature: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  tags: string[];
  docsUrl?: string | null;
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
  'hard-drive': HardDrive,
  clock: Clock,
  flag: Flag,
  'file-text': FileText,
  shield: Shield,
  'test-tube': TestTube,
  'book-open': BookOpen,
  search: Search,
  bell: Bell,
  languages: Languages,
  globe: Globe,
  'code-2': Code2,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-950',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    text: 'text-purple-600 dark:text-purple-400',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-950',
    text: 'text-pink-600 dark:text-pink-400',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-950',
    text: 'text-orange-600 dark:text-orange-400',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-600 dark:text-red-400',
  },
};

const tagColorMap: Record<string, string> = {
  indigo:
    'bg-indigo-500/10 text-indigo-600 border-t-indigo-500/30 border-b-indigo-500/5 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-t-indigo-400/35 dark:border-b-indigo-400/10',
  blue: 'bg-blue-500/10 text-blue-600 border-t-blue-500/30 border-b-blue-500/5 dark:bg-blue-500/15 dark:text-blue-300 dark:border-t-blue-400/35 dark:border-b-blue-400/10',
  green:
    'bg-green-500/10 text-green-600 border-t-green-500/30 border-b-green-500/5 dark:bg-green-500/15 dark:text-green-300 dark:border-t-green-400/35 dark:border-b-green-400/10',
  purple:
    'bg-purple-500/10 text-purple-600 border-t-purple-500/30 border-b-purple-500/5 dark:bg-purple-500/15 dark:text-purple-300 dark:border-t-purple-400/35 dark:border-b-purple-400/10',
  pink: 'bg-pink-500/10 text-pink-600 border-t-pink-500/30 border-b-pink-500/5 dark:bg-pink-500/15 dark:text-pink-300 dark:border-t-pink-400/35 dark:border-b-pink-400/10',
  yellow:
    'bg-yellow-500/10 text-yellow-700 border-t-yellow-500/30 border-b-yellow-500/5 dark:bg-yellow-500/15 dark:text-yellow-200 dark:border-t-yellow-400/35 dark:border-b-yellow-400/10',
  cyan: 'bg-cyan-500/10 text-cyan-600 border-t-cyan-500/30 border-b-cyan-500/5 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-t-cyan-400/35 dark:border-b-cyan-400/10',
  orange:
    'bg-orange-500/10 text-orange-600 border-t-orange-500/30 border-b-orange-500/5 dark:bg-orange-500/15 dark:text-orange-300 dark:border-t-orange-400/35 dark:border-b-orange-400/10',
  red: 'bg-red-500/10 text-red-600 border-t-red-500/30 border-b-red-500/5 dark:bg-red-500/15 dark:text-red-300 dark:border-t-red-400/35 dark:border-b-red-400/10',
};

export default function FeaturesPage() {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] =
    useState<FeatureDefinition | null>(null);

  useEffect(() => {
    async function fetchFeatures() {
      try {
        const response = await fetch('/api/features');
        if (!response.ok) {
          throw new Error('Failed to fetch features');
        }
        const data = await response.json();
        setFeatures(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load features',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeatures();
  }, []);

  const handleSaveFeature = useCallback(async (data: any) => {
    const isEditing = !!data.id;
    const url = isEditing
      ? `/api/features/${data.feature.toLowerCase()}`
      : '/api/features/create';
    const method = isEditing ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save feature');
    }

    const refreshResponse = await fetch('/api/features');
    const refreshedData = await refreshResponse.json();
    setFeatures(refreshedData);
    setEditingFeature(null);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingFeature(null);
    setIsModalOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <Page className="h-full">
      <PageHeader
        title="Features"
        description="Add powerful features and integrations to your projects"
        actions={
          <Button
            onClick={openAddModal}
            variant="outline"
            size="sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Feature
          </Button>
        }
      />

      <FeatureFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        feature={editingFeature}
        onSave={handleSaveFeature}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => {
            const IconComponent =
              iconMap[feature.icon || 'sparkles'] || Sparkles;
            const colors =
              colorMap[feature.color || 'indigo'] || colorMap.indigo;
            const tagStyles =
              tagColorMap[feature.color || 'indigo'] || tagColorMap.indigo;

            return (
              <Link
                key={feature.id}
                href={`/features/${feature.feature.toLowerCase()}`}
                className="group relative block rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-md hover:ring-1 hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-md ${colors.bg}`}>
                      <IconComponent className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                      {feature.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-[10px] font-semibold uppercase tracking-wide text-primary opacity-0 translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0"
                      aria-label={`Deploy ${feature.name}`}
                    >
                      Deploy
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {feature.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {feature.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className={`text-xs px-2.5 py-1 rounded-md border-t border-b border-l-0 border-r-0 ${tagStyles}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        {features.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No features found. Try syncing features from the database.</p>
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  await fetch('/api/features', { method: 'POST' });
                  const response = await fetch('/api/features');
                  const data = await response.json();
                  setFeatures(data);
                } catch (err) {
                  setError('Failed to sync features');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Sync Features
            </button>
          </div>
        )}
      </div>
    </Page>
  );
}
