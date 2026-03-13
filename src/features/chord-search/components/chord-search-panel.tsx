"use client";

import { useMemo } from "react";
import { FretboardGrid } from "@/features/fretboard/components";
import { MAX_FRET } from "@/features/fretboard/stores/fretboard-store";
import { getNoteAtPosition, type PitchClass } from "@/lib/music-theory";
import { useChordSearchStore } from "../stores/chord-search-store";
import { ChordSearchResults } from "./chord-search-results";
import { ChordSearchVoicings } from "./chord-search-voicings";

export function ChordSearchFretboard() {
  const { selectedPositions, togglePosition, clearAll } = useChordSearchStore();

  return (
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
  );
}

export function ChordSearchResultsPanel() {
  const { selectedPositions, selectedChord, selectChord } = useChordSearchStore();

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
    <ChordSearchResults
      selectedPitchClasses={selectedPitchClasses}
      selectedChord={selectedChord}
      onSelectChord={selectChord}
    />
  );
}

export function ChordSearchVoicingsPanel() {
  const { selectedChord } = useChordSearchStore();

  if (!selectedChord) return null;

  return <ChordSearchVoicings rootName={selectedChord.rootName} quality={selectedChord.quality} />;
}
