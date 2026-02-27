import { create } from "zustand";
import type { ChordFunction, ChordQuality, ScaleType } from "@/lib/music-theory";

export const GRID_SIZE = 16;
const MIN_BPM = 30;
const MAX_BPM = 300;
const BEAT_POSITIONS = [0, 4, 8, 12];

export type GridChord = {
  rootName: string;
  quality: ChordQuality;
  symbol: string;
  source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType;
  chordFunction: ChordFunction;
  romanNumeral: string;
  degree: number;
};

type ChordGridState = {
  bpm: number;
  cells: (GridChord | null)[];
  isPlaying: boolean;
  currentStep: number;
};

type ChordGridActions = {
  setBpm: (bpm: number) => void;
  setCell: (index: number, chord: GridChord) => void;
  clearCell: (index: number) => void;
  clearGrid: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentStep: (step: number) => void;
  stop: () => void;
  getChordAtStep: (step: number) => GridChord | null;
  addChordToNextBeat: (chord: GridChord) => void;
};

const createEmptyCells = (): (GridChord | null)[] => Array.from({ length: GRID_SIZE }, () => null);

const INITIAL_STATE: ChordGridState = {
  bpm: 120,
  cells: createEmptyCells(),
  isPlaying: false,
  currentStep: -1,
};

export const useChordGridStore = create<ChordGridState & ChordGridActions>()((set, get) => ({
  ...INITIAL_STATE,

  setBpm: (bpm) => set({ bpm: Math.max(MIN_BPM, Math.min(MAX_BPM, bpm)) }),

  setCell: (index, chord) => {
    if (index < 0 || index >= GRID_SIZE) return;
    set((state) => {
      const cells = [...state.cells];
      cells[index] = chord;
      return { cells };
    });
  },

  clearCell: (index) => {
    if (index < 0 || index >= GRID_SIZE) return;
    set((state) => {
      const cells = [...state.cells];
      cells[index] = null;
      return { cells };
    });
  },

  clearGrid: () => set({ cells: createEmptyCells(), isPlaying: false, currentStep: -1 }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setCurrentStep: (step) => set({ currentStep: step }),

  stop: () => set({ isPlaying: false, currentStep: -1 }),

  getChordAtStep: (step) => {
    const { cells } = get();
    for (let i = step; i >= 0; i--) {
      if (cells[i] !== null) return cells[i];
    }
    return null;
  },

  addChordToNextBeat: (chord) => {
    const { cells } = get();
    const nextBeat = BEAT_POSITIONS.find((pos) => cells[pos] === null);
    if (nextBeat === undefined) return;
    set((state) => {
      const newCells = [...state.cells];
      newCells[nextBeat] = chord;
      return { cells: newCells };
    });
  },
}));

export function _resetChordGridForTesting(): void {
  useChordGridStore.setState({ ...INITIAL_STATE, cells: createEmptyCells() });
}
