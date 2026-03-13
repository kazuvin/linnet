import { CHORD_INTERVAL_PATTERNS, type ChordQuality } from "./chord";
import { FLAT_NOTE_NAMES, NOTE_NAMES, type PitchClass } from "./note";

export type ChordSearchResult = {
  readonly rootName: string;
  readonly quality: ChordQuality;
  readonly symbol: string;
  readonly pitchClasses: readonly number[];
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
  sus2: "sus2",
  sus4: "sus4",
  "6": "6",
  minor6: "m6",
  minorMajor7: "mM7",
  "7sus4": "7sus4",
  add9: "add9",
  dominant9: "9",
  major9: "M9",
  minor9: "m9",
  dominant7sharp9: "7(#9)",
  dominant7flat9: "7(b9)",
};

const FLAT_KEYS = new Set(["Db", "Eb", "Gb", "Ab", "Bb"]);

/**
 * 指定したピッチクラスを全て含むコードを検索する。
 * 全12ルート × 全コードクオリティの組み合わせを走査し、
 * コードの構成音ピッチクラスが指定のピッチクラスを全て含むものを返す。
 */
export function findChordsContainingNotes(
  pitchClasses: readonly PitchClass[]
): ChordSearchResult[] {
  if (pitchClasses.length === 0) return [];

  const targetSet = new Set(pitchClasses);
  const results: ChordSearchResult[] = [];

  for (let rootPc = 0; rootPc < 12; rootPc++) {
    const sharpName = NOTE_NAMES[rootPc];
    const flatName = FLAT_NOTE_NAMES[rootPc];
    // フラット系キーはフラット表記を優先
    const rootName = FLAT_KEYS.has(flatName) ? flatName : sharpName;

    for (const [quality, pattern] of Object.entries(CHORD_INTERVAL_PATTERNS)) {
      const chordPitchClasses = pattern.map((interval) => ((rootPc + interval) % 12) as PitchClass);
      const containsAll = [...targetSet].every((pc) => chordPitchClasses.includes(pc));

      if (containsAll) {
        results.push({
          rootName,
          quality: quality as ChordQuality,
          symbol: `${rootName}${CHORD_SYMBOL_SUFFIXES[quality as ChordQuality]}`,
          pitchClasses: chordPitchClasses,
        });
      }
    }
  }

  return results;
}
