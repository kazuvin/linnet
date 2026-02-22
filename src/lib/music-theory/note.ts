export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const FLAT_NOTE_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number] | (typeof FLAT_NOTE_NAMES)[number];
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Note = {
  readonly pitchClass: PitchClass;
  readonly name: string;
};

const NOTE_NAME_TO_PITCH_CLASS: Record<string, PitchClass> = {};
for (let i = 0; i < NOTE_NAMES.length; i++) {
  NOTE_NAME_TO_PITCH_CLASS[NOTE_NAMES[i]] = i as PitchClass;
  NOTE_NAME_TO_PITCH_CLASS[FLAT_NOTE_NAMES[i]] = i as PitchClass;
}

export function noteNameToPitchClass(name: string): PitchClass {
  const pc = NOTE_NAME_TO_PITCH_CLASS[name];
  if (pc === undefined) {
    throw new Error(`Invalid note name: ${name}`);
  }
  return pc;
}

export function pitchClassToNoteName(pitchClass: PitchClass, preferFlat = false): string {
  return preferFlat ? FLAT_NOTE_NAMES[pitchClass] : NOTE_NAMES[pitchClass];
}

export function createNote(name: string): Note {
  return {
    pitchClass: noteNameToPitchClass(name),
    name,
  };
}

export function areEnharmonic(a: Note, b: Note): boolean {
  return a.pitchClass === b.pitchClass;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function transposeNote(note: Note, semitones: number, preferFlat = false): Note {
  const newPitchClass = mod(note.pitchClass + semitones, 12) as PitchClass;
  return {
    pitchClass: newPitchClass,
    name: pitchClassToNoteName(newPitchClass, preferFlat),
  };
}
