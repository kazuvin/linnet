"use client";

import { Card } from "@/components";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { ChordVoicingPanel } from "../chord-voicing-panel";

export function GuitarVoicingCard() {
  const activeInstrument = useFretboardStore((s) => s.activeInstrument);
  const selectedChord = useSelectedProgressionChord();

  if (activeInstrument !== "fretboard" || !selectedChord) return null;

  return (
    <Card className="min-w-0 overflow-hidden">
      <ChordVoicingPanel />
    </Card>
  );
}
