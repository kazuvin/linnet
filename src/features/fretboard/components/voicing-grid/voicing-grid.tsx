"use client";

import { useMemo, useState } from "react";
import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import type { ChordVoicing } from "@/lib/music-theory";
import { ChordDiagram } from "../chord-diagram";

const INITIAL_DISPLAY_COUNT = 12;

type RootStringFilter = "all" | "6" | "5" | "4" | "3";

type VoicingGridProps = {
  voicings: readonly ChordVoicing[];
  chordSymbol: string;
};

export function VoicingGrid({ voicings, chordSymbol }: VoicingGridProps) {
  const [rootFilter, setRootFilter] = useState<RootStringFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const filteredVoicings = useMemo(() => {
    if (rootFilter === "all") return voicings;
    const rootString = Number(rootFilter);
    return voicings.filter((v) => v.rootString === rootString);
  }, [voicings, rootFilter]);

  const displayVoicings =
    showAll || filteredVoicings.length <= INITIAL_DISPLAY_COUNT
      ? filteredVoicings
      : filteredVoicings.slice(0, INITIAL_DISPLAY_COUNT);

  const hiddenCount = filteredVoicings.length - displayVoicings.length;

  if (voicings.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-sm">{chordSymbol} のボイシング</h3>
        <span className="text-[11px] text-muted">{filteredVoicings.length}件</span>
      </div>
      <TabNav
        value={rootFilter}
        onValueChange={(v) => {
          setRootFilter(v as RootStringFilter);
          setShowAll(false);
        }}
        variant="ghost"
        size="sm"
        className="self-start"
      >
        <TabNavItem value="all">すべて</TabNavItem>
        <TabNavItem value="6">6弦R</TabNavItem>
        <TabNavItem value="5">5弦R</TabNavItem>
        <TabNavItem value="4">4弦R</TabNavItem>
        <TabNavItem value="3">3弦R</TabNavItem>
      </TabNav>
      {displayVoicings.length > 0 ? (
        <>
          <div
            key={`${chordSymbol}-${rootFilter}`}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {displayVoicings.map((v, index) => (
              <div
                key={`${v.rootString}-${v.frets.join(",")}`}
                className="animate-stagger-fade-in-up"
                style={{ "--stagger-index": Math.min(index, 12) } as React.CSSProperties}
              >
                <ChordDiagram voicing={v} />
              </div>
            ))}
          </div>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="self-center rounded-lg border border-foreground/10 px-4 py-2 text-muted text-sm transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              さらに {hiddenCount} 件を表示
            </button>
          )}
        </>
      ) : (
        <p className="text-muted text-xs">このフィルターに該当するボイシングはありません</p>
      )}
    </div>
  );
}
