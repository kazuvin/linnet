"use client";

import { PlayIcon, StopIcon, VolumeIcon, VolumeOffIcon, XIcon } from "@/components/icons";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { cn } from "@/lib/utils";
import { useGridPlayback } from "../../hooks/use-grid-playback";
import type { GridChord } from "../../stores/chord-grid-store";
import { GRID_SIZE, useChordGridStore } from "../../stores/chord-grid-store";

const STEP_INDICES = Array.from({ length: GRID_SIZE }, (_, i) => i);

const FUNCTION_BG_STYLES: Record<string, string> = {
  tonic: "bg-tonic-subtle border-tonic/30",
  subdominant: "bg-subdominant-subtle border-subdominant/30",
  dominant: "bg-dominant-subtle border-dominant/30",
};

function getChordDisplayForCell(
  cells: (GridChord | null)[],
  index: number
): { label: string; chord: GridChord | null; isSustain: boolean } {
  const cell = cells[index];
  if (cell !== null) {
    return { label: cell.symbol, chord: cell, isSustain: false };
  }
  // null セル: 直前のコードを探して持続表示
  for (let i = index - 1; i >= 0; i--) {
    if (cells[i] !== null) {
      return { label: "-", chord: cells[i], isSustain: true };
    }
  }
  return { label: "", chord: null, isSustain: false };
}

export function ChordGrid() {
  const { cells, bpm, isPlaying, currentStep } = useChordGridStore();
  const { setBpm, clearCell, clearGrid } = useChordGridStore();
  const { isMuted, toggleMute } = useChordPlaybackStore();
  const { togglePlayback } = useGridPlayback();
  const hasChords = cells.some((c) => c !== null);

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
          <div className="flex items-center gap-1.5">
            <label htmlFor="bpm-input" className="text-muted text-sm">
              BPM
            </label>
            <input
              id="bpm-input"
              type="number"
              min={30}
              max={300}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="h-8 w-16 rounded-lg border border-border bg-surface px-2 text-center font-mono text-sm outline-none focus:border-foreground/30"
            />
          </div>

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

      {/* グリッド本体 */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-16 gap-px rounded-xl bg-border p-px">
          {/* ステップ番号ヘッダー */}
          {STEP_INDICES.map((i) => {
            const isBeat = i % 4 === 0;
            return (
              <div
                key={`header-${String(i)}`}
                className={cn(
                  "flex items-center justify-center py-1 text-center font-mono text-[10px]",
                  i === 0 && "rounded-tl-xl",
                  i === GRID_SIZE - 1 && "rounded-tr-xl",
                  isBeat ? "bg-surface font-semibold text-foreground" : "bg-card text-muted"
                )}
              >
                {i + 1}
              </div>
            );
          })}

          {/* コードセル */}
          {STEP_INDICES.map((i) => {
            const { label, isSustain } = getChordDisplayForCell(cells, i);
            const isCurrentStep = isPlaying && currentStep === i;
            const isBeatBoundary = i % 4 === 0;
            const cellChord = cells[i];

            return (
              <div
                key={`cell-${String(i)}`}
                className={cn(
                  "group relative flex min-h-12 flex-col items-center justify-center transition-colors md:min-h-10",
                  i === 0 && "rounded-bl-xl",
                  i === GRID_SIZE - 1 && "rounded-br-xl",
                  isCurrentStep && "ring-2 ring-foreground ring-inset",
                  cellChord
                    ? cn(
                        "border",
                        FUNCTION_BG_STYLES[cellChord.chordFunction] ?? "bg-card",
                        isCurrentStep && "brightness-95"
                      )
                    : isSustain
                      ? cn("bg-card", isCurrentStep && "bg-surface")
                      : cn("bg-card", isCurrentStep && "bg-surface"),
                  isBeatBoundary && !cellChord && "border-l-2 border-l-border"
                )}
              >
                {cellChord ? (
                  <>
                    <span className="font-bold font-mono text-xs leading-tight">{label}</span>
                    <span className="font-mono text-[9px] text-muted">
                      {cellChord.romanNumeral}
                    </span>
                    <button
                      type="button"
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => clearCell(i)}
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </>
                ) : isSustain ? (
                  <span className="text-muted/40 text-xs">-</span>
                ) : (
                  <span className="text-[10px] text-muted/20">&nbsp;</span>
                )}
              </div>
            );
          })}
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
