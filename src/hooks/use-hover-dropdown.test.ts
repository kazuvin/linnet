import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHoverDropdown } from "./use-hover-dropdown";

/**
 * useHoverDropdown Hook Tests
 *
 * 目的: ホバーによるドロップダウンの開閉を管理する
 * 入力: closeDelay (オプション)
 * 出力: isOpen, handleMouseEnter, handleMouseLeave, handleOpenChange, close
 */
describe("useHoverDropdown", () => {
  describe("初期状態 (Initial State)", () => {
    it("should start with isOpen as false", () => {
      const { result } = renderHook(() => useHoverDropdown());

      expect(result.current.isOpen).toBe(false);
    });

    it("should return all required handlers", () => {
      const { result } = renderHook(() => useHoverDropdown());

      expect(typeof result.current.handleMouseEnter).toBe("function");
      expect(typeof result.current.handleMouseLeave).toBe("function");
      expect(typeof result.current.handleOpenChange).toBe("function");
      expect(typeof result.current.close).toBe("function");
    });
  });

  describe("ホバー操作 (Hover Interactions)", () => {
    it("should open on mouse enter", () => {
      const { result } = renderHook(() => useHoverDropdown());

      act(() => {
        result.current.handleMouseEnter();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should close after delay on mouse leave", () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useHoverDropdown());

      act(() => {
        result.current.handleMouseEnter();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.handleMouseLeave();
      });
      // Still open before delay
      expect(result.current.isOpen).toBe(true);

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.isOpen).toBe(false);

      vi.useRealTimers();
    });

    it("should use custom close delay", () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useHoverDropdown({ closeDelay: 200 }));

      act(() => {
        result.current.handleMouseEnter();
        result.current.handleMouseLeave();
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });
      // Still open after 100ms when delay is 200ms
      expect(result.current.isOpen).toBe(true);

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.isOpen).toBe(false);

      vi.useRealTimers();
    });

    it("should cancel close timeout on re-enter", () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useHoverDropdown());

      act(() => {
        result.current.handleMouseEnter();
        result.current.handleMouseLeave();
      });

      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Re-enter before timeout
      act(() => {
        result.current.handleMouseEnter();
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should still be open
      expect(result.current.isOpen).toBe(true);

      vi.useRealTimers();
    });
  });

  describe("手動制御 (Manual Control)", () => {
    it("should allow manual open via handleOpenChange", () => {
      const { result } = renderHook(() => useHoverDropdown());

      act(() => {
        result.current.handleOpenChange(true);
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should close immediately via close()", () => {
      const { result } = renderHook(() => useHoverDropdown());

      act(() => {
        result.current.handleMouseEnter();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);
    });
  });
});
