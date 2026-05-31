'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@summoniq/applab-ui';

export default function TabsPage() {
  return (
    <div className="p-6 max-w-6xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Tabs</h1>
        <p className="text-lg text-muted-foreground">
          Animated tabs component with sliding indicator
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Basic Example</h2>
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="account">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
                  <p className="text-muted-foreground">
                    Manage your account settings and preferences here.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="password">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Password Settings</h3>
                  <p className="text-muted-foreground">
                    Update your password and security settings.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="notifications">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
                  <p className="text-muted-foreground">
                    Configure how you receive notifications.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Many Tabs</h2>
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Overview</h3>
                  <p className="text-muted-foreground">
                    Dashboard overview and key metrics.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="analytics">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and insights.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="reports">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Reports</h3>
                  <p className="text-muted-foreground">
                    Generate and view reports.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="settings">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Settings</h3>
                  <p className="text-muted-foreground">
                    Application settings and configuration.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="team">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Team</h3>
                  <p className="text-muted-foreground">
                    Manage team members and permissions.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="billing">
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Billing</h3>
                  <p className="text-muted-foreground">
                    Billing and subscription management.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Scrollable Content</h2>
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="long-content">
              <TabsList>
                <TabsTrigger value="long-content">Long Content</TabsTrigger>
                <TabsTrigger value="short-content">Short Content</TabsTrigger>
              </TabsList>
              <TabsContent value="long-content" scrollable={true}>
                <div className="p-4 rounded-lg border space-y-4">
                  <h3 className="text-lg font-semibold">Scrollable Content Example</h3>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <p key={i} className="text-muted-foreground">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="short-content" scrollable={false}>
                <div className="p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Short Content</h3>
                  <p className="text-muted-foreground">
                    This content is short and doesn't need scrolling.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Animated Indicator</CardTitle>
              <CardDescription>
                Smooth sliding animation that follows the active tab
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Responsive Design</CardTitle>
              <CardDescription>
                Automatically adjusts to different screen sizes and tab widths
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Accessible</CardTitle>
              <CardDescription>
                Built with Radix UI for full keyboard navigation and screen reader support
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Scrollable Content</CardTitle>
              <CardDescription>
                Optional scrollable prop for content areas with overflow
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">API Reference</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Tabs</h3>
                <p className="text-muted-foreground mb-2">
                  Root component that wraps all tab elements.
                </p>
                <code className="text-sm bg-muted/30 bg-card px-2 py-1 rounded">
                  defaultValue?: string
                </code>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">TabsList</h3>
                <p className="text-muted-foreground mb-2">
                  Container for tab triggers with animated indicator.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">TabsTrigger</h3>
                <p className="text-muted-foreground mb-2">
                  Individual tab button.
                </p>
                <code className="text-sm bg-muted/30 bg-card px-2 py-1 rounded">
                  value: string
                </code>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">TabsContent</h3>
                <p className="text-muted-foreground mb-2">
                  Content area for each tab.
                </p>
                <div className="space-x-2">
                  <code className="text-sm bg-muted/30 bg-card px-2 py-1 rounded">
                    value: string
                  </code>
                  <code className="text-sm bg-muted/30 bg-card px-2 py-1 rounded">
                    scrollable?: boolean
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
