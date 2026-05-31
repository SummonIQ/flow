'use client';

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import {
  BookOpen,
  Brain,
  Code,
  FilePlus,
  FileText,
  FolderSearch,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Value } from 'platejs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const PlateEditor = dynamic(
  () => import('@/components/editor').then(mod => mod.PlateEditor),
  { ssr: false },
);

type KnowledgeDoc = {
  id: string;
  title: string;
  content: string;
  type: string;
  category?: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

type SemanticSearchResult = {
  id: string;
  sourceType: string;
  sourceId: string;
  chunkIndex: number;
  contentText: string;
  score: number;
  metadata: Record<string, unknown>;
  source?: KnowledgeDoc | null;
};

interface DocumentationTabProps {
  project: {
    id?: string;
    name: string;
    description: string;
  };
}

export function DocumentationTab({ project }: DocumentationTabProps) {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState(false);
  const [semanticSearching, setSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [codebaseIndexing, setCodebaseIndexing] = useState(false);
  const [codebaseIndexStatus, setCodebaseIndexStatus] = useState<{
    totalEmbeddings: number;
    byCategory: Record<string, number>;
    lastUpdated: string | null;
    ragEnabled: boolean;
  } | null>(null);
  const [indexStatus, setIndexStatus] = useState<{
    hasDocumentation: boolean;
    lastIndexed: string | null;
    memoriesCount: number;
  } | null>(null);
  const [aiDocContent, setAiDocContent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'article',
    category: '',
    tags: '',
  });
  const [editorValue, setEditorValue] = useState<Value>([
    { type: 'h1', children: [{ text: 'Untitled Document' }] },
    { type: 'p', children: [{ text: '' }] },
  ]);

  useEffect(() => {
    loadDocumentation();
    loadIndexStatus();
    loadCodebaseIndexStatus();
    checkRagStatus();
  }, [project.id, project.name]);

  // Debounced semantic search
  useEffect(() => {
    if (!semanticSearchEnabled || !searchQuery.trim() || !ragEnabled) {
      setSemanticResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSemanticSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, semanticSearchEnabled, ragEnabled]);

  async function checkRagStatus() {
    try {
      const response = await fetch('/api/rag/status');
      if (response.ok) {
        const data = await response.json();
        setRagEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Failed to check RAG status:', error);
    }
  }

  async function loadCodebaseIndexStatus() {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/index-codebase`,
      );
      if (response.ok) {
        const data = await response.json();
        setCodebaseIndexStatus(data);
      }
    } catch (error) {
      console.error('Failed to load codebase index status:', error);
    }
  }

  async function handleCodebaseIndex() {
    setCodebaseIndexing(true);
    toast.loading('Indexing codebase into RAG...', { id: 'codebase-index' });

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/index-codebase`,
        { method: 'POST' },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Indexed ${data.result.indexed} files (${data.result.unchanged} unchanged)`,
          { id: 'codebase-index' },
        );
        loadCodebaseIndexStatus();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to index codebase', {
          id: 'codebase-index',
        });
      }
    } catch (error) {
      toast.error('Failed to index codebase', { id: 'codebase-index' });
    } finally {
      setCodebaseIndexing(false);
    }
  }

  async function performSemanticSearch(query: string) {
    if (!query.trim()) return;
    if (!project.id) {
      setSemanticResults([]);
      return;
    }

    setSemanticSearching(true);
    try {
      const response = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters: {
            sourceTypes: ['KNOWLEDGE_DOCUMENT', 'CODEBASE_FILE'],
            projectId: project.id,
          },
          limit: 10,
          includeContent: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSemanticResults(data.results || []);
      } else {
        const error = await response.json();
        const errorMessage = String(error.error ?? '');
        if (!errorMessage.includes('OPENAI_API_KEY')) {
          toast.error('Semantic search failed');
        }
        setSemanticResults([]);
      }
    } catch (error) {
      console.error('Semantic search error:', error);
      setSemanticResults([]);
    } finally {
      setSemanticSearching(false);
    }
  }

  async function loadIndexStatus() {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/index-files`,
      );
      if (response.ok) {
        const data = await response.json();
        setIndexStatus(data);
      }
    } catch (error) {
      console.error('Failed to load index status:', error);
    }
  }

  async function handleIndexProject() {
    setIndexing(true);
    toast.loading('Indexing project files and generating documentation...', {
      id: 'indexing',
    });

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/index-files`,
        {
          method: 'POST',
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Indexed ${data.index.totalFiles} files and created ${data.memoriesCreated} memories`,
          { id: 'indexing' },
        );
        loadDocumentation();
        loadIndexStatus();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to index project', {
          id: 'indexing',
        });
      }
    } catch (error) {
      toast.error('Failed to index project', { id: 'indexing' });
    } finally {
      setIndexing(false);
    }
  }

  async function loadDocumentation() {
    try {
      setLoading(true);
      if (!project.id) {
        setDocs([]);
        setSelectedDoc(null);
        return;
      }
      const response = await fetch(
        `/api/knowledge?projectId=${project.id}&status=published`,
      );
      if (response.ok) {
        const data = await response.json();
        setDocs(data);
      } else {
        toast.error('Failed to load documentation');
      }
    } catch (error) {
      console.error('Failed to load documentation:', error);
      toast.error('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDocument() {
    // Extract title from first line of editor
    const firstNode = editorValue[0] as
      | { children?: Array<{ text?: string }> }
      | undefined;
    const title = String(firstNode?.children?.[0]?.text || 'Untitled Document');

    if (!title.trim() || title.trim() === 'Untitled Document') {
      toast.error('Please enter a title in the first line');
      return;
    }
    if (!project.id) {
      toast.error('Project must be registered before creating documents');
      return;
    }

    try {
      setCreateLoading(true);
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: JSON.stringify(editorValue),
          type: formData.type,
          category: formData.category || undefined,
          tags,
          projectId: project.id,
          status: 'published',
        }),
      });

      if (response.ok) {
        toast.success('Document created successfully!');
        setShowCreateModal(false);
        setFormData({ title: '', type: 'article', category: '', tags: '' });
        setEditorValue([
          { type: 'h1', children: [{ text: 'Untitled Document' }] },
          { type: 'p', children: [{ text: '' }] },
        ]);
        loadDocumentation();
      } else {
        toast.error('Failed to create document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    } finally {
      setCreateLoading(false);
    }
  }

  const categories = [
    'all',
    ...Array.from(
      new Set(docs.map(d => d.category).filter(Boolean) as string[]),
    ),
  ];

  const filteredDocs = docs.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const docsByType = {
    article: filteredDocs.filter(d => d.type === 'article'),
    spec: filteredDocs.filter(d => d.type === 'spec'),
    guide: filteredDocs.filter(d => d.type === 'guide'),
    'api-doc': filteredDocs.filter(d => d.type === 'api-doc'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading documentation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Documentation</h2>
            <p className="text-sm text-muted-foreground">
              Knowledge base and technical documentation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleIndexProject}
            disabled={indexing}
            className="gap-2"
          >
            {indexing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderSearch className="w-4 h-4" />
            )}
            {indexing ? 'Indexing...' : 'Index & Generate'}
          </Button>
          {ragEnabled && (
            <Button
              variant="outline"
              onClick={handleCodebaseIndex}
              disabled={codebaseIndexing}
              className="gap-2"
              title={codebaseIndexStatus?.totalEmbeddings
                ? `${codebaseIndexStatus.totalEmbeddings} files indexed`
                : 'Index codebase for semantic search'}
            >
              {codebaseIndexing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Code className="w-4 h-4" />
              )}
              {codebaseIndexing ? 'RAG Indexing...' : 'RAG Index'}
              {codebaseIndexStatus?.totalEmbeddings ? (
                <span className="text-xs bg-violet-500/20 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded">
                  {codebaseIndexStatus.totalEmbeddings}
                </span>
              ) : null}
            </Button>
          )}
          <Button onClick={() => setShowCreateModal(true)}>
            <FilePlus className="w-4 h-4" />
            New Document
          </Button>
        </div>
      </div>

      {/* AI-Generated Documentation Card */}
      {indexStatus?.hasDocumentation && (
        <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Sparkles className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  AI-Generated Documentation
                  <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    Auto-updated
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {indexStatus.lastIndexed
                    ? `Last indexed: ${new Date(indexStatus.lastIndexed).toLocaleString()}`
                    : 'Generated from project analysis'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>{indexStatus.memoriesCount} memories</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleIndexProject}
                disabled={indexing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${indexing ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Click on "AI-Generated Project Documentation" below to view the full
            documentation, or click "Index & Generate" to refresh it.
          </p>
        </div>
      )}

      {/* No Documentation Yet */}
      {!indexStatus?.hasDocumentation && !loading && (
        <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
            <FolderSearch className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            Generate AI Documentation
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Index your project files and let AI analyze your codebase to
            generate comprehensive documentation and create memories.
          </p>
          <Button
            onClick={handleIndexProject}
            disabled={indexing}
            className="gap-2"
          >
            {indexing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {indexing
              ? 'Analyzing Project...'
              : 'Index Project & Generate Docs'}
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          {semanticSearching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          ) : semanticSearchEnabled ? (
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <Input
            placeholder={semanticSearchEnabled ? "Semantic search (AI-powered)..." : "Search documentation..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`pl-9 ${semanticSearchEnabled ? 'border-violet-500/50 focus-visible:ring-violet-500' : ''}`}
          />
        </div>
        <Button
          variant={semanticSearchEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSemanticSearchEnabled(!semanticSearchEnabled)}
          disabled={!ragEnabled}
          className={`gap-2 ${semanticSearchEnabled ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
          title={ragEnabled ? 'Toggle AI-powered semantic search' : 'RAG is not enabled'}
        >
          <Zap className="w-4 h-4" />
          {semanticSearchEnabled ? 'Semantic' : 'AI Search'}
        </Button>
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Semantic Search Results */}
      {semanticSearchEnabled && searchQuery.trim() && semanticResults.length > 0 && (
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
            <Zap className="w-4 h-4" />
            Semantic Search Results ({semanticResults.length})
          </div>
          <div className="space-y-2">
            {semanticResults.map((result) => {
              const doc = result.source as KnowledgeDoc | null;
              const isCodebaseFile = result.sourceType === 'CODEBASE_FILE';
              const metadata = result.metadata as { filePath?: string; filename?: string } | undefined;
              const title = isCodebaseFile
                ? metadata?.filePath || metadata?.filename || 'Unknown File'
                : doc?.title || 'Unknown Document';

              return (
                <button
                  key={result.id}
                  onClick={() => !isCodebaseFile && doc && setSelectedDoc(doc)}
                  className={`w-full text-left p-3 rounded-lg border border-violet-500/20 bg-background hover:bg-violet-500/10 transition-colors ${isCodebaseFile ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isCodebaseFile ? (
                          <Code className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        )}
                        <h4 className="font-medium truncate font-mono text-sm">
                          {title}
                        </h4>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isCodebaseFile ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-violet-500/20 text-violet-600 dark:text-violet-400'}`}>
                          {Math.round(result.score * 100)}% match
                        </span>
                        {isCodebaseFile && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            code
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 font-mono">
                        {result.contentText.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No semantic results message */}
      {semanticSearchEnabled && searchQuery.trim() && !semanticSearching && semanticResults.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          No semantic matches found. Try different search terms or disable AI search for text matching.
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles */}
        {docsByType.article.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Articles
            </h3>
            <div className="space-y-2">
              {docsByType.article.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {doc.content.substring(0, 100)}...
                      </p>
                      {doc.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {doc.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Specifications */}
        {docsByType.spec.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Specifications
            </h3>
            <div className="space-y-2">
              {docsByType.spec.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {doc.content.substring(0, 100)}...
                      </p>
                      {doc.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {doc.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guides */}
        {docsByType.guide.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Guides
            </h3>
            <div className="space-y-2">
              {docsByType.guide.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {doc.content.substring(0, 100)}...
                      </p>
                      {doc.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {doc.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* API Documentation */}
        {docsByType['api-doc'].length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              API Documentation
            </h3>
            <div className="space-y-2">
              {docsByType['api-doc'].map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {doc.content.substring(0, 100)}...
                      </p>
                      {doc.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {doc.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documentation found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first document'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateModal(true)}>
              <FilePlus className="w-4 h-4" />
              Create Document
            </Button>
          )}
        </div>
      )}

      {/* Create Document Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Create Documentation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="doc-type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="spec">Specification</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="api-doc">API Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="doc-category">Category (Optional)</Label>
                  <Input
                    id="doc-category"
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Backend"
                  />
                </div>

                <div>
                  <Label htmlFor="doc-tags">Tags (comma-separated)</Label>
                  <Input
                    id="doc-tags"
                    value={formData.tags}
                    onChange={e =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="e.g., api, rest, authentication"
                  />
                </div>
              </div>

              <div>
                <Label>Content</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  The first line will be used as the document title
                </p>
                <div>
                  <PlateEditor value={editorValue} onChange={setEditorValue} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDocument} disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Document'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">{selectedDoc.title}</h2>
              <Button variant="ghost" onClick={() => setSelectedDoc(null)}>
                Close
              </Button>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{selectedDoc.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
