import { create } from "zustand";
import type { ChordQuality } from "@/lib/music-theory";

export type FretPosition = {
  readonly string: number;
  readonly fret: number;
};

export type SelectedChord = {
  readonly rootName: string;
  readonly quality: ChordQuality;
};

export type ChordSearchState = {
  selectedPositions: FretPosition[];
  selectedChord: SelectedChord | null;
};

type ChordSearchActions = {
  togglePosition: (string: number, fret: number) => void;
  selectChord: (rootName: string, quality: ChordQuality) => void;
  clearAll: () => void;
};

const INITIAL_STATE: ChordSearchState = {
  selectedPositions: [],
  selectedChord: null,
};

export const useChordSearchStore = create<ChordSearchState & ChordSearchActions>()((set) => ({
  ...INITIAL_STATE,
  togglePosition: (string, fret) =>
    set((state) => {
      const exists = state.selectedPositions.some((p) => p.string === string && p.fret === fret);
      return {
        selectedPositions: exists
          ? state.selectedPositions.filter((p) => !(p.string === string && p.fret === fret))
          : [...state.selectedPositions, { string, fret }],
      };
    }),
  selectChord: (rootName, quality) =>
    set((state) => {
      const isSame =
        state.selectedChord?.rootName === rootName && state.selectedChord?.quality === quality;
      return { selectedChord: isSame ? null : { rootName, quality } };
    }),
  clearAll: () => set({ selectedPositions: [], selectedChord: null }),
}));

export function _resetChordSearchStoreForTesting(): void {
  useChordSearchStore.setState({ ...INITIAL_STATE });
}
