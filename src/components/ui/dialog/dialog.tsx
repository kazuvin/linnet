"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

// Root Dialog component
export const Dialog = DialogPrimitive.Root;

// Dialog Trigger
export const DialogTrigger = DialogPrimitive.Trigger;

// Dialog Portal
export const DialogPortal = DialogPrimitive.Portal;

// Dialog Close
export const DialogClose = DialogPrimitive.Close;

// Dialog Overlay Props
export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;

// Dialog Overlay
export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm",
        "data-[state=closed]:animate-out data-[state=open]:animate-in",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "duration-200",
        className
      )}
      {...props}
    />
  );
}

// Dialog Content Props
export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
} as const;

// Dialog Content
export function DialogContent({ className, size = "md", children, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
          "rounded-lg border border-foreground/10 bg-background p-6 shadow-lg",
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
          "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
          "duration-200",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity",
            "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
            "disabled:pointer-events-none"
          )}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

// Dialog Header Props
export type DialogHeaderProps = ComponentProps<"div">;

// Dialog Header
export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-3 text-center sm:text-left", className)} {...props} />
  );
}

// Dialog Footer Props
export type DialogFooterProps = ComponentProps<"div">;

// Dialog Footer
export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

// Dialog Title Props
export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;

// Dialog Title
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn("font-semibold text-foreground text-lg leading-none tracking-tight", className)}
      {...props}
    />
  );
}

// Dialog Description Props
export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;

// Dialog Description
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={cn("text-foreground/70 text-sm", className)}
      {...props}
    />
  );
}
