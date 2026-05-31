import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithoutRef } from 'react';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    default:
      'border border-primary/20 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--flow-icon-via)_80%,white_20%)_0%,var(--flow-icon-via)_52%,color-mix(in_oklab,var(--flow-icon-to)_82%,black_18%)_100%)] text-white shadow-[0_14px_28px_-20px_rgba(0,0,0,0.75)] hover:brightness-105 active:scale-[0.99] transition duration-150',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
