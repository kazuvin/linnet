import { create } from "zustand";
import type { ScaleType } from "@/lib/music-theory";

export type InstrumentTab = "fretboard" | "keyboard";

export type FretboardState = {
  maxFret: number;
  selectedScaleType: ScaleType | null;
  showCharacteristicNotes: boolean;
  showAvoidNotes: boolean;
  activeInstrument: InstrumentTab;
};

type FretboardActions = {
  setMaxFret: (maxFret: number) => void;
  setSelectedScaleType: (scaleType: ScaleType | null) => void;
  resetSelectedScaleType: () => void;
  setShowCharacteristicNotes: (show: boolean) => void;
  setShowAvoidNotes: (show: boolean) => void;
  setActiveInstrument: (instrument: InstrumentTab) => void;
};

const MIN_FRET = 1;
const MAX_FRET = 24;

const INITIAL_STATE: FretboardState = {
  maxFret: 12,
  selectedScaleType: null,
  showCharacteristicNotes: true,
  showAvoidNotes: false,
  activeInstrument: "fretboard",
};

export const useFretboardStore = create<FretboardState & FretboardActions>()((set) => ({
  ...INITIAL_STATE,
  setMaxFret: (maxFret) => set({ maxFret: Math.max(MIN_FRET, Math.min(MAX_FRET, maxFret)) }),
  setSelectedScaleType: (scaleType) => set({ selectedScaleType: scaleType }),
  resetSelectedScaleType: () => set({ selectedScaleType: null }),
  setShowCharacteristicNotes: (show) => set({ showCharacteristicNotes: show }),
  setShowAvoidNotes: (show) => set({ showAvoidNotes: show }),
  setActiveInstrument: (instrument) => set({ activeInstrument: instrument }),
}));

export function _resetFretboardStoreForTesting(): void {
  useFretboardStore.setState({ ...INITIAL_STATE });
}
