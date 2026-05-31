'use client';

import { ComponentChat } from '@/components/components/component-chat';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@summoniq/ui';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
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
  demoCode?: string;
  documentation?: string;
  props?: any;
  tags: string[];
}

// Tag color mapping - subtle with opacity and borders
const tagColors: Record<string, string> = {
  forms:
    'bg-blue-500/10 text-blue-600/90 border-t-blue-500/15 border-b-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400/90',
  interactive:
    'bg-blue-500/10 text-blue-600/90 border-t-blue-500/15 border-b-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400/90',
  button:
    'bg-blue-500/10 text-blue-600/90 border-t-blue-500/15 border-b-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400/90',
  input:
    'bg-blue-500/10 text-blue-600/90 border-t-blue-500/15 border-b-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400/90',
  text: 'bg-blue-500/10 text-blue-600/90 border-t-blue-500/15 border-b-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400/90',
  display:
    'bg-purple-500/10 text-purple-600/90 border-t-purple-500/15 border-b-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400/90',
  badge:
    'bg-purple-500/10 text-purple-600/90 border-t-purple-500/15 border-b-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400/90',
  status:
    'bg-purple-500/10 text-purple-600/90 border-t-purple-500/15 border-b-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400/90',
  animated:
    'bg-pink-500/10 text-pink-600/90 border-t-pink-500/15 border-b-pink-500/20 dark:bg-pink-500/15 dark:text-pink-400/90',
  layout:
    'bg-orange-500/10 text-orange-600/90 border-t-orange-500/15 border-b-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400/90',
  modal:
    'bg-orange-500/10 text-orange-600/90 border-t-orange-500/15 border-b-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400/90',
  dialog:
    'bg-orange-500/10 text-orange-600/90 border-t-orange-500/15 border-b-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400/90',
  overlay:
    'bg-orange-500/10 text-orange-600/90 border-t-orange-500/15 border-b-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400/90',
  popover:
    'bg-orange-500/10 text-orange-600/90 border-t-orange-500/15 border-b-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400/90',
  navigation:
    'bg-teal-500/10 text-teal-600/90 border-t-teal-500/15 border-b-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400/90',
  tabs: 'bg-teal-500/10 text-teal-600/90 border-t-teal-500/15 border-b-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400/90',
  container:
    'bg-cyan-500/10 text-cyan-600/90 border-t-cyan-500/15 border-b-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-400/90',
  card: 'bg-cyan-500/10 text-cyan-600/90 border-t-cyan-500/15 border-b-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-400/90',
  data: 'bg-green-500/10 text-green-600/90 border-t-green-500/15 border-b-green-500/20 dark:bg-green-500/15 dark:text-green-400/90',
  table:
    'bg-green-500/10 text-green-600/90 border-t-green-500/15 border-b-green-500/20 dark:bg-green-500/15 dark:text-green-400/90',
  theme:
    'bg-violet-500/10 text-violet-600/90 border-t-violet-500/15 border-b-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400/90',
  media:
    'bg-rose-500/10 text-rose-600/90 border-t-rose-500/15 border-b-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400/90',
  backgrounds:
    'bg-indigo-500/10 text-indigo-600/90 border-t-indigo-500/15 border-b-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400/90',
  canvas:
    'bg-amber-500/10 text-amber-600/90 border-t-amber-500/15 border-b-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400/90',
  gradient:
    'bg-fuchsia-500/10 text-fuchsia-600/90 border-t-fuchsia-500/15 border-b-fuchsia-500/20 dark:bg-fuchsia-500/15 dark:text-fuchsia-400/90',
  css: 'bg-sky-500/10 text-sky-600/90 border-t-sky-500/15 border-b-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400/90',
  space:
    'bg-indigo-500/10 text-indigo-600/90 border-t-indigo-500/15 border-b-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400/90',
  organic:
    'bg-lime-500/10 text-lime-600/90 border-t-lime-500/15 border-b-lime-500/20 dark:bg-lime-500/15 dark:text-lime-400/90',
  waves:
    'bg-teal-500/10 text-teal-600/90 border-t-teal-500/15 border-b-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400/90',
};

function getTagColor(tag: string): string {
  return (
    tagColors[tag.toLowerCase()] ||
    'bg-slate-500/10 text-slate-600/90 border-t-slate-500/15 border-b-slate-500/20 dark:bg-slate-500/15 dark:text-slate-400/90'
  );
}

function capitalizeTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1);
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
  componentType,
  componentSlug,
  componentCategory,
  documentation,
}: {
  code: string;
  componentType: string;
  componentSlug: string;
  componentCategory: string;
  documentation?: string;
}) {
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [activeVariant, setActiveVariant] = useState('default');

  // Parse variants from documentation if available
  const variants = documentation
    ?.match(/(?:##\s*Variants|Variants)\s*\n([\s\S]*?)(?=\n##|\n#|$)/i)?.[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.includes(':'))
    .map(line => {
      const match = line.match(/[*-]\s*`?(\w+)`?:?/);
      return match ? match[1].toLowerCase() : null;
    })
    .filter(Boolean) || ['default'];

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
          <div className="rounded-lg overflow-hidden border max-h-[400px] overflow-y-auto">
            <SyntaxHighlighter
              language="tsx"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 0, padding: '1rem' }}
            >
              {code}
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
  // Background components - show small preview with link to full preview
  if (category === 'backgrounds') {
    const previewStyles: Record<string, string> = {
      'gradient-mesh':
        'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
      particles: 'bg-gradient-to-br from-slate-900 to-slate-800',
      'wave-lines': 'bg-gradient-to-b from-indigo-950 to-black',
      aurora: 'bg-gradient-to-tr from-green-400 via-blue-500 to-purple-600',
      'matrix-rain': 'bg-black',
      starfield: 'bg-black',
      'liquid-blob': 'bg-gradient-to-br from-cyan-500 to-blue-600',
      'neural-network': 'bg-gradient-to-br from-slate-900 to-slate-800',
      holographic: 'bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500',
    };

    return (
      <div className="w-full space-y-3">
        <div
          className={`w-full h-40 rounded-lg ${previewStyles[slug] || 'bg-gradient-to-br from-gray-800 to-gray-900'} flex items-center justify-center`}
        >
          <span className="text-white/50 text-sm">Animated Preview</span>
        </div>
        <div className="flex justify-center">
          <Link
            href={`/components/backgrounds/preview/${slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
