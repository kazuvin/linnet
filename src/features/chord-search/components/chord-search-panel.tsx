"use client";

import { useChordSearchStore } from "../stores/chord-search-store";
import { ChordSearchResults } from "./chord-search-results";
import { NoteSelector } from "./note-selector";

export function ChordSearchPanel() {
  const { selectedPitchClasses, togglePitchClass, clearAll } = useChordSearchStore();

  return (
    <div className="flex flex-col gap-6">
      <NoteSelector
        selectedPitchClasses={selectedPitchClasses}
        onToggle={togglePitchClass}
        onClear={clearAll}
      />
      <ChordSearchResults selectedPitchClasses={selectedPitchClasses} />
    </div>
  );
}
