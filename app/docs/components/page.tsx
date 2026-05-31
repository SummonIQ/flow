'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@summoniq/applab-ui';
import { ArrowLeft, Box, ChevronRight, Component, FileText, Layers, Navigation as NavigationIcon, Palette } from 'lucide-react';
import Link from 'next/link';

interface ComponentGroup {
  components: { description: string, href: string; name: string; }[];
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const SECTIONS: ComponentGroup[] = [
  {
    components: [
      { description: 'Flexible modal container with transitions and accessibility baked in.', href: '/docs/components/modal', name: 'Modal' },
      { description: 'Accessible dialog powered by Radix UI primitives.', href: '/docs/layout/modal', name: 'Dialog' },
      { description: 'Surface wrapper with elevation, radius, and content slots.', href: '/docs/layout/card', name: 'Card' },
      { description: 'Toggleable content areas for FAQs and progressive disclosure.', href: '/docs/components/collapsible', name: 'Collapsible' },
    ],
    description: 'Structural primitives for organizing content areas and flows.',
    icon: Box,
    title: 'Layout components',
  },
  {
    components: [
      { description: 'Action triggers with variants, sizes, and disabled styling.', href: '/docs/forms/button', name: 'Button' },
      { description: 'Text inputs with focus, error, and helper states.', href: '/docs/forms/input', name: 'Input' },
      { description: 'Accessible combobox built on Radix primitives.', href: '/docs/forms/select', name: 'Select' },
      { description: 'Associative labels for form controls with helper slots.', href: '/docs/forms/label', name: 'Label' },
    ],
    description: 'Input controls with consistent spacing, states, and labels.',
    icon: FileText,
    title: 'Form components',
  },
  {
    components: [
      { description: 'Contextual menu with keyboard navigation and variants.', href: '/docs/navigation/dropdown-menu', name: 'Dropdown Menu' },
      { description: 'Top-level navigation with responsive orientation.', href: '/docs/navigation/navigation-menu', name: 'Navigation Menu' },
    ],
    description: 'Menus and navigation affordances for hierarchical experiences.',
    icon: NavigationIcon,
    title: 'Navigation components',
  },
  {
    components: [
      { description: 'Status indicators and compact tags with tone variants.', href: '/docs/info/badge', name: 'Badge' },
      { description: 'User profile representation with fallbacks and sizing.', href: '/docs/user/avatar', name: 'Avatar' },
      { description: 'Code snippet display with syntax labels and copy functionality.', href: '/docs/components/code-block', name: 'CodeBlock' },
      { description: 'Documentation component with preview and source code tabs.', href: '/docs/components/component-preview', name: 'ComponentPreview' },
    ],
    description: 'Status, identity, and contextual UI elements.',
    icon: Component,
    title: 'Display components',
  },
];

export default function ComponentsOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          href="/docs"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Docs
        </Link>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Components
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Reusable React components built with Radix UI, Tailwind CSS, and the SummonIQ theming system.
            </p>
          </div>
          <Button asChild className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5" size="sm" variant="outline">
            <Link href="/docs/patterns">Browse patterns</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Architecture Section */}
        <Card className="bg-black border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Architecture</CardTitle>
                <CardDescription className="text-gray-400">
                  System design patterns and organizational principles
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-blue-500/30 hover:bg-white/10"
                href="/docs/architecture/overview"
              >
                <span className="text-sm text-white group-hover:text-blue-400 transition-colors">System Overview</span>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-400" />
              </Link>
              <Link
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-blue-500/30 hover:bg-white/10"
                href="/docs/architecture/patterns"
              >
                <span className="text-sm text-white group-hover:text-blue-400 transition-colors">Design Patterns</span>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-400" />
              </Link>
              <Link
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-blue-500/30 hover:bg-white/10"
                href="/docs/architecture/conventions"
              >
                <span className="text-sm text-white group-hover:text-blue-400 transition-colors">Code Conventions</span>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-400" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Design System Section */}
        <Card className="bg-black border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                <Palette className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <CardTitle className="text-white">Design System</CardTitle>
                <CardDescription className="text-gray-400">
                  Colors, typography, spacing, and visual guidelines
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <Link
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-pink-500/30 hover:bg-white/10"
                href="/docs/design-system/colors"
              >
                <span className="text-sm text-white group-hover:text-pink-400 transition-colors">Colors</span>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-400" />
              </Link>
              <Link
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-pink-500/30 hover:bg-white/10"
                href="/docs/design-system/typography"
              >
                <span className="text-sm text-white group-hover:text-pink-400 transition-colors">Typography</span>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-400" />
              </Link>
              <Link
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-pink-500/30 hover:bg-white/10"
                href="/docs/design-system/spacing"
              >
                <span className="text-sm text-white group-hover:text-pink-400 transition-colors">Spacing</span>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-400" />
              </Link>
              <Link
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-pink-500/30 hover:bg-white/10"
                href="/docs/design-system/icons"
              >
                <span className="text-sm text-white group-hover:text-pink-400 transition-colors">Icons</span>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-400" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Components Section Header */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Components</h2>
          <p className="text-sm text-gray-400">
            Production-ready UI primitives organized by category
          </p>
        </div>

        {/* Components Categories with Nested Children */}
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card className="bg-black border-white/10" key={section.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{section.title}</CardTitle>
                      <CardDescription className="text-gray-400">{section.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className="border-white/20 text-gray-400" variant="outline">
                    {section.components.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {section.components.map((item, index) => (
                    <Link
                      className="group flex items-start gap-3 rounded-lg p-3 transition hover:bg-white/5"
                      href={item.href}
                      key={item.href}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-px w-4 bg-white/10" />
                          <ChevronRight className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                            {item.name}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 text-right flex-shrink-0">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Quick Stats */}
        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Components', value: '22+' },
                { label: 'TypeScript coverage', value: '100%' },
                { label: 'Accessibility', value: 'WCAG AA' },
                { label: 'Dark mode', value: 'Native' },
              ].map((stat) => (
                <div
                  className="text-center"
                  key={stat.label}
                >
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
