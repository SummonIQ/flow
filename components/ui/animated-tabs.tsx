'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';
import { cn } from '@/lib/utils';

const AnimatedTabs = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>) => (
  <TabsPrimitive.Root className={cn('', className)} {...props} />
);
AnimatedTabs.displayName = 'AnimatedTabs';

const AnimatedTabsList = ({
  activeHeight,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  activeHeight?: string;
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [prevActiveIndex, setPrevActiveIndex] = React.useState(0);
  const [tabWidths, setTabWidths] = React.useState<number[]>([]);
  const [tabOffsets, setTabOffsets] = React.useState<number[]>([]);
  const listRef = React.useRef<HTMLDivElement>(null);

  const updateTabMeasurements = React.useCallback(() => {
    if (!listRef.current) return;

    const tabs = listRef.current.querySelectorAll('[role="tab"]');
    const widths: number[] = [];
    const offsets: number[] = [];

    tabs.forEach((tab, index) => {
      const rect = tab.getBoundingClientRect();
      const listRect = listRef.current!.getBoundingClientRect();
      widths.push(rect.width);
      offsets.push(rect.left - listRect.left);

      if (tab.getAttribute('data-state') === 'active') {
        setActiveIndex((prev) => {
          setPrevActiveIndex(prev);
          return index;
        });
      }
    });

    setTabWidths(widths);
    setTabOffsets(offsets);
  }, []);

  // Update measurements on mount and when children change
  React.useEffect(() => {
    updateTabMeasurements();
    // Add a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateTabMeasurements, 100);
    return () => clearTimeout(timeoutId);
  }, [children, updateTabMeasurements]);

  // Update measurements on window resize
  React.useEffect(() => {
    const handleResize = () => {
      updateTabMeasurements();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateTabMeasurements]);

  // Watch for tab state changes using MutationObserver
  React.useEffect(() => {
    if (!listRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-state'
        ) {
          updateTabMeasurements();
        }
      });
    });

    const tabs = listRef.current.querySelectorAll('[role="tab"]');
    tabs.forEach((tab) => {
      observer.observe(tab, {
        attributeFilter: ['data-state'],
        attributes: true,
      });
    });

    return () => observer.disconnect();
  }, [children, updateTabMeasurements]);

  React.useEffect(() => {
    const handleClick = () => {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        if (!listRef.current) return;
        const tabs = listRef.current.querySelectorAll('[role="tab"]');
        tabs.forEach((tab, index) => {
          if (tab.getAttribute('data-state') === 'active') {
            setActiveIndex((prev) => {
              setPrevActiveIndex(prev);
              return index;
            });
            // Also update measurements when tab changes
            updateTabMeasurements();
          }
        });
      });
    };

    const listElement = listRef.current;
    listElement?.addEventListener('click', handleClick);
    return () => listElement?.removeEventListener('click', handleClick);
  }, [updateTabMeasurements]);

  return (
    <TabsPrimitive.List
      className={cn(
        'relative flex h-[42px] grow-0 items-center justify-center',
        'text-muted-foreground bg-muted w-fit rounded-lg px-1 py-0',
        'shadow-sm',
        className,
      )}
      ref={listRef}
      {...props}
    >
      {children}

      {/* Animated indicator */}
      {tabWidths.length > 0 && tabOffsets.length > 0 && (
        <div
          className={cn(
            'absolute z-10 h-[78%] rounded-md',
            'shadow-md shadow-black/10',
            'transition-all duration-200 ease-out',
            'bg-background dark:bg-background',
            activeHeight,
          )}
          style={{
            left: `${tabOffsets[activeIndex]}px`,
            width: `${tabWidths[activeIndex]}px`,
          }}
        />
      )}
    </TabsPrimitive.List>
  );
};
AnimatedTabsList.displayName = TabsPrimitive.List.displayName;

const AnimatedTabsTrigger = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'relative inline-flex items-center justify-center',
      'rounded-md px-3 py-1.5 text-sm whitespace-nowrap',
      'ring-offset-background font-medium transition-all',
      'duration-200 focus-visible:outline-none',
      'focus-visible:ring-ring focus-visible:ring-2',
      'focus-visible:ring-offset-2 disabled:pointer-events-none',
      'data-[state=active]:text-foreground disabled:opacity-50',
      'text-muted-foreground z-20',
      className,
    )}
    {...props}
  />
);
AnimatedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

interface AnimatedTabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  scrollable?: boolean;
}

const AnimatedTabsContent = ({
  className,
  scrollable = true,
  ...props
}: AnimatedTabsContentProps) => (
  <TabsPrimitive.Content
    className={cn(
      'ring-offset-background focus-visible:ring-ring px-2 py-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      scrollable && 'h-full max-h-[calc(100vh-12rem)]',
      className,
    )}
    {...props}
  />
);
AnimatedTabsContent.displayName = TabsPrimitive.Content.displayName;

export {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
};

