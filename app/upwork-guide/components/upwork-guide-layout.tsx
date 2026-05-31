'use client';

import type { ReactNode } from 'react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export type UpworkGuideLayoutProps = {
  title: string;
  description?: string;
  activeSectionId: string;
  sections: Array<{ id: string; label: string; description?: string }>;
  onSectionSelect?: (sectionId: string) => void;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  leftPane?: ReactNode;
  children: ReactNode;
};

export function UpworkGuideLayout({
  title,
  description,
  activeSectionId,
  sections,
  onSectionSelect,
  primaryAction,
  secondaryActions,
  leftPane,
  children,
}: UpworkGuideLayoutProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
        <header className="px-4 pt-4 pb-3 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                Workflow
              </div>
              <h1 className="text-2xl font-semibold tracking-tight truncate mt-1">
                {title}
              </h1>
              {description ? (
                <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {secondaryActions}
              {primaryAction}
            </div>
          </div>
        </header>

        {leftPane ? (
          <div className="min-h-0 min-w-0 p-4">
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-0 min-w-0"
              autoSaveId="upwork-guide-layout"
            >
              <ResizablePanel
                id="upwork-left"
                defaultSize="55%"
                minSize="20%"
                maxSize="80%"
                collapsible={false}
              >
                <section className="min-h-0 min-w-0 overflow-hidden pr-2">
                  <div className="h-full min-w-0">{leftPane}</div>
                </section>
              </ResizablePanel>

              <ResizableHandle withHandle className="cursor-col-resize" />

              <ResizablePanel
                id="upwork-right"
                defaultSize="45%"
                minSize="20%"
                maxSize="80%"
                collapsible={false}
              >
                <section className="min-h-0 min-w-0 pl-2">
                  <main className="min-w-0">
                    <div className="space-y-4">{children}</div>
                  </main>
                </section>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        ) : (
          <div className="p-4">
            <main className="min-w-0">
              <div className="space-y-4">{children}</div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
