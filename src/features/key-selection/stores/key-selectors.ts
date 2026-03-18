import { useMemo } from "react";
import {
  ALL_MODE_SOURCES,
  type ChordSource,
  type DiatonicChordInfo,
  filterNonDiatonicChords,
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

/** ディグリーごとにtriad・seventhの両方を返すセレクター（スケールからコード検索用） */
export type DegreeChordGroup = {
  readonly degree: number;
  readonly chords: readonly PaletteChordInfo[];
};

export function useCurrentModeChordsAllByDegree(): readonly DegreeChordGroup[] {
  const rootName = useKeyStore((s) => s.rootName);
  const selectedMode = useKeyStore((s) => s.selectedMode);
  return useMemo(() => {
    const buildChords = (seventh: boolean): readonly PaletteChordInfo[] => {
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
    };

    const triads = buildChords(false);
    const sevenths = buildChords(true);

    // ディグリー順にグループ化（triad → seventh の順）
    const degreeMap = new Map<number, PaletteChordInfo[]>();
    for (const chord of triads) {
      const group = degreeMap.get(chord.degree) ?? [];
      group.push(chord);
      degreeMap.set(chord.degree, group);
    }
    for (const chord of sevenths) {
      const group = degreeMap.get(chord.degree) ?? [];
      // 重複排除（同じシンボルのコードは追加しない）
      if (!group.some((c) => c.chord.symbol === chord.chord.symbol)) {
        group.push(chord);
      }
      degreeMap.set(chord.degree, group);
    }

    return Array.from(degreeMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([degree, chords]) => ({ degree, chords }));
  }, [rootName, selectedMode]);
}
