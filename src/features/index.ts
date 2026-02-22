// diatonic-chords

// chord-progression
export {
  _resetChordProgressionForTesting,
  addChord,
  type ChordProgressionState,
  clearProgression,
  type ProgressionChord,
  removeChord,
  reorderChords,
  selectChord,
  useChordProgressionSnapshot,
  useSelectedChord,
} from "./chord-progression/stores/chord-progression-store";
export { DiatonicChordCard, DiatonicChordList } from "./diatonic-chords/components";

// fretboard hooks
export { useFretboardPositions } from "./fretboard/hooks/use-fretboard-positions";

// fretboard
export {
  _resetFretboardStoreForTesting,
  type FretboardDisplayMode,
  type FretboardState,
  setDisplayMode,
  setMaxFret,
  setScaleType,
  useFretboardSnapshot,
} from "./fretboard/stores/fretboard-store";

// key-selection components
export { ChordTypeSelector, KeySelector, RootNoteSelector } from "./key-selection/components";

// key-selection stores
export {
  _resetKeyStoreForTesting,
  setChordType,
  setRootName,
  useDiatonicChords,
  useKeySnapshot,
  useModalInterchangeChords,
} from "./key-selection/stores/key-store";
