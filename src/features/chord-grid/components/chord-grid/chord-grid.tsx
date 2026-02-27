"use client";

import { useCallback, useState } from "react";
import {
  MinusIcon,
  PlayIcon,
  PlusIcon,
  StopIcon,
  TrashIcon,
  VolumeIcon,
  VolumeOffIcon,
  XIcon,
} from "@/components/icons";
import { NumberStepper } from "@/components/ui/number-stepper";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { deleteSelectedGridCell, selectGridCell } from "@/features/store-coordination";
import { cn } from "@/lib/utils";
import type { PaletteDragData } from "../../../chord-board/components/chord-palette/chord-palette";
import { useGridPlayback } from "../../hooks/use-grid-playback";
import type { GridChord } from "../../stores/chord-grid-store";
import { COLUMNS, useChordGridStore } from "../../stores/chord-grid-store";

const DRAG_DATA_TYPE = "application/x-chord";

const COL_INDICES = Array.from({ length: COLUMNS }, (_, i) => i);

const FUNCTION_CELL_STYLES: Record<string, string> = {
  tonic: "border-tonic/40 bg-tonic-subtle",
  subdominant: "border-subdominant/40 bg-subdominant-subtle",
  dominant: "border-dominant/40 bg-dominant-subtle",
};

const SUSTAIN_CELL_STYLES: Record<string, string> = {
  tonic: "bg-tonic-subtle/40",
  subdominant: "bg-subdominant-subtle/40",
  dominant: "bg-dominant-subtle/40",
};

function getChordDisplayForCell(
  rowCells: (GridChord | null)[],
  colIndex: number,
  prevRowCells?: (GridChord | null)[]
): { label: string; chord: GridChord | null; isSustain: boolean } {
  const cell = rowCells[colIndex];
  if (cell !== null) {
    return { label: cell.symbol, chord: cell, isSustain: false };
  }
  // 同一行で直前のコードを探す
  for (let i = colIndex - 1; i >= 0; i--) {
    if (rowCells[i] !== null) {
      return { label: "-", chord: rowCells[i], isSustain: true };
    }
  }
  // 前の行の末尾から探す
  if (prevRowCells) {
    for (let i = COLUMNS - 1; i >= 0; i--) {
      if (prevRowCells[i] !== null) {
        return { label: "-", chord: prevRowCells[i], isSustain: true };
      }
    }
  }
  return { label: "", chord: null, isSustain: false };
}

function parseDragData(e: React.DragEvent): GridChord | null {
  try {
    const raw = e.dataTransfer.getData(DRAG_DATA_TYPE);
    if (!raw) return null;
    const data: PaletteDragData = JSON.parse(raw);
    return {
      rootName: data.rootName,
      quality: data.quality as GridChord["quality"],
      symbol: data.symbol,
      source: data.source as GridChord["source"],
      chordFunction: data.chordFunction,
      romanNumeral: data.romanNumeral,
      degree: data.degree,
    };
  } catch {
    return null;
  }
}

export function ChordGrid() {
  const { rows, bpm, isPlaying, currentRow, currentCol, selectedCell } = useChordGridStore();
  const { setBpm, setCell, clearGrid, addRow, removeRow, clearSelection } = useChordGridStore();
  const { isMuted, toggleMute } = useChordPlaybackStore();
  const { togglePlayback } = useGridPlayback();
  const hasChords = rows.some((row) => row.some((c) => c !== null));

  const [dragOverCell, setDragOverCell] = useState<{ row: number; col: number } | null>(null);

  const selectedChord = selectedCell ? rows[selectedCell.row]?.[selectedCell.col] : null;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setDragOverCell({ row, col });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !e.currentTarget.contains(related)) {
      setDragOverCell(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, row: number, col: number) => {
      e.preventDefault();
      setDragOverCell(null);
      const chord = parseDragData(e);
      if (chord) {
        setCell(row, col, chord);
        clearSelection();
      }
    },
    [setCell, clearSelection]
  );

  const handleCellClick = useCallback(
    (rowIndex: number, col: number) => {
      const cellChord = rows[rowIndex]?.[col];
      if (!cellChord) return;
      selectGridCell(rowIndex, col);
    },
    [rows]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* コントロールバー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg">Grid</h2>
          <div className="flex items-center gap-1">
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
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* 選択中セルのアクションバー */}
      {selectedChord && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2">
          <span className="font-bold font-mono text-sm">{selectedChord.symbol}</span>
          <span className="text-muted text-xs">を選択中</span>
          <span className="text-muted/40 text-xs">- パレットのコードをタップして置換</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-destructive/10 hover:text-destructive md:h-7 md:w-7"
              onClick={deleteSelectedGridCell}
              aria-label="選択中のコードを削除"
              title="削除"
            >
              <TrashIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground md:h-7 md:w-7"
              onClick={clearSelection}
              aria-label="選択解除"
              title="選択解除"
            >
              <XIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* グリッド本体 (GitHub 芝生グラフスタイル) */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-fit flex-col gap-1">
          {/* ビート番号ヘッダー */}
          <div className="flex items-end gap-0.5 pl-7">
            {COL_INDICES.map((col) => {
              const isBeat = col % 4 === 0;
              return (
                <div
                  key={`header-${String(col)}`}
                  className={cn(
                    "flex h-4 w-8 shrink-0 items-center justify-center font-mono text-[9px] md:w-7",
                    isBeat ? "font-semibold text-foreground" : "text-muted/50"
                  )}
                >
                  {isBeat ? col / 4 + 1 : ""}
                </div>
              );
            })}
          </div>

          {/* 行 */}
          {rows.map((rowCells, rowIndex) => (
            <div key={`row-${String(rowIndex)}`} className="flex items-center gap-0.5">
              {/* 行番号 & 削除ボタン */}
              <div className="group/row flex w-6 shrink-0 items-center justify-center">
                {rows.length > 1 ? (
                  <button
                    type="button"
                    className="flex h-5 w-5 items-center justify-center rounded text-muted/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
                    onClick={() => removeRow(rowIndex)}
                    title="行を削除"
                  >
                    <MinusIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="text-[10px] text-muted/40">&nbsp;</span>
                )}
              </div>

              {/* セル */}
              {COL_INDICES.map((col) => {
                const {
                  label,
                  chord: displayChord,
                  isSustain,
                } = getChordDisplayForCell(
                  rowCells,
                  col,
                  rowIndex > 0 ? rows[rowIndex - 1] : undefined
                );
                const cellChord = rowCells[col];
                const isCurrentStep = isPlaying && currentRow === rowIndex && currentCol === col;
                const isDragOver = dragOverCell?.row === rowIndex && dragOverCell?.col === col;
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === col;

                return (
                  <button
                    key={`cell-${String(rowIndex)}-${String(col)}`}
                    type="button"
                    className={cn(
                      "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-all md:w-7",
                      isCurrentStep && "ring-2 ring-foreground ring-inset",
                      isDragOver && "ring-2 ring-primary ring-inset",
                      isSelected && "z-10 scale-110 ring-2 ring-foreground ring-inset",
                      cellChord
                        ? cn(
                            FUNCTION_CELL_STYLES[cellChord.chordFunction] ??
                              "border-border bg-card",
                            isCurrentStep && "brightness-90",
                            !isSelected && "cursor-pointer"
                          )
                        : isSustain && displayChord
                          ? cn(
                              SUSTAIN_CELL_STYLES[displayChord.chordFunction] ?? "bg-card/50",
                              "border-transparent",
                              isCurrentStep && "brightness-90"
                            )
                          : cn(
                              "border-border/40 bg-surface",
                              isCurrentStep && "bg-surface-elevated"
                            )
                    )}
                    onClick={() => handleCellClick(rowIndex, col)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, rowIndex, col)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, rowIndex, col)}
                  >
                    {cellChord ? (
                      <span className="font-bold font-mono text-[8px] leading-none">{label}</span>
                    ) : isSustain ? (
                      <span className="text-[8px] text-muted/30">-</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}

          {/* 行追加ボタン */}
          <div className="flex items-center gap-0.5 pl-7">
            <button
              type="button"
              className="flex h-8 items-center gap-1 rounded-sm border border-border/60 border-dashed px-2 text-muted/50 transition-colors hover:border-foreground/30 hover:text-foreground/60"
              onClick={addRow}
              title="行を追加"
            >
              <PlusIcon className="h-3 w-3" />
              <span className="text-[10px]">行を追加</span>
            </button>
          </div>
        </div>
      </div>

      {/* ガイド */}
      {!hasChords && (
        <p className="text-center text-muted text-sm">
          コードをクリックまたはドラッグしてグリッドに追加
        </p>
      )}
    </div>
  );
}
