'use client';

import { cn } from '@/lib/utils';

// Tag color mapping - subtle with opacity and borders
const tagColors: Record<
  string,
  { bg: string; text: string; borderT: string; borderB: string }
> = {
  // Blue variants (forms, interactive, button, input, etc.)
  forms: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600/90 dark:text-blue-400/90',
    borderT: 'border-t-blue-400/15',
    borderB: 'border-b-blue-950/25',
  },
  interactive: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600/90 dark:text-blue-400/90',
    borderT: 'border-t-blue-400/15',
    borderB: 'border-b-blue-950/25',
  },
  button: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600/90 dark:text-blue-400/90',
    borderT: 'border-t-blue-400/15',
    borderB: 'border-b-blue-950/25',
  },
  input: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600/90 dark:text-blue-400/90',
    borderT: 'border-t-blue-400/15',
    borderB: 'border-b-blue-950/25',
  },
  text: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600/90 dark:text-blue-400/90',
    borderT: 'border-t-blue-400/15',
    borderB: 'border-b-blue-950/25',
  },

  // Purple variants (display, badge, status)
  display: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600/90 dark:text-purple-400/90',
    borderT: 'border-t-purple-400/15',
    borderB: 'border-b-purple-950/25',
  },
  badge: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600/90 dark:text-purple-400/90',
    borderT: 'border-t-purple-400/15',
    borderB: 'border-b-purple-950/25',
  },
  status: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600/90 dark:text-purple-400/90',
    borderT: 'border-t-purple-400/15',
    borderB: 'border-b-purple-950/25',
  },

  // Pink variants (animated)
  animated: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-600/90 dark:text-pink-400/90',
    borderT: 'border-t-pink-400/15',
    borderB: 'border-b-pink-950/25',
  },

  // Orange variants (layout, modal, dialog, overlay, popover)
  layout: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600/90 dark:text-orange-400/90',
    borderT: 'border-t-orange-400/15',
    borderB: 'border-b-orange-950/25',
  },
  modal: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600/90 dark:text-orange-400/90',
    borderT: 'border-t-orange-400/15',
    borderB: 'border-b-orange-950/25',
  },
  dialog: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600/90 dark:text-orange-400/90',
    borderT: 'border-t-orange-400/15',
    borderB: 'border-b-orange-950/25',
  },
  overlay: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600/90 dark:text-orange-400/90',
    borderT: 'border-t-orange-400/15',
    borderB: 'border-b-orange-950/25',
  },
  popover: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600/90 dark:text-orange-400/90',
    borderT: 'border-t-orange-400/15',
    borderB: 'border-b-orange-950/25',
  },

  // Teal variants (navigation, tabs)
  navigation: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600/90 dark:text-teal-400/90',
    borderT: 'border-t-teal-400/15',
    borderB: 'border-b-teal-950/25',
  },
  tabs: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600/90 dark:text-teal-400/90',
    borderT: 'border-t-teal-400/15',
    borderB: 'border-b-teal-950/25',
  },
  waves: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600/90 dark:text-teal-400/90',
    borderT: 'border-t-teal-400/15',
    borderB: 'border-b-teal-950/25',
  },

  // Cyan variants (container, card)
  container: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600/90 dark:text-cyan-400/90',
    borderT: 'border-t-cyan-400/15',
    borderB: 'border-b-cyan-950/25',
  },
  card: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600/90 dark:text-cyan-400/90',
    borderT: 'border-t-cyan-400/15',
    borderB: 'border-b-cyan-950/25',
  },
  css: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600/90 dark:text-cyan-400/90',
    borderT: 'border-t-cyan-400/15',
    borderB: 'border-b-cyan-950/25',
  },

  // Green variants (data, table)
  data: {
    bg: 'bg-green-500/10',
    text: 'text-green-600/90 dark:text-green-400/90',
    borderT: 'border-t-green-400/15',
    borderB: 'border-b-green-950/25',
  },
  table: {
    bg: 'bg-green-500/10',
    text: 'text-green-600/90 dark:text-green-400/90',
    borderT: 'border-t-green-400/15',
    borderB: 'border-b-green-950/25',
  },
  organic: {
    bg: 'bg-green-500/10',
    text: 'text-green-600/90 dark:text-green-400/90',
    borderT: 'border-t-green-400/15',
    borderB: 'border-b-green-950/25',
  },

  // Violet variants (theme, particles)
  theme: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600/90 dark:text-violet-400/90',
    borderT: 'border-t-violet-400/15',
    borderB: 'border-b-violet-950/25',
  },
  particles: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600/90 dark:text-violet-400/90',
    borderT: 'border-t-violet-400/15',
    borderB: 'border-b-violet-950/25',
  },

  // Rose variants (media)
  media: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600/90 dark:text-rose-400/90',
    borderT: 'border-t-rose-400/15',
    borderB: 'border-b-rose-950/25',
  },

  // Indigo variants (backgrounds, space)
  backgrounds: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600/90 dark:text-indigo-400/90',
    borderT: 'border-t-indigo-400/15',
    borderB: 'border-b-indigo-950/25',
  },
  space: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600/90 dark:text-indigo-400/90',
    borderT: 'border-t-indigo-400/15',
    borderB: 'border-b-indigo-950/25',
  },

  // Amber variants (canvas)
  canvas: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600/90 dark:text-amber-400/90',
    borderT: 'border-t-amber-400/15',
    borderB: 'border-b-amber-950/25',
  },
  webgl: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600/90 dark:text-amber-400/90',
    borderT: 'border-t-amber-400/15',
    borderB: 'border-b-amber-950/25',
  },

  // Fuchsia variants (gradient)
  gradient: {
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-600/90 dark:text-fuchsia-400/90',
    borderT: 'border-t-fuchsia-400/15',
    borderB: 'border-b-fuchsia-950/25',
  },

  // Sky variants (geometric, weather)
  geometric: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-600/90 dark:text-sky-400/90',
    borderT: 'border-t-sky-400/15',
    borderB: 'border-b-sky-950/25',
  },
  weather: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-600/90 dark:text-sky-400/90',
    borderT: 'border-t-sky-400/15',
    borderB: 'border-b-sky-950/25',
  },

  // Emerald variants (ambient, atmospheric)
  ambient: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600/90 dark:text-emerald-400/90',
    borderT: 'border-t-emerald-400/15',
    borderB: 'border-b-emerald-950/25',
  },
  atmospheric: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600/90 dark:text-emerald-400/90',
    borderT: 'border-t-emerald-400/15',
    borderB: 'border-b-emerald-950/25',
  },

  // Yellow variants (festive)
  festive: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600/90 dark:text-yellow-400/90',
    borderT: 'border-t-yellow-400/15',
    borderB: 'border-b-yellow-950/25',
  },

  // Red variants (fire, electric)
  fire: {
    bg: 'bg-red-500/10',
    text: 'text-red-600/90 dark:text-red-400/90',
    borderT: 'border-t-red-400/15',
    borderB: 'border-b-red-950/25',
  },
  electric: {
    bg: 'bg-red-500/10',
    text: 'text-red-600/90 dark:text-red-400/90',
    borderT: 'border-t-red-400/15',
    borderB: 'border-b-red-950/25',
  },

  // Indigo variants (tech)
  tech: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600/90 dark:text-indigo-400/90',
    borderT: 'border-t-indigo-400/15',
    borderB: 'border-b-indigo-950/25',
  },

  // Lime variants (nature)
  nature: {
    bg: 'bg-lime-500/10',
    text: 'text-lime-600/90 dark:text-lime-400/90',
    borderT: 'border-t-lime-400/15',
    borderB: 'border-b-lime-950/25',
  },

  // Rose variants (colorful)
  colorful: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600/90 dark:text-rose-400/90',
    borderT: 'border-t-rose-400/15',
    borderB: 'border-b-rose-950/25',
  },
};

const defaultColor = {
  bg: 'bg-slate-500/10',
  text: 'text-slate-600/90 dark:text-slate-400/90',
  borderT: 'border-t-slate-400/15',
  borderB: 'border-b-slate-950/25',
};

function getTagColors(tag: string) {
  return tagColors[tag.toLowerCase()] || defaultColor;
}

function capitalizeTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

interface TagProps {
  tag: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tag({ tag, size = 'md', className }: TagProps) {
  const colors = getTagColors(tag);

  return (
    <span
      className={cn(
        'rounded font-medium border-t border-b',
        colors.bg,
        colors.text,
        colors.borderT,
        colors.borderB,
        size === 'sm' ? 'text-[10px] px-1.5 py-[3px]' : 'text-xs px-2 py-[3px]',
        className,
      )}
    >
      {capitalizeTag(tag)}
    </span>
  );
}

interface TagListProps {
  tags: string[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function TagList({ tags, max, size = 'md', className }: TagListProps) {
  const displayTags = max ? tags.slice(0, max) : tags;
  const remaining = max && tags.length > max ? tags.length - max : 0;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {displayTags.map(tag => (
        <Tag key={tag} tag={tag} size={size} />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            'rounded font-medium border-t border-b',
            defaultColor.bg,
            defaultColor.text,
            defaultColor.borderT,
            defaultColor.borderB,
            size === 'sm'
              ? 'text-[10px] px-1.5 py-[3px]'
              : 'text-xs px-2 py-[3px]',
          )}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
