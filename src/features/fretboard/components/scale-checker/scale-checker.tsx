"use client";

import { useState } from "react";
import { PlayIcon, StopIcon } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { playScale, stopScale } from "@/lib/audio/scale-player";
import type { AvailableScaleInfo, ScaleType } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

type ScaleCheckerProps = {
  availableScales: readonly AvailableScaleInfo[];
  activeScaleType: ScaleType | null;
  chordSymbol: string | null;
  scaleRoot: string | null;
};

const NONE_VALUE = "__none__";

export function ScaleChecker({
  availableScales,
  activeScaleType,
  chordSymbol,
  scaleRoot,
}: ScaleCheckerProps) {
  const setSelectedScaleType = useFretboardStore((s) => s.setSelectedScaleType);
  const [playingScaleType, setPlayingScaleType] = useState<ScaleType | null>(null);

  const hasScales = availableScales.length > 0;

  const handleScaleChange = (value: string) => {
    if (value === NONE_VALUE) {
      setSelectedScaleType(null);
    } else {
      setSelectedScaleType(value as ScaleType);
    }
  };

  const handlePlayScale = async () => {
    if (!activeScaleType || !scaleRoot) return;

    if (playingScaleType === activeScaleType) {
      stopScale();
      setPlayingScaleType(null);
      return;
    }
    setPlayingScaleType(activeScaleType);
    try {
      await playScale(scaleRoot, activeScaleType);
    } finally {
      setPlayingScaleType(null);
    }
  };

  const isPlaying = playingScaleType !== null && playingScaleType === activeScaleType;

  const activeScaleDisplayName = hasScales
    ? availableScales.find((s) => s.scaleType === activeScaleType)?.displayName
    : undefined;

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-muted text-sm">
        {chordSymbol ? (
          <>
            <span className="font-bold text-foreground">{chordSymbol}</span> スケール
          </>
        ) : (
          "スケール"
        )}
      </span>
      <Select
        value={activeScaleType ?? NONE_VALUE}
        onValueChange={handleScaleChange}
        disabled={!hasScales}
      >
        <SelectTrigger>
          <SelectValue>
            {hasScales && activeScaleDisplayName ? `${scaleRoot} ${activeScaleDisplayName}` : "---"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableScales.map((scale) => (
            <SelectItem key={scale.scaleType} value={scale.scaleType}>
              {scaleRoot} {scale.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {activeScaleType && scaleRoot && (
        <button
          type="button"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors md:h-7 md:w-7",
            isPlaying
              ? "bg-foreground text-background"
              : "text-muted hover:bg-foreground/10 hover:text-foreground"
          )}
          onClick={handlePlayScale}
          aria-label={isPlaying ? "スケール再生を停止" : "スケールを再生"}
          title={isPlaying ? "スケール再生を停止" : "スケールを再生"}
        >
          {isPlaying ? (
            <StopIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
          ) : (
            <PlayIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
