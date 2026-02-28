"use client";

import { DragOverlay } from "@/lib/dnd";
import { ChordPalette } from "../chord-palette";
import type { PaletteDragData } from "../chord-palette/chord-palette";

const FUNCTION_CELL_STYLES: Record<string, string> = {
  tonic: "border-transparent bg-tonic text-tonic-foreground",
  subdominant: "border-transparent bg-subdominant text-subdominant-foreground",
  dominant: "border-transparent bg-dominant text-dominant-foreground",
};

type ChordBoardProps = {
  layout?: "row" | "wrap";
};

export function ChordBoard({ layout }: ChordBoardProps) {
  return (
    <section className="flex flex-col gap-6">
      <ChordPalette layout={layout} />
      <DragOverlay>
        {(item) => {
          const data = item.data as PaletteDragData;
          const bg =
            FUNCTION_CELL_STYLES[data.chordFunction] ?? "border-foreground/10 bg-background";
          return (
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-sm border shadow-lg ${bg}`}
            >
              <span className="font-bold text-[8px] leading-none">{data.symbol}</span>
            </div>
          );
        }}
      </DragOverlay>
    </section>
  );
}
