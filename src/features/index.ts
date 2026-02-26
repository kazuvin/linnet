// chord-board
export { ChordBoard, ChordCard, type ChordCardData, ModeSelector } from "./chord-board";
// chord-progression selectors
export {
  useSelectedChord,
  useSelectedProgressionChord,
} from "./chord-progression/stores/chord-progression-selectors";
// chord-progression stores
export {
  _resetChordProgressionForTesting,
  type ChordProgressionState,
  type ProgressionChord,
  useChordProgressionStore,
} from "./chord-progression/stores/chord-progression-store";

// fretboard hooks
export { useFretboardPositions } from "./fretboard/hooks/use-fretboard-positions";

// fretboard
export {
  _resetFretboardStoreForTesting,
  type FretboardState,
  useFretboardStore,
} from "./fretboard/stores/fretboard-store";

// key-selection components
export { ChordTypeSelector, KeySelector, RootNoteSelector } from "./key-selection/components";
// key-selection selectors
export {
  type PaletteChordInfo,
  useCurrentModeChords,
  useDiatonicChords,
  useModalInterchangeChords,
} from "./key-selection/stores/key-selectors";
// key-selection stores
export {
  _resetKeyStoreForTesting,
  type SelectedMode,
  useKeyStore,
} from "./key-selection/stores/key-store";

// store-coordination (cross-store composite actions)
export { changeKey, selectProgressionChord } from "./store-coordination";
