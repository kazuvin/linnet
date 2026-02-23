"use client";

import { useMemo } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { useKeySnapshot } from "@/features/key-selection/stores/key-store";
import {
  type AvailableScaleInfo,
  findAvailableScalesForChord,
  type ScaleType,
  SECONDARY_DOMINANT_SCALES,
} from "@/lib/music-theory";

export function useAvailableScales(): {
  availableScales: readonly AvailableScaleInfo[];
  activeScaleType: ScaleType | null;
  scaleRoot: string | null;
} {
  const { rootName } = useKeySnapshot();
  const selectedChord = useSelectedProgressionChord();
  const { selectedScaleType } = useFretboardSnapshot();

  const availableScales = useMemo(() => {
    if (!selectedChord) return [];
    if (selectedChord.source === "secondary-dominant") {
      return SECONDARY_DOMINANT_SCALES;
    }
    return findAvailableScalesForChord(
      rootName,
      selectedChord.degree,
      selectedChord.rootName,
      selectedChord.quality
    );
  }, [selectedChord, rootName]);

  // activeScaleType: ユーザーが明示的に選択したスケール、またはコードのソースのデフォルト
  const activeScaleType = useMemo(() => {
    if (!selectedChord) return null;
    if (selectedScaleType !== null) return selectedScaleType;
    // デフォルト: コードのソースに対応するスケール
    if (selectedChord.source === "secondary-dominant") {
      return "mixolydian" as ScaleType;
    }
    if (selectedChord.source === "diatonic") {
      return "major" as ScaleType;
    }
    return selectedChord.source;
  }, [selectedChord, selectedScaleType]);

  // スケールのルート: セカンダリードミナントはコードルート、それ以外はキールート
  const scaleRoot = selectedChord
    ? selectedChord.source === "secondary-dominant"
      ? selectedChord.rootName
      : rootName
    : null;

  return { availableScales, activeScaleType, scaleRoot };
}
