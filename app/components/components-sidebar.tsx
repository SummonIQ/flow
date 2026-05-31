'use client';

import type { AnimatedSideNavSection } from '@/components/navigation/animated-side-nav';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Separator } from '@summoniq/applab-ui';
import { Box } from 'lucide-react';
import { useState } from 'react';
import { ComponentsNavigation } from './components-navigation';

const COLLAPSED_SIZE = 4;
const COLLAPSE_THRESHOLD = 10;

interface ComponentsSidebarProps {
  navigation: AnimatedSideNavSection[];
  children: React.ReactNode;
}

export function ComponentsSidebar({
  navigation,
  children,
}: ComponentsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleResize = (sizes: number[]) => {
    const sidebarSize = sizes[0];
    if (sidebarSize <= COLLAPSE_THRESHOLD && !isCollapsed) {
      setIsCollapsed(true);
    } else if (sidebarSize > COLLAPSE_THRESHOLD && isCollapsed) {
      setIsCollapsed(false);
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full"
      onLayout={handleResize}
      autoSaveId="components-sidebar"
    >
      {/* Sidebar Navigation */}
      <ResizablePanel defaultSize={20} minSize={COLLAPSED_SIZE} maxSize={35}>
        <aside className="h-full border-r border-border bg-background overflow-y-auto">
          <div className="py-4 px-3">
            {!isCollapsed ? (
              <>
                <div className="px-1 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Box className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold">Components</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reusable UI components for building your application
                  </p>
                </div>
                <Separator className="mb-4" />
              </>
            ) : (
              <div className="flex justify-center mb-4">
                <Box className="w-5 h-5 text-primary" />
              </div>
            )}

            <ComponentsNavigation
              sections={navigation}
              collapsed={isCollapsed}
            />
          </div>
        </aside>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Main Content */}
      <ResizablePanel defaultSize={80}>
        <main
          id="components-scroll-container"
          className="h-full overflow-y-auto"
        >
          <div className="p-6 h-full flex flex-1 flex-col">{children}</div>
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
