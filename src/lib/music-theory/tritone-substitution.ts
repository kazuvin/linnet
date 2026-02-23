import { type Chord, createChord } from "./chord";
import { formatRomanNumeral, getDiatonicChords } from "./diatonic";
import { transposeNote } from "./note";
import { shouldPreferFlat } from "./scale";

export type TritoneSubstitutionChordInfo = {
  readonly chord: Chord;
  readonly targetDegree: number;
  readonly targetRomanNumeral: string;
  readonly romanNumeral: string;
};

// セカンダリードミナントと同じ対象度数（vii°は除外）
const TARGET_DEGREES = [2, 3, 4, 5, 6] as const;

export function getTritoneSubstitutionChords(
  rootName: string,
  seventh?: boolean
): readonly TritoneSubstitutionChordInfo[] {
  const preferFlat = shouldPreferFlat(rootName);
  const diatonicChords = getDiatonicChords(rootName, false);

  return TARGET_DEGREES.map((targetDegree) => {
    const targetChordInfo = diatonicChords[targetDegree - 1];
    // セカンダリードミナントのルート（完全5度上 = 7半音上）
    const sdRoot = transposeNote(targetChordInfo.chord.root, 7, preferFlat);
    // 裏コード: セカンダリードミナントのトライトーン上（= 6半音上）
    // 裏コードは常にフラット表記を使用（bII として半音下降解決するため）
    const subVRoot = transposeNote(sdRoot, 6, true);
    const quality = seventh ? "dominant7" : "major";
    const chord = createChord(subVRoot.name, quality, true);

    const targetRomanNumeral = formatRomanNumeral(targetDegree, targetChordInfo.chord.quality);

    const prefix = seventh ? "SubV7" : "SubV";
    const romanNumeral = `${prefix}/${targetRomanNumeral}`;

    return {
      chord,
      targetDegree,
      targetRomanNumeral,
      romanNumeral,
    };
  });
}
