import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import type { ChordFunction, ChordQuality, ScaleType } from "@/lib/music-theory";
import { formatChordSymbol } from "@/lib/music-theory";

/**
 * キーを変更する。
 */
export function changeKey(rootName: string): void {
  useKeyStore.getState().setRootName(rootName);
}

/**
 * パレットのコードを選択し、フレットボードのスケール表示を更新する。
 * chord-progression-store と fretboard-store を横断する複合アクション。
 */
export function selectChordFromPalette(
  rootName: string,
  quality: ChordQuality,
  source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType,
  chordFunction: ChordFunction,
  romanNumeral: string,
  degree: number
): void {
  const current = useChordProgressionStore.getState().activeChordOverride;
  const isSame =
    current &&
    current.rootName === rootName &&
    current.quality === quality &&
    current.source === source;

  if (isSame) {
    // トグル: 既に選択中のコードをクリックしたら選択解除
    useChordProgressionStore.getState().setActiveChordOverride(null);
  } else {
    useChordProgressionStore.getState().setActiveChordOverride({
      id: `palette-${rootName}-${quality}-${source}`,
      rootName,
      quality,
      symbol: formatChordSymbol(rootName, quality),
      source,
      chordFunction,
      romanNumeral,
      degree,
    });
  }
  useFretboardStore.getState().resetSelectedScaleType();
}

/**
 * コードをグリッドの次の拍位置に追加し、フレットボードのスケール表示を更新する。
 * chord-grid-store と chord-progression-store を横断する複合アクション。
 */
export function addChordToGrid(
  rootName: string,
  quality: ChordQuality,
  source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType,
  chordFunction: ChordFunction,
  romanNumeral: string,
  degree: number
): void {
  useChordGridStore.getState().addChordToNextBeat({
    rootName,
    quality,
    symbol: formatChordSymbol(rootName, quality),
    source,
    chordFunction,
    romanNumeral,
    degree,
  });

  // フレットボードのスケール表示を更新
  useChordProgressionStore.getState().setActiveChordOverride({
    id: `grid-${rootName}-${quality}`,
    rootName,
    quality,
    symbol: formatChordSymbol(rootName, quality),
    source,
    chordFunction,
    romanNumeral,
    degree,
  });
  useFretboardStore.getState().resetSelectedScaleType();
}

/**
 * グリッドセルを選択/選択解除し、フレットボードの表示を更新する。
 */
export function selectGridCell(row: number, col: number): void {
  const gridStore = useChordGridStore.getState();
  const { selectedCell } = gridStore;

  // トグル判定: 同じセルならこれから解除される
  const isDeselecting = selectedCell?.row === row && selectedCell?.col === col;
  gridStore.selectCell(row, col);

  if (isDeselecting) {
    useChordProgressionStore.getState().setActiveChordOverride(null);
  } else {
    const chord = gridStore.rows[row]?.[col];
    if (chord) {
      useChordProgressionStore.getState().setActiveChordOverride({
        id: `grid-cell-${row}-${col}`,
        rootName: chord.rootName,
        quality: chord.quality,
        symbol: chord.symbol,
        source: chord.source,
        chordFunction: chord.chordFunction,
        romanNumeral: chord.romanNumeral,
        degree: chord.degree,
      });
      useFretboardStore.getState().resetSelectedScaleType();
    }
  }
}

/**
 * グリッドの選択中セルのコードを置換する。
 * 選択中のセルがなければ通常のパレット選択動作を行う。
 * @returns 置換が行われた場合 true
 */
export function replaceSelectedGridCell(chord: GridChord): boolean {
  const { selectedCell } = useChordGridStore.getState();
  if (!selectedCell) return false;

  useChordGridStore.getState().setCell(selectedCell.row, selectedCell.col, chord);

  useChordProgressionStore.getState().setActiveChordOverride({
    id: `grid-cell-${selectedCell.row}-${selectedCell.col}`,
    rootName: chord.rootName,
    quality: chord.quality,
    symbol: chord.symbol,
    source: chord.source,
    chordFunction: chord.chordFunction,
    romanNumeral: chord.romanNumeral,
    degree: chord.degree,
  });
  useFretboardStore.getState().resetSelectedScaleType();
  return true;
}

/**
 * グリッドの選択中セルを削除し、選択を解除する。
 */
export function deleteSelectedGridCell(): void {
  const { selectedCell } = useChordGridStore.getState();
  if (!selectedCell) return;
  useChordGridStore.getState().clearCell(selectedCell.row, selectedCell.col);
  useChordProgressionStore.getState().setActiveChordOverride(null);
}
