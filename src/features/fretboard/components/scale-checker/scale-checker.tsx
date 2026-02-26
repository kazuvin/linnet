"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/icons";
import { setSelectedScaleType } from "@/features/fretboard/stores/fretboard-store";
import { playScale, stopScale } from "@/lib/audio/scale-player";
import type { AvailableScaleInfo, ScaleType } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

type ScaleCheckerProps = {
  availableScales: readonly AvailableScaleInfo[];
  activeScaleType: ScaleType | null;
  chordSymbol: string;
  scaleRoot: string | null;
};

export function ScaleChecker({
  availableScales,
  activeScaleType,
  chordSymbol,
  scaleRoot,
}: ScaleCheckerProps) {
  const [playingScaleType, setPlayingScaleType] = useState<ScaleType | null>(null);

  if (availableScales.length === 0) return null;

  const handlePlayScale = async (scaleType: ScaleType, rootName: string) => {
    if (playingScaleType === scaleType) {
      stopScale();
      setPlayingScaleType(null);
      return;
    }
    setPlayingScaleType(scaleType);
    try {
      await playScale(rootName, scaleType);
    } finally {
      setPlayingScaleType(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted text-sm">
        <span className="font-bold font-mono text-foreground">{chordSymbol}</span> で使えるスケール:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {availableScales.map((scale) => {
          const isActive = scale.scaleType === activeScaleType;
          const isPlaying = scale.scaleType === playingScaleType;
          return (
            <div key={scale.scaleType} className="flex items-center gap-0.5">
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-xs transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted hover:bg-border hover:text-foreground"
                )}
                onClick={() => setSelectedScaleType(isActive ? null : scale.scaleType)}
              >
                {scaleRoot} {scale.displayName}
              </button>
              {isActive && scaleRoot && (
                <button
                  type="button"
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                    isPlaying
                      ? "bg-foreground text-background"
                      : "text-muted hover:bg-foreground/10 hover:text-foreground"
                  )}
                  onClick={() => handlePlayScale(scale.scaleType, scaleRoot)}
                  aria-label={isPlaying ? "スケール再生を停止" : "スケールを再生"}
                  title={isPlaying ? "スケール再生を停止" : "スケールを再生"}
                >
                  <PlayIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
