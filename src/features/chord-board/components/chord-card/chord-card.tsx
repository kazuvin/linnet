import type { ComponentProps } from "react";
import { XIcon } from "@/components/icons";
import type { ChordFunction, ChordSource } from "@/lib/music-theory";
import { MODE_DISPLAY_NAMES } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

export type ChordCardData = {
  romanNumeral: string;
  symbol: string;
  chordFunction: ChordFunction;
  source: ChordSource;
};

export type ChordCardDetailItem = {
  label: string;
  value: string;
};

type ChordCardProps = Omit<ComponentProps<"div">, "children"> & {
  chord: ChordCardData;
  isSelected?: boolean;
  isDragging?: boolean;
  onRemove?: () => void;
  detailItems?: ChordCardDetailItem[];
};

const FUNCTION_LABEL: Record<ChordFunction, string> = {
  tonic: "T",
  subdominant: "SD",
  dominant: "D",
};

const CARD_BG_STYLES: Record<ChordFunction, string> = {
  tonic: "bg-tonic text-tonic-foreground border-transparent",
  subdominant: "bg-subdominant text-subdominant-foreground border-transparent",
  dominant: "bg-dominant text-dominant-foreground border-transparent",
};

const BADGE_STYLES: Record<ChordFunction, string> = {
  tonic: "bg-tonic text-tonic-foreground",
  subdominant: "bg-subdominant text-subdominant-foreground",
  dominant: "bg-dominant text-dominant-foreground",
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

function formatSourceLabel(source: ChordSource): string | null {
  if (source === "diatonic") return null;
  if (source === "secondary-dominant") return "SecDom";
  if (source === "tritone-substitution") return "SubV";
  return MODE_SHORT_NAMES[source] ?? MODE_DISPLAY_NAMES[source] ?? source;
}

export function ChordCard({
  chord,
  isSelected,
  isDragging,
  onRemove,
  detailItems,
  className,
  ...props
}: ChordCardProps) {
  const { romanNumeral, symbol, chordFunction, source } = chord;
  const sourceLabel = formatSourceLabel(source);
  const hasDetails = detailItems && detailItems.length > 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-sm border shadow-card transition-all duration-150 hover:shadow-card-hover active:scale-90 active:shadow-inner lg:rounded-2xl",
        "cursor-grab select-none gap-0.5 overflow-visible active:cursor-grabbing lg:gap-1",
        "ring-0 ring-foreground ring-offset-0 ring-offset-background",
        hasDetails ? "py-2 lg:py-3" : "aspect-square",
        CARD_BG_STYLES[chordFunction],
        isSelected && "ring-2 ring-offset-2",
        isDragging && "opacity-0",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "max-w-full truncate px-1 text-center text-[7px] leading-tight lg:text-[10px]",
          "text-muted"
        )}
      >
        {romanNumeral}
        {sourceLabel && <span className="ml-0.5 hidden text-[9px] lg:inline">({sourceLabel})</span>}
      </span>
      <span className="font-bold text-[10px] lg:text-base">{symbol}</span>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-1 py-0 font-semibold text-[7px] lg:px-1.5 lg:py-0.5 lg:text-[10px]",
          BADGE_STYLES[chordFunction]
        )}
      >
        {FUNCTION_LABEL[chordFunction]}
      </span>
      {hasDetails && (
        <div className="mt-1 hidden w-full flex-col gap-0.5 border-current/10 border-t px-1.5 pt-1 lg:flex">
          {detailItems.map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="text-[8px] text-muted">{item.label}</span>
              <span className="text-[9px] leading-tight">{item.value}</span>
            </div>
          ))}
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          className={cn(
            "absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full transition-opacity md:opacity-0 md:group-hover:opacity-100 lg:-top-2 lg:-right-2 lg:h-7 lg:w-7",
            "bg-foreground text-background"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XIcon className="h-3.5 w-3.5 md:h-3 md:w-3" />
        </button>
      )}
    </div>
  );
}
