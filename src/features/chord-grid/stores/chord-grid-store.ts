import { create } from "zustand";
import type { ChordFunction, ChordQuality, ScaleType } from "@/lib/music-theory";

export const COLUMNS = 16;
export const INITIAL_ROWS = 4;
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
  getPlayableRowCount: () => number;
  addChordToNextBeat: (chord: GridChord) => void;
  selectCell: (row: number, col: number) => void;
  clearSelection: () => void;
};

const createEmptyRow = (): (GridChord | null)[] => Array.from({ length: COLUMNS }, () => null);

const INITIAL_STATE: ChordGridState = {
  bpm: 120,
  rows: Array.from({ length: INITIAL_ROWS }, () => createEmptyRow()),
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
      rows: Array.from({ length: INITIAL_ROWS }, () => createEmptyRow()),
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
    // 現在位置から最大15セル前まで遡り、コードを探す（16セル固定持続）
    const totalPos = row * COLUMNS + col;
    for (let offset = 0; offset < COLUMNS; offset++) {
      const pos = totalPos - offset;
      if (pos < 0) break;
      const r = Math.floor(pos / COLUMNS);
      const c = pos % COLUMNS;
      if (r < rows.length && rows[r][c] !== null) return rows[r][c];
    }
    return null;
  },

  getPlayableRowCount: () => {
    const { rows } = get();
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].some((c) => c !== null)) return i + 1;
    }
    return 0;
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
    if (selectedCell?.row === row && selectedCell?.col === col) {
      set({ selectedCell: null });
    } else {
      set({ selectedCell: { row, col } });
    }
  },

  clearSelection: () => set({ selectedCell: null }),
}));

export function _resetChordGridForTesting(): void {
  useChordGridStore.setState({
    ...INITIAL_STATE,
    rows: Array.from({ length: INITIAL_ROWS }, () => createEmptyRow()),
    selectedCell: null,
  });
}
