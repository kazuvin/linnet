"use client";

import { cn } from "@/lib/utils";
import { COLUMNS } from "../../stores/chord-grid-store";

const COL_INDICES = Array.from({ length: COLUMNS }, (_, i) => i);

export function GridHeader() {
  return (
    <div className="flex items-end gap-0.5">
      {COL_INDICES.map((col) => {
        const isBeat = col % 4 === 0;
        return (
          <div
            key={`header-${String(col)}`}
            className={cn(
              "flex h-4 w-8 shrink-0 items-center justify-center text-[9px] md:w-7 lg:w-auto lg:flex-1",
              isBeat ? "font-semibold text-foreground" : "text-muted/50"
            )}
          >
            {isBeat ? col / 4 + 1 : ""}
          </div>
        );
      })}
      <div className="w-6 shrink-0" />
    </div>
  );
}
