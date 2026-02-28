import { act, renderHook } from "@testing-library/react";
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
    _resetChordProgressionForTesting();
    _resetFretboardStoreForTesting();
    _resetChordGridForTesting();
  });

  describe("changeKey", () => {
    it("rootName を変更する", async () => {
      const { result } = renderHook(() => useKeyStore());

      await act(async () => {
        changeKey("G");
      });

      expect(result.current.rootName).toBe("G");
    });

    it("キー変更時にグリッドのコードも移調する", async () => {
      const { result: gridResult } = renderHook(() => useChordGridStore());

      // C キーで I (C) と V (G) をグリッドに配置
      await act(async () => {
        useChordGridStore.getState().setCell(0, 0, {
          rootName: "C",
          quality: "major",
          symbol: "C",
          source: "diatonic",
          chordFunction: "tonic",
          romanNumeral: "I",
          degree: 1,
        });
        useChordGridStore.getState().setCell(0, 4, {
          rootName: "G",
          quality: "major",
          symbol: "G",
          source: "diatonic",
          chordFunction: "dominant",
          romanNumeral: "V",
          degree: 5,
        });
      });

      // G キーに変更
      await act(async () => {
        changeKey("G");
      });

      // I → G, V → D に移調される
      expect(gridResult.current.rows[0][0]?.rootName).toBe("G");
      expect(gridResult.current.rows[0][0]?.quality).toBe("major");
      expect(gridResult.current.rows[0][4]?.rootName).toBe("D");
      expect(gridResult.current.rows[0][4]?.quality).toBe("major");
    });

    it("グリッドが空の場合でもエラーにならない", async () => {
      await act(async () => {
        changeKey("G");
      });

      expect(useKeyStore.getState().rootName).toBe("G");
    });

    it("null セルはスキップして移調される", async () => {
      const { result: gridResult } = renderHook(() => useChordGridStore());

      await act(async () => {
        useChordGridStore.getState().setCell(0, 4, {
          rootName: "D",
          quality: "minor",
          symbol: "Dm",
          source: "diatonic",
          chordFunction: "subdominant",
          romanNumeral: "ii",
          degree: 2,
        });
      });

      await act(async () => {
        changeKey("G");
      });

      // セル 0,0 は null のまま
      expect(gridResult.current.rows[0][0]).toBeNull();
      // ii → Am
      expect(gridResult.current.rows[0][4]?.rootName).toBe("A");
      expect(gridResult.current.rows[0][4]?.quality).toBe("minor");
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
