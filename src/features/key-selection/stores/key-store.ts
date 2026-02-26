import { create } from "zustand";
import type { CategoryId, ScaleType } from "@/lib/music-theory";

export type SelectedMode =
  | "diatonic"
  | "secondary-dominant"
  | "tritone-substitution"
  | ScaleType
  | `category:${CategoryId}`;

type KeyState = {
  rootName: string;
  chordType: "triad" | "seventh";
  selectedMode: SelectedMode;
};

type KeyActions = {
  setRootName: (rootName: string) => void;
  setChordType: (chordType: "triad" | "seventh") => void;
  setSelectedMode: (mode: SelectedMode) => void;
};

const INITIAL_STATE: KeyState = {
  rootName: "C",
  chordType: "triad",
  selectedMode: "diatonic",
};

export const useKeyStore = create<KeyState & KeyActions>()((set) => ({
  ...INITIAL_STATE,
  setRootName: (rootName) => set({ rootName }),
  setChordType: (chordType) => set({ chordType }),
  setSelectedMode: (mode) => set({ selectedMode: mode }),
}));

export function _resetKeyStoreForTesting(): void {
  useKeyStore.setState({ ...INITIAL_STATE });
}
