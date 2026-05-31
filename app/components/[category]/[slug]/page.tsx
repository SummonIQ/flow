'use client';

import { ComponentChat } from '@/components/components/component-chat';
import { Tag, TagList } from '@/components/ui/tag';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Report,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@summoniq/applab-ui';
import { Check, ChevronLeft, Copy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ComponentData {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  type: string;
  code: string;
  sourceCode?: string;
  demoCode?: string;
  documentation?: string;
  props?: any;
  tags: string[];
}

interface ComponentPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Preview Section Component
function PreviewSection({
  code,
  sourceCode,
  componentType,
  componentSlug,
  componentCategory,
  documentation,
}: {
  code: string;
  sourceCode?: string;
  componentType: string;
  componentSlug: string;
  componentCategory: string;
  documentation?: string;
}) {
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [activeVariant, setActiveVariant] = useState('default');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = sourceCode || code;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse variants from documentation if available
  const variants = documentation
    ?.match(/(?:##\s*Variants|Variants)\s*\n([\s\S]*?)(?=\n##|\n#|$)/i)?.[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.includes(':'))
    .map(line => {
      const match = line.match(/[*-]\s*`?(\w+)`?:?/);
      return match ? match[1].toLowerCase() : null;
    })
    .filter((v): v is string => Boolean(v)) || ['default'];

  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              Interactive demonstration of the component
            </CardDescription>
          </div>
          <div className="flex rounded-md border overflow-hidden">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                activeView === 'preview'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveView('code')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                activeView === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              Code
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        {activeView === 'preview' ? (
          <div className="space-y-4">
            {/* Preview area with tabs at bottom */}
            <div className="rounded-lg border bg-muted/30 min-h-[200px] flex flex-col">
              {/* Preview content */}
              <div className="flex-1 p-6 flex items-center justify-center">
                <ComponentPreviewRenderer
                  slug={componentSlug}
                  category={componentCategory}
                  type={componentType}
                  variant={activeVariant}
                />
              </div>

              {/* Variant tabs - at bottom edge with border-t aligned to container */}
              {variants.length > 1 && (
                <div className="flex gap-1 px-4 py-2 border-t">
                  {variants.map(variant => (
                    <button
                      key={variant}
                      onClick={() => setActiveVariant(variant)}
                      className={`px-2 py-1 text-xs font-medium transition-colors border-t-2 -mt-px ${
                        activeVariant === variant
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border max-h-[400px] overflow-y-auto relative">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors z-10"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <SyntaxHighlighter
              language="tsx"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 0, padding: '1rem' }}
            >
              {sourceCode || code}
            </SyntaxHighlighter>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component preview renderer - uses slug to determine what to render
function ComponentPreviewRenderer({
  slug,
  category,
  type,
  variant,
}: {
  slug: string;
  category: string;
  type: string;
  variant: string;
}) {
  // Form components
  if (slug === 'button') {
    return (
      <div className="flex gap-2 flex-wrap">
        <button className="px-4 py-2 rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90">
          Default
        </button>
        <button className="px-4 py-2 rounded-md font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80">
          Secondary
        </button>
        <button className="px-4 py-2 rounded-md font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          Outline
        </button>
      </div>
    );
  }

  if (slug === 'input') {
    return (
      <div className="space-y-2 max-w-sm">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="name@example.com"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (slug === 'checkbox') {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="preview-checkbox"
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="preview-checkbox" className="text-sm font-medium">
          Accept terms and conditions
        </label>
      </div>
    );
  }

  if (slug === 'select') {
    return (
      <div className="space-y-2 max-w-sm">
        <label className="text-sm font-medium">Select an option</label>
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Select option...</option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </div>
    );
  }

  if (slug === 'switch') {
    return (
      <div className="flex items-center space-x-2">
        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
          <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
        </button>
        <label className="text-sm font-medium">Enabled</label>
      </div>
    );
  }

  if (slug === 'textarea') {
    return (
      <div className="space-y-2 max-w-sm">
        <label className="text-sm font-medium">Message</label>
        <textarea
          placeholder="Type your message here..."
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (slug === 'label') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Email Address</label>
        <p className="text-xs text-muted-foreground">
          Labels provide accessible text for form inputs
        </p>
      </div>
    );
  }

  // Display components
  if (slug === 'badge') {
    return (
      <div className="flex gap-2 flex-wrap">
        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
          Default
        </span>
        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
          Secondary
        </span>
        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
          Outline
        </span>
      </div>
    );
  }

  if (slug === 'fancy-badge') {
    return (
      <div className="flex gap-2 flex-wrap">
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Premium
        </span>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          New
        </span>
      </div>
    );
  }

  if (slug === 'avatar') {
    return (
      <div className="flex gap-4 items-center">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-sm font-medium">JD</span>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-sm font-medium text-primary-foreground">
            AB
          </span>
        </div>
      </div>
    );
  }

  if (slug === 'card') {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 max-w-sm">
        <h3 className="font-semibold mb-2">Card Title</h3>
        <p className="text-sm text-muted-foreground">
          This is an example card component with a title and description.
        </p>
      </div>
    );
  }

  // Navigation components
  if (slug === 'tabs') {
    return (
      <div className="w-full max-w-md">
        <div className="flex gap-2 border-b">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
            Tab 1
          </button>
          <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Tab 2
          </button>
          <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Tab 3
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm">Content for Tab 1</p>
        </div>
      </div>
    );
  }

  if (slug === 'breadcrumb') {
    return (
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Home
            </a>
          </li>
          <li className="text-muted-foreground">/</li>
          <li>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Components
            </a>
          </li>
          <li className="text-muted-foreground">/</li>
          <li className="text-foreground font-medium">Breadcrumb</li>
        </ol>
      </nav>
    );
  }

  // Layout components
  if (slug === 'modal') {
    return (
      <div className="rounded-lg border bg-card p-6 max-w-sm shadow-lg">
        <h3 className="font-semibold mb-2">Modal Title</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This is a modal dialog preview.
        </p>
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted">
            Cancel
          </button>
          <button className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground">
            Confirm
          </button>
        </div>
      </div>
    );
  }

  if (slug === 'popover') {
    return (
      <div className="relative inline-block">
        <button className="px-4 py-2 rounded-md border bg-background hover:bg-muted">
          Open Popover
        </button>
        <div className="absolute top-full left-0 mt-2 p-4 rounded-lg border bg-card shadow-lg min-w-[200px]">
          <p className="text-sm">Popover content goes here</p>
        </div>
      </div>
    );
  }

  if (slug === 'dropdown-menu') {
    return (
      <div className="relative inline-block">
        <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground">
          Open Menu
        </button>
        <div className="absolute top-full left-0 mt-2 py-1 rounded-lg border bg-card shadow-lg min-w-[160px]">
          <div className="px-3 py-2 text-sm hover:bg-muted cursor-pointer">
            Item 1
          </div>
          <div className="px-3 py-2 text-sm hover:bg-muted cursor-pointer">
            Item 2
          </div>
          <div className="px-3 py-2 text-sm hover:bg-muted cursor-pointer">
            Item 3
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'collapsible') {
    return (
      <div className="border rounded-lg max-w-sm">
        <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium hover:bg-muted">
          Toggle Content
          <span>▼</span>
        </button>
        <div className="px-4 py-3 border-t text-sm text-muted-foreground">
          Collapsible content is visible
        </div>
      </div>
    );
  }

  if (slug === 'separator') {
    return (
      <div className="space-y-4 max-w-sm">
        <p className="text-sm">Content above</p>
        <div className="h-px bg-border" />
        <p className="text-sm">Content below</p>
      </div>
    );
  }

  // Container components
  if (slug === 'glass') {
    return (
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 max-w-sm">
        <h3 className="font-semibold mb-2">Glass Container</h3>
        <p className="text-sm text-muted-foreground">
          Content with glassmorphism effect
        </p>
      </div>
    );
  }

  // Data components
  if (slug === 'table') {
    const rows = [
      { name: 'Project A', status: 'Active' },
      { name: 'Project B', status: 'Pending' },
    ];
    return (
      <div className="border rounded-lg overflow-hidden max-w-md">
        <Report
          className="h-auto border-0 rounded-none shadow-none"
          data={rows}
          definition={{
            columns: [
              { header: 'Name', key: 'name' },
              { header: 'Status', key: 'status' },
            ],
            data: rows,
            view: 'table' as any,
            sortBy: 'name',
            activeFilters: [],
            filters: [],
          }}
          search={false}
        />
      </div>
    );
  }

  if (slug === 'metadata-list') {
    return (
      <div className="space-y-2 max-w-sm text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Created</span>
          <span>Jan 15, 2024</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span>Active</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Version</span>
          <span>1.0.0</span>
        </div>
      </div>
    );
  }

  // Theme components
  if (slug === 'theme-toggle') {
    return (
      <div className="flex gap-2">
        <button className="p-2 rounded-md border hover:bg-muted" title="Light">
          ☀️
        </button>
        <button
          className="p-2 rounded-md border bg-primary text-primary-foreground"
          title="Dark"
        >
          🌙
        </button>
      </div>
    );
  }

  // For everything else, show a nice message
  return (
    <div className="text-center py-8 space-y-2">
      <p className="text-muted-foreground text-sm">
        Preview not available for this component.
      </p>
      <p className="text-xs text-muted-foreground">
        Switch to the "Code" tab to see the implementation.
      </p>
    </div>
  );
}

export default function ComponentPage({ params }: ComponentPageProps) {
  // Unwrap params using React.use()
  const { category, slug } = use(params);
  const router = useRouter();

  const [component, setComponent] = useState<ComponentData | null>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const componentChatType: 'component' | 'background' = 'component';
  const propRows = component?.props
    ? Object.entries(component.props).map(([key, value]: [string, any]) => ({
        prop: key,
        type: value.type,
        defaultValue: JSON.stringify(value.default),
        description: value.description || '-',
      }))
    : [];

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    router.push(`/components/${category}`);
  };

  // Calculate number of tabs dynamically
  const getTabCount = () => {
    if (!component) return 3;
    let count = 3; // Overview, Usage, AI & Revisions are always present
    if (component.props && Object.keys(component.props).length > 0) count++;
    return count;
  };

  const fetchComponent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/components/by-slug/${slug}`);

      if (!response.ok) {
        throw new Error('Component not found');
      }

      const data = await response.json();
      setComponent(data);
      setCurrentCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load component');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading component...</p>
        </div>
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Component Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'The requested component could not be found.'}
          </p>
          <Link href="/components" className="text-primary hover:underline">
            ← Back to Components
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">
                {component.name}
              </h1>
              <Tag tag={component.type} />
              <TagList tags={component.tags} />
            </div>
            <p className="text-muted-foreground mt-2">
              {component.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back to {category}
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          {component.props && Object.keys(component.props).length > 0 && (
            <TabsTrigger value="props">Props</TabsTrigger>
          )}
          <TabsTrigger value="revisions">AI & Revisions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <PreviewSection
            code={currentCode}
            sourceCode={component.sourceCode}
            componentType={component.type}
            componentSlug={component.slug}
            componentCategory={component.category}
            documentation={component.documentation}
          />
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle>Usage</CardTitle>
              <CardDescription>
                How to import and use this component in your project
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <SyntaxHighlighter
                language="tsx"
                style={vscDarkPlus}
                customStyle={{ borderRadius: '0.5rem' }}
              >
                {component.code}
              </SyntaxHighlighter>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Props Tab */}
        {component.props && Object.keys(component.props).length > 0 && (
          <TabsContent value="props" className="mt-6">
            <Card>
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle>Props</CardTitle>
                <CardDescription>
                  Available configuration options and properties
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="overflow-x-auto">
                  <Report
                    className="h-auto border-0 rounded-none shadow-none"
                    data={propRows}
                    definition={{
                      columns: [
                        { header: 'Prop', key: 'prop' },
                        { header: 'Type', key: 'type' },
                        { header: 'Default', key: 'defaultValue' },
                        { header: 'Description', key: 'description' },
                      ],
                      data: propRows,
                      view: 'table' as any,
                      sortBy: 'prop',
                      activeFilters: [],
                      filters: [],
                    }}
                    search={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* AI & Revisions Tab */}
        <TabsContent value="revisions" className="mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">
                AI Assistant & Revision History
              </h3>
              <p className="text-muted-foreground mt-1">
                Use AI to modify and experiment with this{' '}
                {component.type.toLowerCase()}. All changes are tracked and can
                be reverted.
              </p>
            </div>

            <ComponentChat
              componentId={component.id}
              componentCode={currentCode}
              componentType={componentChatType}
              onRevisionAccepted={revision => {
                setCurrentCode(revision.code);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
