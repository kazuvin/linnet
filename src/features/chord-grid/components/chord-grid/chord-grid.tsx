"use client";

import { useCallback, useRef, useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { selectGridCell } from "@/features/store-coordination";
import { playChord } from "@/lib/audio/chord-player";
import { cn } from "@/lib/utils";
import { useGridKeyboard } from "../../hooks/use-grid-keyboard";
import { useGridPlayback } from "../../hooks/use-grid-playback";
import type { GridChord } from "../../stores/chord-grid-store";
import { useChordGridStore } from "../../stores/chord-grid-store";
import { ChordSelectorDialog } from "../chord-selector-dialog";
import { GridControlBar } from "./grid-control-bar";
import { GridGuide } from "./grid-guide";
import { GridHeader } from "./grid-header";
import { GridRow } from "./grid-row";

export function ChordGrid() {
  const rows = useChordGridStore((s) => s.rows);
  const cellScales = useChordGridStore((s) => s.cellScales);
  const bpm = useChordGridStore((s) => s.bpm);
  const isPlaying = useChordGridStore((s) => s.isPlaying);
  const currentRow = useChordGridStore((s) => s.currentRow);
  const currentCol = useChordGridStore((s) => s.currentCol);
  const selectedCell = useChordGridStore((s) => s.selectedCell);
  const setBpm = useChordGridStore((s) => s.setBpm);
  const clearGrid = useChordGridStore((s) => s.clearGrid);
  const clearSelection = useChordGridStore((s) => s.clearSelection);
  const setCell = useChordGridStore((s) => s.setCell);
  const clearCell = useChordGridStore((s) => s.clearCell);
  const isMuted = useChordPlaybackStore((s) => s.isMuted);
  const toggleMute = useChordPlaybackStore((s) => s.toggleMute);
  const { togglePlayback } = useGridPlayback();
  const playableRowCount = useChordGridStore((s) => s.getPlayableRowCount());
  const hasChords = playableRowCount > 0;

  const selectedChord = selectedCell ? rows[selectedCell.row]?.[selectedCell.col] : null;

  // コンテキストメニュー & ダイアログ
  const [contextMenuCell, setContextMenuCell] = useState<{ row: number; col: number } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<{ row: number; col: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleCellClick = useCallback(
    (rowIndex: number, col: number) => {
      selectGridCell(rowIndex, col);

      // 同じセルをもう一度クリックしたらメニューを閉じる
      if (contextMenuCell?.row === rowIndex && contextMenuCell?.col === col) {
        setContextMenuCell(null);
        return;
      }
      setContextMenuCell({ row: rowIndex, col });
    },
    [contextMenuCell]
  );

  const handleAddOrChange = useCallback(() => {
    if (contextMenuCell) {
      setDialogTarget(contextMenuCell);
      setDialogOpen(true);
    }
    setContextMenuCell(null);
  }, [contextMenuCell]);

  const handleDelete = useCallback(() => {
    if (contextMenuCell) {
      clearCell(contextMenuCell.row, contextMenuCell.col);
      useChordProgressionStore.getState().setActiveChordOverride(null);
    }
    setContextMenuCell(null);
  }, [contextMenuCell, clearCell]);

  const handleChordSelect = useCallback(
    (chord: GridChord) => {
      if (dialogTarget) {
        setCell(dialogTarget.row, dialogTarget.col, chord);
        selectGridCell(dialogTarget.row, dialogTarget.col);
        if (!useChordPlaybackStore.getState().isMuted) {
          playChord(chord.rootName, chord.quality);
        }
      }
      setDialogTarget(null);
    },
    [dialogTarget, setCell]
  );

  const contextCellChord = contextMenuCell
    ? rows[contextMenuCell.row]?.[contextMenuCell.col]
    : null;

  useGridKeyboard(selectedCell, clearSelection);

  return (
    <div className="flex flex-col gap-4">
      {/* コントロールバー */}
      <GridControlBar
        selectedChord={selectedChord}
        isPlaying={isPlaying}
        hasChords={hasChords}
        togglePlayback={togglePlayback}
        isMuted={isMuted}
        toggleMute={toggleMute}
        bpm={bpm}
        setBpm={setBpm}
        clearGrid={clearGrid}
      />

      {/* グリッド本体 */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-fit flex-col gap-1 lg:w-full">
          <GridHeader />
          {rows.map((rowCells, rowIndex) => (
            <GridRow
              key={`row-${String(rowIndex)}`}
              rowCells={rowCells}
              rowIndex={rowIndex}
              rows={rows}
              cellScales={cellScales}
              isPlaying={isPlaying}
              currentRow={currentRow}
              currentCol={currentCol}
              selectedCell={selectedCell}
              isOutOfPlayRange={hasChords && rowIndex >= playableRowCount}
              totalRows={rows.length}
              onCellClick={handleCellClick}
            />
          ))}
        </div>
      </div>

      {/* セルアクションバー */}
      {contextMenuCell !== null && (
        <div
          ref={contextMenuRef}
          className="fade-in flex animate-in items-center justify-center gap-2 duration-150"
        >
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-medium text-sm transition-colors",
              "bg-foreground text-background hover:bg-foreground/90"
            )}
            onClick={handleAddOrChange}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            {contextCellChord ? "コードを変更" : "コードを追加"}
          </button>
          {contextCellChord && (
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-medium text-sm transition-colors",
                "bg-destructive/10 text-destructive hover:bg-destructive/20"
              )}
              onClick={handleDelete}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              コードを削除
            </button>
          )}
        </div>
      )}

      {/* コード選択ダイアログ */}
      <ChordSelectorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={handleChordSelect}
        title={
          dialogTarget && rows[dialogTarget.row]?.[dialogTarget.col]
            ? "コードを変更"
            : "コードを追加"
        }
      />

      {/* ガイド */}
      {!contextMenuCell && (
        <GridGuide
          selectedCell={selectedCell}
          selectedChord={selectedChord}
          hasChords={hasChords}
        />
      )}
    </div>
  );
}
