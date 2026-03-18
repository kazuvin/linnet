"use client";

import { useMemo } from "react";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import {
  type AvailableScaleInfo,
  type ChordQuality,
  type ChordSource,
  findScalesForChord,
  getDefaultScaleForSource,
  type ScaleType,
  SECONDARY_DOMINANT_SCALES,
  sortScalesWithDefault,
} from "@/lib/music-theory";

/**
 * グリッドの選択セルに基づいてスケール情報を返す。
 * セルに保存されたスケールを activeScaleType として使用する。
 */
export function useAvailableScales(): {
  availableScales: readonly AvailableScaleInfo[];
  activeScaleType: ScaleType | null;
  scaleRoot: string | null;
} {
  const selectedChord = useSelectedProgressionChord();
  const selectedCell = useChordGridStore((s) => s.selectedCell);
  const cellScales = useChordGridStore((s) => s.cellScales);
  const isPlaying = useChordGridStore((s) => s.isPlaying);
  const currentRow = useChordGridStore((s) => s.currentRow);
  const currentCol = useChordGridStore((s) => s.currentCol);

  // セルに保存されたスケール（再生中は再生位置、それ以外は選択セルから取得）
  const cellScale = useMemo(() => {
    if (isPlaying && currentRow >= 0 && currentCol >= 0) {
      return useChordGridStore.getState().getScaleAtPosition(currentRow, currentCol);
    }
    if (selectedCell !== null) {
      return cellScales[selectedCell.row]?.[selectedCell.col] ?? null;
    }
    return null;
  }, [isPlaying, currentRow, currentCol, selectedCell, cellScales]);

  const isDominantSource =
    selectedChord?.source === "secondary-dominant" ||
    selectedChord?.source === "tritone-substitution";

  const sourceDefaultScaleType = useMemo(() => {
    if (!selectedChord) return null;
    return getDefaultScaleForSource(selectedChord.source, selectedChord.degree);
  }, [selectedChord]);

  const availableScales = useMemo(() => {
    if (!selectedChord) return [];
    if (isDominantSource) {
      return SECONDARY_DOMINANT_SCALES;
    }
    const scales = findScalesForChord(selectedChord.rootName, selectedChord.quality);
    if (sourceDefaultScaleType) {
      return sortScalesWithDefault(scales, sourceDefaultScaleType);
    }
    return scales;
  }, [selectedChord, isDominantSource, sourceDefaultScaleType]);

  // activeScaleType: セルに保存されたスケール → ソースデフォルト → 利用可能スケールの先頭
  const activeScaleType = useMemo(() => {
    if (!selectedChord) return null;
    if (cellScale !== null) return cellScale;
    return (
      sourceDefaultScaleType ?? (availableScales.length > 0 ? availableScales[0].scaleType : null)
    );
  }, [selectedChord, cellScale, availableScales, sourceDefaultScaleType]);

  const scaleRoot = selectedChord?.rootName ?? null;

  return { availableScales, activeScaleType, scaleRoot };
}

/**
 * 任意のコード情報からスケール一覧を返すフック。
 * RowScaleSelector 等で使用。
 */
export function useAvailableScalesForCell(
  rootName: string | null,
  quality: ChordQuality | null,
  source: ChordSource | null,
  degree: number
): {
  availableScales: readonly AvailableScaleInfo[];
} {
  const isDominantSource = source === "secondary-dominant" || source === "tritone-substitution";

  const sourceDefaultScaleType = useMemo(() => {
    if (!source) return null;
    return getDefaultScaleForSource(source, degree);
  }, [source, degree]);

  const availableScales = useMemo(() => {
    if (!rootName || !quality) return [];
    if (isDominantSource) {
      return SECONDARY_DOMINANT_SCALES;
    }
    const scales = findScalesForChord(rootName, quality);
    if (sourceDefaultScaleType) {
      return sortScalesWithDefault(scales, sourceDefaultScaleType);
    }
    return scales;
  }, [rootName, quality, isDominantSource, sourceDefaultScaleType]);

  return { availableScales };
}
