'use client';

import {
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import {
  Brain,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Memory {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string | null;
  importance: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-gray-500/10 text-gray-500',
  ARCHITECTURE: 'bg-blue-500/10 text-blue-500',
  CODEBASE: 'bg-purple-500/10 text-purple-500',
  DEPENDENCIES: 'bg-orange-500/10 text-orange-500',
  CONFIGURATION: 'bg-cyan-500/10 text-cyan-500',
  DEBUGGING: 'bg-red-500/10 text-red-500',
  PREFERENCES: 'bg-pink-500/10 text-pink-500',
  WORKFLOW: 'bg-green-500/10 text-green-500',
  API: 'bg-yellow-500/10 text-yellow-500',
  DATABASE: 'bg-indigo-500/10 text-indigo-500',
};

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  ARCHITECTURE: 'Architecture',
  CODEBASE: 'Codebase',
  DEPENDENCIES: 'Dependencies',
  CONFIGURATION: 'Configuration',
  DEBUGGING: 'Debugging',
  PREFERENCES: 'Preferences',
  WORKFLOW: 'Workflow',
  API: 'API',
  DATABASE: 'Database',
};

export default function MemoriesPage() {
  const params = useParams<{ name: string }>();
  const projectName = params?.name;

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    if (projectName) {
      fetchMemories();
    }
  }, [projectName]);

  async function fetchMemories() {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName!)}/memories`,
      );
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMemory(id: string) {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName!)}/memories/${id}`,
        { method: 'DELETE' },
      );
      if (response.ok) {
        setMemories(prev => prev.filter(m => m.id !== id));
        toast.success('Memory deleted');
      }
    } catch (error) {
      toast.error('Failed to delete memory');
    }
  }

  async function toggleMemoryActive(id: string, isActive: boolean) {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName!)}/memories/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !isActive }),
        },
      );
      if (response.ok) {
        setMemories(prev =>
          prev.map(m => (m.id === id ? { ...m, isActive: !isActive } : m)),
        );
        toast.success(isActive ? 'Memory archived' : 'Memory restored');
      }
    } catch (error) {
      toast.error('Failed to update memory');
    }
  }

  const filteredMemories = memories.filter(memory => {
    if (!showInactive && !memory.isActive) return false;
    if (selectedCategory && memory.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        memory.title.toLowerCase().includes(query) ||
        memory.content.toLowerCase().includes(query) ||
        memory.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const categoryCounts = memories.reduce(
    (acc, memory) => {
      if (memory.isActive || showInactive) {
        acc[memory.category] = (acc[memory.category] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-500" />
            Project Memories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-learned knowledge and context about this project
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Memory
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Select
          value={selectedCategory || 'all'}
          onValueChange={value =>
            setSelectedCategory(value === 'all' ? null : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label} ({categoryCounts[value] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Checkbox
          checked={showInactive}
          onCheckedChange={checked => setShowInactive(checked)}
          label="Show archived"
          size="w-5 h-5"
          className="text-sm text-muted-foreground"
        />
      </div>

      {/* Memories List */}
      {filteredMemories.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No memories yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            As AI agents work on this project, they'll learn and store important
            context, patterns, and decisions here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMemories.map(memory => (
            <div
              key={memory.id}
              className={`bg-card border border-border rounded-lg p-4 transition-opacity ${
                !memory.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        CATEGORY_COLORS[memory.category] ||
                        CATEGORY_COLORS.GENERAL
                      }`}
                    >
                      {CATEGORY_LABELS[memory.category] || memory.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < Math.ceil(memory.importance / 2)
                              ? 'bg-violet-500'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    {!memory.isActive && (
                      <span className="text-xs text-muted-foreground">
                        (archived)
                      </span>
                    )}
                  </div>

                  <h3 className="font-medium text-sm mb-1">{memory.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {memory.content}
                  </p>

                  {memory.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      {memory.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-xs bg-secondary rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {memory.source && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Source:{' '}
                      <code className="px-1 bg-muted rounded">
                        {memory.source}
                      </code>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleMemoryActive(memory.id, memory.isActive)
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {memory.isActive ? 'Archive' : 'Restore'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMemory(memory.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {memories.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>{memories.filter(m => m.isActive).length} active memories</span>
          <span>{memories.filter(m => !m.isActive).length} archived</span>
          <span>{Object.keys(categoryCounts).length} categories</span>
        </div>
      )}
    </div>
  );
}
