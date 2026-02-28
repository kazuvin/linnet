import type { ChordQuality, ScaleType } from "@/lib/music-theory";
import {
  formatChordSymbol,
  formatRomanNumeral,
  getChordFunction,
  getDiatonicChords,
  getModalInterchangeChords,
  getSecondaryDominantChords,
  getTritoneSubstitutionChords,
} from "@/lib/music-theory";
import type { GridChord } from "../stores/chord-grid-store";

const SEVENTH_QUALITIES: readonly ChordQuality[] = [
  "major7",
  "minor7",
  "dominant7",
  "minor7b5",
  "diminished7",
  "augmented7",
];

function isSeventh(quality: ChordQuality): boolean {
  return SEVENTH_QUALITIES.includes(quality);
}

function transposeDiatonic(chord: GridChord, newRootName: string): GridChord {
  const seventh = isSeventh(chord.quality);
  const chords = getDiatonicChords(newRootName, seventh);
  const match = chords[chord.degree - 1];

  return {
    rootName: match.chord.root.name,
    quality: match.chord.quality,
    symbol: formatChordSymbol(match.chord.root.name, match.chord.quality),
    source: "diatonic",
    chordFunction: match.chordFunction,
    romanNumeral: match.romanNumeral,
    degree: match.degree,
  };
}

function transposeSecondaryDominant(chord: GridChord, newRootName: string): GridChord {
  const seventh = isSeventh(chord.quality);
  const chords = getSecondaryDominantChords(newRootName, seventh);
  const match = chords.find((sd) => sd.targetDegree === chord.degree);

  if (!match) return chord;

  return {
    rootName: match.chord.root.name,
    quality: match.chord.quality,
    symbol: formatChordSymbol(match.chord.root.name, match.chord.quality),
    source: "secondary-dominant",
    chordFunction: "dominant",
    romanNumeral: match.romanNumeral,
    degree: chord.degree,
  };
}

function transposeTritoneSubstitution(chord: GridChord, newRootName: string): GridChord {
  const seventh = isSeventh(chord.quality);
  const chords = getTritoneSubstitutionChords(newRootName, seventh);
  const match = chords.find((ts) => ts.targetDegree === chord.degree);

  if (!match) return chord;

  return {
    rootName: match.chord.root.name,
    quality: match.chord.quality,
    symbol: formatChordSymbol(match.chord.root.name, match.chord.quality),
    source: "tritone-substitution",
    chordFunction: "dominant",
    romanNumeral: match.romanNumeral,
    degree: chord.degree,
  };
}

function transposeModalInterchange(
  chord: GridChord,
  source: ScaleType,
  newRootName: string
): GridChord {
  const seventh = isSeventh(chord.quality);
  const chords = getModalInterchangeChords(newRootName, source, seventh);
  const match = chords.find((mi) => mi.degree === chord.degree);

  if (!match) return chord;

  return {
    rootName: match.chord.root.name,
    quality: match.chord.quality,
    symbol: formatChordSymbol(match.chord.root.name, match.chord.quality),
    source,
    chordFunction: getChordFunction(match.degree),
    romanNumeral: formatRomanNumeral(match.degree, match.chord.quality),
    degree: match.degree,
  };
}

/**
 * GridChord を新しいキーに移調する。
 * degree と source の情報を使い、新しいキーでの対応するコードを生成する。
 */
export function transposeGridChord(chord: GridChord, newRootName: string): GridChord {
  switch (chord.source) {
    case "diatonic":
      return transposeDiatonic(chord, newRootName);
    case "secondary-dominant":
      return transposeSecondaryDominant(chord, newRootName);
    case "tritone-substitution":
      return transposeTritoneSubstitution(chord, newRootName);
    default:
      // ScaleType（modal interchange）
      return transposeModalInterchange(chord, chord.source as ScaleType, newRootName);
  }
}
