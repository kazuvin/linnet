import { CHORD_INTERVAL_PATTERNS, type ChordQuality } from "./chord";
import { getDiatonicChords } from "./diatonic";
import { ALL_MODE_SOURCES } from "./modal-interchange";
import { createNote } from "./note";
import { createScale, getScaleDegreeNote, type Scale, type ScaleType } from "./scale";

export type AvailableScaleInfo = {
  readonly scaleType: ScaleType;
  readonly displayName: string;
};

/** セカンダリードミナントコード上で使用できるスケール一覧 */
export const SECONDARY_DOMINANT_SCALES: readonly AvailableScaleInfo[] = [
  { scaleType: "mixolydian", displayName: "Mixolydian" },
  { scaleType: "altered", displayName: "Altered" },
  { scaleType: "lydian-dominant", displayName: "Lydian Dominant" },
  { scaleType: "half-whole-diminished", displayName: "Half-Whole Dim" },
  { scaleType: "phrygian-dominant", displayName: "Phrygian Dominant" },
];

/** 全ScaleTypeの表示名マッピング */
export const SCALE_DISPLAY_NAMES: Partial<Record<ScaleType, string>> = {
  major: "Ionian",
  "natural-minor": "Natural Minor",
  "harmonic-minor": "Harmonic Minor",
  "melodic-minor": "Melodic Minor",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  aeolian: "Aeolian",
  locrian: "Locrian",
  altered: "Altered",
  "lydian-dominant": "Lydian Dominant",
  "half-whole-diminished": "Half-Whole Dim",
  "phrygian-dominant": "Phrygian Dominant",
  // Harmonic Minor modes
  "locrian-natural6": "Locrian \u266e6",
  "ionian-sharp5": "Ionian #5",
  "dorian-sharp4": "Dorian #4",
  "lydian-sharp2": "Lydian #2",
  ultralocrian: "Ultralocrian",
  // Melodic Minor modes
  "dorian-b2": "Dorian b2",
  "lydian-augmented": "Lydian Augmented",
  "mixolydian-b6": "Mixolydian b6",
  "locrian-natural2": "Locrian \u266e2",
};

/**
 * 親スケール（キールートベース）の各度数に対応するモード（コードルートベース）のマッピング。
 * インデックス 0 = I度, 1 = II度, ..., 6 = VII度
 */
const MODE_ROTATION: Partial<Record<ScaleType, readonly ScaleType[]>> = {
  // Major (Ionian) modes
  major: ["major", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"],
  // Natural Minor (Aeolian) modes
  "natural-minor": ["aeolian", "locrian", "major", "dorian", "phrygian", "lydian", "mixolydian"],
  // Harmonic Minor modes
  "harmonic-minor": [
    "harmonic-minor",
    "locrian-natural6",
    "ionian-sharp5",
    "dorian-sharp4",
    "phrygian-dominant",
    "lydian-sharp2",
    "ultralocrian",
  ],
  // Melodic Minor modes
  "melodic-minor": [
    "melodic-minor",
    "dorian-b2",
    "lydian-augmented",
    "lydian-dominant",
    "mixolydian-b6",
    "locrian-natural2",
    "altered",
  ],
  // Church modes (rotations of major)
  dorian: ["dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian", "major"],
  phrygian: ["phrygian", "lydian", "mixolydian", "aeolian", "locrian", "major", "dorian"],
  lydian: ["lydian", "mixolydian", "aeolian", "locrian", "major", "dorian", "phrygian"],
  mixolydian: ["mixolydian", "aeolian", "locrian", "major", "dorian", "phrygian", "lydian"],
};

/**
 * 親スケールの指定度数に対応するモード（コードルート基準）を返す。
 * 例: ("major", 3) → "phrygian" (Ionian の III 度モード)
 */
export function getRotatedMode(parentScaleType: ScaleType, degree: number): ScaleType | null {
  const modes = MODE_ROTATION[parentScaleType];
  if (!modes || degree < 1 || degree > modes.length) return null;
  return modes[degree - 1];
}

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
 * コードのソース（出所モード）と度数から、デフォルトで表示すべきスケールを返す。
 * "diatonic" → major の回転モード、ScaleType → そのモードの回転モード。
 * "secondary-dominant" / "tritone-substitution" は別途ハンドリングするため null。
 */
export function getDefaultScaleForSource(
  source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType,
  degree: number
): ScaleType | null {
  if (source === "secondary-dominant" || source === "tritone-substitution") {
    return null;
  }
  const parentScaleType: ScaleType = source === "diatonic" ? "major" : source;
  return getRotatedMode(parentScaleType, degree);
}

/**
 * availableScales を defaultScaleType が先頭に来るよう並び替える。
 * 元の配列は変更しない。デフォルトが見つからない場合は元の順序のまま。
 */
export function sortScalesWithDefault(
  scales: readonly AvailableScaleInfo[],
  defaultScaleType: ScaleType
): readonly AvailableScaleInfo[] {
  const idx = scales.findIndex((s) => s.scaleType === defaultScaleType);
  if (idx <= 0) return [...scales];
  return [scales[idx], ...scales.slice(0, idx), ...scales.slice(idx + 1)];
}

/**
 * 指定したコードが同じキー・同じ度数で出現するモードスケールを全て返す。
 * 結果はコードルート基準の回転モードとして返す。
 * 例: Cキー、III度、Em → [E Phrygian, E Aeolian]
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
    const rotated = getRotatedMode("major", degree);
    if (rotated) {
      results.push({
        scaleType: rotated,
        displayName: SCALE_DISPLAY_NAMES[rotated] ?? rotated,
      });
    }
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
      const rotated = getRotatedMode(source, degree);
      if (rotated) {
        results.push({
          scaleType: rotated,
          displayName: SCALE_DISPLAY_NAMES[rotated] ?? rotated,
        });
      }
    }
  }

  return results;
}
