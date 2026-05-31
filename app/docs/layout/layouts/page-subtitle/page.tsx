'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageDescription,
  PageTitle,
} from '@summoniq/applab-ui';

export default function PageDescriptionPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">
        PageDescription
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Subtitle component for providing additional context and description
        below page titles
      </p>

      <div className="space-y-12">
        {/* Basic PageDescription */}
        <ComponentExample
          title="Basic PageDescription"
          description="Simple subtitle with muted text styling"
          code={`<PageDescription>
  This is a subtitle that provides additional context for the page
</PageDescription>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <PageDescription>
              This is a subtitle that provides additional context for the page
            </PageDescription>
          </div>
        </ComponentExample>

        {/* With PageTitle */}
        <ComponentExample
          title="Combined with PageTitle"
          description="PageDescription used together with PageTitle for complete page headers"
          code={`<div className="space-y-1">
  <PageTitle>Dashboard Overview</PageTitle>
  <PageDescription>
    Monitor your key metrics and performance indicators
  </PageDescription>
</div>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <div className="space-y-1">
              <PageTitle>Dashboard Overview</PageTitle>
              <PageDescription>
                Monitor your key metrics and performance indicators
              </PageDescription>
            </div>
          </div>
        </ComponentExample>

        {/* Custom Styling */}
        <ComponentExample
          title="Custom Styling"
          description="PageDescription with custom CSS classes"
          code={`<PageDescription className="text-primary">
  Blue colored subtitle
</PageDescription>
<PageDescription className="text-lg font-medium">
  Larger and bolder subtitle
</PageDescription>
<PageDescription className="italic">
  Italic styled subtitle
</PageDescription>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40 space-y-3">
            <PageDescription className="text-primary">
              Blue colored subtitle
            </PageDescription>
            <PageDescription className="text-lg font-medium">
              Larger and bolder subtitle
            </PageDescription>
            <PageDescription className="italic">
              Italic styled subtitle
            </PageDescription>
          </div>
        </ComponentExample>

        {/* In Card Context */}
        <ComponentExample
          title="In Card Context"
          description="PageDescription used within cards and other components"
          code={`<Card>
  <CardHeader>
    <CardTitle>Project Settings</CardTitle>
    <PageDescription>Configure your project preferences and options</PageDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
</Card>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <PageDescription>
                  Configure your project preferences and options
                </PageDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card uses PageDescription for additional context.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <PageDescription>
                  Manage team members, roles, and permissions
                </PageDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  PageDescription provides helpful descriptions for sections.
                </p>
              </CardContent>
            </Card>
          </div>
        </ComponentExample>

        {/* Multiple Subtitles */}
        <ComponentExample
          title="Multiple Subtitles"
          description="Using multiple subtitles for different sections"
          code={`<div className="space-y-8">
  <div className="space-y-1">
    <PageTitle level={2}>Analytics</PageTitle>
    <PageDescription>View your website traffic and user engagement metrics</PageDescription>
  </div>
  
  <div className="space-y-1">
    <PageTitle level={2}>Reports</PageTitle>
    <PageDescription>Generate detailed reports for your data analysis</PageDescription>
  </div>
  
  <div className="space-y-1">
    <PageTitle level={2}>Settings</PageTitle>
    <PageDescription>Customize your dashboard and notification preferences</PageDescription>
  </div>
</div>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <div className="space-y-8">
              <div className="space-y-1">
                <PageTitle>Analytics</PageTitle>
                <PageDescription>
                  View your website traffic and user engagement metrics
                </PageDescription>
              </div>

              <div className="space-y-1">
                <PageTitle>Reports</PageTitle>
                <PageDescription>
                  Generate detailed reports for your data analysis
                </PageDescription>
              </div>

              <div className="space-y-1">
                <PageTitle>Settings</PageTitle>
                <PageDescription>
                  Customize your dashboard and notification preferences
                </PageDescription>
              </div>
            </div>
          </div>
        </ComponentExample>

        {/* Long Content */}
        <ComponentExample
          title="Long Content"
          description="PageDescription with longer descriptive text"
          code={`<div className="space-y-1">
  <PageTitle>User Onboarding</PageTitle>
  <PageDescription>
    Welcome to our platform! This comprehensive guide will walk you through 
    all the essential features and help you get started with your first project. 
    We've designed this process to be as smooth and informative as possible.
  </PageDescription>
</div>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <div className="space-y-1">
              <PageTitle>User Onboarding</PageTitle>
              <PageDescription>
                Welcome to our platform! This comprehensive guide will walk you
                through all the essential features and help you get started with
                your first project. We've designed this process to be as smooth
                and informative as possible.
              </PageDescription>
            </div>
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
                    The subtitle text content
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
            <li>• Uses muted foreground color for subtle appearance</li>
            <li>• Small text size (text-sm) for secondary information</li>
            <li>• Pairs well with PageTitle for complete page headers</li>
            <li>
              • Can be used in cards, sections, and other layout components
            </li>
            <li>• Supports custom styling through className prop</li>
          </ul>
        </div>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { PageDescription } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
