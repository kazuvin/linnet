import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import type { SelectedMode } from "@/features/key-selection/stores/key-store";

export type GridPreset = {
  id: string;
  name: string;
  createdAt: number;
  grid: {
    rows: (GridChord | null)[][];
    bpm: number;
  };
  key: {
    rootName: string;
    chordType: "triad" | "seventh";
    selectedMode: SelectedMode;
  };
};
