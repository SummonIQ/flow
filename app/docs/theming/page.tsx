'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Page,
  ThemeBackgroundMenu,
  ThemeColorMenu,
  ThemeCustomizer,
  ThemeMenu,
  ThemeProvider,
} from '@summoniq/applab-ui';
import { Paintbrush, Palette, Settings } from 'lucide-react';

export default function ThemingPage() {
  return (
    <ThemeProvider defaultTheme="default">
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Theme System
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Comprehensive theming system with predefined themes, custom colors,
            and real-time customization
          </p>

          <div className="space-y-12">
            {/* Theme Provider Setup */}
            <ComponentExample
              title="Theme Provider Setup"
              description="Wrap your application with ThemeProvider to enable theming"
              code={`import { ThemeProvider } from '@summoniq/applab-ui'

function App() {
  return (
    <ThemeProvider defaultTheme="default" storageKey="my-app-theme">
      <YourApp />
    </ThemeProvider>
  )
}`}
            >
              <div className="border border-border rounded-lg p-6 bg-muted">
                <p className="text-sm text-muted-foreground">
                  The ThemeProvider is already active on this page. All theme
                  changes will be applied automatically.
                </p>
              </div>
            </ComponentExample>

            {/* Theme Menu */}
            <ComponentExample
              title="Theme Menu"
              description="Quick theme selector with predefined theme options"
              code={`<ThemeMenu 
  showCustomOption={true}
  onCustomThemeClick={() => console.log('Open custom theme editor')}
/>`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <ThemeMenu
                  showCustomOption={true}
                  onCustomThemeClick={() =>
                    console.log('Open custom theme editor')
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Try switching between different theme presets
                </p>
              </div>
            </ComponentExample>

            {/* Color Customization */}
            <ComponentExample
              title="Color Customization"
              description="Individual color controls for fine-tuned customization"
              code={`<div className="space-y-2">
  <ThemeColorMenu colorKey="primary" label="Primary Color" />
  <ThemeColorMenu colorKey="secondary" label="Secondary Color" />
  <ThemeColorMenu colorKey="accent" label="Accent Color" />
</div>`}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <ThemeColorMenu colorKey="primary" label="Primary Color" />
                  <p className="text-sm text-muted-foreground">
                    Customize the primary brand color
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <ThemeColorMenu
                    colorKey="secondary"
                    label="Secondary Color"
                  />
                  <p className="text-sm text-muted-foreground">
                    Adjust secondary UI elements
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <ThemeColorMenu colorKey="accent" label="Accent Color" />
                  <p className="text-sm text-muted-foreground">
                    Set accent and highlight colors
                  </p>
                </div>
              </div>
            </ComponentExample>

            {/* Background Customization */}
            <ComponentExample
              title="Background Customization"
              description="Background patterns, gradients, and custom images"
              code={`<ThemeBackgroundMenu 
  onBackgroundChange={(bg) => console.log('Background changed:', bg)}
/>`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <ThemeBackgroundMenu
                  onBackgroundChange={bg =>
                    console.log('Background changed:', bg)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Choose from solid colors, gradients, patterns, or custom
                  images
                </p>
              </div>
            </ComponentExample>

            {/* Complete Theme Customizer */}
            <ComponentExample
              title="Complete Theme Customizer"
              description="Full-featured theme customization panel"
              code={`<ThemeCustomizer 
  side="right"
  trigger={
    <Button variant="outline">
      <Settings className="h-4 w-4 mr-2" />
      Open Theme Editor
    </Button>
  }
/>`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <ThemeCustomizer
                  side="right"
                  trigger={
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Open Theme Editor
                    </Button>
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Complete theme editor with all customization options
                </p>
              </div>
            </ComponentExample>

            {/* Theme Preview */}
            <ComponentExample
              title="Theme Preview"
              description="See how your theme affects different UI components"
              code={`// Components automatically use theme colors
<Card>
  <CardHeader>
    <CardTitle>Themed Components</CardTitle>
    <CardDescription>All components respect the current theme</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Button>Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Badge>Themed Badge</Badge>
    </div>
  </CardContent>
</Card>`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Themed Components</CardTitle>
                    <CardDescription>
                      All components respect the current theme
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button size="sm">Primary</Button>
                      <Button variant="secondary" size="sm">
                        Secondary
                      </Button>
                      <Button variant="outline" size="sm">
                        Outline
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                    <div className="space-y-2">
                      <Label>Themed Input</Label>
                      <Input placeholder="This input uses theme colors" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Color Palette</CardTitle>
                    <CardDescription>
                      Current theme color values
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-primary border border-border/70" />
                        <span className="text-xs">Primary</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-secondary border border-border/70" />
                        <span className="text-xs">Secondary</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-accent border border-border/70" />
                        <span className="text-xs">Accent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-muted border border-border/70" />
                        <span className="text-xs">Muted</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ComponentExample>

            {/* Page Layout with Theme */}
            <ComponentExample
              title="Complete Page Layout"
              description="Full page layout that adapts to the current theme"
              code={`<Page
  headerProps={{
    title: "Themed Dashboard",
    description: "This page adapts to your selected theme",
    actions: (
      <>
        <Button variant="outline">Export</Button>
        <Button>Create New</Button>
      </>
    )
  }}
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Theme-aware content</p>
      </CardContent>
    </Card>
  </div>
</Page>`}
            >
              <div className="border border-border rounded-lg overflow-hidden">
                <Page
                  headerProps={{
                    title: 'Themed Dashboard',
                    description: 'This page adapts to your selected theme',
                    actions: (
                      <>
                        <Button variant="outline" size="sm">
                          Export
                        </Button>
                        <Button size="sm">Create New</Button>
                      </>
                    ),
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Analytics</CardTitle>
                        <CardDescription>View your metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">2,345</div>
                        <p className="text-sm text-muted-foreground">
                          Total users
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue</CardTitle>
                        <CardDescription>Monthly earnings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$12,345</div>
                        <p className="text-sm text-muted-foreground">
                          This month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Growth</CardTitle>
                        <CardDescription>User growth rate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">+23%</div>
                        <p className="text-sm text-muted-foreground">
                          vs last month
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </Page>
              </div>
            </ComponentExample>

            {/* Usage Instructions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">
                Usage Instructions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="h-5 w-5 mr-2" />
                      Getting Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <p>
                        <strong>1. Wrap your app:</strong> Add ThemeProvider to
                        your root component
                      </p>
                      <p>
                        <strong>2. Add theme controls:</strong> Use ThemeMenu
                        for quick switching
                      </p>
                      <p>
                        <strong>3. Customize colors:</strong> Use ThemeColorMenu
                        for specific colors
                      </p>
                      <p>
                        <strong>4. Full editor:</strong> Use ThemeCustomizer for
                        complete control
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Paintbrush className="h-5 w-5 mr-2" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <p>• 5 predefined theme presets</p>
                      <p>• Custom color picker with presets</p>
                      <p>• Background patterns and gradients</p>
                      <p>• Real-time theme switching</p>
                      <p>• Local storage persistence</p>
                      <p>• Export/import theme configs</p>
                      <p>• CSS variable based system</p>
                      <p>• TypeScript support</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Import Examples */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Import Statements
              </h3>
              <CodeBlock
                code={`import { 
  ThemeProvider,
  ThemeMenu,
  ThemeColorMenu,
  ThemeBackgroundMenu,
  ThemeCustomizer,
  useTheme
} from '@summoniq/applab-ui'`}
                language="typescript"
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
