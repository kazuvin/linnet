import { create } from "zustand";

export type FretPosition = {
  readonly string: number;
  readonly fret: number;
};

export type ChordSearchState = {
  selectedPositions: FretPosition[];
};

type ChordSearchActions = {
  togglePosition: (string: number, fret: number) => void;
  clearAll: () => void;
};

const INITIAL_STATE: ChordSearchState = {
  selectedPositions: [],
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
  clearAll: () => set({ selectedPositions: [] }),
}));

export function _resetChordSearchStoreForTesting(): void {
  useChordSearchStore.setState({ ...INITIAL_STATE });
}
