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
