import { transposeGridChord } from "@/features/chord-grid/lib/transpose-grid-chord";
import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";

/**
 * GridChord から ProgressionChord を生成する。
 */
function toProgressionChord(chord: GridChord, id: string) {
  return { ...chord, id };
}

/**
 * フレットボードのアクティブコードを更新し、スケール選択をリセットする。
 */
function setActiveChordAndResetScale(chord: GridChord, id: string): void {
  useChordProgressionStore.getState().setActiveChordOverride(toProgressionChord(chord, id));
  useFretboardStore.getState().resetSelectedScaleType();
}

/**
 * キーを変更し、グリッドのコードも移調する。
 */
export function changeKey(newRootName: string): void {
  const gridStore = useChordGridStore.getState();
  const newRows = gridStore.rows.map((row) =>
    row.map((cell) => (cell ? transposeGridChord(cell, newRootName) : null))
  );
  useChordGridStore.setState({ rows: newRows });
  useKeyStore.getState().setRootName(newRootName);
}

/**
 * パレットのコードを選択し、フレットボードのスケール表示を更新する。
 * chord-progression-store と fretboard-store を横断する複合アクション。
 */
export function selectChordFromPalette(chord: GridChord): void {
  const current = useChordProgressionStore.getState().activeChordOverride;
  const isSame =
    current &&
    current.rootName === chord.rootName &&
    current.quality === chord.quality &&
    current.source === chord.source;

  if (isSame) {
    // トグル: 既に選択中のコードをクリックしたら選択解除
    useChordProgressionStore.getState().setActiveChordOverride(null);
  } else {
    const id = `palette-${chord.rootName}-${chord.quality}-${chord.source}`;
    useChordProgressionStore.getState().setActiveChordOverride(toProgressionChord(chord, id));
  }
  useFretboardStore.getState().resetSelectedScaleType();
}

/**
 * コードをグリッドの次の拍位置に追加し、フレットボードのスケール表示を更新する。
 * chord-grid-store と chord-progression-store を横断する複合アクション。
 */
export function addChordToGrid(chord: GridChord): void {
  useChordGridStore.getState().addChordToNextBeat(chord);
  setActiveChordAndResetScale(chord, `grid-${chord.rootName}-${chord.quality}`);
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
      setActiveChordAndResetScale(chord, `grid-cell-${row}-${col}`);
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
  setActiveChordAndResetScale(chord, `grid-cell-${selectedCell.row}-${selectedCell.col}`);
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
