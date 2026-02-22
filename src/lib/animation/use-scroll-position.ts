"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Shared scroll subscription manager.
 * Uses a single event listener shared across all scroll hooks.
 */
const scrollSubscription = {
  subscribe: (callback: () => void) => {
    window.addEventListener("scroll", callback, { passive: true });
    return () => window.removeEventListener("scroll", callback);
  },
  getServerSnapshot: () => 0,
};

/**
 * Hook that returns the current scroll Y position.
 * Re-renders on every scroll event.
 *
 * Use this when you need the actual scroll position value.
 * For threshold-based checks, use `useIsScrolled` instead.
 *
 * @returns Current window.scrollY value
 *
 * @example
 * ```tsx
 * function ProgressBar() {
 *   const scrollY = useScrollY();
 *   const progress = (scrollY / document.body.scrollHeight) * 100;
 *   return <div style={{ width: `${progress}%` }} />;
 * }
 * ```
 */
export function useScrollY(): number {
  return useSyncExternalStore(
    scrollSubscription.subscribe,
    () => window.scrollY,
    scrollSubscription.getServerSnapshot
  );
}

/**
 * Hook that returns whether the page has been scrolled past a threshold.
 * Only re-renders when the boolean value changes (crosses the threshold).
 *
 * This is more performant than `useScrollY` when you only need to know
 * if the user has scrolled past a certain point.
 *
 * @param threshold - Scroll position threshold (default: 0)
 * @returns Whether scrollY > threshold
 *
 * @example
 * ```tsx
 * function Header() {
 *   const isScrolled = useIsScrolled();
 *
 *   return (
 *     <header className={isScrolled ? 'compact' : 'expanded'}>
 *       ...
 *     </header>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom threshold
 * function Header() {
 *   const isScrolled = useIsScrolled(50);
 *
 *   return (
 *     <header className={isScrolled ? 'scrolled' : ''}>
 *       ...
 *     </header>
 *   );
 * }
 * ```
 */
export function useIsScrolled(threshold = 0): boolean {
  // Create a stable store that returns boolean based on threshold
  const store = useMemo(
    () => ({
      subscribe: scrollSubscription.subscribe,
      getSnapshot: () => window.scrollY > threshold,
      getServerSnapshot: () => false,
    }),
    [threshold]
  );

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

// Legacy types for backward compatibility
export interface UseScrollPositionOptions {
  /**
   * Threshold value for isScrolled calculation
   * @default 0
   */
  threshold?: number;
}

export interface UseScrollPositionResult {
  /**
   * Current vertical scroll position (window.scrollY)
   */
  scrollY: number;

  /**
   * Whether the page has been scrolled past the threshold
   */
  isScrolled: boolean;
}

/**
 * @deprecated Use `useScrollY` or `useIsScrolled` instead for better performance.
 *
 * Legacy hook that returns both scrollY and isScrolled.
 * This causes re-renders on every scroll event regardless of which value you use.
 *
 * Migration guide:
 * - If you only need `isScrolled`: use `useIsScrolled(threshold)`
 * - If you only need `scrollY`: use `useScrollY()`
 * - If you need both: use both hooks separately
 */
export function useScrollPosition(options: UseScrollPositionOptions = {}): UseScrollPositionResult {
  const { threshold = 0 } = options;

  const scrollY = useSyncExternalStore(
    scrollSubscription.subscribe,
    () => window.scrollY,
    scrollSubscription.getServerSnapshot
  );

  return {
    scrollY,
    isScrolled: scrollY > threshold,
  };
}
