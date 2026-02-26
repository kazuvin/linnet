import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import type { ChordFunction, ChordQuality, ScaleType } from "@/lib/music-theory";
import { noteNameToPitchClass } from "@/lib/music-theory";

/**
 * キーを変更し、プログレッション内の全コードをトランスポーズする。
 * key-store と chord-progression-store を横断する複合アクション。
 */
export function changeKey(rootName: string): void {
  const oldPitchClass = noteNameToPitchClass(useKeyStore.getState().rootName);
  const newPitchClass = noteNameToPitchClass(rootName);
  const semitones = (newPitchClass - oldPitchClass + 12) % 12;
  useKeyStore.getState().setRootName(rootName);
  useChordProgressionStore.getState().transposeAllChords(semitones, rootName);
}

/**
 * プログレッション内のコードを選択し、フレットボードのスケール選択をリセットする。
 * chord-progression-store と fretboard-store を横断する複合アクション。
 */
export function selectProgressionChord(id: string | null): void {
  useChordProgressionStore.getState().selectChord(id);
  useFretboardStore.getState().resetSelectedScaleType();
}

/**
 * コードをプログレッションに追加し、追加したコードを選択状態にする。
 * chord-progression-store と fretboard-store を横断する複合アクション。
 */
export function addAndSelectChord(
  rootName: string,
  quality: ChordQuality,
  source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType,
  chordFunction: ChordFunction,
  romanNumeral: string,
  degree: number
): string {
  const store = useChordProgressionStore.getState();
  const id = store.addChord(rootName, quality, source, chordFunction, romanNumeral, degree);
  useChordProgressionStore.getState().selectChord(id);
  useFretboardStore.getState().resetSelectedScaleType();
  return id;
}
