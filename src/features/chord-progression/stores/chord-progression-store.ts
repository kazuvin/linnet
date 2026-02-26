import { useMemo } from "react";
import { create } from "zustand";
import {
  type Chord,
  type ChordFunction,
  type ChordQuality,
  createChord,
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

const INITIAL_STATE: ChordProgressionState = {
  chords: [],
  selectedChordId: null,
};

const useChordProgressionStore = create<ChordProgressionState>()(() => ({
  ...INITIAL_STATE,
}));

export function useChordProgressionSnapshot() {
  return useChordProgressionStore();
}

export function useSelectedChord(): Chord | null {
  const selectedChordId = useChordProgressionStore((s) => s.selectedChordId);
  const chords = useChordProgressionStore((s) => s.chords);
  return useMemo(() => {
    if (selectedChordId === null) {
      return null;
    }
    const found = chords.find((c) => c.id === selectedChordId);
    if (!found) {
      return null;
    }
    return createChord(found.rootName, found.quality);
  }, [selectedChordId, chords]);
}

export function useSelectedProgressionChord(): ProgressionChord | null {
  const selectedChordId = useChordProgressionStore((s) => s.selectedChordId);
  const chords = useChordProgressionStore((s) => s.chords);
  return useMemo(() => {
    if (selectedChordId === null) {
      return null;
    }
    const found = chords.find((c) => c.id === selectedChordId);
    if (!found) {
      return null;
    }
    return {
      id: found.id,
      rootName: found.rootName,
      quality: found.quality,
      symbol: found.symbol,
      source: found.source,
      chordFunction: found.chordFunction,
      romanNumeral: found.romanNumeral,
      degree: found.degree,
    };
  }, [selectedChordId, chords]);
}

export function addChord(
  rootName: string,
  quality: ChordQuality,
  source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType,
  chordFunction: ChordFunction,
  romanNumeral: string,
  degree: number
): string {
  const id = crypto.randomUUID();
  useChordProgressionStore.setState((state) => ({
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
}

export function removeChord(id: string): void {
  useChordProgressionStore.setState((state) => ({
    chords: state.chords.filter((c) => c.id !== id),
    selectedChordId: state.selectedChordId === id ? null : state.selectedChordId,
  }));
}

export function reorderChords(fromIndex: number, toIndex: number): void {
  useChordProgressionStore.setState((state) => {
    const newChords = [...state.chords];
    const [moved] = newChords.splice(fromIndex, 1);
    newChords.splice(toIndex, 0, moved);
    return { chords: newChords };
  });
}

export function selectChord(id: string | null): void {
  useChordProgressionStore.setState({ selectedChordId: id });
}

export function transposeAllChords(semitones: number, newRootName: string): void {
  if (semitones === 0) return;
  const preferFlat = shouldPreferFlat(newRootName);
  useChordProgressionStore.setState((state) => ({
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
}

export function clearProgression(): void {
  useChordProgressionStore.setState({ chords: [], selectedChordId: null });
}

export function _resetChordProgressionForTesting(): void {
  useChordProgressionStore.setState({ chords: [], selectedChordId: null });
}
