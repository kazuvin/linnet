import type { GridChord } from "../stores/chord-grid-store";
import { COLUMNS } from "../stores/chord-grid-store";

export function getChordDisplayForCell(
  rows: (GridChord | null)[][],
  rowIndex: number,
  colIndex: number
): { label: string; chord: GridChord | null; isSustain: boolean } {
  const cell = rows[rowIndex][colIndex];
  if (cell !== null) {
    return { label: cell.symbol, chord: cell, isSustain: false };
  }
  // 先頭まで遡り、最も近いコードを探す（次のコードまで無制限持続）
  const totalPos = rowIndex * COLUMNS + colIndex;
  for (let pos = totalPos - 1; pos >= 0; pos--) {
    const r = Math.floor(pos / COLUMNS);
    const c = pos % COLUMNS;
    if (rows[r][c] !== null) {
      return { label: "-", chord: rows[r][c], isSustain: true };
    }
  }
  return { label: "", chord: null, isSustain: false };
}
