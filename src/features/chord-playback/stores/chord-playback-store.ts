import { create } from "zustand";

type ChordPlaybackState = {
  isMuted: boolean;
  isPlaying: boolean;
};

type ChordPlaybackActions = {
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  setPlaying: (playing: boolean) => void;
};

const INITIAL_STATE: ChordPlaybackState = {
  isMuted: false,
  isPlaying: false,
};

export const useChordPlaybackStore = create<ChordPlaybackState & ChordPlaybackActions>()((set) => ({
  ...INITIAL_STATE,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMuted: (muted) => set({ isMuted: muted }),
  setPlaying: (playing) => set({ isPlaying: playing }),
}));

export function _resetChordPlaybackForTesting(): void {
  useChordPlaybackStore.setState({ ...INITIAL_STATE });
}
