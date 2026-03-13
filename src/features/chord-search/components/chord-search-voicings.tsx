"use client";

import { useMemo, useState } from "react";
import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import { ChordDiagram } from "@/features/fretboard/components";
import { type ChordQuality, findChordPositions, formatChordSymbol } from "@/lib/music-theory";

type RootStringFilter = "all" | "6" | "5" | "4" | "3";

type ChordSearchVoicingsProps = {
  rootName: string;
  quality: ChordQuality;
};

export function ChordSearchVoicings({ rootName, quality }: ChordSearchVoicingsProps) {
  const [rootFilter, setRootFilter] = useState<RootStringFilter>("all");
  const chordSymbol = formatChordSymbol(rootName, quality);

  const voicings = useMemo(() => findChordPositions(rootName, quality), [rootName, quality]);

  const filteredVoicings = useMemo(() => {
    if (rootFilter === "all") return voicings;
    const rootString = Number(rootFilter);
    return voicings.filter((v) => v.rootString === rootString);
  }, [voicings, rootFilter]);

  if (voicings.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-sm">{chordSymbol} のボイシング</h3>
        <span className="text-[11px] text-muted">{filteredVoicings.length}件</span>
      </div>
      <TabNav
        value={rootFilter}
        onValueChange={(v) => setRootFilter(v as RootStringFilter)}
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
      {filteredVoicings.length > 0 ? (
        <div
          key={`${chordSymbol}-${rootFilter}`}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {filteredVoicings.map((v, index) => (
            <div
              key={`${v.rootString}-${v.frets.join(",")}`}
              className="animate-stagger-fade-in-up"
              style={{ "--stagger-index": Math.min(index, 12) } as React.CSSProperties}
            >
              <ChordDiagram voicing={v} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-xs">このフィルターに該当するボイシングはありません</p>
      )}
    </section>
  );
}
