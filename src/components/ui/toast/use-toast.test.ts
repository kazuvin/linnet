import { act, renderHook } from "@testing-library/react";
import {
  _resetToastStoreForTesting,
  addToast,
  dismissToast,
  getToasts,
  useToasts,
} from "./use-toast";

const EXIT_ANIMATION_MS = 300;

describe("toast store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetToastStoreForTesting();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("初期状態", () => {
    it("toasts は空配列", () => {
      const { result } = renderHook(() => useToasts());
      expect(result.current).toEqual([]);
    });
  });

  describe("addToast", () => {
    it("メッセージを追加できる", () => {
      const { result } = renderHook(() => useToasts());

      act(() => {
        addToast("保存しました");
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].message).toBe("保存しました");
    });

    it("デフォルトの variant は success", () => {
      act(() => {
        addToast("成功");
      });

      expect(getToasts()[0].variant).toBe("success");
    });

    it("variant を error に指定できる", () => {
      act(() => {
        addToast("失敗", "error");
      });

      expect(getToasts()[0].variant).toBe("error");
    });

    it("一意な id が付与される", () => {
      act(() => {
        addToast("1つ目");
        addToast("2つ目");
      });

      const toasts = getToasts();
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it("追加時は exiting が false", () => {
      act(() => {
        addToast("テスト");
      });

      expect(getToasts()[0].exiting).toBe(false);
    });

    it("3秒後に exiting 状態になり、アニメーション後に削除される", () => {
      act(() => {
        addToast("自動削除テスト");
      });

      expect(getToasts()).toHaveLength(1);
      expect(getToasts()[0].exiting).toBe(false);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(getToasts()).toHaveLength(1);
      expect(getToasts()[0].exiting).toBe(true);

      act(() => {
        vi.advanceTimersByTime(EXIT_ANIMATION_MS);
      });

      expect(getToasts()).toHaveLength(0);
    });

    it("複数のトーストが独立して自動削除される", () => {
      act(() => {
        addToast("1つ目");
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        addToast("2つ目");
      });

      expect(getToasts()).toHaveLength(2);

      // 1つ目追加から3秒後 → exiting
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(getToasts()[0].exiting).toBe(true);
      expect(getToasts()[1].exiting).toBe(false);

      // 1つ目のアニメーション完了
      act(() => {
        vi.advanceTimersByTime(EXIT_ANIMATION_MS);
      });

      expect(getToasts()).toHaveLength(1);
      expect(getToasts()[0].message).toBe("2つ目");

      // 2つ目追加から3秒後 → exiting → 削除
      act(() => {
        vi.advanceTimersByTime(1000 - EXIT_ANIMATION_MS);
      });

      expect(getToasts()[0].exiting).toBe(true);

      act(() => {
        vi.advanceTimersByTime(EXIT_ANIMATION_MS);
      });

      expect(getToasts()).toHaveLength(0);
    });
  });

  describe("dismissToast", () => {
    it("指定した id のトーストを exiting 状態にし、アニメーション後に削除する", () => {
      act(() => {
        addToast("残る");
        addToast("消す");
      });

      const idToDismiss = getToasts()[1].id;

      act(() => {
        dismissToast(idToDismiss);
      });

      expect(getToasts()).toHaveLength(2);
      expect(getToasts()[1].exiting).toBe(true);

      act(() => {
        vi.advanceTimersByTime(EXIT_ANIMATION_MS);
      });

      const { result } = renderHook(() => useToasts());
      expect(result.current).toHaveLength(1);
      expect(result.current[0].message).toBe("残る");
    });
  });
});
