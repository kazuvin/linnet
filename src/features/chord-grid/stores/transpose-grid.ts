import type { PitchClass } from "@/lib/music-theory";
import {
  formatChordSymbol,
  noteNameToPitchClass,
  pitchClassToNoteName,
  shouldPreferFlat,
} from "@/lib/music-theory";
import type { GridChord } from "./chord-grid-store";

/**
 * 単一の GridChord を旧キーから新キーへトランスポーズする。
 * rootName と symbol のみ変更し、quality・romanNumeral・degree・source・chordFunction は維持する。
 */
export function transposeGridChord(chord: GridChord, oldRoot: string, newRoot: string): GridChord {
  const oldPc = noteNameToPitchClass(oldRoot);
  const newPc = noteNameToPitchClass(newRoot);
  const interval = ((newPc - oldPc + 12) % 12) as number;

  if (interval === 0) return chord;

  // 裏コードは常にフラット表記を使用
  const preferFlat = chord.source === "tritone-substitution" ? true : shouldPreferFlat(newRoot);

  const chordPc = noteNameToPitchClass(chord.rootName);
  const newChordPc = ((chordPc + interval) % 12) as PitchClass;
  const newRootName = pitchClassToNoteName(newChordPc, preferFlat);
  const newSymbol = formatChordSymbol(newRootName, chord.quality);

  return {
    ...chord,
    rootName: newRootName,
    symbol: newSymbol,
  };
}

/**
 * グリッド全行のコードをトランスポーズする。
 * 元の rows は変更しない（イミュータブル）。
 */
export function transposeGridRows(
  rows: (GridChord | null)[][],
  oldRoot: string,
  newRoot: string
): (GridChord | null)[][] {
  return rows.map((row) =>
    row.map((cell) => (cell ? transposeGridChord(cell, oldRoot, newRoot) : null))
  );
}
