"use client";

import { Card, PageTransition } from "@/components";
import { ChordGrid } from "@/features/chord-grid";
import { FretboardSection } from "@/features/fretboard/components/fretboard-section";
import { KeySelector } from "@/features/key-selection/components/key-selector";

export default function Home() {
  return (
    <PageTransition>
      <main className="container mx-auto grid gap-[var(--grid-gap)] overflow-x-hidden px-4 pt-24 pb-12 max-lg:gap-[var(--grid-gap-sm)]">
        <KeySelector />
        <Card className="min-w-0 overflow-hidden">
          <ChordGrid />
        </Card>
        <FretboardSection />
      </main>
    </PageTransition>
  );
}
