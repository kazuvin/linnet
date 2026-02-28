import { create } from "zustand";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import {
  deletePreset as deletePresetFromStorage,
  getPresets,
  savePreset as savePresetToStorage,
} from "../lib/grid-save-storage";
import type { GridPreset } from "../lib/types";

type GridSaveState = {
  presets: GridPreset[];
};

type GridSaveActions = {
  saveCurrentGrid: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
};

const loadInitialState = (): GridSaveState => ({
  presets: getPresets(),
});

export const useGridSaveStore = create<GridSaveState & GridSaveActions>()((set, get) => ({
  ...loadInitialState(),

  saveCurrentGrid: (name) => {
    const gridState = useChordGridStore.getState();
    const keyState = useKeyStore.getState();

    const preset: GridPreset = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      grid: {
        rows: gridState.rows,
        bpm: gridState.bpm,
      },
      key: {
        rootName: keyState.rootName,
        chordType: keyState.chordType,
        selectedMode: keyState.selectedMode,
      },
    };

    savePresetToStorage(preset);
    set({ presets: getPresets() });
  },

  loadPreset: (id) => {
    const preset = get().presets.find((p) => p.id === id);
    if (!preset) return;

    useChordGridStore.setState({
      rows: preset.grid.rows,
      bpm: preset.grid.bpm,
      isPlaying: false,
      currentRow: -1,
      currentCol: -1,
      selectedCell: null,
    });

    useKeyStore.setState({
      rootName: preset.key.rootName,
      chordType: preset.key.chordType,
      selectedMode: preset.key.selectedMode,
    });
  },

  deletePreset: (id) => {
    deletePresetFromStorage(id);
    set({ presets: getPresets() });
  },
}));

export function _resetGridSaveStoreForTesting(): void {
  useGridSaveStore.setState(loadInitialState());
}
