import { create } from "zustand";
import type { ChordFunction, ChordQuality, ScaleType } from "@/lib/music-theory";

export const COLUMNS = 16;
const MIN_BPM = 30;
const MAX_BPM = 300;

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
  rows: (GridChord | null)[][];
  isPlaying: boolean;
  currentRow: number;
  currentCol: number;
  selectedCell: { row: number; col: number } | null;
};

type ChordGridActions = {
  setBpm: (bpm: number) => void;
  setCell: (row: number, col: number, chord: GridChord) => void;
  clearCell: (row: number, col: number) => void;
  clearGrid: () => void;
  addRow: () => void;
  removeRow: (rowIndex: number) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentPosition: (row: number, col: number) => void;
  stop: () => void;
  getChordAtPosition: (row: number, col: number) => GridChord | null;
  addChordToNextBeat: (chord: GridChord) => void;
  selectCell: (row: number, col: number) => void;
  clearSelection: () => void;
};

const createEmptyRow = (): (GridChord | null)[] => Array.from({ length: COLUMNS }, () => null);

const INITIAL_STATE: ChordGridState = {
  bpm: 120,
  rows: [createEmptyRow()],
  isPlaying: false,
  currentRow: -1,
  currentCol: -1,
  selectedCell: null,
};

export const useChordGridStore = create<ChordGridState & ChordGridActions>()((set, get) => ({
  ...INITIAL_STATE,

  setBpm: (bpm) => set({ bpm: Math.max(MIN_BPM, Math.min(MAX_BPM, bpm)) }),

  setCell: (row, col, chord) => {
    const { rows } = get();
    if (row < 0 || row >= rows.length || col < 0 || col >= COLUMNS) return;
    const isLastRow = row === rows.length - 1;
    set((state) => {
      const newRows = state.rows.map((r) => [...r]);
      newRows[row][col] = chord;
      if (isLastRow) {
        newRows.push(createEmptyRow());
      }
      return { rows: newRows };
    });
  },

  clearCell: (row, col) => {
    const { rows, selectedCell } = get();
    if (row < 0 || row >= rows.length || col < 0 || col >= COLUMNS) return;
    const clearSelected = selectedCell?.row === row && selectedCell?.col === col;
    set((state) => {
      const newRows = state.rows.map((r) => [...r]);
      newRows[row][col] = null;
      return { rows: newRows, ...(clearSelected ? { selectedCell: null } : {}) };
    });
  },

  clearGrid: () =>
    set({
      rows: [createEmptyRow()],
      isPlaying: false,
      currentRow: -1,
      currentCol: -1,
      selectedCell: null,
    }),

  addRow: () =>
    set((state) => ({
      rows: [...state.rows, createEmptyRow()],
    })),

  removeRow: (rowIndex) =>
    set((state) => {
      if (state.rows.length <= 1) return state;
      const newRows = state.rows.filter((_, i) => i !== rowIndex);
      const clearSelected = state.selectedCell?.row === rowIndex;
      return { rows: newRows, ...(clearSelected ? { selectedCell: null } : {}) };
    }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setCurrentPosition: (row, col) => set({ currentRow: row, currentCol: col }),

  stop: () => set({ isPlaying: false, currentRow: -1, currentCol: -1 }),

  getChordAtPosition: (row, col) => {
    const { rows } = get();
    if (row < 0 || row >= rows.length) return null;
    const rowCells = rows[row];
    for (let i = col; i >= 0; i--) {
      if (rowCells[i] !== null) return rowCells[i];
    }
    // 現在の行に見つからない場合、前の行の末尾から探す
    for (let r = row - 1; r >= 0; r--) {
      for (let c = COLUMNS - 1; c >= 0; c--) {
        if (rows[r][c] !== null) return rows[r][c];
      }
    }
    return null;
  },

  addChordToNextBeat: (chord) => {
    const { rows } = get();
    const beatPositions = [0, 4, 8, 12];
    for (let r = 0; r < rows.length; r++) {
      const nextBeat = beatPositions.find((pos) => rows[r][pos] === null);
      if (nextBeat !== undefined) {
        const isLastRow = r === rows.length - 1;
        set((state) => {
          const newRows = state.rows.map((row) => [...row]);
          newRows[r][nextBeat] = chord;
          if (isLastRow) {
            newRows.push(createEmptyRow());
          }
          return { rows: newRows };
        });
        return;
      }
    }
  },

  selectCell: (row, col) => {
    const { rows, selectedCell } = get();
    if (row < 0 || row >= rows.length || col < 0 || col >= COLUMNS) return;
    if (rows[row][col] === null) return;
    if (selectedCell?.row === row && selectedCell?.col === col) {
      set({ selectedCell: null });
    } else {
      set({ selectedCell: { row, col } });
    }
  },

  clearSelection: () => set({ selectedCell: null }),
}));

export function _resetChordGridForTesting(): void {
  useChordGridStore.setState({ ...INITIAL_STATE, rows: [createEmptyRow()], selectedCell: null });
}
