import { create } from "zustand";
import type { PitchClass } from "@/lib/music-theory";

export type ChordSearchState = {
  selectedPitchClasses: PitchClass[];
};

type ChordSearchActions = {
  togglePitchClass: (pc: PitchClass) => void;
  clearAll: () => void;
};

const INITIAL_STATE: ChordSearchState = {
  selectedPitchClasses: [],
};

export const useChordSearchStore = create<ChordSearchState & ChordSearchActions>()((set) => ({
  ...INITIAL_STATE,
  togglePitchClass: (pc) =>
    set((state) => {
      const exists = state.selectedPitchClasses.includes(pc);
      return {
        selectedPitchClasses: exists
          ? state.selectedPitchClasses.filter((p) => p !== pc)
          : [...state.selectedPitchClasses, pc],
      };
    }),
  clearAll: () => set({ selectedPitchClasses: [] }),
}));

export function _resetChordSearchStoreForTesting(): void {
  useChordSearchStore.setState({ ...INITIAL_STATE });
}
