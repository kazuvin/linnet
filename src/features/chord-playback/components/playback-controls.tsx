"use client";

import { PlayIcon, VolumeIcon, VolumeOffIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useChordPlaybackStore } from "../stores/chord-playback-store";

type PlaybackControlsProps = {
  onPlay: () => void;
  disabled?: boolean;
};

export function PlaybackControls({ onPlay, disabled }: PlaybackControlsProps) {
  const isMuted = useChordPlaybackStore((s) => s.isMuted);
  const isPlaying = useChordPlaybackStore((s) => s.isPlaying);
  const toggleMute = useChordPlaybackStore((s) => s.toggleMute);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-colors md:h-7 md:w-7",
          disabled
            ? "cursor-not-allowed text-muted"
            : "text-muted hover:bg-foreground/10 hover:text-foreground"
        )}
        onClick={onPlay}
        disabled={disabled || isPlaying}
        aria-label="コード進行を再生"
        title="コード進行を再生"
      >
        <PlayIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
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
  );
}
