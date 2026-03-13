import { create } from "zustand";
import type { ScaleType } from "@/lib/music-theory";

export type InstrumentTab = "fretboard" | "keyboard";

export const MAX_FRET = 24;

export type FretboardState = {
  selectedScaleType: ScaleType | null;
  showCharacteristicNotes: boolean;
  showAvoidNotes: boolean;
  activeInstrument: InstrumentTab;
};

type FretboardActions = {
  setSelectedScaleType: (scaleType: ScaleType | null) => void;
  resetSelectedScaleType: () => void;
  setShowCharacteristicNotes: (show: boolean) => void;
  setShowAvoidNotes: (show: boolean) => void;
  setActiveInstrument: (instrument: InstrumentTab) => void;
};

const INITIAL_STATE: FretboardState = {
  selectedScaleType: null,
  showCharacteristicNotes: true,
  showAvoidNotes: false,
  activeInstrument: "fretboard",
};

export const useFretboardStore = create<FretboardState & FretboardActions>()((set) => ({
  ...INITIAL_STATE,
  setSelectedScaleType: (scaleType) => set({ selectedScaleType: scaleType }),
  resetSelectedScaleType: () => set({ selectedScaleType: null }),
  setShowCharacteristicNotes: (show) => set({ showCharacteristicNotes: show }),
  setShowAvoidNotes: (show) => set({ showAvoidNotes: show }),
  setActiveInstrument: (instrument) => set({ activeInstrument: instrument }),
}));

export function _resetFretboardStoreForTesting(): void {
  useFretboardStore.setState({ ...INITIAL_STATE });
}
