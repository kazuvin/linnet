import { type Chord, type ChordQuality, createChord } from "./chord";
import { type ChordFunction, formatRomanNumeral } from "./diatonic";
import { createNote, transposeNote } from "./note";
import type { ScaleType } from "./scale";
import { shouldPreferFlat } from "./scale";

export type CategoryId = "neo-soul";

export type CategoryChordInfo = {
  readonly degree: number;
  readonly chord: Chord;
  readonly source: "diatonic" | "secondary-dominant" | ScaleType;
  readonly romanNumeral: string;
  readonly chordFunction: ChordFunction;
};

type CategoryChordSpec = {
  readonly degree: number;
  readonly flat: boolean;
  readonly semitones: number;
  readonly triadQuality: ChordQuality;
  readonly seventhQuality: ChordQuality;
  readonly source: "diatonic" | "secondary-dominant" | ScaleType;
  readonly chordFunction: ChordFunction;
};

// ネオソウルでよく使われるコード定義（度数順）
const NEO_SOUL_CHORDS: readonly CategoryChordSpec[] = [
  // I - Ionian（ダイアトニック）
  {
    degree: 1,
    flat: false,
    semitones: 0,
    triadQuality: "major",
    seventhQuality: "major7",
    source: "diatonic",
    chordFunction: "tonic",
  },
  // ii - Dorian（ダイアトニック）
  {
    degree: 2,
    flat: false,
    semitones: 2,
    triadQuality: "minor",
    seventhQuality: "minor7",
    source: "diatonic",
    chordFunction: "subdominant",
  },
  // II - セカンダリードミナント（V/V）
  {
    degree: 2,
    flat: false,
    semitones: 2,
    triadQuality: "major",
    seventhQuality: "dominant7",
    source: "secondary-dominant",
    chordFunction: "dominant",
  },
  // bIII - Natural Minor借用
  {
    degree: 3,
    flat: true,
    semitones: 3,
    triadQuality: "major",
    seventhQuality: "major7",
    source: "natural-minor",
    chordFunction: "tonic",
  },
  // iii - Phrygian（ダイアトニック）
  {
    degree: 3,
    flat: false,
    semitones: 4,
    triadQuality: "minor",
    seventhQuality: "minor7",
    source: "diatonic",
    chordFunction: "tonic",
  },
  // IV - Lydian（ダイアトニック）
  {
    degree: 4,
    flat: false,
    semitones: 5,
    triadQuality: "major",
    seventhQuality: "major7",
    source: "diatonic",
    chordFunction: "subdominant",
  },
  // iv - Dorian借用
  {
    degree: 4,
    flat: false,
    semitones: 5,
    triadQuality: "minor",
    seventhQuality: "minor7",
    source: "dorian",
    chordFunction: "subdominant",
  },
  // V - Mixolydian（ダイアトニック）
  {
    degree: 5,
    flat: false,
    semitones: 7,
    triadQuality: "major",
    seventhQuality: "dominant7",
    source: "diatonic",
    chordFunction: "dominant",
  },
  // bVI - Natural Minor借用
  {
    degree: 6,
    flat: true,
    semitones: 8,
    triadQuality: "major",
    seventhQuality: "major7",
    source: "natural-minor",
    chordFunction: "subdominant",
  },
  // vi - Aeolian（ダイアトニック）
  {
    degree: 6,
    flat: false,
    semitones: 9,
    triadQuality: "minor",
    seventhQuality: "minor7",
    source: "diatonic",
    chordFunction: "tonic",
  },
  // bVII - Mixolydian借用
  {
    degree: 7,
    flat: true,
    semitones: 10,
    triadQuality: "major",
    seventhQuality: "dominant7",
    source: "mixolydian",
    chordFunction: "dominant",
  },
];

const CATEGORY_SPECS: Record<CategoryId, readonly CategoryChordSpec[]> = {
  "neo-soul": NEO_SOUL_CHORDS,
};

export const ALL_CATEGORY_IDS: readonly CategoryId[] = ["neo-soul"];

export const CATEGORY_DISPLAY_NAMES: Record<CategoryId, string> = {
  "neo-soul": "Neo Soul",
};

function buildRomanNumeral(degree: number, flat: boolean, quality: ChordQuality): string {
  const prefix = flat ? "b" : "";
  return prefix + formatRomanNumeral(degree, quality);
}

export function getCategoryChords(
  rootName: string,
  categoryId: CategoryId,
  seventh?: boolean
): readonly CategoryChordInfo[] {
  const specs = CATEGORY_SPECS[categoryId];
  if (!specs) {
    return [];
  }

  const rootNote = createNote(rootName);
  const preferFlat = shouldPreferFlat(rootName);

  return specs.map((spec) => {
    const quality = seventh ? spec.seventhQuality : spec.triadQuality;
    // フラットの借用コードは常にフラット表記を優先
    const useFlat = preferFlat || spec.flat || spec.source !== "diatonic";
    const chordRoot = transposeNote(rootNote, spec.semitones, useFlat);
    const chord = createChord(chordRoot.name, quality, useFlat);
    const romanNumeral = buildRomanNumeral(spec.degree, spec.flat, quality);

    return {
      degree: spec.degree,
      chord,
      source: spec.source,
      romanNumeral,
      chordFunction: spec.chordFunction,
    };
  });
}
