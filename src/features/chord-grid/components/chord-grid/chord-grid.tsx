"use client";

import { useCallback } from "react";
import {
  MinusIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  VolumeIcon,
  VolumeOffIcon,
} from "@/components/icons";
import { NumberStepper } from "@/components/ui/number-stepper";
import {
  CHORD_DRAG_TYPE,
  type PaletteDragData,
} from "@/features/chord-board/components/chord-palette/chord-palette";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { LoadGridDialog } from "@/features/grid-save/components/load-grid-dialog";
import { SaveGridDialog } from "@/features/grid-save/components/save-grid-dialog";
import { ShareGridButton } from "@/features/grid-share";
import { deleteSelectedGridCell, selectGridCell } from "@/features/store-coordination";
import type { DragItem } from "@/lib/dnd";
import { useDrop } from "@/lib/dnd";
import { cn } from "@/lib/utils";
import { useGridPlayback } from "../../hooks/use-grid-playback";
import type { GridChord } from "../../stores/chord-grid-store";
import { COLUMNS, useChordGridStore } from "../../stores/chord-grid-store";

const COL_INDICES = Array.from({ length: COLUMNS }, (_, i) => i);

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

function getChordDisplayForCell(
  rows: (GridChord | null)[][],
  rowIndex: number,
  colIndex: number
): { label: string; chord: GridChord | null; isSustain: boolean } {
  const cell = rows[rowIndex][colIndex];
  if (cell !== null) {
    return { label: cell.symbol, chord: cell, isSustain: false };
  }
  // 最大15セル前まで遡る（16セル固定持続、行またぎ対応）
  const totalPos = rowIndex * COLUMNS + colIndex;
  for (let offset = 1; offset < COLUMNS; offset++) {
    const pos = totalPos - offset;
    if (pos < 0) break;
    const r = Math.floor(pos / COLUMNS);
    const c = pos % COLUMNS;
    if (rows[r][c] !== null) {
      return { label: "-", chord: rows[r][c], isSustain: true };
    }
  }
  return { label: "", chord: null, isSustain: false };
}

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
};

function GridCell({
  rowIndex,
  col,
  cellChord,
  displayChord,
  label,
  isSustain,
  isCurrentStep,
  isSelected,
  onClick,
}: GridCellProps) {
  const setCell = useChordGridStore((s) => s.setCell);
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
      setCell(rowIndex, col, chord);
      clearSelection();
    },
  });

  return (
    <button
      key={`cell-${String(rowIndex)}-${String(col)}`}
      type="button"
      className={cn(
        "relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-all duration-150 md:w-7 lg:aspect-square lg:h-auto lg:w-auto lg:flex-1",
        "ring-0 ring-foreground ring-offset-0 ring-offset-background",
        isCurrentStep && "ring-2 ring-offset-2",
        isOver && "z-10 ring-2 ring-primary ring-offset-2",
        isSelected && "z-10 ring-2 ring-offset-2",
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
      {...dropAttributes}
    >
      {cellChord ? (
        <span className="font-bold text-[8px] leading-none">{label}</span>
      ) : isSustain ? (
        <span className="text-[8px] text-muted/30">-</span>
      ) : null}
    </button>
  );
}

export function ChordGrid() {
  const rows = useChordGridStore((s) => s.rows);
  const bpm = useChordGridStore((s) => s.bpm);
  const isPlaying = useChordGridStore((s) => s.isPlaying);
  const currentRow = useChordGridStore((s) => s.currentRow);
  const currentCol = useChordGridStore((s) => s.currentCol);
  const selectedCell = useChordGridStore((s) => s.selectedCell);
  const setBpm = useChordGridStore((s) => s.setBpm);
  const clearGrid = useChordGridStore((s) => s.clearGrid);
  const removeRow = useChordGridStore((s) => s.removeRow);
  const isMuted = useChordPlaybackStore((s) => s.isMuted);
  const toggleMute = useChordPlaybackStore((s) => s.toggleMute);
  const { togglePlayback } = useGridPlayback();
  const hasChords = useChordGridStore((s) => s.getPlayableRowCount()) > 0;

  const selectedChord = selectedCell ? rows[selectedCell.row]?.[selectedCell.col] : null;

  const handleCellClick = useCallback((rowIndex: number, col: number) => {
    selectGridCell(rowIndex, col);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* コントロールバー */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="shrink-0 font-bold text-lg">Grid</h2>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors md:h-7 md:w-7",
                !hasChords
                  ? "cursor-not-allowed text-muted"
                  : isPlaying
                    ? "bg-foreground text-background"
                    : "text-muted hover:bg-foreground/10 hover:text-foreground"
              )}
              onClick={togglePlayback}
              disabled={!hasChords}
              aria-label={isPlaying ? "停止" : "再生"}
              title={isPlaying ? "停止" : "再生"}
            >
              {isPlaying ? (
                <StopIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
              ) : (
                <PlayIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
              )}
            </button>
            <button
              type="button"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors md:h-7 md:w-7",
                "text-muted hover:bg-foreground/10 hover:text-foreground"
              )}
              onClick={toggleMute}
              aria-label={isMuted ? "ミュート解除" : "ミュート"}
              title={isMuted ? "ミュート解除" : "ミュート"}
            >
              {isMuted ? (
                <VolumeOffIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
              ) : (
                <VolumeIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
              )}
            </button>
            <SaveGridDialog />
            <LoadGridDialog />
            <ShareGridButton />
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          {/* 選択中: コード名 + アクション */}
          {selectedChord && (
            <div
              className={cn(
                "flex h-8 items-center gap-0.5 rounded-sm border pr-0.5 pl-2",
                FUNCTION_CELL_STYLES[selectedChord.chordFunction] ??
                  "border-border bg-surface-elevated"
              )}
            >
              <span className="font-bold text-[8px] leading-none">{selectedChord.symbol}</span>
              <button
                type="button"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={deleteSelectedGridCell}
                aria-label="選択中のコードを削除"
                title="削除"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* BPM コントロール */}
          <NumberStepper
            id="bpm-input"
            value={bpm}
            onChange={setBpm}
            min={30}
            max={300}
            label="BPM"
          />

          {hasChords && (
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-muted text-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
              onClick={clearGrid}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* グリッド本体 (GitHub 芝生グラフスタイル) */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-fit flex-col gap-1 lg:w-full">
          {/* ビート番号ヘッダー */}
          <div className="flex items-end gap-0.5">
            {COL_INDICES.map((col) => {
              const isBeat = col % 4 === 0;
              return (
                <div
                  key={`header-${String(col)}`}
                  className={cn(
                    "flex h-4 w-8 shrink-0 items-center justify-center text-[9px] md:w-7 lg:w-auto lg:flex-1",
                    isBeat ? "font-semibold text-foreground" : "text-muted/50"
                  )}
                >
                  {isBeat ? col / 4 + 1 : ""}
                </div>
              );
            })}
            <div className="w-6 shrink-0" />
          </div>

          {/* 行 */}
          {rows.map((rowCells, rowIndex) => (
            <div key={`row-${String(rowIndex)}`} className="flex items-center gap-0.5">
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
                    isSustain={isSustain}
                    isCurrentStep={isCurrentStep}
                    isSelected={isSelected}
                    onClick={() => handleCellClick(rowIndex, col)}
                  />
                );
              })}

              {/* 行削除ボタン */}
              <div className="flex w-6 shrink-0 items-center justify-center">
                {rows.length > 1 && (
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
          ))}
        </div>
      </div>

      {/* ガイド */}
      {!hasChords && (
        <p className="text-center text-muted text-sm">コードをドラッグしてグリッドに追加</p>
      )}
    </div>
  );
}
