'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@summoniq/applab-ui';
import { ArrowRight } from 'lucide-react';

const layoutComponents = [
  {
    name: 'Stacked Layout',
    href: '/layout/layouts/stacked-layout',
    description: 'Complete application layout with header navigation, user dropdown, and page content',
    features: ['AppHeader integration', 'Page content area', 'Mobile responsive', 'User dropdown', 'Navigation menu'],
  },
];

export default function LayoutsPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Layout Templates</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Complete layout templates that combine multiple components into full application interfaces. Individual layout components like App Header and Page Components can be found in the main Layout section.
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
