'use client';

import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from '@/components/ui/animated-tabs';

/**
 * Simple demo component showing the animated tabs in action
 * This can be imported and used anywhere in the app
 */
export function AnimatedTabsDemo() {
  return (
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
            Notice how the indicator smoothly slides to this tab when selected.
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
            Watch the indicator slide smoothly between tabs with a 200ms transition.
          </p>
        </div>
      </AnimatedTabsContent>

      <AnimatedTabsContent value="tab4">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Fourth Tab Content</h3>
          <p className="text-sm text-muted-foreground">
            The component is fully responsive and works on all screen sizes.
          </p>
        </div>
      </AnimatedTabsContent>
    </AnimatedTabs>
  );
}

