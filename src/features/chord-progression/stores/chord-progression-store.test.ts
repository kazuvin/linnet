import { act, renderHook } from "@testing-library/react";
import { useSelectedChord, useSelectedProgressionChord } from "./chord-progression-selectors";
import {
  _resetChordProgressionForTesting,
  useChordProgressionStore,
} from "./chord-progression-store";

describe("chord-progression-store", () => {
  beforeEach(() => {
    _resetChordProgressionForTesting();
  });

  // 1. 初期状態
  it("初期状態は chords: [], selectedChordId: null, activeChordOverride: null", () => {
    const { result } = renderHook(() => useChordProgressionStore());
    expect(result.current.chords).toEqual([]);
    expect(result.current.selectedChordId).toBeNull();
    expect(result.current.activeChordOverride).toBeNull();
  });

  // 2. addChord でコードが追加される
  it("addChord でコードが追加される", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    let returnedId = "";
    await act(async () => {
      returnedId = useChordProgressionStore
        .getState()
        .addChord("C", "major", "diatonic", "tonic", "I", 1);
    });

    expect(result.current.chords).toHaveLength(1);
    const chord = result.current.chords[0];
    expect(chord.id).toBeTruthy();
    expect(returnedId).toBe(chord.id);
    expect(chord.rootName).toBe("C");
    expect(chord.quality).toBe("major");
    expect(chord.symbol).toBe("C");
    expect(chord.source).toBe("diatonic");
    expect(chord.chordFunction).toBe("tonic");
    expect(chord.romanNumeral).toBe("I");
    expect(chord.degree).toBe(1);
  });

  // 3. removeChord でコードが削除される
  it("removeChord でコードが削除される", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      const s = useChordProgressionStore.getState();
      s.addChord("C", "major", "diatonic", "tonic", "I", 1);
      s.addChord("G", "major", "diatonic", "dominant", "V", 5);
    });

    const idToRemove = result.current.chords[0].id;

    await act(async () => {
      useChordProgressionStore.getState().removeChord(idToRemove);
    });

    expect(result.current.chords).toHaveLength(1);
    expect(result.current.chords[0].rootName).toBe("G");
  });

  // 4. activeChordOverride
  describe("activeChordOverride", () => {
    it("初期値は null", () => {
      const { result } = renderHook(() => useChordProgressionStore());
      expect(result.current.activeChordOverride).toBeNull();
    });

    it("setActiveChordOverride でオーバーライドを設定できる", async () => {
      const { result } = renderHook(() => useChordProgressionStore());
      const override = {
        id: "override-1",
        rootName: "C",
        quality: "major7" as const,
        symbol: "Cmaj7",
        source: "diatonic" as const,
        chordFunction: "tonic" as const,
        romanNumeral: "I",
        degree: 1,
      };

      await act(async () => {
        useChordProgressionStore.getState().setActiveChordOverride(override);
      });

      expect(result.current.activeChordOverride).toEqual(override);
    });

    it("setActiveChordOverride(null) でクリアできる", async () => {
      const { result } = renderHook(() => useChordProgressionStore());
      const override = {
        id: "override-1",
        rootName: "C",
        quality: "major7" as const,
        symbol: "Cmaj7",
        source: "diatonic" as const,
        chordFunction: "tonic" as const,
        romanNumeral: "I",
        degree: 1,
      };

      await act(async () => {
        useChordProgressionStore.getState().setActiveChordOverride(override);
      });
      expect(result.current.activeChordOverride).not.toBeNull();

      await act(async () => {
        useChordProgressionStore.getState().setActiveChordOverride(null);
      });
      expect(result.current.activeChordOverride).toBeNull();
    });
  });

  // 5. useSelectedChord セレクター
  describe("useSelectedChord", () => {
    it("activeChordOverride が設定されていれば Chord オブジェクトを返す", async () => {
      const { result } = renderHook(() => useSelectedChord());

      await act(async () => {
        useChordProgressionStore.getState().setActiveChordOverride({
          id: "test-1",
          rootName: "A",
          quality: "minor7",
          symbol: "Am7",
          source: "diatonic",
          chordFunction: "tonic",
          romanNumeral: "vi7",
          degree: 6,
        });
      });

      expect(result.current).not.toBeNull();
      expect(result.current?.root.name).toBe("A");
      expect(result.current?.quality).toBe("minor7");
      expect(result.current?.symbol).toBe("Am7");
      expect(result.current?.notes).toBeDefined();
      expect(result.current?.notes.length).toBeGreaterThan(0);
    });

    it("activeChordOverride が null の場合 null を返す", () => {
      const { result } = renderHook(() => useSelectedChord());
      expect(result.current).toBeNull();
    });
  });

  // 6. useSelectedProgressionChord セレクター
  describe("useSelectedProgressionChord", () => {
    it("activeChordOverride を返す", async () => {
      const { result } = renderHook(() => useSelectedProgressionChord());

      const override = {
        id: "test-1",
        rootName: "Eb",
        quality: "major7" as const,
        symbol: "EbM7",
        source: "natural-minor" as const,
        chordFunction: "tonic" as const,
        romanNumeral: "III",
        degree: 3,
      };

      await act(async () => {
        useChordProgressionStore.getState().setActiveChordOverride(override);
      });

      expect(result.current).not.toBeNull();
      expect(result.current?.rootName).toBe("Eb");
      expect(result.current?.quality).toBe("major7");
      expect(result.current?.source).toBe("natural-minor");
      expect(result.current?.degree).toBe(3);
    });

    it("activeChordOverride が null の場合 null を返す", () => {
      const { result } = renderHook(() => useSelectedProgressionChord());
      expect(result.current).toBeNull();
    });
  });

  // 7. _resetChordProgressionForTesting で初期状態に戻る
  it("_resetChordProgressionForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      const s = useChordProgressionStore.getState();
      s.addChord("C", "major", "diatonic", "tonic", "I", 1);
      s.setActiveChordOverride({
        id: "test-1",
        rootName: "C",
        quality: "major",
        symbol: "C",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "I",
        degree: 1,
      });
    });

    expect(result.current.chords).toHaveLength(1);
    expect(result.current.activeChordOverride).not.toBeNull();

    await act(async () => {
      _resetChordProgressionForTesting();
    });

    expect(result.current.chords).toEqual([]);
    expect(result.current.selectedChordId).toBeNull();
    expect(result.current.activeChordOverride).toBeNull();
  });
});
