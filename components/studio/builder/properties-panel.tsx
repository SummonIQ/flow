'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/studio/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/studio/ui/select';
import { useTheme } from '@/components/themes/theme-provider';
import { useBuilderStore } from '@/lib/studio/store';
import {
  BASE_THEMES,
  CANVAS_COLOR_THEMES,
  applyBaseTheme,
  applyCanvasTheme,
  loadBaseTheme,
  loadCanvasTheme,
  saveCanvasTheme,
  type BaseTheme,
  type CanvasColorTheme,
} from '@/lib/studio/themes';
import { cn } from '@/lib/utils';
import { EventAction, EventType } from '@/types/studio/builder';
import { motion, useDragControls } from 'framer-motion';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowRightLeft,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GripVertical,
  LayoutGrid,
  Link2,
  Maximize2,
  Paintbrush,
  Palette,
  Settings,
  Sliders,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { EventEditor } from './event-editor';

// Tailwind class mappings
const SPACING_OPTIONS = {
  'X-Small': '0.25rem',
  Small: '0.5rem',
  Medium: '1rem',
  Large: '1.5rem',
  'X-Large': '2rem',
};

const RADIUS_OPTIONS = {
  None: '0',
  Small: '0.25rem',
  Medium: '0.375rem',
  Large: '0.5rem',
  'X-Large': '0.75rem',
  '2X-Large': '1rem',
  Full: '9999px',
};

const FONT_SIZE_OPTIONS = {
  'X-Small': '0.75rem',
  Small: '0.875rem',
  Medium: '1rem',
  Large: '1.125rem',
  'X-Large': '1.25rem',
  '2X-Large': '1.5rem',
  '3X-Large': '1.875rem',
  '4X-Large': '2.25rem',
};

const TEXT_ALIGN_OPTIONS = {
  Left: 'left',
  Center: 'center',
  Right: 'right',
} as const;

const LINE_HEIGHT_OPTIONS = {
  Tight: '1.25',
  Normal: '1.5',
  Relaxed: '1.75',
  Loose: '2',
} as const;

const LETTER_SPACING_OPTIONS = {
  Tighter: '-0.05em',
  Tight: '-0.025em',
  Normal: 'normal',
  Wide: '0.025em',
  Wider: '0.05em',
} as const;

const TEXT_TRANSFORM_OPTIONS = {
  None: 'none',
  Uppercase: 'uppercase',
  Lowercase: 'lowercase',
  Capitalize: 'capitalize',
} as const;

const TEXT_DECORATION_OPTIONS = {
  None: 'none',
  Underline: 'underline',
  'Line Through': 'line-through',
} as const;

const GAP_OPTIONS = {
  None: '0',
  'X-Small': '0.25rem',
  Small: '0.5rem',
  Medium: '1rem',
  Large: '1.5rem',
  'X-Large': '2rem',
};

const WIDTH_OPTIONS = {
  Auto: 'auto',
  Full: '100%',
  Screen: '100vw',
  Min: 'min-content',
  Max: 'max-content',
  Fit: 'fit-content',
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '3/4': '75%',
  'Small (20rem)': '20rem',
  'Medium (28rem)': '28rem',
  'Large (32rem)': '32rem',
  'X-Large (36rem)': '36rem',
  '2X-Large (42rem)': '42rem',
  '3X-Large (48rem)': '48rem',
};

const HEIGHT_OPTIONS = {
  Auto: 'auto',
  Fill: 'fill', // Special value that will set flex: 1
  Full: '100%',
  Screen: '100vh',
  Min: 'min-content',
  Max: 'max-content',
  Fit: 'fit-content',
  'Small (20rem)': '20rem',
  'Medium (24rem)': '24rem',
  'Large (32rem)': '32rem',
  'X-Large (40rem)': '40rem',
};

const BORDER_WIDTH_OPTIONS = {
  None: '0',
  '1px': '1px',
  '2px': '2px',
  '4px': '4px',
  '8px': '8px',
};

const BORDER_STYLE_OPTIONS = {
  None: 'none',
  Solid: 'solid',
  Dashed: 'dashed',
  Dotted: 'dotted',
  Double: 'double',
};

const COLOR_VARIABLES = {
  'Theme / Background': 'var(--color-background)',
  'Theme / Foreground': 'var(--color-foreground)',
  'Theme / Card': 'var(--color-card)',
  'Theme / Card Foreground': 'var(--color-card-foreground)',
  'Theme / Primary': 'var(--color-primary)',
  'Theme / Primary Foreground': 'var(--color-primary-foreground)',
  'Theme / Secondary': 'var(--color-secondary)',
  'Theme / Secondary Foreground': 'var(--color-secondary-foreground)',
  'Theme / Muted': 'var(--color-muted)',
  'Theme / Muted Foreground': 'var(--color-muted-foreground)',
  'Theme / Accent': 'var(--color-accent)',
  'Theme / Accent Foreground': 'var(--color-accent-foreground)',
  'Theme / Destructive': 'var(--color-destructive)',
  'Theme / Border': 'var(--color-border)',
  'Theme / Input': 'var(--color-input)',
  'Theme / Ring': 'var(--color-ring)',
  'Theme / Canvas Primary': 'var(--color-canvas-primary)',
  'Theme / Canvas Primary Foreground': 'var(--color-canvas-primary-foreground)',
  'Theme / Canvas Accent': 'var(--color-canvas-accent)',
  'Theme / Canvas Accent Foreground': 'var(--color-canvas-accent-foreground)',
  'Theme / Canvas Secondary': 'var(--color-canvas-secondary)',
  'Theme / Canvas Secondary Foreground':
    'var(--color-canvas-secondary-foreground)',
  Transparent: 'transparent',
  'slate-50': '#f8fafc',
  'slate-100': '#f1f5f9',
  'slate-200': '#e2e8f0',
  'slate-300': '#cbd5e1',
  'slate-400': '#94a3b8',
  'slate-500': '#64748b',
  'slate-600': '#475569',
  'slate-700': '#334155',
  'slate-800': '#1e293b',
  'slate-900': '#0f172a',
  'slate-950': '#020617',

  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
  'gray-950': '#030712',

  'zinc-50': '#fafafa',
  'zinc-100': '#f4f4f5',
  'zinc-200': '#e4e4e7',
  'zinc-300': '#d4d4d8',
  'zinc-400': '#a1a1aa',
  'zinc-500': '#71717a',
  'zinc-600': '#52525b',
  'zinc-700': '#3f3f46',
  'zinc-800': '#27272a',
  'zinc-900': '#18181b',
  'zinc-950': '#09090b',

  'neutral-50': '#fafafa',
  'neutral-100': '#f5f5f5',
  'neutral-200': '#e5e5e5',
  'neutral-300': '#d4d4d4',
  'neutral-400': '#a3a3a3',
  'neutral-500': '#737373',
  'neutral-600': '#525252',
  'neutral-700': '#404040',
  'neutral-800': '#262626',
  'neutral-900': '#171717',
  'neutral-950': '#0a0a0a',

  'stone-50': '#fafaf9',
  'stone-100': '#f5f5f4',
  'stone-200': '#e7e5e4',
  'stone-300': '#d6d3d1',
  'stone-400': '#a8a29e',
  'stone-500': '#78716c',
  'stone-600': '#57534e',
  'stone-700': '#44403c',
  'stone-800': '#292524',
  'stone-900': '#1c1917',
  'stone-950': '#0c0a09',

  'red-50': '#fef2f2',
  'red-100': '#fee2e2',
  'red-200': '#fecaca',
  'red-300': '#fca5a5',
  'red-400': '#f87171',
  'red-500': '#ef4444',
  'red-600': '#dc2626',
  'red-700': '#b91c1c',
  'red-800': '#991b1b',
  'red-900': '#7f1d1d',
  'red-950': '#450a0a',

  'orange-50': '#fff7ed',
  'orange-100': '#ffedd5',
  'orange-200': '#fed7aa',
  'orange-300': '#fdba74',
  'orange-400': '#fb923c',
  'orange-500': '#f97316',
  'orange-600': '#ea580c',
  'orange-700': '#c2410c',
  'orange-800': '#9a3412',
  'orange-900': '#7c2d12',
  'orange-950': '#431407',

  'amber-50': '#fffbeb',
  'amber-100': '#fef3c7',
  'amber-200': '#fde68a',
  'amber-300': '#fcd34d',
  'amber-400': '#fbbf24',
  'amber-500': '#f59e0b',
  'amber-600': '#d97706',
  'amber-700': '#b45309',
  'amber-800': '#92400e',
  'amber-900': '#78350f',
  'amber-950': '#451a03',

  'yellow-50': '#fefce8',
  'yellow-100': '#fef9c3',
  'yellow-200': '#fef08a',
  'yellow-300': '#fde047',
  'yellow-400': '#facc15',
  'yellow-500': '#eab308',
  'yellow-600': '#ca8a04',
  'yellow-700': '#a16207',
  'yellow-800': '#854d0e',
  'yellow-900': '#713f12',
  'yellow-950': '#422006',

  'lime-50': '#f7fee7',
  'lime-100': '#ecfccb',
  'lime-200': '#d9f99d',
  'lime-300': '#bef264',
  'lime-400': '#a3e635',
  'lime-500': '#84cc16',
  'lime-600': '#65a30d',
  'lime-700': '#4d7c0f',
  'lime-800': '#3f6212',
  'lime-900': '#365314',
  'lime-950': '#1a2e05',

  'green-50': '#f0fdf4',
  'green-100': '#dcfce7',
  'green-200': '#bbf7d0',
  'green-300': '#86efac',
  'green-400': '#4ade80',
  'green-500': '#22c55e',
  'green-600': '#16a34a',
  'green-700': '#15803d',
  'green-800': '#166534',
  'green-900': '#14532d',
  'green-950': '#052e16',

  'emerald-50': '#ecfdf5',
  'emerald-100': '#d1fae5',
  'emerald-200': '#a7f3d0',
  'emerald-300': '#6ee7b7',
  'emerald-400': '#34d399',
  'emerald-500': '#10b981',
  'emerald-600': '#059669',
  'emerald-700': '#047857',
  'emerald-800': '#065f46',
  'emerald-900': '#064e3b',
  'emerald-950': '#022c22',

  'teal-50': '#f0fdfa',
  'teal-100': '#ccfbf1',
  'teal-200': '#99f6e4',
  'teal-300': '#5eead4',
  'teal-400': '#2dd4bf',
  'teal-500': '#14b8a6',
  'teal-600': '#0d9488',
  'teal-700': '#0f766e',
  'teal-800': '#115e59',
  'teal-900': '#134e4a',
  'teal-950': '#042f2e',

  'cyan-50': '#ecfeff',
  'cyan-100': '#cffafe',
  'cyan-200': '#a5f3fc',
  'cyan-300': '#67e8f9',
  'cyan-400': '#22d3ee',
  'cyan-500': '#06b6d4',
  'cyan-600': '#0891b2',
  'cyan-700': '#0e7490',
  'cyan-800': '#155e75',
  'cyan-900': '#164e63',
  'cyan-950': '#083344',

  'sky-50': '#f0f9ff',
  'sky-100': '#e0f2fe',
  'sky-200': '#bae6fd',
  'sky-300': '#7dd3fc',
  'sky-400': '#38bdf8',
  'sky-500': '#0ea5e9',
  'sky-600': '#0284c7',
  'sky-700': '#0369a1',
  'sky-800': '#075985',
  'sky-900': '#0c4a6e',
  'sky-950': '#082f49',

  'blue-50': '#eff6ff',
  'blue-100': '#dbeafe',
  'blue-200': '#bfdbfe',
  'blue-300': '#93c5fd',
  'blue-400': '#60a5fa',
  'blue-500': '#3b82f6',
  'blue-600': '#2563eb',
  'blue-700': '#1d4ed8',
  'blue-800': '#1e40af',
  'blue-900': '#1e3a8a',
  'blue-950': '#172554',

  'indigo-50': '#eef2ff',
  'indigo-100': '#e0e7ff',
  'indigo-200': '#c7d2fe',
  'indigo-300': '#a5b4fc',
  'indigo-400': '#818cf8',
  'indigo-500': '#6366f1',
  'indigo-600': '#4f46e5',
  'indigo-700': '#4338ca',
  'indigo-800': '#3730a3',
  'indigo-900': '#312e81',
  'indigo-950': '#1e1b4b',

  'violet-50': '#f5f3ff',
  'violet-100': '#ede9fe',
  'violet-200': '#ddd6fe',
  'violet-300': '#c4b5fd',
  'violet-400': '#a78bfa',
  'violet-500': '#8b5cf6',
  'violet-600': '#7c3aed',
  'violet-700': '#6d28d9',
  'violet-800': '#5b21b6',
  'violet-900': '#4c1d95',
  'violet-950': '#2e1065',

  'purple-50': '#faf5ff',
  'purple-100': '#f3e8ff',
  'purple-200': '#e9d5ff',
  'purple-300': '#d8b4fe',
  'purple-400': '#c084fc',
  'purple-500': '#a855f7',
  'purple-600': '#9333ea',
  'purple-700': '#7e22ce',
  'purple-800': '#6b21a8',
  'purple-900': '#581c87',
  'purple-950': '#3b0764',

  'fuchsia-50': '#fdf4ff',
  'fuchsia-100': '#fae8ff',
  'fuchsia-200': '#f5d0fe',
  'fuchsia-300': '#f0abfc',
  'fuchsia-400': '#e879f9',
  'fuchsia-500': '#d946ef',
  'fuchsia-600': '#c026d3',
  'fuchsia-700': '#a21caf',
  'fuchsia-800': '#86198f',
  'fuchsia-900': '#701a75',
  'fuchsia-950': '#4a044e',

  'pink-50': '#fdf2f8',
  'pink-100': '#fce7f3',
  'pink-200': '#fbcfe8',
  'pink-300': '#f9a8d4',
  'pink-400': '#f472b6',
  'pink-500': '#ec4899',
  'pink-600': '#db2777',
  'pink-700': '#be185d',
  'pink-800': '#9d174d',
  'pink-900': '#831843',
  'pink-950': '#500724',

  'rose-50': '#fff1f2',
  'rose-100': '#ffe4e6',
  'rose-200': '#fecdd3',
  'rose-300': '#fda4af',
  'rose-400': '#fb7185',
  'rose-500': '#f43f5e',
  'rose-600': '#e11d48',
  'rose-700': '#be123c',
  'rose-800': '#9f1239',
  'rose-900': '#881337',
  'rose-950': '#4c0519',
};

const SHADCN_UTILITY_COLOR_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'bg-background', value: 'var(--color-background)' },
  { label: 'text-foreground', value: 'var(--color-foreground)' },
  { label: 'bg-card', value: 'var(--color-card)' },
  { label: 'text-card-foreground', value: 'var(--color-card-foreground)' },
  { label: 'bg-muted', value: 'var(--color-muted)' },
  {
    label: 'text-muted-foreground',
    value: 'var(--color-muted-foreground)',
  },
  { label: 'bg-primary', value: 'var(--color-primary)' },
  {
    label: 'text-primary-foreground',
    value: 'var(--color-primary-foreground)',
  },
  { label: 'bg-secondary', value: 'var(--color-secondary)' },
  {
    label: 'text-secondary-foreground',
    value: 'var(--color-secondary-foreground)',
  },
  { label: 'bg-accent', value: 'var(--color-accent)' },
  {
    label: 'text-accent-foreground',
    value: 'var(--color-accent-foreground)',
  },
  { label: 'bg-destructive', value: 'var(--color-destructive)' },
  { label: 'border-border', value: 'var(--color-border)' },
  { label: 'bg-input', value: 'var(--color-input)' },
  { label: 'ring-ring', value: 'var(--color-ring)' },
  { label: 'bg-canvas-primary', value: 'var(--color-canvas-primary)' },
  {
    label: 'text-canvas-primary-foreground',
    value: 'var(--color-canvas-primary-foreground)',
  },
  { label: 'bg-canvas-accent', value: 'var(--color-canvas-accent)' },
  {
    label: 'text-canvas-accent-foreground',
    value: 'var(--color-canvas-accent-foreground)',
  },
  { label: 'bg-canvas-secondary', value: 'var(--color-canvas-secondary)' },
  {
    label: 'text-canvas-secondary-foreground',
    value: 'var(--color-canvas-secondary-foreground)',
  },
];

const TAILWIND_PALETTE_COLOR_OPTIONS: Array<{ label: string; value: string }> =
  Object.entries(COLOR_VARIABLES)
    .filter(([, value]) => value === 'transparent' || value.startsWith('#'))
    .map(([label, value]) => ({
      label: label === 'Transparent' ? 'transparent' : label,
      value,
    }));

const CUSTOM_COLOR_SELECT_VALUE = '__custom__';

function ColorSelect({
  value,
  onValueChange,
  className,
  customInputType = 'text',
}: {
  value: string | undefined;
  onValueChange: (value: string) => void;
  className?: string;
  customInputType?: 'text' | 'color';
}) {
  const allKnownValues = Object.values(COLOR_VARIABLES);
  const isKnown = !!value && allKnownValues.includes(value);
  const selectedValue = isKnown ? (value as string) : CUSTOM_COLOR_SELECT_VALUE;

  const [forceCustom, setForceCustom] = useState(false);
  useEffect(() => {
    if (isKnown) {
      setForceCustom(false);
    }
  }, [isKnown]);

  const displayLabel = (() => {
    if (forceCustom || !isKnown) return 'Custom';
    if (!value) return 'Custom';
    const allOptions = [
      ...SHADCN_UTILITY_COLOR_OPTIONS,
      ...TAILWIND_PALETTE_COLOR_OPTIONS,
    ];
    const found = allOptions.find(opt => opt.value === value);
    return found?.label || value;
  })();

  const swatchColor =
    value && value.startsWith('#')
      ? value
      : value && value !== 'transparent'
        ? value
        : 'transparent';

  return (
    <Select
      value={selectedValue}
      onValueChange={next => {
        if (next === CUSTOM_COLOR_SELECT_VALUE) {
          setForceCustom(true);
          return;
        }
        setForceCustom(false);
        onValueChange(next);
      }}
    >
      <div className="mt-1">
        <SelectTrigger
          className={cn(
            'h-7 w-full px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary',
            className,
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: swatchColor }}
            />
            <span className="min-w-0 truncate">{displayLabel}</span>
            <SelectValue placeholder="Custom" className="sr-only" />
          </div>
        </SelectTrigger>
      </div>

      <SelectContent>
        {(forceCustom || !isKnown) && (
          <>
            <div
              className="p-2"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
            >
              <div className="text-xs text-muted-foreground mb-1">Custom</div>
              {customInputType === 'color' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value?.startsWith('#') ? value : '#000000'}
                    onChange={e => onValueChange(e.target.value)}
                    className="h-7 w-11 shrink-0 bg-background border border-border rounded-full cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value || ''}
                    onChange={e => onValueChange(e.target.value)}
                    placeholder="#ffffff"
                    className="h-7 w-full px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={value || ''}
                  onChange={e => onValueChange(e.target.value)}
                  placeholder="#ffffff"
                  className="h-7 w-full px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
            <SelectSeparator />
          </>
        )}
        <SelectItem value={CUSTOM_COLOR_SELECT_VALUE}>Custom</SelectItem>
        <SelectSeparator />

        <SelectGroup>
          {SHADCN_UTILITY_COLOR_OPTIONS.map(opt => (
            <SelectItem key={opt.label} value={opt.value}>
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ backgroundColor: opt.value }}
                />
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel>Tailwind</SelectLabel>
          {TAILWIND_PALETTE_COLOR_OPTIONS.map(opt => (
            <SelectItem key={opt.label} value={opt.value}>
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ backgroundColor: opt.value }}
                />
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function PropertiesPanel() {
  const { getComponents, selectedId, selectedIds, updateComponent } =
    useBuilderStore();
  const components = getComponents();

  // Resolve selected components
  // Use selectedIds if available, otherwise fallback to selectedId
  const effectiveSelectedIds =
    selectedIds.length > 0 ? selectedIds : selectedId ? [selectedId] : [];

  const selectedComponents = effectiveSelectedIds
    .map(id => components[id])
    .filter(Boolean);

  const selectedComponent = selectedId
    ? components[selectedId]
    : selectedComponents[0];
  const isMultiSelect = selectedComponents.length > 1;

  // Check for commonalities
  const allSameType =
    selectedComponents.length > 0 &&
    selectedComponents.every(c => c.type === selectedComponents[0].type);
  const allContainers =
    selectedComponents.length > 0 &&
    selectedComponents.every(c =>
      ['Container', 'Flex', 'Grid', 'Card', 'Stack', 'Form', 'List'].includes(
        c.type,
      ),
    );

  const [openSections, setOpenSections] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('properties-panel-openSections');
      return saved
        ? JSON.parse(saved)
        : [
            'baseTheme',
            'canvasTheme',
            'layout',
            'properties',
            'styles',
            'events',
          ];
    }
    return [
      'baseTheme',
      'canvasTheme',
      'layout',
      'properties',
      'styles',
      'events',
    ];
  });
  const [selectedCanvasTheme, setSelectedCanvasTheme] =
    useState<CanvasColorTheme>(CANVAS_COLOR_THEMES[0]);
  const [selectedBaseTheme, setSelectedBaseTheme] = useState<BaseTheme>(
    BASE_THEMES[0],
  );
  const { theme: mode } = useTheme();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [marginLinked, setMarginLinked] = useState(true);
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [positionLinked, setPositionLinked] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);
  const [panelPosition, setPanelPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - 320 : 900,
    y: 80,
  });
  const [hasBeenManuallyMoved, setHasBeenManuallyMoved] = useState(false);

  // Load saved themes on mount
  useEffect(() => {
    const savedCanvas = loadCanvasTheme();
    if (savedCanvas) {
      setSelectedCanvasTheme(savedCanvas);
      applyCanvasTheme(savedCanvas);
    }

    const savedBase = loadBaseTheme();
    if (savedBase) {
      setSelectedBaseTheme(savedBase);
      applyBaseTheme(savedBase);
    }
  }, []);

  // Re-apply canvas theme when light/dark mode changes
  useEffect(() => {
    if (mode) {
      applyCanvasTheme(selectedCanvasTheme);
    }
  }, [mode, selectedCanvasTheme]);

  // Handle window resize to keep panel within bounds or stick to right
  useEffect(() => {
    const handleResize = () => {
      setPanelPosition(prev => {
        const panelWidth = 300;
        const minMargin = 20; // Minimum margin from window edge
        const maxX = window.innerWidth - panelWidth - minMargin;
        const maxY = window.innerHeight - 100;

        // If panel hasn't been manually moved, stick to right side
        if (!hasBeenManuallyMoved) {
          return {
            x: Math.max(window.innerWidth - 320, minMargin),
            y: Math.min(Math.max(prev.y, 0), maxY),
          };
        }

        // Otherwise, constrain within bounds and ensure always visible
        return {
          x: Math.min(Math.max(prev.x, minMargin), maxX),
          y: Math.min(Math.max(prev.y, 0), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasBeenManuallyMoved]);

  const handleCanvasThemeSelect = (theme: CanvasColorTheme) => {
    setSelectedCanvasTheme(theme);
    applyCanvasTheme(theme);
    saveCanvasTheme(theme);
  };

  // Persist openSections to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'properties-panel-openSections',
        JSON.stringify(openSections),
      );
    }
  }, [openSections]);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section],
    );
  };

  // Helper to get the label from value or return custom value
  const getOptionLabel = (
    value: string | undefined,
    options: Record<string, string>,
  ): string => {
    if (!value) return '';
    const entry = Object.entries(options).find(([_, val]) => val === value);
    return entry ? entry[0] : value;
  };

  if (!selectedComponent) {
    return (
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragListener={false}
        dragConstraints={{
          left: 0,
          right: typeof window !== 'undefined' ? window.innerWidth - 300 : 1000,
          top: 0,
          bottom:
            typeof window !== 'undefined' ? window.innerHeight - 100 : 800,
        }}
        style={{
          x: panelPosition.x,
          y: panelPosition.y,
          touchAction: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onDragStart={() => setIsDraggingPanel(true)}
        onDragEnd={(e, info) => {
          setIsDraggingPanel(false);
          setHasBeenManuallyMoved(true);
          setPanelPosition({ x: info.point.x, y: info.point.y });
        }}
        className="fixed z-50 w-[300px] bg-card border border-border rounded-lg overflow-hidden"
      >
        {/* Drag Handle */}
        <div
          onPointerDown={e => {
            if ((e.target as HTMLElement).closest('button')) return;
            dragControls.start(e);
          }}
          className={`border-b border-border ${
            isDraggingPanel ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div className="bg-linear-to-r from-primary/10 to-primary/5 px-4 py-2 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <GripVertical size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Properties
              </h2>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent"
            >
              {isMinimized ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <Settings size={16} />
                App Settings
              </h3>
              <p className="text-xs text-muted-foreground">
                Customize your application appearance
              </p>
            </div>

            <div className="space-y-3 p-2">
              {/* Base Theme Section */}
              <Collapsible
                open={openSections.includes('baseTheme')}
                onOpenChange={() => toggleSection('baseTheme')}
                className="border-2 border-foreground/10 rounded-md shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 text-sm font-semibold bg-muted/50 hover:bg-muted/70 transition-colors">
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${
                      openSections.includes('baseTheme') ? 'rotate-90' : ''
                    }`}
                  />
                  <Palette size={14} />
                  Base Theme
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 pt-2 px-3 pb-3 bg-muted/10">
                    <p className="text-xs text-muted-foreground">
                      Choose the base color palette for the app
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {BASE_THEMES.map(theme => (
                        <button
                          key={theme.name}
                          onClick={() => {
                            setSelectedBaseTheme(theme);
                            applyBaseTheme(theme);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all hover:bg-accent ${
                            selectedBaseTheme.baseColor === theme.baseColor
                              ? 'border-primary bg-accent'
                              : 'border-border hover:border-primary'
                          }`}
                          title={theme.name}
                        >
                          <div className="space-y-2">
                            <div className="text-sm font-medium flex items-center justify-between">
                              {theme.name}
                              {selectedBaseTheme.baseColor ===
                                theme.baseColor && (
                                <Check size={14} className="text-primary" />
                              )}
                            </div>
                            <div className="flex gap-1">
                              <div
                                className="w-full h-6 rounded-sm border border-border"
                                style={{ backgroundColor: theme.preview.light }}
                                title="Light"
                              />
                              <div
                                className="w-full h-6 rounded-sm border border-border"
                                style={{ backgroundColor: theme.preview.dark }}
                                title="Dark"
                              />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Canvas Color Theme Section */}
              <Collapsible
                open={openSections.includes('canvasTheme')}
                onOpenChange={() => toggleSection('canvasTheme')}
                className="border-2 border-foreground/10 rounded-md shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 text-sm font-semibold bg-muted/50 hover:bg-muted/70 transition-colors">
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${
                      openSections.includes('canvasTheme') ? 'rotate-90' : ''
                    }`}
                  />
                  <Palette size={14} />
                  Canvas Color Theme
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 pt-2 px-3 pb-3 bg-muted/10">
                    <p className="text-xs text-muted-foreground">
                      Choose complementary color palettes for canvas components
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {CANVAS_COLOR_THEMES.map(theme => (
                        <button
                          key={theme.name}
                          onClick={() => handleCanvasThemeSelect(theme)}
                          className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 text-left ${
                            selectedCanvasTheme.name === theme.name
                              ? 'border-primary bg-accent'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          {selectedCanvasTheme.name === theme.name && (
                            <div className="absolute top-1 right-1">
                              <Check size={14} className="text-primary" />
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="font-medium text-sm">
                              {theme.name}
                            </div>
                            <div className="flex gap-1">
                              <div
                                className="flex-1 h-6 rounded border border-border"
                                style={{
                                  backgroundColor: theme.colors.light.primary,
                                }}
                                title="Primary"
                              />
                              <div
                                className="flex-1 h-6 rounded border border-border"
                                style={{
                                  backgroundColor: theme.colors.light.accent,
                                }}
                                title="Complementary Accent"
                              />
                              <div
                                className="flex-1 h-6 rounded border border-border"
                                style={{
                                  backgroundColor: theme.colors.light.secondary,
                                }}
                                title="Analogous Secondary"
                              />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="pt-4 px-3 bg-card">
                <p className="text-xs text-muted-foreground text-center">
                  Select a component to edit its properties
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  const handleStyleChange = (key: string, value: string) => {
    selectedComponents.forEach(comp => {
      // Handle special "Fill" case for height
      if (key === 'height') {
        if (value === 'fill') {
          // For Page, "Fill" should behave like "min-height: 100%" so it can still grow.
          if (comp.type === 'Page') {
            updateComponent(comp.id, {
              styles: {
                ...comp.styles,
                height: 'auto',
                minHeight: '100%',
              },
            });
          } else {
            updateComponent(comp.id, {
              styles: {
                ...comp.styles,
                flex: '1',
                height: '100%',
              },
            });
          }
          return;
        } else {
          // If setting a specific height, remove flex to allow height to take effect
          const newStyles = { ...comp.styles, [key]: value };
          if (newStyles.flex === '1') {
            delete newStyles.flex;
          }

          // For Page, treat "Full" (100%) as minHeight so it can still grow with content.
          if (comp.type === 'Page' && value === '100%') {
            delete (newStyles as any).height;
            (newStyles as any).minHeight = '100%';
          }

          updateComponent(comp.id, {
            styles: newStyles,
          });
          return;
        }
      }

      // Make "Full" width actually stretch inside flex column parents
      if (key === 'width' && value === '100%') {
        updateComponent(comp.id, {
          styles: {
            ...comp.styles,
            width: value,
            alignSelf: 'stretch',
          },
        });
        return;
      }

      updateComponent(comp.id, {
        styles: { ...comp.styles, [key]: value },
      });
    });
  };

  const handlePropChange = (key: string, value: any) => {
    selectedComponents.forEach(comp => {
      updateComponent(comp.id, {
        props: { ...comp.props, [key]: value },
      });
    });
  };

  const handleNameChange = (value: string) => {
    if (isMultiSelect) return; // Don't allow name change for multiple
    updateComponent(selectedComponent.id, { name: value });
  };

  const getAvailableEvents = (componentType: string): string[] => {
    const commonEvents = [
      'onClick',
      'onDoubleClick',
      'onMouseEnter',
      'onMouseLeave',
    ];
    const formEvents = ['onChange', 'onInput', 'onFocus', 'onBlur', 'onSubmit'];

    switch (componentType) {
      case 'Button':
        return [
          'onClick',
          'onDoubleClick',
          'onMouseEnter',
          'onMouseLeave',
          'onFocus',
          'onBlur',
        ];
      case 'Input':
      case 'Textarea':
        return [...formEvents, ...commonEvents];
      case 'Form':
        return ['onSubmit', 'onReset', ...commonEvents];
      case 'Select':
      case 'Checkbox':
      case 'Radio':
        return ['onChange', 'onClick', 'onFocus', 'onBlur'];
      case 'Image':
        return ['onClick', 'onLoad', 'onError', 'onMouseEnter', 'onMouseLeave'];
      default:
        return commonEvents;
    }
  };

  const handleEventUpdate = (
    eventType: EventType,
    action: EventAction | undefined,
  ) => {
    selectedComponents.forEach(comp => {
      const updatedEvents = { ...comp.events };
      if (action) {
        updatedEvents[eventType] = action;
      } else {
        delete updatedEvents[eventType];
      }

      updateComponent(comp.id, { events: updatedEvents });
    });
  };

  const renderLayoutControls = () => {
    if (!allContainers) {
      return null;
    }

    const direction =
      selectedComponent.styles.flexDirection ||
      (typeof selectedComponent.className === 'string' &&
      /(^|\s)flex-col(\s|$)/.test(selectedComponent.className)
        ? 'column'
        : typeof selectedComponent.className === 'string' &&
            /(^|\s)flex-row(\s|$)/.test(selectedComponent.className)
          ? 'row'
          : selectedComponent.type === 'Flex'
            ? 'row'
            : 'column');
    const alignItems = selectedComponent.styles.alignItems || 'start';
    const justifyContent = selectedComponent.styles.justifyContent || 'start';
    const gap = selectedComponent.styles.gap || '0.5rem';

    return (
      <div className="space-y-4">
        {/* Direction */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Layout Direction
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                selectedComponents.forEach(comp => {
                  updateComponent(comp.id, {
                    styles: {
                      ...comp.styles,
                      flexDirection: 'row',
                      display: 'flex',
                    },
                  });
                });
              }}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                direction === 'row'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <ArrowRightLeft size={20} />
              <span className="text-xs font-medium">Row</span>
              <span className="text-xs text-muted-foreground">Horizontal</span>
            </button>
            <button
              onClick={() => {
                selectedComponents.forEach(comp => {
                  updateComponent(comp.id, {
                    styles: {
                      ...comp.styles,
                      flexDirection: 'column',
                      display: 'flex',
                    },
                  });
                });
              }}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                direction === 'column'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <ArrowUpDown size={20} />
              <span className="text-xs font-medium">Column</span>
              <span className="text-xs text-muted-foreground">Vertical</span>
            </button>
          </div>
        </div>

        {/* Align Items */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Align Children {direction === 'row' ? '(Vertical)' : '(Horizontal)'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleStyleChange('alignItems', 'start')}
              className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                alignItems === 'start'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {direction === 'row' ? (
                <AlignStartVertical size={16} />
              ) : (
                <AlignStartHorizontal size={16} />
              )}
              <span className="text-xs font-medium">Start</span>
            </button>
            <button
              onClick={() => handleStyleChange('alignItems', 'center')}
              className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                alignItems === 'center'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {direction === 'row' ? (
                <AlignCenterVertical size={16} />
              ) : (
                <AlignCenterHorizontal size={16} />
              )}
              <span className="text-xs font-medium">Center</span>
            </button>
            <button
              onClick={() => handleStyleChange('alignItems', 'end')}
              className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                alignItems === 'end'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {direction === 'row' ? (
                <AlignEndVertical size={16} />
              ) : (
                <AlignEndHorizontal size={16} />
              )}
              <span className="text-xs font-medium">End</span>
            </button>
            <button
              onClick={() => handleStyleChange('alignItems', 'stretch')}
              className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                alignItems === 'stretch'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Maximize2 size={16} />
              <span className="text-xs font-medium">Stretch</span>
            </button>
          </div>
        </div>

        {/* Justify Content */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Distribute Children{' '}
            {direction === 'row' ? '(Horizontal)' : '(Vertical)'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStyleChange('justifyContent', 'start')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                justifyContent === 'start'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
              title="Start"
            >
              <svg
                width="32"
                height="20"
                viewBox="0 0 32 20"
                className="fill-current"
              >
                <rect x="2" y="5" width="6" height="10" rx="1" />
                <rect x="10" y="5" width="6" height="10" rx="1" />
                <rect x="18" y="5" width="6" height="10" rx="1" />
              </svg>
              <span className="text-xs font-medium">Start</span>
            </button>
            <button
              onClick={() => handleStyleChange('justifyContent', 'center')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                justifyContent === 'center'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
              title="Center"
            >
              <svg
                width="32"
                height="20"
                viewBox="0 0 32 20"
                className="fill-current"
              >
                <rect x="5" y="5" width="6" height="10" rx="1" />
                <rect x="13" y="5" width="6" height="10" rx="1" />
                <rect x="21" y="5" width="6" height="10" rx="1" />
              </svg>
              <span className="text-xs font-medium">Center</span>
            </button>
            <button
              onClick={() => handleStyleChange('justifyContent', 'end')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                justifyContent === 'end'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
              title="End"
            >
              <svg
                width="32"
                height="20"
                viewBox="0 0 32 20"
                className="fill-current"
              >
                <rect x="8" y="5" width="6" height="10" rx="1" />
                <rect x="16" y="5" width="6" height="10" rx="1" />
                <rect x="24" y="5" width="6" height="10" rx="1" />
              </svg>
              <span className="text-xs font-medium">End</span>
            </button>
            <button
              onClick={() =>
                handleStyleChange('justifyContent', 'space-between')
              }
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                justifyContent === 'space-between'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
              title="Space Between"
            >
              <svg
                width="32"
                height="20"
                viewBox="0 0 32 20"
                className="fill-current"
              >
                <rect x="2" y="5" width="6" height="10" rx="1" />
                <rect x="13" y="5" width="6" height="10" rx="1" />
                <rect x="24" y="5" width="6" height="10" rx="1" />
              </svg>
              <span className="text-xs font-medium">Between</span>
            </button>
            <button
              onClick={() =>
                handleStyleChange('justifyContent', 'space-around')
              }
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                justifyContent === 'space-around'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
              title="Space Around"
            >
              <svg
                width="32"
                height="20"
                viewBox="0 0 32 20"
                className="fill-current"
              >
                <rect x="4" y="5" width="6" height="10" rx="1" />
                <rect x="13" y="5" width="6" height="10" rx="1" />
                <rect x="22" y="5" width="6" height="10" rx="1" />
              </svg>
              <span className="text-xs font-medium">Around</span>
            </button>
            <button
              onClick={() =>
                handleStyleChange('justifyContent', 'space-evenly')
              }
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                justifyContent === 'space-evenly'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
              title="Space Evenly"
            >
              <svg
                width="32"
                height="20"
                viewBox="0 0 32 20"
                className="fill-current"
              >
                <rect x="6" y="5" width="5" height="10" rx="1" />
                <rect x="13.5" y="5" width="5" height="10" rx="1" />
                <rect x="21" y="5" width="5" height="10" rx="1" />
              </svg>
              <span className="text-xs font-medium">Evenly</span>
            </button>
            <button
              onClick={() => handleStyleChange('justifyContent', 'stretch')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                justifyContent === 'stretch'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
              title="Stretch"
            >
              <Maximize2 size={16} />
              <span className="text-xs font-medium">Stretch</span>
            </button>
          </div>
        </div>

        {/* Gap/Spacing */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Spacing Between Items{' '}
            {direction === 'row' ? '(Horizontal)' : '(Vertical)'}
            <span className="ml-2 text-xs font-normal">{gap || '0'}</span>
          </label>
          <input
            type="range"
            min="0"
            max="4"
            step="0.25"
            value={parseFloat(gap) || 0}
            onChange={e => {
              const value = `${e.target.value}rem`;
              selectedComponents.forEach(comp => {
                if (direction === 'row') {
                  updateComponent(comp.id, {
                    styles: {
                      ...comp.styles,
                      columnGap: value,
                      gap: value, // Keep gap as fallback
                    },
                  });
                } else {
                  updateComponent(comp.id, {
                    styles: {
                      ...comp.styles,
                      rowGap: value,
                      gap: value, // Keep gap as fallback
                    },
                  });
                }
              });
            }}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>None</span>
            <span>X-Large</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPropertyFields = () => {
    const type = selectedComponent.type;
    const props = selectedComponent.props;

    // Common text field components
    const textComponents = [
      'Button',
      'Text',
      'Heading',
      'Label',
      'Badge',
      'Icon',
      'Checkbox',
      'Radio',
    ];
    if (textComponents.includes(type)) {
      return (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Text
          </label>
          <input
            type="text"
            value={props.text || ''}
            onChange={e => handlePropChange('text', e.target.value)}
            className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      );
    }

    switch (type) {
      case 'Heading':
        return (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Text
              </label>
              <input
                type="text"
                value={props.text || ''}
                onChange={e => handlePropChange('text', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Level (H1-H6)
              </label>
              <Select
                value={String(props.level || 2)}
                onValueChange={v => handlePropChange('level', Number(v))}
              >
                <SelectTrigger className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <SelectItem key={level} value={String(level)}>
                      H{level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'Button':
        return (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Text
              </label>
              <input
                type="text"
                value={props.text || ''}
                onChange={e => handlePropChange('text', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Variant
              </label>
              <Select
                value={(props.variant || 'default') as string}
                onValueChange={v => handlePropChange('variant', v)}
              >
                <SelectTrigger className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Size
              </label>
              <Select
                value={(props.size || 'default') as string}
                onValueChange={v => handlePropChange('size', v)}
              >
                <SelectTrigger className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="icon">Icon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'Input':
        return (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Placeholder
              </label>
              <input
                type="text"
                value={props.placeholder || ''}
                onChange={e => handlePropChange('placeholder', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <Select
                value={(props.type || 'text') as string}
                onValueChange={v => handlePropChange('type', v)}
              >
                <SelectTrigger className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="tel">Phone</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={props.required || false}
                onChange={e => handlePropChange('required', e.target.checked)}
                className="rounded"
              />
              <label className="text-xs font-medium text-muted-foreground">
                Required
              </label>
            </div>
          </>
        );

      case 'Textarea':
        return (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Placeholder
              </label>
              <input
                type="text"
                value={props.placeholder || ''}
                onChange={e => handlePropChange('placeholder', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={props.required || false}
                onChange={e => handlePropChange('required', e.target.checked)}
                className="rounded"
              />
              <label className="text-xs font-medium text-muted-foreground">
                Required
              </label>
            </div>
          </>
        );

      case 'Select':
        return (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Placeholder
            </label>
            <input
              type="text"
              value={props.placeholder || ''}
              onChange={e => handlePropChange('placeholder', e.target.value)}
              className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        );

      case 'Checkbox':
      case 'Radio':
      case 'Switch':
        return (
          <>
            {(type === 'Checkbox' || type === 'Radio') && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Label
                </label>
                <input
                  type="text"
                  value={props.text || ''}
                  onChange={e => handlePropChange('text', e.target.value)}
                  className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={props.checked || false}
                onChange={e => handlePropChange('checked', e.target.checked)}
                className="rounded"
              />
              <label className="text-xs font-medium text-muted-foreground">
                Checked
              </label>
            </div>
          </>
        );

      case 'Image':
      case 'Avatar':
        return (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Image URL
              </label>
              <input
                type="text"
                value={props.src || ''}
                onChange={e => handlePropChange('src', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Alt Text
              </label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={e => handlePropChange('alt', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </>
        );

      case 'Badge':
        return (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Text
              </label>
              <input
                type="text"
                value={props.text || ''}
                onChange={e => handlePropChange('text', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Variant
              </label>
              <Select
                value={(props.badgeVariant || 'default') as string}
                onValueChange={v => handlePropChange('badgeVariant', v)}
              >
                <SelectTrigger className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'Alert':
        return (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Title
              </label>
              <input
                type="text"
                value={props.title || ''}
                onChange={e => handlePropChange('title', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                value={props.description || ''}
                onChange={e => handlePropChange('description', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Variant
              </label>
              <Select
                value={(props.alertVariant || 'default') as string}
                onValueChange={v => handlePropChange('alertVariant', v)}
              >
                <SelectTrigger className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'Dialog':
      case 'Toast':
        return (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Title
              </label>
              <input
                type="text"
                value={props.title || ''}
                onChange={e => handlePropChange('title', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                value={props.description || ''}
                onChange={e => handlePropChange('description', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          </>
        );

      case 'Progress':
        return (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Value (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={props.progressValue || 0}
              onChange={e =>
                handlePropChange('progressValue', Number(e.target.value))
              }
              className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragListener={false}
      dragConstraints={{
        left: 0,
        right: typeof window !== 'undefined' ? window.innerWidth - 300 : 1000,
        top: 0,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 100 : 800,
      }}
      style={{
        x: panelPosition.x,
        y: panelPosition.y,
        touchAction: 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
      onDragStart={() => setIsDraggingPanel(true)}
      onDragEnd={(e, info) => {
        setIsDraggingPanel(false);
        setHasBeenManuallyMoved(true);
        setPanelPosition({ x: info.point.x, y: info.point.y });
      }}
      className="fixed z-50 w-[300px] bg-card border border-border rounded-lg overflow-hidden"
    >
      {/* Drag Handle */}
      <div
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('button')) return;
          dragControls.start(e);
        }}
        className={`border-b border-border ${
          isDraggingPanel ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="bg-linear-to-r from-primary/10 to-primary/5 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Properties
            </h2>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent"
          >
            {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
          <div className="space-y-3">
            {/* Component Name - Only for single selection */}
            {!isMultiSelect && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Component Name
                </label>
                <input
                  type="text"
                  value={selectedComponent.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* Component Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Component Type
              </label>
              <input
                type="text"
                value={
                  isMultiSelect
                    ? allSameType
                      ? selectedComponent.type
                      : 'Mixed'
                    : selectedComponent.type
                }
                readOnly
                className="mt-1 w-full px-2 py-1.5 text-sm bg-muted/30 border border-border rounded cursor-not-allowed"
              />
            </div>

            {/* Layout Section - For containers only */}
            {allContainers && (
              <Collapsible
                open={openSections.includes('layout')}
                onOpenChange={() => toggleSection('layout')}
                className="border-2 border-foreground/10 rounded-md shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 text-sm font-semibold bg-muted/50 hover:bg-muted/70 transition-colors">
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${
                      openSections.includes('layout') ? 'rotate-90' : ''
                    }`}
                  />
                  <LayoutGrid size={14} />
                  Layout
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 pt-2 px-3 pb-3 bg-muted/10">
                    {renderLayoutControls()}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Component Props Section - Only if all types match */}
            {allSameType && (
              <Collapsible
                open={
                  renderPropertyFields()
                    ? openSections.includes('properties')
                    : false
                }
                onOpenChange={() =>
                  renderPropertyFields() && toggleSection('properties')
                }
                className="border border-border rounded-md shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger
                  disabled={!renderPropertyFields()}
                  className="flex items-center gap-2 w-full py-2 px-3 text-sm font-semibold bg-muted/50 hover:bg-muted/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${
                      openSections.includes('properties') ? 'rotate-90' : ''
                    }`}
                  />
                  Properties
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 pt-2 px-3 pb-3 bg-muted/10">
                    {renderPropertyFields()}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Styles Section */}
            <Collapsible
              open={openSections.includes('styles')}
              onOpenChange={() => toggleSection('styles')}
              className="border-2 border-foreground/10 rounded-md shadow-sm overflow-hidden"
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 text-sm font-semibold bg-muted/50 hover:bg-muted/70 transition-colors">
                <ChevronRight
                  size={14}
                  className={`transition-transform ${
                    openSections.includes('styles') ? 'rotate-90' : ''
                  }`}
                />
                Styles
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 pt-1.5 px-2 pb-2 bg-muted/10">
                  {/* ===== LAYOUT CATEGORY ===== */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wide mb-2">
                      Layout
                    </h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
                        {/* Height */}
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Height
                          </label>
                          <Select
                            value={
                              selectedComponent.styles.flex === '1'
                                ? 'Fill'
                                : getOptionLabel(
                                    selectedComponent.styles.height,
                                    HEIGHT_OPTIONS,
                                  )
                            }
                            onValueChange={label => {
                              if (!label) return;
                              handleStyleChange(
                                'height',
                                HEIGHT_OPTIONS[
                                  label as keyof typeof HEIGHT_OPTIONS
                                ] || label,
                              );
                            }}
                          >
                            <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                              <SelectValue placeholder="Custom" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(HEIGHT_OPTIONS).map(label => (
                                <SelectItem key={label} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedComponent.styles.height &&
                            selectedComponent.styles.flex !== '1' &&
                            !Object.values(HEIGHT_OPTIONS).includes(
                              selectedComponent.styles.height,
                            ) && (
                              <input
                                type="text"
                                value={selectedComponent.styles.height || ''}
                                onChange={e =>
                                  handleStyleChange('height', e.target.value)
                                }
                                placeholder="e.g., 200px, 50%, 10rem"
                                className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            )}
                        </div>
                        {/* Width */}
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Width
                          </label>
                          <Select
                            value={getOptionLabel(
                              selectedComponent.styles.width,
                              WIDTH_OPTIONS,
                            )}
                            onValueChange={label => {
                              if (!label) return;
                              handleStyleChange(
                                'width',
                                WIDTH_OPTIONS[
                                  label as keyof typeof WIDTH_OPTIONS
                                ] || label,
                              );
                            }}
                          >
                            <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                              <SelectValue placeholder="Custom" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(WIDTH_OPTIONS).map(label => (
                                <SelectItem key={label} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedComponent.styles.width &&
                            !Object.values(WIDTH_OPTIONS).includes(
                              selectedComponent.styles.width,
                            ) && (
                              <input
                                type="text"
                                value={selectedComponent.styles.width || ''}
                                onChange={e =>
                                  handleStyleChange('width', e.target.value)
                                }
                                placeholder="e.g., 200px, 50%, 10rem"
                                className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            )}
                        </div>
                      </div>

                      {/* Overflow */}
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Overflow
                        </label>
                        <Select
                          value={
                            (selectedComponent.styles.overflow ||
                              'visible') as string
                          }
                          onValueChange={v =>
                            handleStyleChange(
                              'overflow',
                              v as 'visible' | 'hidden' | 'scroll' | 'auto',
                            )
                          }
                        >
                          <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visible">Visible</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                            <SelectItem value="scroll">Scroll</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Position */}
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Position
                        </label>
                        <Select
                          value={
                            ((selectedComponent.styles.position as string) ||
                              'static') as string
                          }
                          onValueChange={v => handleStyleChange('position', v)}
                        >
                          <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="static">Static</SelectItem>
                            <SelectItem value="relative">Relative</SelectItem>
                            <SelectItem value="absolute">Absolute</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="sticky">Sticky</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {((selectedComponent.styles.position as string) ||
                        'static') !== 'static' && (
                        <div className="pt-2 border-t border-border/30">
                          <label className="text-xs text-muted-foreground mb-1.5 block">
                            Offsets
                          </label>
                          <div className="grid grid-cols-3 gap-1 items-end">
                            <div />
                            <div>
                              <label className="text-xs text-muted-foreground block">
                                Top
                              </label>
                              <Select
                                value={
                                  getOptionLabel(
                                    selectedComponent.styles.top as any,
                                    SPACING_OPTIONS,
                                  ) || '__none__'
                                }
                                onValueChange={label => {
                                  const resolved =
                                    label === '__none__'
                                      ? ''
                                      : SPACING_OPTIONS[
                                          label as keyof typeof SPACING_OPTIONS
                                        ] || label;
                                  if (positionLinked) {
                                    handleStyleChange('top', resolved);
                                    handleStyleChange('right', resolved);
                                    handleStyleChange('bottom', resolved);
                                    handleStyleChange('left', resolved);
                                  } else {
                                    handleStyleChange('top', resolved);
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">-</SelectItem>
                                  {Object.keys(SPACING_OPTIONS).map(k => (
                                    <SelectItem key={k} value={k}>
                                      {k}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div />

                            <div>
                              <label className="text-xs text-muted-foreground block">
                                Left
                              </label>
                              <Select
                                value={
                                  getOptionLabel(
                                    selectedComponent.styles.left as any,
                                    SPACING_OPTIONS,
                                  ) || '__none__'
                                }
                                onValueChange={label => {
                                  const resolved =
                                    label === '__none__'
                                      ? ''
                                      : SPACING_OPTIONS[
                                          label as keyof typeof SPACING_OPTIONS
                                        ] || label;
                                  if (positionLinked) {
                                    handleStyleChange('top', resolved);
                                    handleStyleChange('right', resolved);
                                    handleStyleChange('bottom', resolved);
                                    handleStyleChange('left', resolved);
                                  } else {
                                    handleStyleChange('left', resolved);
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">-</SelectItem>
                                  {Object.keys(SPACING_OPTIONS).map(k => (
                                    <SelectItem key={k} value={k}>
                                      {k}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-end justify-center">
                              <button
                                type="button"
                                onClick={() => setPositionLinked(v => !v)}
                                className={cn(
                                  'px-2 py-1.5 text-xs border rounded transition-colors',
                                  positionLinked
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-muted hover:bg-muted/80 border-border',
                                )}
                                title={
                                  positionLinked
                                    ? 'Unlink offsets'
                                    : 'Link offsets (apply to all)'
                                }
                              >
                                <Link2 size={14} />
                              </button>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block">
                                Right
                              </label>
                              <Select
                                value={
                                  getOptionLabel(
                                    selectedComponent.styles.right as any,
                                    SPACING_OPTIONS,
                                  ) || '__none__'
                                }
                                onValueChange={label => {
                                  const resolved =
                                    label === '__none__'
                                      ? ''
                                      : SPACING_OPTIONS[
                                          label as keyof typeof SPACING_OPTIONS
                                        ] || label;
                                  if (positionLinked) {
                                    handleStyleChange('top', resolved);
                                    handleStyleChange('right', resolved);
                                    handleStyleChange('bottom', resolved);
                                    handleStyleChange('left', resolved);
                                  } else {
                                    handleStyleChange('right', resolved);
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">-</SelectItem>
                                  {Object.keys(SPACING_OPTIONS).map(k => (
                                    <SelectItem key={k} value={k}>
                                      {k}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div />
                            <div>
                              <label className="text-xs text-muted-foreground block">
                                Bottom
                              </label>
                              <Select
                                value={
                                  getOptionLabel(
                                    selectedComponent.styles.bottom as any,
                                    SPACING_OPTIONS,
                                  ) || '__none__'
                                }
                                onValueChange={label => {
                                  const resolved =
                                    label === '__none__'
                                      ? ''
                                      : SPACING_OPTIONS[
                                          label as keyof typeof SPACING_OPTIONS
                                        ] || label;
                                  if (positionLinked) {
                                    handleStyleChange('top', resolved);
                                    handleStyleChange('right', resolved);
                                    handleStyleChange('bottom', resolved);
                                    handleStyleChange('left', resolved);
                                  } else {
                                    handleStyleChange('bottom', resolved);
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">-</SelectItem>
                                  {Object.keys(SPACING_OPTIONS).map(k => (
                                    <SelectItem key={k} value={k}>
                                      {k}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Divider */}
                  <div className="border-t border-border/50"></div>

                  {/* ===== SPACING CATEGORY ===== */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wide mb-2">
                      Spacing
                    </h4>
                    <div className="space-y-2">
                      {/* Margin */}
                      <div className="pb-2 border-b border-border/30">
                        <label className="text-xs text-muted-foreground mb-1.5 block">
                          Margin
                        </label>
                        <div className="grid grid-cols-3 gap-1 items-end">
                          {/* Empty space */}
                          <div></div>
                          {/* Top (centered) */}
                          <div>
                            <label className="text-xs text-muted-foreground block">
                              Top
                            </label>
                            <Select
                              value={
                                getOptionLabel(
                                  selectedComponent.styles.marginTop,
                                  SPACING_OPTIONS,
                                ) || '__none__'
                              }
                              onValueChange={label => {
                                const resolved =
                                  label === '__none__'
                                    ? ''
                                    : SPACING_OPTIONS[
                                        label as keyof typeof SPACING_OPTIONS
                                      ] || label;
                                if (marginLinked) {
                                  handleStyleChange('margin', resolved);
                                  handleStyleChange('marginTop', resolved);
                                  handleStyleChange('marginRight', resolved);
                                  handleStyleChange('marginBottom', resolved);
                                  handleStyleChange('marginLeft', resolved);
                                } else {
                                  handleStyleChange('marginTop', resolved);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-</SelectItem>
                                {Object.keys(SPACING_OPTIONS).map(label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Empty space */}
                          <div></div>

                          {/* Left */}
                          <div>
                            <label className="text-xs text-muted-foreground block">
                              Left
                            </label>
                            <Select
                              value={
                                getOptionLabel(
                                  selectedComponent.styles.marginLeft,
                                  SPACING_OPTIONS,
                                ) || '__none__'
                              }
                              onValueChange={label => {
                                const resolved =
                                  label === '__none__'
                                    ? ''
                                    : SPACING_OPTIONS[
                                        label as keyof typeof SPACING_OPTIONS
                                      ] || label;
                                if (marginLinked) {
                                  handleStyleChange('margin', resolved);
                                  handleStyleChange('marginTop', resolved);
                                  handleStyleChange('marginRight', resolved);
                                  handleStyleChange('marginBottom', resolved);
                                  handleStyleChange('marginLeft', resolved);
                                } else {
                                  handleStyleChange('marginLeft', resolved);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-</SelectItem>
                                {Object.keys(SPACING_OPTIONS).map(label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end justify-center">
                            <button
                              type="button"
                              onClick={() => setMarginLinked(v => !v)}
                              className={cn(
                                'px-2 py-1.5 text-xs border rounded transition-colors',
                                marginLinked
                                  ? 'bg-primary/10 border-primary'
                                  : 'bg-muted hover:bg-muted/80 border-border',
                              )}
                              title={
                                marginLinked
                                  ? 'Unlink sides'
                                  : 'Link sides (apply to all)'
                              }
                            >
                              <Link2 size={14} />
                            </button>
                          </div>
                          {/* Right */}
                          <div>
                            <label className="text-xs text-muted-foreground block">
                              Right
                            </label>
                            <Select
                              value={
                                getOptionLabel(
                                  selectedComponent.styles.marginRight,
                                  SPACING_OPTIONS,
                                ) || '__none__'
                              }
                              onValueChange={label => {
                                const resolved =
                                  label === '__none__'
                                    ? ''
                                    : SPACING_OPTIONS[
                                        label as keyof typeof SPACING_OPTIONS
                                      ] || label;
                                if (marginLinked) {
                                  handleStyleChange('margin', resolved);
                                  handleStyleChange('marginTop', resolved);
                                  handleStyleChange('marginRight', resolved);
                                  handleStyleChange('marginBottom', resolved);
                                  handleStyleChange('marginLeft', resolved);
                                } else {
                                  handleStyleChange('marginRight', resolved);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-</SelectItem>
                                {Object.keys(SPACING_OPTIONS).map(label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Empty space */}
                          <div></div>
                          {/* Bottom (centered) */}
                          <div>
                            <label className="text-xs text-muted-foreground block">
                              Bottom
                            </label>
                            <Select
                              value={
                                getOptionLabel(
                                  selectedComponent.styles.marginBottom,
                                  SPACING_OPTIONS,
                                ) || '__none__'
                              }
                              onValueChange={label => {
                                const resolved =
                                  label === '__none__'
                                    ? ''
                                    : SPACING_OPTIONS[
                                        label as keyof typeof SPACING_OPTIONS
                                      ] || label;
                                if (marginLinked) {
                                  handleStyleChange('margin', resolved);
                                  handleStyleChange('marginTop', resolved);
                                  handleStyleChange('marginRight', resolved);
                                  handleStyleChange('marginBottom', resolved);
                                  handleStyleChange('marginLeft', resolved);
                                } else {
                                  handleStyleChange('marginBottom', resolved);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-</SelectItem>
                                {Object.keys(SPACING_OPTIONS).map(label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Empty space */}
                          <div></div>
                        </div>
                      </div>

                      {/* Padding */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">
                          Padding
                        </label>
                        <div className="grid grid-cols-3 gap-1 items-end">
                          {/* Empty space */}
                          <div></div>
                          {/* Top (centered) */}
                          <div>
                            <label className="text-xs text-muted-foreground block">
                              Top
                            </label>
                            <Select
                              value={
                                getOptionLabel(
                                  selectedComponent.styles.paddingTop,
                                  SPACING_OPTIONS,
                                ) || '__none__'
                              }
                              onValueChange={label => {
                                const resolved =
                                  label === '__none__'
                                    ? ''
                                    : SPACING_OPTIONS[
                                        label as keyof typeof SPACING_OPTIONS
                                      ] || label;
                                if (paddingLinked) {
                                  handleStyleChange('padding', resolved);
                                  handleStyleChange('paddingTop', resolved);
                                  handleStyleChange('paddingRight', resolved);
                                  handleStyleChange('paddingBottom', resolved);
                                  handleStyleChange('paddingLeft', resolved);
                                } else {
                                  handleStyleChange('paddingTop', resolved);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-</SelectItem>
                                {Object.keys(SPACING_OPTIONS).map(label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Empty space */}
                          <div></div>

                          {/* Left */}
                          <div>
                            <label className="text-xs text-muted-foreground block">
                              Left
                            </label>
                            <Select
                              value={
                                getOptionLabel(
                                  selectedComponent.styles.paddingLeft,
                                  SPACING_OPTIONS,
                                ) || '__none__'
                              }
                              onValueChange={label => {
                                const resolved =
                                  label === '__none__'
                                    ? ''
                                    : SPACING_OPTIONS[
                                        label as keyof typeof SPACING_OPTIONS
                                      ] || label;
                                if (paddingLinked) {
                                  handleStyleChange('padding', resolved);
                                  handleStyleChange('paddingTop', resolved);
                                  handleStyleChange('paddingRight', resolved);
                                  handleStyleChange('paddingBottom', resolved);
                                  handleStyleChange('paddingLeft', resolved);
                                } else {
                                  handleStyleChange('paddingLeft', resolved);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-</SelectItem>
                                {Object.keys(SPACING_OPTIONS).map(label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end justify-center">
                            <button
                              type="button"
                              onClick={() => setPaddingLinked(v => !v)}
                              className={cn(
                                'px-2 py-1.5 text-xs border rounded transition-colors',
                                paddingLinked
                                  ? 'bg-primary/10 border-primary'
                                  : 'bg-muted hover:bg-muted/80 border-border',
                              )}
                              title={
                                paddingLinked
                                  ? 'Unlink sides'
                                  : 'Link sides (apply to all)'
                              }
                            >
                              <Link2 size={14} />
                            </button>
                          </div>
                          {/* Right */}
                          <div>
                            <label className="text-xs text-muted-foreground block">
                              Right
                            </label>
                            <Select
                              value={
                                getOptionLabel(
                                  selectedComponent.styles.paddingRight,
                                  SPACING_OPTIONS,
                                ) || '__none__'
                              }
                              onValueChange={label => {
                                const resolved =
                                  label === '__none__'
                                    ? ''
                                    : SPACING_OPTIONS[
                                        label as keyof typeof SPACING_OPTIONS
                                      ] || label;
                                if (paddingLinked) {
                                  handleStyleChange('padding', resolved);
                                  handleStyleChange('paddingTop', resolved);
                                  handleStyleChange('paddingRight', resolved);
                                  handleStyleChange('paddingBottom', resolved);
                                  handleStyleChange('paddingLeft', resolved);
                                } else {
                                  handleStyleChange('paddingRight', resolved);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-</SelectItem>
                                {Object.keys(SPACING_OPTIONS).map(label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Empty space */}
                          <div></div>
                          {/* Bottom (centered) */}
                          <div>
                            <label className="text-xs text-muted-foreground block">
                              Bottom
                            </label>
                            <Select
                              value={
                                getOptionLabel(
                                  selectedComponent.styles.paddingBottom,
                                  SPACING_OPTIONS,
                                ) || '__none__'
                              }
                              onValueChange={label => {
                                const resolved =
                                  label === '__none__'
                                    ? ''
                                    : SPACING_OPTIONS[
                                        label as keyof typeof SPACING_OPTIONS
                                      ] || label;
                                if (paddingLinked) {
                                  handleStyleChange('padding', resolved);
                                  handleStyleChange('paddingTop', resolved);
                                  handleStyleChange('paddingRight', resolved);
                                  handleStyleChange('paddingBottom', resolved);
                                  handleStyleChange('paddingLeft', resolved);
                                } else {
                                  handleStyleChange('paddingBottom', resolved);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-</SelectItem>
                                {Object.keys(SPACING_OPTIONS).map(label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Empty space */}
                          <div></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Divider */}
                  <div className="border-t border-border/50"></div>

                  {/* ===== COLORS CATEGORY ===== */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wide mb-2">
                      Colors
                    </h4>
                    <div className="space-y-2">
                      {/* Background */}
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Background
                        </label>
                        <ColorSelect
                          value={selectedComponent.styles.backgroundColor}
                          onValueChange={next =>
                            handleStyleChange('backgroundColor', next)
                          }
                        />
                      </div>
                      {/* Text Color */}
                      <div className="pb-2 border-b border-border/30">
                        <label className="text-xs text-muted-foreground">
                          Text Color
                        </label>
                        <ColorSelect
                          value={selectedComponent.styles.color}
                          onValueChange={next =>
                            handleStyleChange('color', next)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category Divider */}
                  <div className="border-t border-border/50"></div>

                  {/* ===== BORDERS CATEGORY ===== */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wide mb-2">
                      Borders
                    </h4>
                    <div className="space-y-2">
                      {/* Border Width */}
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Border Width
                        </label>
                        <Select
                          value={
                            getOptionLabel(
                              selectedComponent.styles.borderWidth,
                              BORDER_WIDTH_OPTIONS,
                            ) || '__none__'
                          }
                          onValueChange={next => {
                            const label = next === '__none__' ? '' : next;
                            handleStyleChange(
                              'borderWidth',
                              BORDER_WIDTH_OPTIONS[
                                label as keyof typeof BORDER_WIDTH_OPTIONS
                              ] || label,
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">-</SelectItem>
                            {Object.keys(BORDER_WIDTH_OPTIONS).map(label => (
                              <SelectItem key={label} value={label}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Border Style */}
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Border Style
                        </label>
                        <Select
                          value={
                            getOptionLabel(
                              selectedComponent.styles.borderStyle,
                              BORDER_STYLE_OPTIONS,
                            ) || '__none__'
                          }
                          onValueChange={next => {
                            const label = next === '__none__' ? '' : next;
                            handleStyleChange(
                              'borderStyle',
                              BORDER_STYLE_OPTIONS[
                                label as keyof typeof BORDER_STYLE_OPTIONS
                              ] || label,
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">-</SelectItem>
                            {Object.keys(BORDER_STYLE_OPTIONS).map(label => (
                              <SelectItem key={label} value={label}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Border Color */}
                      <div className="pb-2 border-b border-border/30">
                        <label className="text-xs text-muted-foreground">
                          Border Color
                        </label>
                        <ColorSelect
                          value={selectedComponent.styles.borderColor}
                          onValueChange={next =>
                            handleStyleChange('borderColor', next)
                          }
                          customInputType="color"
                        />
                      </div>

                      {/* Border Radius */}
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Border Radius
                        </label>
                        <Select
                          value={getOptionLabel(
                            selectedComponent.styles.borderRadius,
                            RADIUS_OPTIONS,
                          )}
                          onValueChange={label => {
                            if (!label) return;
                            handleStyleChange(
                              'borderRadius',
                              RADIUS_OPTIONS[
                                label as keyof typeof RADIUS_OPTIONS
                              ] || label,
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="Custom" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(RADIUS_OPTIONS).map(label => (
                              <SelectItem key={label} value={label}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Category Divider */}
                  <div className="border-t border-border/50"></div>

                  {/* ===== TYPOGRAPHY CATEGORY ===== */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wide mb-2">
                      Typography
                    </h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Font Size */}
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Font Size
                          </label>
                          <Select
                            value={
                              getOptionLabel(
                                selectedComponent.styles.fontSize,
                                FONT_SIZE_OPTIONS,
                              ) || '__custom__'
                            }
                            onValueChange={next => {
                              const label = next === '__custom__' ? '' : next;
                              handleStyleChange(
                                'fontSize',
                                FONT_SIZE_OPTIONS[
                                  label as keyof typeof FONT_SIZE_OPTIONS
                                ] || label,
                              );
                            }}
                          >
                            <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                              <SelectValue placeholder="Custom" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__custom__">Custom</SelectItem>
                              {Object.keys(FONT_SIZE_OPTIONS).map(label => (
                                <SelectItem key={label} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Font Weight */}
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Font Weight
                          </label>
                          <Select
                            value={
                              (selectedComponent.styles.fontWeight ||
                                'normal') as string
                            }
                            onValueChange={next =>
                              handleStyleChange('fontWeight', next)
                            }
                          >
                            <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="300">Light</SelectItem>
                              <SelectItem value="normal">Regular</SelectItem>
                              <SelectItem value="500">Medium</SelectItem>
                              <SelectItem value="600">Semi-Bold</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="800">Extra-Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Text Align
                          </label>
                          <Select
                            value={
                              getOptionLabel(
                                selectedComponent.styles.textAlign,
                                TEXT_ALIGN_OPTIONS as any,
                              ) || 'Left'
                            }
                            onValueChange={label => {
                              const value =
                                (TEXT_ALIGN_OPTIONS as any)[label] || 'left';
                              handleStyleChange('textAlign', value);
                            }}
                          >
                            <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(TEXT_ALIGN_OPTIONS).map(label => (
                                <SelectItem key={label} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            Line Height
                          </label>
                          <Select
                            value={
                              getOptionLabel(
                                selectedComponent.styles.lineHeight,
                                LINE_HEIGHT_OPTIONS as any,
                              ) || 'Normal'
                            }
                            onValueChange={label => {
                              const value =
                                (LINE_HEIGHT_OPTIONS as any)[label] || '1.5';
                              handleStyleChange('lineHeight', value);
                            }}
                          >
                            <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(LINE_HEIGHT_OPTIONS).map(label => (
                                <SelectItem key={label} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Letter Spacing
                          </label>
                          <Select
                            value={
                              getOptionLabel(
                                selectedComponent.styles.letterSpacing,
                                LETTER_SPACING_OPTIONS as any,
                              ) || 'Normal'
                            }
                            onValueChange={label => {
                              const value =
                                (LETTER_SPACING_OPTIONS as any)[label] ||
                                'normal';
                              handleStyleChange('letterSpacing', value);
                            }}
                          >
                            <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(LETTER_SPACING_OPTIONS).map(
                                label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            Transform
                          </label>
                          <Select
                            value={
                              getOptionLabel(
                                selectedComponent.styles.textTransform,
                                TEXT_TRANSFORM_OPTIONS as any,
                              ) || 'None'
                            }
                            onValueChange={label => {
                              const value =
                                (TEXT_TRANSFORM_OPTIONS as any)[label] ||
                                'none';
                              handleStyleChange('textTransform', value);
                            }}
                          >
                            <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(TEXT_TRANSFORM_OPTIONS).map(
                                label => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">
                          Decoration
                        </label>
                        <Select
                          value={
                            getOptionLabel(
                              selectedComponent.styles.textDecoration,
                              TEXT_DECORATION_OPTIONS as any,
                            ) || 'None'
                          }
                          onValueChange={label => {
                            const value =
                              (TEXT_DECORATION_OPTIONS as any)[label] || 'none';
                            handleStyleChange('textDecoration', value);
                          }}
                        >
                          <SelectTrigger className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(TEXT_DECORATION_OPTIONS).map(label => (
                              <SelectItem key={label} value={label}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Events Section */}
            <Collapsible
              open={openSections.includes('events')}
              onOpenChange={() => toggleSection('events')}
              className="border-2 border-foreground/10 rounded-md shadow-sm overflow-hidden"
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 text-sm font-semibold bg-muted/50 hover:bg-muted/70 transition-colors">
                <ChevronRight
                  size={14}
                  className={`transition-transform ${
                    openSections.includes('events') ? 'rotate-90' : ''
                  }`}
                />
                <Zap size={14} />
                Events
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 pt-2 px-3 pb-3 bg-muted/10">
                  <EventEditor
                    component={selectedComponent}
                    events={selectedComponent.events}
                    onUpdateEvent={handleEventUpdate}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Content-only wrapper for docked mode
export function PropertiesPanelContent() {
  const { getComponents, selectedId, selectedIds, updateComponent, project } =
    useBuilderStore();
  const components = project?.currentPageId
    ? project.pages[project.currentPageId]?.components || {}
    : {};
  const effectiveSelectedIds =
    selectedIds.length > 0 ? selectedIds : selectedId ? [selectedId] : [];
  const selectedComponents = effectiveSelectedIds
    .map(id => components[id])
    .filter(Boolean);
  const selectedComponent = selectedId
    ? components[selectedId]
    : selectedComponents[0];
  const isMultiSelect = selectedComponents.length > 1;
  const allSameType =
    selectedComponents.length > 0 &&
    selectedComponents.every(c => c.type === selectedComponents[0].type);
  const allContainers =
    selectedComponents.length > 0 &&
    selectedComponents.every(c =>
      [
        'Page',
        'Container',
        'Flex',
        'Grid',
        'Card',
        'Stack',
        'Form',
        'List',
      ].includes(c.type),
    );
  const hasEditableProps = [
    'Text',
    'Heading',
    'Button',
    'Label',
    'Input',
    'Textarea',
    'Image',
    'Avatar',
    'Badge',
    'Progress',
    'Icon',
    'Select',
    'Checkbox',
    'Radio',
    'Switch',
  ].includes(selectedComponent?.type || '');

  const [openSections, setOpenSections] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('props-panel-sections');
      return saved
        ? JSON.parse(saved)
        : ['info', 'properties', 'layout', 'appearance', 'events'];
    }
    return ['info', 'properties', 'layout', 'appearance', 'events'];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'props-panel-sections',
        JSON.stringify(openSections),
      );
    }
  }, [openSections]);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section],
    );
  };

  const handleStyleChange = (key: string, value: string) => {
    const freshComponents = getComponents();
    selectedComponents.forEach(comp => {
      const freshComp = freshComponents[comp.id] || comp;
      updateComponent(comp.id, {
        styles: { ...freshComp.styles, [key]: value },
      });
    });
  };

  const handlePropChange = (key: string, value: any) => {
    selectedComponents.forEach(comp => {
      updateComponent(comp.id, { props: { ...comp.props, [key]: value } });
    });
  };

  const handleNameChange = (value: string) => {
    if (isMultiSelect || !selectedComponent) return;
    updateComponent(selectedComponent.id, { name: value });
  };

  const handleEventUpdate = (
    eventType: EventType,
    action: EventAction | undefined,
  ) => {
    selectedComponents.forEach(comp => {
      const updatedEvents = { ...comp.events };
      if (action) {
        updatedEvents[eventType] = action;
      } else {
        delete updatedEvents[eventType];
      }
      updateComponent(comp.id, { events: updatedEvents });
    });
  };

  if (!selectedComponent) {
    return (
      <div className="h-full overflow-y-auto bg-card select-none p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Select a component to edit its properties
        </p>
      </div>
    );
  }

  const direction =
    selectedComponent.styles.flexDirection ||
    (typeof selectedComponent.className === 'string' &&
    /(^|\s)flex-col(\s|$)/.test(selectedComponent.className)
      ? 'column'
      : typeof selectedComponent.className === 'string' &&
          /(^|\s)flex-row(\s|$)/.test(selectedComponent.className)
        ? 'row'
        : selectedComponent.type === 'Flex'
          ? 'row'
          : 'column');

  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  return (
    <div className="h-full overflow-y-auto bg-background/30 backdrop-blur-xl select-none">
      {/* Header - editable name */}
      <div className="p-3 border-b border-border/60 bg-background/50">
        {isMultiSelect ? (
          <div className="text-xs font-medium truncate">
            {selectedComponents.length} selected
          </div>
        ) : isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={selectedComponent.name || ''}
            onChange={e => handleNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                setIsEditingName(false);
              }
            }}
            className="w-full text-xs font-medium bg-background border border-primary rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <div
            className="text-xs font-medium truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => setIsEditingName(true)}
            title="Click to edit name"
          >
            {selectedComponent.name || selectedComponent.type}
          </div>
        )}
        {!isMultiSelect && (
          <div className="text-[10px] text-muted-foreground">
            {selectedComponent.type}
          </div>
        )}
      </div>

      {/* Properties - above Layout */}
      <Collapsible
        open={hasEditableProps && openSections.includes('properties')}
        onOpenChange={() => hasEditableProps && toggleSection('properties')}
      >
        <CollapsibleTrigger
          className={cn(
            'flex items-center gap-2 w-full py-2 px-3 text-xs font-semibold border-b border-border',
            hasEditableProps
              ? 'hover:bg-muted/50'
              : 'opacity-50 cursor-not-allowed',
          )}
          disabled={!hasEditableProps}
        >
          <ChevronRight
            size={12}
            className={cn(
              'text-muted-foreground/50',
              hasEditableProps &&
                openSections.includes('properties') &&
                'rotate-90 text-foreground',
            )}
          />
          <Sliders size={14} /> Properties{' '}
          {!hasEditableProps && (
            <span className="text-[9px] text-muted-foreground ml-auto">
              (none)
            </span>
          )}
        </CollapsibleTrigger>
        {hasEditableProps && (
          <CollapsibleContent>
            <div className="p-3 space-y-2 border-b border-border">
              {['Text', 'Heading', 'Button', 'Label'].includes(
                selectedComponent.type,
              ) && (
                <div>
                  <label className="text-[10px] text-muted-foreground">
                    Text
                  </label>
                  <input
                    className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background transition-colors hover:border-border/80"
                    value={selectedComponent.props.text || ''}
                    onChange={e => handlePropChange('text', e.target.value)}
                  />
                </div>
              )}
              {selectedComponent.type === 'Heading' && (
                <div>
                  <label className="text-[10px] text-muted-foreground">
                    Level
                  </label>
                  <Select
                    value={String(selectedComponent.props.level || 2)}
                    onValueChange={v => handlePropChange('level', Number(v))}
                  >
                    <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(l => (
                        <SelectItem key={l} value={String(l)}>
                          H{l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedComponent.type === 'Button' && (
                <>
                  <div>
                    <label className="text-[10px] text-muted-foreground">
                      Variant
                    </label>
                    <Select
                      value={
                        (selectedComponent.props.variant || 'default') as string
                      }
                      onValueChange={v => handlePropChange('variant', v)}
                    >
                      <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                        <SelectItem value="destructive">Destructive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">
                      Size
                    </label>
                    <Select
                      value={
                        (selectedComponent.props.size || 'default') as string
                      }
                      onValueChange={v => handlePropChange('size', v)}
                    >
                      <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {['Input', 'Textarea'].includes(selectedComponent.type) && (
                <div>
                  <label className="text-[10px] text-muted-foreground">
                    Placeholder
                  </label>
                  <input
                    className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background transition-colors hover:border-border/80"
                    value={selectedComponent.props.placeholder || ''}
                    onChange={e =>
                      handlePropChange('placeholder', e.target.value)
                    }
                  />
                </div>
              )}
              {selectedComponent.type === 'Image' && (
                <>
                  <div>
                    <label className="text-[10px] text-muted-foreground">
                      Image URL
                    </label>
                    <input
                      className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background transition-colors hover:border-border/80"
                      value={selectedComponent.props.src || ''}
                      onChange={e => handlePropChange('src', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">
                      Alt Text
                    </label>
                    <input
                      className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background transition-colors hover:border-border/80"
                      value={selectedComponent.props.alt || ''}
                      onChange={e => handlePropChange('alt', e.target.value)}
                    />
                  </div>
                </>
              )}
              {selectedComponent.type === 'Progress' && (
                <div>
                  <label className="text-[10px] text-muted-foreground">
                    Value (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background transition-colors hover:border-border/80"
                    value={selectedComponent.props.progressValue || 0}
                    onChange={e =>
                      handlePropChange('progressValue', Number(e.target.value))
                    }
                  />
                </div>
              )}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>

      {/* Layout - for containers */}
      <Collapsible
        open={allContainers && openSections.includes('layout')}
        onOpenChange={() => allContainers && toggleSection('layout')}
      >
        <CollapsibleTrigger
          className={cn(
            'flex items-center gap-2 w-full py-2 px-3 text-xs font-semibold border-b border-border',
            allContainers
              ? 'hover:bg-muted/50'
              : 'opacity-50 cursor-not-allowed',
          )}
          disabled={!allContainers}
        >
          <ChevronRight
            size={12}
            className={cn(
              'text-muted-foreground/50',
              allContainers &&
                openSections.includes('layout') &&
                'rotate-90 text-foreground',
            )}
          />
          <LayoutGrid size={14} /> Layout{' '}
          {!allContainers && (
            <span className="text-[9px] text-muted-foreground ml-auto">
              (containers)
            </span>
          )}
        </CollapsibleTrigger>
        {allContainers && (
          <CollapsibleContent>
            <div className="p-3 space-y-3 border-b border-border">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleStyleChange('flexDirection', 'row')}
                    className={cn(
                      'p-1.5 rounded border text-[10px] flex items-center justify-center gap-1',
                      direction === 'row'
                        ? 'border-primary bg-primary/10'
                        : 'border-border',
                    )}
                  >
                    <ArrowRightLeft size={12} /> Row
                  </button>
                  <button
                    onClick={() => handleStyleChange('flexDirection', 'column')}
                    className={cn(
                      'p-1.5 rounded border text-[10px] flex items-center justify-center gap-1',
                      direction === 'column'
                        ? 'border-primary bg-primary/10'
                        : 'border-border',
                    )}
                  >
                    <ArrowUpDown size={12} /> Column
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Align
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    {
                      value: 'start',
                      icon: AlignStartVertical,
                      label: 'Start',
                    },
                    {
                      value: 'center',
                      icon: AlignCenterVertical,
                      label: 'Center',
                    },
                    { value: 'end', icon: AlignEndVertical, label: 'End' },
                    { value: 'stretch', icon: Maximize2, label: 'Stretch' },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => handleStyleChange('alignItems', value)}
                      className={cn(
                        'p-1.5 rounded border flex flex-col items-center justify-center gap-0.5',
                        selectedComponent.styles.alignItems === value
                          ? 'border-primary bg-primary/10'
                          : 'border-border',
                      )}
                    >
                      <Icon size={14} />
                      <span className="text-[8px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Justify
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    {
                      value: 'start',
                      icon: AlignStartHorizontal,
                      label: 'Start',
                    },
                    {
                      value: 'center',
                      icon: AlignCenterHorizontal,
                      label: 'Center',
                    },
                    { value: 'end', icon: AlignEndHorizontal, label: 'End' },
                    {
                      value: 'space-between',
                      icon: ArrowRightLeft,
                      label: 'Between',
                    },
                    {
                      value: 'space-around',
                      icon: ArrowRightLeft,
                      label: 'Around',
                    },
                    {
                      value: 'space-evenly',
                      icon: ArrowRightLeft,
                      label: 'Evenly',
                    },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => handleStyleChange('justifyContent', value)}
                      className={cn(
                        'p-1.5 rounded border flex flex-col items-center justify-center gap-0.5',
                        selectedComponent.styles.justifyContent === value
                          ? 'border-primary bg-primary/10'
                          : 'border-border',
                      )}
                    >
                      <Icon size={14} />
                      <span className="text-[8px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Gap
                </label>
                <Select
                  value={(selectedComponent.styles.gap || '0') as string}
                  onValueChange={v => handleStyleChange('gap', v)}
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="0.25rem">X-Small</SelectItem>
                    <SelectItem value="0.5rem">Small</SelectItem>
                    <SelectItem value="1rem">Medium</SelectItem>
                    <SelectItem value="1.5rem">Large</SelectItem>
                    <SelectItem value="2rem">X-Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>

      {/* Appearance - below Layout */}
      <Collapsible
        open={openSections.includes('appearance')}
        onOpenChange={() => toggleSection('appearance')}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 bg-background/40 hover:bg-background/55 text-xs font-semibold border-b border-border/60">
          <ChevronRight
            size={12}
            className={cn(
              'text-muted-foreground/50',
              openSections.includes('appearance') &&
                'rotate-90 text-foreground',
            )}
          />
          <Paintbrush size={14} /> Appearance
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 space-y-2 border-b border-border">
            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Width
                </label>
                <Select
                  value={(selectedComponent.styles.width || 'auto') as string}
                  onValueChange={v => handleStyleChange('width', v)}
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="100%">Full</SelectItem>
                    <SelectItem value="50%">Half</SelectItem>
                    <SelectItem value="fit-content">Fit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Height
                </label>
                <Select
                  value={(selectedComponent.styles.height || 'auto') as string}
                  onValueChange={v => handleStyleChange('height', v)}
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="100%">Full</SelectItem>
                    <SelectItem value="fit-content">Fit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Spacing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Padding
                </label>
                <Select
                  value={(selectedComponent.styles.padding || '0') as string}
                  onValueChange={v => handleStyleChange('padding', v)}
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="0.25rem">X-Small</SelectItem>
                    <SelectItem value="0.5rem">Small</SelectItem>
                    <SelectItem value="1rem">Medium</SelectItem>
                    <SelectItem value="1.5rem">Large</SelectItem>
                    <SelectItem value="2rem">X-Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Margin
                </label>
                <Select
                  value={(selectedComponent.styles.margin || '0') as string}
                  onValueChange={v => handleStyleChange('margin', v)}
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="0.25rem">X-Small</SelectItem>
                    <SelectItem value="0.5rem">Small</SelectItem>
                    <SelectItem value="1rem">Medium</SelectItem>
                    <SelectItem value="1.5rem">Large</SelectItem>
                    <SelectItem value="2rem">X-Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Background */}
            <div>
              <label className="text-[10px] text-muted-foreground">
                Background
              </label>
              <ColorSelect
                value={selectedComponent.styles.backgroundColor}
                onValueChange={next =>
                  handleStyleChange('backgroundColor', next)
                }
                className="mt-0"
                customInputType="color"
              />
            </div>
            {/* Border */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Border Width
                </label>
                <Select
                  value={
                    (selectedComponent.styles.borderWidth || '0') as string
                  }
                  onValueChange={v => handleStyleChange('borderWidth', v)}
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1px">1px</SelectItem>
                    <SelectItem value="2px">2px</SelectItem>
                    <SelectItem value="4px">4px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Border Radius
                </label>
                <Select
                  value={
                    (selectedComponent.styles.borderRadius || '0') as string
                  }
                  onValueChange={v => handleStyleChange('borderRadius', v)}
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="0.25rem">Small</SelectItem>
                    <SelectItem value="0.5rem">Medium</SelectItem>
                    <SelectItem value="0.75rem">Large</SelectItem>
                    <SelectItem value="1rem">X-Large</SelectItem>
                    <SelectItem value="9999px">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">
                Border Color
              </label>
              <ColorSelect
                value={selectedComponent.styles.borderColor}
                onValueChange={next => handleStyleChange('borderColor', next)}
                className="mt-0"
                customInputType="color"
              />
            </div>
            {/* Text */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Text Color
                </label>
                <ColorSelect
                  value={selectedComponent.styles.color}
                  onValueChange={next => handleStyleChange('color', next)}
                  className="mt-0"
                  customInputType="color"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Font Size
                </label>
                <Select
                  value={
                    ((selectedComponent.styles.fontSize || '') as string) ||
                    '__default__'
                  }
                  onValueChange={v =>
                    handleStyleChange('fontSize', v === '__default__' ? '' : v)
                  }
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">Default</SelectItem>
                    <SelectItem value="0.75rem">X-Small</SelectItem>
                    <SelectItem value="0.875rem">Small</SelectItem>
                    <SelectItem value="1rem">Medium</SelectItem>
                    <SelectItem value="1.125rem">Large</SelectItem>
                    <SelectItem value="1.25rem">X-Large</SelectItem>
                    <SelectItem value="1.5rem">2X-Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Shadow & Opacity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Shadow
                </label>
                <Select
                  value={
                    (selectedComponent.styles as any).boxShadow ||
                    '' ||
                    '__none__'
                  }
                  onValueChange={v =>
                    handleStyleChange('boxShadow', v === '__none__' ? '' : v)
                  }
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    <SelectItem value="0 1px 2px rgba(0,0,0,0.05)">
                      Small
                    </SelectItem>
                    <SelectItem value="0 4px 6px rgba(0,0,0,0.1)">
                      Medium
                    </SelectItem>
                    <SelectItem value="0 10px 15px rgba(0,0,0,0.1)">
                      Large
                    </SelectItem>
                    <SelectItem value="0 25px 50px rgba(0,0,0,0.25)">
                      X-Large
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Opacity
                </label>
                <Select
                  value={
                    ((selectedComponent.styles as any).opacity || '1') as string
                  }
                  onValueChange={v => handleStyleChange('opacity', v)}
                >
                  <SelectTrigger className="w-full mt-1 px-2 py-1 text-xs border border-border rounded bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">100%</SelectItem>
                    <SelectItem value="0.9">90%</SelectItem>
                    <SelectItem value="0.75">75%</SelectItem>
                    <SelectItem value="0.5">50%</SelectItem>
                    <SelectItem value="0.25">25%</SelectItem>
                    <SelectItem value="0">0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Events */}
      <Collapsible
        open={openSections.includes('events')}
        onOpenChange={() => toggleSection('events')}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 bg-background/40 hover:bg-background/55 text-xs font-semibold border-b border-border/60">
          <ChevronRight
            size={12}
            className={cn(
              'text-muted-foreground/50',
              openSections.includes('events') && 'rotate-90 text-foreground',
            )}
          />
          <Zap size={14} /> Events
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 border-b border-border">
            <EventEditor
              component={selectedComponent}
              events={selectedComponent.events}
              onUpdateEvent={handleEventUpdate}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
