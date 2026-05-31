'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  PageTitle,
} from '@summoniq/applab-ui';

export default function PageTitlePage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">PageTitle</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Semantic page title component with multiple heading levels and
        consistent styling
      </p>

      <div className="space-y-12">
        {/* Default PageTitle */}
        <ComponentExample
          title="Default PageTitle (H1)"
          description="Default page title using h1 element"
          code={`<PageTitle>Dashboard Overview</PageTitle>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <PageTitle>Dashboard Overview</PageTitle>
          </div>
        </ComponentExample>

        {/* Different Heading Levels */}
        <ComponentExample
          title="Different Heading Levels"
          description="PageTitle with different semantic heading levels"
          code={`<PageTitle className="text-3xl">Heading Level 1</PageTitle>
<PageTitle className="text-2xl">Heading Level 2</PageTitle>
<PageTitle className="text-xl">Heading Level 3</PageTitle>
<PageTitle className="text-lg">Heading Level 4</PageTitle>
<PageTitle className="text-base">Heading Level 5</PageTitle>
<PageTitle className="text-sm">Heading Level 6</PageTitle>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40 space-y-4">
            <PageTitle className="text-3xl">Heading Level 1</PageTitle>
            <PageTitle className="text-2xl">Heading Level 2</PageTitle>
            <PageTitle className="text-xl">Heading Level 3</PageTitle>
            <PageTitle className="text-lg">Heading Level 4</PageTitle>
            <PageTitle className="text-base">Heading Level 5</PageTitle>
            <PageTitle className="text-sm">Heading Level 6</PageTitle>
          </div>
        </ComponentExample>

        {/* Custom Styling */}
        <ComponentExample
          title="Custom Styling"
          description="PageTitle with custom CSS classes"
          code={`<PageTitle className="text-primary">Blue Title</PageTitle>
<PageTitle className="text-primary underline">Green Underlined Title</PageTitle>
<PageTitle className="bg-yellow-100 p-4 rounded-lg">Title with Background</PageTitle>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40 space-y-4">
            <PageTitle className="text-primary">Blue Title</PageTitle>
            <PageTitle className="text-primary underline">
              Green Underlined Title
            </PageTitle>
            <PageTitle className="bg-yellow-100 p-4 rounded-lg">
              Title with Background
            </PageTitle>
          </div>
        </ComponentExample>

        {/* In Context Examples */}
        <ComponentExample
          title="In Context Usage"
          description="PageTitle used within cards and layouts"
          code={`<Card>
  <CardHeader>
    <PageTitle className="text-xl">Project Settings</PageTitle>
    <CardDescription>Configure your project preferences</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
</Card>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <PageTitle className="text-xl">Project Settings</PageTitle>
                <CardDescription>
                  Configure your project preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card uses PageTitle level 3 for the heading.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <PageTitle className="text-lg">User Management</PageTitle>
                <CardDescription>
                  Manage team members and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card uses PageTitle level 4 for a smaller heading.
                </p>
              </CardContent>
            </Card>
          </div>
        </ComponentExample>

        {/* Accessibility Example */}
        <ComponentExample
          title="Accessibility Considerations"
          description="Proper heading hierarchy for screen readers"
          code={`<div>
  <PageTitle className="text-3xl">Main Page Title</PageTitle>
  <div className="mt-8">
    <PageTitle className="text-2xl">Section Title</PageTitle>
    <div className="mt-4">
      <PageTitle className="text-xl">Subsection Title</PageTitle>
      <p>Content under subsection...</p>
    </div>
  </div>
</div>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <PageTitle className="text-3xl">Main Page Title</PageTitle>
            <div className="mt-8">
              <PageTitle className="text-2xl">Section Title</PageTitle>
              <div className="mt-4">
                <PageTitle className="text-xl">Subsection Title</PageTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Proper heading hierarchy helps screen readers navigate content
                  structure.
                </p>
              </div>
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
                    The title text content
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
              • Use appropriate heading levels for semantic HTML structure
            </li>
            <li>
              • Level 1 should typically be used once per page for the main
              title
            </li>
            <li>• Maintain proper heading hierarchy (don't skip levels)</li>
            <li>
              • Each level has predefined font sizes and weights for consistency
            </li>
            <li>
              • All titles use gray-900 color by default for good contrast
            </li>
          </ul>
        </div>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { PageTitle } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
