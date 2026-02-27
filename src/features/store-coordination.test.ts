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
import { changeKey, selectChordFromPalette } from "./store-coordination";

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
