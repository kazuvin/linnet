import { createNote, type PitchClass } from "./note";
import type { ScaleType } from "./scale";

/**
 * 各スケールの特性音（characteristic notes）を半音数で定義
 *
 * 特性音: そのスケール/モードを他のスケールと区別する最も重要な音程
 * - チャーチモード: メジャー型はイオニアン、マイナー型はエオリアンとの差分
 * - その他: 親スケールとの差分や、そのスケール固有の特徴的な音程
 */
export const CHARACTERISTIC_INTERVALS: Partial<Record<ScaleType, readonly number[]>> = {
  // チャーチモード
  major: [5], // P4 — リディアンとの差（半音上にM3がある唯一の音）
  dorian: [9], // M6 — エオリアンとの差（♮6）
  phrygian: [1], // m2 — エオリアンとの差（♭2）
  lydian: [6], // #4 — イオニアンとの差
  mixolydian: [10], // b7 — イオニアンとの差
  aeolian: [8], // m6 — ドリアンとの差（♭6）
  locrian: [6], // dim5 — フリジアンとの差（♭5）

  // ナチュラルマイナーはエオリアンと同一
  "natural-minor": [8], // m6

  // ハーモニックマイナーとそのモード
  "harmonic-minor": [11], // M7 — ナチュラルマイナーとの差（♮7）
  "locrian-natural6": [9], // ♮6 — ロクリアンとの差
  "ionian-sharp5": [8], // #5 — イオニアンとの差
  "dorian-sharp4": [6], // #4 — ドリアンとの差
  "lydian-sharp2": [3], // #2 — リディアンとの差
  ultralocrian: [9], // bb7(=M6) — ロクリアンとの差

  // メロディックマイナーとそのモード
  "melodic-minor": [9, 11], // M6, M7 — ナチュラルマイナーとの差
  "dorian-b2": [1], // b2 — ドリアンとの差
  "lydian-augmented": [6, 8], // #4, #5 — リディアンとの差
  "mixolydian-b6": [8], // b6 — ミクソリディアンとの差
  "locrian-natural2": [2], // ♮2 — ロクリアンとの差

  // セカンダリードミナント / 特殊スケール
  altered: [1, 6], // b2, b5 — ミクソリディアンとの差で最も特徴的な音
  "lydian-dominant": [6, 10], // #4, b7 — リディアン+ミクソリディアンの特徴
  "half-whole-diminished": [1, 6], // b2, b5 — 対称スケールの特徴的な音
  "phrygian-dominant": [1, 4], // b2, M3 — フリジアン+メジャー3rdの特徴的組み合わせ

  // Pentatonic & Blues
  "pentatonic-major": [7], // P5 — ペンタトニックの安定感の象徴
  "pentatonic-minor": [3], // m3 — ブルーノートの始まり
  blues: [6], // b5 — ブルーノート

  // Symmetric
  "whole-tone": [4, 8], // M3, #5 — 全音スケールの特徴

  // Ethnic / Exotic
  "double-harmonic": [1, 11], // b2, M7 — 独特の半音関係
  "hungarian-minor": [6, 11], // #4, M7 — ハンガリアンの特徴
  "neapolitan-major": [1], // b2 — ナポリの特徴
  "neapolitan-minor": [1, 8], // b2, b6 — ナポリマイナーの特徴
  persian: [1, 6], // b2, b5 — ペルシャンの特徴
  enigmatic: [1, 6, 10], // b2, #4, b7 — エニグマティックの特徴

  // Japanese
  hirajoshi: [3, 8], // m3, m6 — 平調子の特徴
  "in-sen": [1, 10], // b2, b7 — 陰旋の特徴

  // Bebop
  "bebop-dominant": [10, 11], // b7, M7 — パッシングトーンとしてのM7
  "bebop-major": [8, 9], // b6, M6 — パッシングトーンとしてのb6

  // Other
  prometheus: [6, 9], // #4, M6 — プロメテウスの特徴
} as const;

/**
 * 指定されたルートとスケールタイプから特性音のピッチクラス集合を返す
 */
export function getCharacteristicPitchClasses(
  rootName: string,
  scaleType: ScaleType
): ReadonlySet<PitchClass> {
  const root = createNote(rootName);
  const intervals = CHARACTERISTIC_INTERVALS[scaleType];

  const pitchClasses = new Set<PitchClass>();
  if (intervals) {
    for (const interval of intervals) {
      pitchClasses.add(((root.pitchClass + interval) % 12) as PitchClass);
    }
  }

  return pitchClasses;
}
