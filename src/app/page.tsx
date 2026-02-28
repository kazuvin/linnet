import { Card } from "@/components";
import { ChordBoard } from "@/features/chord-board/components";
import { ChordGrid } from "@/features/chord-grid";
import { Fretboard } from "@/features/fretboard/components";
import { KeySelector } from "@/features/key-selection/components/key-selector";

export default function Home() {
  return (
    <main className="container mx-auto grid gap-[var(--grid-gap)] px-4 pt-24 pb-12 max-lg:gap-[var(--grid-gap-sm)]">
      <KeySelector />
      <div className="grid min-w-0 grid-cols-1 gap-[var(--grid-gap)] max-lg:gap-[var(--grid-gap-sm)] lg:grid-cols-[2fr_3fr]">
        <Card className="h-full overflow-y-auto">
          <ChordBoard layout="wrap" />
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <ChordGrid />
        </Card>
      </div>
      <Card>
        <Fretboard />
      </Card>
    </main>
  );
}
