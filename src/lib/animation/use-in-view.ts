"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
  /**
   * Visibility percentage to trigger (0-1 or array of thresholds)
   * @default 0
   */
  threshold?: number | number[];

  /**
   * Margin around root to adjust detection timing
   * Use negative values to trigger before element enters viewport
   * @example "-100px" triggers 100px before entering
   * @default "0px"
   */
  rootMargin?: string;

  /**
   * If true, only trigger once and stop observing
   * @default false
   */
  triggerOnce?: boolean;

  /**
   * The element used as viewport for checking visibility
   * Null uses the browser viewport
   * @default null
   */
  root?: Element | null;
}

export interface UseInViewResult {
  /**
   * Ref callback to attach to the target element
   */
  ref: (node: Element | null) => void;

  /**
   * Whether the element is currently in view
   */
  inView: boolean;

  /**
   * The latest IntersectionObserverEntry, undefined until first observation
   */
  entry: IntersectionObserverEntry | undefined;
}

/**
 * Custom hook that detects when an element enters the viewport using Intersection Observer API.
 *
 * @param options - Configuration options
 * @returns Object containing ref, inView, and entry
 *
 * @example
 * ```tsx
 * function FadeInSection() {
 *   const { ref, inView } = useInView();
 *
 *   return (
 *     <div ref={ref} className={inView ? 'opacity-100' : 'opacity-0'}>
 *       Content fades in when visible
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Trigger animation once with early detection
 * function AnimatedCard() {
 *   const { ref, inView } = useInView({
 *     triggerOnce: true,
 *     rootMargin: "-100px",
 *     threshold: 0.5,
 *   });
 *
 *   return (
 *     <div ref={ref} className={inView ? 'animate-slide-up' : ''}>
 *       Card content
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Access the IntersectionObserverEntry for advanced use cases
 * function ProgressIndicator() {
 *   const { ref, entry } = useInView({ threshold: [0, 0.25, 0.5, 0.75, 1] });
 *   const progress = entry?.intersectionRatio ?? 0;
 *
 *   return (
 *     <div ref={ref}>
 *       <progress value={progress} max={1} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useInView(options: UseInViewOptions = {}): UseInViewResult {
  const { threshold = 0, rootMargin = "0px", triggerOnce = false, root = null } = options;

  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>(undefined);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const nodeRef = useRef<Element | null>(null);
  const hasTriggeredRef = useRef(false);

  // Cleanup observer
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Ref callback to attach to target element
  const ref = useCallback(
    (node: Element | null) => {
      // Skip if SSR or IntersectionObserver is not available
      if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
        return;
      }

      // Cleanup previous observer
      cleanup();

      // Store the node reference
      nodeRef.current = node;

      // Skip if triggerOnce already triggered
      if (triggerOnce && hasTriggeredRef.current) {
        return;
      }

      // Skip if no node to observe
      if (!node) {
        return;
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [observerEntry] = entries;
          if (!observerEntry) return;

          setEntry(observerEntry);
          setInView(observerEntry.isIntersecting);

          // Stop observing if triggerOnce and element is in view
          if (triggerOnce && observerEntry.isIntersecting) {
            hasTriggeredRef.current = true;
            cleanup();
          }
        },
        {
          threshold,
          rootMargin,
          root,
        }
      );

      observerRef.current.observe(node);
    },
    [threshold, rootMargin, root, triggerOnce, cleanup]
  );

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ref,
    inView,
    entry,
  };
}
