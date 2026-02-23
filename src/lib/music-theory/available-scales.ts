import type { ChordQuality } from "./chord";
import { getDiatonicChords } from "./diatonic";
import {
  ALL_MODE_SOURCES,
  getModalInterchangeChords,
  MODE_DISPLAY_NAMES,
} from "./modal-interchange";
import { createNote } from "./note";
import type { ScaleType } from "./scale";

export type AvailableScaleInfo = {
  readonly scaleType: ScaleType;
  readonly displayName: string;
};

const SEVENTH_QUALITIES = new Set<ChordQuality>([
  "major7",
  "minor7",
  "dominant7",
  "minor7b5",
  "diminished7",
  "augmented7",
]);

/**
 * 指定したコードが同じキー・同じ度数で出現するモードスケールを全て返す。
 * 例: Cメジャーキー、I度、C major → [Ionian, Lydian, Mixolydian]
 */
export function findAvailableScalesForChord(
  keyRoot: string,
  degree: number,
  chordRootName: string,
  chordQuality: ChordQuality
): readonly AvailableScaleInfo[] {
  if (degree < 1 || degree > 7) {
    return [];
  }

  const seventh = SEVENTH_QUALITIES.has(chordQuality);
  const targetPitchClass = createNote(chordRootName).pitchClass;
  const results: AvailableScaleInfo[] = [];

  // Ionian（ダイアトニック）をチェック
  const diatonicChords = getDiatonicChords(keyRoot, seventh);
  const diatonicChord = diatonicChords.find((c) => c.degree === degree);
  if (
    diatonicChord &&
    diatonicChord.chord.root.pitchClass === targetPitchClass &&
    diatonicChord.chord.quality === chordQuality
  ) {
    results.push({ scaleType: "major", displayName: "Ionian" });
  }

  // 各モーダルインターチェンジソースをチェック
  for (const source of ALL_MODE_SOURCES) {
    const modeChords = getModalInterchangeChords(keyRoot, source, seventh);
    const modeChord = modeChords.find((c) => c.degree === degree);
    if (
      modeChord &&
      modeChord.chord.root.pitchClass === targetPitchClass &&
      modeChord.chord.quality === chordQuality
    ) {
      results.push({
        scaleType: source,
        displayName: MODE_DISPLAY_NAMES[source],
      });
    }
  }

  return results;
}
