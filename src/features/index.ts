// key-selection

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
export {
  _resetKeyStoreForTesting,
  setChordType,
  setRootName,
  useDiatonicChords,
  useKeySnapshot,
  useModalInterchangeChords,
} from "./key-selection/stores/key-store";
