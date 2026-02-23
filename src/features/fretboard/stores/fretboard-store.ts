import { proxy, useSnapshot } from "valtio";

export type FretboardState = {
  maxFret: number;
};

const MIN_FRET = 1;
const MAX_FRET = 24;

const INITIAL_STATE: FretboardState = {
  maxFret: 12,
};

const state = proxy<FretboardState>({ ...INITIAL_STATE });

export function useFretboardSnapshot() {
  return useSnapshot(state);
}

export function setMaxFret(maxFret: number): void {
  state.maxFret = Math.max(MIN_FRET, Math.min(MAX_FRET, maxFret));
}

export function _resetFretboardStoreForTesting(): void {
  Object.assign(state, INITIAL_STATE);
}
