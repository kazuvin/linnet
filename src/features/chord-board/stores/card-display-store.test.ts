import { act, renderHook } from "@testing-library/react";
import { _resetCardDisplayStoreForTesting, useCardDisplayStore } from "./card-display-store";

describe("card-display-store", () => {
  beforeEach(() => {
    _resetCardDisplayStoreForTesting();
  });

  // 1. 初期状態: 全オプションが無効
  it("初期状態では activeOptions は空", () => {
    const { result } = renderHook(() => useCardDisplayStore());
    expect(result.current.activeOptions).toEqual(new Set());
  });

  // 2. toggleOption でオプションが有効になる
  it("toggleOption でオプションが有効になる", async () => {
    const { result } = renderHook(() => useCardDisplayStore());

    await act(async () => {
      result.current.toggleOption("tones");
    });

    expect(result.current.activeOptions.has("tones")).toBe(true);
  });

  // 3. toggleOption で有効なオプションを再度トグルすると無効になる
  it("toggleOption で有効なオプションを再度トグルすると無効になる", async () => {
    const { result } = renderHook(() => useCardDisplayStore());

    await act(async () => {
      result.current.toggleOption("tones");
    });
    expect(result.current.activeOptions.has("tones")).toBe(true);

    await act(async () => {
      result.current.toggleOption("tones");
    });
    expect(result.current.activeOptions.has("tones")).toBe(false);
  });

  // 4. 複数のオプションを同時に有効にできる
  it("複数のオプションを同時に有効にできる", async () => {
    const { result } = renderHook(() => useCardDisplayStore());

    await act(async () => {
      result.current.toggleOption("tones");
      result.current.toggleOption("scale");
    });

    expect(result.current.activeOptions.has("tones")).toBe(true);
    expect(result.current.activeOptions.has("scale")).toBe(true);
  });

  // 5. isOptionActive ヘルパーが正しく動作する
  it("isOptionActive が正しく判定する", async () => {
    const { result } = renderHook(() => useCardDisplayStore());

    expect(result.current.isOptionActive("tones")).toBe(false);

    await act(async () => {
      result.current.toggleOption("tones");
    });

    expect(result.current.isOptionActive("tones")).toBe(true);
    expect(result.current.isOptionActive("scale")).toBe(false);
  });

  // 6. _resetCardDisplayStoreForTesting で初期状態に戻る
  it("_resetCardDisplayStoreForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useCardDisplayStore());

    await act(async () => {
      result.current.toggleOption("tones");
      result.current.toggleOption("scale");
    });

    expect(result.current.activeOptions.size).toBe(2);

    await act(async () => {
      _resetCardDisplayStoreForTesting();
    });

    expect(result.current.activeOptions).toEqual(new Set());
  });
});
