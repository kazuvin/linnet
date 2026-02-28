"use client";

import { useMemo, useState } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { type ChordVoicing, findChordPositions } from "@/lib/music-theory";
import { ChordDiagram } from "../chord-diagram";

type RootStringFilter = "all" | 6 | 5 | 4;

export function ChordVoicingPanel() {
  const selectedChord = useSelectedProgressionChord();
  const maxFret = useFretboardStore((s) => s.maxFret);
  const [rootFilter, setRootFilter] = useState<RootStringFilter>("all");
  const [selectedVoicingIdx, setSelectedVoicingIdx] = useState<number>(0);

  const voicings = useMemo(() => {
    if (!selectedChord) return [];
    return findChordPositions(selectedChord.rootName, selectedChord.quality, maxFret);
  }, [selectedChord, maxFret]);

  const filteredVoicings = useMemo(() => {
    if (rootFilter === "all") return voicings;
    return voicings.filter((v) => v.rootString === rootFilter);
  }, [voicings, rootFilter]);

  // フィルタ変更時にインデックスをリセット
  const handleFilterChange = (filter: RootStringFilter) => {
    setRootFilter(filter);
    setSelectedVoicingIdx(0);
  };

  if (!selectedChord || voicings.length === 0) {
    return null;
  }

  const selectedVoicing: ChordVoicing | undefined = filteredVoicings[selectedVoicingIdx];

  return (
    <div className="flex flex-col gap-3">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-sm">{selectedChord.symbol} のボイシング</h3>
        {/* ルート弦フィルター */}
        <div className="flex gap-1">
          {(["all", 6, 5, 4] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${
                rootFilter === filter
                  ? "bg-foreground/10 font-medium text-foreground"
                  : "text-muted hover:bg-foreground/5"
              }`}
              onClick={() => handleFilterChange(filter)}
            >
              {filter === "all" ? "すべて" : `${filter}弦R`}
            </button>
          ))}
        </div>
      </div>

      {/* ダイアグラム一覧 */}
      {filteredVoicings.length > 0 ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8">
          <div className="flex gap-2">
            {filteredVoicings.map((v, i) => (
              <ChordDiagram
                key={`${v.rootString}-${v.frets.join(",")}`}
                voicing={v}
                isSelected={i === selectedVoicingIdx}
                onClick={() => setSelectedVoicingIdx(i)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted text-xs">このフィルターに該当するボイシングはありません</p>
      )}

      {/* 選択中のボイシング情報 */}
      {selectedVoicing && (
        <div className="text-muted text-xs">{formatVoicingFrets(selectedVoicing)}</div>
      )}
    </div>
  );
}

function formatVoicingFrets(voicing: ChordVoicing): string {
  return voicing.frets.map((f) => (f === null ? "x" : String(f))).join(" ");
}
