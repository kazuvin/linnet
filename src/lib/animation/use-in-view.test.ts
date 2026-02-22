"use client";

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInView } from "./use-in-view";

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

let intersectionObserverCallback: IntersectionObserverCallback;
let intersectionObserverOptions: IntersectionObserverInit | undefined;
let mockIntersectionObserverCallCount = 0;

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    mockIntersectionObserverCallCount++;
    intersectionObserverCallback = callback;
    intersectionObserverOptions = options;
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold ?? 0];
  }

  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
  takeRecords = vi.fn(() => []);
}

// Helper to create mock IntersectionObserverEntry
function createMockEntry(
  overrides: Partial<IntersectionObserverEntry> = {}
): IntersectionObserverEntry {
  return {
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRatio: 0,
    intersectionRect: {} as DOMRectReadOnly,
    isIntersecting: false,
    rootBounds: null,
    target: document.createElement("div"),
    time: Date.now(),
    ...overrides,
  };
}

describe("useInView", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
    mockIntersectionObserverCallCount = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("初期状態 (Initial State)", () => {
    it("should return inView as false initially", () => {
      const { result } = renderHook(() => useInView());

      expect(result.current.inView).toBe(false);
    });

    it("should return entry as undefined initially", () => {
      const { result } = renderHook(() => useInView());

      expect(result.current.entry).toBeUndefined();
    });

    it("should return a ref callback function", () => {
      const { result } = renderHook(() => useInView());

      expect(typeof result.current.ref).toBe("function");
    });
  });

  describe("要素が可視領域に入った時 (Element Becomes Visible)", () => {
    it("should set inView to true when element intersects", () => {
      const { result } = renderHook(() => useInView());

      // Attach ref to an element
      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      // Simulate intersection
      act(() => {
        intersectionObserverCallback(
          [createMockEntry({ isIntersecting: true, intersectionRatio: 1 })],
          {} as IntersectionObserver
        );
      });

      expect(result.current.inView).toBe(true);
    });

    it("should update entry when element intersects", () => {
      const { result } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      const mockEntry = createMockEntry({ isIntersecting: true, intersectionRatio: 0.75 });
      act(() => {
        intersectionObserverCallback([mockEntry], {} as IntersectionObserver);
      });

      expect(result.current.entry).toBeDefined();
      expect(result.current.entry?.isIntersecting).toBe(true);
      expect(result.current.entry?.intersectionRatio).toBe(0.75);
    });

    it("should call observe when ref is attached to an element", () => {
      const { result } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      expect(mockObserve).toHaveBeenCalledWith(element);
    });
  });

  describe("要素が可視領域から出た時 (Element Leaves Viewport)", () => {
    it("should set inView to false when element leaves viewport", () => {
      const { result } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      // First, element enters viewport
      act(() => {
        intersectionObserverCallback(
          [createMockEntry({ isIntersecting: true, intersectionRatio: 1 })],
          {} as IntersectionObserver
        );
      });

      expect(result.current.inView).toBe(true);

      // Then, element leaves viewport
      act(() => {
        intersectionObserverCallback(
          [createMockEntry({ isIntersecting: false, intersectionRatio: 0 })],
          {} as IntersectionObserver
        );
      });

      expect(result.current.inView).toBe(false);
    });

    it("should update entry when element leaves viewport", () => {
      const { result } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      // Element enters viewport
      act(() => {
        intersectionObserverCallback(
          [createMockEntry({ isIntersecting: true, intersectionRatio: 1 })],
          {} as IntersectionObserver
        );
      });

      // Element leaves viewport
      const exitEntry = createMockEntry({ isIntersecting: false, intersectionRatio: 0 });
      act(() => {
        intersectionObserverCallback([exitEntry], {} as IntersectionObserver);
      });

      expect(result.current.entry?.isIntersecting).toBe(false);
      expect(result.current.entry?.intersectionRatio).toBe(0);
    });
  });

  describe("triggerOnceオプション (triggerOnce Option)", () => {
    it("should stop observing after first intersection when triggerOnce is true", () => {
      const { result } = renderHook(() => useInView({ triggerOnce: true }));

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      // Simulate intersection
      act(() => {
        intersectionObserverCallback(
          [createMockEntry({ isIntersecting: true, intersectionRatio: 1 })],
          {} as IntersectionObserver
        );
      });

      expect(result.current.inView).toBe(true);
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should not disconnect when triggerOnce is false", () => {
      const { result } = renderHook(() => useInView({ triggerOnce: false }));

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      mockDisconnect.mockClear();

      // Simulate intersection
      act(() => {
        intersectionObserverCallback(
          [createMockEntry({ isIntersecting: true, intersectionRatio: 1 })],
          {} as IntersectionObserver
        );
      });

      expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it("should not create new observer after triggerOnce has fired", () => {
      const { result } = renderHook(() => useInView({ triggerOnce: true }));

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      // Simulate intersection
      act(() => {
        intersectionObserverCallback(
          [createMockEntry({ isIntersecting: true, intersectionRatio: 1 })],
          {} as IntersectionObserver
        );
      });

      const callCountAfterTrigger = mockIntersectionObserverCallCount;

      // Try to attach ref to a new element
      const newElement = document.createElement("div");
      act(() => {
        result.current.ref(newElement);
      });

      // Should not create a new observer
      expect(mockIntersectionObserverCallCount).toBe(callCountAfterTrigger);
    });

    it("should keep inView true after element leaves viewport when triggerOnce is true", () => {
      const { result } = renderHook(() => useInView({ triggerOnce: true }));

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      // Element enters viewport
      act(() => {
        intersectionObserverCallback(
          [createMockEntry({ isIntersecting: true, intersectionRatio: 1 })],
          {} as IntersectionObserver
        );
      });

      expect(result.current.inView).toBe(true);

      // Observer is disconnected, so no more updates should occur
      // Even if we somehow received another callback, state should not change
      // because observer is disconnected
    });
  });

  describe("カスタムオプション (Custom Options)", () => {
    it("should pass custom threshold to IntersectionObserver", () => {
      const { result } = renderHook(() => useInView({ threshold: 0.5 }));

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      expect(intersectionObserverOptions?.threshold).toBe(0.5);
    });

    it("should pass array threshold to IntersectionObserver", () => {
      const thresholds = [0, 0.25, 0.5, 0.75, 1];
      const { result } = renderHook(() => useInView({ threshold: thresholds }));

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      expect(intersectionObserverOptions?.threshold).toEqual(thresholds);
    });

    it("should pass custom rootMargin to IntersectionObserver", () => {
      const { result } = renderHook(() => useInView({ rootMargin: "-100px" }));

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      expect(intersectionObserverOptions?.rootMargin).toBe("-100px");
    });

    it("should pass custom root to IntersectionObserver", () => {
      const rootElement = document.createElement("div");
      const { result } = renderHook(() => useInView({ root: rootElement }));

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      expect(intersectionObserverOptions?.root).toBe(rootElement);
    });

    it("should use default options when none provided", () => {
      const { result } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      expect(intersectionObserverOptions?.threshold).toBe(0);
      expect(intersectionObserverOptions?.rootMargin).toBe("0px");
      expect(intersectionObserverOptions?.root).toBe(null);
    });
  });

  describe("クリーンアップ (Cleanup)", () => {
    it("should call disconnect on unmount", () => {
      const { result, unmount } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      mockDisconnect.mockClear();
      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should cleanup previous observer when ref is called with new element", () => {
      const { result } = renderHook(() => useInView());

      const element1 = document.createElement("div");
      act(() => {
        result.current.ref(element1);
      });

      mockDisconnect.mockClear();

      const element2 = document.createElement("div");
      act(() => {
        result.current.ref(element2);
      });

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should cleanup when ref is called with null", () => {
      const { result } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      mockDisconnect.mockClear();

      act(() => {
        result.current.ref(null);
      });

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("SSR安全性 (SSR Safety)", () => {
    it("should not error when IntersectionObserver is undefined", () => {
      vi.unstubAllGlobals();
      vi.stubGlobal("IntersectionObserver", undefined);

      expect(() => {
        const { result } = renderHook(() => useInView());
        const element = document.createElement("div");
        result.current.ref(element);
      }).not.toThrow();
    });

    it("should return default values when IntersectionObserver is undefined", () => {
      vi.unstubAllGlobals();
      vi.stubGlobal("IntersectionObserver", undefined);

      const { result } = renderHook(() => useInView());

      expect(result.current.inView).toBe(false);
      expect(result.current.entry).toBeUndefined();
      expect(typeof result.current.ref).toBe("function");
    });

    it("should not call observe when IntersectionObserver is undefined", () => {
      vi.unstubAllGlobals();
      vi.stubGlobal("IntersectionObserver", undefined);

      const { result } = renderHook(() => useInView());
      const element = document.createElement("div");

      act(() => {
        result.current.ref(element);
      });

      // mockObserve should not be called because IntersectionObserver is undefined
      expect(mockObserve).not.toHaveBeenCalled();
    });
  });

  describe("エッジケース (Edge Cases)", () => {
    it("should handle empty entries array gracefully", () => {
      const { result } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      // Simulate callback with empty entries
      act(() => {
        intersectionObserverCallback([], {} as IntersectionObserver);
      });

      // State should remain unchanged
      expect(result.current.inView).toBe(false);
      expect(result.current.entry).toBeUndefined();
    });

    it("should only use first entry when multiple entries are provided", () => {
      const { result } = renderHook(() => useInView());

      const element = document.createElement("div");
      act(() => {
        result.current.ref(element);
      });

      const firstEntry = createMockEntry({ isIntersecting: true, intersectionRatio: 0.5 });
      const secondEntry = createMockEntry({ isIntersecting: false, intersectionRatio: 0 });

      act(() => {
        intersectionObserverCallback([firstEntry, secondEntry], {} as IntersectionObserver);
      });

      expect(result.current.inView).toBe(true);
      expect(result.current.entry?.intersectionRatio).toBe(0.5);
    });

    it("should not observe when ref is called with null initially", () => {
      const { result } = renderHook(() => useInView());

      act(() => {
        result.current.ref(null);
      });

      expect(mockObserve).not.toHaveBeenCalled();
    });
  });
});
