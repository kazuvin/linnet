"use client";

import { useMemo } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { useKeySnapshot } from "@/features/key-selection/stores/key-store";
import {
  type AvailableScaleInfo,
  findAvailableScalesForChord,
  type ScaleType,
} from "@/lib/music-theory";

export function useAvailableScales(): {
  availableScales: readonly AvailableScaleInfo[];
  activeScaleType: ScaleType | null;
} {
  const { rootName } = useKeySnapshot();
  const selectedChord = useSelectedProgressionChord();
  const { selectedScaleType } = useFretboardSnapshot();

  const availableScales = useMemo(() => {
    if (!selectedChord) return [];
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
    if (selectedChord.source === "diatonic" || selectedChord.source === "secondary-dominant") {
      return "major" as ScaleType;
    }
    return selectedChord.source;
  }, [selectedChord, selectedScaleType]);

  return { availableScales, activeScaleType };
}
