import { useMemo } from "react";
import { proxy, useSnapshot } from "valtio";
import { transposeAllChords } from "@/features/chord-progression/stores/chord-progression-store";
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
  noteNameToPitchClass,
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

const INITIAL_STATE: KeyState = {
  rootName: "C",
  chordType: "triad",
  selectedMode: "diatonic",
};

export type PaletteChordInfo = DiatonicChordInfo & {
  isAvailable: boolean;
  source?: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType;
};

const state = proxy<KeyState>({ ...INITIAL_STATE });

export function useKeySnapshot() {
  return useSnapshot(state);
}

export function useDiatonicChords(): readonly DiatonicChordInfo[] {
  const snap = useSnapshot(state);
  return useMemo(
    () => getDiatonicChords(snap.rootName, snap.chordType === "seventh"),
    [snap.rootName, snap.chordType]
  );
}

export function useModalInterchangeChords(): readonly ModalInterchangeChordInfo[] {
  const snap = useSnapshot(state);
  return useMemo(() => {
    const all = getAllModalInterchangeChords(snap.rootName);
    return filterNonDiatonicChords(snap.rootName, all);
  }, [snap.rootName]);
}

export type ModalInterchangeModeGroup = {
  readonly source: ScaleType;
  readonly displayName: string;
  readonly chords: readonly ModalInterchangeChordInfo[];
};

export function useModalInterchangeChordsByMode(): readonly ModalInterchangeModeGroup[] {
  const snap = useSnapshot(state);
  const seventh = snap.chordType === "seventh";
  return useMemo(
    () =>
      ALL_MODE_SOURCES.map((source) => ({
        source,
        displayName: MODE_DISPLAY_NAMES[source],
        chords: getModalInterchangeChords(snap.rootName, source, seventh),
      })),
    [snap.rootName, seventh]
  );
}

function parseCategoryMode(mode: string): CategoryId | null {
  if (mode.startsWith("category:")) {
    return mode.slice("category:".length) as CategoryId;
  }
  return null;
}

export function useCurrentModeChords(): readonly PaletteChordInfo[] {
  const snap = useSnapshot(state);
  const seventh = snap.chordType === "seventh";
  return useMemo(() => {
    if (snap.selectedMode === "diatonic") {
      return getDiatonicChords(snap.rootName, seventh).map((chord) => ({
        ...chord,
        isAvailable: true,
      }));
    }
    // セカンダリードミナントモード
    if (snap.selectedMode === "secondary-dominant") {
      return getSecondaryDominantChords(snap.rootName, seventh).map((sd) => ({
        degree: sd.targetDegree,
        romanNumeral: sd.romanNumeral,
        chord: sd.chord,
        chordFunction: "dominant" as const,
        isAvailable: true,
      }));
    }
    // 裏コード（トライトーン代理）モード
    if (snap.selectedMode === "tritone-substitution") {
      return getTritoneSubstitutionChords(snap.rootName, seventh).map((ts) => ({
        degree: ts.targetDegree,
        romanNumeral: ts.romanNumeral,
        chord: ts.chord,
        chordFunction: "dominant" as const,
        isAvailable: true,
      }));
    }
    // カテゴリコードモード
    const categoryId = parseCategoryMode(snap.selectedMode);
    if (categoryId) {
      return getCategoryChords(snap.rootName, categoryId, seventh).map((cc) => ({
        degree: cc.degree,
        romanNumeral: cc.romanNumeral,
        chord: cc.chord,
        chordFunction: cc.chordFunction,
        isAvailable: true,
        source: cc.source,
      }));
    }
    // モーダルインターチェンジモード
    const scaleMode = snap.selectedMode as ScaleType;
    return getModalInterchangeChords(snap.rootName, scaleMode, seventh).map((mi) => ({
      degree: mi.degree,
      romanNumeral: mi.romanNumeral,
      chord: mi.chord,
      chordFunction: getChordFunction(mi.degree),
      isAvailable: true,
    }));
  }, [snap.rootName, snap.selectedMode, seventh]);
}

export function setRootName(rootName: string): void {
  const oldPitchClass = noteNameToPitchClass(state.rootName);
  const newPitchClass = noteNameToPitchClass(rootName);
  const semitones = (newPitchClass - oldPitchClass + 12) % 12;
  state.rootName = rootName;
  transposeAllChords(semitones, rootName);
}

export function setChordType(chordType: "triad" | "seventh"): void {
  state.chordType = chordType;
}

export function setSelectedMode(mode: SelectedMode): void {
  state.selectedMode = mode;
}

export function _resetKeyStoreForTesting(): void {
  state.rootName = INITIAL_STATE.rootName;
  state.chordType = INITIAL_STATE.chordType;
  state.selectedMode = INITIAL_STATE.selectedMode;
}
