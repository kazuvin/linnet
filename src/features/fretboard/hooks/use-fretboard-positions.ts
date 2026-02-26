import { useMemo } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import {
  findOverlayPositions,
  getRotatedMode,
  type OverlayPosition,
  type ScaleType,
} from "@/lib/music-theory";

export function useFretboardPositions(
  overrideScaleType?: ScaleType | null
): readonly OverlayPosition[] {
  const selectedChord = useSelectedProgressionChord();
  const maxFret = useFretboardStore((s) => s.maxFret);

  return useMemo(() => {
    if (!selectedChord) return [];

    let defaultScaleType: ScaleType;
    if (selectedChord.source === "tritone-substitution") {
      defaultScaleType = "lydian-dominant";
    } else if (selectedChord.source === "secondary-dominant") {
      defaultScaleType = "mixolydian";
    } else if (selectedChord.source === "diatonic") {
      // ダイアトニックは major の回転モード
      defaultScaleType = getRotatedMode("major", selectedChord.degree) ?? "major";
    } else {
      // モーダルインターチェンジ: 親スケールの度数に対応する回転モード
      defaultScaleType =
        getRotatedMode(selectedChord.source, selectedChord.degree) ?? selectedChord.source;
    }

    const scaleType = overrideScaleType ?? defaultScaleType;

    // 常にコードルート基準でスケールを生成する
    const scaleRoot = selectedChord.rootName;

    return findOverlayPositions(
      scaleRoot,
      scaleType,
      selectedChord.rootName,
      selectedChord.quality,
      maxFret
    );
  }, [selectedChord, maxFret, overrideScaleType]);
}
