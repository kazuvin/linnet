import { proxy, useSnapshot } from "valtio";
import type { ScaleType } from "@/lib/music-theory";

export type FretboardState = {
  maxFret: number;
  selectedScaleType: ScaleType | null;
};

const MIN_FRET = 1;
const MAX_FRET = 24;

const INITIAL_STATE: FretboardState = {
  maxFret: 12,
  selectedScaleType: null,
};

const state = proxy<FretboardState>({ ...INITIAL_STATE });

export function useFretboardSnapshot() {
  return useSnapshot(state);
}

export function setMaxFret(maxFret: number): void {
  state.maxFret = Math.max(MIN_FRET, Math.min(MAX_FRET, maxFret));
}

export function setSelectedScaleType(scaleType: ScaleType | null): void {
  state.selectedScaleType = scaleType;
}

export function resetSelectedScaleType(): void {
  state.selectedScaleType = null;
}

export function _resetFretboardStoreForTesting(): void {
  Object.assign(state, INITIAL_STATE);
}
