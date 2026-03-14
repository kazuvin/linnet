"use client";

import { PlayIcon, StopIcon, TrashIcon, VolumeIcon, VolumeOffIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/button";
import { NumberStepper } from "@/components/ui/number-stepper";
import { deleteSelectedGridCell } from "@/features/store-coordination";
import { cn } from "@/lib/utils";
import type { GridChord } from "../../stores/chord-grid-store";
import { GridActionsMenu } from "../grid-actions-menu";

const FUNCTION_CELL_STYLES: Record<string, string> = {
  tonic: "border-transparent bg-tonic text-tonic-foreground",
  subdominant: "border-transparent bg-subdominant text-subdominant-foreground",
  dominant: "border-transparent bg-dominant text-dominant-foreground",
};

type GridControlBarProps = {
  selectedChord: GridChord | null;
  isPlaying: boolean;
  hasChords: boolean;
  togglePlayback: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  clearGrid: () => void;
};

export function GridControlBar({
  selectedChord,
  isPlaying,
  hasChords,
  togglePlayback,
  isMuted,
  toggleMute,
  bpm,
  setBpm,
  clearGrid,
}: GridControlBarProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-x-3">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="shrink-0 font-bold text-lg">Grid</h2>

        {/* 選択中: コード名 + アクション */}
        {selectedChord && (
          <div
            className={cn(
              "flex h-8 items-center gap-0.5 rounded-sm border pr-0.5 pl-2",
              FUNCTION_CELL_STYLES[selectedChord.chordFunction] ??
                "border-border bg-surface-elevated"
            )}
          >
            <span className="font-bold text-sm leading-none">{selectedChord.symbol}</span>
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

        <div className="ml-auto flex items-center gap-1">
          <IconButton
            className={isPlaying ? "bg-foreground text-background hover:bg-foreground" : undefined}
            onClick={togglePlayback}
            disabled={!hasChords}
            aria-label={isPlaying ? "停止" : "再生"}
            title={isPlaying ? "停止" : "再生"}
          >
            {isPlaying ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </IconButton>
          <IconButton
            onClick={toggleMute}
            aria-label={isMuted ? "ミュート解除" : "ミュート"}
            title={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? <VolumeOffIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
          </IconButton>
          <GridActionsMenu />
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3">
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
            onClick={() => {
              if (window.confirm("グリッドをクリアしますか？")) {
                clearGrid();
              }
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
