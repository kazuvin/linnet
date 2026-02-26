"use client";

import {
  setShowAvoidNotes,
  setShowCharacteristicNotes,
  useFretboardSnapshot,
} from "@/features/fretboard/stores/fretboard-store";
import { cn } from "@/lib/utils";

type LegendItem = {
  label: string;
  dotClass: string;
  ringClass?: string;
};

const BASE_ITEMS: readonly LegendItem[] = [
  { label: "Root", dotClass: "bg-chord-root text-chord-root-fg" },
  { label: "Chord Tone", dotClass: "bg-chord-tone text-chord-tone-fg" },
  { label: "Scale Tone", dotClass: "bg-scale-tone text-scale-tone-fg" },
];

const CHARACTERISTIC_ITEM: LegendItem = {
  label: "特性音",
  dotClass: "bg-scale-tone text-scale-tone-fg",
  ringClass: "ring-[1.5px] ring-foreground/40",
};

const AVOID_ITEM: LegendItem = {
  label: "Avoid",
  dotClass: "bg-avoid-note text-avoid-note-fg",
};

export function FretboardLegend() {
  const { showCharacteristicNotes, showAvoidNotes } = useFretboardSnapshot();

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs">
      {/* 基本凡例 */}
      {BASE_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex size-4 items-center justify-center rounded-full font-bold font-mono text-[8px]",
              item.dotClass,
              item.ringClass
            )}
          />
          <span>{item.label}</span>
        </div>
      ))}

      {/* 特性音トグル */}
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-colors",
          showCharacteristicNotes ? "bg-foreground/5" : "bg-foreground/5 opacity-50"
        )}
        onClick={() => setShowCharacteristicNotes(!showCharacteristicNotes)}
      >
        <span
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-full font-bold font-mono text-[8px]",
            CHARACTERISTIC_ITEM.dotClass,
            CHARACTERISTIC_ITEM.ringClass
          )}
        />
        <span>{CHARACTERISTIC_ITEM.label}</span>
        <span
          className={cn(
            "ml-0.5 text-[10px]",
            showCharacteristicNotes ? "text-foreground/60" : "text-foreground/30"
          )}
        >
          {showCharacteristicNotes ? "ON" : "OFF"}
        </span>
      </button>

      {/* アヴォイドノートトグル */}
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-colors",
          showAvoidNotes ? "bg-foreground/5" : "bg-foreground/5 opacity-50"
        )}
        onClick={() => setShowAvoidNotes(!showAvoidNotes)}
      >
        <span
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-full font-bold font-mono text-[8px]",
            AVOID_ITEM.dotClass
          )}
        />
        <span>{AVOID_ITEM.label}</span>
        <span
          className={cn(
            "ml-0.5 text-[10px]",
            showAvoidNotes ? "text-foreground/60" : "text-foreground/30"
          )}
        >
          {showAvoidNotes ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}
