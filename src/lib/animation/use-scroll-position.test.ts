"use client";

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsScrolled, useScrollPosition, useScrollY } from "./use-scroll-position";

describe("useScrollY", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return 0 as initial scroll position", () => {
    const { result } = renderHook(() => useScrollY());
    expect(result.current).toBe(0);
  });

  it("should reflect current scrollY on mount", () => {
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    const { result } = renderHook(() => useScrollY());
    expect(result.current).toBe(100);
  });

  it("should update when window is scrolled", () => {
    const { result } = renderHook(() => useScrollY());

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 150, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toBe(150);
  });

  it("should remove scroll listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useScrollY());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});

describe("useIsScrolled", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return false when at top", () => {
    const { result } = renderHook(() => useIsScrolled());
    expect(result.current).toBe(false);
  });

  it("should return true when scrolled past threshold", () => {
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    const { result } = renderHook(() => useIsScrolled());
    expect(result.current).toBe(true);
  });

  it("should use custom threshold", () => {
    const { result } = renderHook(() => useIsScrolled(50));

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 30, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 51, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toBe(true);
  });

  it("should only update when crossing threshold", () => {
    const { result } = renderHook(() => useIsScrolled(50));

    // Start at 0, isScrolled = false
    expect(result.current).toBe(false);

    // Scroll to 30 (still below threshold)
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 30, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(false);

    // Scroll to 60 (above threshold)
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 60, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);

    // Scroll to 100 (still above threshold)
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);

    // Scroll back to 40 (below threshold)
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 40, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(false);
  });

  it("should remove scroll listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useIsScrolled());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});

describe("useScrollPosition (legacy)", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("初期状態 (Initial State)", () => {
    it("should return 0 as initial scroll position", () => {
      const { result } = renderHook(() => useScrollPosition());

      expect(result.current.scrollY).toBe(0);
    });

    it("should return isScrolled as false when at top", () => {
      const { result } = renderHook(() => useScrollPosition());

      expect(result.current.isScrolled).toBe(false);
    });

    it("should reflect current scrollY on mount", () => {
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });

      const { result } = renderHook(() => useScrollPosition());

      expect(result.current.scrollY).toBe(100);
      expect(result.current.isScrolled).toBe(true);
    });
  });

  describe("スクロールイベント (Scroll Events)", () => {
    it("should update scrollY when window is scrolled", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        Object.defineProperty(window, "scrollY", { value: 150, writable: true });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.scrollY).toBe(150);
    });

    it("should update isScrolled to true when scrollY > 0", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        Object.defineProperty(window, "scrollY", { value: 1, writable: true });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.isScrolled).toBe(true);
    });

    it("should update isScrolled to false when scrollY = 0", () => {
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        Object.defineProperty(window, "scrollY", { value: 0, writable: true });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.isScrolled).toBe(false);
    });
  });

  describe("カスタム閾値 (Custom Threshold)", () => {
    it("should use custom threshold for isScrolled calculation", () => {
      const { result } = renderHook(() => useScrollPosition({ threshold: 50 }));

      act(() => {
        Object.defineProperty(window, "scrollY", { value: 30, writable: true });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.scrollY).toBe(30);
      expect(result.current.isScrolled).toBe(false);

      act(() => {
        Object.defineProperty(window, "scrollY", { value: 51, writable: true });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.isScrolled).toBe(true);
    });
  });

  describe("クリーンアップ (Cleanup)", () => {
    it("should remove scroll listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useScrollPosition());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    });
  });
});
