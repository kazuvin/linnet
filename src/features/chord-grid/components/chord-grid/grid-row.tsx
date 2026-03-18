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
import { FUNCTION_CELL_STYLES } from "../../lib/chord-function-styles";
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

/** セルに対応するスケール情報を取得する（コードの持続と同じロジック） */
function getScaleDisplayForCell(
  rows: (GridChord | null)[][],
  cellScales: (ScaleType | null)[][],
  rowIndex: number,
  colIndex: number
): {
  scaleType: ScaleType | null;
  chord: GridChord | null;
  originRow: number;
  originCol: number;
} {
  const cell = rows[rowIndex][colIndex];
  const scale = cellScales[rowIndex]?.[colIndex] ?? null;

  if (cell !== null) {
    return { scaleType: scale, chord: cell, originRow: rowIndex, originCol: colIndex };
  }

  const totalPos = rowIndex * COLUMNS + colIndex;
  for (let pos = totalPos - 1; pos >= 0; pos--) {
    const r = Math.floor(pos / COLUMNS);
    const c = pos % COLUMNS;
    if (rows[r][c] !== null) {
      return {
        scaleType: cellScales[r]?.[c] ?? null,
        chord: rows[r][c],
        originRow: r,
        originCol: c,
      };
    }
  }
  return { scaleType: null, chord: null, originRow: -1, originCol: -1 };
}

/** 行のスケール表示用にスパンセグメントを作成 */
type ScaleSegment = {
  startCol: number;
  span: number;
  chord: GridChord | null;
  scaleType: ScaleType | null;
  originRow: number;
  originCol: number;
};

function buildScaleSegments(
  rows: (GridChord | null)[][],
  cellScales: (ScaleType | null)[][],
  rowIndex: number
): ScaleSegment[] {
  const segments: ScaleSegment[] = [];
  let i = 0;

  while (i < COLUMNS) {
    const info = getScaleDisplayForCell(rows, cellScales, rowIndex, i);
    const segment: ScaleSegment = {
      startCol: i,
      span: 1,
      chord: info.chord,
      scaleType: info.scaleType,
      originRow: info.originRow,
      originCol: info.originCol,
    };

    // 同じ origin のセルをまとめる
    let j = i + 1;
    while (j < COLUMNS) {
      const next = getScaleDisplayForCell(rows, cellScales, rowIndex, j);
      if (next.originRow === info.originRow && next.originCol === info.originCol) {
        segment.span++;
        j++;
      } else {
        break;
      }
    }

    segments.push(segment);
    i = j;
  }

  return segments;
}

// --- スケールスパン（セグメント単位） ---

function ScaleSegmentCell({
  segment,
  selectedCell,
  isOutOfPlayRange,
}: {
  segment: ScaleSegment;
  selectedCell: { row: number; col: number } | null;
  isOutOfPlayRange: boolean;
}) {
  const setCellScale = useChordGridStore((s) => s.setCellScale);
  const { chord, scaleType, originRow, originCol, span } = segment;

  const isOriginSelected = selectedCell?.row === originRow && selectedCell?.col === originCol;

  const { availableScales } = useAvailableScalesForCell(
    isOriginSelected && chord ? (chord.rootName ?? null) : null,
    isOriginSelected && chord ? (chord.quality ?? null) : null,
    isOriginSelected && chord ? (chord.source ?? null) : null,
    isOriginSelected && chord ? (chord.degree ?? 0) : 0
  );

  const displayName = scaleType ? SCALE_DISPLAY_NAMES[scaleType] : null;

  const handleScaleChange = (value: string) => {
    setCellScale(originRow, originCol, value as ScaleType);
  };

  // 空セグメント
  if (!chord) {
    return <div className="h-6" style={{ flex: span }} />;
  }

  const bgClass = FUNCTION_CELL_STYLES[chord.chordFunction] ?? "bg-foreground/5";

  // 選択中 → ドロップダウン
  if (isOriginSelected && availableScales.length > 0) {
    return (
      <div
        className={cn("flex h-6 items-center overflow-hidden rounded-sm", bgClass)}
        style={{ flex: span }}
      >
        <Select value={scaleType ?? "__none__"} onValueChange={handleScaleChange}>
          <SelectTrigger
            className={cn(
              "h-6 w-full min-w-0 border-0 px-1.5 text-left text-[9px] leading-none shadow-none lg:text-[10px]",
              bgClass
            )}
          >
            <SelectValue>
              <span className="truncate">{displayName ?? "---"}</span>
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

  // 通常表示
  if (isOutOfPlayRange) {
    return <div className="h-6" style={{ flex: span }} />;
  }

  return (
    <div
      className={cn("flex h-6 items-center overflow-hidden rounded-sm px-1.5", bgClass)}
      style={{ flex: span }}
    >
      {displayName && (
        <span className="truncate text-[9px] leading-none lg:text-[10px]">{displayName}</span>
      )}
    </div>
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
  const segments = buildScaleSegments(rows, cellScales, rowIndex);
  const hasAnyChord = segments.some((s) => s.chord !== null);

  if (!hasAnyChord) return null;

  return (
    <div className={cn("flex items-center gap-0.5", isOutOfPlayRange && "opacity-40")}>
      {segments.map((segment) => (
        <ScaleSegmentCell
          key={`scale-seg-${String(rowIndex)}-${String(segment.startCol)}`}
          segment={segment}
          selectedCell={selectedCell}
          isOutOfPlayRange={isOutOfPlayRange}
        />
      ))}
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
