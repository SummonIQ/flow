'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function CriticalErrorListener() {
  const shownErrors = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electron) return;

    // Listen for critical errors with suggested fixes
    const unsubscribeCritical = window.electron.applications.onCriticalError?.(
      data => {
        // Deduplicate errors within a short time window
        const errorKey = `${data.appId}-${data.error}`;
        if (shownErrors.current.has(errorKey)) return;

        shownErrors.current.add(errorKey);
        setTimeout(() => shownErrors.current.delete(errorKey), 5000);

        toast.error(`${data.appId}: ${data.error}`, {
          description: data.suggestion,
          duration: 10000,
          action: data.command
            ? {
                label: 'Copy Fix',
                onClick: () => {
                  navigator.clipboard.writeText(data.command!);
                  toast.success('Command copied to clipboard', {
                    description: 'Paste in terminal to run the fix',
                  });
                },
              }
            : undefined,
        });
      },
    );

    // Listen for app status changes (crashed, stopped)
    const unsubscribeStatus = window.electron.applications.onStatusChange?.(
      data => {
        if (data.status === 'crashed') {
          toast.error(`${data.appId} crashed`, {
            description: data.message || `Exit code: ${data.exitCode}`,
            duration: 8000,
          });
        }
      },
    );

    return () => {
      if (unsubscribeCritical) unsubscribeCritical();
      if (unsubscribeStatus) unsubscribeStatus();
    };
  }, []);

  return null;
}
