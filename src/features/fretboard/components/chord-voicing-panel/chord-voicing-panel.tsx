"use client";

import { useMemo, useState } from "react";
import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { findChordPositions } from "@/lib/music-theory";
import { ChordDiagram } from "../chord-diagram";

type RootStringFilter = "all" | "6" | "5" | "4";

export function ChordVoicingPanel() {
  const selectedChord = useSelectedProgressionChord();
  const maxFret = useFretboardStore((s) => s.maxFret);
  const [rootFilter, setRootFilter] = useState<RootStringFilter>("all");

  const voicings = useMemo(() => {
    if (!selectedChord) return [];
    return findChordPositions(selectedChord.rootName, selectedChord.quality, maxFret);
  }, [selectedChord, maxFret]);

  const filteredVoicings = useMemo(() => {
    if (rootFilter === "all") return voicings;
    const rootString = Number(rootFilter);
    return voicings.filter((v) => v.rootString === rootString);
  }, [voicings, rootFilter]);

  if (!selectedChord || voicings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-sm">{selectedChord.symbol} のボイシング</h3>
        <span className="text-[11px] text-muted">{filteredVoicings.length}件</span>
      </div>

      {/* ルート弦フィルター（TabNav） */}
      <TabNav
        value={rootFilter}
        onValueChange={(v) => setRootFilter(v as RootStringFilter)}
        variant="ghost"
        size="sm"
        className="self-start"
      >
        <TabNavItem value="all">すべて</TabNavItem>
        <TabNavItem value="6">6弦ルート</TabNavItem>
        <TabNavItem value="5">5弦ルート</TabNavItem>
        <TabNavItem value="4">4弦ルート</TabNavItem>
      </TabNav>

      {/* ダイアグラム一覧（レスポンシブグリッド） */}
      {filteredVoicings.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredVoicings.map((v) => (
            <ChordDiagram key={`${v.rootString}-${v.frets.join(",")}`} voicing={v} />
          ))}
        </div>
      ) : (
        <p className="text-muted text-xs">このフィルターに該当するボイシングはありません</p>
      )}
    </div>
  );
}
