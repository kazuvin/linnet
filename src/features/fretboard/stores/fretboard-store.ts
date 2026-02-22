import { proxy, useSnapshot } from "valtio";
import type { ScaleType } from "@/lib/music-theory";

export type FretboardDisplayMode = "chord-tones" | "scale";

export type FretboardState = {
  displayMode: FretboardDisplayMode;
  scaleType: ScaleType;
  maxFret: number;
};

const MIN_FRET = 1;
const MAX_FRET = 24;

const INITIAL_STATE: FretboardState = {
  displayMode: "chord-tones",
  scaleType: "major",
  maxFret: 12,
};

const state = proxy<FretboardState>({ ...INITIAL_STATE });

export function useFretboardSnapshot() {
  return useSnapshot(state);
}

export function setDisplayMode(mode: FretboardDisplayMode): void {
  state.displayMode = mode;
}

export function setScaleType(scaleType: ScaleType): void {
  state.scaleType = scaleType;
}

export function setMaxFret(maxFret: number): void {
  state.maxFret = Math.max(MIN_FRET, Math.min(MAX_FRET, maxFret));
}

export function _resetFretboardStoreForTesting(): void {
  Object.assign(state, INITIAL_STATE);
}
