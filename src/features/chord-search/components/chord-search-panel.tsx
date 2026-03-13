"use client";

import { Card } from "@/components";
import { FretboardGrid } from "@/features/fretboard/components";
import { MAX_FRET } from "@/features/fretboard/stores/fretboard-store";
import { useChordSearchStore } from "../stores/chord-search-store";
import { ChordSearchResults } from "./chord-search-results";

export function ChordSearchPanel() {
  const { selectedPitchClasses, togglePitchClass, clearAll } = useChordSearchStore();

  return (
    <div className="flex flex-col gap-[var(--grid-gap)] max-lg:gap-[var(--grid-gap-sm)]">
      <Card>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-muted text-sm">
              フレットボード上の音をクリックして、その音を含むコードを検索できます
            </p>
            {selectedPitchClasses.length > 0 && (
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
              selectedPitchClasses,
              onTogglePitchClass: togglePitchClass,
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
