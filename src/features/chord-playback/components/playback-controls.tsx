"use client";

import { PlayIcon, VolumeIcon, VolumeOffIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toggleMute, useChordPlaybackSnapshot } from "../stores/chord-playback-store";

type PlaybackControlsProps = {
  onPlay: () => void;
  disabled?: boolean;
};

export function PlaybackControls({ onPlay, disabled }: PlaybackControlsProps) {
  const { isMuted, isPlaying } = useChordPlaybackSnapshot();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
          disabled
            ? "cursor-not-allowed text-muted"
            : "text-muted hover:bg-foreground/10 hover:text-foreground"
        )}
        onClick={onPlay}
        disabled={disabled || isPlaying}
        aria-label="コード進行を再生"
        title="コード進行を再生"
      >
        <PlayIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
          "text-muted hover:bg-foreground/10 hover:text-foreground"
        )}
        onClick={toggleMute}
        aria-label={isMuted ? "ミュート解除" : "ミュート"}
        title={isMuted ? "ミュート解除" : "ミュート"}
      >
        {isMuted ? (
          <VolumeOffIcon className="h-3.5 w-3.5" />
        ) : (
          <VolumeIcon className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
