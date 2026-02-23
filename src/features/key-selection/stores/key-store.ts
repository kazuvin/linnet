import { useMemo } from "react";
import { proxy, useSnapshot } from "valtio";
import { transposeAllChords } from "@/features/chord-progression/stores/chord-progression-store";
import {
  ALL_MODE_SOURCES,
  type DiatonicChordInfo,
  filterNonDiatonicChords,
  getAllModalInterchangeChords,
  getChordFunction,
  getDiatonicChords,
  getModalInterchangeChords,
  getSecondaryDominantChords,
  MODE_DISPLAY_NAMES,
  type ModalInterchangeChordInfo,
  noteNameToPitchClass,
  type ScaleType,
} from "@/lib/music-theory";

type KeyState = {
  rootName: string;
  chordType: "triad" | "seventh";
  selectedMode: "diatonic" | "secondary-dominant" | ScaleType;
};

const INITIAL_STATE: KeyState = {
  rootName: "C",
  chordType: "triad",
  selectedMode: "diatonic",
};

export type PaletteChordInfo = DiatonicChordInfo & { isAvailable: boolean };

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
    // モーダルインターチェンジモード
    return getModalInterchangeChords(snap.rootName, snap.selectedMode, seventh).map((mi) => ({
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

export function setSelectedMode(mode: "diatonic" | "secondary-dominant" | ScaleType): void {
  state.selectedMode = mode;
}

export function _resetKeyStoreForTesting(): void {
  state.rootName = INITIAL_STATE.rootName;
  state.chordType = INITIAL_STATE.chordType;
  state.selectedMode = INITIAL_STATE.selectedMode;
}
