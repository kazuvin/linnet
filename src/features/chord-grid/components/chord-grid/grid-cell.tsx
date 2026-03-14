"use client";

import {
  CHORD_DRAG_TYPE,
  type PaletteDragData,
} from "@/features/chord-board/components/chord-palette/chord-palette";
import type { DragItem } from "@/lib/dnd";
import { useDrag, useDrop } from "@/lib/dnd";
import { cn } from "@/lib/utils";
import type { GridChord } from "../../stores/chord-grid-store";
import { useChordGridStore } from "../../stores/chord-grid-store";

const FUNCTION_CELL_STYLES: Record<string, string> = {
  tonic: "border-transparent bg-tonic text-tonic-foreground",
  subdominant: "border-transparent bg-subdominant text-subdominant-foreground",
  dominant: "border-transparent bg-dominant text-dominant-foreground",
};

const SUSTAIN_CELL_STYLES: Record<string, string> = {
  tonic: "bg-tonic/40",
  subdominant: "bg-subdominant/40",
  dominant: "bg-dominant/40",
};

type GridCellProps = {
  rowIndex: number;
  col: number;
  cellChord: GridChord | null;
  displayChord: GridChord | null;
  label: string;
  isSustain: boolean;
  isCurrentStep: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
};

export function GridCell({
  rowIndex,
  col,
  cellChord,
  displayChord,
  label,
  isSustain,
  isCurrentStep,
  isSelected,
  onClick,
  onDoubleClick,
}: GridCellProps) {
  const setCell = useChordGridStore((s) => s.setCell);
  const clearCell = useChordGridStore((s) => s.clearCell);
  const clearSelection = useChordGridStore((s) => s.clearSelection);

  const { dropAttributes, isOver } = useDrop<PaletteDragData>({
    dropZoneId: `cell-${rowIndex}-${col}`,
    accept: CHORD_DRAG_TYPE,
    onDrop: (item: DragItem<PaletteDragData>) => {
      const data = item.data;
      const chord: GridChord = {
        rootName: data.rootName,
        quality: data.quality as GridChord["quality"],
        symbol: data.symbol,
        source: data.source as GridChord["source"],
        chordFunction: data.chordFunction,
        romanNumeral: data.romanNumeral,
        degree: data.degree,
      };

      if (data.gridPosition) {
        // グリッド内ドラッグ: 入れ替え or 移動
        const src = data.gridPosition;
        const isSameCell = src.row === rowIndex && src.col === col;
        if (isSameCell) return;

        const targetChord = useChordGridStore.getState().rows[rowIndex]?.[col];
        if (targetChord) {
          // 入れ替え: ドロップ先のコードをドラッグ元に移す
          setCell(src.row, src.col, targetChord);
        } else {
          // 移動: ドラッグ元をクリア
          clearCell(src.row, src.col);
        }
        setCell(rowIndex, col, chord);
      } else {
        // パレットからのドラッグ
        setCell(rowIndex, col, chord);
      }
      clearSelection();
    },
  });

  // コードがあるセルはドラッグ可能
  const dragData: PaletteDragData | null = cellChord
    ? {
        rootName: cellChord.rootName,
        quality: cellChord.quality,
        symbol: cellChord.symbol,
        source: cellChord.source,
        chordFunction: cellChord.chordFunction,
        romanNumeral: cellChord.romanNumeral,
        degree: cellChord.degree,
        gridPosition: { row: rowIndex, col },
      }
    : null;

  const { dragAttributes, isDragging } = useDrag<PaletteDragData>({
    type: CHORD_DRAG_TYPE,
    data: dragData as PaletteDragData,
  });

  return (
    <button
      key={`cell-${String(rowIndex)}-${String(col)}`}
      type="button"
      className={cn(
        "relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm border transition-all duration-150 md:w-7 lg:aspect-square lg:h-auto lg:w-auto lg:flex-1",
        "ring-0 ring-foreground ring-offset-0 ring-offset-background",
        isCurrentStep && "ring-2 ring-offset-2",
        isOver && "z-10 ring-2 ring-primary ring-offset-2",
        isSelected && "z-10 ring-2 ring-primary ring-offset-2",
        isDragging && "opacity-30",
        cellChord
          ? cn(
              FUNCTION_CELL_STYLES[cellChord.chordFunction] ?? "border-foreground/10 bg-background",
              isCurrentStep && "brightness-90"
            )
          : isSustain && displayChord
            ? cn(
                SUSTAIN_CELL_STYLES[displayChord.chordFunction] ?? "bg-card/50",
                "border-transparent",
                isCurrentStep && "brightness-90"
              )
            : cn("border-foreground/10 bg-background", isCurrentStep && "bg-surface-elevated")
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...dropAttributes}
      {...(cellChord ? dragAttributes : {})}
    >
      {cellChord ? (
        <span className="max-w-full truncate px-0.5 font-bold text-[8px] leading-none">
          {label}
        </span>
      ) : isSustain ? (
        <span className="text-[8px] text-muted/30">-</span>
      ) : null}
    </button>
  );
}
