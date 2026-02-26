"use client";

import { useMemo } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import {
  type AvailableScaleInfo,
  findAvailableScalesForChord,
  getDefaultScaleForSource,
  type ScaleType,
  SECONDARY_DOMINANT_SCALES,
  sortScalesWithDefault,
} from "@/lib/music-theory";

export function useAvailableScales(): {
  availableScales: readonly AvailableScaleInfo[];
  activeScaleType: ScaleType | null;
  scaleRoot: string | null;
} {
  const rootName = useKeyStore((s) => s.rootName);
  const selectedChord = useSelectedProgressionChord();
  const selectedScaleType = useFretboardStore((s) => s.selectedScaleType);

  const isDominantSource =
    selectedChord?.source === "secondary-dominant" ||
    selectedChord?.source === "tritone-substitution";

  // ソースモードから導出されるデフォルトスケール
  const sourceDefaultScaleType = useMemo(() => {
    if (!selectedChord || isDominantSource) return null;
    return getDefaultScaleForSource(selectedChord.source, selectedChord.degree);
  }, [selectedChord, isDominantSource]);

  const availableScales = useMemo(() => {
    if (!selectedChord) return [];
    if (isDominantSource) {
      return SECONDARY_DOMINANT_SCALES;
    }
    const scales = findAvailableScalesForChord(
      rootName,
      selectedChord.degree,
      selectedChord.rootName,
      selectedChord.quality
    );
    // ソースモードに対応するスケールを先頭に配置
    if (sourceDefaultScaleType) {
      return sortScalesWithDefault(scales, sourceDefaultScaleType);
    }
    return scales;
  }, [selectedChord, rootName, isDominantSource, sourceDefaultScaleType]);

  // activeScaleType: ユーザーが明示的に選択したスケール、またはコードのソースのデフォルト
  const activeScaleType = useMemo(() => {
    if (!selectedChord) return null;
    if (selectedScaleType !== null) return selectedScaleType;
    // デフォルト: コードのソースに対応するスケール
    if (selectedChord.source === "secondary-dominant") {
      return "mixolydian" as ScaleType;
    }
    // 裏コードはリディアンドミナントがデフォルト（#4 が元のセカンダリードミナントのルート）
    if (selectedChord.source === "tritone-substitution") {
      return "lydian-dominant" as ScaleType;
    }
    // ソースモードのデフォルト、または availableScales の最初のエントリ
    return (
      sourceDefaultScaleType ?? (availableScales.length > 0 ? availableScales[0].scaleType : null)
    );
  }, [selectedChord, selectedScaleType, availableScales, sourceDefaultScaleType]);

  // スケールのルート: 常にコードのルート音を使う
  const scaleRoot = selectedChord?.rootName ?? null;

  return { availableScales, activeScaleType, scaleRoot };
}
