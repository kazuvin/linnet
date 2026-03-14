"use client";

import { MinusIcon } from "@/components/icons";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { cn } from "@/lib/utils";
import { getChordDisplayForCell } from "../../lib/get-chord-display";
import type { GridChord } from "../../stores/chord-grid-store";
import { COLUMNS, useChordGridStore } from "../../stores/chord-grid-store";
import { GridCell } from "./grid-cell";

const COL_INDICES = Array.from({ length: COLUMNS }, (_, i) => i);

type GridRowProps = {
  rowCells: (GridChord | null)[];
  rowIndex: number;
  rows: (GridChord | null)[][];
  isPlaying: boolean;
  currentRow: number;
  currentCol: number;
  selectedCell: { row: number; col: number } | null;
  isOutOfPlayRange: boolean;
  totalRows: number;
  onCellClick: (rowIndex: number, col: number) => void;
};

export function GridRow({
  rowCells,
  rowIndex,
  rows,
  isPlaying,
  currentRow,
  currentCol,
  selectedCell,
  isOutOfPlayRange,
  totalRows,
  onCellClick,
}: GridRowProps) {
  const removeRow = useChordGridStore((s) => s.removeRow);

  return (
    <div className={cn("flex items-center gap-0.5", isOutOfPlayRange && "opacity-40")}>
      {/* セル */}
      {COL_INDICES.map((col) => {
        const {
          label,
          chord: displayChord,
          isSustain,
        } = getChordDisplayForCell(rows, rowIndex, col);
        const cellChord = rowCells[col];
        const isCurrentStep = isPlaying && currentRow === rowIndex && currentCol === col;
        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === col;

        return (
          <GridCell
            key={`cell-${String(rowIndex)}-${String(col)}`}
            rowIndex={rowIndex}
            col={col}
            cellChord={cellChord}
            displayChord={displayChord}
            label={label}
            isSustain={isOutOfPlayRange ? false : isSustain}
            isCurrentStep={isCurrentStep}
            isSelected={isSelected}
            onClick={() => onCellClick(rowIndex, col)}
            onDoubleClick={
              cellChord
                ? () => {
                    useChordGridStore.getState().clearCell(rowIndex, col);
                    useChordProgressionStore.getState().setActiveChordOverride(null);
                  }
                : undefined
            }
          />
        );
      })}

      {/* 行削除ボタン */}
      <div className="flex w-6 shrink-0 items-center justify-center">
        {totalRows > 1 && (
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded text-muted/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
            onClick={() => removeRow(rowIndex)}
            title="行を削除"
          >
            <MinusIcon className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
