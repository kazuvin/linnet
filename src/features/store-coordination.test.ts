import { act, renderHook } from "@testing-library/react";
import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import {
  _resetChordGridForTesting,
  useChordGridStore,
} from "@/features/chord-grid/stores/chord-grid-store";
import {
  _resetChordProgressionForTesting,
  useChordProgressionStore,
} from "@/features/chord-progression/stores/chord-progression-store";
import {
  _resetFretboardStoreForTesting,
  useFretboardStore,
} from "@/features/fretboard/stores/fretboard-store";
import { _resetKeyStoreForTesting, useKeyStore } from "@/features/key-selection/stores/key-store";
import { changeKey, selectChordFromPalette } from "./store-coordination";

describe("store-coordination", () => {
  beforeEach(() => {
    _resetKeyStoreForTesting();
    _resetChordGridForTesting();
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

    it("グリッドのコードもトランスポーズされる（C→G）", async () => {
      const chordI: GridChord = {
        rootName: "C",
        quality: "major",
        symbol: "C",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "I",
        degree: 1,
      };
      const chordV: GridChord = {
        rootName: "G",
        quality: "major",
        symbol: "G",
        source: "diatonic",
        chordFunction: "dominant",
        romanNumeral: "V",
        degree: 5,
      };

      await act(async () => {
        useChordGridStore.getState().setCell(0, 0, chordI);
        useChordGridStore.getState().setCell(0, 4, chordV);
      });

      const { result: gridResult } = renderHook(() => useChordGridStore());

      await act(async () => {
        changeKey("G");
      });

      expect(gridResult.current.rows[0][0]?.rootName).toBe("G");
      expect(gridResult.current.rows[0][0]?.symbol).toBe("G");
      expect(gridResult.current.rows[0][4]?.rootName).toBe("D");
      expect(gridResult.current.rows[0][4]?.symbol).toBe("D");
    });

    it("グリッドが空の場合はエラーなく動作する", async () => {
      const { result: gridResult } = renderHook(() => useChordGridStore());

      await act(async () => {
        changeKey("G");
      });

      expect(gridResult.current.rows[0].every((c) => c === null)).toBe(true);
    });

    it("キー変更時に選択中セルが解除される", async () => {
      const chord: GridChord = {
        rootName: "C",
        quality: "major",
        symbol: "C",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "I",
        degree: 1,
      };

      await act(async () => {
        useChordGridStore.getState().setCell(0, 0, chord);
        useChordGridStore.getState().selectCell(0, 0);
      });

      const { result: gridResult } = renderHook(() => useChordGridStore());
      expect(gridResult.current.selectedCell).toEqual({ row: 0, col: 0 });

      await act(async () => {
        changeKey("G");
      });

      expect(gridResult.current.selectedCell).toBeNull();
    });
  });

  describe("selectChordFromPalette", () => {
    it("コードを選択すると activeChordOverride にセットされる", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        selectChordFromPalette("C", "major", "diatonic", "tonic", "I", 1);
      });

      expect(result.current.activeChordOverride).not.toBeNull();
      expect(result.current.activeChordOverride?.rootName).toBe("C");
      expect(result.current.activeChordOverride?.quality).toBe("major");
    });

    it("同じコードを再度選択すると選択解除される（トグル）", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        selectChordFromPalette("C", "major", "diatonic", "tonic", "I", 1);
      });

      expect(result.current.activeChordOverride).not.toBeNull();

      await act(async () => {
        selectChordFromPalette("C", "major", "diatonic", "tonic", "I", 1);
      });

      expect(result.current.activeChordOverride).toBeNull();
    });

    it("異なるコードを選択すると activeChordOverride が更新される", async () => {
      const { result } = renderHook(() => useChordProgressionStore());

      await act(async () => {
        selectChordFromPalette("C", "major", "diatonic", "tonic", "I", 1);
      });

      expect(result.current.activeChordOverride?.rootName).toBe("C");

      await act(async () => {
        selectChordFromPalette("G", "major", "diatonic", "dominant", "V", 5);
      });

      expect(result.current.activeChordOverride?.rootName).toBe("G");
      expect(result.current.activeChordOverride?.quality).toBe("major");
    });

    it("選択時にフレットボードのスケール選択をリセットする", async () => {
      const { result: fretboardResult } = renderHook(() => useFretboardStore());

      await act(async () => {
        useFretboardStore.getState().setSelectedScaleType("dorian");
      });

      expect(fretboardResult.current.selectedScaleType).toBe("dorian");

      await act(async () => {
        selectChordFromPalette("C", "major", "diatonic", "tonic", "I", 1);
      });

      expect(fretboardResult.current.selectedScaleType).toBeNull();
    });
  });
});
