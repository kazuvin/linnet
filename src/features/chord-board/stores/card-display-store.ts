import { create } from "zustand";

export type CardDisplayOption = "tones" | "scale";

type CardDisplayState = {
  activeOptions: Set<CardDisplayOption>;
};

type CardDisplayActions = {
  toggleOption: (option: CardDisplayOption) => void;
  isOptionActive: (option: CardDisplayOption) => boolean;
};

const INITIAL_STATE: CardDisplayState = {
  activeOptions: new Set<CardDisplayOption>(),
};

export const useCardDisplayStore = create<CardDisplayState & CardDisplayActions>()((set, get) => ({
  ...INITIAL_STATE,
  toggleOption: (option) =>
    set((state) => {
      const next = new Set(state.activeOptions);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      return { activeOptions: next };
    }),
  isOptionActive: (option) => get().activeOptions.has(option),
}));

export function _resetCardDisplayStoreForTesting(): void {
  useCardDisplayStore.setState({ activeOptions: new Set<CardDisplayOption>() });
}
