import { CHORD_INTERVAL_PATTERNS, type ChordQuality, createChord } from "./chord";
import { type ChordFunction, formatRomanNumeral, getChordFunction } from "./diatonic";
import {
  createScale,
  getScaleDegreeNote,
  SCALE_PATTERNS,
  type ScaleType,
  shouldPreferFlat,
} from "./scale";

export type ScaleChordInfo = {
  readonly degree: number;
  readonly romanNumeral: string;
  readonly chord: ReturnType<typeof createChord>;
  readonly chordFunction: ChordFunction;
};

export type DegreeChordGroup = {
  readonly degree: number;
  readonly chords: readonly ScaleChordInfo[];
};

/** コードの構成音が全てスケール内に収まるかチェック */
function chordFitsInScale(
  rootPitchClass: number,
  quality: ChordQuality,
  scalePitchClasses: Set<number>
): boolean {
  const intervals = CHORD_INTERVAL_PATTERNS[quality];
  return intervals.every((interval) => scalePitchClasses.has((rootPitchClass + interval) % 12));
}

/** チェック対象のコードクオリティ（表示順） */
const QUALITIES_TO_CHECK: readonly ChordQuality[] = [
  // トライアド
  "major",
  "minor",
  "diminished",
  "augmented",
  "sus2",
  "sus4",
  // 7th
  "major7",
  "dominant7",
  "minor7",
  "minor7b5",
  "diminished7",
  "augmented7",
  "augmentedMajor7",
  "minorMajor7",
  "7sus2",
  "7sus4",
  // 6th
  "6",
  "minor6",
  // add9
  "add9",
  // 9th
  "dominant9",
  "major9",
  "minor9",
  // 11th
  "dominant11",
  "minor11",
  // 13th
  "dominant13",
  "major13",
  "minor13",
];

/**
 * 指定されたスケール内の各ディグリーから構成可能な全コードを返す。
 * コードの全構成音がスケール内に含まれるもののみ返す。
 */
export function findAllChordsInScale(
  rootName: string,
  scaleType: ScaleType
): readonly DegreeChordGroup[] {
  const scale = createScale(rootName, scaleType);
  const pattern = SCALE_PATTERNS[scaleType];
  const scalePitchClasses = new Set(
    pattern.map((interval) => (scale.root.pitchClass + interval) % 12)
  );
  const preferFlat = shouldPreferFlat(rootName) || scaleType !== "major";
  const degreeCount = scale.notes.length;

  const groups: DegreeChordGroup[] = [];

  for (let degree = 1; degree <= degreeCount; degree++) {
    const degreeNote = getScaleDegreeNote(scale, degree);
    const chords: ScaleChordInfo[] = [];

    for (const quality of QUALITIES_TO_CHECK) {
      if (chordFitsInScale(degreeNote.pitchClass, quality, scalePitchClasses)) {
        const chord = createChord(degreeNote.name, quality, preferFlat);
        const chordFunction: ChordFunction = degreeCount >= 7 ? getChordFunction(degree) : "tonic";

        chords.push({
          degree,
          romanNumeral: formatRomanNumeral(degree, quality),
          chord,
          chordFunction,
        });
      }
    }

    groups.push({ degree, chords });
  }

  return groups;
}
