import { create } from "zustand";
import type { ChordFunction, ChordQuality, ChordSource, ScaleType } from "@/lib/music-theory";
import { getDefaultScaleForSource } from "@/lib/music-theory";

export const COLUMNS = 16;
export const INITIAL_ROWS = 4;
const MIN_BPM = 30;
const MAX_BPM = 300;

export type GridChord = {
  rootName: string;
  quality: ChordQuality;
  symbol: string;
  source: ChordSource;
  chordFunction: ChordFunction;
  romanNumeral: string;
  degree: number;
};

type ChordGridState = {
  bpm: number;
  rows: (GridChord | null)[][];
  cellScales: (ScaleType | null)[][];
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
  moveSelection: (direction: "up" | "down" | "left" | "right") => void;
  setCellScale: (row: number, col: number, scaleType: ScaleType | null) => void;
  getCellScale: (row: number, col: number) => ScaleType | null;
};

const createEmptyRow = (): (GridChord | null)[] => Array.from({ length: COLUMNS }, () => null);
const createEmptyScaleRow = (): (ScaleType | null)[] => Array.from({ length: COLUMNS }, () => null);

const INITIAL_STATE: ChordGridState = {
  bpm: 120,
  rows: Array.from({ length: INITIAL_ROWS }, () => createEmptyRow()),
  cellScales: Array.from({ length: INITIAL_ROWS }, () => createEmptyScaleRow()),
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
    const defaultScale = getDefaultScaleForSource(chord.source, chord.degree);
    set((state) => {
      const newRows = state.rows.map((r) => [...r]);
      const newScales = state.cellScales.map((r) => [...r]);
      newRows[row][col] = chord;
      newScales[row][col] = defaultScale;
      if (isLastRow) {
        newRows.push(createEmptyRow());
        newScales.push(createEmptyScaleRow());
      }
      return { rows: newRows, cellScales: newScales };
    });
  },

  clearCell: (row, col) => {
    const { rows, selectedCell } = get();
    if (row < 0 || row >= rows.length || col < 0 || col >= COLUMNS) return;
    const clearSelected = selectedCell?.row === row && selectedCell?.col === col;
    set((state) => {
      const newRows = state.rows.map((r) => [...r]);
      const newScales = state.cellScales.map((r) => [...r]);
      newRows[row][col] = null;
      newScales[row][col] = null;
      return {
        rows: newRows,
        cellScales: newScales,
        ...(clearSelected ? { selectedCell: null } : {}),
      };
    });
  },

  clearGrid: () =>
    set({
      rows: Array.from({ length: INITIAL_ROWS }, () => createEmptyRow()),
      cellScales: Array.from({ length: INITIAL_ROWS }, () => createEmptyScaleRow()),
      isPlaying: false,
      currentRow: -1,
      currentCol: -1,
      selectedCell: null,
    }),

  addRow: () =>
    set((state) => ({
      rows: [...state.rows, createEmptyRow()],
      cellScales: [...state.cellScales, createEmptyScaleRow()],
    })),

  removeRow: (rowIndex) =>
    set((state) => {
      if (state.rows.length <= 1) return state;
      const newRows = state.rows.filter((_, i) => i !== rowIndex);
      const newScales = state.cellScales.filter((_, i) => i !== rowIndex);
      const clearSelected = state.selectedCell?.row === rowIndex;
      return {
        rows: newRows,
        cellScales: newScales,
        ...(clearSelected ? { selectedCell: null } : {}),
      };
    }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setCurrentPosition: (row, col) => set({ currentRow: row, currentCol: col }),

  stop: () => set({ isPlaying: false, currentRow: -1, currentCol: -1 }),

  getChordAtPosition: (row, col) => {
    const { rows } = get();
    if (row < 0 || row >= rows.length) return null;
    const totalPos = row * COLUMNS + col;
    for (let pos = totalPos; pos >= 0; pos--) {
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
    const defaultScale = getDefaultScaleForSource(chord.source, chord.degree);
    const beatPositions = [0, 4, 8, 12];
    for (let r = 0; r < rows.length; r++) {
      const nextBeat = beatPositions.find((pos) => rows[r][pos] === null);
      if (nextBeat !== undefined) {
        const isLastRow = r === rows.length - 1;
        set((state) => {
          const newRows = state.rows.map((row) => [...row]);
          const newScales = state.cellScales.map((row) => [...row]);
          newRows[r][nextBeat] = chord;
          newScales[r][nextBeat] = defaultScale;
          if (isLastRow) {
            newRows.push(createEmptyRow());
            newScales.push(createEmptyScaleRow());
          }
          return { rows: newRows, cellScales: newScales };
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

  moveSelection: (direction) => {
    const { selectedCell, rows } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const maxRow = rows.length - 1;

    switch (direction) {
      case "left": {
        if (col > 0) {
          set({ selectedCell: { row, col: col - 1 } });
        } else if (row > 0) {
          set({ selectedCell: { row: row - 1, col: COLUMNS - 1 } });
        }
        break;
      }
      case "right": {
        if (col < COLUMNS - 1) {
          set({ selectedCell: { row, col: col + 1 } });
        } else if (row < maxRow) {
          set({ selectedCell: { row: row + 1, col: 0 } });
        }
        break;
      }
      case "up": {
        if (row > 0) {
          set({ selectedCell: { row: row - 1, col } });
        }
        break;
      }
      case "down": {
        if (row < maxRow) {
          set({ selectedCell: { row: row + 1, col } });
        }
        break;
      }
    }
  },

  setCellScale: (row, col, scaleType) => {
    const { cellScales } = get();
    if (row < 0 || row >= cellScales.length || col < 0 || col >= COLUMNS) return;
    set((state) => {
      const newScales = state.cellScales.map((r) => [...r]);
      newScales[row][col] = scaleType;
      return { cellScales: newScales };
    });
  },

  getCellScale: (row, col) => {
    const { cellScales } = get();
    if (row < 0 || row >= cellScales.length || col < 0 || col >= COLUMNS) return null;
    return cellScales[row][col];
  },
}));

export function _resetChordGridForTesting(): void {
  useChordGridStore.setState({
    ...INITIAL_STATE,
    rows: Array.from({ length: INITIAL_ROWS }, () => createEmptyRow()),
    cellScales: Array.from({ length: INITIAL_ROWS }, () => createEmptyScaleRow()),
    selectedCell: null,
  });
}
