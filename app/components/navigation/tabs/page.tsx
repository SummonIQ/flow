'use client';

import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from '@/components/ui/animated-tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@summoniq/applab-ui';
import { ArrowLeft, Code, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TabsComponentPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    router.push('/components/navigation');
  };

  const copyCode = () => {
    const code = `import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from '@/components/ui/animated-tabs';

<AnimatedTabs defaultValue="tab1">
  <AnimatedTabsList>
    <AnimatedTabsTrigger value="tab1">First Tab</AnimatedTabsTrigger>
    <AnimatedTabsTrigger value="tab2">Second Tab</AnimatedTabsTrigger>
  </AnimatedTabsList>
  <AnimatedTabsContent value="tab1">
    First tab content
  </AnimatedTabsContent>
  <AnimatedTabsContent value="tab2">
    Second tab content
  </AnimatedTabsContent>
</AnimatedTabs>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Navigation
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Animated Tabs</h1>
        <p className="text-muted-foreground mt-1">
          Tabs component with smooth animated indicator that slides between tabs
        </p>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Preview</CardTitle>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </CardHeader>
        <CardContent>
          <AnimatedTabs defaultValue="tab1" className="w-full">
            <AnimatedTabsList>
              <AnimatedTabsTrigger value="tab1">First Tab</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="tab2">Second Tab</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="tab3">Third Tab</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="tab4">Fourth Tab</AnimatedTabsTrigger>
            </AnimatedTabsList>

            <AnimatedTabsContent value="tab1">
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">First Tab Content</h3>
                <p className="text-sm text-muted-foreground">
                  Notice how the indicator smoothly slides to this tab when
                  selected.
                </p>
              </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="tab2">
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Second Tab Content</h3>
                <p className="text-sm text-muted-foreground">
                  The animation adjusts to the width of each tab automatically.
                </p>
              </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="tab3">
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Third Tab Content</h3>
                <p className="text-sm text-muted-foreground">
                  Watch the indicator slide smoothly between tabs with a 200ms
                  transition.
                </p>
              </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="tab4">
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Fourth Tab Content</h3>
                <p className="text-sm text-muted-foreground">
                  The component is fully responsive and works on all screen
                  sizes.
                </p>
              </div>
            </AnimatedTabsContent>
          </AnimatedTabs>
        </CardContent>
      </Card>

      {/* Underline Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Underline Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList variant="underline">
              <TabsTrigger value="tab1">Overview</TabsTrigger>
              <TabsTrigger value="tab2">Analytics</TabsTrigger>
              <TabsTrigger value="tab3">Reports</TabsTrigger>
              <TabsTrigger value="tab4">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="tab1">
              <div className="p-6 border rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Overview Content</h3>
                <p className="text-sm text-muted-foreground">
                  The underline variant uses a sliding bottom border indicator.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tab2">
              <div className="p-6 border rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Analytics Content</h3>
                <p className="text-sm text-muted-foreground">
                  Great for page-level navigation or section tabs.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tab3">
              <div className="p-6 border rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Reports Content</h3>
                <p className="text-sm text-muted-foreground">
                  The indicator smoothly animates between tabs.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tab4">
              <div className="p-6 border rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Settings Content</h3>
                <p className="text-sm text-muted-foreground">
                  Works well for dashboard-style interfaces.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Default Variant (Pill Style) */}
      <Card>
        <CardHeader>
          <CardTitle>Default Variant (Pill Style)</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList>
              <TabsTrigger value="tab1">Tab One</TabsTrigger>
              <TabsTrigger value="tab2">Tab Two</TabsTrigger>
              <TabsTrigger value="tab3">Tab Three</TabsTrigger>
            </TabsList>

            <TabsContent value="tab1">
              <div className="p-6 border rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Tab One Content</h3>
                <p className="text-sm text-muted-foreground">
                  The default variant uses a pill-style indicator.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tab2">
              <div className="p-6 border rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Tab Two Content</h3>
                <p className="text-sm text-muted-foreground">
                  Good for compact tab groups and toolbars.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tab3">
              <div className="p-6 border rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Tab Three Content</h3>
                <p className="text-sm text-muted-foreground">
                  Both variants support smooth animation transitions.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Default Variant</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { Tabs, TabsContent, TabsList, TabsTrigger } from '@summoniq/applab-ui';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`}</code>
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Underline Variant</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`<Tabs defaultValue="tab1">
  <TabsList variant="underline">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
