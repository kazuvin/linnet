import { createNote, type Note, transposeNote } from "./note";

export const SCALE_TYPES = [
  "major",
  "natural-minor",
  "harmonic-minor",
  "melodic-minor",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian",
  "altered",
  "lydian-dominant",
  "half-whole-diminished",
  "phrygian-dominant",
  // Harmonic Minor modes
  "locrian-natural6",
  "ionian-sharp5",
  "dorian-sharp4",
  "lydian-sharp2",
  "ultralocrian",
  // Melodic Minor modes
  "dorian-b2",
  "lydian-augmented",
  "mixolydian-b6",
  "locrian-natural2",
  // Pentatonic & Blues
  "pentatonic-major",
  "pentatonic-minor",
  "blues",
  // Symmetric
  "whole-tone",
  // Ethnic / Exotic
  "double-harmonic",
  "hungarian-minor",
  "neapolitan-major",
  "neapolitan-minor",
  "persian",
  "enigmatic",
  // Japanese
  "hirajoshi",
  "in-sen",
  // Bebop
  "bebop-dominant",
  "bebop-major",
  // Other
  "prometheus",
] as const;

export type ScaleType = (typeof SCALE_TYPES)[number];

export const SCALE_PATTERNS: Record<ScaleType, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  "natural-minor": [0, 2, 3, 5, 7, 8, 10],
  "harmonic-minor": [0, 2, 3, 5, 7, 8, 11],
  "melodic-minor": [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  altered: [0, 1, 3, 4, 6, 8, 10],
  "lydian-dominant": [0, 2, 4, 6, 7, 9, 10],
  "half-whole-diminished": [0, 1, 3, 4, 6, 7, 9, 10],
  "phrygian-dominant": [0, 1, 4, 5, 7, 8, 10],
  // Harmonic Minor modes
  "locrian-natural6": [0, 1, 3, 5, 6, 9, 10],
  "ionian-sharp5": [0, 2, 4, 5, 8, 9, 11],
  "dorian-sharp4": [0, 2, 3, 6, 7, 9, 10],
  "lydian-sharp2": [0, 3, 4, 6, 7, 9, 11],
  ultralocrian: [0, 1, 3, 4, 6, 8, 9],
  // Melodic Minor modes
  "dorian-b2": [0, 1, 3, 5, 7, 9, 10],
  "lydian-augmented": [0, 2, 4, 6, 8, 9, 11],
  "mixolydian-b6": [0, 2, 4, 5, 7, 8, 10],
  "locrian-natural2": [0, 2, 3, 5, 6, 8, 10],
  // Pentatonic & Blues
  "pentatonic-major": [0, 2, 4, 7, 9],
  "pentatonic-minor": [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  // Symmetric
  "whole-tone": [0, 2, 4, 6, 8, 10],
  // Ethnic / Exotic
  "double-harmonic": [0, 1, 4, 5, 7, 8, 11],
  "hungarian-minor": [0, 2, 3, 6, 7, 8, 11],
  "neapolitan-major": [0, 1, 3, 5, 7, 9, 11],
  "neapolitan-minor": [0, 1, 3, 5, 7, 8, 11],
  persian: [0, 1, 4, 5, 6, 8, 11],
  enigmatic: [0, 1, 4, 6, 8, 10, 11],
  // Japanese
  hirajoshi: [0, 2, 3, 7, 8],
  "in-sen": [0, 1, 5, 7, 10],
  // Bebop
  "bebop-dominant": [0, 2, 4, 5, 7, 9, 10, 11],
  "bebop-major": [0, 2, 4, 5, 7, 8, 9, 11],
  // Other
  prometheus: [0, 2, 4, 6, 9, 10],
} as const;

export type Scale = {
  readonly root: Note;
  readonly type: ScaleType;
  readonly notes: readonly Note[];
  readonly pattern: readonly number[];
};

const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb"]);

export function shouldPreferFlat(rootName: string): boolean {
  return FLAT_KEYS.has(rootName);
}

// マイナー系スケール（短3度を含む）ではフラット表記を優先する
// フラット表記を優先するスケール（短3度やb系変化音を含む）
const FLAT_PREFER_SCALE_TYPES = new Set<ScaleType>([
  "natural-minor",
  "harmonic-minor",
  "melodic-minor",
  "dorian",
  "phrygian",
  "aeolian",
  "locrian",
  "altered",
  "lydian-dominant",
  "half-whole-diminished",
  "phrygian-dominant",
  "locrian-natural6",
  "ionian-sharp5",
  "dorian-sharp4",
  "lydian-sharp2",
  "ultralocrian",
  "dorian-b2",
  "lydian-augmented",
  "mixolydian-b6",
  "locrian-natural2",
  "pentatonic-minor",
  "blues",
  "double-harmonic",
  "hungarian-minor",
  "neapolitan-major",
  "neapolitan-minor",
  "persian",
  "enigmatic",
  "hirajoshi",
  "in-sen",
  "bebop-dominant",
  "bebop-major",
  "prometheus",
]);

function shouldPreferFlatForScale(rootName: string, type: ScaleType): boolean {
  return shouldPreferFlat(rootName) || FLAT_PREFER_SCALE_TYPES.has(type);
}

export function createScale(rootName: string, type: ScaleType): Scale {
  const root = createNote(rootName);
  const pattern = SCALE_PATTERNS[type];
  const preferFlat = shouldPreferFlatForScale(rootName, type);
  const notes = pattern.map((semitones) => transposeNote(root, semitones, preferFlat));

  return {
    root,
    type,
    notes,
    pattern,
  };
}

export function getScaleNotes(rootName: string, type: ScaleType): readonly Note[] {
  return createScale(rootName, type).notes;
}

export function isNoteInScale(note: Note, scale: Scale): boolean {
  return scale.notes.some((n) => n.pitchClass === note.pitchClass);
}

export function getScaleDegreeNote(scale: Scale, degree: number): Note {
  const maxDegree = scale.notes.length;
  if (degree < 1 || degree > maxDegree) {
    throw new Error(`Invalid scale degree: ${degree}. Must be between 1 and ${maxDegree}.`);
  }
  return scale.notes[degree - 1];
}
