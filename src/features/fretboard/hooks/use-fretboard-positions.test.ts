import { act, renderHook } from "@testing-library/react";
import {
  _resetChordProgressionForTesting,
  addChord,
  selectChord,
  useChordProgressionSnapshot,
} from "@/features/chord-progression/stores/chord-progression-store";
import {
  _resetFretboardStoreForTesting,
  setDisplayMode,
  setMaxFret,
  setScaleType,
} from "@/features/fretboard/stores/fretboard-store";
import { _resetKeyStoreForTesting, setRootName } from "@/features/key-selection/stores/key-store";
import { useFretboardPositions } from "./use-fretboard-positions";

describe("useFretboardPositions", () => {
  beforeEach(() => {
    _resetKeyStoreForTesting();
    _resetChordProgressionForTesting();
    _resetFretboardStoreForTesting();
  });

  // 1. chord-tones モードでコード未選択の場合、空配列を返す
  it("chord-tones モードでコード未選択の場合、空配列を返す", () => {
    const { result } = renderHook(() => useFretboardPositions());
    expect(result.current).toEqual([]);
  });

  // 2. chord-tones モードでコード選択時、構成音のポジションを返す
  it("chord-tones モードでコード選択時、Cメジャーの構成音ポジションを返す", async () => {
    // コードを追加して選択する
    addChord("C", "major", "diatonic", "tonic", "I", 1);

    // addChord で追加されたコードの id を取得するために snapshot を使う
    const { result: progressionResult } = renderHook(() => useChordProgressionSnapshot());

    await act(async () => {
      // Valtio の更新を待つ
    });

    const chordId = progressionResult.current.chords[0].id;

    await act(async () => {
      selectChord(chordId);
    });

    const { result } = renderHook(() => useFretboardPositions());

    // ポジションが空でないこと
    expect(result.current.length).toBeGreaterThan(0);

    // 返り値の note が C メジャーの構成音（C, E, G）であること
    const cMajorPitchClasses = new Set([0, 4, 7]); // C=0, E=4, G=7
    for (const pos of result.current) {
      expect(cMajorPitchClasses.has(pos.note.pitchClass)).toBe(true);
    }
  });

  // 3. scale モードで rootName + scaleType のポジションを返す
  it("scale モードで rootName + scaleType のポジションを返す", async () => {
    await act(async () => {
      setDisplayMode("scale");
    });

    const { result } = renderHook(() => useFretboardPositions());

    // デフォルトは C メジャースケールなのでポジションが空でないこと
    expect(result.current.length).toBeGreaterThan(0);

    // C メジャースケールの構成音: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
    const cMajorScalePitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
    for (const pos of result.current) {
      expect(cMajorScalePitchClasses.has(pos.note.pitchClass)).toBe(true);
    }
  });

  // 4. maxFret の変更がポジション数に影響する
  it("maxFret の変更がポジション数に影響する", async () => {
    await act(async () => {
      setDisplayMode("scale");
    });

    await act(async () => {
      setMaxFret(3);
    });

    const { result: result3 } = renderHook(() => useFretboardPositions());
    const countAt3 = result3.current.length;

    await act(async () => {
      setMaxFret(12);
    });

    const { result: result12 } = renderHook(() => useFretboardPositions());
    const countAt12 = result12.current.length;

    expect(countAt12).toBeGreaterThan(countAt3);
  });

  // 5. rootName 変更後 scale モードの結果が変わる
  it("rootName 変更後 scale モードの結果が変わる", async () => {
    await act(async () => {
      setDisplayMode("scale");
    });

    const { result: resultC } = renderHook(() => useFretboardPositions());
    // C メジャースケールのポジションが返ることを確認（後で G と比較するため保持不要）
    expect(resultC.current.length).toBeGreaterThan(0);

    await act(async () => {
      setRootName("G");
    });

    const { result: resultG } = renderHook(() => useFretboardPositions());

    // G メジャースケールの構成音: G(7), A(9), B(11), C(0), D(2), E(4), F#(6)
    const gMajorScalePitchClasses = new Set([7, 9, 11, 0, 2, 4, 6]);
    for (const pos of resultG.current) {
      expect(gMajorScalePitchClasses.has(pos.note.pitchClass)).toBe(true);
    }

    // C メジャーとは異なるポジション構成であること（F vs F#）
    // C メジャーには F(5) が含まれ、G メジャーには F#(6) が含まれる
    const gPitchClasses = new Set(resultG.current.map((p) => p.note.pitchClass));
    expect(gPitchClasses.has(6)).toBe(true); // F# がある
    expect(gPitchClasses.has(5)).toBe(false); // F がない
  });

  // 6. voicing モードでコード選択時、ボイシングのポジションのみ返す
  it("voicing モードでコード選択時、ボイシングのポジションのみ返す", async () => {
    addChord("C", "major", "diatonic", "tonic", "I", 1);
    const { result: progressionResult } = renderHook(() => useChordProgressionSnapshot());

    await act(async () => {});

    const chordId = progressionResult.current.chords[0].id;

    await act(async () => {
      selectChord(chordId);
      setDisplayMode("voicing");
    });

    const { result } = renderHook(() => useFretboardPositions());

    // ボイシングのポジションが返る（chord-tones より少ない）
    expect(result.current.length).toBeGreaterThan(0);
    // Cメジャーのオープンコードは5弦3フレットから1弦0フレットまで（5ポジション）
    expect(result.current.length).toBeLessThanOrEqual(6);
  });

  // 7. voicing モードでコード未選択時、空配列を返す
  it("voicing モードでコード未選択時、空配列を返す", async () => {
    await act(async () => {
      setDisplayMode("voicing");
    });

    const { result } = renderHook(() => useFretboardPositions());
    expect(result.current).toEqual([]);
  });

  // 8. scaleType 変更後の結果が変わる
  it("scaleType 変更後の結果が変わる", async () => {
    await act(async () => {
      setDisplayMode("scale");
    });

    const { result: resultMajor } = renderHook(() => useFretboardPositions());
    const majorPitchClasses = new Set(resultMajor.current.map((p) => p.note.pitchClass));

    await act(async () => {
      setScaleType("natural-minor");
    });

    const { result: resultMinor } = renderHook(() => useFretboardPositions());

    // C ナチュラルマイナースケールの構成音: C(0), D(2), Eb(3), F(5), G(7), Ab(8), Bb(10)
    const cMinorPitchClasses = new Set([0, 2, 3, 5, 7, 8, 10]);
    for (const pos of resultMinor.current) {
      expect(cMinorPitchClasses.has(pos.note.pitchClass)).toBe(true);
    }

    // メジャーとマイナーでは構成音が異なること
    const minorPitchClassSet = new Set(resultMinor.current.map((p) => p.note.pitchClass));
    // メジャーには E(4) があるがマイナーには Eb(3) がある
    expect(majorPitchClasses.has(4)).toBe(true);
    expect(minorPitchClassSet.has(3)).toBe(true);
  });
});
