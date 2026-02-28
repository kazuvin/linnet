import { create } from "zustand";
import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import { createNote, formatChordSymbol, shouldPreferFlat, transposeNote } from "@/lib/music-theory";

export type ProgressionChord = GridChord & { id: string };

export type ChordProgressionState = {
  chords: ProgressionChord[];
  selectedChordId: string | null;
  activeChordOverride: ProgressionChord | null;
};

type ChordProgressionActions = {
  addChord: (chord: GridChord) => string;
  removeChord: (id: string) => void;
  reorderChords: (fromIndex: number, toIndex: number) => void;
  selectChord: (id: string | null) => void;
  transposeAllChords: (semitones: number, newRootName: string) => void;
  clearProgression: () => void;
  setActiveChordOverride: (chord: ProgressionChord | null) => void;
};

const INITIAL_STATE: ChordProgressionState = {
  chords: [],
  selectedChordId: null,
  activeChordOverride: null,
};

export const useChordProgressionStore = create<ChordProgressionState & ChordProgressionActions>()(
  (set) => ({
    ...INITIAL_STATE,

    addChord: (chord) => {
      const id = crypto.randomUUID();
      set((state) => ({
        chords: [...state.chords, { ...chord, id }],
      }));
      return id;
    },

    removeChord: (id) =>
      set((state) => ({
        chords: state.chords.filter((c) => c.id !== id),
        selectedChordId: state.selectedChordId === id ? null : state.selectedChordId,
      })),

    reorderChords: (fromIndex, toIndex) =>
      set((state) => {
        const newChords = [...state.chords];
        const [moved] = newChords.splice(fromIndex, 1);
        newChords.splice(toIndex, 0, moved);
        return { chords: newChords };
      }),

    selectChord: (id) => set({ selectedChordId: id }),

    transposeAllChords: (semitones, newRootName) => {
      if (semitones === 0) return;
      const preferFlat = shouldPreferFlat(newRootName);
      set((state) => ({
        chords: state.chords.map((chord) => {
          const note = createNote(chord.rootName);
          const transposed = transposeNote(note, semitones, preferFlat);
          return {
            ...chord,
            rootName: transposed.name,
            symbol: formatChordSymbol(transposed.name, chord.quality),
          };
        }),
      }));
    },

    clearProgression: () => set({ chords: [], selectedChordId: null }),

    setActiveChordOverride: (chord) => set({ activeChordOverride: chord }),
  })
);

export function _resetChordProgressionForTesting(): void {
  useChordProgressionStore.setState({
    chords: [],
    selectedChordId: null,
    activeChordOverride: null,
  });
}
