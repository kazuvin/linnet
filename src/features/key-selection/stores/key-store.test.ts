import { act, renderHook } from "@testing-library/react";
import {
  _resetKeyStoreForTesting,
  useCurrentModeChords,
  useDiatonicChords,
  useKeyStore,
  useModalInterchangeChords,
  useModalInterchangeChordsByMode,
} from "./key-store";

describe("key-store", () => {
  beforeEach(() => {
    _resetKeyStoreForTesting();
  });

  // 1. 初期状態の検証
  it("初期状態は rootName: C, chordType: triad", () => {
    const { result } = renderHook(() => useKeyStore());
    expect(result.current.rootName).toBe("C");
    expect(result.current.chordType).toBe("triad");
  });

  // 2. setRootName で rootName が変更される
  it("setRootName で rootName が変更される", async () => {
    const { result } = renderHook(() => useKeyStore());

    await act(async () => {
      useKeyStore.getState().setRootName("G");
    });

    expect(result.current.rootName).toBe("G");
    expect(result.current.chordType).toBe("triad");
  });

  // 3. setChordType で chordType が変更される
  it("setChordType で chordType が変更される", async () => {
    const { result } = renderHook(() => useKeyStore());

    await act(async () => {
      useKeyStore.getState().setChordType("seventh");
    });

    expect(result.current.chordType).toBe("seventh");
    expect(result.current.rootName).toBe("C");
  });

  // 4. useDiatonicChords が正しいダイアトニックコードを返す（C メジャーの triad）
  it("useDiatonicChords が C メジャーの triad を返す", () => {
    const { result } = renderHook(() => useDiatonicChords());

    expect(result.current).toHaveLength(7);

    const romanNumerals = result.current.map((c) => c.romanNumeral);
    expect(romanNumerals).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii\u00B0"]);

    // ルート音の確認
    const rootNames = result.current.map((c) => c.chord.root.name);
    expect(rootNames).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  // 5. useDiatonicChords が seventh モードで正しいコードを返す
  it("useDiatonicChords が seventh モードで正しいコードを返す", async () => {
    const { result } = renderHook(() => useDiatonicChords());

    await act(async () => {
      useKeyStore.getState().setChordType("seventh");
    });

    const romanNumerals = result.current.map((c) => c.romanNumeral);
    expect(romanNumerals).toEqual(["IM7", "iim7", "iiim7", "IVM7", "V7", "vim7", "viim7(b5)"]);
  });

  // 6. useModalInterchangeChords がダイアトニック以外のコードのみ返す
  it("useModalInterchangeChords がダイアトニック以外のコードのみ返す", () => {
    const { result } = renderHook(() => useModalInterchangeChords());

    expect(result.current.length).toBeGreaterThan(0);

    const diatonicSet = new Set([
      "C-major",
      "D-minor",
      "E-minor",
      "F-major",
      "G-major",
      "A-minor",
      "B-diminished",
    ]);

    for (const chord of result.current) {
      const key = `${chord.chord.root.name}-${chord.chord.quality}`;
      expect(diatonicSet.has(key)).toBe(false);
    }
  });

  // 7. rootName 変更後に useDiatonicChords の結果も変わる
  it("rootName 変更後に useDiatonicChords の結果も変わる", async () => {
    const { result } = renderHook(() => useDiatonicChords());

    expect(result.current[0].chord.root.name).toBe("C");

    await act(async () => {
      useKeyStore.getState().setRootName("G");
    });

    expect(result.current[0].chord.root.name).toBe("G");
    const rootNames = result.current.map((c) => c.chord.root.name);
    expect(rootNames).toEqual(["G", "A", "B", "C", "D", "E", "F#"]);
  });

  // 8. useModalInterchangeChordsByMode
  describe("useModalInterchangeChordsByMode", () => {
    it("7つのモードのデータを返す", () => {
      const { result } = renderHook(() => useModalInterchangeChordsByMode());
      expect(result.current).toHaveLength(7);
    });

    it("各モードに source, displayName, chords を持つ", () => {
      const { result } = renderHook(() => useModalInterchangeChordsByMode());
      for (const mode of result.current) {
        expect(mode.source).toBeDefined();
        expect(mode.displayName).toBeDefined();
        expect(mode.chords).toBeDefined();
        expect(mode.chords.length).toBeGreaterThan(0);
      }
    });

    it("各モードのコードは7つずつある", () => {
      const { result } = renderHook(() => useModalInterchangeChordsByMode());
      for (const mode of result.current) {
        expect(mode.chords).toHaveLength(7);
      }
    });

    it("chordType を seventh に変更するとセブンスコードが返される", async () => {
      const { result } = renderHook(() => useModalInterchangeChordsByMode());

      await act(async () => {
        useKeyStore.getState().setChordType("seventh");
      });

      for (const mode of result.current) {
        for (const chord of mode.chords) {
          expect(chord.chord.notes).toHaveLength(4);
        }
      }
    });

    it("rootName 変更後にデータが更新される", async () => {
      const { result } = renderHook(() => useModalInterchangeChordsByMode());
      const initialFirst = result.current[0].chords[0].chord.root.name;

      await act(async () => {
        useKeyStore.getState().setRootName("G");
      });

      const updatedFirst = result.current[0].chords[0].chord.root.name;
      expect(updatedFirst).not.toBe(initialFirst);
    });
  });

  // 9. _resetKeyStoreForTesting で初期状態に戻る
  it("_resetKeyStoreForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useKeyStore());

    await act(async () => {
      useKeyStore.getState().setRootName("D");
      useKeyStore.getState().setChordType("seventh");
    });

    expect(result.current.rootName).toBe("D");
    expect(result.current.chordType).toBe("seventh");

    await act(async () => {
      _resetKeyStoreForTesting();
    });

    expect(result.current.rootName).toBe("C");
    expect(result.current.chordType).toBe("triad");
  });

  // 10. selectedMode と useCurrentModeChords
  describe("selectedMode と useCurrentModeChords", () => {
    it('初期状態は selectedMode: "diatonic"', () => {
      const { result } = renderHook(() => useKeyStore());
      expect(result.current.selectedMode).toBe("diatonic");
    });

    it("setSelectedMode で selectedMode が変更される", async () => {
      const { result } = renderHook(() => useKeyStore());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("dorian");
      });

      expect(result.current.selectedMode).toBe("dorian");
    });

    it("useCurrentModeChords が diatonic モードで 7 コードを返す（全て isAvailable: true）", () => {
      const { result } = renderHook(() => useCurrentModeChords());

      expect(result.current).toHaveLength(7);
      for (const chord of result.current) {
        expect(chord.isAvailable).toBe(true);
      }
    });

    it("useCurrentModeChords が diatonic モードのコードに chordFunction がある", () => {
      const { result } = renderHook(() => useCurrentModeChords());

      const functions = result.current.map((c) => c.chordFunction);
      expect(functions).toEqual([
        "tonic",
        "subdominant",
        "tonic",
        "subdominant",
        "dominant",
        "tonic",
        "dominant",
      ]);
    });

    it("useCurrentModeChords が modal interchange モードで 7 コードを返す（全て isAvailable: true）", async () => {
      const { result } = renderHook(() => useCurrentModeChords());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("lydian");
      });

      expect(result.current).toHaveLength(7);
      for (const chord of result.current) {
        expect(chord.isAvailable).toBe(true);
      }
    });

    it("useCurrentModeChords が modal interchange モードのコードにも chordFunction がある", async () => {
      const { result } = renderHook(() => useCurrentModeChords());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("dorian");
      });

      for (const chord of result.current) {
        expect(["tonic", "subdominant", "dominant"]).toContain(chord.chordFunction);
      }
    });

    it("rootName/chordType 変更に追従する", async () => {
      const { result } = renderHook(() => useCurrentModeChords());

      expect(result.current[0].chord.root.name).toBe("C");
      expect(result.current[0].chord.notes).toHaveLength(3);

      await act(async () => {
        useKeyStore.getState().setRootName("G");
        useKeyStore.getState().setChordType("seventh");
      });

      expect(result.current[0].chord.root.name).toBe("G");
      expect(result.current[0].chord.notes).toHaveLength(4);
    });

    it("useCurrentModeChords が secondary-dominant モードで 5 コードを返す", async () => {
      const { result } = renderHook(() => useCurrentModeChords());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("secondary-dominant");
      });

      expect(result.current).toHaveLength(5);
      for (const chord of result.current) {
        expect(chord.isAvailable).toBe(true);
        expect(chord.chordFunction).toBe("dominant");
      }
    });

    it("useCurrentModeChords が secondary-dominant + seventh で dominant7 コードを返す", async () => {
      const { result } = renderHook(() => useCurrentModeChords());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("secondary-dominant");
        useKeyStore.getState().setChordType("seventh");
      });

      expect(result.current).toHaveLength(5);
      for (const chord of result.current) {
        expect(chord.chord.quality).toBe("dominant7");
      }
    });

    it("useCurrentModeChords が tritone-substitution モードで 5 コードを返す", async () => {
      const { result } = renderHook(() => useCurrentModeChords());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("tritone-substitution");
      });

      expect(result.current).toHaveLength(5);
      for (const chord of result.current) {
        expect(chord.isAvailable).toBe(true);
        expect(chord.chordFunction).toBe("dominant");
      }
    });

    it("useCurrentModeChords が tritone-substitution + seventh で dominant7 コードを返す", async () => {
      const { result } = renderHook(() => useCurrentModeChords());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("tritone-substitution");
        useKeyStore.getState().setChordType("seventh");
      });

      expect(result.current).toHaveLength(5);
      for (const chord of result.current) {
        expect(chord.chord.quality).toBe("dominant7");
      }
    });

    it("useCurrentModeChords が tritone-substitution で正しいルートを返す（Cメジャー）", async () => {
      const { result } = renderHook(() => useCurrentModeChords());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("tritone-substitution");
      });

      const symbols = result.current.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["Eb", "F", "Gb", "Ab", "Bb"]);
    });

    it('_resetKeyStoreForTesting で selectedMode も "diatonic" に戻る', async () => {
      const { result } = renderHook(() => useKeyStore());

      await act(async () => {
        useKeyStore.getState().setSelectedMode("phrygian");
      });

      expect(result.current.selectedMode).toBe("phrygian");

      await act(async () => {
        _resetKeyStoreForTesting();
      });

      expect(result.current.selectedMode).toBe("diatonic");
    });
  });
});
