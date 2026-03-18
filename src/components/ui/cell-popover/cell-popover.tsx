"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Root
export const CellPopover = PopoverPrimitive.Root;

// Anchor（virtualRef でセル要素をアンカーとして指定）
export const CellPopoverAnchor = PopoverPrimitive.Anchor;

// Content
export type CellPopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content>;

export function CellPopoverContent({
  className,
  sideOffset = 4,
  ...props
}: CellPopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-lg border border-foreground/10 bg-background p-1 shadow-dropdown",
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "duration-200",
          className
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

// Item
type CellPopoverItemProps = {
  onClick: () => void;
  children: ReactNode;
  variant?: "default" | "destructive";
};

export function CellPopoverItem({ onClick, children, variant = "default" }: CellPopoverItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2.5 text-left text-sm transition-colors md:py-1.5",
        variant === "destructive"
          ? "text-destructive hover:bg-destructive/5"
          : "text-foreground hover:bg-foreground/5"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
