"use client";

import { Card } from "@/components";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { ChordVoicingPanel } from "../chord-voicing-panel";

export function GuitarVoicingCard() {
  const activeInstrument = useFretboardStore((s) => s.activeInstrument);

  if (activeInstrument !== "fretboard") return null;

  return (
    <Card className="min-w-0 overflow-hidden">
      <ChordVoicingPanel />
    </Card>
  );
}
