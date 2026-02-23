import { useMemo } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { useKeySnapshot } from "@/features/key-selection/stores/key-store";
import { findOverlayPositions, type OverlayPosition, type ScaleType } from "@/lib/music-theory";

export function useFretboardPositions(
  overrideScaleType?: ScaleType | null
): readonly OverlayPosition[] {
  const { rootName } = useKeySnapshot();
  const selectedChord = useSelectedProgressionChord();
  const { maxFret } = useFretboardSnapshot();

  return useMemo(() => {
    if (!selectedChord) return [];

    const defaultScaleType: ScaleType =
      selectedChord.source === "secondary-dominant"
        ? "mixolydian"
        : selectedChord.source === "diatonic"
          ? "major"
          : selectedChord.source;

    const scaleType = overrideScaleType ?? defaultScaleType;

    // セカンダリードミナントはコードルート基準でスケールを生成する
    const scaleRoot =
      selectedChord.source === "secondary-dominant" ? selectedChord.rootName : rootName;

    return findOverlayPositions(
      scaleRoot,
      scaleType,
      selectedChord.rootName,
      selectedChord.quality,
      maxFret
    );
  }, [selectedChord, rootName, maxFret, overrideScaleType]);
}
