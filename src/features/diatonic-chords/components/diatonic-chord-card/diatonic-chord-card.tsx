import type { ComponentProps } from "react";
import type { ChordFunction, DiatonicChordInfo } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

export type DiatonicChordCardProps = ComponentProps<"div"> & {
  chordInfo: DiatonicChordInfo;
  dimmed?: boolean;
  compact?: boolean;
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

function formatChordNotes(chordInfo: DiatonicChordInfo): string {
  return chordInfo.chord.notes.map((note) => note.name).join(" - ");
}

export function DiatonicChordCard({
  chordInfo,
  dimmed,
  compact,
  className,
  ...props
}: DiatonicChordCardProps) {
  const { romanNumeral, chord, chordFunction } = chordInfo;

  return (
    <div
      className={cn(
        "flex aspect-square flex-col items-center justify-center rounded-2xl border shadow-card transition-shadow hover:shadow-card-hover",
        compact ? "gap-1" : "gap-2",
        CARD_BG_STYLES[chordFunction],
        dimmed && "opacity-40",
        className
      )}
      {...props}
    >
      <span className={cn("font-mono text-muted", compact ? "text-[10px]" : "text-sm")}>
        {romanNumeral}
      </span>
      <span className={cn("font-bold font-mono", compact ? "text-base" : "text-xl")}>
        {chord.symbol}
      </span>
      {!compact && <span className="text-muted text-xs">{formatChordNotes(chordInfo)}</span>}
      <span
        className={cn(
          "mt-1 inline-flex items-center rounded-full py-0.5 font-semibold",
          compact ? "px-1.5 text-[10px]" : "px-2 text-xs",
          BADGE_STYLES[chordFunction]
        )}
      >
        {FUNCTION_LABEL[chordFunction]}
      </span>
    </div>
  );
}
