import { cn } from '@/lib/utils';
import { Loader2, Play, Square } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

const sizeStyles = {
  xs: {
    button: 'h-7 px-2.5 gap-1.5 text-[11px]',
    icon: 'h-3.5 w-3.5',
    iconOnly: 'h-7 w-7',
  },
  sm: {
    button: 'h-8 px-3 gap-1.5 text-xs',
    icon: 'h-3.5 w-3.5',
    iconOnly: 'h-8 w-8',
  },
  md: {
    button: 'h-9 px-3.5 gap-2 text-sm',
    icon: 'h-4 w-4',
    iconOnly: 'h-9 w-9',
  },
  lg: {
    button: 'h-10 px-4 gap-2 text-sm',
    icon: 'h-5 w-5',
    iconOnly: 'h-10 w-10',
  },
} as const;

export type RunControlState = 'running' | 'stopped' | 'starting' | 'stopping';

export interface RunControlButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  state: RunControlState;
  size?: keyof typeof sizeStyles;
  startLabel?: string;
  stopLabel?: string;
  startingLabel?: string;
  stoppingLabel?: string;
  iconOnly?: boolean;
  loading?: boolean;
}

export function RunControlButton({
  state,
  size = 'sm',
  startLabel = 'Start',
  stopLabel = 'Stop',
  startingLabel = 'Starting...',
  stoppingLabel = 'Stopping...',
  iconOnly = false,
  loading = false,
  className,
  type = 'button',
  ...props
}: RunControlButtonProps) {
  const isStopTone = state === 'running' || state === 'stopping';
  const isBusy = loading || state === 'starting' || state === 'stopping';
  const label =
    state === 'starting'
      ? startingLabel
      : state === 'stopping'
        ? stoppingLabel
        : isStopTone
          ? stopLabel
          : startLabel;
  const sizeConfig = sizeStyles[size];
  const ariaLabel = props['aria-label'] ?? (iconOnly ? label : undefined);

  return (
    <button
      {...props}
      type={type}
      aria-busy={isBusy || undefined}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold leading-none transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-60',
        iconOnly ? sizeConfig.iconOnly : sizeConfig.button,
        isStopTone
          ? 'border border-red-500/40 bg-gradient-to-b from-red-500/90 via-red-600/90 to-red-800/95 text-red-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_22px_rgba(0,0,0,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_12px_24px_rgba(0,0,0,0.45)]'
          : 'border border-emerald-400/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_rgba(0,0,0,0.35)] hover:text-emerald-100 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_24px_rgba(0,0,0,0.4)]',
        className,
      )}
    >
      {isBusy ? (
        <Loader2
          className={cn(
            sizeConfig.icon,
            isStopTone ? 'text-red-50' : 'text-emerald-100',
            'animate-spin',
          )}
        />
      ) : isStopTone ? (
        <Square
          className={cn(
            sizeConfig.icon,
            'text-current drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]',
          )}
          strokeWidth={2.5}
        />
      ) : (
        <Play
          className={cn(
            sizeConfig.icon,
            'text-current drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]',
          )}
          strokeWidth={2.5}
        />
      )}
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
