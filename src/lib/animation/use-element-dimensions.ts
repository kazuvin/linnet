"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Type of dimension to observe
 * - 'width': Only observe width changes
 * - 'height': Only observe height changes
 * - 'both': Observe both width and height changes (default)
 */
export type DimensionType = "width" | "height" | "both";

/**
 * Options for useElementDimensions hook
 */
export interface UseElementDimensionsOptions<T extends DimensionType = "both"> {
  type?: T;
}

/**
 * Result type based on the dimension type option
 */
export type UseElementDimensionsResult<T extends DimensionType = "both"> = T extends "width"
  ? { width: number | undefined; height: undefined }
  : T extends "height"
    ? { width: undefined; height: number | undefined }
    : { width: number | undefined; height: number | undefined };

/**
 * Observes an element's dimensions using ResizeObserver.
 * Returns the dimensions based on the specified type option.
 *
 * @param ref - RefObject pointing to the element to observe
 * @param options - Configuration options
 * @param options.type - Which dimensions to track: 'width', 'height', or 'both' (default)
 * @returns Object containing the requested dimensions
 *
 * @example
 * ```tsx
 * // Track only width
 * const ref = useRef<HTMLDivElement>(null);
 * const { width } = useElementDimensions(ref, { type: 'width' });
 *
 * // Track only height
 * const { height } = useElementDimensions(ref, { type: 'height' });
 *
 * // Track both dimensions (default)
 * const { width, height } = useElementDimensions(ref);
 *
 * return (
 *   <div
 *     style={{ width, height }}
 *     className="transition-all duration-300"
 *   >
 *     <span ref={ref}>Dynamic content</span>
 *   </div>
 * );
 * ```
 */
export function useElementDimensions<T extends DimensionType = "both">(
  ref: RefObject<HTMLElement | null>,
  options?: UseElementDimensionsOptions<T>
): UseElementDimensionsResult<T> {
  const type = options?.type ?? "both";

  const [dimensions, setDimensions] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const element = ref.current;

    // SSR safety check
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    if (!element) {
      setDimensions({ width: undefined, height: undefined });
      return;
    }

    const updateDimensions = () => {
      const newWidth = type === "height" ? undefined : element.offsetWidth;
      const newHeight = type === "width" ? undefined : element.offsetHeight;
      setDimensions({ width: newWidth, height: newHeight });
    };

    // Set initial dimensions
    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, type]);

  return dimensions as UseElementDimensionsResult<T>;
}
