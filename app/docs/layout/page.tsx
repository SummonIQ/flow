'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@summoniq/applab-ui';
import { ArrowRight } from 'lucide-react';

const layoutComponents = [
  {
    name: 'Card',
    href: '/docs/layout/card',
    description: 'Versatile container component with header, content, footer, and actions',
    features: ['CardHeader', 'CardContent', 'CardFooter', 'CardActions', 'CardTitle', 'CardDescription'],
  },
  {
    name: 'Modal',
    href: '/docs/layout/modal',
    description: 'Custom modal component for overlays, forms, and interactive dialogs',
    features: ['Size variants', 'Custom footer', 'Programmatic control', 'Backdrop click'],
  },
  {
    name: 'Dialog',
    href: '/docs/layout/modal',
    description: 'Radix UI-based accessible dialog with focus management',
    features: ['Accessibility', 'Keyboard navigation', 'Portal rendering', 'Trigger pattern'],
  },
];

export default function LayoutPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Layout Components</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Components for structuring and organizing your user interface
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {layoutComponents.map((component) => (
          <Link key={component.name} href={component.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{component.name}</CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>{component.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {component.features.map((feature) => (
                    <div key={feature} className="text-sm text-muted-foreground">
                      • {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}