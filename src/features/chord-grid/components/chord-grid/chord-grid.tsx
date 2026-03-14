"use client";

import { useCallback } from "react";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { selectGridCell } from "@/features/store-coordination";
import { useGridKeyboard } from "../../hooks/use-grid-keyboard";
import { useGridPlayback } from "../../hooks/use-grid-playback";
import { useChordGridStore } from "../../stores/chord-grid-store";
import { GridControlBar } from "./grid-control-bar";
import { GridGuide } from "./grid-guide";
import { GridHeader } from "./grid-header";
import { GridRow } from "./grid-row";

export function ChordGrid() {
  const rows = useChordGridStore((s) => s.rows);
  const bpm = useChordGridStore((s) => s.bpm);
  const isPlaying = useChordGridStore((s) => s.isPlaying);
  const currentRow = useChordGridStore((s) => s.currentRow);
  const currentCol = useChordGridStore((s) => s.currentCol);
  const selectedCell = useChordGridStore((s) => s.selectedCell);
  const setBpm = useChordGridStore((s) => s.setBpm);
  const clearGrid = useChordGridStore((s) => s.clearGrid);
  const clearSelection = useChordGridStore((s) => s.clearSelection);
  const isMuted = useChordPlaybackStore((s) => s.isMuted);
  const toggleMute = useChordPlaybackStore((s) => s.toggleMute);
  const { togglePlayback } = useGridPlayback();
  const playableRowCount = useChordGridStore((s) => s.getPlayableRowCount());
  const hasChords = playableRowCount > 0;

  const selectedChord = selectedCell ? rows[selectedCell.row]?.[selectedCell.col] : null;

  const handleCellClick = useCallback((rowIndex: number, col: number) => {
    selectGridCell(rowIndex, col);
  }, []);

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

      {/* グリッド本体 (GitHub 芝生グラフスタイル) */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-fit flex-col gap-1 lg:w-full">
          {/* ビート番号ヘッダー */}
          <GridHeader />

          {/* 行 */}
          {rows.map((rowCells, rowIndex) => (
            <GridRow
              key={`row-${String(rowIndex)}`}
              rowCells={rowCells}
              rowIndex={rowIndex}
              rows={rows}
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

      {/* ガイド */}
      <GridGuide selectedCell={selectedCell} selectedChord={selectedChord} hasChords={hasChords} />
    </div>
  );
}
