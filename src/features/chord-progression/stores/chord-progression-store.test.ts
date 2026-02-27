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

  // 1. 初期状態は chords: [], selectedChordId: null
  it("初期状態は chords: [], selectedChordId: null", () => {
    const { result } = renderHook(() => useChordProgressionStore());
    expect(result.current.chords).toEqual([]);
    expect(result.current.selectedChordId).toBeNull();
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

  // 3. addChord で複数コードを追加できる
  it("addChord で複数コードを追加できる", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      const s = useChordProgressionStore.getState();
      s.addChord("C", "major", "diatonic", "tonic", "I", 1);
      s.addChord("G", "major", "diatonic", "dominant", "V", 5);
      s.addChord("A", "minor", "diatonic", "tonic", "vi", 6);
    });

    expect(result.current.chords).toHaveLength(3);
    expect(result.current.chords[0].rootName).toBe("C");
    expect(result.current.chords[1].rootName).toBe("G");
    expect(result.current.chords[2].rootName).toBe("A");
    expect(result.current.chords[2].quality).toBe("minor");
    expect(result.current.chords[2].symbol).toBe("Am");
  });

  // 4. removeChord でコードが削除される
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

  // 5. removeChord で選択中のコードを削除すると selectedChordId が null になる
  it("removeChord で選択中のコードを削除すると selectedChordId が null になる", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      const s = useChordProgressionStore.getState();
      s.addChord("C", "major", "diatonic", "tonic", "I", 1);
      s.addChord("G", "major", "diatonic", "dominant", "V", 5);
    });

    const selectedId = result.current.chords[0].id;

    await act(async () => {
      useChordProgressionStore.getState().selectChord(selectedId);
    });

    expect(result.current.selectedChordId).toBe(selectedId);

    await act(async () => {
      useChordProgressionStore.getState().removeChord(selectedId);
    });

    expect(result.current.selectedChordId).toBeNull();
    expect(result.current.chords).toHaveLength(1);
  });

  // 6. reorderChords でコードの順番が変わる
  it("reorderChords でコードの順番が変わる", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      const s = useChordProgressionStore.getState();
      s.addChord("C", "major", "diatonic", "tonic", "I", 1);
      s.addChord("D", "minor", "diatonic", "subdominant", "ii", 2);
      s.addChord("E", "minor", "diatonic", "tonic", "iii", 3);
    });

    const originalFirst = result.current.chords[0].id;

    await act(async () => {
      useChordProgressionStore.getState().reorderChords(0, 2);
    });

    expect(result.current.chords[0].rootName).toBe("D");
    expect(result.current.chords[1].rootName).toBe("E");
    expect(result.current.chords[2].rootName).toBe("C");
    expect(result.current.chords[2].id).toBe(originalFirst);
  });

  // 7. selectChord でコードを選択できる
  it("selectChord でコードを選択できる", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      const s = useChordProgressionStore.getState();
      s.addChord("C", "major", "diatonic", "tonic", "I", 1);
      s.addChord("G", "major", "diatonic", "dominant", "V", 5);
    });

    const targetId = result.current.chords[1].id;

    await act(async () => {
      useChordProgressionStore.getState().selectChord(targetId);
    });

    expect(result.current.selectedChordId).toBe(targetId);
  });

  // 8. selectChord(null) で選択解除
  it("selectChord(null) で選択解除", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      useChordProgressionStore.getState().addChord("C", "major", "diatonic", "tonic", "I", 1);
    });

    const chordId = result.current.chords[0].id;

    await act(async () => {
      useChordProgressionStore.getState().selectChord(chordId);
    });

    expect(result.current.selectedChordId).toBe(chordId);

    await act(async () => {
      useChordProgressionStore.getState().selectChord(null);
    });

    expect(result.current.selectedChordId).toBeNull();
  });

  // 9. clearProgression で全コードと選択がクリアされる
  it("clearProgression で全コードと選択がクリアされる", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      const s = useChordProgressionStore.getState();
      s.addChord("C", "major", "diatonic", "tonic", "I", 1);
      s.addChord("G", "major", "diatonic", "dominant", "V", 5);
      s.addChord("A", "minor", "diatonic", "tonic", "vi", 6);
    });

    const chordId = result.current.chords[1].id;

    await act(async () => {
      useChordProgressionStore.getState().selectChord(chordId);
    });

    expect(result.current.chords).toHaveLength(3);
    expect(result.current.selectedChordId).toBe(chordId);

    await act(async () => {
      useChordProgressionStore.getState().clearProgression();
    });

    expect(result.current.chords).toEqual([]);
    expect(result.current.selectedChordId).toBeNull();
  });

  // 10. useSelectedChord が選択中コードの Chord オブジェクトを返す
  it("useSelectedChord が選択中コードの Chord オブジェクトを返す", async () => {
    const { result } = renderHook(() => useSelectedChord());

    await act(async () => {
      useChordProgressionStore.getState().addChord("A", "minor7", "diatonic", "tonic", "vi7", 6);
    });

    const { result: snapResult } = renderHook(() => useChordProgressionStore());
    const chordId = snapResult.current.chords[0].id;

    await act(async () => {
      useChordProgressionStore.getState().selectChord(chordId);
    });

    expect(result.current).not.toBeNull();
    expect(result.current?.root.name).toBe("A");
    expect(result.current?.quality).toBe("minor7");
    expect(result.current?.symbol).toBe("Am7");
    expect(result.current?.notes).toBeDefined();
    expect(result.current?.notes.length).toBeGreaterThan(0);
  });

  // 11. useSelectedChord が未選択時に null を返す
  it("useSelectedChord が未選択時に null を返す", () => {
    const { result } = renderHook(() => useSelectedChord());
    expect(result.current).toBeNull();
  });

  // 12. transposeAllChords
  describe("transposeAllChords", () => {
    it("transposeAllChords(7) で全コードが5度上にトランスポーズされる", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        const s = useChordProgressionStore.getState();
        s.addChord("C", "major", "diatonic", "tonic", "I", 1);
        s.addChord("A", "minor", "diatonic", "tonic", "vi", 6);
        s.addChord("F", "major", "diatonic", "subdominant", "IV", 4);
      });

      await act(async () => {
        useChordProgressionStore.getState().transposeAllChords(7, "G");
      });

      expect(result.current.chords[0].rootName).toBe("G");
      expect(result.current.chords[0].symbol).toBe("G");
      expect(result.current.chords[1].rootName).toBe("E");
      expect(result.current.chords[1].symbol).toBe("Em");
      expect(result.current.chords[2].rootName).toBe("C");
      expect(result.current.chords[2].symbol).toBe("C");
    });

    it("transposeAllChords で source, chordFunction, romanNumeral, degree, id は変わらない", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        const s = useChordProgressionStore.getState();
        s.addChord("C", "major", "diatonic", "tonic", "I", 1);
        s.addChord("D", "minor", "dorian", "subdominant", "ii", 2);
      });

      const originalIds = result.current.chords.map((c) => c.id);
      const originalSources = result.current.chords.map((c) => c.source);
      const originalFunctions = result.current.chords.map((c) => c.chordFunction);
      const originalRomanNumerals = result.current.chords.map((c) => c.romanNumeral);
      const originalDegrees = result.current.chords.map((c) => c.degree);

      await act(async () => {
        useChordProgressionStore.getState().transposeAllChords(7, "G");
      });

      expect(result.current.chords.map((c) => c.id)).toEqual(originalIds);
      expect(result.current.chords.map((c) => c.source)).toEqual(originalSources);
      expect(result.current.chords.map((c) => c.chordFunction)).toEqual(originalFunctions);
      expect(result.current.chords.map((c) => c.romanNumeral)).toEqual(originalRomanNumerals);
      expect(result.current.chords.map((c) => c.degree)).toEqual(originalDegrees);
    });

    it("transposeAllChords(0) で何も変わらない", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        const s = useChordProgressionStore.getState();
        s.addChord("C", "major", "diatonic", "tonic", "I", 1);
        s.addChord("A", "minor", "diatonic", "tonic", "vi", 6);
      });

      await act(async () => {
        useChordProgressionStore.getState().transposeAllChords(0, "C");
      });

      expect(result.current.chords[0].rootName).toBe("C");
      expect(result.current.chords[0].symbol).toBe("C");
      expect(result.current.chords[1].rootName).toBe("A");
      expect(result.current.chords[1].symbol).toBe("Am");
    });

    it("chords が空の場合エラーにならない", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      expect(result.current.chords).toEqual([]);

      await act(async () => {
        useChordProgressionStore.getState().transposeAllChords(7, "G");
      });

      expect(result.current.chords).toEqual([]);
    });
  });

  // 12.5 useSelectedProgressionChord
  describe("useSelectedProgressionChord", () => {
    it("選択中のProgressionChordを返す（sourceを含む）", async () => {
      const { result } = renderHook(() => useSelectedProgressionChord());
      const { result: snapResult } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        useChordProgressionStore
          .getState()
          .addChord("Eb", "major7", "natural-minor", "tonic", "III", 3);
      });

      const chordId = snapResult.current.chords[0].id;

      await act(async () => {
        useChordProgressionStore.getState().selectChord(chordId);
      });

      expect(result.current).not.toBeNull();
      expect(result.current?.rootName).toBe("Eb");
      expect(result.current?.quality).toBe("major7");
      expect(result.current?.source).toBe("natural-minor");
      expect(result.current?.degree).toBe(3);
    });

    it("未選択時にnullを返す", () => {
      const { result } = renderHook(() => useSelectedProgressionChord());
      expect(result.current).toBeNull();
    });
  });

  // 13. activeChordOverride
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

    it("useSelectedProgressionChord は activeChordOverride を優先して返す", async () => {
      const { result } = renderHook(() => useSelectedProgressionChord());

      await act(async () => {
        const s = useChordProgressionStore.getState();
        s.addChord("G", "major", "diatonic", "dominant", "V", 5);
      });

      const { result: storeResult } = renderHook(() => useChordProgressionStore());
      const chordId = storeResult.current.chords[0].id;

      await act(async () => {
        useChordProgressionStore.getState().selectChord(chordId);
      });

      // 通常は selectedChordId のコードが返る
      expect(result.current?.rootName).toBe("G");

      const override = {
        id: "override-1",
        rootName: "A",
        quality: "minor7" as const,
        symbol: "Am7",
        source: "diatonic" as const,
        chordFunction: "tonic" as const,
        romanNumeral: "vi",
        degree: 6,
      };

      await act(async () => {
        useChordProgressionStore.getState().setActiveChordOverride(override);
      });

      // オーバーライドが優先される
      expect(result.current?.rootName).toBe("A");
      expect(result.current?.quality).toBe("minor7");
    });
  });

  // 14. _resetChordProgressionForTesting で初期状態に戻る
  it("_resetChordProgressionForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useChordProgressionStore());

    await act(async () => {
      const s = useChordProgressionStore.getState();
      s.addChord("C", "major", "diatonic", "tonic", "I", 1);
      s.addChord("G", "major", "diatonic", "dominant", "V", 5);
    });

    const chordId = result.current.chords[0].id;

    await act(async () => {
      useChordProgressionStore.getState().selectChord(chordId);
    });

    expect(result.current.chords).toHaveLength(2);
    expect(result.current.selectedChordId).toBe(chordId);

    await act(async () => {
      _resetChordProgressionForTesting();
    });

    expect(result.current.chords).toEqual([]);
    expect(result.current.selectedChordId).toBeNull();
  });
});
