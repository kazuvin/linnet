"use client";

import { FUNCTION_CELL_STYLES } from "@/features/chord-grid/lib/chord-function-styles";
import { DragOverlay } from "@/lib/dnd";
import { ChordPalette } from "../chord-palette";
import type { PaletteDragData } from "../chord-palette/chord-palette";

type ChordBoardProps = {
  layout?: "row" | "wrap";
  /** "grid" でグリッドに追加、"view" でフレットボード表示のみ */
  interactionMode?: "grid" | "view";
  /** セクション見出し */
  heading?: string;
};

export function ChordBoard({ layout, interactionMode, heading }: ChordBoardProps) {
  return (
    <section className="flex flex-col gap-6">
      <ChordPalette layout={layout} interactionMode={interactionMode} heading={heading} />
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
