import { useMemo } from "react";
import { create } from "zustand";
import {
  ALL_MODE_SOURCES,
  type CategoryId,
  type DiatonicChordInfo,
  filterNonDiatonicChords,
  getAllModalInterchangeChords,
  getCategoryChords,
  getChordFunction,
  getDiatonicChords,
  getModalInterchangeChords,
  getSecondaryDominantChords,
  getTritoneSubstitutionChords,
  MODE_DISPLAY_NAMES,
  type ModalInterchangeChordInfo,
  type ScaleType,
} from "@/lib/music-theory";

export type SelectedMode =
  | "diatonic"
  | "secondary-dominant"
  | "tritone-substitution"
  | ScaleType
  | `category:${CategoryId}`;

type KeyState = {
  rootName: string;
  chordType: "triad" | "seventh";
  selectedMode: SelectedMode;
};

type KeyActions = {
  setRootName: (rootName: string) => void;
  setChordType: (chordType: "triad" | "seventh") => void;
  setSelectedMode: (mode: SelectedMode) => void;
};

const INITIAL_STATE: KeyState = {
  rootName: "C",
  chordType: "triad",
  selectedMode: "diatonic",
};

export type PaletteChordInfo = DiatonicChordInfo & {
  isAvailable: boolean;
  source?: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType;
};

export const useKeyStore = create<KeyState & KeyActions>()((set) => ({
  ...INITIAL_STATE,
  setRootName: (rootName) => set({ rootName }),
  setChordType: (chordType) => set({ chordType }),
  setSelectedMode: (mode) => set({ selectedMode: mode }),
}));

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

export type ModalInterchangeModeGroup = {
  readonly source: ScaleType;
  readonly displayName: string;
  readonly chords: readonly ModalInterchangeChordInfo[];
};

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

function parseCategoryMode(mode: string): CategoryId | null {
  if (mode.startsWith("category:")) {
    return mode.slice("category:".length) as CategoryId;
  }
  return null;
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
    const categoryId = parseCategoryMode(selectedMode);
    if (categoryId) {
      return getCategoryChords(rootName, categoryId, seventh).map((cc) => ({
        degree: cc.degree,
        romanNumeral: cc.romanNumeral,
        chord: cc.chord,
        chordFunction: cc.chordFunction,
        isAvailable: true,
        source: cc.source,
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

export function _resetKeyStoreForTesting(): void {
  useKeyStore.setState({ ...INITIAL_STATE });
}
