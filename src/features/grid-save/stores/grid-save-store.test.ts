import { act, renderHook } from "@testing-library/react";
import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import {
  _resetChordGridForTesting,
  useChordGridStore,
} from "@/features/chord-grid/stores/chord-grid-store";
import { _resetKeyStoreForTesting, useKeyStore } from "@/features/key-selection/stores/key-store";
import { _resetGridSaveStoreForTesting, useGridSaveStore } from "./grid-save-store";

const STORAGE_KEY = "linnet:grid-presets";

const sampleChord: GridChord = {
  rootName: "C",
  quality: "major7",
  symbol: "Cmaj7",
  source: "diatonic",
  chordFunction: "tonic",
  romanNumeral: "I",
  degree: 1,
};

describe("grid-save-store", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetGridSaveStoreForTesting();
    _resetChordGridForTesting();
    _resetKeyStoreForTesting();
  });

  describe("初期状態", () => {
    it("presets は空配列", () => {
      const { result } = renderHook(() => useGridSaveStore());
      expect(result.current.presets).toEqual([]);
    });

    it("localStorage にデータがある場合はそれを読み込む", () => {
      const preset = {
        id: "existing-id",
        name: "既存の進行",
        createdAt: 1000,
        grid: { rows: [[null]], bpm: 100 },
        key: { rootName: "G", chordType: "seventh" as const, selectedMode: "diatonic" as const },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([preset]));
      _resetGridSaveStoreForTesting();

      const { result } = renderHook(() => useGridSaveStore());
      expect(result.current.presets).toEqual([preset]);
    });
  });

  describe("saveCurrentGrid", () => {
    it("現在のグリッドとキーの状態をプリセットとして保存できる", async () => {
      // グリッドにコードを配置
      await act(async () => {
        useChordGridStore.getState().setCell(0, 0, sampleChord);
        useChordGridStore.getState().setBpm(140);
      });
      // キーを変更
      await act(async () => {
        useKeyStore.getState().setRootName("G");
        useKeyStore.getState().setChordType("seventh");
      });

      await act(async () => {
        useGridSaveStore.getState().saveCurrentGrid("マイ進行");
      });

      const { result } = renderHook(() => useGridSaveStore());
      expect(result.current.presets).toHaveLength(1);
      expect(result.current.presets[0].name).toBe("マイ進行");
      expect(result.current.presets[0].grid.bpm).toBe(140);
      expect(result.current.presets[0].grid.rows[0][0]).toEqual(sampleChord);
      expect(result.current.presets[0].key.rootName).toBe("G");
      expect(result.current.presets[0].key.chordType).toBe("seventh");
    });

    it("保存後に localStorage にも永続化される", async () => {
      await act(async () => {
        useGridSaveStore.getState().saveCurrentGrid("テスト");
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe("テスト");
    });
  });

  describe("loadPreset", () => {
    it("プリセットのグリッドデータを復元できる", async () => {
      // 保存
      await act(async () => {
        useChordGridStore.getState().setCell(0, 0, sampleChord);
        useChordGridStore.getState().setBpm(160);
        useKeyStore.getState().setRootName("D");
        useKeyStore.getState().setChordType("seventh");
        useKeyStore.getState().setSelectedMode("secondary-dominant");
      });
      await act(async () => {
        useGridSaveStore.getState().saveCurrentGrid("復元テスト");
      });

      const presetId = useGridSaveStore.getState().presets[0].id;

      // グリッドをリセット
      await act(async () => {
        _resetChordGridForTesting();
        _resetKeyStoreForTesting();
      });

      // 復元
      await act(async () => {
        useGridSaveStore.getState().loadPreset(presetId);
      });

      expect(useChordGridStore.getState().bpm).toBe(160);
      expect(useChordGridStore.getState().rows[0][0]).toEqual(sampleChord);
      expect(useKeyStore.getState().rootName).toBe("D");
      expect(useKeyStore.getState().chordType).toBe("seventh");
      expect(useKeyStore.getState().selectedMode).toBe("secondary-dominant");
    });

    it("存在しない ID を指定しても何も起こらない", async () => {
      await act(async () => {
        useGridSaveStore.getState().loadPreset("non-existent");
      });

      // 初期状態のまま
      expect(useChordGridStore.getState().bpm).toBe(120);
      expect(useKeyStore.getState().rootName).toBe("C");
    });
  });

  describe("deletePreset", () => {
    it("指定した ID のプリセットを削除できる", async () => {
      await act(async () => {
        useGridSaveStore.getState().saveCurrentGrid("進行1");
        useGridSaveStore.getState().saveCurrentGrid("進行2");
      });

      const { result } = renderHook(() => useGridSaveStore());
      expect(result.current.presets).toHaveLength(2);

      const idToDelete = result.current.presets[0].id;
      await act(async () => {
        useGridSaveStore.getState().deletePreset(idToDelete);
      });

      expect(result.current.presets).toHaveLength(1);
      expect(result.current.presets[0].name).toBe("進行2");
    });

    it("削除後に localStorage も更新される", async () => {
      await act(async () => {
        useGridSaveStore.getState().saveCurrentGrid("テスト");
      });

      const id = useGridSaveStore.getState().presets[0].id;
      await act(async () => {
        useGridSaveStore.getState().deletePreset(id);
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(stored).toEqual([]);
    });
  });
});
