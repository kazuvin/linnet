import { useMemo } from "react";
import { type Chord, createChord } from "@/lib/music-theory";
import { type ProgressionChord, useChordProgressionStore } from "./chord-progression-store";

export function useSelectedChord(): Chord | null {
  const activeChordOverride = useChordProgressionStore((s) => s.activeChordOverride);
  return useMemo(() => {
    if (!activeChordOverride) return null;
    return createChord(activeChordOverride.rootName, activeChordOverride.quality);
  }, [activeChordOverride]);
}

export function useSelectedProgressionChord(): ProgressionChord | null {
  const activeChordOverride = useChordProgressionStore((s) => s.activeChordOverride);
  return activeChordOverride;
}
