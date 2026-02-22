import { useMemo } from "react";
import { proxy, useSnapshot } from "valtio";
import {
  ALL_MODE_SOURCES,
  type DiatonicChordInfo,
  filterNonDiatonicChords,
  getAllModalInterchangeChords,
  getDiatonicChords,
  getModalInterchangeChords,
  MODE_DISPLAY_NAMES,
  type ModalInterchangeChordInfo,
  type ScaleType,
} from "@/lib/music-theory";

type KeyState = {
  rootName: string;
  chordType: "triad" | "seventh";
};

const INITIAL_STATE: KeyState = {
  rootName: "C",
  chordType: "triad",
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

export function setRootName(rootName: string): void {
  state.rootName = rootName;
}

export function setChordType(chordType: "triad" | "seventh"): void {
  state.chordType = chordType;
}

export function _resetKeyStoreForTesting(): void {
  state.rootName = INITIAL_STATE.rootName;
  state.chordType = INITIAL_STATE.chordType;
}
