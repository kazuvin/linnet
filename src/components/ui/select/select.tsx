"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { type ComponentProps, useRef } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";
import { useElementDimensions } from "@/lib/animation";
import { cn } from "@/lib/utils";

// ============================================================================
// Select (Root)
// ============================================================================

export const Select = SelectPrimitive.Root;

// ============================================================================
// SelectTrigger
// ============================================================================

export type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger>;

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const contentRef = useRef<HTMLSpanElement>(null);
  const { width } = useElementDimensions(contentRef, { type: "width" });

  return (
    <SelectPrimitive.Trigger
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-4 py-2 text-sm",
        "transition-all duration-300 ease-default",
        "hover:bg-foreground/5 focus:outline-none",
        "data-[placeholder]:text-foreground/50",
        className
      )}
      {...props}
    >
      <span className="inline-flex transition-[width] duration-300 ease-default" style={{ width }}>
        <span ref={contentRef} className="whitespace-nowrap">
          {children}
        </span>
      </span>
      <SelectPrimitive.Icon>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// ============================================================================
// SelectValue
// ============================================================================

export const SelectValue = SelectPrimitive.Value;

// ============================================================================
// SelectContent
// ============================================================================

export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content>;

export function SelectContent({ className, children, ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-foreground/10 bg-background p-1 text-foreground shadow-md",
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "duration-200",
          className
        )}
        position="popper"
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// ============================================================================
// SelectItem
// ============================================================================

export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>;

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none",
        "transition-all duration-300 ease-default",
        "focus:bg-foreground/5",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
