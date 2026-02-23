import { act, renderHook } from "@testing-library/react";
import {
  _resetFretboardStoreForTesting,
  setDisplayMode,
  setMaxFret,
  setScaleType,
  setSelectedVoicingIndex,
  useFretboardSnapshot,
} from "./fretboard-store";

describe("fretboard-store", () => {
  beforeEach(() => {
    _resetFretboardStoreForTesting();
  });

  // 1. 初期状態の検証
  it("初期状態は displayMode: chord-tones, scaleType: major, maxFret: 12", () => {
    const { result } = renderHook(() => useFretboardSnapshot());
    expect(result.current.displayMode).toBe("chord-tones");
    expect(result.current.scaleType).toBe("major");
    expect(result.current.maxFret).toBe(12);
  });

  // 2. setDisplayMode で displayMode が変更される
  it("setDisplayMode で displayMode が変更される", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setDisplayMode("scale");
    });

    expect(result.current.displayMode).toBe("scale");
  });

  // 3. setScaleType で scaleType が変更される
  it("setScaleType で scaleType が変更される", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setScaleType("dorian");
    });

    expect(result.current.scaleType).toBe("dorian");
  });

  // 4. setMaxFret で maxFret が変更される
  it("setMaxFret で maxFret が変更される", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setMaxFret(15);
    });

    expect(result.current.maxFret).toBe(15);
  });

  // 5. setMaxFret で 0 以下を指定すると 1 にクランプされる
  it("setMaxFret で 0 以下を指定すると 1 にクランプされる", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setMaxFret(0);
    });

    expect(result.current.maxFret).toBe(1);

    await act(async () => {
      setMaxFret(-5);
    });

    expect(result.current.maxFret).toBe(1);
  });

  // 6. setMaxFret で 25 以上を指定すると 24 にクランプされる
  it("setMaxFret で 25 以上を指定すると 24 にクランプされる", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setMaxFret(25);
    });

    expect(result.current.maxFret).toBe(24);

    await act(async () => {
      setMaxFret(100);
    });

    expect(result.current.maxFret).toBe(24);
  });

  // 7. setMaxFret で境界値 1, 24 が正しくセットされる
  it("setMaxFret で境界値 1, 24 が正しくセットされる", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setMaxFret(1);
    });

    expect(result.current.maxFret).toBe(1);

    await act(async () => {
      setMaxFret(24);
    });

    expect(result.current.maxFret).toBe(24);
  });

  // 8. _resetFretboardStoreForTesting で初期状態に戻る
  it("_resetFretboardStoreForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setDisplayMode("scale");
      setScaleType("dorian");
      setMaxFret(20);
    });

    expect(result.current.displayMode).toBe("scale");
    expect(result.current.scaleType).toBe("dorian");
    expect(result.current.maxFret).toBe(20);

    await act(async () => {
      _resetFretboardStoreForTesting();
    });

    expect(result.current.displayMode).toBe("chord-tones");
    expect(result.current.scaleType).toBe("major");
    expect(result.current.maxFret).toBe(12);
  });

  // 9. setDisplayMode で voicing モードに変更できる
  it("setDisplayMode で voicing モードに変更できる", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setDisplayMode("voicing");
    });

    expect(result.current.displayMode).toBe("voicing");
  });

  // 10. setSelectedVoicingIndex でボイシングインデックスが変更される
  it("setSelectedVoicingIndex でボイシングインデックスが変更される", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setSelectedVoicingIndex(1);
    });

    expect(result.current.selectedVoicingIndex).toBe(1);
  });

  // 11. 初期状態の selectedVoicingIndex は 0
  it("初期状態の selectedVoicingIndex は 0", () => {
    const { result } = renderHook(() => useFretboardSnapshot());
    expect(result.current.selectedVoicingIndex).toBe(0);
  });

  // 12. _resetFretboardStoreForTesting で selectedVoicingIndex も初期化される
  it("_resetFretboardStoreForTesting で selectedVoicingIndex も初期化される", async () => {
    const { result } = renderHook(() => useFretboardSnapshot());

    await act(async () => {
      setSelectedVoicingIndex(2);
    });

    expect(result.current.selectedVoicingIndex).toBe(2);

    await act(async () => {
      _resetFretboardStoreForTesting();
    });

    expect(result.current.selectedVoicingIndex).toBe(0);
  });
});
