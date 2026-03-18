"use client";

import { useCallback, useRef, useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { CellPopover, CellPopoverItem } from "@/components/ui/cell-popover";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { selectGridCell } from "@/features/store-coordination";
import { playChord } from "@/lib/audio/chord-player";
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

  // ポップオーバー & ダイアログ
  const [popoverCell, setPopoverCell] = useState<{ row: number; col: number } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<{ row: number; col: number } | null>(null);
  const cellRefsMap = useRef<Map<string, HTMLButtonElement>>(new Map());

  const popoverAnchorRef = useRef<HTMLButtonElement | null>(null);
  // ポップオーバーのアンカーを更新
  const getPopoverAnchor = useCallback(() => {
    if (!popoverCell) return null;
    return cellRefsMap.current.get(`${popoverCell.row}-${popoverCell.col}`) ?? null;
  }, [popoverCell]);
  popoverAnchorRef.current = getPopoverAnchor();

  const registerCellRef = useCallback((row: number, col: number, el: HTMLButtonElement | null) => {
    const key = `${row}-${col}`;
    if (el) {
      cellRefsMap.current.set(key, el);
    } else {
      cellRefsMap.current.delete(key);
    }
  }, []);

  const handleCellClick = useCallback(
    (rowIndex: number, col: number) => {
      selectGridCell(rowIndex, col);

      if (popoverCell?.row === rowIndex && popoverCell?.col === col) {
        setPopoverCell(null);
        return;
      }
      setPopoverCell({ row: rowIndex, col });
    },
    [popoverCell]
  );

  const handleAddOrChange = useCallback(() => {
    if (popoverCell) {
      setDialogTarget(popoverCell);
      setDialogOpen(true);
    }
    setPopoverCell(null);
  }, [popoverCell]);

  const handleDelete = useCallback(() => {
    if (popoverCell) {
      clearCell(popoverCell.row, popoverCell.col);
      useChordProgressionStore.getState().setActiveChordOverride(null);
    }
    setPopoverCell(null);
  }, [popoverCell, clearCell]);

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

  const popoverCellChord = popoverCell ? rows[popoverCell.row]?.[popoverCell.col] : null;

  useGridKeyboard(selectedCell, clearSelection);

  return (
    <div className="flex flex-col gap-4">
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
              registerCellRef={registerCellRef}
            />
          ))}
        </div>
      </div>

      {/* セルポップオーバー */}
      <CellPopover
        anchorRef={popoverAnchorRef}
        open={popoverCell !== null}
        onClose={() => setPopoverCell(null)}
      >
        <CellPopoverItem onClick={handleAddOrChange}>
          <PlusIcon className="h-4 w-4" />
          {popoverCellChord ? "コードを変更" : "コードを追加"}
        </CellPopoverItem>
        {popoverCellChord && (
          <CellPopoverItem onClick={handleDelete} variant="destructive">
            <TrashIcon className="h-4 w-4" />
            コードを削除
          </CellPopoverItem>
        )}
      </CellPopover>

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
      {!popoverCell && (
        <GridGuide
          selectedCell={selectedCell}
          selectedChord={selectedChord}
          hasChords={hasChords}
        />
      )}
    </div>
  );
}
