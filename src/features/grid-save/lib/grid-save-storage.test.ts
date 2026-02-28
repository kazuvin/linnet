import { deletePreset, getPresets, savePreset } from "./grid-save-storage";
import type { GridPreset } from "./types";

const STORAGE_KEY = "linnet:grid-presets";

const createPreset = (overrides: Partial<GridPreset> = {}): GridPreset => ({
  id: "test-id-1",
  name: "テスト進行",
  createdAt: 1000,
  grid: {
    rows: [[null, null]],
    bpm: 120,
  },
  key: {
    rootName: "C",
    chordType: "triad",
    selectedMode: "diatonic",
  },
  ...overrides,
});

describe("grid-save-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getPresets", () => {
    it("localStorage が空の場合は空配列を返す", () => {
      expect(getPresets()).toEqual([]);
    });

    it("localStorage に保存されたプリセットを返す", () => {
      const presets = [createPreset()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
      expect(getPresets()).toEqual(presets);
    });

    it("不正な JSON の場合は空配列を返す", () => {
      localStorage.setItem(STORAGE_KEY, "invalid json{{{");
      expect(getPresets()).toEqual([]);
    });

    it("配列でない値の場合は空配列を返す", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: "array" }));
      expect(getPresets()).toEqual([]);
    });
  });

  describe("savePreset", () => {
    it("新しいプリセットを保存できる", () => {
      const preset = createPreset();
      savePreset(preset);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(stored).toEqual([preset]);
    });

    it("既存のプリセットに追加できる", () => {
      const preset1 = createPreset({ id: "id-1", name: "進行1" });
      const preset2 = createPreset({ id: "id-2", name: "進行2" });
      savePreset(preset1);
      savePreset(preset2);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(stored).toHaveLength(2);
      expect(stored[0]).toEqual(preset1);
      expect(stored[1]).toEqual(preset2);
    });
  });

  describe("deletePreset", () => {
    it("指定した ID のプリセットを削除できる", () => {
      const preset1 = createPreset({ id: "id-1" });
      const preset2 = createPreset({ id: "id-2" });
      savePreset(preset1);
      savePreset(preset2);

      deletePreset("id-1");
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(stored).toEqual([preset2]);
    });

    it("存在しない ID を指定しても何も起こらない", () => {
      const preset = createPreset();
      savePreset(preset);

      deletePreset("non-existent");
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(stored).toEqual([preset]);
    });
  });
});
