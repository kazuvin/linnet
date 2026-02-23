import { proxy, useSnapshot } from "valtio";

export type ChordPlaybackState = {
  isMuted: boolean;
  isPlaying: boolean;
};

const INITIAL_STATE: ChordPlaybackState = {
  isMuted: false,
  isPlaying: false,
};

const state = proxy<ChordPlaybackState>({ ...INITIAL_STATE });

export function useChordPlaybackSnapshot() {
  return useSnapshot(state);
}

export function toggleMute(): void {
  state.isMuted = !state.isMuted;
}

export function setMuted(muted: boolean): void {
  state.isMuted = muted;
}

export function setPlaying(playing: boolean): void {
  state.isPlaying = playing;
}

export function getIsMuted(): boolean {
  return state.isMuted;
}

export function _resetChordPlaybackForTesting(): void {
  Object.assign(state, INITIAL_STATE);
}
