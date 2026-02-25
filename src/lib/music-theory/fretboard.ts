import { getCharacteristicPitchClasses } from "./characteristic-notes";
import { type Chord, type ChordQuality, createChord } from "./chord";
import { createNote, type Note, type PitchClass, transposeNote } from "./note";
import { createScale, type ScaleType } from "./scale";

// 標準チューニング（6弦→1弦、低い方から）
export const STANDARD_TUNING = ["E", "A", "D", "G", "B", "E"] as const;

export type FretPosition = {
  readonly string: number; // 1-6（1弦が最高音、6弦が最低音）
  readonly fret: number; // 0-24（0はオープン）
  readonly note: Note;
};

export type ChordVoicing = {
  readonly chord: Chord;
  readonly positions: readonly FretPosition[];
  readonly barreInfo?: {
    readonly fret: number;
    readonly fromString: number;
    readonly toString: number;
  };
};

/**
 * 弦番号（1-6）とフレット番号（0-24）から音名を返す
 * 1弦 = STANDARD_TUNING の最後の要素（高いE）
 * 6弦 = STANDARD_TUNING の最初の要素（低いE）
 * tuning配列は [6弦, 5弦, 4弦, 3弦, 2弦, 1弦] の順
 */
export function getNoteAtPosition(
  string: number,
  fret: number,
  tuning: readonly string[] = STANDARD_TUNING
): Note {
  // tuning配列のインデックス: 6弦=0, 5弦=1, ..., 1弦=5
  const tuningIndex = 6 - string;
  const openNote = createNote(tuning[tuningIndex]);
  return transposeNote(openNote, fret);
}

/**
 * 指定されたピッチクラスの集合に一致する全ポジションを返す（内部ヘルパー）
 */
function findPositionsByPitchClasses(
  targetPitchClasses: ReadonlySet<PitchClass>,
  maxFret: number,
  tuning: readonly string[]
): readonly FretPosition[] {
  const positions: FretPosition[] = [];

  for (let string = 1; string <= 6; string++) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const note = getNoteAtPosition(string, fret, tuning);
      if (targetPitchClasses.has(note.pitchClass)) {
        positions.push({ string, fret, note });
      }
    }
  }

  return positions;
}

/**
 * 指定された音名が指板上のどこにあるか全ポジションを返す
 */
export function findNotePositions(
  noteName: string,
  maxFret = 12,
  tuning: readonly string[] = STANDARD_TUNING
): readonly FretPosition[] {
  const targetNote = createNote(noteName);
  return findPositionsByPitchClasses(new Set([targetNote.pitchClass]), maxFret, tuning);
}

/**
 * スケールの構成音が指板上のどこにあるか全ポジションを返す
 */
export function findScalePositions(
  rootName: string,
  scaleType: ScaleType,
  maxFret = 12,
  tuning: readonly string[] = STANDARD_TUNING
): readonly FretPosition[] {
  const scale = createScale(rootName, scaleType);
  const pitchClasses = new Set(scale.notes.map((n) => n.pitchClass));
  return findPositionsByPitchClasses(pitchClasses, maxFret, tuning);
}

/**
 * コードの構成音が指板上のどこにあるか全ポジションを返す
 */
export function findChordPositions(
  rootName: string,
  quality: ChordQuality,
  maxFret = 12,
  tuning: readonly string[] = STANDARD_TUNING
): readonly FretPosition[] {
  const chord = createChord(rootName, quality);
  const pitchClasses = new Set(chord.notes.map((n) => n.pitchClass));
  return findPositionsByPitchClasses(pitchClasses, maxFret, tuning);
}

export type NoteRole = "scale" | "chord-tone" | "chord-root";

export type OverlayPosition = FretPosition & {
  readonly role: NoteRole;
  readonly isCharacteristic: boolean;
};

/**
 * スケールの音とコード構成音を重ねたポジションを返す
 * コード構成音はスケール音より優先される
 */
export function findOverlayPositions(
  keyRootName: string,
  scaleType: ScaleType,
  chordRootName: string,
  chordQuality: ChordQuality,
  maxFret = 12,
  tuning: readonly string[] = STANDARD_TUNING
): readonly OverlayPosition[] {
  const chord = createChord(chordRootName, chordQuality);
  const chordPitchClasses = new Set(chord.notes.map((n) => n.pitchClass));
  const rootPitchClass = chord.root.pitchClass;

  const scale = createScale(keyRootName, scaleType);
  const scalePitchClasses = new Set(scale.notes.map((n) => n.pitchClass));

  const characteristicPitchClasses = getCharacteristicPitchClasses(keyRootName, scaleType);

  // スケール音とコード構成音の和集合
  const allTargetPitchClasses = new Set([...scalePitchClasses, ...chordPitchClasses]);

  const positions: OverlayPosition[] = [];

  for (let string = 1; string <= 6; string++) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const note = getNoteAtPosition(string, fret, tuning);
      if (!allTargetPitchClasses.has(note.pitchClass)) continue;

      let role: NoteRole;
      if (note.pitchClass === rootPitchClass) {
        role = "chord-root";
      } else if (chordPitchClasses.has(note.pitchClass)) {
        role = "chord-tone";
      } else {
        role = "scale";
      }

      const isCharacteristic = characteristicPitchClasses.has(note.pitchClass);

      positions.push({ string, fret, note, role, isCharacteristic });
    }
  }

  return positions;
}

// ボイシングデータの型（内部用）
type VoicingData = {
  readonly positions: readonly { readonly string: number; readonly fret: number }[];
  readonly barreInfo?: {
    readonly fret: number;
    readonly fromString: number;
    readonly toString: number;
  };
};

// 主要なオープンコードとバレーコードのボイシングデータ
const VOICING_DATA: Record<string, readonly VoicingData[]> = {
  // メジャーコード
  C_major: [
    {
      positions: [
        { string: 5, fret: 3 },
        { string: 4, fret: 2 },
        { string: 3, fret: 0 },
        { string: 2, fret: 1 },
        { string: 1, fret: 0 },
      ],
    },
  ],
  D_major: [
    {
      positions: [
        { string: 4, fret: 0 },
        { string: 3, fret: 2 },
        { string: 2, fret: 3 },
        { string: 1, fret: 2 },
      ],
    },
  ],
  E_major: [
    {
      positions: [
        { string: 6, fret: 0 },
        { string: 5, fret: 2 },
        { string: 4, fret: 2 },
        { string: 3, fret: 1 },
        { string: 2, fret: 0 },
        { string: 1, fret: 0 },
      ],
    },
  ],
  F_major: [
    {
      positions: [
        { string: 6, fret: 1 },
        { string: 5, fret: 3 },
        { string: 4, fret: 3 },
        { string: 3, fret: 2 },
        { string: 2, fret: 1 },
        { string: 1, fret: 1 },
      ],
      barreInfo: { fret: 1, fromString: 1, toString: 6 },
    },
  ],
  G_major: [
    {
      positions: [
        { string: 6, fret: 3 },
        { string: 5, fret: 2 },
        { string: 4, fret: 0 },
        { string: 3, fret: 0 },
        { string: 2, fret: 0 },
        { string: 1, fret: 3 },
      ],
    },
  ],
  A_major: [
    {
      positions: [
        { string: 5, fret: 0 },
        { string: 4, fret: 2 },
        { string: 3, fret: 2 },
        { string: 2, fret: 2 },
        { string: 1, fret: 0 },
      ],
    },
  ],
  B_major: [
    {
      positions: [
        { string: 5, fret: 2 },
        { string: 4, fret: 4 },
        { string: 3, fret: 4 },
        { string: 2, fret: 4 },
        { string: 1, fret: 2 },
      ],
      barreInfo: { fret: 2, fromString: 1, toString: 5 },
    },
  ],
  // マイナーコード
  C_minor: [
    {
      positions: [
        { string: 5, fret: 3 },
        { string: 4, fret: 5 },
        { string: 3, fret: 5 },
        { string: 2, fret: 4 },
        { string: 1, fret: 3 },
      ],
      barreInfo: { fret: 3, fromString: 1, toString: 5 },
    },
  ],
  D_minor: [
    {
      positions: [
        { string: 4, fret: 0 },
        { string: 3, fret: 2 },
        { string: 2, fret: 3 },
        { string: 1, fret: 1 },
      ],
    },
  ],
  E_minor: [
    {
      positions: [
        { string: 6, fret: 0 },
        { string: 5, fret: 2 },
        { string: 4, fret: 2 },
        { string: 3, fret: 0 },
        { string: 2, fret: 0 },
        { string: 1, fret: 0 },
      ],
    },
  ],
  F_minor: [
    {
      positions: [
        { string: 6, fret: 1 },
        { string: 5, fret: 3 },
        { string: 4, fret: 3 },
        { string: 3, fret: 1 },
        { string: 2, fret: 1 },
        { string: 1, fret: 1 },
      ],
      barreInfo: { fret: 1, fromString: 1, toString: 6 },
    },
  ],
  G_minor: [
    {
      positions: [
        { string: 6, fret: 3 },
        { string: 5, fret: 5 },
        { string: 4, fret: 5 },
        { string: 3, fret: 3 },
        { string: 2, fret: 3 },
        { string: 1, fret: 3 },
      ],
      barreInfo: { fret: 3, fromString: 1, toString: 6 },
    },
  ],
  A_minor: [
    {
      positions: [
        { string: 5, fret: 0 },
        { string: 4, fret: 2 },
        { string: 3, fret: 2 },
        { string: 2, fret: 1 },
        { string: 1, fret: 0 },
      ],
    },
  ],
  B_minor: [
    {
      positions: [
        { string: 5, fret: 2 },
        { string: 4, fret: 4 },
        { string: 3, fret: 4 },
        { string: 2, fret: 3 },
        { string: 1, fret: 2 },
      ],
      barreInfo: { fret: 2, fromString: 1, toString: 5 },
    },
  ],
};

/**
 * 一般的なギターボイシングを返す（主要なオープンコードとバレーコードのみ）
 */
export function getCommonVoicings(
  rootName: string,
  quality: ChordQuality
): readonly ChordVoicing[] {
  const key = `${rootName}_${quality}`;
  const voicingDataList = VOICING_DATA[key];

  if (!voicingDataList) {
    return [];
  }

  const chord = createChord(rootName, quality);

  return voicingDataList.map((data) => {
    const positions: FretPosition[] = data.positions.map((p) => ({
      string: p.string,
      fret: p.fret,
      note: getNoteAtPosition(p.string, p.fret),
    }));

    const voicing: ChordVoicing = {
      chord,
      positions,
      ...(data.barreInfo ? { barreInfo: data.barreInfo } : {}),
    };

    return voicing;
  });
}
