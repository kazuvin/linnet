import { useMemo } from "react";
import { proxy, useSnapshot } from "valtio";
import { type Chord, type ChordQuality, createChord, formatChordSymbol } from "@/lib/music-theory";

export type ProgressionChord = {
  id: string;
  rootName: string;
  quality: ChordQuality;
  symbol: string;
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

export function addChord(rootName: string, quality: ChordQuality): void {
  state.chords.push({
    id: crypto.randomUUID(),
    rootName,
    quality,
    symbol: formatChordSymbol(rootName, quality),
  });
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
}

export function clearProgression(): void {
  state.chords.splice(0, state.chords.length);
  state.selectedChordId = null;
}

export function _resetChordProgressionForTesting(): void {
  clearProgression();
}
