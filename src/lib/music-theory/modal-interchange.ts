import { type Chord, type ChordQuality, createChord, extendToSeventh } from "./chord";
import {
  type DiatonicChordInfo,
  formatRomanNumeral,
  getDiatonicChords,
  getDiatonicTriads,
} from "./diatonic";
import type { ScaleType } from "./scale";
import { createScale, getScaleDegreeNote, shouldPreferFlat } from "./scale";

export type ModalInterchangeChordInfo = {
  readonly degree: number;
  readonly chord: Chord;
  readonly source: ScaleType;
  readonly romanNumeral: string;
  readonly isAvailable: boolean;
};

// 各モードスケールのダイアトニックトライアドのクオリティ
const MODE_TRIAD_QUALITIES: Record<string, readonly ChordQuality[]> = {
  "natural-minor": ["minor", "diminished", "major", "minor", "minor", "major", "major"],
  "harmonic-minor": ["minor", "diminished", "augmented", "minor", "major", "major", "diminished"],
  "melodic-minor": ["minor", "minor", "augmented", "major", "major", "diminished", "diminished"],
  dorian: ["minor", "minor", "major", "major", "minor", "diminished", "major"],
  phrygian: ["minor", "major", "major", "minor", "diminished", "major", "minor"],
  lydian: ["major", "major", "minor", "diminished", "major", "minor", "minor"],
  mixolydian: ["major", "minor", "diminished", "major", "minor", "minor", "major"],
};

const DEFAULT_SOURCES: readonly ScaleType[] = [
  "natural-minor",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
];

export const ALL_MODE_SOURCES: readonly ScaleType[] = [
  "natural-minor",
  "harmonic-minor",
  "melodic-minor",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
];

export const MODE_DISPLAY_NAMES: Record<string, string> = {
  "natural-minor": "Natural Minor",
  "harmonic-minor": "Harmonic Minor",
  "melodic-minor": "Melodic Minor",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
};

function isDiatonicChord(chord: Chord, diatonicChords: readonly DiatonicChordInfo[]): boolean {
  return diatonicChords.some(
    (d) => d.chord.root.pitchClass === chord.root.pitchClass && d.chord.quality === chord.quality
  );
}

export function getModalInterchangeChords(
  rootName: string,
  source: ScaleType,
  seventh?: boolean
): readonly ModalInterchangeChordInfo[] {
  const qualities = MODE_TRIAD_QUALITIES[source];
  if (!qualities) {
    return [];
  }

  const scale = createScale(rootName, source);
  const preferFlat = shouldPreferFlat(rootName) || source !== "major";
  const diatonicChords = getDiatonicChords(rootName, seventh);

  return qualities.map((quality, index) => {
    const degree = index + 1;
    const scaleNote = getScaleDegreeNote(scale, degree);
    const chord = seventh
      ? extendToSeventh(scaleNote.name, quality, preferFlat)
      : createChord(scaleNote.name, quality, preferFlat);
    const romanNumeral = formatRomanNumeral(degree, chord.quality);

    return {
      degree,
      chord,
      source,
      romanNumeral,
      isAvailable: !isDiatonicChord(chord, diatonicChords),
    };
  });
}

export function getAllModalInterchangeChords(
  rootName: string,
  sources: readonly ScaleType[] = DEFAULT_SOURCES
): readonly ModalInterchangeChordInfo[] {
  return sources.flatMap((source) => getModalInterchangeChords(rootName, source));
}

export function filterNonDiatonicChords(
  rootName: string,
  chords: readonly ModalInterchangeChordInfo[]
): readonly ModalInterchangeChordInfo[] {
  const diatonicChords = getDiatonicTriads(rootName);
  return chords.filter((info) => !isDiatonicChord(info.chord, diatonicChords));
}
