'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Modal = DialogPrimitive.Root;

const ModalTrigger = DialogPrimitive.Trigger;

const ModalPortal = DialogPrimitive.Portal;

const ModalClose = DialogPrimitive.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-400 data-[state=open]:duration-300',
      className,
    )}
    ref={ref}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const modalVariants = cva(
  'fixed z-50 grid border bg-background shadow-2xl outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: [
          // Mobile: drawer from bottom with margins
          'left-1 right-1 bottom-0 rounded-t-2xl border-t',
          'touch-action-none will-change-transform',
          'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          // Desktop: centered modal
          'md:left-[50%] md:top-[50%] md:right-auto md:bottom-auto md:translate-x-[-50%] md:translate-y-[-50%]',
          'md:rounded-2xl md:border',
          'md:transition-all md:duration-300',
          'md:data-[state=closed]:fade-out-0 md:data-[state=open]:fade-in-0',
          'md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95',
          'md:data-[state=closed]:slide-out-to-bottom-[4rem] md:data-[state=open]:slide-in-from-bottom-[4rem]',
        ],
        'slide-left': [
          'fixed inset-y-0 left-0 h-full border-r',
          'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          'data-[state=closed]:duration-300 data-[state=open]:duration-300',
        ],
        'slide-right': [
          'fixed inset-y-0 right-0 h-full border-l',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:duration-300 data-[state=open]:duration-300',
        ],
      },
    },
  },
);

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalVariants> {
  customActions?: React.ReactNode;
  showClose?: boolean;
  showOverlay?: boolean;
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(
  (
    {
      className,
      variant = 'default',
      showOverlay = true,
      showClose = true,
      customActions,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <ModalPortal>
        {showOverlay && <ModalOverlay />}
        <DialogPrimitive.Content
          className={cn(modalVariants({ variant }), className)}
          ref={ref}
          onOpenAutoFocus={e => {
            // Prevent Radix from auto-focusing the first focusable element (typically the close button).
            e.preventDefault();
            props.onOpenAutoFocus?.(e);
          }}
          {...props}
        >
          {children}
          {showClose || customActions != null ? (
            <div className="absolute right-4 top-4 flex items-center gap-2">
              {customActions}
              {showClose && (
                <DialogPrimitive.Close
                  className={cn(
                    'h-9 w-9 rounded-full border border-border bg-background/80 backdrop-blur-sm',
                    'p-0 flex items-center justify-center text-border',
                    'transition-all duration-150 hover:bg-red-500/15 hover:border-red-500 hover:text-red-500 hover:backdrop-blur-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'disabled:pointer-events-none active:scale-[0.94]',
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </ModalPortal>
    );
  },
);
ModalContent.displayName = DialogPrimitive.Content.displayName;

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  hideBorder?: boolean;
}

const ModalHeader = ({
  className,
  hideBorder = false,
  ...props
}: ModalHeaderProps) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center p-4 md:p-6 sm:text-left',
      !hideBorder && 'border-b',
      className,
    )}
    {...props}
  />
);
ModalHeader.displayName = 'ModalHeader';

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  hideBorder?: boolean;
}
const ModalFooter = ({
  hideBorder = false,
  className,
  ...props
}: ModalFooterProps) => (
  <div
    className={cn(
      'flex flex-row flex-1 p-4 md:p-6 justify-end space-x-3',
      !hideBorder && 'border-t',
      className,
    )}
    {...props}
  />
);
ModalFooter.displayName = 'ModalFooter';

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    ref={ref}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    className={cn('text-sm text-muted-foreground', className)}
    ref={ref}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
  modalVariants,
};
