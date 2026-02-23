import { useMemo } from "react";
import { useSelectedChord } from "@/features/chord-progression/stores/chord-progression-store";
import { type ChordVoicing, getCommonVoicings } from "@/lib/music-theory";

export function useChordVoicings(): readonly ChordVoicing[] {
  const selectedChord = useSelectedChord();

  return useMemo(() => {
    if (!selectedChord) return [];
    return getCommonVoicings(selectedChord.root.name, selectedChord.quality);
  }, [selectedChord]);
}
