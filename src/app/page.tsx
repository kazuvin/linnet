import { Card, PageTransition } from "@/components";
import { ChordGrid } from "@/features/chord-grid";
import { Fretboard, GuitarVoicingCard } from "@/features/fretboard/components";
import { KeySelector } from "@/features/key-selection/components/key-selector";

export default function Home() {
  return (
    <PageTransition>
      <main className="container mx-auto grid gap-[var(--grid-gap)] overflow-x-hidden px-4 pt-24 pb-12 max-lg:gap-[var(--grid-gap-sm)]">
        <KeySelector />
        <Card className="min-w-0 overflow-hidden">
          <ChordGrid />
        </Card>
        <Card id="fretboard-section" className="min-w-0 overflow-hidden">
          <Fretboard />
        </Card>
        <GuitarVoicingCard />
      </main>
    </PageTransition>
  );
}
