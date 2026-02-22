import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./use-debounce";

/**
 * useDebounce 仕様
 *
 * 目的: 値の更新をdebounceし、指定時間後に最新の値を返す
 * 入力: value (T), delay (number, ms)
 * 出力: debounced value (T)
 */
describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================
  // 初期状態 (Initial State)
  // ===========================================
  describe("初期状態 (Initial State)", () => {
    it("should return initial value immediately", () => {
      const { result } = renderHook(() => useDebounce("initial", 300));

      expect(result.current).toBe("initial");
    });

    it("should work with different types", () => {
      const { result: stringResult } = renderHook(() => useDebounce("string", 300));
      expect(stringResult.current).toBe("string");

      const { result: numberResult } = renderHook(() => useDebounce(123, 300));
      expect(numberResult.current).toBe(123);

      const { result: objectResult } = renderHook(() => useDebounce({ key: "value" }, 300));
      expect(objectResult.current).toEqual({ key: "value" });
    });
  });

  // ===========================================
  // 基本動作 (Basic Behavior)
  // ===========================================
  describe("基本動作 (Basic Behavior)", () => {
    it("should not update debounced value before delay", () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: "initial" },
      });

      rerender({ value: "updated" });

      // Before delay, should still have initial value
      expect(result.current).toBe("initial");
    });

    it("should update debounced value after delay", () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: "initial" },
      });

      rerender({ value: "updated" });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe("updated");
    });

    it("should reset timer on rapid value changes", () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: "initial" },
      });

      // First change
      rerender({ value: "first" });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Second change before delay completes
      rerender({ value: "second" });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Third change before delay completes
      rerender({ value: "third" });

      // Wait for full delay
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should only have the last value
      expect(result.current).toBe("third");
    });
  });

  // ===========================================
  // 境界値 (Boundary Values)
  // ===========================================
  describe("境界値 (Boundary Values)", () => {
    it("should work with zero delay", () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), {
        initialProps: { value: "initial" },
      });

      rerender({ value: "updated" });

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current).toBe("updated");
    });

    it("should work with empty string", () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: "test" },
      });

      rerender({ value: "" });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe("");
    });

    it("should handle null and undefined", () => {
      const { result: nullResult, rerender: rerenderNull } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: null as string | null } }
      );

      rerenderNull({ value: "updated" });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(nullResult.current).toBe("updated");

      const { result: undefinedResult, rerender: rerenderUndefined } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: undefined as string | undefined } }
      );

      rerenderUndefined({ value: "updated" });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(undefinedResult.current).toBe("updated");
    });
  });

  // ===========================================
  // delay変更 (Delay Changes)
  // ===========================================
  describe("delay変更 (Delay Changes)", () => {
    it("should respect new delay when delay changes", () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: "initial", delay: 300 },
      });

      // Change both value and delay
      rerender({ value: "updated", delay: 500 });

      // After old delay, should not update
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe("initial");

      // After new delay, should update
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe("updated");
    });
  });

  // ===========================================
  // クリーンアップ (Cleanup)
  // ===========================================
  describe("クリーンアップ (Cleanup)", () => {
    it("should cleanup timer on unmount", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: "initial" },
      });

      // Trigger a timer
      rerender({ value: "updated" });

      // Unmount before timer completes
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});
