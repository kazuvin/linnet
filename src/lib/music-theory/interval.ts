import { type Note, transposeNote } from "./note";

export type IntervalQuality = "perfect" | "major" | "minor" | "augmented" | "diminished";

export type Interval = {
  readonly semitones: number;
  readonly quality: IntervalQuality;
  readonly degree: number;
  readonly name: string;
};

export const INTERVALS = {
  P1: { semitones: 0, quality: "perfect", degree: 1, name: "P1" },
  m2: { semitones: 1, quality: "minor", degree: 2, name: "m2" },
  M2: { semitones: 2, quality: "major", degree: 2, name: "M2" },
  m3: { semitones: 3, quality: "minor", degree: 3, name: "m3" },
  M3: { semitones: 4, quality: "major", degree: 3, name: "M3" },
  P4: { semitones: 5, quality: "perfect", degree: 4, name: "P4" },
  A4: { semitones: 6, quality: "augmented", degree: 4, name: "A4" },
  d5: { semitones: 6, quality: "diminished", degree: 5, name: "d5" },
  P5: { semitones: 7, quality: "perfect", degree: 5, name: "P5" },
  m6: { semitones: 8, quality: "minor", degree: 6, name: "m6" },
  M6: { semitones: 9, quality: "major", degree: 6, name: "M6" },
  m7: { semitones: 10, quality: "minor", degree: 7, name: "m7" },
  M7: { semitones: 11, quality: "major", degree: 7, name: "M7" },
  P8: { semitones: 12, quality: "perfect", degree: 8, name: "P8" },
} as const satisfies Record<string, Interval>;

const SEMITONES_TO_INTERVAL: Record<number, Interval> = {};
for (const interval of Object.values(INTERVALS)) {
  // A4 と d5 は同じ半音数。A4 を優先
  if (!(interval.semitones in SEMITONES_TO_INTERVAL)) {
    SEMITONES_TO_INTERVAL[interval.semitones] = interval;
  }
}

export function createInterval(semitones: number): Interval {
  const found = SEMITONES_TO_INTERVAL[semitones];
  if (found) {
    return found;
  }
  return { semitones, quality: "perfect", degree: 0, name: `${semitones}st` };
}

export function intervalBetween(from: Note, to: Note): Interval {
  const semitones = (((to.pitchClass - from.pitchClass) % 12) + 12) % 12;
  return createInterval(semitones);
}

export function applyInterval(note: Note, interval: Interval, preferFlat = false): Note {
  return transposeNote(note, interval.semitones, preferFlat);
}

export function invertInterval(interval: Interval): Interval {
  return createInterval(12 - interval.semitones);
}
