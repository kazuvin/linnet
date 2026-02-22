// chord-board
export { ChordBoard, ChordCard, type ChordCardData, ModeSelector } from "./chord-board";

// chord-progression stores
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
  type PaletteChordInfo,
  setChordType,
  setRootName,
  setSelectedMode,
  useCurrentModeChords,
  useDiatonicChords,
  useKeySnapshot,
  useModalInterchangeChords,
} from "./key-selection/stores/key-store";
