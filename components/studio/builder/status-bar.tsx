'use client';

import { useBuilderStore } from '@/lib/studio/store';
import { Maximize2, Scan, ZoomIn, ZoomOut } from 'lucide-react';

interface StatusBarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function StatusBar({ zoom, onZoomChange }: StatusBarProps) {
  const { outlineMode, toggleOutlineMode, project } = useBuilderStore();
  const MIN_ZOOM = 25;
  const MAX_ZOOM = 200;
  const STEP = 10;

  const handleZoomIn = () => {
    const next = Math.min(MAX_ZOOM, zoom + STEP);
    if (next !== zoom) {
      onZoomChange(next);
    }
  };

  const handleZoomOut = () => {
    const next = Math.max(MIN_ZOOM, zoom - STEP);
    if (next !== zoom) {
      onZoomChange(next);
    }
  };

  const handleZoomReset = () => {
    onZoomChange(100);
  };

  return (
    <div className="h-9 bg-card border-t border-border flex items-center justify-between px-4 text-xs select-none relative z-60">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">SummonIQ Studio</span>
      </div>

      {project && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1 hover:bg-accent rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>

          <button
            onClick={handleZoomReset}
            className="px-2 py-0.5 hover:bg-accent rounded transition-colors min-w-[60px] text-center font-medium"
            title="Reset zoom to 100%"
          >
            {Math.round(zoom)}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1 hover:bg-accent rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={handleZoomReset}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="Fit to screen"
          >
            <Maximize2 size={14} />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={toggleOutlineMode}
            className={`p-1 rounded transition-colors ${
              outlineMode
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
            title={outlineMode ? 'Disable outline mode' : 'Enable outline mode'}
          >
            <Scan size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
