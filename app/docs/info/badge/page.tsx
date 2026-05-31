'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { Badge } from '@summoniq/applab-ui';
import {
  AlertCircle,
  Check,
  Clock,
  Info,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

export default function BadgePage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Badge</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Small status indicators for labels, counts, and categorization
      </p>

      <div className="space-y-12">
        {/* Variants */}
        <ComponentExample
          title="Badge Variants"
          description="Different badge styles for various contexts"
          code={`<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`}
        >
          <div className="flex items-center gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </ComponentExample>

        {/* With Icons */}
        <ComponentExample
          title="Badges with Icons"
          description="Combining icons with text for enhanced meaning"
          code={`<Badge variant="default">
  <Check className="h-3 w-3 mr-1" />
  Success
</Badge>
<Badge variant="destructive">
  <X className="h-3 w-3 mr-1" />
  Error
</Badge>
<Badge variant="secondary">
  <AlertCircle className="h-3 w-3 mr-1" />
  Warning
</Badge>
<Badge variant="outline">
  <Info className="h-3 w-3 mr-1" />
  Info
</Badge>`}
        >
          <div className="flex items-center gap-2">
            <Badge variant="default">
              <Check className="h-3 w-3 mr-1" />
              Success
            </Badge>
            <Badge variant="destructive">
              <X className="h-3 w-3 mr-1" />
              Error
            </Badge>
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Warning
            </Badge>
            <Badge variant="outline">
              <Info className="h-3 w-3 mr-1" />
              Info
            </Badge>
          </div>
        </ComponentExample>

        {/* Status Badges */}
        <ComponentExample
          title="Status Badges"
          description="Common status indicator patterns"
          code={`// User Status
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Inactive</Badge>
<Badge variant="destructive">Banned</Badge>

// Priority Levels
<Badge variant="destructive">Urgent</Badge>
<Badge variant="default">High</Badge>
<Badge variant="secondary">Medium</Badge>
<Badge variant="outline">Low</Badge>

// Content Status
<Badge>Published</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">Archived</Badge>`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground min-w-[100px]">
                User Status:
              </span>
              <Badge variant="default">Active</Badge>
              <Badge variant="secondary">Pending</Badge>
              <Badge variant="outline">Inactive</Badge>
              <Badge variant="destructive">Banned</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground min-w-[100px]">
                Priority:
              </span>
              <Badge variant="destructive">Urgent</Badge>
              <Badge variant="default">High</Badge>
              <Badge variant="secondary">Medium</Badge>
              <Badge variant="outline">Low</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground min-w-[100px]">
                Content:
              </span>
              <Badge>Published</Badge>
              <Badge variant="secondary">Draft</Badge>
              <Badge variant="outline">Archived</Badge>
            </div>
          </div>
        </ComponentExample>

        {/* Category Badges */}
        <ComponentExample
          title="Category Badges"
          description="Using badges for categorization and tagging"
          code={`// Technologies
<Badge>React</Badge>
<Badge>TypeScript</Badge>
<Badge>Next.js</Badge>
<Badge>Tailwind CSS</Badge>

// Features
<Badge variant="secondary">
  <Star className="h-3 w-3 mr-1" />
  Featured
</Badge>
<Badge variant="secondary">
  <TrendingUp className="h-3 w-3 mr-1" />
  Trending
</Badge>
<Badge variant="secondary">
  <Clock className="h-3 w-3 mr-1" />
  New
</Badge>`}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>React</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Next.js</Badge>
              <Badge>Tailwind CSS</Badge>
              <Badge>Node.js</Badge>
              <Badge>GraphQL</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
              <Badge variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                New
              </Badge>
            </div>
          </div>
        </ComponentExample>

        {/* Count Badges */}
        <ComponentExample
          title="Count Badges"
          description="Badges displaying numerical information"
          code={`// Notification counts
<Badge>5</Badge>
<Badge variant="destructive">99+</Badge>
<Badge variant="secondary">12</Badge>

// With context
<Badge>
  <Users className="h-3 w-3 mr-1" />
  234 users
</Badge>`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Messages</span>
                <Badge>5</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Notifications
                </span>
                <Badge variant="destructive">99+</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Updates</span>
                <Badge variant="secondary">12</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>
                <Users className="h-3 w-3 mr-1" />
                234 users
              </Badge>
              <Badge variant="secondary">v2.1.0</Badge>
              <Badge variant="outline">Beta</Badge>
            </div>
          </div>
        </ComponentExample>

        {/* Real-world Examples */}
        <ComponentExample
          title="Real-world Usage"
          description="Badge usage in common UI patterns"
          code={`// In a table row
<tr>
  <td>John Doe</td>
  <td><Badge variant="default">Active</Badge></td>
  <td><Badge variant="secondary">Admin</Badge></td>
</tr>

// In a card header
<CardHeader>
  <div className="flex justify-between">
    <CardTitle>Project Alpha</CardTitle>
    <Badge variant="destructive">Urgent</Badge>
  </div>
</CardHeader>

// In a list item
<li className="flex justify-between">
  <span>Feature Request</span>
  <div className="flex gap-1">
    <Badge>enhancement</Badge>
    <Badge variant="outline">help wanted</Badge>
  </div>
</li>`}
        >
          <div className="space-y-4">
            {/* Table Example */}
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  <tr>
                    <td className="px-4 py-2 text-sm">John Doe</td>
                    <td className="px-4 py-2">
                      <Badge variant="default">Active</Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="secondary">Admin</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm">Jane Smith</td>
                    <td className="px-4 py-2">
                      <Badge variant="default">Active</Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">Member</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* List Example */}
            <ul className="space-y-2 border rounded-lg p-3">
              <li className="flex justify-between items-center">
                <span className="text-sm">Feature: Dark mode support</span>
                <div className="flex gap-1">
                  <Badge>enhancement</Badge>
                  <Badge variant="outline">ui</Badge>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm">Bug: Login redirect issue</span>
                <div className="flex gap-1">
                  <Badge variant="destructive">bug</Badge>
                  <Badge variant="secondary">high priority</Badge>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm">Docs: API reference update</span>
                <div className="flex gap-1">
                  <Badge variant="secondary">documentation</Badge>
                  <Badge variant="outline">help wanted</Badge>
                </div>
              </li>
            </ul>
          </div>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { Badge } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
