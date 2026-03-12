import { SCALE_DISPLAY_NAMES } from "./available-scales";
import { CHORD_INTERVAL_PATTERNS, type ChordQuality } from "./chord";
import { createNote, type PitchClass } from "./note";
import { createScale, SCALE_TYPES, type ScaleType } from "./scale";

export type ChordScaleMatch = {
  readonly scaleType: ScaleType;
  readonly displayName: string;
};

/**
 * キーに依存せず、指定したコード（ルート＋クオリティ）の全構成音を含むスケールを返す。
 * 全 ScaleType を対象に、コードルートからスケールを生成し、コードトーンが全て含まれるかを判定する。
 */
export function findScalesForChord(rootName: string, quality: ChordQuality): ChordScaleMatch[] {
  const root = createNote(rootName);
  const chordIntervals = CHORD_INTERVAL_PATTERNS[quality];
  const chordPitchClasses = chordIntervals.map(
    (interval) => ((root.pitchClass + interval) % 12) as PitchClass
  );

  const results: ChordScaleMatch[] = [];
  const seen = new Set<ScaleType>();

  for (const scaleType of SCALE_TYPES) {
    const scale = createScale(rootName, scaleType);
    const scalePitchClasses = new Set(scale.notes.map((n) => n.pitchClass));

    const containsAllChordTones = chordPitchClasses.every((pc) => scalePitchClasses.has(pc));

    if (containsAllChordTones && !seen.has(scaleType)) {
      seen.add(scaleType);
      results.push({
        scaleType,
        displayName: SCALE_DISPLAY_NAMES[scaleType] ?? scaleType,
      });
    }
  }

  return results;
}
