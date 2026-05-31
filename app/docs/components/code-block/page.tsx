'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { 
  CodeBlock, 
  ComponentPreview,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Badge,
  Button 
} from '@summoniq/applab-ui';

export default function CodeBlockPage() {
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
            CodeBlock Component
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A flexible code block component with syntax highlighting labels, copy functionality,
            and customizable styling. Adapted from the chatterworks/web-app project.
          </p>
        </div>

        {/* Component Overview */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Overview</h2>
            <p className="text-muted-foreground mb-6">
              The CodeBlock component provides a clean, user-friendly way to display code snippets
              with language labels and one-click copy functionality.
            </p>
          </div>

          {/* Examples Grid */}
          <div className="grid grid-cols-1 gap-6">
            {/* ComponentPreview Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">With ComponentPreview</CardTitle>
                <CardDescription>
                  Use ComponentPreview to show both the rendered component and source code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComponentPreview
                  code={`<Button>Click me</Button>`}
                  language="tsx"
                >
                  <Button>Click me</Button>
                </ComponentPreview>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Usage:</p>
                  <CodeBlock
                    language="tsx"
                    code={`<ComponentPreview
  code={\`<Button>Click me</Button>\`}
  language="tsx"
>
  <Button>Click me</Button>
</ComponentPreview>`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Basic Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Usage</CardTitle>
                <CardDescription>
                  Simple code block with TypeScript syntax highlighting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  language="typescript"
                  code={`interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // Fetch user from database
  return db.users.findById(id);
}`}
                />
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Usage:</p>
                  <CodeBlock
                    language="tsx"
                    code={`<CodeBlock
  language="typescript"
  code={\`your code here\`}
/>`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* React/JSX Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">React Component Example</CardTitle>
                <CardDescription>
                  Display React/TSX code with proper syntax highlighting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="tsx"
                  code={`export function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg font-medium',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-900'
      )}
    >
      {children}
    </button>
  );
}`}
                />
              </CardContent>
            </Card>

            {/* Without Copy Button */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hide Copy Button</CardTitle>
                <CardDescription>
                  Optionally hide the copy button using the showCopy prop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  language="javascript"
                  code={`console.log('Hello, World!');`}
                  showCopy={false}
                />
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Usage:</p>
                  <CodeBlock
                    language="tsx"
                    code={`<CodeBlock
  language="javascript"
  code="console.log('Hello, World!');"
  showCopy={false}
/>`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Without Language Label */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hide Language Label</CardTitle>
                <CardDescription>
                  Optionally hide the language label using the showLanguage prop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  language="python"
                  code={`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`}
                  showLanguage={false}
                />
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Usage:</p>
                  <CodeBlock
                    language="tsx"
                    code={`<CodeBlock
  language="python"
  code={\`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)\`}
  showLanguage={false}
/>`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* JSON Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">JSON Configuration</CardTitle>
                <CardDescription>
                  Display JSON data with proper formatting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="json"
                  code={`{
  "name": "@summoniq/applab-ui",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.1.1",
    "lucide-react": "^0.544.0"
  }
}`}
                />
              </CardContent>
            </Card>

            {/* SQL Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SQL Query</CardTitle>
                <CardDescription>
                  Display database queries with SQL syntax
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="sql"
                  code={`SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.status = 'completed'
ORDER BY orders.created_at DESC
LIMIT 10;`}
                />
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
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">code</code>
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">-</td>
                      <td className="py-2">The code content to display (required)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">language</code>
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">'plaintext'</td>
                      <td className="py-2">Programming language for the label</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">showCopy</code>
                      </td>
                      <td className="py-2 pr-4">boolean</td>
                      <td className="py-2 pr-4">true</td>
                      <td className="py-2">Show the copy button</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">showLanguage</code>
                      </td>
                      <td className="py-2 pr-4">boolean</td>
                      <td className="py-2 pr-4">true</td>
                      <td className="py-2">Show the language label</td>
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
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">codeClassName</code>
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">-</td>
                      <td className="py-2">Additional classes for the code element</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Supported Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported Languages</CardTitle>
              <CardDescription>
                Common programming languages and their display labels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                {['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
                  'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS', 'SCSS',
                  'JSON', 'YAML', 'Markdown', 'Bash', 'PowerShell', 'Docker',
                  'GraphQL', 'Haskell', 'Elixir', 'Scala', 'R', 'MATLAB'].map((lang) => (
                  <div key={lang} className="text-muted-foreground">
                    • {lang}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                And many more... See the component source for the full list.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
