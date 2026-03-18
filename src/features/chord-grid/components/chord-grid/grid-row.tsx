"use client";

import { MinusIcon } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailableScalesForCell } from "@/features/fretboard/hooks/use-available-scales";
import type { ScaleType } from "@/lib/music-theory";
import { SCALE_DISPLAY_NAMES } from "@/lib/music-theory";
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
  cellScales: (ScaleType | null)[][];
  isPlaying: boolean;
  currentRow: number;
  currentCol: number;
  selectedCell: { row: number; col: number } | null;
  isOutOfPlayRange: boolean;
  totalRows: number;
  onCellClick: (rowIndex: number, col: number) => void;
};

function RowScaleSelector({
  rowIndex,
  selectedCell,
  cellScales,
}: {
  rowIndex: number;
  selectedCell: { row: number; col: number } | null;
  cellScales: (ScaleType | null)[];
}) {
  const setCellScale = useChordGridStore((s) => s.setCellScale);
  const rows = useChordGridStore((s) => s.rows);

  // 選択中のセルがこの行にある場合、そのセルのスケールを表示
  const isRowSelected = selectedCell?.row === rowIndex;
  const selectedCol = isRowSelected ? selectedCell.col : null;
  const chord = selectedCol !== null ? rows[rowIndex]?.[selectedCol] : null;
  const currentScale = selectedCol !== null ? cellScales[selectedCol] : null;

  // この行で使える全スケール情報を取得
  const { availableScales } = useAvailableScalesForCell(
    chord?.rootName ?? null,
    chord?.quality ?? null,
    chord?.source ?? null,
    chord?.degree ?? 0
  );

  if (!isRowSelected || !chord) return null;

  const handleScaleChange = (value: string) => {
    if (selectedCol !== null) {
      setCellScale(rowIndex, selectedCol, value as ScaleType);
    }
  };

  const displayName = currentScale ? SCALE_DISPLAY_NAMES[currentScale] : null;

  return (
    <div className="flex items-center gap-1.5 pl-0.5">
      <span className="shrink-0 text-[10px] text-muted">Scale:</span>
      <Select
        value={currentScale ?? "__none__"}
        onValueChange={handleScaleChange}
        disabled={availableScales.length === 0}
      >
        <SelectTrigger className="h-6 min-w-0 max-w-[200px] text-xs">
          <SelectValue>{displayName ? `${chord.rootName} ${displayName}` : "---"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableScales.map((scale) => (
            <SelectItem key={scale.scaleType} value={scale.scaleType}>
              {chord.rootName} {scale.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function GridRow({
  rowCells,
  rowIndex,
  rows,
  cellScales,
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
    <div className={cn("flex flex-col gap-0.5", isOutOfPlayRange && "opacity-40")}>
      <div className="flex items-center gap-0.5">
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

      {/* 行のスケール選択 */}
      <RowScaleSelector
        rowIndex={rowIndex}
        selectedCell={selectedCell}
        cellScales={cellScales[rowIndex] ?? []}
      />
    </div>
  );
}
