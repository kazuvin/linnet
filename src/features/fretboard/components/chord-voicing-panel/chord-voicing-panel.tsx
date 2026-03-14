"use client";

import { useMemo } from "react";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { findChordPositions } from "@/lib/music-theory";
import { VoicingGrid } from "../voicing-grid";

export function ChordVoicingPanel() {
  const selectedChord = useSelectedProgressionChord();

  const voicings = useMemo(() => {
    if (!selectedChord) return [];
    return findChordPositions(selectedChord.rootName, selectedChord.quality);
  }, [selectedChord]);

  if (!selectedChord || voicings.length === 0) {
    return null;
  }

  return <VoicingGrid voicings={voicings} chordSymbol={selectedChord.symbol} />;
}
