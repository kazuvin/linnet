"use client";

import { useMemo } from "react";
import { VoicingGrid } from "@/features/fretboard/components";
import { type ChordQuality, findChordPositions, formatChordSymbol } from "@/lib/music-theory";

type ChordSearchVoicingsProps = {
  rootName: string;
  quality: ChordQuality;
  bassNoteName?: string;
};

export function ChordSearchVoicings({ rootName, quality, bassNoteName }: ChordSearchVoicingsProps) {
  const chordSymbol = bassNoteName
    ? `${formatChordSymbol(rootName, quality)}/${bassNoteName}`
    : formatChordSymbol(rootName, quality);
  const voicings = useMemo(
    () => findChordPositions(rootName, quality, 15, undefined, bassNoteName),
    [rootName, quality, bassNoteName]
  );

  if (voicings.length === 0) return null;

  return <VoicingGrid voicings={voicings} chordSymbol={chordSymbol} />;
}
