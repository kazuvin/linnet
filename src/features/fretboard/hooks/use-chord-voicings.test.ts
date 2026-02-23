import { act, renderHook } from "@testing-library/react";
import {
  _resetChordProgressionForTesting,
  addChord,
  selectChord,
  useChordProgressionSnapshot,
} from "@/features/chord-progression/stores/chord-progression-store";
import { _resetFretboardStoreForTesting } from "@/features/fretboard/stores/fretboard-store";
import { _resetKeyStoreForTesting } from "@/features/key-selection/stores/key-store";
import { useChordVoicings } from "./use-chord-voicings";

describe("useChordVoicings", () => {
  beforeEach(() => {
    _resetKeyStoreForTesting();
    _resetChordProgressionForTesting();
    _resetFretboardStoreForTesting();
  });

  // 1. コード未選択時、空配列を返す
  it("コード未選択時、空配列を返す", () => {
    const { result } = renderHook(() => useChordVoicings());
    expect(result.current).toEqual([]);
  });

  // 2. Cメジャー選択時、ボイシングが返る
  it("Cメジャー選択時、ボイシングが返る", async () => {
    addChord("C", "major", "diatonic", "tonic", "I", 1);
    const { result: progressionResult } = renderHook(() => useChordProgressionSnapshot());

    await act(async () => {});

    const chordId = progressionResult.current.chords[0].id;

    await act(async () => {
      selectChord(chordId);
    });

    const { result } = renderHook(() => useChordVoicings());
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current[0].chord.root.name).toBe("C");
    expect(result.current[0].chord.quality).toBe("major");
  });

  // 3. ボイシングの positions が妥当
  it("ボイシングの positions が妥当", async () => {
    addChord("C", "major", "diatonic", "tonic", "I", 1);
    const { result: progressionResult } = renderHook(() => useChordProgressionSnapshot());

    await act(async () => {});

    const chordId = progressionResult.current.chords[0].id;

    await act(async () => {
      selectChord(chordId);
    });

    const { result } = renderHook(() => useChordVoicings());
    for (const voicing of result.current) {
      expect(voicing.positions.length).toBeGreaterThanOrEqual(3);
      for (const pos of voicing.positions) {
        expect(pos.string).toBeGreaterThanOrEqual(1);
        expect(pos.string).toBeLessThanOrEqual(6);
        expect(pos.fret).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // 4. Fメジャー選択時、バレーコード情報が含まれる
  it("Fメジャー選択時、バレーコード情報が含まれる", async () => {
    addChord("F", "major", "diatonic", "subdominant", "IV", 4);
    const { result: progressionResult } = renderHook(() => useChordProgressionSnapshot());

    await act(async () => {});

    const chordId = progressionResult.current.chords[0].id;

    await act(async () => {
      selectChord(chordId);
    });

    const { result } = renderHook(() => useChordVoicings());
    expect(result.current.length).toBeGreaterThan(0);
    const hasBarreVoicing = result.current.some((v) => v.barreInfo !== undefined);
    expect(hasBarreVoicing).toBe(true);
  });

  // 5. 対応していないコード（diminished）では空配列を返す
  it("対応していないコード（diminished）では空配列を返す", async () => {
    addChord("B", "diminished", "diatonic", "dominant", "vii°", 7);
    const { result: progressionResult } = renderHook(() => useChordProgressionSnapshot());

    await act(async () => {});

    const chordId = progressionResult.current.chords[0].id;

    await act(async () => {
      selectChord(chordId);
    });

    const { result } = renderHook(() => useChordVoicings());
    expect(result.current).toEqual([]);
  });
});
