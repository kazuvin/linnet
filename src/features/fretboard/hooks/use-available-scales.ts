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

  const isDominantSource =
    selectedChord?.source === "secondary-dominant" ||
    selectedChord?.source === "tritone-substitution";

  const availableScales = useMemo(() => {
    if (!selectedChord) return [];
    if (isDominantSource) {
      return SECONDARY_DOMINANT_SCALES;
    }
    return findAvailableScalesForChord(
      rootName,
      selectedChord.degree,
      selectedChord.rootName,
      selectedChord.quality
    );
  }, [selectedChord, rootName, isDominantSource]);

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
    // ダイアトニック/モーダルインターチェンジ: availableScales の最初のエントリ
    return availableScales.length > 0 ? availableScales[0].scaleType : null;
  }, [selectedChord, selectedScaleType, availableScales]);

  // スケールのルート: 常にコードのルート音を使う
  const scaleRoot = selectedChord?.rootName ?? null;

  return { availableScales, activeScaleType, scaleRoot };
}
