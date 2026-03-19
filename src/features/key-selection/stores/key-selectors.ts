import { useMemo } from "react";
import {
  ALL_MODE_SOURCES,
  type ChordSource,
  type DiatonicChordInfo,
  filterNonDiatonicChords,
  findAllChordsInScale,
  getAllModalInterchangeChords,
  getChordFunction,
  getDiatonicChords,
  getModalInterchangeChords,
  getSecondaryDominantChords,
  getTritoneSubstitutionChords,
  MODE_DISPLAY_NAMES,
  type ModalInterchangeChordInfo,
  type ScaleType,
} from "@/lib/music-theory";
import { useKeyStore } from "./key-store";

export type PaletteChordInfo = DiatonicChordInfo & {
  isAvailable: boolean;
  source?: ChordSource;
};

export type ModalInterchangeModeGroup = {
  readonly source: ScaleType;
  readonly displayName: string;
  readonly chords: readonly ModalInterchangeChordInfo[];
};

export function useDiatonicChords(): readonly DiatonicChordInfo[] {
  const rootName = useKeyStore((s) => s.rootName);
  const chordType = useKeyStore((s) => s.chordType);
  return useMemo(() => getDiatonicChords(rootName, chordType === "seventh"), [rootName, chordType]);
}

export function useModalInterchangeChords(): readonly ModalInterchangeChordInfo[] {
  const rootName = useKeyStore((s) => s.rootName);
  return useMemo(() => {
    const all = getAllModalInterchangeChords(rootName);
    return filterNonDiatonicChords(rootName, all);
  }, [rootName]);
}

export function useModalInterchangeChordsByMode(): readonly ModalInterchangeModeGroup[] {
  const rootName = useKeyStore((s) => s.rootName);
  const chordType = useKeyStore((s) => s.chordType);
  const seventh = chordType === "seventh";
  return useMemo(
    () =>
      ALL_MODE_SOURCES.map((source) => ({
        source,
        displayName: MODE_DISPLAY_NAMES[source],
        chords: getModalInterchangeChords(rootName, source, seventh),
      })),
    [rootName, seventh]
  );
}

export function useCurrentModeChords(): readonly PaletteChordInfo[] {
  const rootName = useKeyStore((s) => s.rootName);
  const selectedMode = useKeyStore((s) => s.selectedMode);
  const chordType = useKeyStore((s) => s.chordType);
  const seventh = chordType === "seventh";
  return useMemo(() => {
    if (selectedMode === "diatonic") {
      return getDiatonicChords(rootName, seventh).map((chord) => ({
        ...chord,
        isAvailable: true,
      }));
    }
    if (selectedMode === "secondary-dominant") {
      return getSecondaryDominantChords(rootName, seventh).map((sd) => ({
        degree: sd.targetDegree,
        romanNumeral: sd.romanNumeral,
        chord: sd.chord,
        chordFunction: "dominant" as const,
        isAvailable: true,
      }));
    }
    if (selectedMode === "tritone-substitution") {
      return getTritoneSubstitutionChords(rootName, seventh).map((ts) => ({
        degree: ts.targetDegree,
        romanNumeral: ts.romanNumeral,
        chord: ts.chord,
        chordFunction: "dominant" as const,
        isAvailable: true,
      }));
    }
    const scaleMode = selectedMode as ScaleType;
    return getModalInterchangeChords(rootName, scaleMode, seventh).map((mi) => ({
      degree: mi.degree,
      romanNumeral: mi.romanNumeral,
      chord: mi.chord,
      chordFunction: getChordFunction(mi.degree),
      isAvailable: true,
    }));
  }, [rootName, selectedMode, seventh]);
}

/** ディグリーごとにスケール内の全コードを返すセレクター（スケールからコード検索用） */
export type DegreeChordGroup = {
  readonly degree: number;
  readonly chords: readonly PaletteChordInfo[];
};

/** スケールモードをScaleTypeにマッピング */
const MODE_TO_SCALE_TYPE: Record<string, ScaleType> = {
  diatonic: "major",
};

export function useCurrentModeChordsAllByDegree(): readonly DegreeChordGroup[] {
  const rootName = useKeyStore((s) => s.rootName);
  const selectedMode = useKeyStore((s) => s.selectedMode);
  return useMemo(() => {
    // セカンダリードミナント・裏コードはスケールに基づかないため、triad+seventh で返す
    if (selectedMode === "secondary-dominant" || selectedMode === "tritone-substitution") {
      const getChords =
        selectedMode === "secondary-dominant"
          ? getSecondaryDominantChords
          : getTritoneSubstitutionChords;

      const triads = getChords(rootName, false);
      const sevenths = getChords(rootName, true);

      const degreeMap = new Map<number, PaletteChordInfo[]>();
      for (const item of triads) {
        const degree = "targetDegree" in item ? item.targetDegree : 0;
        const group = degreeMap.get(degree) ?? [];
        group.push({
          degree,
          romanNumeral: item.romanNumeral,
          chord: item.chord,
          chordFunction: "dominant" as const,
          isAvailable: true,
        });
        degreeMap.set(degree, group);
      }
      for (const item of sevenths) {
        const degree = "targetDegree" in item ? item.targetDegree : 0;
        const group = degreeMap.get(degree) ?? [];
        if (!group.some((c) => c.chord.symbol === item.chord.symbol)) {
          group.push({
            degree,
            romanNumeral: item.romanNumeral,
            chord: item.chord,
            chordFunction: "dominant" as const,
            isAvailable: true,
          });
        }
        degreeMap.set(degree, group);
      }
      return Array.from(degreeMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([degree, chords]) => ({ degree, chords }));
    }

    // ダイアトニック・モーダルインターチェンジ: findAllChordsInScale を使用
    const scaleType: ScaleType = MODE_TO_SCALE_TYPE[selectedMode] ?? (selectedMode as ScaleType);
    const groups = findAllChordsInScale(rootName, scaleType);

    return groups.map((g) => ({
      degree: g.degree,
      chords: g.chords.map((c) => ({
        degree: c.degree,
        romanNumeral: c.romanNumeral,
        chord: c.chord,
        chordFunction: c.chordFunction,
        isAvailable: true,
      })),
    }));
  }, [rootName, selectedMode]);
}
