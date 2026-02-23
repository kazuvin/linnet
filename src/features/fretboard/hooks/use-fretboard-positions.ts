import { useMemo } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { useKeySnapshot } from "@/features/key-selection/stores/key-store";
import { findOverlayPositions, type OverlayPosition, type ScaleType } from "@/lib/music-theory";

export function useFretboardPositions(): readonly OverlayPosition[] {
  const { rootName } = useKeySnapshot();
  const selectedChord = useSelectedProgressionChord();
  const { maxFret } = useFretboardSnapshot();

  return useMemo(() => {
    if (!selectedChord) return [];

    const scaleType: ScaleType =
      selectedChord.source === "diatonic" ? "major" : selectedChord.source;

    return findOverlayPositions(
      rootName,
      scaleType,
      selectedChord.rootName,
      selectedChord.quality,
      maxFret
    );
  }, [selectedChord, rootName, maxFret]);
}
