import {
  addChord,
  selectChord,
  transposeAllChords,
} from "@/features/chord-progression/stores/chord-progression-store";
import { resetSelectedScaleType } from "@/features/fretboard/stores/fretboard-store";
import { getRootName, setRootName } from "@/features/key-selection/stores/key-store";
import type { ChordFunction, ChordQuality, ScaleType } from "@/lib/music-theory";
import { noteNameToPitchClass } from "@/lib/music-theory";

/**
 * キーを変更し、プログレッション内の全コードをトランスポーズする。
 * key-store と chord-progression-store を横断する複合アクション。
 */
export function changeKey(rootName: string): void {
  const oldPitchClass = noteNameToPitchClass(getRootName());
  const newPitchClass = noteNameToPitchClass(rootName);
  const semitones = (newPitchClass - oldPitchClass + 12) % 12;
  setRootName(rootName);
  transposeAllChords(semitones, rootName);
}

/**
 * プログレッション内のコードを選択し、フレットボードのスケール選択をリセットする。
 * chord-progression-store と fretboard-store を横断する複合アクション。
 */
export function selectProgressionChord(id: string | null): void {
  selectChord(id);
  resetSelectedScaleType();
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
  const id = addChord(rootName, quality, source, chordFunction, romanNumeral, degree);
  selectChord(id);
  resetSelectedScaleType();
  return id;
}
