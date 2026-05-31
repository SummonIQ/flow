import { ComponentProps } from 'react';

interface ProgressProps extends ComponentProps<'div'> {
  value?: number;
}

export function Progress({
  value = 0,
  className = '',
  ...props
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
