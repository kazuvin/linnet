import { act, renderHook } from "@testing-library/react";
import { _resetFretboardStoreForTesting, useFretboardStore } from "./fretboard-store";

describe("fretboard-store", () => {
  beforeEach(() => {
    _resetFretboardStoreForTesting();
  });

  it("初期状態は showCharacteristicNotes: true", () => {
    const { result } = renderHook(() => useFretboardStore());
    expect(result.current.showCharacteristicNotes).toBe(true);
  });

  it("初期状態は showAvoidNotes: false", () => {
    const { result } = renderHook(() => useFretboardStore());
    expect(result.current.showAvoidNotes).toBe(false);
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

  // 6. activeInstrument の初期値は "fretboard"
  it("初期状態は activeInstrument: 'fretboard'", () => {
    const { result } = renderHook(() => useFretboardStore());
    expect(result.current.activeInstrument).toBe("fretboard");
  });

  // 7. setActiveInstrument で値が変更される
  it("setActiveInstrument で値が変更される", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setActiveInstrument("keyboard");
    });

    expect(result.current.activeInstrument).toBe("keyboard");

    await act(async () => {
      useFretboardStore.getState().setActiveInstrument("fretboard");
    });

    expect(result.current.activeInstrument).toBe("fretboard");
  });

  // 8. _resetFretboardStoreForTesting で初期状態に戻る
  it("_resetFretboardStoreForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useFretboardStore());

    await act(async () => {
      useFretboardStore.getState().setShowAvoidNotes(true);
    });

    expect(result.current.showAvoidNotes).toBe(true);

    await act(async () => {
      _resetFretboardStoreForTesting();
    });

    expect(result.current.showAvoidNotes).toBe(false);
  });
});
