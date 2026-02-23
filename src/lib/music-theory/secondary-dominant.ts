import { type Chord, createChord } from "./chord";
import { formatRomanNumeral, getDiatonicChords } from "./diatonic";
import { transposeNote } from "./note";
import { shouldPreferFlat } from "./scale";

export type SecondaryDominantChordInfo = {
  readonly chord: Chord;
  readonly targetDegree: number;
  readonly targetRomanNumeral: string;
  readonly romanNumeral: string;
};

// セカンダリードミナントの対象度数（vii°は除外）
const TARGET_DEGREES = [2, 3, 4, 5, 6] as const;

export function getSecondaryDominantChords(
  rootName: string,
  seventh?: boolean
): readonly SecondaryDominantChordInfo[] {
  const preferFlat = shouldPreferFlat(rootName);
  const diatonicChords = getDiatonicChords(rootName, false);

  return TARGET_DEGREES.map((targetDegree) => {
    const targetChordInfo = diatonicChords[targetDegree - 1];
    // セカンダリードミナントのルートは解決先の完全5度上（= 7半音上）
    const sdRoot = transposeNote(targetChordInfo.chord.root, 7, preferFlat);
    const quality = seventh ? "dominant7" : "major";
    const chord = createChord(sdRoot.name, quality, preferFlat);

    const targetRomanNumeral = formatRomanNumeral(targetDegree, targetChordInfo.chord.quality);

    const prefix = seventh ? "V7" : "V";
    const romanNumeral = `${prefix}/${targetRomanNumeral}`;

    return {
      chord,
      targetDegree,
      targetRomanNumeral,
      romanNumeral,
    };
  });
}
