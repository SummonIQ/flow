'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContent,
} from '@summoniq/applab-ui';

export default function PageContentPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">PageContent</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Main content area component that provides consistent spacing, max-width
        constraints, and responsive padding
      </p>

      <div className="space-y-12">
        {/* Basic PageContent */}
        <ComponentExample
          title="Basic PageContent"
          description="Simple content area with cards and standard spacing"
          code={`<PageContent>
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Content Section</CardTitle>
        <CardDescription>This is the main content area</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your main content goes here with proper spacing and layout.</p>
      </CardContent>
    </Card>
  </div>
</PageContent>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <PageContent>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Section</CardTitle>
                    <CardDescription>
                      This is the main content area
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Your main content goes here with proper spacing and
                      layout.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Another Section</CardTitle>
                    <CardDescription>
                      Additional content with consistent spacing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      The PageContent component ensures consistent spacing and
                      responsive design.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </PageContent>
          </div>
        </ComponentExample>

        {/* PageContent with Grid Layout */}
        <ComponentExample
          title="PageContent with Grid Layout"
          description="Content area with responsive grid layout"
          code={`<PageContent>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Card 1</CardTitle>
        <CardDescription>First card in grid</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Grid content 1</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Card 2</CardTitle>
        <CardDescription>Second card in grid</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Grid content 2</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Card 3</CardTitle>
        <CardDescription>Third card in grid</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Grid content 3</p>
      </CardContent>
    </Card>
  </div>
</PageContent>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <PageContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>View your analytics data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track your performance metrics and insights.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>Generate detailed reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create comprehensive reports for your data.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                      Configure your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Customize your application settings.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </PageContent>
          </div>
        </ComponentExample>

        {/* PageContent with Custom Styling */}
        <ComponentExample
          title="PageContent with Custom Styling"
          description="Content area with custom background and styling"
          code={`<PageContent className="bg-muted/30 min-h-96">
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-foreground mb-4">
      Custom Styled Content
    </h2>
    <p className="text-muted-foreground mb-6">
      This content area has custom styling applied.
    </p>
    <Button>Take Action</Button>
  </div>
</PageContent>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <PageContent className="bg-muted/30 min-h-96">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Custom Styled Content
                </h2>
                <p className="text-muted-foreground mb-6">
                  This content area has custom styling applied.
                </p>
                <Button>Take Action</Button>
              </div>
            </PageContent>
          </div>
        </ComponentExample>

        {/* PageContent with Form Layout */}
        <ComponentExample
          title="PageContent with Form Layout"
          description="Content area optimized for form layouts"
          code={`<PageContent>
  <div className="max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              First Name
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Last Name
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Doe"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Email
          </label>
          <input 
            type="email" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="john@example.com"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</PageContent>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <PageContent>
              <div className="max-w-2xl">
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>
                      Update your profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </PageContent>
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
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Content to render in the main area
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
                    Additional CSS classes for the content area
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
              • Provides consistent max-width (7xl) and responsive padding
            </li>
            <li>• Automatically centers content horizontally</li>
            <li>• Includes vertical padding (py-8) for proper spacing</li>
            <li>• Works well with grid layouts and card components</li>
            <li>• Can be used standalone or within the Page component</li>
          </ul>
        </div>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { PageContent } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
