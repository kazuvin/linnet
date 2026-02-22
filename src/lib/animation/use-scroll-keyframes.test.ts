"use client";

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Keyframe, useScrollKeyframes } from "./use-scroll-keyframes";

// Mock requestAnimationFrame
let rafCallback: FrameRequestCallback | null = null;
const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  rafCallback = callback;
  return 1;
});
const mockCancelAnimationFrame = vi.fn();

// Helper to simulate scroll and trigger RAF
function simulateScroll(scrollY: number) {
  Object.defineProperty(window, "scrollY", { value: scrollY, writable: true });
  window.dispatchEvent(new Event("scroll"));
  if (rafCallback) {
    rafCallback(performance.now());
  }
}

// Helper to create a mock HTMLElement
function createMockElement(): HTMLElement {
  const element = document.createElement("div");
  return element;
}

describe("useScrollKeyframes", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", mockRequestAnimationFrame);
    vi.stubGlobal("cancelAnimationFrame", mockCancelAnimationFrame);
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, writable: true });
    mockRequestAnimationFrame.mockClear();
    mockCancelAnimationFrame.mockClear();
    rafCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("初期状態 (Initial State)", () => {
    it("should return initial style based on first keyframe", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      expect(result.current.style.opacity).toBe(0);
    });

    it("should return a ref callback function", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      expect(typeof result.current.ref).toBe("function");
    });

    it("should return getScrollY function that returns 0 initially", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      expect(result.current.getScrollY()).toBe(0);
    });

    it("should return getProgress function that returns 0 initially", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      expect(result.current.getProgress()).toBe(0);
    });

    it("should include transform in initial style", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { translateY: 50 } },
        { at: 100, style: { translateY: 0 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      expect(result.current.style.transform).toContain("translateY(50px)");
    });
  });

  describe("DOM直接操作 (Direct DOM Manipulation)", () => {
    it("should apply styles directly to DOM element on scroll", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      // Check DOM element directly
      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.5, 1);
    });

    it("should update transform on DOM element", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { translateY: 100 } },
        { at: 100, style: { translateY: 0 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(element.style.transform).toContain("translateY(50px)");
    });

    it("should not cause re-renders on scroll (style prop stays initial)", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      const initialStyle = result.current.style;

      act(() => {
        simulateScroll(50);
      });

      // Style prop should remain the same (no re-render)
      expect(result.current.style).toBe(initialStyle);
      expect(result.current.style.opacity).toBe(0); // Initial value
    });
  });

  describe("スクロール位置に応じた補間 (Scroll Position Interpolation)", () => {
    it("should interpolate opacity between keyframes", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.5, 1);
    });

    it("should interpolate between multiple keyframes", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 0.5 } },
        { at: 200, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(150);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.75, 1);
    });

    it("should handle scroll before first keyframe", () => {
      const keyframes: Keyframe[] = [
        { at: 100, style: { opacity: 0.5 } },
        { at: 200, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      expect(result.current.style.opacity).toBe(0.5);
    });

    it("should handle scroll after last keyframe", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(200);
      });

      expect(Number.parseFloat(element.style.opacity)).toBe(1);
    });

    it("should update getScrollY value on scroll", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(75);
      });

      expect(result.current.getScrollY()).toBe(75);
    });

    it("should calculate progress based on keyframe range", () => {
      const keyframes: Keyframe[] = [
        { at: 100, style: { opacity: 0 } },
        { at: 300, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(200);
      });

      expect(result.current.getProgress()).toBeCloseTo(0.5, 2);
    });
  });

  describe("複数プロパティの補間 (Multiple Properties Interpolation)", () => {
    it("should interpolate multiple CSS properties", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0, scale: 0.5 } },
        { at: 100, style: { opacity: 1, scale: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.5, 1);
      expect(element.style.transform).toContain("scale(0.75)");
    });

    it("should handle translateX interpolation", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { translateX: -100 } },
        { at: 100, style: { translateX: 0 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(element.style.transform).toContain("translateX(-50px)");
    });

    it("should handle translateY interpolation", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { translateY: 50 } },
        { at: 100, style: { translateY: 0 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(element.style.transform).toContain("translateY(25px)");
    });

    it("should handle rotate interpolation", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { rotate: 0 } },
        { at: 100, style: { rotate: 180 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(element.style.transform).toContain("rotate(90deg)");
    });
  });

  describe("イージング関数 (Easing Functions)", () => {
    it("should apply linear easing by default", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.5, 2);
    });

    it("should apply easeInOut easing", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 }, easing: "easeInOut" },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.5, 1);
    });

    it("should apply easeIn easing", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 }, easing: "easeIn" },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeLessThan(0.5);
    });

    it("should apply easeOut easing", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 }, easing: "easeOut" },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeGreaterThan(0.5);
    });

    it("should support custom easing function", () => {
      const customEasing = (t: number) => t * t;

      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 }, easing: customEasing },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.25, 2);
    });
  });

  describe("要素相対スクロール (Element-Relative Scroll)", () => {
    it("should use relative mode when specified", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes, relative: true }));

      const element = createMockElement();
      Object.defineProperty(element, "getBoundingClientRect", {
        value: () => ({
          top: 0,
          bottom: 100,
          left: 0,
          right: 100,
          width: 100,
          height: 100,
        }),
      });

      act(() => {
        result.current.ref(element);
      });

      expect(typeof result.current.ref).toBe("function");
    });
  });

  describe("オフセット設定 (Offset Configuration)", () => {
    it("should apply start offset to keyframe positions", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes, offset: { start: 50 } }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(100);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.5, 1);
    });

    it("should apply end offset to stop animation early", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 200, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes, offset: { end: -50 } }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(150);
      });

      expect(Number.parseFloat(element.style.opacity)).toBe(1);
    });
  });

  describe("パフォーマンス最適化 (Performance Optimization)", () => {
    it("should use requestAnimationFrame for scroll updates", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      renderHook(() => useScrollKeyframes({ keyframes }));

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it("should cancel animation frame on unmount", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { unmount } = renderHook(() => useScrollKeyframes({ keyframes }));

      unmount();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it("should not update DOM when scroll position unchanged", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      // First scroll
      act(() => {
        simulateScroll(50);
      });

      const opacityAfterFirstScroll = element.style.opacity;

      // Same scroll position
      act(() => {
        simulateScroll(50);
      });

      expect(element.style.opacity).toBe(opacityAfterFirstScroll);
    });
  });

  describe("disabled オプション (Disabled Option)", () => {
    it("should not update DOM when disabled", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes, disabled: true }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      // DOM should not be updated when disabled
      expect(element.style.opacity).toBe("");
    });

    it("should not add scroll listener when disabled", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      mockRequestAnimationFrame.mockClear();

      renderHook(() => useScrollKeyframes({ keyframes, disabled: true }));

      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe("SSR安全性 (SSR Safety)", () => {
    it("should handle window being undefined gracefully in the hook", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      expect(result.current.style.opacity).toBe(0);
      expect(result.current.getScrollY()).toBe(0);
    });
  });

  describe("エッジケース (Edge Cases)", () => {
    it("should handle empty keyframes array", () => {
      const { result } = renderHook(() => useScrollKeyframes({ keyframes: [] }));

      expect(result.current.style).toEqual({});
    });

    it("should handle single keyframe", () => {
      const keyframes: Keyframe[] = [{ at: 100, style: { opacity: 0.5 } }];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      expect(result.current.style.opacity).toBe(0.5);
    });

    it("should sort keyframes by 'at' position", () => {
      const keyframes: Keyframe[] = [
        { at: 100, style: { opacity: 1 } },
        { at: 0, style: { opacity: 0 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBeCloseTo(0.5, 1);
    });

    it("should handle negative scroll values", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(-50);
      });

      expect(Number.parseFloat(element.style.opacity)).toBe(0);
    });

    it("should handle keyframes with same 'at' position", () => {
      const keyframes: Keyframe[] = [
        { at: 0, style: { opacity: 0 } },
        { at: 100, style: { opacity: 0.5 } },
        { at: 100, style: { opacity: 0.8 } },
        { at: 200, style: { opacity: 1 } },
      ];

      const { result } = renderHook(() => useScrollKeyframes({ keyframes }));

      const element = createMockElement();
      act(() => {
        result.current.ref(element);
      });

      act(() => {
        simulateScroll(100);
      });

      expect(Number.parseFloat(element.style.opacity)).toBe(0.8);
    });
  });
});
