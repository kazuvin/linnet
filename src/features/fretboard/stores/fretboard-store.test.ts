import { act, renderHook } from "@testing-library/react";
import { _resetFretboardStoreForTesting, useFretboardStore } from "./fretboard-store";

describe("fretboard-store", () => {
  beforeEach(() => {
    _resetFretboardStoreForTesting();
  });

  // 1. 初期状態の検証
  it("初期状態は maxFret: 12", () => {
    const { result } = renderHook(() => useFretboardStore());
    expect(result.current.maxFret).toBe(12);
  });

  it("初期状態は showCharacteristicNotes: true", () => {
    const { result } = renderHook(() => useFretboardStore());
    expect(result.current.showCharacteristicNotes).toBe(true);
  });

  it("初期状態は showAvoidNotes: false", () => {
    const { result } = renderHook(() => useFretboardStore());
    expect(result.current.showAvoidNotes).toBe(false);
  });

  // 2. setMaxFret で maxFret が変更される
  it("setMaxFret で maxFret が変更される", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setMaxFret(15);
    });

    expect(result.current.maxFret).toBe(15);
  });

  // 3. setMaxFret で 0 以下を指定すると 1 にクランプされる
  it("setMaxFret で 0 以下を指定すると 1 にクランプされる", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setMaxFret(0);
    });

    expect(result.current.maxFret).toBe(1);

    await act(async () => {
      useFretboardStore.getState().setMaxFret(-5);
    });

    expect(result.current.maxFret).toBe(1);
  });

  // 4. setMaxFret で 25 以上を指定すると 24 にクランプされる
  it("setMaxFret で 25 以上を指定すると 24 にクランプされる", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setMaxFret(25);
    });

    expect(result.current.maxFret).toBe(24);

    await act(async () => {
      useFretboardStore.getState().setMaxFret(100);
    });

    expect(result.current.maxFret).toBe(24);
  });

  // 5. setMaxFret で境界値 1, 24 が正しくセットされる
  it("setMaxFret で境界値 1, 24 が正しくセットされる", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setMaxFret(1);
    });

    expect(result.current.maxFret).toBe(1);

    await act(async () => {
      useFretboardStore.getState().setMaxFret(24);
    });

    expect(result.current.maxFret).toBe(24);
  });

  it("setShowCharacteristicNotes で値が変更される", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setShowCharacteristicNotes(false);
    });

    expect(result.current.showCharacteristicNotes).toBe(false);

    await act(async () => {
      useFretboardStore.getState().setShowCharacteristicNotes(true);
    });

    expect(result.current.showCharacteristicNotes).toBe(true);
  });

  it("setShowAvoidNotes で値が変更される", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setShowAvoidNotes(true);
    });

    expect(result.current.showAvoidNotes).toBe(true);

    await act(async () => {
      useFretboardStore.getState().setShowAvoidNotes(false);
    });

    expect(result.current.showAvoidNotes).toBe(false);
  });

  // 6. _resetFretboardStoreForTesting で初期状態に戻る
  it("_resetFretboardStoreForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setMaxFret(20);
    });

    expect(result.current.maxFret).toBe(20);

    await act(async () => {
      _resetFretboardStoreForTesting();
    });

    expect(result.current.maxFret).toBe(12);
  });
});
