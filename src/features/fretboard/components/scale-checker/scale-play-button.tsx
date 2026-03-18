"use client";

import { useState } from "react";
import { PlayIcon, StopIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/button";
import { playScale, stopScale } from "@/lib/audio/scale-player";
import type { ScaleType } from "@/lib/music-theory";

type ScalePlayButtonProps = {
  scaleType: ScaleType;
  scaleRoot: string;
};

export function ScalePlayButton({ scaleType, scaleRoot }: ScalePlayButtonProps) {
  const [playingScaleType, setPlayingScaleType] = useState<ScaleType | null>(null);

  const handlePlayScale = async () => {
    if (playingScaleType === scaleType) {
      stopScale();
      setPlayingScaleType(null);
      return;
    }
    setPlayingScaleType(scaleType);
    try {
      await playScale(scaleRoot, scaleType);
    } finally {
      setPlayingScaleType(null);
    }
  };

  const isPlaying = playingScaleType !== null && playingScaleType === scaleType;

  return (
    <IconButton
      className={isPlaying ? "bg-foreground text-background hover:bg-foreground" : undefined}
      onClick={handlePlayScale}
      aria-label={isPlaying ? "スケール再生を停止" : "スケールを再生"}
      title={isPlaying ? "スケール再生を停止" : "スケールを再生"}
    >
      {isPlaying ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
    </IconButton>
  );
}
