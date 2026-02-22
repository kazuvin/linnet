import { createNote, type Note, transposeNote } from "./note";

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "dominant7"
  | "major7"
  | "minor7"
  | "minor7b5"
  | "diminished7"
  | "augmented7";

export const CHORD_INTERVAL_PATTERNS: Record<ChordQuality, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  minor7b5: [0, 3, 6, 10],
  diminished7: [0, 3, 6, 9],
  augmented7: [0, 4, 8, 10],
} as const;

export type Chord = {
  readonly root: Note;
  readonly quality: ChordQuality;
  readonly notes: readonly Note[];
  readonly name: string;
  readonly symbol: string;
};

const CHORD_SYMBOL_SUFFIXES: Record<ChordQuality, string> = {
  major: "",
  minor: "m",
  diminished: "dim",
  augmented: "aug",
  dominant7: "7",
  major7: "M7",
  minor7: "m7",
  minor7b5: "m7(b5)",
  diminished7: "dim7",
  augmented7: "aug7",
};

const TRIAD_TO_SEVENTH: Partial<Record<ChordQuality, ChordQuality>> = {
  major: "major7",
  minor: "minor7",
  diminished: "minor7b5",
  augmented: "augmented7",
};

export function getChordNotes(
  rootName: string,
  quality: ChordQuality,
  preferFlat = false
): readonly Note[] {
  const root = createNote(rootName);
  const pattern = CHORD_INTERVAL_PATTERNS[quality];
  return pattern.map((semitones) => {
    if (semitones === 0) {
      return root;
    }
    return transposeNote(root, semitones, preferFlat);
  });
}

export function formatChordName(rootName: string, quality: ChordQuality): string {
  return `${rootName} ${quality}`;
}

export function formatChordSymbol(rootName: string, quality: ChordQuality): string {
  return `${rootName}${CHORD_SYMBOL_SUFFIXES[quality]}`;
}

export function createChord(rootName: string, quality: ChordQuality, preferFlat = false): Chord {
  return {
    root: createNote(rootName),
    quality,
    notes: getChordNotes(rootName, quality, preferFlat),
    name: formatChordName(rootName, quality),
    symbol: formatChordSymbol(rootName, quality),
  };
}

export function isNoteInChord(note: Note, chord: Chord): boolean {
  return chord.notes.some((n) => n.pitchClass === note.pitchClass);
}

export function extendToSeventh(
  rootName: string,
  triadQuality: ChordQuality,
  preferFlat = false
): Chord {
  const seventhQuality = TRIAD_TO_SEVENTH[triadQuality];
  if (seventhQuality) {
    return createChord(rootName, seventhQuality, preferFlat);
  }
  // すでに7thコードの場合はそのまま返す
  return createChord(rootName, triadQuality, preferFlat);
}
