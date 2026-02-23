import { useMemo } from "react";
import { proxy, useSnapshot } from "valtio";
import { resetSelectedScaleType } from "@/features/fretboard/stores/fretboard-store";
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
  source: "diatonic" | ScaleType;
  chordFunction: ChordFunction;
  romanNumeral: string;
  degree: number;
};

export type ChordProgressionState = {
  chords: ProgressionChord[];
  selectedChordId: string | null;
};

const state = proxy<ChordProgressionState>({
  chords: [],
  selectedChordId: null,
});

export function useChordProgressionSnapshot() {
  return useSnapshot(state);
}

export function useSelectedChord(): Chord | null {
  const snap = useSnapshot(state);
  return useMemo(() => {
    if (snap.selectedChordId === null) {
      return null;
    }
    const found = snap.chords.find((c) => c.id === snap.selectedChordId);
    if (!found) {
      return null;
    }
    return createChord(found.rootName, found.quality);
  }, [snap.selectedChordId, snap.chords]);
}

export function useSelectedProgressionChord(): ProgressionChord | null {
  const snap = useSnapshot(state);
  return useMemo(() => {
    if (snap.selectedChordId === null) {
      return null;
    }
    const found = snap.chords.find((c) => c.id === snap.selectedChordId);
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
  }, [snap.selectedChordId, snap.chords]);
}

export function addChord(
  rootName: string,
  quality: ChordQuality,
  source: "diatonic" | ScaleType,
  chordFunction: ChordFunction,
  romanNumeral: string,
  degree: number
): string {
  const id = crypto.randomUUID();
  state.chords.push({
    id,
    rootName,
    quality,
    symbol: formatChordSymbol(rootName, quality),
    source,
    chordFunction,
    romanNumeral,
    degree,
  });
  return id;
}

export function removeChord(id: string): void {
  const index = state.chords.findIndex((c) => c.id === id);
  if (index !== -1) {
    state.chords.splice(index, 1);
  }
  if (state.selectedChordId === id) {
    state.selectedChordId = null;
  }
}

export function reorderChords(fromIndex: number, toIndex: number): void {
  const [moved] = state.chords.splice(fromIndex, 1);
  state.chords.splice(toIndex, 0, moved);
}

export function selectChord(id: string | null): void {
  state.selectedChordId = id;
  resetSelectedScaleType();
}

export function transposeAllChords(semitones: number, newRootName: string): void {
  if (semitones === 0) return;
  const preferFlat = shouldPreferFlat(newRootName);
  for (const chord of state.chords) {
    const note = createNote(chord.rootName);
    const transposed = transposeNote(note, semitones, preferFlat);
    chord.rootName = transposed.name;
    chord.symbol = formatChordSymbol(transposed.name, chord.quality);
  }
}

export function clearProgression(): void {
  state.chords.splice(0, state.chords.length);
  state.selectedChordId = null;
}

export function _resetChordProgressionForTesting(): void {
  clearProgression();
}
