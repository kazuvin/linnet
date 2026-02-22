import { DiatonicChordList } from "@/features/diatonic-chords/components/diatonic-chord-list";
import { KeySelector } from "@/features/key-selection/components/key-selector";

export default function Home() {
  return (
    <main className="container mx-auto flex flex-col gap-8 px-4 pt-24">
      <KeySelector />
      <DiatonicChordList />
    </main>
  );
}
