import { useMemo } from "react";
import { useSelectedChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { useKeySnapshot } from "@/features/key-selection/stores/key-store";
import {
  type FretPosition,
  findChordPositions,
  findScalePositions,
  getCommonVoicings,
} from "@/lib/music-theory";

export function useFretboardPositions(): readonly FretPosition[] {
  const { rootName } = useKeySnapshot();
  const selectedChord = useSelectedChord();
  const { displayMode, scaleType, maxFret, selectedVoicingIndex } = useFretboardSnapshot();

  return useMemo(() => {
    if (displayMode === "voicing") {
      if (!selectedChord) return [];
      const voicings = getCommonVoicings(selectedChord.root.name, selectedChord.quality);
      if (voicings.length === 0) return [];
      const index = Math.min(selectedVoicingIndex, voicings.length - 1);
      return voicings[index].positions;
    }
    if (displayMode === "chord-tones") {
      if (!selectedChord) return [];
      return findChordPositions(selectedChord.root.name, selectedChord.quality, maxFret);
    }
    return findScalePositions(rootName, scaleType, maxFret);
  }, [displayMode, selectedChord, rootName, scaleType, maxFret, selectedVoicingIndex]);
}
