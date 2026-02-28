"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type NumberStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  id?: string;
  className?: string;
};

const LONG_PRESS_DELAY = 400;
const LONG_PRESS_INTERVAL = 80;

export function NumberStepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  label,
  id,
  className,
}: NumberStepperProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clamp = useCallback((v: number) => Math.max(min, Math.min(max, v)), [min, max]);

  const increment = useCallback(() => {
    onChange(clamp(value + step));
  }, [onChange, clamp, value, step]);

  const decrement = useCallback(() => {
    onChange(clamp(value - step));
  }, [onChange, clamp, value, step]);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (longPressInterval.current) {
      clearInterval(longPressInterval.current);
      longPressInterval.current = null;
    }
  }, []);

  const startLongPress = useCallback(
    (action: () => void) => {
      clearLongPress();
      longPressTimer.current = setTimeout(() => {
        longPressInterval.current = setInterval(action, LONG_PRESS_INTERVAL);
      }, LONG_PRESS_DELAY);
    },
    [clearLongPress]
  );

  // Clean up timers on unmount
  useEffect(() => clearLongPress, [clearLongPress]);

  const startEditing = useCallback(() => {
    setEditValue(String(value));
    setIsEditing(true);
  }, [value]);

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    const parsed = Number(editValue);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  }, [editValue, onChange, clamp]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commitEdit();
      } else if (e.key === "Escape") {
        setIsEditing(false);
      }
    },
    [commitEdit]
  );

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-muted text-sm">
          {label}
        </label>
      )}
      <div className="flex items-center gap-0 rounded-full border border-foreground/10 bg-background">
        {/* Decrement button */}
        <button
          type="button"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors md:h-9 md:w-9",
            isAtMin
              ? "cursor-not-allowed text-muted/30"
              : "text-muted hover:bg-foreground/10 hover:text-foreground active:bg-foreground/15"
          )}
          onClick={decrement}
          onPointerDown={() => {
            if (!isAtMin) startLongPress(decrement);
          }}
          onPointerUp={clearLongPress}
          onPointerLeave={clearLongPress}
          onPointerCancel={clearLongPress}
          disabled={isAtMin}
          aria-label={`${label ?? "値"}を減らす`}
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </button>

        {/* Value display / edit */}
        {isEditing ? (
          <input
            ref={inputRef}
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            className="h-8 w-12 bg-transparent text-center text-sm outline-none md:h-7 md:w-10"
          />
        ) : (
          <button
            type="button"
            id={id}
            className="flex h-8 min-w-12 items-center justify-center px-1 text-sm tabular-nums md:h-7 md:min-w-10"
            onClick={startEditing}
            aria-label={`${label ?? "値"}: ${value}、タップして編集`}
          >
            {value}
          </button>
        )}

        {/* Increment button */}
        <button
          type="button"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors md:h-9 md:w-9",
            isAtMax
              ? "cursor-not-allowed text-muted/30"
              : "text-muted hover:bg-foreground/10 hover:text-foreground active:bg-foreground/15"
          )}
          onClick={increment}
          onPointerDown={() => {
            if (!isAtMax) startLongPress(increment);
          }}
          onPointerUp={clearLongPress}
          onPointerLeave={clearLongPress}
          onPointerCancel={clearLongPress}
          disabled={isAtMax}
          aria-label={`${label ?? "値"}を増やす`}
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
