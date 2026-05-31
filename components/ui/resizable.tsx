'use client';

import { GripVertical } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';
import { useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

import { cn } from '@/lib/utils';

type GroupProps = Omit<
  React.ComponentProps<typeof ResizablePrimitive.Group>,
  'onLayout' | 'onLayoutChange' | 'orientation'
>;

type ResizablePanelGroupProps = GroupProps & {
  autoSaveId?: string;
  direction?: 'horizontal' | 'vertical';
  onLayout?: (layout: number[]) => void;
  onLayoutChange?: React.ComponentProps<
    typeof ResizablePrimitive.Group
  >['onLayoutChange'];
};

const getLayoutStorageKey = (id: string) => `resizable-panels:${id}`;

const isLayoutMap = (
  value: unknown,
): value is Record<string, number> =>
  Boolean(
    value &&
      typeof value === 'object' &&
      Object.values(value as Record<string, unknown>).every(
        item => typeof item === 'number',
      ),
  );

const ResizablePanelGroup = ({
  autoSaveId,
  className,
  direction = 'horizontal',
  onLayout,
  onLayoutChange,
  groupRef,
  ...props
}: ResizablePanelGroupProps) => {
  const internalGroupRef =
    useRef<ResizablePrimitive.GroupImperativeHandle | null>(null);

  const restorePersistedLayout = useCallback(
    (instance: ResizablePrimitive.GroupImperativeHandle | null) => {
      if (!autoSaveId) return;
      if (typeof window === 'undefined') return;
      if (!instance) return;

      try {
        const raw = window.localStorage.getItem(getLayoutStorageKey(autoSaveId));
        if (!raw) return;

        const parsed = JSON.parse(raw);
        if (!isLayoutMap(parsed)) return;

        instance.setLayout(parsed);
      } catch {
        // Ignore malformed or inaccessible storage values.
      }
    },
    [autoSaveId],
  );

  const handleGroupRef = useCallback(
    (instance: ResizablePrimitive.GroupImperativeHandle | null) => {
      internalGroupRef.current = instance;
      restorePersistedLayout(instance);

      if (typeof groupRef === 'function') {
        groupRef(instance);
        return;
      }

      if (groupRef && 'current' in groupRef) {
        (
          groupRef as MutableRefObject<ResizablePrimitive.GroupImperativeHandle | null>
        ).current = instance;
      }
    },
    [groupRef, restorePersistedLayout],
  );

  useEffect(() => {
    restorePersistedLayout(internalGroupRef.current);
  }, [restorePersistedLayout]);

  const handleLayoutChange = useCallback<
    NonNullable<React.ComponentProps<typeof ResizablePrimitive.Group>['onLayoutChange']>
  >(
    layout => {
      if (autoSaveId && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            getLayoutStorageKey(autoSaveId),
            JSON.stringify(layout),
          );
        } catch {
          // Ignore storage write errors.
        }
      }

      onLayoutChange?.(layout);
      if (onLayout) {
        onLayout(
          Array.isArray(layout)
            ? layout
            : Object.values(layout).filter(
                value => typeof value === 'number',
              ),
        );
      }
    },
    [autoSaveId, onLayout, onLayoutChange],
  );

  return (
    <ResizablePrimitive.Group
      orientation={direction}
      groupRef={handleGroupRef}
      onLayoutChange={handleLayoutChange}
      className={cn(
        'flex h-full w-full aria-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  );
};

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.Separator
    className={cn(
      'relative flex w-px items-center justify-center bg-muted/25 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=horizontal]:after:translate-x-0 [&[aria-orientation=horizontal]>div]:rotate-90',
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border/90 bg-border/90">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.Separator>
);

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
