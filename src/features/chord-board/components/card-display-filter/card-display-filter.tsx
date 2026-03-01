"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import type { CardDisplayOption } from "../../stores/card-display-store";
import { useCardDisplayStore } from "../../stores/card-display-store";

const DISPLAY_OPTIONS: { value: CardDisplayOption; label: string }[] = [
  { value: "tones", label: "構成音" },
  { value: "scale", label: "スケール" },
];

export type CardDisplayFilterProps = ComponentProps<"fieldset">;

export function CardDisplayFilter({ className, ...props }: CardDisplayFilterProps) {
  const { activeOptions, toggleOption } = useCardDisplayStore();

  return (
    <fieldset
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-background p-1",
        className
      )}
      {...props}
    >
      <legend className="sr-only">カード表示オプション</legend>
      {DISPLAY_OPTIONS.map(({ value, label }) => {
        const isActive = activeOptions.has(value);
        return (
          <label key={value} className="contents">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => toggleOption(value)}
              className="sr-only"
            />
            <span
              className={cn(
                "inline-flex cursor-pointer items-center justify-center rounded-full px-3 py-1 font-medium text-xs transition-colors duration-200",
                "focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2",
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/50 hover:text-foreground/70"
              )}
            >
              {label}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
