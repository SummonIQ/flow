'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@summoniq/applab-ui';
import { ArrowRight } from 'lucide-react';

const formComponents = [
  {
    name: 'Button',
    href: '/docs/forms/button',
    description: 'Clickable button component with multiple variants and sizes',
    features: ['Default, outline, ghost variants', 'Size options', 'Loading states', 'Icon support'],
  },
  {
    name: 'Input',
    href: '/docs/forms/input',
    description: 'Text input field with various types and states',
    features: ['Text, email, password types', 'Placeholder text', 'Default values', 'Disabled state'],
  },
  {
    name: 'Select',
    href: '/docs/forms/select',
    description: 'Dropdown selection component with search and multi-select',
    features: ['Single select', 'Searchable options', 'Custom trigger', 'Grouped options'],
  },
  {
    name: 'Label',
    href: '/docs/forms/label',
    description: 'Form label component for accessibility',
    features: ['For attribute binding', 'Required indicator', 'Helper text', 'Error states'],
  },
  {
    name: 'Textarea',
    href: '/docs/forms/textarea',
    description: 'Multi-line text input for longer content',
    features: ['Auto-resize support', 'Min height control', 'Placeholder text', 'Disabled state'],
  },
];

export default function FormsPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Form Components</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Essential components for building accessible and user-friendly forms
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formComponents.map((component) => (
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