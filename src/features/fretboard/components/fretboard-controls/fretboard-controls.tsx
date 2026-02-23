"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type FretboardDisplayMode,
  setDisplayMode,
  setMaxFret,
  setScaleType,
} from "@/features/fretboard/stores/fretboard-store";
import { SCALE_TYPES, type ScaleType } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

type FretboardControlsProps = {
  displayMode: FretboardDisplayMode;
  scaleType: ScaleType;
  maxFret: number;
};

const SCALE_DISPLAY_NAMES: Record<ScaleType, string> = {
  major: "Major",
  "natural-minor": "Natural Minor",
  "harmonic-minor": "Harmonic Minor",
  "melodic-minor": "Melodic Minor",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  aeolian: "Aeolian",
  locrian: "Locrian",
};

const MAX_FRET_OPTIONS = [12, 15, 19, 22, 24] as const;

export function FretboardControls({ displayMode, scaleType, maxFret }: FretboardControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Display mode toggle */}
      <div className="inline-flex rounded-full border border-foreground/10 bg-background p-0.5">
        <button
          type="button"
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-all duration-150",
            displayMode === "chord-tones"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          )}
          onClick={() => setDisplayMode("chord-tones")}
        >
          コード構成音
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-all duration-150",
            displayMode === "scale"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          )}
          onClick={() => setDisplayMode("scale")}
        >
          スケール
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-all duration-150",
            displayMode === "voicing"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          )}
          onClick={() => setDisplayMode("voicing")}
        >
          ボイシング
        </button>
      </div>

      {/* Scale type selector (only in scale mode) */}
      {displayMode === "scale" && (
        <Select value={scaleType} onValueChange={(v) => setScaleType(v as ScaleType)}>
          <SelectTrigger>
            <SelectValue>{SCALE_DISPLAY_NAMES[scaleType]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SCALE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {SCALE_DISPLAY_NAMES[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Max fret selector */}
      <Select value={String(maxFret)} onValueChange={(v) => setMaxFret(Number(v))}>
        <SelectTrigger>
          <SelectValue>{maxFret} フレット</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MAX_FRET_OPTIONS.map((fret) => (
            <SelectItem key={fret} value={String(fret)}>
              {fret} フレット
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
