import { Card } from "@/components";
import { ChordBoard } from "@/features/chord-board/components";
import { ChordGrid } from "@/features/chord-grid";
import { Fretboard, GuitarVoicingCard } from "@/features/fretboard/components";
import { KeySelector } from "@/features/key-selection/components/key-selector";

export default function Home() {
  return (
    <main className="container mx-auto grid gap-[var(--grid-gap)] overflow-x-hidden px-4 pt-24 pb-12 max-lg:gap-[var(--grid-gap-sm)]">
      <KeySelector />
      <div className="grid min-w-0 grid-cols-1 gap-[var(--grid-gap)] max-lg:gap-[var(--grid-gap-sm)] lg:grid-cols-[2fr_3fr]">
        <Card className="h-full min-w-0 overflow-y-auto overflow-x-hidden">
          <ChordBoard layout="wrap" />
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <ChordGrid />
        </Card>
      </div>
      <Card className="min-w-0 overflow-hidden">
        <Fretboard />
      </Card>
      <GuitarVoicingCard />
    </main>
  );
}
