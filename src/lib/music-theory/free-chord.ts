import type { ChordQuality } from "./chord";
import { formatChordSymbol } from "./chord";
import type { ChordFunction } from "./diatonic";
import { formatRomanNumeral } from "./diatonic";
import { createNote } from "./note";

/**
 * コードのルートとキールートの半音差から度数を算出する。
 * 例: key=C, chord=E → 3 (III度)
 */
export function computeDegreeFromKey(keyRoot: string, chordRoot: string): number {
  const keyPc = createNote(keyRoot).pitchClass;
  const chordPc = createNote(chordRoot).pitchClass;
  const semitones = (chordPc - keyPc + 12) % 12;

  const DEGREE_MAP: Record<number, number> = {
    0: 1,
    1: 2,
    2: 2,
    3: 3,
    4: 3,
    5: 4,
    6: 4,
    7: 5,
    8: 6,
    9: 6,
    10: 7,
    11: 7,
  };

  return DEGREE_MAP[semitones];
}

/**
 * コードのルートがキーのメジャースケール上に無い場合、フラット付き度数として扱うか判定する。
 */
function isFlattedDegree(keyRoot: string, chordRoot: string): boolean {
  const keyPc = createNote(keyRoot).pitchClass;
  const chordPc = createNote(chordRoot).pitchClass;
  const semitones = (chordPc - keyPc + 12) % 12;
  // b2=1, b3=3, b5/b4=6は微妙, b6=8, b7=10
  return [1, 3, 6, 8, 10].includes(semitones);
}

/**
 * コードの品質からデフォルトの機能を推定する。
 */
function inferChordFunction(degree: number, quality: ChordQuality): ChordFunction {
  // ドミナント系
  if (
    quality === "dominant7" ||
    quality === "dominant9" ||
    quality === "dominant7sharp9" ||
    quality === "dominant7flat9" ||
    quality === "dominant7flat5" ||
    quality === "dominant11" ||
    quality === "dominant13" ||
    quality === "augmented7"
  ) {
    return "dominant";
  }
  if (degree === 5 || degree === 7) return "dominant";
  if (degree === 2 || degree === 4) return "subdominant";
  return "tonic";
}

/**
 * 自由選択コードのローマ数字表記を生成する。
 */
export function buildFreeRomanNumeral(
  keyRoot: string,
  chordRoot: string,
  quality: ChordQuality
): string {
  const degree = computeDegreeFromKey(keyRoot, chordRoot);
  const flat = isFlattedDegree(keyRoot, chordRoot);
  const prefix = flat ? "b" : "";
  return prefix + formatRomanNumeral(degree, quality);
}

/**
 * 自由選択コード用の GridChord データを構築する。
 */
export function buildFreeGridChord(keyRoot: string, chordRoot: string, quality: ChordQuality) {
  const degree = computeDegreeFromKey(keyRoot, chordRoot);
  return {
    rootName: chordRoot,
    quality,
    symbol: formatChordSymbol(chordRoot, quality),
    source: "free" as const,
    chordFunction: inferChordFunction(degree, quality),
    romanNumeral: buildFreeRomanNumeral(keyRoot, chordRoot, quality),
    degree,
  };
}
