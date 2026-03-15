"use client";

import { useMemo } from "react";
import { VoicingGrid } from "@/features/fretboard/components";
import { type ChordQuality, findChordPositions, formatChordSymbol } from "@/lib/music-theory";

type ChordSearchVoicingsProps = {
  rootName: string;
  quality: ChordQuality;
};

export function ChordSearchVoicings({ rootName, quality }: ChordSearchVoicingsProps) {
  const chordSymbol = formatChordSymbol(rootName, quality);
  const voicings = useMemo(() => findChordPositions(rootName, quality), [rootName, quality]);

  if (voicings.length === 0) return null;

  return <VoicingGrid voicings={voicings} chordSymbol={chordSymbol} />;
}
