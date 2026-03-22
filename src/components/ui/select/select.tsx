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
        "group inline-flex select-none items-center gap-2 rounded-full border border-foreground/10 bg-background px-4 py-2.5 text-sm md:py-2",
        "transition-all duration-300 ease-default",
        "hover:bg-foreground/5 focus:outline-none",
        "data-[placeholder]:text-foreground/50",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex",
          width !== undefined && "transition-[width] duration-300 ease-default"
        )}
        style={{ width }}
      >
        <span ref={contentRef} className="whitespace-nowrap">
          {children}
        </span>
      </span>
      <span className="flex items-center justify-center transition-transform duration-300 ease-spring group-data-[state=open]:rotate-180">
        <ChevronDownIcon className="h-3.5 w-3.5 text-foreground/40 transition-colors duration-200 group-hover:text-foreground/60" />
      </span>
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
        <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
          <ChevronDownIcon className="h-3.5 w-3.5 rotate-180 text-foreground/40" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className="p-1"
          style={{
            maxHeight: "min(var(--radix-select-content-available-height, 100dvh), 50dvh)",
          }}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
          <ChevronDownIcon className="h-3.5 w-3.5 text-foreground/40" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// ============================================================================
// SelectGroup / SelectLabel
// ============================================================================

export const SelectGroup = SelectPrimitive.Group;

export type SelectLabelProps = ComponentProps<typeof SelectPrimitive.Label>;

export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      className={cn("px-3 pt-2.5 pb-1 font-medium text-[11px] text-muted md:px-2", className)}
      {...props}
    />
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
        "relative flex cursor-pointer select-none items-center rounded-sm py-2.5 pr-8 pl-3 text-sm outline-none md:py-1.5 md:pl-2",
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
