import { act, renderHook } from "@testing-library/react";
import {
  _resetChordProgressionForTesting,
  useChordProgressionStore,
} from "@/features/chord-progression/stores/chord-progression-store";
import {
  _resetFretboardStoreForTesting,
  useFretboardStore,
} from "@/features/fretboard/stores/fretboard-store";
import { _resetKeyStoreForTesting } from "@/features/key-selection/stores/key-store";
import { useFretboardPositions } from "./use-fretboard-positions";

describe("useFretboardPositions", () => {
  beforeEach(() => {
    _resetKeyStoreForTesting();
    _resetChordProgressionForTesting();
    _resetFretboardStoreForTesting();
  });

  // 1. コード未選択の場合、空配列を返す
  it("コード未選択の場合、空配列を返す", () => {
    const { result } = renderHook(() => useFretboardPositions());
    expect(result.current).toEqual([]);
  });

  // 2. diatonicコード選択時、メジャースケール + コード構成音のオーバーレイを返す
  it("diatonicコード選択時、メジャースケール + コード構成音のオーバーレイを返す", async () => {
    await act(async () => {
      useChordProgressionStore.getState().setActiveChordOverride({
        id: "test-c-major",
        rootName: "C",
        quality: "major",
        symbol: "C",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "I",
        degree: 1,
      });
    });

    const { result } = renderHook(() => useFretboardPositions());

    // ポジションが空でないこと
    expect(result.current.length).toBeGreaterThan(0);

    // roleプロパティが存在すること
    for (const pos of result.current) {
      expect(["scale", "chord-tone", "chord-root"]).toContain(pos.role);
    }

    // C majorの構成音（C=0, E=4, G=7）はchord-rootまたはchord-tone
    const chordPositions = result.current.filter(
      (p) => p.role === "chord-root" || p.role === "chord-tone"
    );
    const chordPCs = new Set(chordPositions.map((p) => p.note.pitchClass));
    expect(chordPCs.has(0)).toBe(true); // C
    expect(chordPCs.has(4)).toBe(true); // E
    expect(chordPCs.has(7)).toBe(true); // G

    // ルートポジションはchord-root
    const rootPositions = result.current.filter((p) => p.role === "chord-root");
    for (const pos of rootPositions) {
      expect(pos.note.pitchClass).toBe(0); // C
    }

    // スケール音（D,F,A,B）はscale
    const scalePositions = result.current.filter((p) => p.role === "scale");
    const scalePCs = new Set(scalePositions.map((p) => p.note.pitchClass));
    expect(scalePCs.has(2)).toBe(true); // D
    expect(scalePCs.has(5)).toBe(true); // F
    expect(scalePCs.has(9)).toBe(true); // A
    expect(scalePCs.has(11)).toBe(true); // B
  });

  // 3. modal interchange コード選択時、対応するモードスケールのオーバーレイを返す
  it("natural-minor sourceのコード選択時、ナチュラルマイナースケールのオーバーレイを返す", async () => {
    await act(async () => {
      useChordProgressionStore.getState().setActiveChordOverride({
        id: "test-eb-major7",
        rootName: "Eb",
        quality: "major7",
        symbol: "EbM7",
        source: "natural-minor",
        chordFunction: "tonic",
        romanNumeral: "III",
        degree: 3,
      });
    });

    const { result } = renderHook(() => useFretboardPositions());

    expect(result.current.length).toBeGreaterThan(0);

    // Eb(3)がchord-rootであること
    const rootPositions = result.current.filter((p) => p.role === "chord-root");
    for (const pos of rootPositions) {
      expect(pos.note.pitchClass).toBe(3); // Eb
    }

    // C natural minor scale: C(0), D(2), Eb(3), F(5), G(7), Ab(8), Bb(10)
    // Eb M7構成音: Eb(3), G(7), Bb(10), D(2)
    // スケールのみの音: C(0), F(5), Ab(8)
    const scalePositions = result.current.filter((p) => p.role === "scale");
    const scalePCs = new Set(scalePositions.map((p) => p.note.pitchClass));
    expect(scalePCs.has(0)).toBe(true); // C
    expect(scalePCs.has(5)).toBe(true); // F
    expect(scalePCs.has(8)).toBe(true); // Ab
  });

  // 4. maxFret の変更がポジション数に影響する
  it("maxFret の変更がポジション数に影響する", async () => {
    await act(async () => {
      useChordProgressionStore.getState().setActiveChordOverride({
        id: "test-c-major",
        rootName: "C",
        quality: "major",
        symbol: "C",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "I",
        degree: 1,
      });
    });

    await act(async () => {
      useFretboardStore.getState().setMaxFret(3);
    });

    const { result: result3 } = renderHook(() => useFretboardPositions());
    const countAt3 = result3.current.length;

    await act(async () => {
      useFretboardStore.getState().setMaxFret(12);
    });

    const { result: result12 } = renderHook(() => useFretboardPositions());
    const countAt12 = result12.current.length;

    expect(countAt12).toBeGreaterThan(countAt3);
  });

  // 5. activeChordOverride を変更すると結果が変わる
  it("activeChordOverride 変更後の結果が変わる", async () => {
    await act(async () => {
      useChordProgressionStore.getState().setActiveChordOverride({
        id: "test-c-major",
        rootName: "C",
        quality: "major",
        symbol: "C",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "I",
        degree: 1,
      });
    });

    const { result: resultC } = renderHook(() => useFretboardPositions());
    expect(resultC.current.length).toBeGreaterThan(0);

    // G majorに変更
    await act(async () => {
      useChordProgressionStore.getState().setActiveChordOverride({
        id: "test-g-major",
        rootName: "G",
        quality: "major",
        symbol: "G",
        source: "diatonic",
        chordFunction: "dominant",
        romanNumeral: "V",
        degree: 5,
      });
    });

    const { result: resultG } = renderHook(() => useFretboardPositions());

    // G mixolydian (degree 5): G(7), A(9), B(11), C(0), D(2), E(4), F(5)
    const allPCs = new Set(resultG.current.map((p) => p.note.pitchClass));
    expect(allPCs.has(7)).toBe(true); // G
    expect(allPCs.has(5)).toBe(true); // F (mixolydian)
  });
});
