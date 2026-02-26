import { create } from "zustand";
import {
  type ChordFunction,
  type ChordQuality,
  createNote,
  formatChordSymbol,
  type ScaleType,
  shouldPreferFlat,
  transposeNote,
} from "@/lib/music-theory";

export type ProgressionChord = {
  id: string;
  rootName: string;
  quality: ChordQuality;
  symbol: string;
  source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType;
  chordFunction: ChordFunction;
  romanNumeral: string;
  degree: number;
};

export type ChordProgressionState = {
  chords: ProgressionChord[];
  selectedChordId: string | null;
};

type ChordProgressionActions = {
  addChord: (
    rootName: string,
    quality: ChordQuality,
    source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType,
    chordFunction: ChordFunction,
    romanNumeral: string,
    degree: number
  ) => string;
  removeChord: (id: string) => void;
  reorderChords: (fromIndex: number, toIndex: number) => void;
  selectChord: (id: string | null) => void;
  transposeAllChords: (semitones: number, newRootName: string) => void;
  clearProgression: () => void;
};

const INITIAL_STATE: ChordProgressionState = {
  chords: [],
  selectedChordId: null,
};

export const useChordProgressionStore = create<ChordProgressionState & ChordProgressionActions>()(
  (set) => ({
    ...INITIAL_STATE,

    addChord: (rootName, quality, source, chordFunction, romanNumeral, degree) => {
      const id = crypto.randomUUID();
      set((state) => ({
        chords: [
          ...state.chords,
          {
            id,
            rootName,
            quality,
            symbol: formatChordSymbol(rootName, quality),
            source,
            chordFunction,
            romanNumeral,
            degree,
          },
        ],
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
  })
);

export function _resetChordProgressionForTesting(): void {
  useChordProgressionStore.setState({ chords: [], selectedChordId: null });
}
