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
import { FUNCTION_CELL_STYLES, SUSTAIN_CELL_STYLES } from "../../lib/chord-function-styles";
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
  registerCellRef: (row: number, col: number, el: HTMLButtonElement | null) => void;
};

// --- スケール表示用のヘルパー ---

/** セルに表示するスケール情報を取得する（コードの持続と同じロジック） */
function getScaleDisplayForCell(
  rows: (GridChord | null)[][],
  cellScales: (ScaleType | null)[][],
  rowIndex: number,
  colIndex: number
): {
  scaleType: ScaleType | null;
  chord: GridChord | null;
  isOrigin: boolean;
  isSustain: boolean;
} {
  const cell = rows[rowIndex][colIndex];
  const scale = cellScales[rowIndex]?.[colIndex] ?? null;

  if (cell !== null) {
    return { scaleType: scale, chord: cell, isOrigin: true, isSustain: false };
  }

  // 先頭まで遡り、最も近いコードとスケールを探す
  const totalPos = rowIndex * COLUMNS + colIndex;
  for (let pos = totalPos - 1; pos >= 0; pos--) {
    const r = Math.floor(pos / COLUMNS);
    const c = pos % COLUMNS;
    if (rows[r][c] !== null) {
      return {
        scaleType: cellScales[r]?.[c] ?? null,
        chord: rows[r][c],
        isOrigin: false,
        isSustain: true,
      };
    }
  }
  return { scaleType: null, chord: null, isOrigin: false, isSustain: false };
}

// --- スケールセル（個別） ---

function ScaleCell({
  rowIndex,
  col,
  scaleType,
  chord,
  isOrigin,
  isSustain,
  isSelected,
  isOutOfPlayRange,
}: {
  rowIndex: number;
  col: number;
  scaleType: ScaleType | null;
  chord: GridChord | null;
  isOrigin: boolean;
  isSustain: boolean;
  isSelected: boolean;
  isOutOfPlayRange: boolean;
}) {
  const setCellScale = useChordGridStore((s) => s.setCellScale);

  // 選択中のセルかつコードがあるセルのみスケール変更可能
  const { availableScales } = useAvailableScalesForCell(
    isSelected && isOrigin ? (chord?.rootName ?? null) : null,
    isSelected && isOrigin ? (chord?.quality ?? null) : null,
    isSelected && isOrigin ? (chord?.source ?? null) : null,
    isSelected && isOrigin ? (chord?.degree ?? 0) : 0
  );

  const displayName = scaleType ? SCALE_DISPLAY_NAMES[scaleType] : null;
  const shortName = displayName
    ? displayName.length > 8
      ? `${displayName.slice(0, 7)}…`
      : displayName
    : null;

  const handleScaleChange = (value: string) => {
    setCellScale(rowIndex, col, value as ScaleType);
  };

  // 空セル（コードもサステインもなし）
  if (!chord) {
    return (
      <div className="flex h-5 w-8 shrink-0 items-center justify-center md:w-7 lg:w-auto lg:flex-1" />
    );
  }

  // 選択中のコード原点セル → ドロップダウン
  if (isSelected && isOrigin && availableScales.length > 0) {
    return (
      <div className="flex h-5 w-8 shrink-0 items-center justify-center md:w-7 lg:w-auto lg:flex-1">
        <Select value={scaleType ?? "__none__"} onValueChange={handleScaleChange}>
          <SelectTrigger
            className={cn(
              "h-5 w-full min-w-0 rounded-sm border-0 px-0.5 text-center text-[7px] leading-none shadow-none lg:text-[8px]",
              FUNCTION_CELL_STYLES[chord.chordFunction] ?? "bg-foreground/5"
            )}
          >
            <SelectValue>
              <span className="truncate">{shortName ?? "---"}</span>
            </SelectValue>
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

  // コード原点セル → スケール名表示
  if (isOrigin) {
    return (
      <div
        className={cn(
          "flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm md:w-7 lg:w-auto lg:flex-1",
          FUNCTION_CELL_STYLES[chord.chordFunction] ?? "bg-foreground/5"
        )}
      >
        <span className="max-w-full truncate px-0.5 text-[7px] leading-none lg:text-[8px]">
          {shortName}
        </span>
      </div>
    );
  }

  // サステインセル
  if (isSustain && !isOutOfPlayRange) {
    return (
      <div
        className={cn(
          "flex h-5 w-8 shrink-0 items-center justify-center rounded-sm md:w-7 lg:w-auto lg:flex-1",
          SUSTAIN_CELL_STYLES[chord.chordFunction] ?? "bg-card/50"
        )}
      />
    );
  }

  return (
    <div className="flex h-5 w-8 shrink-0 items-center justify-center md:w-7 lg:w-auto lg:flex-1" />
  );
}

// --- スケール行 ---

function ScaleRow({
  rowIndex,
  rows,
  cellScales,
  selectedCell,
  isOutOfPlayRange,
}: {
  rowIndex: number;
  rows: (GridChord | null)[][];
  cellScales: (ScaleType | null)[][];
  selectedCell: { row: number; col: number } | null;
  isOutOfPlayRange: boolean;
}) {
  // この行にコードがあるか、またはサステインがあるか確認
  const hasAnyDisplay = COL_INDICES.some((col) => {
    const { chord } = getScaleDisplayForCell(rows, cellScales, rowIndex, col);
    return chord !== null;
  });

  if (!hasAnyDisplay) return null;

  return (
    <div className={cn("flex items-center gap-0.5", isOutOfPlayRange && "opacity-40")}>
      {COL_INDICES.map((col) => {
        const { scaleType, chord, isOrigin, isSustain } = getScaleDisplayForCell(
          rows,
          cellScales,
          rowIndex,
          col
        );
        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === col;

        return (
          <ScaleCell
            key={`scale-${String(rowIndex)}-${String(col)}`}
            rowIndex={rowIndex}
            col={col}
            scaleType={scaleType}
            chord={chord}
            isOrigin={isOrigin}
            isSustain={isSustain}
            isSelected={isSelected}
            isOutOfPlayRange={isOutOfPlayRange}
          />
        );
      })}
      {/* 行削除ボタンとの幅合わせ */}
      <div className="w-6 shrink-0" />
    </div>
  );
}

// --- メインの GridRow ---

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
  registerCellRef,
}: GridRowProps) {
  const removeRow = useChordGridStore((s) => s.removeRow);

  return (
    <div className={cn("flex flex-col", isOutOfPlayRange && "opacity-40")}>
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
              ref={(el) => registerCellRef(rowIndex, col, el)}
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

      {/* スケール行 */}
      <ScaleRow
        rowIndex={rowIndex}
        rows={rows}
        cellScales={cellScales}
        selectedCell={selectedCell}
        isOutOfPlayRange={isOutOfPlayRange}
      />
    </div>
  );
}
