import { useMemo } from "react";
import { useSelectedChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { useKeySnapshot } from "@/features/key-selection/stores/key-store";
import { type FretPosition, findChordPositions, findScalePositions } from "@/lib/music-theory";

export function useFretboardPositions(): readonly FretPosition[] {
  const { rootName } = useKeySnapshot();
  const selectedChord = useSelectedChord();
  const { displayMode, scaleType, maxFret } = useFretboardSnapshot();

  return useMemo(() => {
    if (displayMode === "chord-tones") {
      if (!selectedChord) return [];
      return findChordPositions(selectedChord.root.name, selectedChord.quality, maxFret);
    }
    return findScalePositions(rootName, scaleType, maxFret);
  }, [displayMode, selectedChord, rootName, scaleType, maxFret]);
}
