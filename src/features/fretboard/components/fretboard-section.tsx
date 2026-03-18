"use client";

import { Card } from "@/components";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { Fretboard } from "./fretboard";
import { GuitarVoicingCard } from "./guitar-voicing-card";

/**
 * フレットボードセクション。コード未選択時は非表示。
 */
export function FretboardSection() {
  const selectedChord = useSelectedProgressionChord();

  if (!selectedChord) return null;

  return (
    <>
      <Card id="fretboard-section" className="min-w-0 overflow-hidden">
        <Fretboard />
      </Card>
      <GuitarVoicingCard />
    </>
  );
}
