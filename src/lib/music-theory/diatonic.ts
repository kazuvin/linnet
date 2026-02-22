import { type Chord, type ChordQuality, createChord } from "./chord";
import { createScale, getScaleDegreeNote, shouldPreferFlat } from "./scale";

export type ChordFunction = "tonic" | "subdominant" | "dominant";

export type DiatonicChordInfo = {
  readonly degree: number;
  readonly romanNumeral: string;
  readonly chord: Chord;
  readonly chordFunction: ChordFunction;
};

const CHORD_FUNCTION_MAP: Record<number, ChordFunction> = {
  1: "tonic",
  2: "subdominant",
  3: "tonic",
  4: "subdominant",
  5: "dominant",
  6: "tonic",
  7: "dominant",
};

const TRIAD_QUALITIES: readonly ChordQuality[] = [
  "major",
  "minor",
  "minor",
  "major",
  "major",
  "minor",
  "diminished",
];

const SEVENTH_QUALITIES: readonly ChordQuality[] = [
  "major7",
  "minor7",
  "minor7",
  "major7",
  "dominant7",
  "minor7",
  "minor7b5",
];

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

export function getChordFunction(degree: number): ChordFunction {
  const fn = CHORD_FUNCTION_MAP[degree];
  if (fn === undefined) {
    throw new Error(`Invalid degree: ${degree}. Must be between 1 and 7.`);
  }
  return fn;
}

export function formatRomanNumeral(degree: number, quality: ChordQuality): string {
  const base = ROMAN_NUMERALS[degree - 1];

  // クオリティに応じてケースとサフィックスを決定
  switch (quality) {
    // メジャー系: 大文字
    case "major":
      return base;
    case "major7":
      return `${base}M7`;
    case "dominant7":
      return `${base}7`;

    // マイナー系: 小文字
    case "minor":
      return base.toLowerCase();
    case "minor7":
      return `${base.toLowerCase()}m7`;

    // ディミニッシュ系: 小文字 + 記号
    case "diminished":
      return `${base.toLowerCase()}\u00B0`;
    case "minor7b5":
      return `${base.toLowerCase()}m7(b5)`;
    case "diminished7":
      return `${base.toLowerCase()}dim7`;

    // オーグメント系: 大文字 + +
    case "augmented":
      return `${base}+`;
    case "augmented7":
      return `${base}+7`;
  }
}

function buildDiatonicChords(
  rootName: string,
  qualities: readonly ChordQuality[]
): readonly DiatonicChordInfo[] {
  const scale = createScale(rootName, "major");
  const preferFlat = shouldPreferFlat(rootName);

  return qualities.map((quality, index) => {
    const degree = index + 1;
    const scaleNote = getScaleDegreeNote(scale, degree);
    const chord = createChord(scaleNote.name, quality, preferFlat);

    return {
      degree,
      romanNumeral: formatRomanNumeral(degree, quality),
      chord,
      chordFunction: getChordFunction(degree),
    };
  });
}

export function getDiatonicTriads(rootName: string): readonly DiatonicChordInfo[] {
  return buildDiatonicChords(rootName, TRIAD_QUALITIES);
}

export function getDiatonicSevenths(rootName: string): readonly DiatonicChordInfo[] {
  return buildDiatonicChords(rootName, SEVENTH_QUALITIES);
}

export function getDiatonicChords(
  rootName: string,
  seventh?: boolean
): readonly DiatonicChordInfo[] {
  return seventh ? getDiatonicSevenths(rootName) : getDiatonicTriads(rootName);
}
