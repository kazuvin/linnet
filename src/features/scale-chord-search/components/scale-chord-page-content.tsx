"use client";

import { Card } from "@/components";
import { ChordBoard } from "@/features/chord-board/components";
import { Fretboard, GuitarVoicingCard } from "@/features/fretboard/components";
import { KeySelector } from "@/features/key-selection/components/key-selector";

export function ScaleChordPageContent() {
  return (
    <>
      <KeySelector />
      <Card className="min-w-0 overflow-y-auto overflow-x-hidden">
        <ChordBoard layout="wrap" interactionMode="view" />
      </Card>
      <Card id="fretboard-section" className="min-w-0 overflow-hidden">
        <Fretboard />
      </Card>
      <GuitarVoicingCard />
    </>
  );
}
