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
  registerCellRef: (row: number, col: number, el: HTMLButtonElement | null) => void;
};

// --- スケール表示用のヘルパー ---

/** セルに対応するスケール情報を取得する（同一行内のみ遡る） */
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

  // 同一行内で前方のコードを探す（行を跨がない）
  for (let c = colIndex - 1; c >= 0; c--) {
    if (rows[rowIndex][c] !== null) {
      return {
        scaleType: cellScales[rowIndex]?.[c] ?? null,
        chord: rows[rowIndex][c],
        originRow: rowIndex,
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

// --- スケールセグメント ---

function ScaleSegmentCell({ segment }: { segment: ScaleSegment }) {
  const setCellScale = useChordGridStore((s) => s.setCellScale);
  const { chord, scaleType, originRow, originCol, span } = segment;

  const { availableScales } = useAvailableScalesForCell(
    chord?.rootName ?? null,
    chord?.quality ?? null,
    chord?.source ?? null,
    chord?.degree ?? 0
  );

  const displayName = scaleType ? SCALE_DISPLAY_NAMES[scaleType] : null;

  const handleScaleChange = (value: string) => {
    setCellScale(originRow, originCol, value as ScaleType);
  };

  // 空セグメント（コードなし）
  if (!chord) {
    return (
      <div
        className="h-6 rounded-sm border border-foreground/10 bg-background"
        style={{ flex: span }}
      />
    );
  }

  // スケールが選択可能な場合はクリッカブル
  if (availableScales.length > 0) {
    return (
      <div
        className="flex h-6 items-center overflow-hidden rounded-sm border border-foreground/10 bg-background"
        style={{ flex: span }}
      >
        <Select value={scaleType ?? "__none__"} onValueChange={handleScaleChange}>
          <SelectTrigger className="h-6 w-full min-w-0 cursor-pointer rounded-sm border-0 bg-transparent px-1.5 text-left text-[9px] text-muted leading-none shadow-none transition-colors hover:bg-foreground/5 lg:text-[10px]">
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

  // スケール情報のみ表示
  return (
    <div
      className="flex h-6 items-center overflow-hidden rounded-sm border border-foreground/10 bg-background px-1.5"
      style={{ flex: span }}
    >
      {displayName && (
        <span className="truncate text-[9px] text-muted leading-none lg:text-[10px]">
          {displayName}
        </span>
      )}
    </div>
  );
}

// --- スケール行 ---

function ScaleRow({
  rowIndex,
  rows,
  cellScales,
  isOutOfPlayRange,
}: {
  rowIndex: number;
  rows: (GridChord | null)[][];
  cellScales: (ScaleType | null)[][];
  isOutOfPlayRange: boolean;
}) {
  const segments = buildScaleSegments(rows, cellScales, rowIndex);

  return (
    <div className={cn("flex items-center gap-0.5", isOutOfPlayRange && "opacity-40")}>
      {segments.map((segment) => (
        <ScaleSegmentCell
          key={`scale-seg-${String(rowIndex)}-${String(segment.startCol)}`}
          segment={segment}
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

      {/* スケール行（常に表示） */}
      <ScaleRow
        rowIndex={rowIndex}
        rows={rows}
        cellScales={cellScales}
        isOutOfPlayRange={isOutOfPlayRange}
      />
    </div>
  );
}
