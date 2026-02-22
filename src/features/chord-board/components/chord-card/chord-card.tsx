import type { ComponentProps } from "react";
import { XIcon } from "@/components/icons";
import type { ChordFunction, ScaleType } from "@/lib/music-theory";
import { MODE_DISPLAY_NAMES } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

export type ChordCardData = {
  romanNumeral: string;
  symbol: string;
  chordFunction: ChordFunction;
  source: "diatonic" | ScaleType;
};

type ChordCardProps = Omit<ComponentProps<"div">, "children"> & {
  chord: ChordCardData;
  isSelected?: boolean;
  isDragging?: boolean;
  onRemove?: () => void;
};

const FUNCTION_LABEL: Record<ChordFunction, string> = {
  tonic: "T",
  subdominant: "SD",
  dominant: "D",
};

const CARD_BG_STYLES: Record<ChordFunction, string> = {
  tonic: "bg-tonic-subtle border-tonic/30",
  subdominant: "bg-subdominant-subtle border-subdominant/30",
  dominant: "bg-dominant-subtle border-dominant/30",
};

const BADGE_STYLES: Record<ChordFunction, string> = {
  tonic: "bg-tonic text-tonic-fg",
  subdominant: "bg-subdominant text-subdominant-fg",
  dominant: "bg-dominant text-dominant-fg",
};

const MODE_SHORT_NAMES: Record<string, string> = {
  "natural-minor": "Nat.min",
  "harmonic-minor": "Har.min",
  "melodic-minor": "Mel.min",
  dorian: "Dor",
  phrygian: "Phr",
  lydian: "Lyd",
  mixolydian: "Mix",
};

function formatSourceLabel(source: "diatonic" | ScaleType): string | null {
  if (source === "diatonic") return null;
  return MODE_SHORT_NAMES[source] ?? MODE_DISPLAY_NAMES[source] ?? source;
}

export function ChordCard({
  chord,
  isSelected,
  isDragging,
  onRemove,
  className,
  ...props
}: ChordCardProps) {
  const { romanNumeral, symbol, chordFunction, source } = chord;
  const sourceLabel = formatSourceLabel(source);

  return (
    <div
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-center rounded-2xl border shadow-card transition-shadow hover:shadow-card-hover",
        "cursor-grab select-none gap-1 overflow-visible active:cursor-grabbing",
        isSelected
          ? "border-foreground bg-foreground text-background"
          : CARD_BG_STYLES[chordFunction],
        isDragging && "opacity-0",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "max-w-full truncate px-1 text-center font-mono text-[10px] leading-tight",
          isSelected ? "text-background/60" : "text-muted"
        )}
      >
        {romanNumeral}
        {sourceLabel && <span className="ml-0.5 text-[9px]">({sourceLabel})</span>}
      </span>
      <span className="font-bold font-mono text-base">{symbol}</span>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-1.5 py-0.5 font-semibold text-[10px]",
          BADGE_STYLES[chordFunction]
        )}
      >
        {FUNCTION_LABEL[chordFunction]}
      </span>
      {onRemove && (
        <button
          type="button"
          className={cn(
            "absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100",
            isSelected ? "bg-background text-foreground" : "bg-foreground text-background"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
