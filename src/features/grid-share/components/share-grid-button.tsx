"use client";

import { ShareIcon } from "@/components/icons";
import { addToast } from "@/components/ui/toast";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { cn } from "@/lib/utils";
import { buildShareUrl, type ShareData } from "../lib/grid-share-codec";

export function ShareGridButton() {
  const hasChords = useChordGridStore((s) => s.getPlayableRowCount()) > 0;

  const handleShare = async () => {
    const gridState = useChordGridStore.getState();
    const keyState = useKeyStore.getState();

    const data: ShareData = {
      grid: {
        rows: gridState.rows,
        bpm: gridState.bpm,
      },
      key: {
        rootName: keyState.rootName,
        chordType: keyState.chordType,
        selectedMode: keyState.selectedMode,
      },
    };

    const url = buildShareUrl(window.location.origin + window.location.pathname, data);

    try {
      await navigator.clipboard.writeText(url);
      addToast("共有リンクをコピーしました");
    } catch {
      addToast("クリップボードへのコピーに失敗しました", "error");
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors md:h-7 md:w-7",
        hasChords
          ? "text-muted hover:bg-foreground/10 hover:text-foreground"
          : "cursor-not-allowed text-muted/40"
      )}
      onClick={handleShare}
      disabled={!hasChords}
      aria-label="共有"
      title="共有"
    >
      <ShareIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
    </button>
  );
}
