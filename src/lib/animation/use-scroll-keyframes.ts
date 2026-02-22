"use client";

import { type CSSProperties, useCallback, useEffect, useRef } from "react";

/**
 * Easing function type - takes progress (0-1) and returns eased value (0-1)
 */
export type EasingFunction = (t: number) => number;

/**
 * Built-in easing function names
 */
export type EasingName = "linear" | "easeIn" | "easeOut" | "easeInOut";

/**
 * Easing can be a built-in name or a custom function
 */
export type Easing = EasingName | EasingFunction;

/**
 * Style properties that can be animated
 */
export interface KeyframeStyle {
  opacity?: number;
  scale?: number;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  skewX?: number;
  skewY?: number;
  [key: string]: number | undefined;
}

/**
 * A keyframe definition
 */
export interface Keyframe {
  /** Scroll position (in pixels) where this keyframe applies */
  at: number;
  /** Style values at this keyframe */
  style: KeyframeStyle;
  /** Easing function to use when transitioning TO this keyframe */
  easing?: Easing;
}

/**
 * Offset configuration for adjusting keyframe positions
 */
export interface ScrollOffset {
  /** Offset to add to the start of the animation range */
  start?: number;
  /** Offset to add to the end of the animation range */
  end?: number;
}

export interface UseScrollKeyframesOptions {
  /** Array of keyframes defining the animation */
  keyframes: Keyframe[];
  /** Whether to calculate scroll position relative to the element */
  relative?: boolean;
  /** Offset to apply to keyframe positions */
  offset?: ScrollOffset;
  /** Disable the hook (useful for conditional animations) */
  disabled?: boolean;
}

export interface UseScrollKeyframesResult {
  /** Ref callback to attach to the target element */
  ref: (node: HTMLElement | null) => void;
  /** Initial style for SSR/first render (subsequent updates go directly to DOM) */
  style: CSSProperties;
  /** Get current scroll position (reads from ref, does not cause re-render) */
  getScrollY: () => number;
  /** Get current progress (reads from ref, does not cause re-render) */
  getProgress: () => number;
}

// Built-in easing functions
const easingFunctions: Record<EasingName, EasingFunction> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

/**
 * Get easing function from easing value
 */
function getEasingFunction(easing: Easing | undefined): EasingFunction {
  if (!easing) return easingFunctions.linear;
  if (typeof easing === "function") return easing;
  return easingFunctions[easing] ?? easingFunctions.linear;
}

/**
 * Interpolate between two values
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Transform properties that should be combined into a transform string
 */
const transformProperties = new Set([
  "translateX",
  "translateY",
  "translateZ",
  "scale",
  "scaleX",
  "scaleY",
  "scaleZ",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skewX",
  "skewY",
]);

/**
 * Build a CSS transform string from individual transform properties
 */
function buildTransformString(style: KeyframeStyle): string {
  const parts: string[] = [];

  if (
    style.translateX !== undefined ||
    style.translateY !== undefined ||
    style.translateZ !== undefined
  ) {
    const x = style.translateX ?? 0;
    const y = style.translateY ?? 0;
    const z = style.translateZ ?? 0;
    if (z !== 0) {
      parts.push(`translate3d(${x}px, ${y}px, ${z}px)`);
    } else {
      parts.push(`translateX(${x}px)`);
      parts.push(`translateY(${y}px)`);
    }
  }

  if (style.scale !== undefined) {
    parts.push(`scale(${style.scale})`);
  }
  if (style.scaleX !== undefined) {
    parts.push(`scaleX(${style.scaleX})`);
  }
  if (style.scaleY !== undefined) {
    parts.push(`scaleY(${style.scaleY})`);
  }

  if (style.rotate !== undefined) {
    parts.push(`rotate(${style.rotate}deg)`);
  }
  if (style.rotateX !== undefined) {
    parts.push(`rotateX(${style.rotateX}deg)`);
  }
  if (style.rotateY !== undefined) {
    parts.push(`rotateY(${style.rotateY}deg)`);
  }
  if (style.rotateZ !== undefined) {
    parts.push(`rotateZ(${style.rotateZ}deg)`);
  }

  if (style.skewX !== undefined) {
    parts.push(`skewX(${style.skewX}deg)`);
  }
  if (style.skewY !== undefined) {
    parts.push(`skewY(${style.skewY}deg)`);
  }

  return parts.join(" ");
}

/**
 * Check if a property is a CSS custom property (starts with --)
 */
function isCustomProperty(key: string): boolean {
  return key.startsWith("--");
}

/**
 * Convert KeyframeStyle to CSS style object
 */
function toCSSStyle(interpolatedStyle: KeyframeStyle): CSSProperties {
  const transformString = buildTransformString(interpolatedStyle);
  const resultStyle: CSSProperties = {};

  // Copy non-transform properties
  for (const [key, value] of Object.entries(interpolatedStyle)) {
    if (!transformProperties.has(key) && value !== undefined) {
      // Handle CSS custom properties
      if (isCustomProperty(key)) {
        (resultStyle as Record<string, unknown>)[key] = value;
      } else {
        (resultStyle as Record<string, unknown>)[key] = value;
      }
    }
  }

  if (transformString) {
    resultStyle.transform = transformString;
  }

  return resultStyle;
}

/**
 * Apply styles directly to DOM element (no re-render)
 */
function applyStylesToElement(element: HTMLElement, style: CSSProperties): void {
  if (style.opacity !== undefined) {
    element.style.opacity = String(style.opacity);
  }
  if (style.transform !== undefined) {
    element.style.transform = style.transform;
  }
  // Handle other properties including CSS custom properties
  for (const [key, value] of Object.entries(style)) {
    if (key !== "opacity" && key !== "transform" && value !== undefined) {
      // Use setProperty for CSS custom properties
      if (isCustomProperty(key)) {
        element.style.setProperty(key, String(value));
      } else {
        (element.style as unknown as Record<string, string>)[key] = String(value);
      }
    }
  }
}

/**
 * Custom hook for scroll-based keyframe animations.
 *
 * Uses requestAnimationFrame and direct DOM manipulation for optimal performance.
 * Does NOT cause React re-renders on scroll - styles are written directly to the DOM.
 *
 * @example
 * ```tsx
 * function ParallaxSection() {
 *   const { ref, style } = useScrollKeyframes({
 *     keyframes: [
 *       { at: 0, style: { opacity: 0, translateY: 50 } },
 *       { at: 200, style: { opacity: 1, translateY: 0 }, easing: 'easeOut' },
 *       { at: 400, style: { opacity: 0, translateY: -50 }, easing: 'easeIn' },
 *     ],
 *   });
 *
 *   return (
 *     <div ref={ref} style={style}>
 *       Scroll-animated content
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollKeyframes(options: UseScrollKeyframesOptions): UseScrollKeyframesResult {
  const { keyframes, relative = false, offset, disabled = false } = options;

  // Sort keyframes by position and handle offsets
  const sortedKeyframes = [...keyframes].sort((a, b) => a.at - b.at);

  // Apply offsets to keyframes
  const adjustedKeyframes = sortedKeyframes.map((kf, index) => {
    let adjustedAt = kf.at;
    if (offset?.start && index === 0) {
      adjustedAt += offset.start;
    }
    if (offset?.end && index === sortedKeyframes.length - 1) {
      adjustedAt += offset.end;
    }
    // Apply start offset to all keyframes
    if (offset?.start) {
      adjustedAt = kf.at + offset.start;
    }
    return { ...kf, at: adjustedAt };
  });

  // Calculate initial style from first keyframe (for SSR/first render)
  const initialKeyframeStyle = adjustedKeyframes[0]?.style ?? {};
  const initialStyle = toCSSStyle(initialKeyframeStyle);

  // Refs for tracking state without re-renders
  const elementRef = useRef<HTMLElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  // Calculate progress based on keyframe range
  const calculateProgress = useCallback(
    (currentScrollY: number): number => {
      if (adjustedKeyframes.length < 2) return 0;

      const firstAt = adjustedKeyframes[0].at;
      const lastAt = adjustedKeyframes[adjustedKeyframes.length - 1].at;
      const range = lastAt - firstAt;

      if (range === 0) return 0;

      const progress = (currentScrollY - firstAt) / range;
      return Math.max(0, Math.min(1, progress));
    },
    [adjustedKeyframes]
  );

  // Interpolate style based on scroll position
  const interpolateStyle = useCallback(
    (currentScrollY: number): KeyframeStyle => {
      if (adjustedKeyframes.length === 0) return {};
      if (adjustedKeyframes.length === 1) return adjustedKeyframes[0].style;

      // Handle before first keyframe
      if (currentScrollY < adjustedKeyframes[0].at) {
        return adjustedKeyframes[0].style;
      }

      // Handle after last keyframe
      if (currentScrollY >= adjustedKeyframes[adjustedKeyframes.length - 1].at) {
        const lastAt = adjustedKeyframes[adjustedKeyframes.length - 1].at;
        for (let i = adjustedKeyframes.length - 1; i >= 0; i--) {
          if (adjustedKeyframes[i].at === lastAt) {
            return adjustedKeyframes[i].style;
          }
        }
        return adjustedKeyframes[adjustedKeyframes.length - 1].style;
      }

      // Check if we're exactly at a keyframe position
      for (let i = 0; i < adjustedKeyframes.length; i++) {
        if (currentScrollY === adjustedKeyframes[i].at) {
          let lastAtPosition = i;
          while (
            lastAtPosition < adjustedKeyframes.length - 1 &&
            adjustedKeyframes[lastAtPosition + 1].at === currentScrollY
          ) {
            lastAtPosition++;
          }
          return adjustedKeyframes[lastAtPosition].style;
        }
      }

      // Find the two keyframes we're between
      let prevKeyframe = adjustedKeyframes[0];
      let nextKeyframe = adjustedKeyframes[adjustedKeyframes.length - 1];

      for (let i = 0; i < adjustedKeyframes.length - 1; i++) {
        if (
          currentScrollY > adjustedKeyframes[i].at &&
          currentScrollY < adjustedKeyframes[i + 1].at
        ) {
          prevKeyframe = adjustedKeyframes[i];
          nextKeyframe = adjustedKeyframes[i + 1];
          break;
        }
      }

      // Handle same position keyframes
      if (prevKeyframe.at === nextKeyframe.at) {
        return nextKeyframe.style;
      }

      // Calculate progress between keyframes
      const range = nextKeyframe.at - prevKeyframe.at;
      const localProgress = (currentScrollY - prevKeyframe.at) / range;

      // Apply easing
      const easingFn = getEasingFunction(nextKeyframe.easing);
      const easedProgress = easingFn(localProgress);

      // Interpolate all properties
      const interpolatedStyle: KeyframeStyle = {};
      const allKeys = new Set([
        ...Object.keys(prevKeyframe.style),
        ...Object.keys(nextKeyframe.style),
      ]);

      for (const key of allKeys) {
        const prevValue = prevKeyframe.style[key];
        const nextValue = nextKeyframe.style[key];

        if (prevValue !== undefined && nextValue !== undefined) {
          interpolatedStyle[key] = lerp(prevValue, nextValue, easedProgress);
        } else if (prevValue !== undefined) {
          interpolatedStyle[key] = prevValue;
        } else if (nextValue !== undefined) {
          interpolatedStyle[key] = nextValue;
        }
      }

      return interpolatedStyle;
    },
    [adjustedKeyframes]
  );

  // Ref callback
  const ref = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  // Getter functions that read from refs (no re-render)
  const getScrollY = useCallback(() => lastScrollYRef.current, []);
  const getProgress = useCallback(() => progressRef.current, []);

  // Scroll handler with RAF - writes directly to DOM
  useEffect(() => {
    if (typeof window === "undefined" || disabled) {
      return;
    }

    const updateScroll = () => {
      let currentScrollY = window.scrollY;

      // Calculate relative scroll if element is attached and relative mode is on
      if (relative && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        currentScrollY = window.scrollY - elementTop + window.innerHeight;
      }

      // Only update if scroll position changed
      if (currentScrollY !== lastScrollYRef.current) {
        lastScrollYRef.current = currentScrollY;
        progressRef.current = calculateProgress(currentScrollY);

        // Apply styles directly to DOM (no React re-render)
        if (elementRef.current) {
          const interpolated = interpolateStyle(currentScrollY);
          const cssStyle = toCSSStyle(interpolated);
          applyStylesToElement(elementRef.current, cssStyle);
        }
      }

      rafIdRef.current = requestAnimationFrame(updateScroll);
    };

    // Start the animation loop
    rafIdRef.current = requestAnimationFrame(updateScroll);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [relative, interpolateStyle, calculateProgress, disabled]);

  return {
    ref,
    style: initialStyle,
    getScrollY,
    getProgress,
  };
}
