"use client";

import { act, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type DimensionType,
  type UseElementDimensionsOptions,
  type UseElementDimensionsResult,
  useElementDimensions,
} from "./use-element-dimensions";

// Mock ResizeObserver
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

let resizeObserverCallback: ResizeObserverCallback;

class MockResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeObserverCallback = callback;
  }

  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

// Helper to create mock element with dimensions
function createMockElement(width: number, height: number): HTMLElement {
  const element = document.createElement("div");
  Object.defineProperties(element, {
    offsetWidth: { value: width, configurable: true },
    offsetHeight: { value: height, configurable: true },
  });
  return element;
}

// Helper to create mock ResizeObserverEntry
function createMockResizeEntry(
  target: Element,
  contentRect?: Partial<DOMRectReadOnly>
): ResizeObserverEntry {
  return {
    target,
    contentRect: {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...contentRect,
    } as DOMRectReadOnly,
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  };
}

// Helper to render hook with a mocked ref
function renderDimensionsHook<T extends DimensionType = "both">(
  element: HTMLElement | null,
  options?: UseElementDimensionsOptions<T>
) {
  const refObject = { current: element } as RefObject<HTMLElement | null>;
  return renderHook(() => useElementDimensions(refObject, options));
}

describe("useElementDimensions", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("初期状態 (Initial State)", () => {
    it("should return undefined dimensions when element is null", () => {
      const { result } = renderDimensionsHook(null);

      expect(result.current.width).toBeUndefined();
      expect(result.current.height).toBeUndefined();
    });

    it("should return initial dimensions from element on mount", () => {
      const element = createMockElement(200, 100);
      const { result } = renderDimensionsHook(element);

      expect(result.current.width).toBe(200);
      expect(result.current.height).toBe(100);
    });

    it("should call observe on the element", () => {
      const element = createMockElement(200, 100);
      renderDimensionsHook(element);

      expect(mockObserve).toHaveBeenCalledWith(element);
    });
  });

  describe("寸法タイプオプション (Dimension Type Options)", () => {
    describe("type: 'width'", () => {
      it("should only return width when type is 'width'", () => {
        const element = createMockElement(200, 100);
        const { result } = renderDimensionsHook(element, { type: "width" });

        expect(result.current.width).toBe(200);
        expect(result.current.height).toBeUndefined();
      });

      it("should update only width on resize", () => {
        const element = createMockElement(200, 100);
        const { result } = renderDimensionsHook(element, { type: "width" });

        // Simulate resize
        Object.defineProperty(element, "offsetWidth", { value: 300, configurable: true });
        Object.defineProperty(element, "offsetHeight", { value: 150, configurable: true });

        act(() => {
          resizeObserverCallback([createMockResizeEntry(element)], {} as ResizeObserver);
        });

        expect(result.current.width).toBe(300);
        expect(result.current.height).toBeUndefined();
      });
    });

    describe("type: 'height'", () => {
      it("should only return height when type is 'height'", () => {
        const element = createMockElement(200, 100);
        const { result } = renderDimensionsHook(element, { type: "height" });

        expect(result.current.width).toBeUndefined();
        expect(result.current.height).toBe(100);
      });

      it("should update only height on resize", () => {
        const element = createMockElement(200, 100);
        const { result } = renderDimensionsHook(element, { type: "height" });

        // Simulate resize
        Object.defineProperty(element, "offsetWidth", { value: 300, configurable: true });
        Object.defineProperty(element, "offsetHeight", { value: 150, configurable: true });

        act(() => {
          resizeObserverCallback([createMockResizeEntry(element)], {} as ResizeObserver);
        });

        expect(result.current.width).toBeUndefined();
        expect(result.current.height).toBe(150);
      });
    });

    describe("type: 'both' (default)", () => {
      it("should return both dimensions by default", () => {
        const element = createMockElement(200, 100);
        const { result } = renderDimensionsHook(element);

        expect(result.current.width).toBe(200);
        expect(result.current.height).toBe(100);
      });

      it("should update both dimensions on resize", () => {
        const element = createMockElement(200, 100);
        const { result } = renderDimensionsHook(element);

        // Simulate resize
        Object.defineProperty(element, "offsetWidth", { value: 300, configurable: true });
        Object.defineProperty(element, "offsetHeight", { value: 150, configurable: true });

        act(() => {
          resizeObserverCallback([createMockResizeEntry(element)], {} as ResizeObserver);
        });

        expect(result.current.width).toBe(300);
        expect(result.current.height).toBe(150);
      });

      it("should explicitly accept type: 'both'", () => {
        const element = createMockElement(200, 100);
        const { result } = renderDimensionsHook(element, { type: "both" });

        expect(result.current.width).toBe(200);
        expect(result.current.height).toBe(100);
      });
    });
  });

  describe("リサイズイベント (Resize Events)", () => {
    it("should update dimensions when element is resized", () => {
      const element = createMockElement(200, 100);
      const { result } = renderDimensionsHook(element);

      expect(result.current.width).toBe(200);
      expect(result.current.height).toBe(100);

      // Simulate resize
      Object.defineProperty(element, "offsetWidth", { value: 400, configurable: true });
      Object.defineProperty(element, "offsetHeight", { value: 200, configurable: true });

      act(() => {
        resizeObserverCallback([createMockResizeEntry(element)], {} as ResizeObserver);
      });

      expect(result.current.width).toBe(400);
      expect(result.current.height).toBe(200);
    });

    it("should handle multiple resize events", () => {
      const element = createMockElement(100, 50);
      const { result } = renderDimensionsHook(element);

      // First resize
      Object.defineProperty(element, "offsetWidth", { value: 200, configurable: true });
      act(() => {
        resizeObserverCallback([createMockResizeEntry(element)], {} as ResizeObserver);
      });
      expect(result.current.width).toBe(200);

      // Second resize
      Object.defineProperty(element, "offsetWidth", { value: 300, configurable: true });
      act(() => {
        resizeObserverCallback([createMockResizeEntry(element)], {} as ResizeObserver);
      });
      expect(result.current.width).toBe(300);
    });
  });

  describe("クリーンアップ (Cleanup)", () => {
    it("should call disconnect on unmount", () => {
      const element = createMockElement(200, 100);
      const { unmount } = renderDimensionsHook(element);

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should not call disconnect when element is null", () => {
      const { unmount } = renderDimensionsHook(null);

      unmount();

      // disconnect should not be called because observer was never created
      expect(mockDisconnect).not.toHaveBeenCalled();
    });
  });

  describe("Ref変更時の挙動 (Ref Change Behavior)", () => {
    it("should update dimensions when ref changes to a different element", () => {
      const element1 = createMockElement(100, 50);
      const refObject = { current: element1 } as RefObject<HTMLElement | null>;

      const { result, rerender } = renderHook(({ ref }) => useElementDimensions(ref), {
        initialProps: { ref: refObject },
      });

      expect(result.current.width).toBe(100);
      expect(result.current.height).toBe(50);

      // Change to new element
      const element2 = createMockElement(200, 100);
      const newRefObject = { current: element2 } as RefObject<HTMLElement | null>;

      rerender({ ref: newRefObject });

      expect(result.current.width).toBe(200);
      expect(result.current.height).toBe(100);
    });

    it("should return undefined when ref changes to null", () => {
      const element = createMockElement(100, 50);
      const refObject = { current: element } as RefObject<HTMLElement | null>;

      const { result, rerender } = renderHook(({ ref }) => useElementDimensions(ref), {
        initialProps: { ref: refObject },
      });

      expect(result.current.width).toBe(100);

      // Change ref to null
      const nullRefObject = { current: null } as RefObject<HTMLElement | null>;
      rerender({ ref: nullRefObject });

      expect(result.current.width).toBeUndefined();
      expect(result.current.height).toBeUndefined();
    });
  });

  describe("型安全性 (Type Safety)", () => {
    it("should have correct return type for width-only option", () => {
      const element = createMockElement(200, 100);
      const { result } = renderDimensionsHook(element, { type: "width" });

      // TypeScript should infer: { width: number | undefined; height: undefined }
      const dimensions: UseElementDimensionsResult<"width"> = result.current;
      expect(dimensions.width).toBe(200);
      expect(dimensions.height).toBeUndefined();
    });

    it("should have correct return type for height-only option", () => {
      const element = createMockElement(200, 100);
      const { result } = renderDimensionsHook(element, { type: "height" });

      // TypeScript should infer: { width: undefined; height: number | undefined }
      const dimensions: UseElementDimensionsResult<"height"> = result.current;
      expect(dimensions.width).toBeUndefined();
      expect(dimensions.height).toBe(100);
    });

    it("should have correct return type for both option", () => {
      const element = createMockElement(200, 100);
      const { result } = renderDimensionsHook(element, { type: "both" });

      // TypeScript should infer: { width: number | undefined; height: number | undefined }
      const dimensions: UseElementDimensionsResult<"both"> = result.current;
      expect(dimensions.width).toBe(200);
      expect(dimensions.height).toBe(100);
    });
  });

  describe("SSR安全性 (SSR Safety)", () => {
    it("should not error when ResizeObserver is undefined", () => {
      vi.unstubAllGlobals();
      vi.stubGlobal("ResizeObserver", undefined);

      const element = createMockElement(200, 100);

      expect(() => {
        renderDimensionsHook(element);
      }).not.toThrow();
    });

    it("should return undefined dimensions when ResizeObserver is undefined", () => {
      vi.unstubAllGlobals();
      vi.stubGlobal("ResizeObserver", undefined);

      const element = createMockElement(200, 100);
      const { result } = renderDimensionsHook(element);

      expect(result.current.width).toBeUndefined();
      expect(result.current.height).toBeUndefined();
    });
  });

  describe("エッジケース (Edge Cases)", () => {
    it("should handle zero dimensions", () => {
      const element = createMockElement(0, 0);
      const { result } = renderDimensionsHook(element);

      expect(result.current.width).toBe(0);
      expect(result.current.height).toBe(0);
    });

    it("should handle very large dimensions", () => {
      const element = createMockElement(10000, 10000);
      const { result } = renderDimensionsHook(element);

      expect(result.current.width).toBe(10000);
      expect(result.current.height).toBe(10000);
    });

    it("should handle rapid resize events", () => {
      const element = createMockElement(100, 100);
      const { result } = renderDimensionsHook(element);

      // Simulate rapid resizes
      for (let i = 1; i <= 10; i++) {
        Object.defineProperty(element, "offsetWidth", { value: i * 100, configurable: true });
        act(() => {
          resizeObserverCallback([createMockResizeEntry(element)], {} as ResizeObserver);
        });
      }

      expect(result.current.width).toBe(1000);
    });
  });
});
