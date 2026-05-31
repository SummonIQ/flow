'use client';

import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Switch({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer px-0.5',
        'border-border/50 items-center rounded-full border-2 transition-colors',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        'focus-visible:ring-offset-background focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=unchecked]:bg-input data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'bg-background border-border/20 pointer-events-auto block size-4 rounded-full shadow-lg ring-0 shadow-black/20 transition-transform duration-150 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 active:scale-90',
        )}
      />
    </SwitchPrimitives.Root>
  );
}
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
