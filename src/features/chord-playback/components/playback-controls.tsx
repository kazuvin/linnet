"use client";

import { PlayIcon, VolumeIcon, VolumeOffIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/button";
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
      <IconButton
        onClick={onPlay}
        disabled={disabled || isPlaying}
        aria-label="コード進行を再生"
        title="コード進行を再生"
      >
        <PlayIcon className="h-4 w-4" />
      </IconButton>
      <IconButton
        onClick={toggleMute}
        aria-label={isMuted ? "ミュート解除" : "ミュート"}
        title={isMuted ? "ミュート解除" : "ミュート"}
      >
        {isMuted ? <VolumeOffIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
      </IconButton>
    </div>
  );
}
