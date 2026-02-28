import { type Chord, type ChordQuality, createChord } from "./chord";
import { getNoteAtPosition, STANDARD_TUNING } from "./fretboard";

/**
 * 各弦のフレット番号
 * null = ミュート, 0 = 開放弦, 1+ = フレット押さえ
 * インデックス: 0=6弦, 1=5弦, 2=4弦, 3=3弦, 4=2弦, 5=1弦
 */
export type ChordVoicing = {
  readonly chord: Chord;
  readonly frets: readonly (number | null)[];
  readonly rootString: number; // ルート弦番号 (6, 5, or 4)
  readonly barreInfo?: {
    readonly fret: number;
    readonly fromString: number;
    readonly toString: number;
  };
};

const MAX_FRET_SPAN = 3; // フレットスパン最大3（4フレット幅）
const MAX_FINGERS = 4;
const BASS_STRINGS = [6, 5, 4] as const;

/**
 * 6弦・5弦・4弦ルートで人間が押さえられるコードボイシングを算出する
 */
export function findChordPositions(
  rootName: string,
  quality: ChordQuality,
  maxFret = 12,
  tuning: readonly string[] = STANDARD_TUNING
): readonly ChordVoicing[] {
  const chord = createChord(rootName, quality);
  const rootPC = chord.root.pitchClass;
  const chordPCs = new Set(chord.notes.map((n) => n.pitchClass));
  const results: ChordVoicing[] = [];

  for (const bassString of BASS_STRINGS) {
    for (let rootFret = 0; rootFret <= maxFret; rootFret++) {
      const rootNote = getNoteAtPosition(bassString, rootFret, tuning);
      if (rootNote.pitchClass !== rootPC) continue;

      const voicing = buildBestVoicing(chord, chordPCs, bassString, rootFret, maxFret, tuning);
      if (voicing) {
        results.push(voicing);
      }
    }
  }

  return results;
}

/**
 * 指定ルートポジションから最適なボイシングを組み立てる
 */
function buildBestVoicing(
  chord: Chord,
  chordPCs: ReadonlySet<number>,
  bassString: number,
  rootFret: number,
  maxFret: number,
  tuning: readonly string[]
): ChordVoicing | null {
  // 各弦の候補を収集
  const candidatesPerString: number[][] = [];
  const stringNumbers: number[] = [];

  for (let s = bassString; s >= 1; s--) {
    const candidates: number[] = [];

    if (s === bassString) {
      // ベース弦はルートフレット固定
      candidates.push(rootFret);
    } else {
      // 開放弦チェック
      const openNote = getNoteAtPosition(s, 0, tuning);
      if (chordPCs.has(openNote.pitchClass)) {
        candidates.push(0);
      }

      // フレット範囲内のコードトーンを探索
      const searchLow = Math.max(1, rootFret - 2);
      const searchHigh = Math.min(maxFret, rootFret + 4);
      for (let f = searchLow; f <= searchHigh; f++) {
        const note = getNoteAtPosition(s, f, tuning);
        if (chordPCs.has(note.pitchClass)) {
          candidates.push(f);
        }
      }
    }

    candidatesPerString.push(candidates);
    stringNumbers.push(s);
  }

  // 組み合わせ探索で最適ボイシングを見つける
  const best = { frets: null as (number | null)[] | null, score: -Infinity };

  function search(idx: number, current: (number | null)[]) {
    if (idx === candidatesPerString.length) {
      // バリデーション
      const frettedNotes = current.filter((f): f is number => f !== null && f > 0);

      // フレットスパンチェック
      if (frettedNotes.length > 0) {
        const span = Math.max(...frettedNotes) - Math.min(...frettedNotes);
        if (span > MAX_FRET_SPAN) return;
      }

      // 指の本数チェック
      if (countFingers(current) > MAX_FINGERS) return;

      // 内側ミュート弦チェック
      if (hasInnerMutedStrings(current)) return;

      // 全コードトーンが含まれるかチェック
      const presentPCs = new Set<number>();
      for (let i = 0; i < current.length; i++) {
        const fret = current[i];
        if (fret !== null) {
          const note = getNoteAtPosition(stringNumbers[i], fret, tuning);
          presentPCs.add(note.pitchClass);
        }
      }
      const hasAllTones = chord.notes.every((n) => presentPCs.has(n.pitchClass));
      if (!hasAllTones) return;

      // スコア計算
      const score = computeScore(current, frettedNotes, rootFret);
      if (score > best.score) {
        best.score = score;
        best.frets = [...current];
      }
      return;
    }

    const candidates = candidatesPerString[idx];

    // 各候補を試す
    for (const fret of candidates) {
      current.push(fret);
      search(idx + 1, current);
      current.pop();
    }

    // ミュートオプション（ベース弦以外）
    if (idx > 0) {
      current.push(null);
      search(idx + 1, current);
      current.pop();
    }
  }

  search(0, []);

  if (!best.frets) return null;

  // frets配列を6要素に変換（0=6弦, 1=5弦, ..., 5=1弦）
  const fullFrets: (number | null)[] = Array(6).fill(null);
  for (let i = 0; i < best.frets.length; i++) {
    const stringNum = stringNumbers[i];
    const idx = 6 - stringNum; // 6弦=0, 5弦=1, ..., 1弦=5
    fullFrets[idx] = best.frets[i];
  }

  const barreInfo = detectBarre(fullFrets);

  return {
    chord,
    frets: fullFrets,
    rootString: bassString,
    barreInfo,
  };
}

/**
 * 必要な指の本数を計算する（バレーを考慮）
 */
function countFingers(voicingPart: (number | null)[]): number {
  const frettedFrets = voicingPart.filter((f): f is number => f !== null && f > 0);
  if (frettedFrets.length === 0) return 0;

  const minFret = Math.min(...frettedFrets);
  const atMinFret = frettedFrets.filter((f) => f === minFret);

  if (atMinFret.length >= 2) {
    // バレーとして1本 + 残りの個別フレット
    const otherFrets = frettedFrets.filter((f) => f !== minFret);
    return 1 + otherFrets.length;
  }

  return frettedFrets.length;
}

/**
 * 演奏弦の間にミュート弦があるか判定
 */
function hasInnerMutedStrings(voicingPart: (number | null)[]): boolean {
  let firstPlayed = -1;
  let lastPlayed = -1;

  for (let i = 0; i < voicingPart.length; i++) {
    if (voicingPart[i] !== null) {
      if (firstPlayed === -1) firstPlayed = i;
      lastPlayed = i;
    }
  }

  if (firstPlayed === -1) return false;

  for (let i = firstPlayed; i <= lastPlayed; i++) {
    if (voicingPart[i] === null) return true;
  }

  return false;
}

/**
 * ボイシングのスコアを計算（大きいほど良い）
 */
function computeScore(
  voicingPart: (number | null)[],
  frettedNotes: number[],
  rootFret: number
): number {
  let score = 0;

  // 演奏弦数が多いほど良い（フルな響き）
  const playedStrings = voicingPart.filter((f) => f !== null).length;
  score += playedStrings * 20;

  // 開放弦が多いほど楽に弾ける
  const openStrings = voicingPart.filter((f) => f === 0).length;
  score += openStrings * 10;

  // フレットスパンが小さいほど楽
  if (frettedNotes.length > 0) {
    const span = Math.max(...frettedNotes) - Math.min(...frettedNotes);
    score -= span * 5;
  }

  // ルートフレットから近いほど良い
  for (const f of frettedNotes) {
    score -= Math.abs(f - rootFret);
  }

  // 指の本数が少ないほど楽
  const fingers = countFingers(voicingPart);
  score -= fingers * 3;

  return score;
}

/**
 * バレーコードの検出
 */
function detectBarre(
  frets: (number | null)[]
): { fret: number; fromString: number; toString: number } | undefined {
  const frettedPositions = frets
    .map((f, i) => ({ fret: f, string: 6 - i }))
    .filter((p): p is { fret: number; string: number } => p.fret !== null && p.fret > 0);

  if (frettedPositions.length === 0) return undefined;

  const minFret = Math.min(...frettedPositions.map((p) => p.fret));
  const atMinFret = frettedPositions.filter((p) => p.fret === minFret);

  if (atMinFret.length < 2) return undefined;

  const barreStrings = atMinFret.map((p) => p.string);
  const fromString = Math.min(...barreStrings);
  const toStringNum = Math.max(...barreStrings);

  // バレー範囲内にミュート弦がないか確認
  for (let s = fromString; s <= toStringNum; s++) {
    const idx = 6 - s;
    if (frets[idx] === null) return undefined;
  }

  return { fret: minFret, fromString, toString: toStringNum };
}
