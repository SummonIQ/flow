'use client';

import { Page, PageHeader } from '@summoniq/applab-ui';
import { useState } from 'react';

export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const componentCategories = [
    {
      name: 'UI Components',
      components: [
        {
          name: 'Button',
          description: 'Versatile button component with multiple variants',
          tags: ['shadcn', 'radix'],
        },
        {
          name: 'Card',
          description: 'Container component for grouping related content',
          tags: ['shadcn'],
        },
        {
          name: 'Dialog',
          description: 'Modal dialog with accessible overlay',
          tags: ['shadcn', 'radix'],
        },
        {
          name: 'Input',
          description: 'Text input with validation support',
          tags: ['shadcn'],
        },
      ],
    },
    {
      name: 'Form Components',
      components: [
        {
          name: 'Form',
          description: 'Form wrapper with validation using react-hook-form',
          tags: ['shadcn', 'react-hook-form'],
        },
        {
          name: 'Select',
          description: 'Dropdown select with search and multi-select',
          tags: ['shadcn', 'radix'],
        },
        {
          name: 'Checkbox',
          description: 'Checkbox input with indeterminate state',
          tags: ['shadcn', 'radix'],
        },
      ],
    },
    {
      name: 'Data Display',
      components: [
        {
          name: 'Table',
          description: 'Responsive data table with sorting and filtering',
          tags: ['shadcn', 'tanstack-table'],
        },
        {
          name: 'Badge',
          description: 'Small status or label badge',
          tags: ['shadcn'],
        },
        {
          name: 'Avatar',
          description: 'User avatar with fallback initials',
          tags: ['shadcn', 'radix'],
        },
      ],
    },
  ];

  return (
    <Page className="h-full">
      <PageHeader
        title="Components"
        description="Browse and add UI components to your projects"
      >
        {/* Search and Actions */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search components..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
            Add Custom Component
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto space-y-6">
          {/* Component Categories */}
          <div className="space-y-8">
            {componentCategories.map(category => (
              <div key={category.name}>
                <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.components
                    .filter(
                      comp =>
                        searchQuery === '' ||
                        comp.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        comp.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                    )
                    .map(component => (
                      <div
                        key={component.name}
                        className="border rounded-lg p-5 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold">
                            {component.name}
                          </h3>
                          <button className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                            Add
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {component.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {component.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-muted"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-5">
                <h3 className="font-semibold mb-2">Add to @summoniq/applab-ui</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add new components to the shared UI library for use across all
                  projects
                </p>
                <button className="text-sm font-medium text-primary hover:underline">
                  Manage UI Library →
                </button>
              </div>
              <div className="border rounded-lg p-5">
                <h3 className="font-semibold mb-2">Import from Project</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import components from other projects in your workspace
                </p>
                <button className="text-sm font-medium text-primary hover:underline">
                  Browse Projects →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
