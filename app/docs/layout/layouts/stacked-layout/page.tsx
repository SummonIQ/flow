'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StackedLayout,
} from '@summoniq/applab-ui';

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

const navigation = [
  { label: 'Dashboard', href: '#', current: true },
  { label: 'Team', href: '#', current: false },
  { label: 'Projects', href: '#', current: false },
  { label: 'Calendar', href: '#', current: false },
];

export default function StackedLayoutPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">
        Stacked Layout
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        A complete application layout with header navigation, user dropdown, and
        page content
      </p>

      <div className="space-y-12">
        {/* Full Layout Example */}
        <ComponentExample
          title="Complete Stacked Layout"
          description="A full application layout with navigation, user menu, and content area"
          code={`<StackedLayout
  headerProps={{
    navigation: [
      { label: 'Dashboard', href: '#', current: true },
      { label: 'Team', href: '#', current: false },
      { label: 'Projects', href: '#', current: false },
      { label: 'Calendar', href: '#', current: false },
    ],
    user: {
      name: 'Tom Cook',
      email: 'tom@example.com',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e...',
    },
  }}
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Get started with your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your content goes here...</p>
      </CardContent>
    </Card>
  </div>
</StackedLayout>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <StackedLayout
              headerProps={{
                navigation,
                user,
              }}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome</CardTitle>
                      <CardDescription>
                        Get started with your dashboard
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This is your main dashboard where you can view all your
                        important information.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                      <CardDescription>
                        Overview of your metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total Users
                          </span>
                          <span className="font-semibold">1,234</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Active Sessions
                          </span>
                          <span className="font-semibold">89</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        No recent activity to display.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </StackedLayout>
          </div>
        </ComponentExample>

        {/* Border Variant */}
        <ComponentExample
          title="Stacked Layout - Border Variant"
          description="A layout with alternative border styling for the navigation"
          code={`<StackedLayout
  headerProps={{
    navigation: [
      { label: 'Dashboard', href: '#', current: true },
      { label: 'Team', href: '#', current: false },
      { label: 'Projects', href: '#', current: false },
      { label: 'Calendar', href: '#', current: false },
    ],
    user: {
      name: 'Tom Cook',
      email: 'tom@example.com',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e...',
    },
  }}
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Border Variant</CardTitle>
        <CardDescription>Alternative navigation styling</CardDescription>
      </CardHeader>
      <CardContent>
        <p>The border variant provides a cleaner navigation style with rounded corners and hover effects.</p>
      </CardContent>
    </Card>
  </div>
</StackedLayout>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <StackedLayout
              headerProps={{
                navigation,
                user,
              }}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Border Variant</CardTitle>
                      <CardDescription>
                        Alternative navigation styling
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        The border variant provides a cleaner navigation style
                        with rounded corners and hover effects.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Navigation Features</CardTitle>
                      <CardDescription>
                        Enhanced user experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Rounded navigation items</li>
                        <li>• Subtle hover effects</li>
                        <li>• Clear active state indicators</li>
                        <li>• Improved visual hierarchy</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </StackedLayout>
          </div>
        </ComponentExample>

        {/* Minimal Example */}
        <ComponentExample
          title="Minimal Stacked Layout"
          description="A simple layout without user menu"
          code={`<StackedLayout
  headerProps={{
    navigation: [
      { label: 'Home', href: '#', current: true },
      { label: 'About', href: '#', current: false },
      { label: 'Contact', href: '#', current: false },
    ],
  }}
>
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Welcome</h2>
    <p>Your content goes here...</p>
  </div>
</StackedLayout>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <StackedLayout
              headerProps={{
                navigation: [
                  { label: 'Home', href: '#', current: true },
                  { label: 'About', href: '#', current: false },
                  { label: 'Contact', href: '#', current: false },
                ],
              }}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Welcome</h2>
                <p className="text-muted-foreground">
                  This is a minimal stacked layout without user authentication
                  features. Perfect for public-facing pages or simple
                  applications.
                </p>
              </div>
            </StackedLayout>
          </div>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { StackedLayout } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
