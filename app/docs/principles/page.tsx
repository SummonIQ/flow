'use client';

import { ArrowLeft, Target, Accessibility, Link as LinkIcon, Smartphone, Zap, Puzzle } from 'lucide-react';
import Link from 'next/link';

export default function PrinciplesPage() {
  const principles = [
    {
      icon: Target,
      title: 'Purpose-Driven Design',
      description: 'Every design decision serves a clear user need and business goal. Our design system prioritizes functionality and user outcomes over aesthetics alone.',
      examples: [
        'Components include clear usage guidelines',
        'Variants exist for specific use cases',
        'Design tokens reflect semantic meaning',
        'Each pattern solves real problems efficiently'
      ]
    },
    {
      icon: Accessibility,
      title: 'Accessibility First',
      description: 'Accessibility is built into every component from the ground up, not retrofitted. We follow WCAG 2.1 AA guidelines and test with real users.',
      examples: [
        'Minimum 4.5:1 color contrast ratios',
        'Full keyboard navigation support',
        'Screen reader compatibility and ARIA labels',
        'Focus indicators on all interactive elements',
        'Alternative text for meaningful images'
      ]
    },
    {
      icon: LinkIcon,
      title: 'Systematic Consistency',
      description: 'Consistency reduces cognitive load for users and enables teams to move faster. Our system provides clear patterns and constraints that scale across teams.',
      examples: [
        'Consistent spacing scale (4px base unit)',
        'Standardized interaction patterns',
        'Unified visual hierarchy and typography',
        'Predictable component APIs and props'
      ]
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Responsive',
      description: 'Every component is designed mobile-first and progressively enhanced for larger screens. Touch-friendly interactions are prioritized.',
      examples: [
        'Mobile: 320px - 768px',
        'Tablet: 769px - 1024px',
        'Desktop: 1025px+',
        'Minimum touch target: 44px × 44px'
      ]
    },
    {
      icon: Zap,
      title: 'Performance Conscious',
      description: 'Every component is optimized for performance with minimal bundle impact, lazy loading where appropriate, and efficient rendering.',
      examples: [
        'Tree-shakable component architecture',
        'CSS-in-JS with compile-time optimization',
        'Lazy loading for complex components',
        'Minimal runtime dependencies',
        'Hardware-accelerated animations'
      ]
    },
    {
      icon: Puzzle,
      title: 'Composable Architecture',
      description: 'Components are designed as composable building blocks that can be combined in flexible ways while maintaining consistency.',
      examples: [
        'Smaller, focused components',
        'Flexible composition patterns',
        'Clear component boundaries',
        'Easier testing and maintenance'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/design-system"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Design System
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-4">Design Principles</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          Core principles that guide the SummonIQ design system and ensure consistent, accessible, and delightful user experiences across all components.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div key={principle.title} className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{principle.title}</h3>
                <p className="text-muted-foreground mb-4">{principle.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Key aspects:</p>
                  <ul className="space-y-1">
                    {principle.examples.map((example) => (
                      <li key={example} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
