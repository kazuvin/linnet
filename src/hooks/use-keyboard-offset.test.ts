import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKeyboardOffset } from "./use-keyboard-offset";

describe("useKeyboardOffset", () => {
  let resizeListeners: Array<() => void>;
  let scrollListeners: Array<() => void>;

  const createMockVisualViewport = (height: number) => ({
    height,
    addEventListener: vi.fn((event: string, cb: () => void) => {
      if (event === "resize") resizeListeners.push(cb);
      if (event === "scroll") scrollListeners.push(cb);
    }),
    removeEventListener: vi.fn((event: string, cb: () => void) => {
      if (event === "resize") resizeListeners = resizeListeners.filter((l) => l !== cb);
      if (event === "scroll") scrollListeners = scrollListeners.filter((l) => l !== cb);
    }),
  });

  beforeEach(() => {
    resizeListeners = [];
    scrollListeners = [];
    vi.stubGlobal("innerHeight", 800);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("キーボードが表示されていない場合は 0 を返す", () => {
    vi.stubGlobal("visualViewport", createMockVisualViewport(800));
    const { result } = renderHook(() => useKeyboardOffset());
    expect(result.current).toBe(0);
  });

  it("キーボード表示時にオフセットを返す", () => {
    const mockVV = createMockVisualViewport(800);
    vi.stubGlobal("visualViewport", mockVV);

    const { result } = renderHook(() => useKeyboardOffset());

    // キーボードが300px分表示された
    mockVV.height = 500;
    act(() => {
      for (const listener of resizeListeners) listener();
    });

    expect(result.current).toBe(300);
  });

  it("キーボードが閉じたら 0 に戻る", () => {
    const mockVV = createMockVisualViewport(800);
    vi.stubGlobal("visualViewport", mockVV);

    const { result } = renderHook(() => useKeyboardOffset());

    // キーボード表示
    mockVV.height = 500;
    act(() => {
      for (const listener of resizeListeners) listener();
    });
    expect(result.current).toBe(300);

    // キーボード非表示
    mockVV.height = 800;
    act(() => {
      for (const listener of resizeListeners) listener();
    });
    expect(result.current).toBe(0);
  });

  it("scroll イベントでもオフセットが更新される", () => {
    const mockVV = createMockVisualViewport(500);
    vi.stubGlobal("visualViewport", mockVV);

    const { result } = renderHook(() => useKeyboardOffset());

    // scroll イベント発火
    act(() => {
      for (const listener of scrollListeners) listener();
    });

    expect(result.current).toBe(300);
  });

  it("visualViewport が存在しない場合は 0 を返す", () => {
    vi.stubGlobal("visualViewport", null);
    const { result } = renderHook(() => useKeyboardOffset());
    expect(result.current).toBe(0);
  });

  it("アンマウント時にイベントリスナーが解除される", () => {
    const mockVV = createMockVisualViewport(800);
    vi.stubGlobal("visualViewport", mockVV);

    const { unmount } = renderHook(() => useKeyboardOffset());
    unmount();

    expect(mockVV.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(mockVV.removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("負の値にはならない", () => {
    const mockVV = createMockVisualViewport(900);
    vi.stubGlobal("visualViewport", mockVV);

    const { result } = renderHook(() => useKeyboardOffset());

    act(() => {
      for (const listener of resizeListeners) listener();
    });

    expect(result.current).toBe(0);
  });
});
