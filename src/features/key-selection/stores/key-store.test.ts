import { act, renderHook } from "@testing-library/react";
import {
  _resetKeyStoreForTesting,
  setChordType,
  setRootName,
  useDiatonicChords,
  useKeySnapshot,
  useModalInterchangeChords,
} from "./key-store";

describe("key-store", () => {
  beforeEach(() => {
    _resetKeyStoreForTesting();
  });

  // 1. 初期状態の検証
  it("初期状態は rootName: C, chordType: triad", () => {
    const { result } = renderHook(() => useKeySnapshot());
    expect(result.current.rootName).toBe("C");
    expect(result.current.chordType).toBe("triad");
  });

  // 2. setRootName で rootName が変更される
  it("setRootName で rootName が変更される", async () => {
    const { result } = renderHook(() => useKeySnapshot());

    await act(async () => {
      setRootName("G");
    });

    expect(result.current.rootName).toBe("G");
    expect(result.current.chordType).toBe("triad");
  });

  // 3. setChordType で chordType が変更される
  it("setChordType で chordType が変更される", async () => {
    const { result } = renderHook(() => useKeySnapshot());

    await act(async () => {
      setChordType("seventh");
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
      setChordType("seventh");
    });

    const romanNumerals = result.current.map((c) => c.romanNumeral);
    expect(romanNumerals).toEqual(["IM7", "iim7", "iiim7", "IVM7", "V7", "vim7", "viim7(b5)"]);
  });

  // 6. useModalInterchangeChords がダイアトニック以外のコードのみ返す
  it("useModalInterchangeChords がダイアトニック以外のコードのみ返す", () => {
    const { result } = renderHook(() => useModalInterchangeChords());

    // 全てのコードがダイアトニックでないことを確認
    // (isAvailable = true のもののみ filterNonDiatonicChords で残る)
    expect(result.current.length).toBeGreaterThan(0);

    // C メジャーのダイアトニックトライアドのルート+クオリティの組み合わせ
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

    // 初期状態: C メジャー
    expect(result.current[0].chord.root.name).toBe("C");

    await act(async () => {
      setRootName("G");
    });

    // G メジャーに変わる
    expect(result.current[0].chord.root.name).toBe("G");
    const rootNames = result.current.map((c) => c.chord.root.name);
    expect(rootNames).toEqual(["G", "A", "B", "C", "D", "E", "F#"]);
  });

  // 8. _resetKeyStoreForTesting で初期状態に戻る
  it("_resetKeyStoreForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useKeySnapshot());

    await act(async () => {
      setRootName("D");
      setChordType("seventh");
    });

    expect(result.current.rootName).toBe("D");
    expect(result.current.chordType).toBe("seventh");

    await act(async () => {
      _resetKeyStoreForTesting();
    });

    expect(result.current.rootName).toBe("C");
    expect(result.current.chordType).toBe("triad");
  });
});
