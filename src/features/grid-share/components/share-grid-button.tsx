"use client";

import { ShareIcon } from "@/components/icons";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { cn } from "@/lib/utils";
import { useShareGrid } from "../hooks/use-share-grid";

export function ShareGridButton() {
  const hasChords = useChordGridStore((s) => s.getPlayableRowCount()) > 0;
  const shareGrid = useShareGrid();

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors md:h-7 md:w-7",
        hasChords
          ? "text-muted hover:bg-foreground/10 hover:text-foreground"
          : "cursor-not-allowed text-muted/40"
      )}
      onClick={shareGrid}
      disabled={!hasChords}
      aria-label="共有"
      title="共有"
    >
      <ShareIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
    </button>
  );
}
