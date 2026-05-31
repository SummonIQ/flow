'use client';

import { Minus, X } from 'lucide-react';

import { ThemeToggle } from '@/components/themes/theme-toggle';

interface ElectronWindow {
  electron?: {
    window?: {
      close?: () => void;
      minimize?: () => void;
    };
  };
}

declare const window: ElectronWindow;

export function WindowControls() {
  return (
    <div
      className="flex items-center gap-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <ThemeToggle />

      <button
        aria-label="Minimize"
        className="w-6 h-6 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-all duration-200 flex items-center justify-center group cursor-pointer"
        onClick={() => {
          if (
            typeof window !== 'undefined' &&
            window.electron?.window?.minimize
          ) {
            window.electron.window.minimize();
          }
        }}
      >
        <Minus className="w-3.5 h-3.5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
      </button>

      <button
        aria-label="Close"
        className="w-6 h-6 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center group cursor-pointer"
        onClick={() => {
          if (typeof window !== 'undefined' && window.electron?.window?.close) {
            window.electron.window.close();
          }
        }}
      >
        <X className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300 transition-colors" />
      </button>
    </div>
  );
}
