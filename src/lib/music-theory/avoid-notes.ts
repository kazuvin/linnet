import { type ChordQuality, createChord } from "./chord";
import type { PitchClass } from "./note";
import { createScale, type ScaleType } from "./scale";

/**
 * アヴォイドノートのピッチクラス集合を返す
 *
 * アヴォイドノート: スケールトーン（コードトーン以外）のうち、
 * コードトーンの半音上（短9度上）に位置する音。
 * コード上で長く伸ばすと不協和になるため「避けるべき音」とされる。
 */
export function getAvoidPitchClasses(
  scaleRootName: string,
  scaleType: ScaleType,
  chordRootName: string,
  chordQuality: ChordQuality
): ReadonlySet<PitchClass> {
  const scale = createScale(scaleRootName, scaleType);
  const chord = createChord(chordRootName, chordQuality);

  const chordPitchClasses = new Set(chord.notes.map((n) => n.pitchClass));
  const scalePitchClasses = new Set(scale.notes.map((n) => n.pitchClass));

  const avoidPitchClasses = new Set<PitchClass>();

  for (const scalePc of scalePitchClasses) {
    // コードトーン自体はアヴォイドにならない
    if (chordPitchClasses.has(scalePc)) continue;

    // このスケールトーンがいずれかのコードトーンの半音上かチェック
    const halfStepBelow = ((scalePc - 1 + 12) % 12) as PitchClass;
    if (chordPitchClasses.has(halfStepBelow)) {
      avoidPitchClasses.add(scalePc);
    }
  }

  return avoidPitchClasses;
}
