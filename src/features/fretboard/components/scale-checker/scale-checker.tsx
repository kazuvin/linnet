"use client";

import { setSelectedScaleType } from "@/features/fretboard/stores/fretboard-store";
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
  if (availableScales.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted text-sm">
        <span className="font-bold font-mono text-foreground">{chordSymbol}</span> で使えるスケール:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {availableScales.map((scale) => {
          const isActive = scale.scaleType === activeScaleType;
          return (
            <button
              key={scale.scaleType}
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
          );
        })}
      </div>
    </div>
  );
}
