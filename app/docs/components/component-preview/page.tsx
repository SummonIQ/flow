'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { 
  ComponentPreview,
  CodeBlock,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Badge,
  Button,
  Input,
  Label
} from '@summoniq/applab-ui';

export default function ComponentPreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/docs/components"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Components
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline">Components</Badge>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">
            ComponentPreview
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A documentation component that displays UI components with tabs to toggle between
            live preview and source code. Perfect for component libraries and design systems.
          </p>
        </div>

        {/* Component Overview */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Overview</h2>
            <p className="text-muted-foreground mb-6">
              ComponentPreview wraps your components in a tabbed interface, allowing viewers to
              see both the rendered output and the source code that produces it.
            </p>
          </div>

          {/* Examples */}
          <div className="grid grid-cols-1 gap-6">
            {/* Basic Button Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Example</CardTitle>
                <CardDescription>
                  A simple button component with preview and code tabs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComponentPreview
                  code={`<Button>Click me</Button>`}
                  language="tsx"
                >
                  <Button>Click me</Button>
                </ComponentPreview>
              </CardContent>
            </Card>

            {/* Multiple Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multiple Components</CardTitle>
                <CardDescription>
                  Showcase multiple variants of a component
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComponentPreview
                  code={`<div className="flex gap-4">
  <Button>Default</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
</div>`}
                  language="tsx"
                >
                  <div className="flex gap-4">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </ComponentPreview>
              </CardContent>
            </Card>

            {/* Form Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Components</CardTitle>
                <CardDescription>
                  Preview more complex component combinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComponentPreview
                  align="start"
                  code={`<div className="space-y-4 w-full max-w-sm">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="name@example.com" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input id="password" type="password" />
  </div>
  <Button className="w-full">Sign In</Button>
</div>`}
                  language="tsx"
                >
                  <div className="space-y-4 w-full max-w-sm">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="name@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" />
                    </div>
                    <Button className="w-full">Sign In</Button>
                  </div>
                </ComponentPreview>
              </CardContent>
            </Card>

            {/* Default to Code Tab */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Default to Code Tab</CardTitle>
                <CardDescription>
                  Set defaultTab prop to show code first
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComponentPreview
                  defaultTab="code"
                  code={`<Button variant="destructive">Delete Account</Button>`}
                  language="tsx"
                >
                  <Button variant="destructive">Delete Account</Button>
                </ComponentPreview>
              </CardContent>
            </Card>

            {/* Different Alignments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Alignment</CardTitle>
                <CardDescription>
                  Control preview area alignment with the align prop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-2">Start Alignment:</p>
                  <ComponentPreview
                    align="start"
                    code={`<Badge>New Feature</Badge>`}
                    language="tsx"
                  >
                    <Badge>New Feature</Badge>
                  </ComponentPreview>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Center Alignment (default):</p>
                  <ComponentPreview
                    align="center"
                    code={`<Badge variant="outline">Draft</Badge>`}
                    language="tsx"
                  >
                    <Badge variant="outline">Draft</Badge>
                  </ComponentPreview>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">End Alignment:</p>
                  <ComponentPreview
                    align="end"
                    code={`<Badge variant="secondary">Published</Badge>`}
                    language="tsx"
                  >
                    <Badge variant="secondary">Published</Badge>
                  </ComponentPreview>
                </div>
              </CardContent>
            </Card>

            {/* Hide Copy Button */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Without Copy Button</CardTitle>
                <CardDescription>
                  Set showCopy to false to hide the copy button
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComponentPreview
                  showCopy={false}
                  code={`<Button size="lg">Large Button</Button>`}
                  language="tsx"
                >
                  <Button size="lg">Large Button</Button>
                </ComponentPreview>
              </CardContent>
            </Card>
          </div>

          {/* Props Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Props</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold">Prop</th>
                      <th className="text-left py-2 pr-4 font-semibold">Type</th>
                      <th className="text-left py-2 pr-4 font-semibold">Default</th>
                      <th className="text-left py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">children</code>
                      </td>
                      <td className="py-2 pr-4">ReactNode</td>
                      <td className="py-2 pr-4">-</td>
                      <td className="py-2">The component to preview (required)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">code</code>
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">-</td>
                      <td className="py-2">The source code to display (required)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">language</code>
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">'tsx'</td>
                      <td className="py-2">Programming language for syntax highlighting</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">showCopy</code>
                      </td>
                      <td className="py-2 pr-4">boolean</td>
                      <td className="py-2 pr-4">true</td>
                      <td className="py-2">Show copy button in code view</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">defaultTab</code>
                      </td>
                      <td className="py-2 pr-4">'preview' | 'code'</td>
                      <td className="py-2 pr-4">'preview'</td>
                      <td className="py-2">Which tab to show by default</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">align</code>
                      </td>
                      <td className="py-2 pr-4">'start' | 'center' | 'end'</td>
                      <td className="py-2 pr-4">'center'</td>
                      <td className="py-2">Vertical alignment of preview content</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">className</code>
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">-</td>
                      <td className="py-2">Additional classes for the container</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">previewClassName</code>
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">-</td>
                      <td className="py-2">Additional classes for the preview area</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Usage Example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complete Usage Example</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="tsx"
                code={`import { ComponentPreview, Button } from '@summoniq/applab-ui';

export default function ButtonDemo() {
  return (
    <ComponentPreview
      code={\`<Button variant="outline">
  Click me
</Button>\`}
      language="tsx"
      align="center"
    >
      <Button variant="outline">
        Click me
      </Button>
    </ComponentPreview>
  );
}`}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
