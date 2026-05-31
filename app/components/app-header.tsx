'use client';

import { ChevronLeft, ChevronRight, Search, Workflow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AiChatPopover } from '@summoniq/applab-ui';

export function AppHeader() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setIsMacOS(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex h-11 items-center justify-between border-b border-border/60 bg-background/82 px-3 backdrop-blur-md ${isMacOS ? 'pl-20' : ''}`}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: App Icon & Name */}
      <div className="flex items-center gap-2.5 w-[230px] pl-[4px]">
        <div className="h-6 w-6 rounded-md bg-linear-to-br from-emerald-500 via-teal-600 to-cyan-600 border-t border-t-emerald-300/75 flex items-center justify-center">
          <Workflow className="h-3.5 w-3.5 text-[#e879f9]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <h1 className="font-semibold text-[13px] text-foreground">Flow</h1>
          <p className="text-[10px] text-muted-foreground">v0.1.0</p>
        </div>
      </div>

      {/* Navigation & Search */}
      <div className="flex-1 flex items-center gap-3">
        {/* Navigation Buttons */}
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            aria-label="Go back"
            className="rounded-md border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-border/60 hover:bg-background/70 hover:text-foreground"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Go forward"
            className="rounded-md border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-border/60 hover:bg-background/70 hover:text-foreground"
            onClick={() => router.forward()}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div
          className="flex-1 max-w-lg relative"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-border/60 bg-background/70 py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/80 transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search email, schedules, projects..."
            type="search"
          />
        </div>
      </div>

      {/* Right: AI Assistant */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {mounted && <AiChatPopover />}
      </div>
    </div>
  );
}
