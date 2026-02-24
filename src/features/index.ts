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
  useSelectedProgressionChord,
} from "./chord-progression/stores/chord-progression-store";

// fretboard hooks
export { useFretboardPositions } from "./fretboard/hooks/use-fretboard-positions";

// fretboard
export {
  _resetFretboardStoreForTesting,
  type FretboardState,
  setMaxFret,
  useFretboardSnapshot,
} from "./fretboard/stores/fretboard-store";

// key-selection components
export { ChordTypeSelector, KeySelector, RootNoteSelector } from "./key-selection/components";

// key-selection stores
export {
  _resetKeyStoreForTesting,
  getRootName,
  type PaletteChordInfo,
  setChordType,
  setRootName,
  setSelectedMode,
  useCurrentModeChords,
  useDiatonicChords,
  useKeySnapshot,
  useModalInterchangeChords,
} from "./key-selection/stores/key-store";

// store-coordination (cross-store composite actions)
export { changeKey, selectProgressionChord } from "./store-coordination";
