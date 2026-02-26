import { create } from "zustand";
import type { ScaleType } from "@/lib/music-theory";

export type FretboardState = {
  maxFret: number;
  selectedScaleType: ScaleType | null;
  showCharacteristicNotes: boolean;
  showAvoidNotes: boolean;
};

const MIN_FRET = 1;
const MAX_FRET = 24;

const INITIAL_STATE: FretboardState = {
  maxFret: 12,
  selectedScaleType: null,
  showCharacteristicNotes: true,
  showAvoidNotes: false,
};

const useFretboardStore = create<FretboardState>()(() => ({ ...INITIAL_STATE }));

export function useFretboardSnapshot() {
  return useFretboardStore();
}

export function setMaxFret(maxFret: number): void {
  useFretboardStore.setState({ maxFret: Math.max(MIN_FRET, Math.min(MAX_FRET, maxFret)) });
}

export function setSelectedScaleType(scaleType: ScaleType | null): void {
  useFretboardStore.setState({ selectedScaleType: scaleType });
}

export function resetSelectedScaleType(): void {
  useFretboardStore.setState({ selectedScaleType: null });
}

export function setShowCharacteristicNotes(show: boolean): void {
  useFretboardStore.setState({ showCharacteristicNotes: show });
}

export function setShowAvoidNotes(show: boolean): void {
  useFretboardStore.setState({ showAvoidNotes: show });
}

export function _resetFretboardStoreForTesting(): void {
  useFretboardStore.setState({ ...INITIAL_STATE });
}
