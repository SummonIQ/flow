'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Badge,
  Button,
  PageActions,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@summoniq/applab-ui';

export default function PageHeaderPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">PageHeader</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Page header component for displaying page titles and header content with
        consistent spacing and layout
      </p>

      <div className="space-y-12">
        {/* Basic PageHeader */}
        <ComponentExample
          title="Basic PageHeader with Title"
          description="Simple page header with a title prop"
          code={`<PageHeader title="Dashboard" />`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <PageHeader title="Dashboard" />
          </div>
        </ComponentExample>

        {/* PageHeader with Custom Content */}
        <ComponentExample
          title="PageHeader with Custom Content"
          description="Page header with custom children instead of title prop"
          code={`<PageHeader>
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Project Settings
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your project configuration and preferences
      </p>
    </div>
    <Button>Save Changes</Button>
  </div>
</PageHeader>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <PageHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Project Settings
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage your project configuration and preferences
                  </p>
                </div>
                <Button>Save Changes</Button>
              </div>
            </PageHeader>
          </div>
        </ComponentExample>

        {/* PageHeader with Breadcrumbs */}
        <ComponentExample
          title="PageHeader with Breadcrumbs"
          description="Page header with navigation breadcrumbs and actions"
          code={`<PageHeader>
  <div className="space-y-4">
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <a href="#" className="text-sm text-muted-foreground hover:text-muted-foreground">
            Projects
          </a>
        </li>
        <li>
          <span className="text-muted-foreground">/</span>
        </li>
        <li>
          <a href="#" className="text-sm text-muted-foreground hover:text-muted-foreground">
            Website Redesign
          </a>
        </li>
        <li>
          <span className="text-muted-foreground">/</span>
        </li>
        <li>
          <span className="text-sm font-medium text-foreground">
            Settings
          </span>
        </li>
      </ol>
    </nav>
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Website Redesign Settings
      </h1>
      <div className="flex items-center gap-2">
        <Badge>Active</Badge>
        <Button variant="outline">Export</Button>
        <Button>Save</Button>
      </div>
    </div>
  </div>
</PageHeader>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <PageHeader>
              <div className="space-y-4">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-muted-foreground"
                      >
                        Projects
                      </a>
                    </li>
                    <li>
                      <span className="text-muted-foreground">/</span>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-muted-foreground"
                      >
                        Website Redesign
                      </a>
                    </li>
                    <li>
                      <span className="text-muted-foreground">/</span>
                    </li>
                    <li>
                      <span className="text-sm font-medium text-foreground">
                        Settings
                      </span>
                    </li>
                  </ol>
                </nav>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Website Redesign Settings
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge>Active</Badge>
                    <Button variant="outline">Export</Button>
                    <Button>Save</Button>
                  </div>
                </div>
              </div>
            </PageHeader>
          </div>
        </ComponentExample>

        {/* PageHeader with Stats */}
        <ComponentExample
          title="PageHeader with Statistics"
          description="Page header with key metrics and statistics"
          code={`<PageHeader>
  <div className="space-y-6">
    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      Analytics Dashboard
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-card p-4 rounded-lg border border-border/70">
        <div className="text-2xl font-bold text-foreground">2,345</div>
        <div className="text-sm text-muted-foreground">Total Users</div>
      </div>
      <div className="bg-card p-4 rounded-lg border border-border/70">
        <div className="text-2xl font-bold text-foreground">89%</div>
        <div className="text-sm text-muted-foreground">Conversion Rate</div>
      </div>
      <div className="bg-card p-4 rounded-lg border border-border/70">
        <div className="text-2xl font-bold text-foreground">$12,345</div>
        <div className="text-sm text-muted-foreground">Revenue</div>
      </div>
      <div className="bg-card p-4 rounded-lg border border-border/70">
        <div className="text-2xl font-bold text-foreground">156</div>
        <div className="text-sm text-muted-foreground">Active Sessions</div>
      </div>
    </div>
  </div>
</PageHeader>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <PageHeader>
              <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Analytics Dashboard
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card p-4 rounded-lg border border-border/70">
                    <div className="text-2xl font-bold text-foreground">
                      2,345
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Users
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border/70">
                    <div className="text-2xl font-bold text-foreground">
                      89%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Conversion Rate
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border/70">
                    <div className="text-2xl font-bold text-foreground">
                      $12,345
                    </div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border/70">
                    <div className="text-2xl font-bold text-foreground">
                      156
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Sessions
                    </div>
                  </div>
                </div>
              </div>
            </PageHeader>
          </div>
        </ComponentExample>

        {/* PageHeader with Custom Styling */}
        <ComponentExample
          title="PageHeader with Custom Styling"
          description="Page header with custom background and styling"
          code={`<PageHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
  <h1 className="text-3xl font-bold tracking-tight">
    Welcome to Your Dashboard
  </h1>
  <p className="mt-2 text-primary/80">
    Manage your projects and track your progress
  </p>
</PageHeader>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <PageHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to Your Dashboard
              </h1>
              <p className="mt-2 text-primary/80">
                Manage your projects and track your progress
              </p>
            </PageHeader>
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
                    title
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Page title to display (alternative to children)
                  </td>
                </tr>
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
                    Custom content to render in the header
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
                    Additional CSS classes for the header
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* New Composable API */}
        <ComponentExample
          title="New Composable API"
          description="PageHeader now supports title, description, and actions props for easier composition"
          code={`<PageHeader
  title="Project Settings"
  description="Configure your project preferences and options"
  actions={
    <>
      <Button variant="outline">Reset</Button>
      <Button>Save Changes</Button>
    </>
  }
/>`}
        >
          <PageHeader>
            <PageTitle>Project Settings</PageTitle>
            <PageDescription>
              Configure your project preferences and options
            </PageDescription>
            <PageActions>
              <Button variant="outline" size="sm">
                Reset
              </Button>
              <Button size="sm">Save Changes</Button>
            </PageActions>
          </PageHeader>
        </ComponentExample>

        {/* Composable Components */}
        <ComponentExample
          title="Using Individual Components"
          description="You can also use PageTitle, PageDescription, and PageActions separately"
          code={`import { PageTitle, PageDescription, PageActions } from '@summoniq/applab-ui'

<div className="space-y-4">
  <PageTitle>Analytics Dashboard</PageTitle>
  <PageDescription>Monitor your key performance metrics</PageDescription>
  <div className="flex justify-start">
    <PageActions>
      <Button>Export Data</Button>
      <Button variant="outline">Refresh</Button>
    </PageActions>
  </div>
</div>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <div className="space-y-4">
              <PageTitle>Analytics Dashboard</PageTitle>
              <PageDescription>
                Monitor your key performance metrics
              </PageDescription>
              <div className="flex justify-start">
                <PageActions>
                  <Button size="sm">Export Data</Button>
                  <Button variant="outline" size="sm">
                    Refresh
                  </Button>
                </PageActions>
              </div>
            </div>
          </div>
        </ComponentExample>

        {/* Usage Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Usage Notes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Use the <code className="bg-muted/30 px-1 rounded">title</code>{' '}
              prop for simple page titles
            </li>
            <li>
              • Use{' '}
              <code className="bg-muted/30 px-1 rounded">description</code> prop
              for additional context
            </li>
            <li>
              • Use <code className="bg-muted/30 px-1 rounded">actions</code>{' '}
              prop for header buttons and controls
            </li>
            <li>
              • Use <code className="bg-muted/30 px-1 rounded">children</code>{' '}
              for completely custom header layouts
            </li>
            <li>
              • The header automatically applies proper spacing and max-width
              constraints
            </li>
            <li>
              • Individual components (PageTitle, PageDescription, PageActions)
              can be used separately
            </li>
          </ul>
        </div>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { 
  PageHeader, 
  PageTitle, 
  PageDescription, 
  PageActions 
} from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
