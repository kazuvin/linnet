"use client";

import { ShareIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/button";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useShareGrid } from "../hooks/use-share-grid";

export function ShareGridButton() {
  const hasChords = useChordGridStore((s) => s.getPlayableRowCount()) > 0;
  const shareGrid = useShareGrid();

  return (
    <IconButton onClick={shareGrid} disabled={!hasChords} aria-label="共有" title="共有">
      <ShareIcon className="h-4 w-4" />
    </IconButton>
  );
}
