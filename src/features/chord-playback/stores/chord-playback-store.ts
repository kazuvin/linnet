import { create } from "zustand";

export type ChordPlaybackState = {
  isMuted: boolean;
  isPlaying: boolean;
};

const INITIAL_STATE: ChordPlaybackState = {
  isMuted: false,
  isPlaying: false,
};

const useChordPlaybackStore = create<ChordPlaybackState>()(() => ({
  ...INITIAL_STATE,
}));

export function useChordPlaybackSnapshot() {
  return useChordPlaybackStore();
}

export function toggleMute(): void {
  useChordPlaybackStore.setState((state) => ({ isMuted: !state.isMuted }));
}

export function setMuted(muted: boolean): void {
  useChordPlaybackStore.setState({ isMuted: muted });
}

export function setPlaying(playing: boolean): void {
  useChordPlaybackStore.setState({ isPlaying: playing });
}

export function getIsMuted(): boolean {
  return useChordPlaybackStore.getState().isMuted;
}

export function _resetChordPlaybackForTesting(): void {
  useChordPlaybackStore.setState({ ...INITIAL_STATE });
}
