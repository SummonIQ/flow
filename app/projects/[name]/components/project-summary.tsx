'use client';

import { Button } from '@summoniq/applab-ui';
import { Bot, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProjectSummaryProps {
  projectName: string;
}

// Simple markdown renderer for inline formatting
function renderMarkdownLine(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for bold (**text**)
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Check for inline code (`text`)
    const codeMatch = remaining.match(/`([^`]+)`/);

    // Find the earliest match
    const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
    const codeIndex = codeMatch ? remaining.indexOf(codeMatch[0]) : -1;

    let nextMatch: {
      index: number;
      match: RegExpMatchArray;
      type: 'bold' | 'code';
    } | null = null;

    if (boldIndex !== -1 && (codeIndex === -1 || boldIndex < codeIndex)) {
      nextMatch = { index: boldIndex, match: boldMatch!, type: 'bold' };
    } else if (codeIndex !== -1) {
      nextMatch = { index: codeIndex, match: codeMatch!, type: 'code' };
    }

    if (nextMatch) {
      // Add text before the match
      if (nextMatch.index > 0) {
        elements.push(
          <span key={key++}>{remaining.slice(0, nextMatch.index)}</span>,
        );
      }

      // Add the formatted element
      if (nextMatch.type === 'bold') {
        elements.push(
          <strong key={key++} className="font-semibold">
            {nextMatch.match[1]}
          </strong>,
        );
      } else {
        elements.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 rounded bg-secondary text-xs font-mono"
          >
            {nextMatch.match[1]}
          </code>,
        );
      }

      remaining = remaining.slice(nextMatch.index + nextMatch.match[0].length);
    } else {
      // No more matches, add remaining text
      elements.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return elements;
}

// Render markdown content with proper formatting
function MarkdownContent({
  content,
  skipHeaders = false,
}: {
  content: string;
  skipHeaders?: boolean;
}) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Skip markdown headers if we already have a section title (### Header)
        if (skipHeaders && /^#{1,3}\s/.test(trimmed)) {
          return null;
        }

        // Handle markdown headers (render as bold section titles)
        if (/^#{1,3}\s/.test(trimmed)) {
          const headerContent = trimmed.replace(/^#{1,3}\s*/, '');
          return (
            <h4
              key={i}
              className="text-sm font-semibold text-foreground mt-3 first:mt-0"
            >
              {headerContent}
            </h4>
          );
        }

        // Handle section titles (short lines starting with capital, possibly ending with colon)
        // Examples: "Tech Stack", "Architecture", "Key Features:", "Key Technical Decisions"
        const isSectionTitle =
          /^[A-Z][A-Za-z\s]+:?$/.test(trimmed) &&
          trimmed.length < 40 &&
          !trimmed.includes('-') &&
          !trimmed.includes('•');

        if (isSectionTitle) {
          return (
            <h4
              key={i}
              className="text-sm font-semibold text-foreground mt-4 first:mt-0"
            >
              {trimmed.replace(/:$/, '')}
            </h4>
          );
        }

        // Handle bullet points (-, *, •)
        if (/^[-*•]\s/.test(trimmed)) {
          const bulletContent = trimmed.replace(/^[-*•]\s*/, '');
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-violet-500 shrink-0 leading-5">•</span>
              <span className="text-sm leading-5">
                {renderMarkdownLine(bulletContent)}
              </span>
            </div>
          );
        }

        // Handle numbered lists
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex gap-2 ml-1">
                <span className="text-violet-500 shrink-0 text-sm font-medium w-4 leading-5">
                  {match[1]}.
                </span>
                <span className="text-sm leading-5">
                  {renderMarkdownLine(match[2])}
                </span>
              </div>
            );
          }
        }

        // Regular paragraph
        return (
          <p key={i} className="text-sm">
            {renderMarkdownLine(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

interface SummaryData {
  hasSummary: boolean;
  summary: string | null;
  technicalOverview: string | null;
  generatedAt: string | null;
}

export function ProjectSummary({ projectName }: ProjectSummaryProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [projectName]);

  async function fetchSummary() {
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/summary`,
      );
      if (response.ok) {
        const result = await response.json();
        setData(result);

        // Auto-generate if no summary exists
        if (!result.hasSummary) {
          generateSummary();
        }
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateSummary() {
    setGenerating(true);
    toast.loading('Generating project summary...', { id: 'generate-summary' });

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/summary`,
        { method: 'POST' },
      );

      if (response.ok) {
        const result = await response.json();
        setData({
          hasSummary: true,
          summary: result.summary,
          technicalOverview: result.technicalOverview,
          generatedAt: result.generatedAt,
        });
        toast.success('Summary generated!', { id: 'generate-summary' });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate summary', {
          id: 'generate-summary',
        });
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast.error('Failed to generate summary', { id: 'generate-summary' });
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary rounded w-1/3" />
          <div className="h-4 bg-secondary rounded w-full" />
          <div className="h-4 bg-secondary rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-violet-500/10">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold">Project Summary</h2>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
            <Bot className="w-3 h-3" />
            AI Generated
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSummary}
          disabled={generating}
          className="gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`}
          />
          {generating ? 'Generating...' : 'Regenerate'}
        </Button>
      </div>

      {data?.hasSummary ? (
        <div className="space-y-4">
          {/* Summary */}
          <div className="text-foreground leading-relaxed">
            {data.summary && <MarkdownContent content={data.summary} />}
          </div>

          {/* Technical Overview */}
          {data.technicalOverview && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Technical Overview
              </h3>
              <div className="text-foreground">
                <MarkdownContent content={data.technicalOverview} skipHeaders />
              </div>
            </div>
          )}

          {/* Generated timestamp */}
          {data.generatedAt && (
            <p className="text-xs text-muted-foreground pt-2">
              Generated {new Date(data.generatedAt).toLocaleDateString()} at{' '}
              {new Date(data.generatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {generating
              ? 'Analyzing project and generating summary...'
              : 'No summary generated yet'}
          </p>
          {!generating && (
            <Button onClick={generateSummary} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Summary
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
