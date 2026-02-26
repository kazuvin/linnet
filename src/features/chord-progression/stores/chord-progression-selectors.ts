import { useMemo } from "react";
import { type Chord, createChord } from "@/lib/music-theory";
import { type ProgressionChord, useChordProgressionStore } from "./chord-progression-store";

export function useSelectedChord(): Chord | null {
  const selectedChordId = useChordProgressionStore((s) => s.selectedChordId);
  const chords = useChordProgressionStore((s) => s.chords);
  return useMemo(() => {
    if (selectedChordId === null) return null;
    const found = chords.find((c) => c.id === selectedChordId);
    if (!found) return null;
    return createChord(found.rootName, found.quality);
  }, [selectedChordId, chords]);
}

export function useSelectedProgressionChord(): ProgressionChord | null {
  const selectedChordId = useChordProgressionStore((s) => s.selectedChordId);
  const chords = useChordProgressionStore((s) => s.chords);
  return useMemo(() => {
    if (selectedChordId === null) return null;
    const found = chords.find((c) => c.id === selectedChordId);
    if (!found) return null;
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
