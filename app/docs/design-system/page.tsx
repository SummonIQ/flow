'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@summoniq/applab-ui';
import { ArrowRight, Palette, Type, Sparkles, FileCode, Layout } from 'lucide-react';

const designSystemSections = [
  {
    name: 'Tokens',
    href: '/docs/tokens',
    icon: FileCode,
    description: 'Design tokens for colors, spacing, typography, and more',
    features: ['Color palette', 'Spacing scale', 'Typography', 'Border radius', 'Shadows'],
  },
  {
    name: 'Animations',
    href: '/docs/animations',
    icon: Sparkles,
    description: 'Animation utilities and motion design principles',
    features: ['CSS animations', 'Framer Motion', 'Transitions', 'Easing functions'],
  },
  {
    name: 'Layout Patterns',
    href: '/docs/layout',
    icon: Layout,
    description: 'Reusable layout components and patterns',
    features: ['Page layouts', 'Grid systems', 'Responsive design', 'Container patterns'],
  },
];

export default function DesignSystemPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Design System</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A comprehensive design system with tokens, components, and guidelines for building consistent user interfaces
      </p>

      {/* Principles */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Design Principles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Maintain visual and functional consistency across all components and patterns
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Design with accessibility in mind, following WCAG guidelines and best practices
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scalability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build reusable components that scale across projects and use cases
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Design System Sections */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">System Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designSystemSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.name} href={section.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle>{section.name}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {section.features.map((feature) => (
                        <div key={feature} className="text-sm text-muted-foreground">
                          • {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Color System Preview */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Color System</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-primary" />
            <p className="text-sm font-medium">Primary</p>
            <p className="text-xs text-muted-foreground">Brand color</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-secondary" />
            <p className="text-sm font-medium">Secondary</p>
            <p className="text-xs text-muted-foreground">Supporting color</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-accent" />
            <p className="text-sm font-medium">Accent</p>
            <p className="text-xs text-muted-foreground">Highlight color</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted" />
            <p className="text-sm font-medium">Muted</p>
            <p className="text-xs text-muted-foreground">Subtle backgrounds</p>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Usage Guidelines</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Token Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Always use design tokens instead of hardcoded values</p>
              <p>• Reference colors by their semantic names (primary, secondary, etc.)</p>
              <p>• Use spacing scale for consistent margins and padding</p>
              <p>• Apply typography tokens for consistent text styling</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Component Composition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Build complex UIs by composing smaller components</p>
              <p>• Follow the single responsibility principle</p>
              <p>• Make components reusable and configurable with props</p>
              <p>• Document component APIs and usage examples</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
