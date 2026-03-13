import { useMemo } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import {
  findOverlayPositions,
  getDefaultScaleForSource,
  type OverlayPosition,
  type ScaleType,
} from "@/lib/music-theory";

export function useFretboardPositions(
  overrideScaleType?: ScaleType | null
): readonly OverlayPosition[] {
  const selectedChord = useSelectedProgressionChord();

  return useMemo(() => {
    if (!selectedChord) return [];

    const defaultScaleType =
      getDefaultScaleForSource(selectedChord.source, selectedChord.degree) ?? "major";
    const scaleType = overrideScaleType ?? defaultScaleType;

    return findOverlayPositions(
      selectedChord.rootName,
      scaleType,
      selectedChord.rootName,
      selectedChord.quality
    );
  }, [selectedChord, overrideScaleType]);
}
