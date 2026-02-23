import { CHORD_INTERVAL_PATTERNS, type ChordQuality } from "./chord";
import { getDiatonicChords } from "./diatonic";
import { ALL_MODE_SOURCES, MODE_DISPLAY_NAMES } from "./modal-interchange";
import { createNote } from "./note";
import { createScale, getScaleDegreeNote, type Scale, type ScaleType } from "./scale";

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
 * スケールの実際の音から3度堆積でコードの品質を判定する。
 * extendToSeventh と異なり、スケールの文脈を正しく反映する。
 * 例: Mixolydian I度 → dominant7（major7 ではない）
 */
export function computeChordQualityFromScale(
  scale: Scale,
  degree: number,
  seventh: boolean
): ChordQuality | null {
  const rootIdx = degree - 1;
  const stackSize = seventh ? 4 : 3;

  const root = scale.notes[rootIdx];
  const intervals: number[] = [0];
  for (let i = 1; i < stackSize; i++) {
    const note = scale.notes[(rootIdx + i * 2) % 7];
    intervals.push((note.pitchClass - root.pitchClass + 12) % 12);
  }

  for (const [quality, pattern] of Object.entries(CHORD_INTERVAL_PATTERNS)) {
    if (pattern.length === stackSize && pattern.every((p, i) => p === intervals[i])) {
      return quality as ChordQuality;
    }
  }
  return null;
}

/**
 * 指定したコードが同じキー・同じ度数で出現するモードスケールを全て返す。
 * スケールの実音から3度堆積でコード品質を判定するため、
 * セブンスコードでも正確な結果を返す。
 * 例: Fメジャーキー、I度、FM7 → [Ionian, Lydian]（Mixolydian は F7 なので除外）
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

  // Ionian（ダイアトニック）をチェック — SEVENTH_QUALITIES で正確
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
  // スケールの実音から3度堆積でコード品質を判定
  for (const source of ALL_MODE_SOURCES) {
    const scale = createScale(keyRoot, source);
    const scaleRoot = getScaleDegreeNote(scale, degree);

    // ルート音が一致しなければスキップ
    if (scaleRoot.pitchClass !== targetPitchClass) continue;

    const actualQuality = computeChordQualityFromScale(scale, degree, seventh);
    if (actualQuality === chordQuality) {
      results.push({
        scaleType: source,
        displayName: MODE_DISPLAY_NAMES[source],
      });
    }
  }

  return results;
}
