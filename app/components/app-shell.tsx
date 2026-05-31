'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

import { NavigationMenu } from '@/components/navigation/navigation-menu';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { AppHeader } from './app-header';
import { StatusBar } from './status-bar';

const mainNavigation = [
  { href: '/', icon: 'Home', name: 'Dashboard' },
  { href: '/email', icon: 'Mail', name: 'Email' },
  { href: '/calendar', icon: 'Calendar', name: 'Calendar' },
  {
    href: '/lead-generation',
    icon: 'Sparkles',
    name: 'Marketing',
    children: [
      { href: '/lead-generation', icon: 'Sparkles', name: 'Lead Generation' },
      {
        href: '/lead-generation/search',
        icon: 'Search',
        name: 'Prospect Discovery',
      },
      { href: '/agency-leads', icon: 'Users', name: 'Agency Leads' },
      {
        href: '/lead-data-integration',
        icon: 'Database',
        name: 'Lead Data Integration',
      },
      { href: '/email-automation', icon: 'Mail', name: 'Email Automation' },
      { href: '/email-marketing', icon: 'Mail', name: 'Email Marketing' },
      { href: '/linkedin-integration', icon: 'Users', name: 'LinkedIn Tools' },
      { href: '/outreach', icon: 'Mail', name: 'Outreach' },
      {
        href: '/execution-calendar',
        icon: 'Calendar',
        name: 'Execution Calendar',
      },
    ],
  },
  {
    href: '/recruiting',
    icon: 'Users',
    name: 'Recruiting',
    children: [
      { href: '/recruiting', icon: 'Users', name: 'Recruiting Hub' },
      {
        href: '/recruiting-dashboard',
        icon: 'Users',
        name: 'Recruiting Dashboard',
      },
      {
        href: '/recruiting/training',
        icon: 'BookOpen',
        name: 'Training Program',
      },
      {
        href: '/recruiting-action-guide',
        icon: 'BookOpen',
        name: 'Recruiting Action Guide',
      },
      { href: '/action-plan', icon: 'Star', name: 'Action Plan' },
      {
        href: '/recruiting/candidates/search',
        icon: 'Users',
        name: 'Candidate Search',
      },
      {
        href: '/recruiting/network-mapping',
        icon: 'Users',
        name: 'Network Mapping',
      },
    ],
  },
  {
    href: '/business-intelligence',
    icon: 'Lightbulb',
    name: 'Insights',
    children: [
      {
        href: '/business-intelligence',
        icon: 'Lightbulb',
        name: 'Business Intelligence',
      },
      {
        href: '/revenue-analytics',
        icon: 'BarChart3',
        name: 'Revenue Analytics',
      },
      { href: '/analytics', icon: 'BarChart3', name: 'Analytics Overview' },
      {
        href: '/analytics/dashboard',
        icon: 'BarChart3',
        name: 'Analytics Dashboard',
      },
    ],
  },
  {
    href: '/projects',
    icon: 'Hammer',
    name: 'Engineering',
    children: [
      { href: '/find-work', icon: 'Briefcase', name: 'Find Work' },
      { href: '/upwork-guide', icon: 'Bot', name: 'Upwork Automation' },
      { href: '/scrapers', icon: 'Bot', name: 'Scrapers' },
      { href: '/data', icon: 'Database', name: 'Data' },
      { href: '/proposals', icon: 'FileText', name: 'Proposals' },
      { href: '/contracts', icon: 'FileText', name: 'Contracts' },
      { href: '/portfolio', icon: 'Layers', name: 'Portfolio' },
      {
        href: '/business-documentation',
        icon: 'BookOpen',
        name: 'Documentation',
      },
      { href: '/api-validation', icon: 'FileCode', name: 'API Validation' },
      { href: '/api-setup', icon: 'Settings2', name: 'API Setup' },
      {
        href: '/automation-sequences',
        icon: 'Workflow',
        name: 'Automation Sequences',
      },
    ],
  },
  {
    href: '/clients',
    icon: 'Users',
    name: 'CRM',
    children: [
      { href: '/clients', icon: 'Users', name: 'Clients' },
      { href: '/leads', icon: 'Tag', name: 'Leads' },
      { href: '/getting-started', icon: 'Sparkles', name: 'Getting Started' },
      {
        href: '/platform-activation',
        icon: 'Sparkles',
        name: 'Platform Activation',
      },
      { href: '/projects', icon: 'FolderOpen', name: 'Projects' },
    ],
  },
  { href: '/projects', icon: 'FolderOpen', name: 'Projects' },
  { href: '/tasks', icon: 'Workflow', name: 'Tasks' },
  {
    href: '/billing',
    icon: 'CreditCard',
    name: 'Billing',
    children: [
      { href: '/invoices', icon: 'FileText', name: 'Invoices' },
      { href: '/payments', icon: 'DollarSign', name: 'Payments' },
      { href: '/time-tracking', icon: 'Clock', name: 'Time Tracking' },
      { href: '/analytics', icon: 'BarChart3', name: 'Analytics Overview' },
      {
        href: '/revenue-analytics',
        icon: 'BarChart3',
        name: 'Revenue Analytics',
      },
      {
        href: '/analytics/dashboard',
        icon: 'BarChart3',
        name: 'Analytics Dashboard',
      },
    ],
  },
  {
    href: '/business-tools',
    icon: 'Sparkles',
    name: 'Tools',
    children: [
      { href: '/business-tools', icon: 'Grid3x3', name: 'All Tools Overview' },
    ],
  },
];

const bottomNavigation = [
  { href: '/docs', icon: 'BookOpen', name: 'Docs' },
  { href: '/settings/integrations', icon: 'Settings2', name: 'Integrations' },
  { href: '/settings', icon: 'Settings', name: 'Settings' },
];

interface AppShellProps {
  children: React.ReactNode;
}

const SIDEBAR_DEFAULT_WIDTH = 288;
const SIDEBAR_MIN_WIDTH = 96;
const SIDEBAR_SNAP_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 520;
const SIDEBAR_COLLAPSED_EPSILON = 8;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isStudioRoute = pathname?.startsWith('/studio');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleSidebarResize = useCallback(
    (panelSize: { inPixels: number }) => {
      const nextCollapsed =
        panelSize.inPixels <= SIDEBAR_MIN_WIDTH + SIDEBAR_COLLAPSED_EPSILON;
      setIsCollapsed(prev => (prev === nextCollapsed ? prev : nextCollapsed));
    },
    [],
  );

  if (isStudioRoute) {
    return <div className="h-screen">{children}</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden pt-11">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
          autoSaveId="app-shell-sidebar-v2"
        >
          <ResizablePanel
            collapsible
            collapsedSize={SIDEBAR_MIN_WIDTH}
            defaultSize={SIDEBAR_DEFAULT_WIDTH}
            minSize={SIDEBAR_SNAP_WIDTH}
            maxSize={SIDEBAR_MAX_WIDTH}
            onResize={handleSidebarResize}
            className="min-w-[96px]"
          >
            <aside
              className="h-full w-full min-w-[96px] shrink-0 flex flex-col select-none border-r border-border/50 bg-muted/30 overflow-y-auto overflow-x-visible"
            >
              <NavigationMenu items={mainNavigation} collapsed={isCollapsed} />

              <div className="mt-auto">
                <div className="border-t border-border">
                  <NavigationMenu
                    items={bottomNavigation}
                    collapsed={isCollapsed}
                  />
                </div>
              </div>
            </aside>
          </ResizablePanel>

          <ResizableHandle withHandle className="mx-0.5 w-1 rounded-sm hover:bg-border/70" />

          <ResizablePanel>
            <main
              id="main-scroll-container"
              className="flex flex-col flex-1 h-full min-w-0 overflow-auto overflow-x-hidden bg-background"
            >
              {children}
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <StatusBar />
    </div>
  );
}
