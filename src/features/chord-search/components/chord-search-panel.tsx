"use client";

import { useMemo } from "react";
import { Card } from "@/components";
import { FretboardGrid } from "@/features/fretboard/components";
import { MAX_FRET } from "@/features/fretboard/stores/fretboard-store";
import { getNoteAtPosition, type PitchClass } from "@/lib/music-theory";
import { useChordSearchStore } from "../stores/chord-search-store";
import { ChordSearchResults } from "./chord-search-results";

export function ChordSearchPanel() {
  const { selectedPositions, togglePosition, clearAll } = useChordSearchStore();

  // 選択されたポジションからユニークなピッチクラスを導出
  const selectedPitchClasses = useMemo(() => {
    const seen = new Set<number>();
    const result: PitchClass[] = [];
    for (const pos of selectedPositions) {
      const note = getNoteAtPosition(pos.string, pos.fret);
      if (!seen.has(note.pitchClass)) {
        seen.add(note.pitchClass);
        result.push(note.pitchClass);
      }
    }
    return result;
  }, [selectedPositions]);

  return (
    <div className="flex flex-col gap-[var(--grid-gap)] max-lg:gap-[var(--grid-gap-sm)]">
      <Card className="min-w-0 overflow-hidden">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted text-sm">
              フレットボード上の音をクリックして、その音を含むコードを検索できます
            </p>
            {selectedPositions.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="shrink-0 text-muted text-xs transition-colors hover:text-foreground"
              >
                クリア
              </button>
            )}
          </div>
          <FretboardGrid
            positions={[]}
            maxFret={MAX_FRET}
            showCharacteristicNotes={false}
            showAvoidNotes={false}
            searchMode={{
              selectedPositions,
              onTogglePosition: togglePosition,
            }}
          />
        </section>
      </Card>
      <Card>
        <ChordSearchResults selectedPitchClasses={selectedPitchClasses} />
      </Card>
    </div>
  );
}
