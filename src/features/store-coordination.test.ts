import { act, renderHook } from "@testing-library/react";
import {
  _resetChordProgressionForTesting,
  useChordProgressionStore,
} from "@/features/chord-progression/stores/chord-progression-store";
import {
  _resetFretboardStoreForTesting,
  useFretboardStore,
} from "@/features/fretboard/stores/fretboard-store";
import { _resetKeyStoreForTesting, useKeyStore } from "@/features/key-selection/stores/key-store";
import { addAndSelectChord, changeKey, selectProgressionChord } from "./store-coordination";

describe("store-coordination", () => {
  beforeEach(() => {
    _resetKeyStoreForTesting();
    _resetChordProgressionForTesting();
    _resetFretboardStoreForTesting();
  });

  describe("changeKey", () => {
    it("rootName を変更する", async () => {
      const { result } = renderHook(() => useKeyStore());

      await act(async () => {
        changeKey("G");
      });

      expect(result.current.rootName).toBe("G");
    });

    it("プログレッション内の全コードをトランスポーズする", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        const s = useChordProgressionStore.getState();
        s.addChord("C", "major", "diatonic", "tonic", "I", 1);
        s.addChord("A", "minor", "diatonic", "tonic", "vi", 6);
      });

      await act(async () => {
        changeKey("G");
      });

      expect(result.current.chords[0].rootName).toBe("G");
      expect(result.current.chords[0].symbol).toBe("G");
      expect(result.current.chords[1].rootName).toBe("E");
      expect(result.current.chords[1].symbol).toBe("Em");
    });

    it("同じキーへの変更ではトランスポーズしない", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        useChordProgressionStore.getState().addChord("C", "major", "diatonic", "tonic", "I", 1);
      });

      await act(async () => {
        changeKey("C");
      });

      expect(result.current.chords[0].rootName).toBe("C");
    });
  });

  describe("selectProgressionChord", () => {
    it("コードを選択する", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        useChordProgressionStore.getState().addChord("C", "major", "diatonic", "tonic", "I", 1);
      });

      const chordId = result.current.chords[0].id;

      await act(async () => {
        selectProgressionChord(chordId);
      });

      expect(result.current.selectedChordId).toBe(chordId);
    });

    it("選択時にフレットボードのスケール選択をリセットする", async () => {
      const { result: fretboardResult } = renderHook(() => useFretboardStore());

      await act(async () => {
        useFretboardStore.getState().setSelectedScaleType("dorian");
      });

      expect(fretboardResult.current.selectedScaleType).toBe("dorian");

      await act(async () => {
        useChordProgressionStore.getState().addChord("C", "major", "diatonic", "tonic", "I", 1);
      });

      const { result: progressionResult } = renderHook(() => useChordProgressionStore());
      const chordId = progressionResult.current.chords[0].id;

      await act(async () => {
        selectProgressionChord(chordId);
      });

      expect(fretboardResult.current.selectedScaleType).toBeNull();
    });

    it("null で選択解除する", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        useChordProgressionStore.getState().addChord("C", "major", "diatonic", "tonic", "I", 1);
      });

      const chordId = result.current.chords[0].id;

      await act(async () => {
        selectProgressionChord(chordId);
      });

      expect(result.current.selectedChordId).toBe(chordId);

      await act(async () => {
        selectProgressionChord(null);
      });

      expect(result.current.selectedChordId).toBeNull();
    });
  });

  describe("addAndSelectChord", () => {
    it("コードを追加し、そのコードを選択状態にする", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        addAndSelectChord("C", "major", "diatonic", "tonic", "I", 1);
      });

      expect(result.current.chords).toHaveLength(1);
      expect(result.current.selectedChordId).toBe(result.current.chords[0].id);
    });

    it("追加時にフレットボードのスケール選択をリセットする", async () => {
      const { result: fretboardResult } = renderHook(() => useFretboardStore());

      await act(async () => {
        useFretboardStore.getState().setSelectedScaleType("dorian");
      });

      expect(fretboardResult.current.selectedScaleType).toBe("dorian");

      await act(async () => {
        addAndSelectChord("C", "major", "diatonic", "tonic", "I", 1);
      });

      expect(fretboardResult.current.selectedScaleType).toBeNull();
    });
  });
});
