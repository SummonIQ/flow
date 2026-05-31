'use client';

import { ComponentExample } from '@/components/docs/component-example';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlock,
  PageActions,
  PageDescription,
  PageTitle,
} from '@summoniq/applab-ui';
import { Download, Plus, Settings, Share2 } from 'lucide-react';

export default function PageActionsPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">PageActions</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Action container component for organizing buttons and interactive
        elements with flexible alignment
      </p>

      <div className="space-y-12">
        {/* Basic PageActions */}
        <ComponentExample
          title="Basic PageActions"
          description="Default right-aligned action buttons"
          code={`<PageActions>
  <Button variant="outline">Cancel</Button>
  <Button>Save Changes</Button>
</PageActions>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <PageActions>
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </PageActions>
          </div>
        </ComponentExample>

        {/* Different Alignments */}
        <ComponentExample
          title="Different Alignments"
          description="PageActions with start, center, and end alignment options"
          code={`<div className="flex justify-start">
  <PageActions>
  <Button>Start Aligned</Button>
  <Button variant="outline">Action</Button>
</PageActions>
  </PageActions>
</div>

<div className="flex justify-center">
  <PageActions>
  <Button>Center Aligned</Button>
  <Button variant="outline">Action</Button>
</PageActions>
  </PageActions>
</div>

<div className="flex justify-end">
  <PageActions>
  <Button>End Aligned</Button>
  <Button variant="outline">Action</Button>
</PageActions>
  </PageActions>
</div>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Start aligned:
              </p>
              <div className="flex justify-start">
                <PageActions>
                  <Button size="sm">Start Aligned</Button>
                  <Button variant="outline" size="sm">
                    Action
                  </Button>
                </PageActions>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Center aligned:
              </p>
              <div className="flex justify-center">
                <PageActions>
                  <Button size="sm">Center Aligned</Button>
                  <Button variant="outline" size="sm">
                    Action
                  </Button>
                </PageActions>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                End aligned (default):
              </p>
              <div className="flex justify-end">
                <PageActions>
                  <Button size="sm">End Aligned</Button>
                  <Button variant="outline" size="sm">
                    Action
                  </Button>
                </PageActions>
              </div>
            </div>
          </div>
        </ComponentExample>

        {/* With Icons */}
        <ComponentExample
          title="Actions with Icons"
          description="PageActions containing buttons with icons"
          code={`<PageActions>
  <Button variant="outline">
    <Download className="h-4 w-4 mr-2" />
    Export
  </Button>
  <Button variant="outline">
    <Share2 className="h-4 w-4 mr-2" />
    Share
  </Button>
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Create New
  </Button>
</PageActions>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <PageActions>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </PageActions>
          </div>
        </ComponentExample>

        {/* Mixed Content */}
        <ComponentExample
          title="Mixed Content"
          description="PageActions with buttons, badges, and other elements"
          code={`<PageActions>
  <Badge>Draft</Badge>
  <Button variant="outline">
    <Settings className="h-4 w-4 mr-2" />
    Settings
  </Button>
  <Button>Publish</Button>
</PageActions>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <PageActions>
              <Badge>Draft</Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">Publish</Button>
            </PageActions>
          </div>
        </ComponentExample>

        {/* In Page Header Context */}
        <ComponentExample
          title="In Page Header Context"
          description="PageActions used within page headers for complete layouts"
          code={`<div className="flex items-start justify-between">
  <div className="space-y-1">
    <PageTitle>Project Dashboard</PageTitle>
    <PageDescription>Monitor your project progress and metrics</PageDescription>
  </div>
  <PageActions>
    <Button variant="outline">Export Data</Button>
    <Button>New Project</Button>
  </PageActions>
</div>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <PageTitle>Project Dashboard</PageTitle>
                <PageDescription>
                  Monitor your project progress and metrics
                </PageDescription>
              </div>
              <PageActions>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
                <Button size="sm">New Project</Button>
              </PageActions>
            </div>
          </div>
        </ComponentExample>

        {/* In Card Context */}
        <ComponentExample
          title="In Card Context"
          description="PageActions used within cards and other components"
          code={`<Card>
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle>Team Settings</CardTitle>
        <CardDescription>Manage your team configuration</CardDescription>
      </div>
      <PageActions>
        <Button variant="outline" size="sm">Reset</Button>
        <Button size="sm">Save</Button>
      </PageActions>
    </div>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
</Card>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Team Settings</CardTitle>
                    <CardDescription>
                      Manage your team configuration
                    </CardDescription>
                  </div>
                  <PageActions>
                    <Button variant="outline" size="sm">
                      Reset
                    </Button>
                    <Button size="sm">Save</Button>
                  </PageActions>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Team configuration options and settings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Configure your notification preferences
                    </CardDescription>
                  </div>
                  <PageActions>
                    <Button variant="outline" size="sm">
                      Test
                    </Button>
                    <Button size="sm">Update</Button>
                  </PageActions>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notification settings and preferences.
                </p>
              </CardContent>
            </Card>
          </div>
        </ComponentExample>

        {/* Custom Styling */}
        <ComponentExample
          title="Custom Styling"
          description="PageActions with custom CSS classes"
          code={`<PageActions className="bg-primary/10 p-4 rounded-lg border border-primary/30">
  <Button variant="outline">Custom Styled</Button>
  <Button>Actions</Button>
</PageActions>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <PageActions className="bg-primary/10 p-4 rounded-lg border border-primary/30">
              <Button variant="outline" size="sm">
                Custom Styled
              </Button>
              <Button size="sm">Actions</Button>
            </PageActions>
          </div>
        </ComponentExample>

        {/* Props Documentation */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Props</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Default
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    children
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    ReactNode
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    required
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Action elements (buttons, badges, etc.)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    align
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "start" | "center" | "end"
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "end"
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Horizontal alignment of actions
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    className
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Additional CSS classes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Usage Notes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Provides consistent spacing (gap-2) between action elements
            </li>
            <li>
              • Flexbox layout with items-center alignment for vertical
              centering
            </li>
            <li>
              • Default end alignment works well for page headers and cards
            </li>
            <li>
              • Can contain buttons, badges, icons, and other interactive
              elements
            </li>
            <li>
              • Commonly used in page headers, card headers, and toolbar areas
            </li>
          </ul>
        </div>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { PageActions } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
